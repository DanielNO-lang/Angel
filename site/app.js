import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY = "sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const base = SUPABASE_URL + "/functions/v1/";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const guestClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false }
});

const $ = (s) => document.querySelector(s);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

let session = null;
let profile = null;
let guestSession = null;
let conversationId = null;
let history = [];
let sending = false;
let researchMode = false;
let recording = false;
let recorder = null;
let stream = null;
let lastUserPrompt = "";

function displayNameFor(user = session?.user) {
  if (!user) return "there";
  return (
    profile?.display_name ||
    profile?.username ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there"
  );
}

function initialsFor(user = session?.user) {
  const value = displayNameFor(user).trim();
  return (value.split(/\s+/).map((part) => part[0]).join("").slice(0,2) || "A").toUpperCase();
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2300);
}

function setActivity(text, visible = true, done = false) {
  const node = $("#activity");
  if (!node) return;
  node.textContent = "";
  node.classList.toggle("hidden", !visible);
  node.dataset.state = done ? "done" : "active";
  if (!visible) return;
  const mark = document.createElement("span");
  mark.className = "activityTrace";
  const label = document.createElement("span");
  label.textContent = text;
  node.append(mark, label);
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

    const name = displayNameFor();
    if (name && name !== "there") {
      localStorage.setItem("angel.lastAccountName", name);
    }
  }

  const footer = $("#footerStatus");
  if (footer) {
    footer.textContent = session
      ? "Private workspace · conversations and projects save to your account"
      : "Guest mode · Chat and Media Studio work temporarily and are not saved";
  }

  document.dispatchEvent(new CustomEvent("angel-auth-changed", {
    detail: {
      signedIn: !!session,
      user: session?.user || null,
      profile
    }
  }));
  return session;
}

async function ensureGuestSession() {
  if (guestSession) return guestSession;
  const result = await guestClient.auth.signInAnonymously();
  if (result.error || !result.data.session) {
    throw new Error("Guest mode is not enabled on this Angel workspace yet. Sign in to continue.");
  }
  guestSession = result.data.session;
  return guestSession;
}

async function accessSession(allowGuest = false) {
  if (session) return { session, guest: false };
  if (!allowGuest) throw new Error("Please sign in to use this feature.");
  return { session: await ensureGuestSession(), guest: true };
}

async function call(path, body, allowGuest = false) {
  const access = await accessSession(allowGuest);
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + access.session.access_token,
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY
    },
    body: JSON.stringify(body || {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.join(" · ") : data.detail;
    throw new Error(data.error || detail || "Request failed (" + response.status + ")");
  }
  return data;
}

function ensureShellChat() {
  if (!document.body.classList.contains("a5")) return null;
  if (!document.body.classList.contains("a5-chat")) {
    window.AngelShell?.showScreen?.("chat");
  }
  let host = $("#a5-chatstream");
  if (!host) {
    const page = $("#page");
    if (!page) return null;
    page.insertAdjacentHTML("beforeend", '<div id="a5-chatstream" class="a5-chatstream"></div>');
    host = $("#a5-chatstream");
  }
  return host;
}

function renderSources(host, sources) {
  if (!sources?.length) return;
  const box = document.createElement("div");
  box.className = "a5-sources";
  box.innerHTML =
    '<div class="a5-sources-title">Sources · ' + sources.length + '</div>' +
    '<div class="a5-source-grid">' +
    sources.slice(0, 8).map((source, index) =>
      '<a class="a5-source" target="_blank" rel="noopener" href="' + esc(source.url || source.link || "#") + '">' +
        '<strong>' + (index + 1) + ". " + esc(source.title || "Source") + '</strong>' +
        '<span>' + esc(source.url || source.link || source.snippet || "") + '</span>' +
      '</a>'
    ).join("") +
    '</div>';
  host.appendChild(box);
}

