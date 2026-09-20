import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY = "sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const base = `${SUPABASE_URL}/functions/v1/`;

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

let session = null;
let profile = null;
let conversationId = null;
let history = [];
let sending = false;
let researchMode = false;
let recording = false;
let recorder = null;
let stream = null;
let lastUserPrompt = "";

const state = {
  voiceStyle: localStorage.getItem("angel.voiceStyle") || "warm",
  density: localStorage.getItem("angel.density") || "comfortable",
  motion: localStorage.getItem("angel.motion") || "full"
};

function username(user = session?.user) {
  return profile?.display_name
    || profile?.username
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Angel user";
}

function initials(user = session?.user) {
  const value = username(user).trim();
  return (value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2) || "A").toUpperCase();
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2400);
}

function setActivity(text, visible = true, done = false) {
  const node = $("#activity");
  if (!node) return;
  node.textContent = "";
  node.classList.toggle("hidden", !visible);
  node.dataset.state = done ? "done" : "active";
  if (!visible) return;
  const trace = document.createElement("span");
  trace.className = "activityTrace";
  const label = document.createElement("span");
  label.textContent = text;
  node.append(trace, label);
}

async function auth() {
  const result = await supabase.auth.getSession();
  session = result.data.session || null;
  profile = null;
  if (session) {
    const q = await supabase
      .from("profiles")
      .select("username,display_name,avatar_url")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!q.error) profile = q.data || null;
  }
  const footer = $("#footerStatus");
  if (footer) {
    footer.textContent = session
      ? "Private conversation · synced to your account"
      : "Sign in to keep conversations across devices";
  }
  document.dispatchEvent(new CustomEvent("angel-auth-changed", {
    detail: { signedIn: !!session, user: session?.user || null, profile }
  }));
  return session;
}

async function call(path, body) {
  if (!session) throw new Error("Please sign in to use Angel.");
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.join(" · ") : data.detail;
    throw new Error(data.error || detail || `Request failed (${response.status})`);
  }
  return data;
}

function ensureShellChat() {
  if (!document.body.classList.contains("a5")) return null;
  if (!document.body.classList.contains("a5-chat")) window.AngelShell?.showScreen?.("chat");
  let streamHost = $("#a5-chatstream");
  if (!streamHost) {
    const page = $("#page");
    if (!page) return null;
    page.innerHTML = '<section class="a5-chatpage"><div id="a5-chatstream" class="a5-chatstream"></div></section>';
    streamHost = $("#a5-chatstream");
  }
  return streamHost;
}

function renderSources(host, sources) {
  if (!sources?.length) return;
  const box = document.createElement("div");
  box.className = "a5-sources";
  box.innerHTML =
    `<div class="a5-sources-title">Sources · ${sources.length}</div>` +
    `<div class="a5-source-grid">${sources.slice(0, 8).map((source, index) =>
      `<a class="a5-source" target="_blank" rel="noopener" href="${esc(source.url || source.link || "#")}">
        <strong>${index + 1}. ${esc(source.title || "Source")}</strong>
        <span>${esc(source.url || source.link || source.snippet || "")}</span>
      </a>`
    ).join("")}</div>`;
  host.appendChild(box);
}

function addShellMessage(role, text, sources = [], provider = "") {
  const host = ensureShellChat();
  if (!host) return null;

  const wrap = document.createElement("article");
  wrap.className = `a5-message ${role}`;

  const meta = document.createElement("div");
  meta.className = "a5-message-meta";
  meta.textContent = role === "user" ? username().toUpperCase() : "ANGEL";

  const body = document.createElement("div");
  body.className = "a5-message-body";

  const textNode = document.createElement("div");
  textNode.className = "a5-message-text";
  textNode.textContent = text;
  body.appendChild(textNode);

  if (role === "assistant") {
    const actions = document.createElement("div");
    actions.className = "a5-message-actions";
    actions.innerHTML = `
      <button type="button" data-action="copy">Copy</button>
      <button type="button" data-action="listen">Listen</button>
      <button type="button" data-action="regenerate">Regenerate</button>
    `;
    actions.querySelector('[data-action="copy"]').onclick = async () => {
      await navigator.clipboard?.writeText(text);
      toast("Copied");
    };
    actions.querySelector('[data-action="listen"]').onclick = () => speak(text);
    actions.querySelector('[data-action="regenerate"]').onclick = () => {
      if (!lastUserPrompt) return;
      const input = $("#message");
      if (input) {
        input.value = lastUserPrompt;
        autoGrow();
        send();
      }
    };
    body.appendChild(actions);
    if (provider) {
      const route = document.createElement("div");
      route.className = "a5-message-route";
      route.textContent = `Routed through ${provider}`;
      body.appendChild(route);
    }
  }

  if (sources?.length) renderSources(body, sources);
  wrap.append(meta, body);
  host.appendChild(wrap);
  requestAnimationFrame(() => wrap.scrollIntoView({ behavior: "smooth", block: "end" }));
  return wrap;
}

