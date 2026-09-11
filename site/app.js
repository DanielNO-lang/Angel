import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY = "sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const base = `${SUPABASE_URL}/functions/v1/`;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const meta = (u) => u?.user_metadata || {};

let session = null;
let profile = null;
let conversationId = null;
let history = [];
let sending = false;
let researchMode = false;
let recording = false;
let recorder = null;
let stream = null;
let currentPage = "angel";
let lastUserPrompt = "";

const state = { voiceStyle: localStorage.getItem("angel.voiceStyle") || "warm", density: localStorage.getItem("angel.density") || "comfortable" };

function username(u) {
  return profile?.username || meta(u).user_name || meta(u).preferred_username || meta(u).full_name || meta(u).name || u?.email?.split("@")[0] || "Angel user";
}
function initials(u) {
  const n = username(u).trim();
  return (n.split(/\s+/).map(x => x[0]).join("").slice(0, 2) || "A").toUpperCase();
}
function toast(text) {
  const t = $("#toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2300);
}
function setActivity(text, visible = true, done = false) {
  const a = $("#activity");
  a.textContent = "";
  a.classList.toggle("hidden", !visible);
  a.dataset.state = done ? "done" : "active";
  if (visible) {
    const trace = document.createElement("span"); trace.className = "activityTrace";
    const label = document.createElement("span"); label.textContent = text;
    a.append(trace, label);
  }
}
function account(u) {
  const signed = !!u;
  $("#sideAuthText").textContent = signed ? "Sign out" : "Sign in";
  $("#authBtn").textContent = signed ? "Account" : "Sign in";
  $("#footerStatus").textContent = signed ? "Private conversation · synced to your account" : "Sign in to keep conversations across devices";
  $("#sideUser").innerHTML = signed ? `<div class="avatar">${esc(initials(u))}</div><div class="accountText"><strong>${esc(username(u))}</strong><span>${esc(u.email || "")}</span></div>` : `<div class="avatar">A</div><div class="accountText"><strong>Guest mode</strong><span>Sign in to save conversations</span></div>`;
}
async function auth() {
  const { data } = await supabase.auth.getSession();
  session = data.session || null;
  profile = null;
  if (session) {
    const r = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    profile = r.data || null;
  }
  account(session?.user || null);
  return session;
}
async function call(path, body) {
  if (!session) throw Error("Please sign in to use Angel.");
  const r = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify(body)
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detail = Array.isArray(d.detail) ? d.detail.join(" · ") : d.detail;
    throw Error(d.error || detail || `Request failed (${r.status})`);
  }
  return d;
}
function welcome() {
  currentPage = "angel";
  document.querySelectorAll(".navBtn").forEach(x => x.classList.remove("active"));
  $("#angelNav").classList.add("active");
  $("#page").innerHTML = `<section class="welcome">
    <div class="welcomeKicker">Private intelligence · ${session ? "ready" : "guest"}</div>
    <h1>Make something <em>worth keeping.</em></h1>
    <p>Angel is a private workspace for thinking, research, voice, files and action. Ask naturally. Angel decides which capability belongs behind the answer.</p>
    <div class="capGrid">
      <button class="capCard" data-prompt="Research this topic deeply and give me the important findings with sources."><div class="capIcon">01</div><b>Research deeply</b><small>Trace sources, compare evidence and surface the useful signal.</small></button>
      <button class="capCard" data-prompt="Help me turn an idea into a practical plan I can actually execute."><div class="capIcon">02</div><b>Build an idea</b><small>Move from a rough thought to a clear, workable plan.</small></button>
      <button class="capCard" data-prompt="Think through this problem with me carefully and challenge weak assumptions."><div class="capIcon">03</div><b>Think with me</b><small>Reason carefully instead of just producing more words.</small></button>
    </div>
  </section>`;
  document.querySelectorAll("[data-prompt]").forEach(b => b.onclick = () => { $("#message").value = b.dataset.prompt; autoGrow(); send(); });
  setActivity("", false);
}
function ensureMessages() {
  if (!$("#messages")) $("#page").innerHTML = `<div id="messages" class="messages"></div>`;
  return $("#messages");
}
function addMessage(role, text, sources = [], provider = "") {
  const wrap = document.createElement("article");
  wrap.className = `msg ${role}`;
  const roleEl = document.createElement("div");
  roleEl.className = "msgRole";
  roleEl.textContent = role === "user" ? "YOU" : "ANGEL";
  const body = document.createElement("div");
  body.className = "msgBody";
  const p = document.createElement("p");
  p.className = "msgText";
  p.textContent = text;
  body.appendChild(p);
  if (role === "assistant") {
    const actions = document.createElement("div");
    actions.className = "msgActions";
    actions.innerHTML = `<button class="mini copy">Copy</button><button class="mini speak">Listen</button><button class="mini regen">Regenerate</button>`;
    actions.querySelector(".copy").onclick = async () => { await navigator.clipboard?.writeText(text); toast("Copied"); };
    actions.querySelector(".speak").onclick = () => speak(text);
    actions.querySelector(".regen").onclick = () => { if (lastUserPrompt) { $("#message").value = lastUserPrompt; autoGrow(); send(); } };
    body.appendChild(actions);
    if (provider) {
      const detail = document.createElement("div");
      detail.style.cssText = "font-size:9px;color:#555955;margin-top:9px";
      detail.textContent = `Angel used ${provider}`;
      body.appendChild(detail);
    }
  }
  if (sources?.length) {
    const box = document.createElement("div"); box.className = "sources";
    box.innerHTML = `<div class="sourcesTitle">Sources · ${sources.length}</div><div class="sourceGrid">${sources.slice(0, 8).map((s, i) => `<a class="source" target="_blank" rel="noopener" href="${esc(s.url || s.link || "#")}"><strong>${i + 1}. ${esc(s.title || "Source")}</strong><span>${esc(s.url || s.link || s.snippet || "")}</span></a>`).join("")}</div>`;
    body.appendChild(box);
  }
  wrap.append(roleEl, body);
  ensureMessages().appendChild(wrap);
  requestAnimationFrame(() => wrap.scrollIntoView({ behavior: "smooth", block: "end" }));
  return wrap;
}
function activityFor(plan, research) {
  if (research) return "Preparing research";
  if (plan?.type === "coding") return "Planning the build";
  if (plan?.type === "document_analysis") return "Reading the material";
  if (plan?.type === "vision") return "Understanding the image";
  return "Thinking";
}
async function send() {
  if (sending || !$("#message").value.trim()) return;
  if (!session) { openModal("auth"); return; }
  const text = $("#message").value.trim();
  $("#message").value = ""; autoGrow();
  lastUserPrompt = text;
  sending = true;
  addMessage("user", text);
  history.push({ role: "user", content: text });
  setActivity("Preparing", true);
  let thinking = null;
  try {
    const plan = await call(`${base}angel-orchestrator`, { task: text, mode: researchMode ? "research" : "auto" });
    setActivity(activityFor(plan, researchMode || plan.research_required), true);
    let sources = [];
    const context = [];
    if (researchMode || plan.research_required) {
      setActivity("Searching for useful sources", true);
      const research = await call(`${base}angel-tools`, { action: "research", query: text, max_results: 8 });
      sources = research.results || [];
      if (sources.length) {
        setActivity(`Reading ${sources.length} sources`, true);
        context.push({ role: "system", content: "Retrieved web research. Use it when relevant. Do not invent citations.\n" + sources.map((s, i) => `[${i + 1}] ${s.title || "Source"}\n${s.url || s.link || ""}\n${s.snippet || s.description || ""}`).join("\n\n") });
      } else {
        toast("Research returned no sources, continuing normally");
      }
    }
    setActivity("Reasoning", true);
    thinking = addMessage("assistant", "Working…");
    const reply = await call(`${base}angel-chat`, { messages: [...context, ...history.slice(-20)] });
    thinking.remove();
    addMessage("assistant", reply.reply || "I’m ready.", sources, `${reply.provider || "auto"}${reply.model ? ` · ${reply.model}` : ""}`);
    history.push({ role: "assistant", content: reply.reply || "" });
    conversationId = reply.conversation_id || conversationId;
    setActivity("Complete", true, true);
    setTimeout(() => setActivity("", false), 900);
  } catch (e) {
    thinking?.remove();
    addMessage("assistant", e.message || "Angel could not complete that request.");
    setActivity("Needs attention", true, true);
    setTimeout(() => setActivity("", false), 1800);
  } finally {
    sending = false;
  }
}
async function speak(text) {
  if (!session) return openModal("auth");
  try {
    toast("Preparing voice");
    const d = await call(`${base}angel-tools`, { action: "speak", text, voice: state.voiceStyle === "calm" ? "autumn" : "hannah" });
    if (!d.audio_base64) throw Error("Voice output was empty.");
    const b = atob(d.audio_base64), a = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    const au = new Audio(URL.createObjectURL(new Blob([a], { type: d.mime_type || "audio/wav" })));
    await au.play();
  } catch (e) { toast(e.message || "Voice is unavailable"); }
}
async function toggleMic() {
  if (!session) return openModal("auth");
  if (recording) { recorder?.stop(); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = async () => {
      recording = false;
      $("#micBtn").classList.remove("active");
      $("#voicePanel").classList.remove("open");
      stream?.getTracks().forEach(t => t.stop());
      setActivity("Transcribing", true);
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const d = await call(`${base}angel-tools`, { action: "transcribe", audio_base64: reader.result, mime_type: blob.type });
            $("#message").value = d.text || ""; autoGrow();
            setActivity("Voice captured", true, true);
            setTimeout(() => setActivity("", false), 800);
            if (d.text) send();
          } catch (e) { toast(e.message || "Transcription failed"); setActivity("", false); }
        };
        reader.readAsDataURL(blob);
      } catch (e) { toast(e.message); setActivity("", false); }
    };
    recorder.start(); recording = true;
    $("#micBtn").classList.add("active"); $("#voicePanel").classList.add("open");
    setActivity("Listening", true);
  } catch { toast("Microphone access is unavailable"); }
}
async function uploadFile(file) {
  if (!session) return openModal("auth");
  addMessage("user", `Attached · ${file.name}`);
  setActivity(`Reading ${file.name}`, true);
  try {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = String(reader.result).split(",")[1] || "";
        if (file.type.startsWith("image/")) {
          const r = await call(`${base}angel-vision`, { image_base64: data, mime_type: file.type, prompt: "Analyze this image carefully. Describe useful visible details, read text when possible, and explain anything relevant to the user." });
          addMessage("assistant", r.reply || r.answer || "Image analyzed.");
        } else {
          const r = await call(`${base}angel-documents`, { action: "analyze", file_name: file.name, mime_type: file.type || "application/octet-stream", data_base64: data, prompt: "Analyze this document and give the user the important information clearly." });
          addMessage("assistant", r.answer || r.reply || r.text || "Document analyzed.");
        }
        setActivity("Complete", true, true); setTimeout(() => setActivity("", false), 800);
      } catch (e) { addMessage("assistant", e.message || "The file could not be analyzed."); setActivity("File analysis failed", true, true); }
    };
    reader.readAsDataURL(file);
  } catch (e) { addMessage("assistant", e.message); }
}
async function showHistory() {
  currentPage = "history"; markNav("historyNav");
  if (!session) return openModal("auth");
  setActivity("", false);
  const r = await supabase.from("conversations").select("id,title,updated_at").eq("user_id", session.user.id).order("updated_at", { ascending: false }).limit(50);
  const items = r.data || [];
  $("#page").innerHTML = `<h1 class="pageTitle">History</h1><div class="list">${items.length ? items.map(x => `<button class="listItem" data-id="${esc(x.id)}"><span><b>${esc(x.title || "Conversation")}</b></span><small>${new Date(x.updated_at).toLocaleString()}</small></button>`).join("") : `<div class="feature"><h3>No conversations yet</h3><p>Your private conversations will appear here.</p></div>`}</div>`;
  document.querySelectorAll(".listItem[data-id]").forEach(b => b.onclick = () => loadConversation(b.dataset.id));
}
async function loadConversation(id) {
  const c = await supabase.from("conversations").select("id,title,updated_at").eq("id", id).eq("user_id", session.user.id).maybeSingle();
  if (!c.data) return toast("Conversation unavailable");
  const m = await supabase.from("messages").select("role,content,created_at,metadata").eq("conversation_id", id).order("created_at", { ascending: true }).limit(100);
  conversationId = id; history = (m.data || []).map(x => ({ role: x.role, content: x.content }));
  $("#page").innerHTML = `<div id="messages" class="messages"></div>`;
  (m.data || []).forEach(x => addMessage(x.role, x.content, [], x.metadata?.provider ? `${x.metadata.provider}${x.metadata.model ? ` · ${x.metadata.model}` : ""}` : ""));
  markNav("angelNav"); currentPage = "angel";
}
function markNav(id) { document.querySelectorAll(".navBtn").forEach(x => x.classList.remove("active")); $("#${id}")?.classList.add("active"); }
function showExplore() {
  currentPage = "explore"; markNav("exploreNav"); setActivity("", false);
  $("#page").innerHTML = `<h1 class="pageTitle">Explore Angel</h1><div class="exploreGrid">
    <div class="feature"><h3>Deep research</h3><p>Angel can search, collect sources and ground an answer in retrieved evidence. The next research generation will add planning, source graphs and richer reports.</p></div>
    <div class="feature"><h3>Voice</h3><p>Speak naturally, transcribe with a dedicated speech model and listen to responses. Live duplex voice is a future capability.</p></div>
    <div class="feature"><h3>Vision</h3><p>Drop in an image and Angel can inspect visible details, text and context using multimodal reasoning.</p></div>
    <div class="feature"><h3>Documents</h3><p>Upload supported files for analysis. Future versions will turn documents into persistent project knowledge.</p></div>
    <div class="feature"><h3>Memory</h3><p>Angel has a private memory layer. Future versions will make memory controls more transparent and project-aware.</p></div>
    <div class="feature"><h3>Agents</h3><p>Angel's orchestration layer is designed to grow into long-running plans, tools, approvals, connectors and specialist subagents.</p></div>
    <div class="feature"><h3>Creative studio</h3><p>Future provider plugins can bring image, video, audio, music and presentation creation into one workspace.</p></div>
    <div class="feature"><h3>Ambient Angel</h3><p>Long-term direction: proactive briefs, wearables, screen awareness and permissioned assistance that can move beyond the chat window.</p></div>
  </div>`;
}
function showProjects() {
  currentPage = "projects"; markNav("projectsNav"); setActivity("", false);
  $("#page").innerHTML = `<h1 class="pageTitle">Projects</h1><div class="feature"><h3>The workspace layer is next</h3><p>Projects will become persistent containers for conversations, files, instructions, memories, tools and long-running work. The architecture is intentionally being kept provider-agnostic.</p></div>`;
}
function showSettings() {
  currentPage = "settings"; markNav("settingsNav"); setActivity("", false);
  $("#page").innerHTML = `<h1 class="pageTitle">Settings</h1><div class="modal" style="position:relative;width:100%;max-height:none;box-shadow:none;background:rgba(255,255,255,.02);padding:4px 18px;border:1px solid var(--line)">
    <div class="setting"><label>Voice character</label><p>Choose the general character Angel uses for spoken replies.</p><select class="select" id="voiceStyle"><option value="warm">Warm</option><option value="calm">Calm</option></select></div>
    <div class="setting"><label>Conversation density</label><p>Controls the visual breathing room of the conversation surface.</p><select class="select" id="density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></div>
    <div class="setting"><label>Model routing</label><p>Automatic routing is enabled. Angel assigns providers by capability, then falls back when a provider is unavailable. Provider selection is intentionally hidden from normal chat.</p></div>
    <div class="setting"><label>Privacy principle</label><p>Your provider credentials stay server-side. Connected actions and future external tools will require explicit permission before consequential operations.</p></div>
  </div>`;
  $("#voiceStyle").value = state.voiceStyle; $("#density").value = state.density;
  $("#voiceStyle").onchange = e => { state.voiceStyle = e.target.value; localStorage.setItem("angel.voiceStyle", state.voiceStyle); toast("Voice preference saved"); };
  $("#density").onchange = e => { state.density = e.target.value; localStorage.setItem("angel.density", state.density); document.body.dataset.density = state.density; toast("Display preference saved"); };
}
function openModal(type) {
  $("#modalBackdrop").classList.add("open");
  $("#authView").style.display = type === "auth" ? "block" : "none";
}
function closeModal() { $("#modalBackdrop").classList.remove("open"); }
async function signIn() {
  if (session) { await supabase.auth.signOut(); session = null; profile = null; account(null); closeModal(); welcome(); toast("Signed out"); return; }
  $("#authStatus").textContent = "Opening secure Google sign-in…";
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } });
  if (error) $("#authStatus").textContent = error.message;
}
function autoGrow() { const el = $("#message"); el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 170)}px`; }
function wire() {
  $("#sendBtn").onclick = send;
  $("#micBtn").onclick = toggleMic;
  $("#researchBtn").onclick = () => { researchMode = !researchMode; $("#researchBtn").classList.toggle("active", researchMode); $("#toolState").textContent = `Voice ready · Research ${researchMode ? "on" : "off"} · Files ready`; };
  $("#uploadBtn").onclick = () => $("#fileInput").click();
  $("#fileInput").onchange = e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; };
  $("#message").addEventListener("input", autoGrow);
  $("#message").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  $("#newChat").onclick = () => { conversationId = null; history = []; lastUserPrompt = ""; welcome(); };
  $("#angelNav").onclick = welcome;
  $("#historyNav").onclick = showHistory;
  $("#exploreNav").onclick = showExplore;
  $("#projectsNav").onclick = showProjects;
  $("#settingsNav").onclick = showSettings;
  $("#authBtn").onclick = () => session ? openModal("auth") : openModal("auth");
  $("#sideAuth").onclick = signIn;
  $("#googleBtn").onclick = signIn;
  $("#closeModal").onclick = closeModal;
  $("#modalBackdrop").onclick = e => { if (e.target === $("#modalBackdrop")) closeModal(); };
  $("#mobileMenu").onclick = () => { $("#sidebar").classList.add("open"); $("#drawerShade").classList.add("open"); };
  $("#drawerShade").onclick = () => { $("#sidebar").classList.remove("open"); $("#drawerShade").classList.remove("open"); };
  $("#voiceClose").onclick = () => { if (recording) recorder?.stop(); else $("#voicePanel").classList.remove("open"); };
  $("#voiceStop").onclick = () => recorder?.stop();
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#message").focus(); } if (e.key === "Escape") { closeModal(); $("#sidebar").classList.remove("open"); $("#drawerShade").classList.remove("open"); } });
}

supabase.auth.onAuthStateChange(async () => { await auth(); if (!currentPage || currentPage === "angel") welcome(); });
wire();
auth().then(() => welcome());