function addShellMessage(role, text, sources = [], provider = "") {
  const host = ensureShellChat();
  if (!host) return null;

  const wrap = document.createElement("article");
  wrap.className = "a5-message " + role;

  const meta = document.createElement("div");
  meta.className = "a5-message-meta";
  meta.textContent = role === "user" ? (session ? displayNameFor().toUpperCase() : "YOU") : "ANGEL";

  const body = document.createElement("div");
  body.className = "a5-message-body";

  const textNode = document.createElement("div");
  textNode.className = "a5-message-text";
  textNode.textContent = text;
  body.appendChild(textNode);

  if (role === "assistant") {
    const actions = document.createElement("div");
    actions.className = "a5-message-actions";
    actions.innerHTML =
      '<button type="button" data-action="copy">Copy</button>' +
      '<button type="button" data-action="listen">Listen</button>' +
      '<button type="button" data-action="regenerate">Regenerate</button>';
    actions.querySelector('[data-action="copy"]').onclick = async () => {
      try { await navigator.clipboard?.writeText(text); toast("Copied"); } catch {}
    };
    actions.querySelector('[data-action="listen"]').onclick = () => speak(text);
    actions.querySelector('[data-action="regenerate"]').onclick = () => {
      if (!lastUserPrompt) return;
      const input = $("#message");
      if (!input) return;
      input.value = lastUserPrompt;
      autoGrow();
      send();
    };
    body.appendChild(actions);

    if (provider) {
      const route = document.createElement("div");
      route.className = "a5-message-route";
      route.textContent = "Routed through " + provider;
      body.appendChild(route);
    }
  }

  renderSources(body, sources);
  wrap.append(meta, body);
  host.appendChild(wrap);
  requestAnimationFrame(() => wrap.scrollIntoView({behavior:"smooth",block:"end"}));
  return wrap;
}

