import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ORIGINS = new Set(["https://angel-ai1.netlify.app","http://localhost:3000","http://127.0.0.1:3000"]);
const originHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(origin) ? origin : "https://angel-ai1.netlify.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};
const json = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...originHeaders(req), "Content-Type": "application/json" },
});
const env = (name: string) => Deno.env.get(name)?.trim() || "";
const key = (...names: string[]) => names.map(env).find(Boolean) || "";
const reqJson = async (url: string, init: RequestInit, ms = 45000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...init, signal: controller.signal });
    const text = await r.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return { ok: r.ok, status: r.status, data };
  } finally { clearTimeout(timer); }
};

type Step = { kind: string; tool?: string; args?: Record<string, unknown>; result?: unknown; message?: string };

const TOOL_DESCRIPTIONS = [
  { name: "create_task", description: "Create a persistent personal task/reminder.", args: "{title, description?, due_at?}" },
  { name: "save_memory", description: "Save a stable user preference or useful fact to Angel memory.", args: "{content, kind?, importance?}" },
  { name: "research_web", description: "Research current web information through Angel's research provider.", args: "{query, max_results?}" },
  { name: "x_search", description: "Search current public X posts, users, and discussions when the XAI provider is connected.", args: "{query, from_date?, to_date?}" },
  { name: "generate_image", description: "Generate an image from a prompt using the connected image provider.", args: "{prompt}" },
  { name: "generate_video", description: "Generate a short video from a text prompt using the connected video provider.", args: "{prompt, duration?, aspect_ratio?, resolution?}" },
  { name: "request_confirmation", description: "Create a user approval request before a risky real-world action.", args: "{action_name, action_input, risk_level?, reason}" },
];

async function planner(prompt: string, transcript: Step[]) {
  const system = `You are Angel's execution brain. Follow a plan-act-observe-repeat loop. Return JSON only. You may request one tool per turn.
Allowed output shapes:
{"type":"tool_call","tool":"create_task|save_memory|research_web|x_search|generate_image|generate_video|request_confirmation","args":{...},"message":"brief reason"}
OR {"type":"final","answer":"..."}
Never claim a tool ran until its result appears in the observations. Prefer direct action over long explanation. For risky actions such as sending, deleting, posting, spending, or changing external accounts, use request_confirmation instead of pretending the action happened.
Available tools: ${JSON.stringify(TOOL_DESCRIPTIONS)}
User task: ${prompt}
Observed steps so far: ${JSON.stringify(transcript).slice(0, 24000)}`;

  const xai = key("XAI_API_KEY");
  if (xai) {
    const model = env("XAI_AGENT_MODEL") || "grok-4.6";
    const r = await reqJson("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${xai}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.15, max_tokens: 1400 }),
    });
    if (r.ok) {
      const text = r.data?.choices?.[0]?.message?.content?.trim() || "";
      try { return { data: JSON.parse(text), provider: "xai", model }; } catch { return { data: { type: "final", answer: text }, provider: "xai", model }; }
    }
  }

  const openai = key("OPENAI_API_KEY");
  if (openai) {
    const model = env("OPENAI_AGENT_MODEL") || "gpt-5.6-sol";
    const r = await reqJson("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openai}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.15, max_tokens: 1400 }),
    });
    if (r.ok) {
      const text = r.data?.choices?.[0]?.message?.content?.trim() || "";
      try { return { data: JSON.parse(text), provider: "openai", model }; } catch { return { data: { type: "final", answer: text }, provider: "openai", model }; }
    }
  }

  const gemini = key("GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_API_KEY");
  if (gemini) {
    const model = env("ANGEL_AGENT_MODEL") || "gemini-3.6-flash";
    const r = await reqJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(gemini)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: system }] }], generationConfig: { temperature: 0.15, responseMimeType: "application/json" } }),
    });
    if (r.ok) {
      const text = r.data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("").trim() || "";
      try { return { data: JSON.parse(text), provider: "gemini", model }; } catch { return { data: { type: "final", answer: text }, provider: "gemini", model }; }
    }
  }

  throw new Error("No agent reasoning provider is configured.");
}