function addMessage(role, text, sources = [], provider = "") {
  if (document.body.classList.contains("a5")) return addShellMessage(role, text, sources, provider);

  const page = $("#page");
  if (!page) return null;
  let messages = $("#messages");
  if (!messages) {
    page.innerHTML = '<div id="messages" class="messages"></div>';
    messages = $("#messages");
  }
  const wrap = document.createElement("article");
  wrap.className = `msg ${role}`;
  wrap.innerHTML = `<div class="msgRole">${role === "user" ? "YOU" : "ANGEL"}</div><div class="msgBody"><p class="msgText"></p></div>`;
  wrap.querySelector(".msgText").textContent = text;
  messages.appendChild(wrap);
  return wrap;
}

function activityFor(plan, research) {
  if (research) return "Preparing research";
  if (plan?.type === "coding") return "Planning the build";
  if (plan?.type === "document_analysis") return "Reading the material";
  if (plan?.type === "vision") return "Understanding the image";
  if (plan?.type === "image_generation") return "Preparing the creative engine";
  if (plan?.type === "agent_workflow") return "Planning the work";
  return "Thinking";
}

async function send() {
  const input = $("#message");
  const text = input?.value?.trim();
  if (!text || sending) return;

  if (!session) {
    openModal();
    return;
  }

  input.value = "";
  autoGrow();
  lastUserPrompt = text;
  sending = true;

  ensureShellChat();
  addMessage("user", text);
  history.push({ role: "user", content: text });
  setActivity("Preparing", true);

  let thinking = null;
  try {
    const plan = await call(`${base}angel-orchestrator`, {
      task: text,
      mode: researchMode ? "research" : "auto"
    });

    setActivity(activityFor(plan, researchMode || plan.research_required), true);

    const sources = [];
    const context = [];

    if (researchMode || plan.research_required) {
      setActivity("Searching for useful sources", true);
      const research = await call(`${base}angel-tools`, {
        action: "research",
        query: text,
        max_results: 8
      });
      if (research.answer) {
        context.push({
          role: "system",
          content: "Deep research report:\n" + research.answer
        });
      }
      for (const item of research.results || []) sources.push(item);
      if (sources.length) {
        setActivity(`Reading ${sources.length} sources`, true);
        context.push({
          role: "system",
          content:
            "Retrieved web research. Use it when relevant. Do not invent citations.\n" +
            sources.map((source, index) =>
              `[${index + 1}] ${source.title || "Source"}\n${source.url || source.link || ""}\n${source.snippet || source.description || ""}`
            ).join("\n\n")
        });
      } else {
        toast("Research returned no sources, continuing normally.");
      }
    }

    setActivity("Routing intelligence", true);
    thinking = addMessage("assistant", "Working…");

    const reply = await call(`${base}angel-chat`, {
      messages: [...context, ...history.slice(-20)],
      mode: plan?.type || "auto",
      research: !!(researchMode || plan.research_required),
      conversation_id: conversationId || undefined
    });

    thinking?.remove();
    addMessage(
      "assistant",
      reply.reply || "I’m ready.",
      sources,
      `${reply.provider || "auto"}${reply.model ? ` · ${reply.model}` : ""}`
    );
    history.push({ role: "assistant", content: reply.reply || "" });
    conversationId = reply.conversation_id || conversationId;
    document.dispatchEvent(new CustomEvent("angel-conversation-changed", {
      detail: { conversationId, title: text.slice(0, 80) }
    }));

    setActivity("Complete", true, true);
    setTimeout(() => setActivity("", false), 900);
  } catch (error) {
    thinking?.remove();
    addMessage("assistant", error?.message || "Angel could not complete that request.");
    setActivity("Needs attention", true, true);
    setTimeout(() => setActivity("", false), 1800);
  } finally {
    sending = false;
  }
}

async function speak(text) {
  if (!session) {
    openModal();
    return;
  }
  try {
    toast("Preparing voice");
    const result = await call(`${base}angel-tools`, {
      action: "speak",
      text,
      voice: state.voiceStyle === "calm" ? "autumn" : "hannah"
    });
    if (!result.audio_base64) throw new Error("Voice output was empty.");

    const binary = atob(result.audio_base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const audio = new Audio(
      URL.createObjectURL(
        new Blob([bytes], { type: result.mime_type || "audio/wav" })
      )
    );
    await audio.play();
  } catch (error) {
    toast(error?.message || "Voice is unavailable.");
  }
}

async function toggleMic() {
  if (!session) {
    openModal();
    return;
  }

  if (recording) {
    recorder?.stop();
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
      recording = false;
      $("#micBtn")?.classList.remove("active");
      $("#voicePanel")?.classList.remove("open");
      stream?.getTracks().forEach((track) => track.stop());

      setActivity("Transcribing", true);
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const result = await call(`${base}angel-tools`, {
              action: "transcribe",
              audio_base64: reader.result,
              mime_type: blob.type
            });
            const input = $("#message");
            if (input) {
              input.value = result.text || "";
              autoGrow();
            }
            setActivity("Voice captured", true, true);
            setTimeout(() => setActivity("", false), 800);
          } catch (error) {
            toast(error?.message || "Transcription failed.");
            setActivity("", false);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        toast(error?.message || "Could not process the recording.");
        setActivity("", false);
      }
    };

    recorder.start();
    recording = true;
    $("#micBtn")?.classList.add("active");
    $("#voicePanel")?.classList.add("open");
    setActivity("Listening", true);
  } catch {
    toast("Microphone access is unavailable.");
  }
}