function addMessage(role, text, sources = [], provider = "") {
  return addShellMessage(role, text, sources, provider);
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

  input.value = "";
  autoGrow();
  lastUserPrompt = text;
  sending = true;

  window.AngelShell?.showScreen?.("chat");
  addMessage("user", text);
  history.push({role:"user",content:text});
  setActivity("Preparing", true);

  let thinking = null;
  try {
    const plan = await call(base + "angel-orchestrator", {
      task: text,
      mode: researchMode ? "research" : "auto"
    }, true);

    setActivity(activityFor(plan, researchMode || plan.research_required), true);

    const sources = [];
    const context = [];

    if (researchMode || plan.research_required) {
      setActivity("Searching for useful sources", true);
      const research = await call(base + "angel-tools", {
        action: "research",
        query: text,
        max_results: 8
      }, true);

      if (research.answer) {
        context.push({role:"system",content:"Deep research report:\n" + research.answer});
      }
      for (const item of research.results || []) sources.push(item);

      if (sources.length) {
        setActivity("Reading " + sources.length + " sources", true);
        context.push({
          role:"system",
          content:
            "Retrieved web research. Use it when relevant. Do not invent citations.\n" +
            sources.map((source,index) =>
              "[" + (index+1) + "] " + (source.title || "Source") + "\n" +
              (source.url || source.link || "") + "\n" +
              (source.snippet || source.description || "")
            ).join("\n\n")
        });
      }
    }

    setActivity("Routing intelligence", true);
    thinking = addMessage("assistant", "Working…");

    const reply = await call(base + "angel-chat", {
      messages: context.concat(history.slice(-20)),
      mode: plan?.type || "auto",
      research: !!(researchMode || plan.research_required),
      conversation_id: conversationId || undefined
    }, true);

    thinking?.remove();

    const answer = reply.reply || "I’m ready.";
    addMessage(
      "assistant",
      answer,
      sources,
      (reply.provider || "auto") + (reply.model ? " · " + reply.model : "")
    );
    history.push({role:"assistant",content:answer});
    conversationId = reply.conversation_id || conversationId;

    document.dispatchEvent(new CustomEvent("angel-conversation-changed", {
      detail:{conversationId,title:text.slice(0,80),guest:!session}
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
  try {
    const result = await call(base + "angel-tools", {
      action:"speak",
      text,
      voice:"hannah"
    }, true);

    if (!result.audio_base64) throw new Error("Voice output was empty.");
    const binary = atob(result.audio_base64);
    const bytes = new Uint8Array(binary.length);
    for (let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);

    const audio = new Audio(
      URL.createObjectURL(new Blob([bytes],{type:result.mime_type || "audio/wav"}))
    );
    await audio.play();
  } catch (error) {
    toast(error?.message || "Voice is unavailable.");
  }
}

async function toggleMic() {
  if (recording) {
    recorder?.stop();
    return;
  }

  try {
    await accessSession(true);
    stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks = [];
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
      recording = false;
      $("#a5-dictate")?.classList.remove("active");
      $("#voicePanel")?.classList.remove("open");
      stream?.getTracks().forEach((track) => track.stop());

      setActivity("Transcribing", true);
      try {
        const blob = new Blob(chunks,{type:recorder.mimeType || "audio/webm"});
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const result = await call(base + "angel-tools", {
              action:"transcribe",
              audio_base64:reader.result,
              mime_type:blob.type
            }, true);
            const input = $("#message");
            if (input) {
              input.value = result.text || "";
              autoGrow();
            }
            setActivity("Voice captured",true,true);
            setTimeout(() => setActivity("",false),800);
          } catch (error) {
            toast(error?.message || "Transcription failed.");
            setActivity("",false);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        toast(error?.message || "Could not process the recording.");
        setActivity("",false);
      }
    };

    recorder.start();
    recording = true;
    $("#a5-dictate")?.classList.add("active");
    $("#voicePanel")?.classList.add("open");
    setActivity("Listening",true);
  } catch (error) {
    toast(error?.message || "Microphone access is unavailable.");
  }
}

async function uploadFile(file) {
  if (!file) return;
  try {
    await accessSession(true);
    const reader = new FileReader();

    setActivity("Reading " + file.name, true);
    reader.onload = async () => {
      try {
        const data = String(reader.result).split(",")[1] || "";

        addMessage("user","Attached · " + file.name);

        if (file.type.startsWith("image/")) {
          const result = await call(base + "angel-vision", {
            image_base64:data,
            mime_type:file.type,
            prompt:"Analyze this image carefully. Describe useful visible details and explain anything relevant to the user."
          }, true);
          addMessage("assistant",result.reply || result.answer || "Image analyzed.");
        } else {
          const result = await call(base + "angel-documents", {
            action:"analyze",
            file_name:file.name,
            mime_type:file.type || "application/octet-stream",
            data_base64:data,
            prompt:"Analyze this document and give the user the important information clearly."
          }, true);
          addMessage("assistant",result.answer || result.reply || result.text || "Document analyzed.");
        }

        setActivity("Complete",true,true);
        setTimeout(() => setActivity("",false),800);
      } catch (error) {
        addMessage("assistant",error?.message || "The file could not be analyzed.");
        setActivity("File analysis failed",true,true);
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    toast(error?.message || "Sign in to use this file feature.");
  }
}

async function generateImage(prompt, aspect_ratio = "1:1") {
  const value = String(prompt || "").trim();
  if (!value) throw new Error("Describe the image you want to create.");

  setActivity("Creating image",true);

  try {
    const result = await call(base + "angel-tools", {
      action:"generate_image",
      prompt:value,
      aspect_ratio
    }, true);

    const src = result.image_base64
      ? "data:" + (result.mime_type || "image/png") + ";base64," + result.image_base64
      : result.url || "";

    if (!src) throw new Error("No image was returned.");

    document.dispatchEvent(new CustomEvent("angel-media-generated", {
      detail:{type:"image",src,prompt:value,temporary:!session}
    }));

    setActivity("Image ready",true,true);
    setTimeout(() => setActivity("",false),1000);
    return src;
  } catch (error) {
    setActivity("",false);
    throw error;
  }
}

async function loadConversation(id) {
  if (!session || !id) {
    toast("Sign in to open saved conversations.");
    return;
  }

  const result = await supabase
    .from("messages")
    .select("role,content,created_at")
    .eq("conversation_id",id)
    .order("created_at",{ascending:true});

  if (result.error) {
    toast(result.error.message);
    return;
  }

  conversationId = id;
  history = (result.data || []).map((item) => ({
    role:item.role,
    content:item.content
  }));

  window.AngelShell?.showScreen?.("chat");
  const host = ensureShellChat();
  if (!host) return;
  host.innerHTML = "";
  for (const item of result.data || []) {
    addMessage(item.role === "assistant" ? "assistant" : "user",item.content);
  }
}

function newChat() {
  conversationId = null;
  history = [];
  lastUserPrompt = "";
  window.AngelShell?.showScreen?.("chat");
  const host = ensureShellChat();
  if (host) host.innerHTML = "";
}

function toggleResearch() {
  researchMode = !researchMode;
  document.querySelectorAll("[data-shell-research]").forEach((node) => {
    node.classList.toggle("active",researchMode);
  });
  toast(researchMode ? "Research mode on" : "Research mode off");
}

function autoGrow() {
  const input = $("#message");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight,160) + "px";
}

function openModal(reason = "") {
  document.dispatchEvent(new CustomEvent("angel-open-auth", {detail:{reason}}));
  $("#modalBackdrop")?.classList.add("open");
  $("#modalBackdrop")?.setAttribute("aria-hidden","false");
}

function closeModal() {
  $("#modalBackdrop")?.classList.remove("open");
  $("#modalBackdrop")?.setAttribute("aria-hidden","true");
}

async function signInWithGoogle() {
  const result = await supabase.auth.signInWithOAuth({
    provider:"google",
    options:{redirectTo:window.location.origin + "/"}
  });
  if (result.error) {
    $("#authError") && ($("#authError").textContent = result.error.message);
  }
}

async function signInWithPassword(email,password) {
  const result = await supabase.auth.signInWithPassword({email,password});
  if (result.error) throw result.error;
  return result.data;
}

async function signUpWithPassword(name,email,password) {
  const result = await supabase.auth.signUp({
    email,
    password,
    options:{data:{full_name:name}}
  });
  if (result.error) throw result.error;
  if (!result.data.session) {
    toast("Check your email to confirm the new account.");
  }
  return result.data;
}

async function signOut() {
  const result = await supabase.auth.signOut();
  if (result.error) {
    toast(result.error.message);
    return;
  }
  session = null;
  profile = null;
  guestSession = null;
  conversationId = null;
  history = [];
  lastUserPrompt = "";
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
  generateImage,
  signIn:signInWithGoogle,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  newChat,
  loadConversation,
  toggleResearch,
  openModal,
  closeModal,
  getSession:() => session,
  getUser:() => session?.user || null,
  getProfile:() => profile,
  getDisplayName:() => displayNameFor(),
  getInitials:() => initialsFor(),
  isSignedIn:() => !!session,
  isGuest:() => !session
};

$("#sendBtn")?.addEventListener("click",send);
$("#message")?.addEventListener("input",autoGrow);
$("#message")?.addEventListener("keydown",(event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});
$("#fileInput")?.addEventListener("change",(event) => {
  const file = event.target.files?.[0];
  if (file) uploadFile(file);
  event.target.value = "";
});
$("#closeModal")?.addEventListener("click",closeModal);
$("#modalBackdrop")?.addEventListener("click",(event) => {
  if (event.target?.id === "modalBackdrop") closeModal();
});
$("#voiceClose")?.addEventListener("click",() => {
  if (recorder && recording) recorder.stop();
  $("#voicePanel")?.classList.remove("open");
});
$("#voiceStop")?.addEventListener("click",() => recorder?.stop());

document.addEventListener("keydown",(event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#message")?.focus();
  }
  if (event.key === "Escape") closeModal();
});

supabase.auth.onAuthStateChange(() => {
  setTimeout(() => auth().catch(() => {}),0);
});

document.body.dataset.density = "comfortable";
document.body.dataset.motion = "full";

auth().catch((error) => {
  console.error("Angel auth",error);
  document.dispatchEvent(new CustomEvent("angel-auth-changed",{
    detail:{signedIn:false,user:null,profile:null}
  }));
});