async function runTool(name: string, args: Record<string, unknown>, req: Request, userId: string) {
  const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: req.headers.get("Authorization")! } } });

  if (name === "create_task") {
    const title = String(args.title || "").trim();
    if (!title) throw new Error("Task title is required.");
    const row = { user_id: userId, title: title.slice(0, 300), description: String(args.description || "").slice(0, 4000) || null, due_at: args.due_at ? String(args.due_at) : null, source: "angel-agent" };
    const q = await supabase.from("agent_tasks").insert(row).select("id,title,description,due_at,status").single();
    if (q.error) throw new Error(q.error.message);
    return q.data;
  }

  if (name === "save_memory") {
    const content = String(args.content || "").trim();
    if (!content) throw new Error("Memory content is required.");
    const q = await supabase.from("memories").insert({ user_id: userId, kind: String(args.kind || "agent_memory").slice(0, 80), content: content.slice(0, 2000), importance: Math.min(5, Math.max(1, Number(args.importance) || 4)) }).select("id,kind,content,importance").single();
    if (q.error) throw new Error(q.error.message);
    return q.data;
  }

  if (name === "research_web") {
    const query = String(args.query || "").trim();
    if (!query) throw new Error("Research query is required.");
    const r = await fetch(`${env("SUPABASE_URL")}/functions/v1/angel-tools`, { method: "POST", headers: { Authorization: req.headers.get("Authorization")!, "apikey": env("SUPABASE_ANON_KEY"), "Content-Type": "application/json" }, body: JSON.stringify({ action: "research", query, max_results: Math.min(8, Math.max(1, Number(args.max_results) || 5)) }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.error || "Research failed.");
    return { answer: d.answer || "", results: d.results || [], provider: d.provider || null };
  }

  if (name === "x_search") {
    const xai = key("XAI_API_KEY");
    if (!xai) throw new Error("Live X search is not connected yet. Add XAI_API_KEY to the server secrets.");
    const query = String(args.query || "").trim();
    if (!query) throw new Error("X search query is required.");
    const body: any = { model: env("XAI_MODEL") || "grok-4.6", input: [{ role: "user", content: query }], tools: [{ type: "x_search" }] };
    const r = await reqJson("https://api.x.ai/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${xai}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }, 60000);
    if (!r.ok) throw new Error(r.data?.error?.message || `X search failed (${r.status}).`);
    const text = r.data?.output_text || r.data?.output?.map((x: any) => x?.content?.map((y: any) => y?.text || "").join("") || "").join("\n") || "";
    const urls = Array.isArray(r.data?.citations) ? r.data.citations : [];
    return { answer: text, citations: urls };
  }

  if (name === "generate_image") {
    const xai = key("XAI_API_KEY");
    const prompt = String(args.prompt || "").trim();
    if (!prompt) throw new Error("Image prompt is required.");
    if (xai) {
      const r = await reqJson("https://api.x.ai/v1/images/generations", { method: "POST", headers: { Authorization: `Bearer ${xai}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: env("XAI_IMAGE_MODEL") || "grok-imagine-image-2.0", prompt }) }, 60000);
      if (!r.ok) throw new Error(r.data?.error?.message || `Image generation failed (${r.status}).`);
      const image = r.data?.data?.[0] || {};
      return { provider: "xai", url: image.url || null, image_base64: image.b64_json || null };
    }
    const stability = key("STABILITY_API_KEY");
    if (stability) {
      const form = new FormData(); form.append("prompt", prompt); form.append("output_format", "png");
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
      try {
        const r = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", { method: "POST", headers: { Authorization: `Bearer ${stability}`, Accept: "image/*" }, body: form, signal: controller.signal });
        if (!r.ok) throw new Error(`Stability image generation failed (${r.status}).`);
        const bytes = new Uint8Array(await r.arrayBuffer()); let bin = ""; for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode(...bytes.subarray(i, i + 32768));
        return { provider: "stability", image_base64: btoa(bin), mime_type: r.headers.get("content-type") || "image/png" };
      } finally { clearTimeout(timer); }
    }
    throw new Error("No image generation provider is connected.");
  }

  if (name === "generate_video") {
    const xai = key("XAI_API_KEY");
    if (!xai) throw new Error("Video generation requires XAI_API_KEY.");
    const prompt = String(args.prompt || "").trim();
    if (!prompt) throw new Error("Video prompt is required.");
    const start = await reqJson("https://api.x.ai/v1/videos/generations", { method: "POST", headers: { Authorization: `Bearer ${xai}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: env("XAI_VIDEO_MODEL") || "grok-imagine-video-1.5", prompt, duration: Math.min(15, Math.max(1, Number(args.duration) || 5)), aspect_ratio: String(args.aspect_ratio || "16:9"), resolution: String(args.resolution || "720p") }) }, 30000);
    if (!start.ok) throw new Error(start.data?.error?.message || `Video request failed (${start.status}).`);
    const requestId = String(start.data?.request_id || "");
    if (!requestId) return start.data;
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const poll = await reqJson(`https://api.x.ai/v1/videos/${encodeURIComponent(requestId)}`, { headers: { Authorization: `Bearer ${xai}` } }, 20000);
      if (!poll.ok) continue;
      if (poll.data?.status === "done") return { provider: "xai", request_id: requestId, video: poll.data.video || null, progress: poll.data.progress ?? 100 };
    }
    return { provider: "xai", request_id: requestId, status: "processing", message: "Video generation is still running. Use the request id to poll again." };
  }

  if (name === "request_confirmation") {
    const actionName = String(args.action_name || "external_action").slice(0, 120);
    const reason = String(args.reason || "This action changes something outside Angel.").slice(0, 1000);
    const q = await supabase.from("agent_approvals").insert({ user_id: userId, action_name: actionName, action_input: args.action_input || {}, risk_level: String(args.risk_level || "high").toLowerCase() }).select("id,action_name,risk_level,status,created_at").single();
    if (q.error) throw new Error(q.error.message);
    return { ...q.data, reason, needs_user_decision: true };
  }

  throw new Error(`Unknown agent tool: ${name}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: originHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "POST required" }, 405);
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(req, { error: "Authentication required" }, 401);
  try {
    const body = await req.json().catch(() => ({}));
    const task = String(body?.task || body?.prompt || body?.message || "").trim();
    if (!task) return json(req, { error: "task is required" }, 400);
    if (task.length > 20000) return json(req, { error: "Task exceeds 20000 characters" }, 413);

    const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: auth } } });
    const user = await supabase.auth.getUser();
    if (user.error || !user.data.user) return json(req, { error: "Invalid session" }, 401);
    const userId = user.data.user.id;

    const run = await supabase.from("agent_runs").insert({ user_id: userId, task, status: "running" }).select("id").single();
    if (run.error) return json(req, { error: run.error.message }, 500);
    const runId = run.data.id;
    const steps: Step[] = [];
    const maxSteps = Math.min(8, Math.max(1, Number(body?.max_steps) || 6));
    let provider = "unknown";
    let model = "unknown";
    let finalAnswer = "";
    let status = "completed";

    try {
      for (let i = 0; i < maxSteps; i++) {
        const plan = await planner(task, steps);
        provider = plan.provider; model = plan.model;
        const action = plan.data || {};
        if (action.type === "final") { finalAnswer = String(action.answer || "").trim() || "Task completed."; break; }
        if (action.type !== "tool_call") throw new Error("Agent returned an invalid action.");
        const tool = String(action.tool || "");
        const args = (action.args && typeof action.args === "object") ? action.args as Record<string, unknown> : {};
        const step: Step = { kind: "tool", tool, args, message: String(action.message || "") };
        try { step.result = await runTool(tool, args, req, userId); steps.push(step); }
        catch (error) { step.result = { error: error instanceof Error ? error.message : "Tool failed" }; steps.push(step); }
      }
      if (!finalAnswer) finalAnswer = steps.length ? "I completed the executable parts of the task and recorded the remaining observations." : "I could not start the task with the available tools.";
      if (steps.some((s) => s.tool === "request_confirmation")) status = "needs_approval";
      await supabase.from("agent_runs").update({ status, provider, model, steps, result: { answer: finalAnswer }, finished_at: new Date().toISOString() }).eq("id", runId).eq("user_id", userId);
      return json(req, { answer: finalAnswer, run_id: runId, provider, model, steps, status, agent_loop: true });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Agent failed";
      await supabase.from("agent_runs").update({ status: "failed", provider, model, steps, result: { error: detail }, finished_at: new Date().toISOString() }).eq("id", runId).eq("user_id", userId);
      return json(req, { error: "Agent execution failed", detail, run_id: runId, steps }, 502);
    }
  } catch (error) {
    return json(req, { error: error instanceof Error ? error.message : "Unexpected agent error" }, 500);
  }
});