async function uploadFile(file) {
  if (!file) return;
  if (!session) {
    openModal();
    return;
  }

  ensureShellChat();
  addMessage("user", `Attached · ${file.name}`);
  setActivity(`Reading ${file.name}`, true);

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = String(reader.result).split(",")[1] || "";
      if (file.type.startsWith("image/")) {
        const result = await call(`${base}angel-vision`, {
          image_base64: data,
          mime_type: file.type,
          prompt: "Analyze this image carefully. Describe useful visible details, read text when possible, and explain anything relevant to the user."
        });
        addMessage("assistant", result.reply || result.answer || "Image analyzed.");
      } else {
        const result = await call(`${base}angel-documents`, {
          action: "analyze",
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          data_base64: data,
          prompt: "Analyze this document and give the user the important information clearly."
        });
        addMessage("assistant", result.answer || result.reply || result.text || "Document analyzed.");
      }
      setActivity("Complete", true, true);
      setTimeout(() => setActivity("", false), 800);
    } catch (error) {
      addMessage("assistant", error?.message || "The file could not be analyzed.");
      setActivity("File analysis failed", true, true);
    }
  };
  reader.readAsDataURL(file);
}

async function loadConversation(id) {
  if (!session || !id) return;
  const result = await supabase
    .from("messages")
    .select("role,content,created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (result.error) {
    toast(result.error.message);
    return;
  }

  conversationId = id;
  history = (result.data || []).map((item) => ({
    role: item.role,
    content: item.content
  }));

  window.AngelShell?.showScreen?.("chat");
  const host = ensureShellChat();
  if (!host) return;
  host.innerHTML = "";
  for (const item of result.data || []) {
    addMessage(item.role === "assistant" ? "assistant" : "user", item.content);
  }
  toast("Conversation restored");
}

function newChat() {
  conversationId = null;
  history = [];
  lastUserPrompt = "";
  window.AngelShell?.showScreen?.("chat");
  const host = ensureShellChat();
  if (host) host.innerHTML = "";
  toast("New chat");
}

function toggleResearch() {
  researchMode = !researchMode;
  $("#researchBtn")?.classList.toggle("active", researchMode);
  const stateNode = $("#toolState");
  if (stateNode) stateNode.textContent = `Voice ready · Research ${researchMode ? "on" : "off"} · Files ready`;
  document.querySelectorAll("[data-shell-research]").forEach((node) => {
    node.classList.toggle("active", researchMode);
  });
  toast(researchMode ? "Research mode on" : "Research mode off");
}

function autoGrow() {
  const input = $("#message");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 170) + "px";
}

function openModal() {
  $("#modalBackdrop")?.classList.add("open");
}

function closeModal() {
  $("#modalBackdrop")?.classList.remove("open");
}

async function signIn() {
  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/" }
  });
  if (result.error && $("#authStatus")) $("#authStatus").textContent = result.error.message;
}

async function signOut() {
  await supabase.auth.signOut();
  session = null;
  profile = null;
  conversationId = null;
  history = [];
  closeModal();
  await auth();
  window.AngelShell?.showScreen?.("home");
  toast("Signed out");
}

window.AngelCore = {
  supabase,
  base,
  send,
  speak,
  toggleMic,
  uploadFile,
  signIn,
  signOut,
  newChat,
  loadConversation,
  toggleResearch,
  openModal,
  closeModal,
  getSession: () => session,
  getUser: () => session?.user || null,
  getProfile: () => profile,
  getDisplayName: () => username(),
  getInitials: () => initials()
};

$("#sendBtn")?.addEventListener("click", send);
$("#message")?.addEventListener("input", autoGrow);
$("#message")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});
$("#micBtn")?.addEventListener("click", toggleMic);
$("#researchBtn")?.addEventListener("click", toggleResearch);
$("#uploadBtn")?.addEventListener("click", () => $("#fileInput")?.click());
$("#fileInput")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) uploadFile(file);
  event.target.value = "";
});
$("#googleBtn")?.addEventListener("click", signIn);
$("#closeModal")?.addEventListener("click", closeModal);
$("#modalBackdrop")?.addEventListener("click", (event) => {
  if (event.target?.id === "modalBackdrop") closeModal();
});
$("#voiceClose")?.addEventListener("click", () => {
  if (recorder && recording) recorder.stop();
  $("#voicePanel")?.classList.remove("open");
});
$("#voiceStop")?.addEventListener("click", () => recorder?.stop());

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#message")?.focus();
  }
  if (event.key === "Escape") closeModal();
});

supabase.auth.onAuthStateChange(() => {
  auth().catch(() => {});
});

document.body.dataset.density = state.density;
document.body.dataset.motion = state.motion;

auth().catch((error) => {
  console.error("Angel auth", error);
  document.dispatchEvent(new CustomEvent("angel-auth-changed", {
    detail: { signedIn: false, user: null, profile: null }
  }));
});
