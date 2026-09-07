import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const allowedOrigins = new Set([
  "https://angel-ai1.netlify.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);
const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 12000;
const MAX_TOTAL_CHARS = 60000;

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://angel-ai1.netlify.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}
function json(req: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) }); }
function errorText(value: unknown) { return value instanceof Error ? value.message : String(value || "Unexpected error"); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { state: "invalid_request", error: "Method not allowed" }, 405);
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json(req, { state: "unauthorized", error: "Authentication required" }, 401);

    const payload = await req.json();
    const rawMessages = Array.isArray(payload?.messages) ? payload.messages : [];
    if (rawMessages.length > MAX_MESSAGES) return json(req, { state: "invalid_request", error: `Too many messages. Maximum is ${MAX_MESSAGES}.` }, 400);
    const chat: ChatMessage[] = rawMessages.filter((m: unknown) => {
      const x = m as Partial<ChatMessage>;
      return (x.role === "user" || x.role === "assistant" || x.role === "system") && typeof x.content === "string";
    }).map((m: ChatMessage) => ({ role: m.role, content: m.content.trim() })).filter(m => m.content.length > 0);
    if (!chat.some(m => m.role === "user")) return json(req, { state: "invalid_request", error: "A message is required" }, 400);
    if (chat.some(m => m.content.length > MAX_MESSAGE_CHARS)) return json(req, { state: "invalid_request", error: `A message is too long. Maximum is ${MAX_MESSAGE_CHARS} characters.` }, 400);
    if (chat.reduce((n, m) => n + m.content.length, 0) > MAX_TOTAL_CHARS) return json(req, { state: "invalid_request", error: "Conversation context is too large. Start a new conversation or shorten the request." }, 400);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return json(req, { state: "provider_not_configured", error: "Angel's reasoning engine is not configured yet." }, 503);
    }
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash";
    const systemInstruction = `You are Angel, an evolving AI companion. Be warm, thoughtful, clear and practical. You are not ChatGPT and should not claim capabilities you do not have. Protect privacy, never expose secrets, and distinguish certainty from uncertainty. For ordinary conversation, answer naturally and concisely. For complex requests, reason carefully and give useful, actionable structure. Do not invent tool results, web results, memories, files, or actions you did not actually perform.`;
    const contents = chat.filter(m => m.role !== "system").slice(-MAX_MESSAGES).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    let response: Response | null = null;
    let lastError = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ system_instruction: { parts: [{ text: systemInstruction }] }, contents, generationConfig: { maxOutputTokens: 1200, thinkingConfig: { thinkingLevel: "low" } } }),
          signal: controller.signal,
        });
      } catch (e) { lastError = e instanceof DOMException && e.name === "AbortError" ? "Gemini request timed out." : errorText(e); }
      finally { clearTimeout(timeout); }
      if (response && response.ok) break;
      if (response && ![408, 429, 500, 502, 503, 504].includes(response.status)) break;
      if (attempt === 0) await new Promise(r => setTimeout(r, 500));
    }
    if (!response) return json(req, { state: "provider_unavailable", error: lastError || "Angel could not reach her reasoning engine." }, 502);

    const raw = await response.text();
    if (!response.ok) {
      console.error("Gemini request failed", response.status, raw.slice(0, 2000));
      let providerMessage = "Angel could not reach her reasoning engine.";
      try { const parsed = JSON.parse(raw); if (parsed?.error?.message) providerMessage = `Angel's reasoning engine rejected the request: ${parsed.error.message}`; } catch (_) {}
      return json(req, { state: response.status === 429 ? "provider_rate_limited" : "provider_error", error: providerMessage, provider_status: response.status }, 502);
    }
    let data: any;
    try { data = JSON.parse(raw); } catch (_) { return json(req, { state: "provider_invalid_response", error: "Angel received an invalid response from her reasoning engine." }, 502); }
    const candidate = data?.candidates?.[0];
    const reply = candidate?.content?.parts?.map((part: { text?: string }) => part?.text || "").join("").trim();
    if (!reply) {
      const reason = candidate?.finishReason || data?.promptFeedback?.blockReason;
      return json(req, { state: "provider_empty_response", error: reason ? `Angel's reasoning engine returned no text (${reason}).` : "Angel received an empty response from her reasoning engine." }, 502);
    }
    return json(req, { reply, provider: "gemini", model });
  } catch (error) {
    console.error("angel-chat error", error);
    return json(req, { state: "internal_error", error: "Angel encountered an unexpected error. Please try again." }, 500);
  }
});
