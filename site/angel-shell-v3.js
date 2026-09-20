const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const path = {
  home:"M3 10.5 12 3l9 7.5v9.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  chat:"M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  project:"M4 7h6l2 2h8v9H4z",
  schedule:"M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 12h3M8 15h6",
  library:"M5 4h13a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2zM8 4v16",
  media:"M5 6h14v12H5zM9 10h6M9 14h4",
  assistant:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-3 7 2 2 4-5",
  more:"M5 12h.01M12 12h.01M19 12h.01",
  pin:"M8 4h8l-2 5 3 3-5 1v7l-2-4-2 4v-7l-5-1 3-3z",
  archive:"M4 6h16v13H4zM3 6h18v-2H3zM9 10h6",
  mic:"M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zm-7 8a7 7 0 0 0 14 0m-7 7v3",
  voice:"M8 8.5a4 4 0 0 1 8 0v2a4 4 0 0 1-8 0zM5 11a7 7 0 0 0 14 0M12 18v3",
  video:"M4 6h12v12H4zM16 10l4-2v8l-4-2z",
  send:"M4 12 21 5l-5 14-3.5-5.5zM12.5 13.5 21 5",
  plus:"M12 5v14M5 12h14",
  moon:"M20 15.5A7.5 7.5 0 1 1 8.5 4 6 6 0 0 0 20 15.5",
  sun:"M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10",
  device:"M4 5h16v12H4zM9 21h6M12 17v4",
  bell:"M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8M10 21h4",
  search:"M10.5 18a6.5 6.5 0 1 1 4.6-11.1L21 12.8M14.5 14.5 21 21",
  lock:"M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  trash:"M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13",
  chart:"M5 19V9M12 19V5M19 19v-8",
  memory:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0-8-8zm0 4v4l3 2",
  plug:"M8 12h8M10 5v4m4-4v4M7 13a5 5 0 0 0 10 0",
  image:"M4 5h16v14H4zM8 13l2-2 2 2 2-3 4 5H6z",
  doc:"M7 3h7l4 4v14H7zM14 3v5h5",
  agent:"M12 4l1.8 4.6L19 10.5l-5.2 1.8L12 17l-1.8-4.7L5 10.5z",
  shield:"M12 3 19 6v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6zM9 12l2 2 4-4",
  external:"M14 5h5v5M19 5l-7 7",
  arrow:"M5 12h13M13 7l5 5-5 5",
  x:"M6 6l12 12M18 6 6 18"
};

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

const ico = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (path[name] || path.more) + '"></path></svg>';

let screen = "home";
let chatData = [];
let pinned = new Set(JSON.parse(localStorage.getItem("angel.pinned") || "[]"));
let archived = new Set(JSON.parse(localStorage.getItem("angel.archived") || "[]"));
let deleted = new Set(JSON.parse(localStorage.getItem("angel.deleted") || "[]"));
let themeMode = localStorage.getItem("angel.theme.mode") || "dark";
let selectedModel = localStorage.getItem("angel.model") || "Auto";
let think = localStorage.getItem("angel.think") === "1";
let moreOpen = false;

const isMobile = () => innerWidth <= 760;
const isTablet = () => innerWidth <= 1100;
const signedIn = () => !!window.AngelCore?.getSession?.();
const userName = () => signedIn() ? (window.AngelCore?.getDisplayName?.() || "there") : "there";
const initials = () => signedIn() ? (window.AngelCore?.getInitials?.() || "A") : "A";
const lastAccountName = () => localStorage.getItem("angel.lastAccountName") || "";

function toast(message) {
  const x = $("#toast");
  if (!x) return;
  x.textContent = message;
  x.classList.add("show");
  clearTimeout(x._t);
  x._t = setTimeout(() => x.classList.remove("show"), 2200);
}

function setTheme(mode) {
  themeMode = mode;
  localStorage.setItem("angel.theme.mode", mode);
  const resolved = mode === "device"
    ? (matchMedia("(prefers-color-scheme:light)").matches ? "light" : "dark")
    : mode;
  document.documentElement.dataset.theme = resolved;
  $$(".a5-theme").forEach((b) => b.classList.toggle("active", b.dataset.theme === mode));
}

function openAuth(reason = "") {
  window.AngelCore?.openModal?.(reason);
  renderAuth(false);
}

function closePops() {
  $$(".a5-pop.open,.a5-profile.open,.a5-toolpanel.open,.a5-video-sheet.open,.a5-profilepanel.open").forEach((x) => x.classList.remove("open"));
  $("#a5-searchresults")?.remove();
}

function handleProtected(action) {
  if (!signedIn()) {
    openAuth(action);
    return false;
  }
  return true;
}

function toggleSidebar() {
  if (isMobile()) {
    const sidebar = $("#sidebar");
    sidebar?.classList.toggle("a5-mobile-open");
    $("#drawerShade")?.classList.toggle("open", sidebar?.classList.contains("a5-mobile-open"));
    return;
  }
  const collapsed = document.body.classList.toggle("a5-collapsed");
  localStorage.setItem("angel.sidebarCollapsed", collapsed ? "1" : "0");
  renderSidebar();
}

function navBtn(id, label, iconName, protectedItem = false) {
  return '<button class="a5-navitem' + (protectedItem && !signedIn() ? ' protected' : '') + '" data-nav="' + id + '">' +
    ico(iconName) + '<span>' + label + '</span>' +
    (protectedItem && !signedIn() ? '<em>•</em>' : '') +
  '</button>';
}

function renderSidebar() {
  const collapsed = document.body.classList.contains("a5-collapsed");
  const guestBlock = '<div class="a5-guestblock"><div class="a5-guestcopy"><strong>Guest session</strong><span>Chat + Media Studio are available.</span></div><button id="a5-login-side" class="a5-loginbtn">Log in / Sign up</button></div>';

  const profileBlock = signedIn()
    ? '<div class="a5-profile" id="a5-profile">' +
        '<button class="a5-profilebtn" id="a5-profilebtn">' +
          '<span class="a5-avatar">' + esc(initials()) + '</span>' +
          '<span class="a5-profiletext"><strong>' + esc(userName()) + '</strong><small>Free plan</small></span>' +
          '<span class="a5-chevron">›</span>' +
        '</button>' +
        '<div class="a5-profilepanel" id="a5-profilepanel"></div>' +
      '</div>'
    : guestBlock;

  const expanded =
    '<div class="a5-expanded">' +
      '<div class="a5-brandrow">' +
        '<button class="a5-brand" id="a5-brand"><img src="/angel-logo.svg" alt="Angel"></button>' +
        '<div class="a5-brand-name">Angel</div>' +
        '<button class="a5-collapse" id="a5-collapse" aria-label="Collapse sidebar">‹</button>' +
      '</div>' +
      '<div class="a5-searchrow">' +
        '<button class="a5-searchbutton" id="a5-searchbutton" title="Search chats">' + ico("search") + '</button>' +
        '<input id="a5-searchinput" class="a5-searchinput" placeholder="Search chats…" autocomplete="off">' +
      '</div>' +
      '<button class="a5-newchat" id="a5-newchat"><span>' + ico("plus") + '</span><b>New Chat</b></button>' +
      '<div class="a5-scroll">' +
        '<div class="a5-section">Tools</div>' +
        navBtn("home","Home","home") +
        navBtn("agent","Agent Lab","agent",true) +
        navBtn("projects","Projects","project",true) +
        navBtn("schedule","Schedule","schedule",true) +
        navBtn("library","Library","library",true) +
        navBtn("media","Media Studio","media") +
        navBtn("assistants","Assistants","assistant",true) +
        navBtn("more","More","more") +
        (signedIn()
          ? '<div class="a5-section a5-recents-title">Recents</div><div id="a5-recents" class="a5-chatlist"></div>' +
            '<button class="a5-subtoggle" data-toggle="pinned"><span>Pinned</span><b>›</b></button><div id="a5-pinned" class="a5-chatlist collapsed"></div>' +
            '<button class="a5-subtoggle" data-toggle="archived"><span>Archived</span><b>›</b></button><div id="a5-archived" class="a5-chatlist collapsed"></div>'
          : '<div class="a5-guestnote">Your temporary chat history disappears from the workspace when you leave. Sign in to keep it.</div>') +
      '</div>' +
      '<div class="a5-quote"><p>“The best tool disappears into the work.”</p><small>ANGEL · ROTATING</small></div>' +
      profileBlock +
    '</div>';

  const rail =
    '<div class="a5-collapsed">' +
      '<button class="a5-collapsed-logo" id="a5-rail-open" title="Open sidebar"><img src="/angel-logo.svg" alt="Angel"></button>' +
      '<div class="a5-rail">' +
        [["chat","chat"],["home","home"],["agent","agent"],["project","project"],["schedule","schedule"],["library","library"],["media","media"],["assistant","assistant"],["more","more"]]
          .map((x) => '<button class="a5-railbtn' + (!signedIn() && ["agent","project","schedule","library","assistant"].includes(x[0]) ? ' protected' : '') + '" data-nav="' + x[0] + '" title="' + x[0] + '">' + ico(x[1]) + '</button>').join("") +
        '<div class="a5-railspacer"></div>' +
        (signedIn()
          ? '<button class="a5-railavatar" id="a5-rail-profile">' + esc(initials()) + '</button>'
          : '<button class="a5-railavatar guest" id="a5-rail-login" title="Log in / Sign up">' + ico("lock") + '</button>') +
      '</div>' +
    '</div>';

  $("#sidebar").innerHTML = collapsed ? rail : expanded;
  bindSidebar();
  paintChats();
}

function bindSidebar() {
  $("#a5-collapse")?.addEventListener("click", toggleSidebar);
  $("#a5-rail-open")?.addEventListener("click", toggleSidebar);
  $("#a5-brand")?.addEventListener("click", () => showScreen("home"));
  $("#a5-newchat")?.addEventListener("click", () => window.AngelCore?.newChat?.());
  $("#a5-login-side")?.addEventListener("click", () => openAuth("account"));
  $("#a5-rail-login")?.addEventListener("click", () => openAuth("account"));

  $("#a5-searchbutton")?.addEventListener("click", () => {
    const row = $(".a5-searchrow");
    row?.classList.add("open");
    $("#a5-searchinput")?.focus();
    showSearch("");
  });

  $("#a5-searchinput")?.addEventListener("input", (e) => showSearch(e.target.value));
  $("#a5-profilebtn")?.addEventListener("click", openProfile);
  $("#a5-rail-profile")?.addEventListener("click", openProfileFromRail);

  $$("[data-nav]").forEach((button) => button.addEventListener("click", () => handleNav(button.dataset.nav)));

  $$(".a5-subtoggle").forEach((button) => button.addEventListener("click", () => {
    const target = $("#a5-" + button.dataset.toggle);
    const hidden = target?.classList.contains("collapsed");
    target?.classList.toggle("collapsed", !hidden);
    button.querySelector("b").textContent = hidden ? "⌄" : "›";
  }));
}

function handleNav(n) {
  if (n === "home") return showScreen("home");
  if (n === "chat") return window.AngelCore?.newChat?.();
  if (n === "media") return showScreen("media");
  if (n === "more") return openToolPanel();
  if (n === "agent" || n === "projects" || n === "schedule" || n === "library" || n === "assistants") {
    if (!handleProtected(n)) return;
    if (n === "agent") return window.dispatchEvent(new Event("angel-agent-lab-open"));
    return showScreen(n);
  }
}

function paintChats() {
  if (!signedIn()) return;
  const a = $("#a5-recents");
  const p = $("#a5-pinned");
  const r = $("#a5-archived");
  if (!a) return;

  const row = (x) =>
    '<div class="a5-chatrow" data-chat="' + esc(x.id) + '" role="button" tabindex="0">' +
      '<span class="a5-chat-icon">' + ico("chat") + '</span>' +
      '<span class="a5-chat-title">' + esc(x.title) + '</span>' +
      '<button type="button" class="a5-chat-more" data-more="' + esc(x.id) + '">•••</button>' +
    '</div>';

  a.innerHTML = chatData.filter((x) => !pinned.has(x.id) && !archived.has(x.id)).slice(0,8).map(row).join("") || '<div class="a5-notice">No recent chats yet.</div>';
  p.innerHTML = chatData.filter((x) => pinned.has(x.id)).map(row).join("") || '<div class="a5-notice">Nothing pinned.</div>';
  r.innerHTML = chatData.filter((x) => archived.has(x.id)).map(row).join("") || '<div class="a5-notice">Nothing archived.</div>';

  $$("#sidebar [data-chat]").forEach((b) => b.addEventListener("click", (e) => {
    if (e.target.closest("[data-more]")) return;
    window.AngelCore?.loadConversation?.(b.dataset.chat);
  }));

  $$("#sidebar [data-more]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    openChatMenu(b.dataset.more, b);
  }));
}

async function loadChats() {
  chatData = [];
  if (signedIn()) {
    try {
      const s = window.AngelCore?.getSession?.();
      const sb = window.AngelCore?.supabase;
      const r = await sb.from("conversations").select("id,title,updated_at").eq("user_id",s.user.id).order("updated_at",{ascending:false}).limit(30);
      chatData = (r.data || []).filter((x) => !deleted.has(x.id)).map((x) => ({id:x.id,title:x.title || "Conversation"}));
    } catch {}
  }
  if (!signedIn() && !chatData.length) {
    chatData = [];
  }
  paintChats();
}

function openChatMenu(id, button) {
  if (!signedIn()) return openAuth("chat history");
  closePops();
  const menu = document.createElement("div");
  menu.className = "a5-pop open";
  menu.innerHTML =
    '<div class="a5-poptitle">Chat options</div>' +
    ["share:Share chat","rename:Rename chat","pin:Pin chat","lock:Lock chat","archive:Archive chat","delete:Delete chat"]
      .map((x) => {
        const pair = x.split(":");
        return '<button data-cm="' + pair[0] + '" class="' + (pair[0] === "delete" ? "danger" : "") + '">' + pair[1] + '</button>';
      }).join("");
  document.body.appendChild(menu);
  const r = button.getBoundingClientRect();
  menu.style.left = Math.max(8,r.right-245) + "px";
  menu.style.top = Math.min(innerHeight-230,r.bottom+4) + "px";
  menu.querySelectorAll("[data-cm]").forEach((b) => {
    b.onclick = () => {
      chatAction(id,b.dataset.cm);
      menu.remove();
    };
  });
}

function chatAction(id, action) {
  if (action === "pin") {
    pinned.has(id) ? pinned.delete(id) : pinned.add(id);
    localStorage.setItem("angel.pinned",JSON.stringify([...pinned]));
    paintChats();
    return;
  }
  if (action === "archive") {
    archived.add(id);
    localStorage.setItem("angel.archived",JSON.stringify([...archived]));
    paintChats();
    return;
  }
  if (action === "delete") {
    deleted.add(id);
    localStorage.setItem("angel.deleted",JSON.stringify([...deleted]));
    paintChats();
    toast("Moved to Recycle Bin");
    return;
  }
  if (action === "lock") return toast("Lock Chat opens in Secrets.");
  if (action === "rename") return renameChat(id);
  if (action === "share") return shareChat(id);
}

async function renameChat(id) {
  const current = chatData.find((x) => x.id === id);
  const title = prompt("Rename chat", current?.title || "");
  if (!title?.trim()) return;
  try {
    const sb = window.AngelCore?.supabase;
    const s = window.AngelCore?.getSession?.();
    const r = await sb.from("conversations").update({title:title.trim()}).eq("id",id).eq("user_id",s.user.id);
    if (r.error) throw r.error;
    current.title = title.trim();
    paintChats();
    toast("Chat renamed");
  } catch (error) {
    toast(error?.message || "Rename failed.");
  }
}

async function shareChat(id) {
  const url = window.location.origin + "/?chat=" + encodeURIComponent(id);
  try {
    await navigator.clipboard.writeText(url);
    toast("Chat link copied");
  } catch {
    toast("Share link ready");
  }
}

function showSearch(term) {
  closePops();
  const popup = document.createElement("div");
  popup.id = "a5-searchresults";
  popup.className = "a5-pop open";
  const t = String(term || "").trim().toLowerCase();
  const rows = chatData.filter((x) => !t || x.title.toLowerCase().includes(t));
  popup.innerHTML =
    '<div class="a5-poptitle">Search chats</div>' +
    (rows.length
      ? rows.slice(0,8).map((x) => '<button data-sr="' + esc(x.id) + '">' + ico("chat") + '<span>' + esc(x.title) + '</span></button>').join("")
      : '<div class="a5-notice">' + (signedIn() ? "No matching chats." : "Sign in to search saved chats.") + '</div>');
  document.body.appendChild(popup);
  const r = $(".a5-searchrow")?.getBoundingClientRect();
  popup.style.left = isMobile() ? "10px" : Math.max(8,(r?.right || 300)+8) + "px";
  popup.style.top = isMobile() ? "62px" : (r?.top || 90) + "px";
  popup.querySelectorAll("[data-sr]").forEach((b) => b.onclick = () => {
    popup.remove();
    window.AngelCore?.loadConversation?.(b.dataset.sr);
  });
}

function openProfileFromRail() {
  document.body.classList.remove("a5-collapsed");
  localStorage.setItem("angel.sidebarCollapsed","0");
  renderSidebar();
  setTimeout(openProfile,0);
}

function openProfile() {
  const panel = $("#a5-profilepanel");
  if (!panel) return;
  closePops();
  panel.classList.add("open");
  panel.innerHTML =
    '<div class="a5-menuhead">' +
      '<span class="a5-avatar big">' + esc(initials()) + '</span>' +
      '<div><strong>' + esc(userName()) + '</strong><small>' + esc(window.AngelCore?.getUser?.()?.email || "Account") + '</small><small>Free plan</small></div>' +
    '</div>' +
    '<button class="a5-menubtn accent" data-prof="upgrade">' + ico("shield") + '<span>Try Plus free</span><b>›</b></button>' +
    '<button class="a5-menubtn" data-prof="personalization">' + ico("sun") + '<span>Personalization</span></button>' +
    '<button class="a5-menubtn" data-prof="profile">' + ico("chat") + '<span>Profile</span></button>' +
    '<button class="a5-menubtn" data-prof="settings">' + ico("device") + '<span>Settings</span></button>' +
    '<div class="a5-divider"></div>' +
    '<button class="a5-menubtn" data-prof="help">' + ico("more") + '<span>Help</span><b>›</b></button>' +
    '<button class="a5-menubtn danger" data-prof="logout">' + ico("lock") + '<span>Log out</span></button>';

  panel.querySelectorAll("[data-prof]").forEach((b) => b.onclick = () => profileAction(b.dataset.prof));
}

function profileAction(action) {
  if (action === "logout") return window.AngelCore?.signOut?.();
  if (action === "upgrade") return toast("Plans are ready for the account flow.");
  $("#a5-profilepanel")?.classList.remove("open");
  if (action === "personalization") return openTheme();
  if (action === "profile") return showScreen("profile");
  if (action === "settings") return showScreen("settings");
  if (action === "help") return openHelp();
}

function openHelp() {
  const panel = $("#a5-profilepanel");
  if (!panel) return;
  panel.innerHTML =
    '<div class="a5-menuhead"><strong>Help & Support</strong><button id="a5-help-close">×</button></div>' +
    ["Help Center","Release Notes","Download Apps","Keyboard Shortcuts","Terms of Service","Privacy Policy","Report a Bug"]
      .map((x) => '<button class="a5-menubtn"><span>' + x + '</span><b>›</b></button>').join("") +
    '<button class="a5-menubtn" id="a5-help-back"><span>Back to profile</span></button>';
  panel.classList.add("open");
  $("#a5-help-close").onclick = () => panel.classList.remove("open");
  $("#a5-help-back").onclick = openProfile;
}

function openTheme() {
  closePops();
  const p = document.createElement("div");
  p.className = "a5-pop open";
  p.innerHTML =
    '<div class="a5-poptitle">Theme</div>' +
    '<div class="a5-themegrid">' +
      '<button class="a5-theme" data-theme="light">' + ico("sun") + '<span>Light</span></button>' +
      '<button class="a5-theme" data-theme="dark">' + ico("moon") + '<span>Dark</span></button>' +
      '<button class="a5-theme" data-theme="device">' + ico("device") + '<span>Device</span></button>' +
    '</div>';
  document.body.appendChild(p);
  const r = $(".a5-topbar")?.getBoundingClientRect();
  p.style.right = "18px";
  p.style.top = (r?.bottom || 64) + 8 + "px";
  p.querySelectorAll("[data-theme]").forEach((b) => b.onclick = () => {
    setTheme(b.dataset.theme);
    p.remove();
  });
}

function buildTop() {
  const h = $(".topbar");
  h.className = "topbar a5-topbar";
  h.innerHTML =
    '<div class="a5-mobiletop">' +
      '<button id="a5-mobilemenu" class="a5-topicon">' + ico("more") + '</button>' +
      '<div class="a5-mobilebrand"><img src="/angel-logo.svg" alt=""><strong>Angel</strong></div>' +
      '<button id="a5-mobilelogin" class="a5-mobilelogin">' + (signedIn() ? esc(initials()) : "Log in") + '</button>' +
    '</div>' +
    '<div class="a5-topspacer"></div>' +
    '<button class="a5-topbtn icon" id="a5-notify" title="Notifications">' + ico("bell") + '</button>' +
    '<button class="a5-topbtn" id="a5-share">Share chat</button>' +
    '<button class="a5-topbtn offer" id="a5-plus">Try Plus</button>' +
    '<button class="a5-topbtn icon" id="a5-more" title="More">' + ico("more") + '</button>' +
    '<button class="a5-topbtn icon" id="a5-theme" title="Theme">' + ico("sun") + '</button>' +
    (signedIn() ? '' : '<button class="a5-top-login" id="a5-top-login">Log in / Sign up</button>');

  $("#a5-mobilemenu")?.addEventListener("click",toggleSidebar);
  $("#a5-mobilelogin")?.addEventListener("click",() => signedIn() ? openProfileFromRail() : openAuth("account"));
  $("#a5-top-login")?.addEventListener("click",() => openAuth("account"));
  $("#a5-notify")?.addEventListener("click",() => toast("No new notifications"));
  $("#a5-share")?.addEventListener("click",() => signedIn() ? toast("Share options ready") : openAuth("share"));
  $("#a5-plus")?.addEventListener("click",() => toast("Plans are available from your account menu."));
  $("#a5-more")?.addEventListener("click",openToolPanel);
  $("#a5-theme")?.addEventListener("click",openTheme);
}

function openToolPanel() {
  closePops();
  let p = $("#a5-toolpanel");
  if (!p) {
    p = document.createElement("div");
    p.id = "a5-toolpanel";
    p.className = "a5-toolpanel";
    p.innerHTML =
      '<button class="a5-panelclose" id="a5-tool-close">×</button>' +
      toolCategory("Productivity",[["Schedule","schedule",true],["Projects","project",true],["Library","library",true],["Media Studio","media",false]]) +
      toolCategory("AI & Assistants",[["Agent Lab","agent",true],["Assistants","assistant",true],["Marketplace","more",true],["Charts","chart",true]]) +
      toolCategory("Knowledge",[["Memory","memory",true],["Multimodal","image",false],["Skills","agent",false]]) +
      toolCategory("Integrations",[["Plugins","plug",true],["Connections","plug",true]]) +
      toolCategory("Security",[["Secrets","lock",true],["Recycle Bin","trash",true]]);
    document.body.appendChild(p);
    $("#a5-tool-close").onclick = () => p.classList.remove("open");
    p.querySelectorAll("[data-tool]").forEach((b) => b.onclick = () => {
      const t = b.dataset.tool;
      p.classList.remove("open");
      showTool(t,b.dataset.protected === "true");
    });
  }
  p.classList.toggle("open");
}

function toolCategory(title,items) {
  return '<section class="a5-toolcategory"><h4>' + title + '</h4><div>' +
    items.map((x) => '<button data-tool="' + x[0] + '" data-protected="' + x[2] + '">' + ico(x[1]) + '<span>' + x[0] + '</span></button>').join("") +
  '</div></section>';
}

function showTool(t,isProtected) {
  if (isProtected && !handleProtected(t)) return;
  if (t === "Agent Lab") return window.dispatchEvent(new Event("angel-agent-lab-open"));
  if (t === "Assistants") return showScreen("assistants");
  if (t === "Recycle Bin") return showScreen("recycle");
  if (t === "Projects") return showScreen("projects");
  if (t === "Schedule") return showScreen("schedule");
  if (t === "Library") return showScreen("library");
  if (t === "Media Studio") return showScreen("media");
  toast(t + " opened");
}

function homeAction(icon,label,desc,action,protectedItem) {
  return '<button class="a5-action' + (protectedItem && !signedIn() ? ' locked' : '') + '" data-action="' + action + '">' +
    '<span class="a5-actionicon">' + ico(icon) + '</span>' +
    '<span><b>' + label + '</b><small>' + desc + '</small></span>' +
  '</button>';
}

function activityRow(icon,title,meta) {
  return '<div class="a5-activityrow"><span class="a5-activityicon">' + ico(icon) + '</span><div><b>' + title + '</b><small>' + meta + '</small></div></div>';
}

function projectRow(title,meta,protectedItem=true) {
  return '<button class="a5-projectrow' + (protectedItem && !signedIn() ? ' locked' : '') + '" data-project="' + esc(title) + '"><span>' + ico("project") + '</span><div><b>' + esc(title) + '</b><small>' + esc(meta) + '</small></div><b>›</b></button>';
}

function quoteCard() {
  return '<div class="a5-quoteCard"><div class="a5-quoteArt"><span></span><i></i><b></b></div><div class="a5-quoteText"><strong>Better ideas<br>build a brighter future.</strong><small>Angel</small></div></div>';
}

function home() {
  const greeting = signedIn() ? "Good evening, " + esc(userName()) : "Good evening";
  $("#page").innerHTML =
    '<section class="a5-home">' +
      '<div class="a5-homehead"><div><h1>' + greeting + '</h1><p>' + (signedIn() ? "Here’s what’s happening today." : "Explore Angel without creating an account. Sign in when you’re ready to save.") + '</p></div><span class="a5-angelstatus" title="Angel ready"></span></div>' +
      '<div class="a5-homegrid">' +
        '<div>' +
          '<div class="a5-card">' +
            '<div class="a5-cardhead"><div><h2>Start with Angel</h2><span>Choose a direction</span></div></div>' +
            '<div class="a5-actiongrid">' +
              homeAction("agent","Agent Lab","Give Angel a job and get it done.","agent",true) +
              homeAction("project","Projects","Organize work and track progress.","projects",true) +
              homeAction("image","Create image","Bring your ideas to life.","media",false) +
              homeAction("schedule","Schedule","Plan reminders and recurring work.","schedule",true) +
              homeAction("library","Library","Store files and knowledge.","library",true) +
              homeAction("more","More Tools","Explore the wider workspace.","more",false) +
            '</div>' +
          '</div>' +
          '<div class="a5-lowergrid">' +
            '<div class="a5-card"><div class="a5-cardhead"><div><h2>Recent Activity</h2><span>' + (signedIn() ? "Your workspace" : "Guest session") + '</span></div></div><div class="a5-activity">' +
              activityRow("project","Website redesign",signedIn() ? "Projects · active" : "Sign in to save") +
              activityRow("agent","Research task",signedIn() ? "Agent Lab · recent" : "Try it without saving") +
              activityRow("image","Image generation","Media Studio · recent") +
            '</div></div>' +
            '<div class="a5-card"><div class="a5-cardhead"><div><h2>Projects</h2><span>' + (signedIn() ? "3 active" : "Sign in to save projects") + '</span></div></div><div class="a5-projects">' +
              projectRow("Website Redesign","UI refresh · active") +
              projectRow("Marketing Strategy","Research · active") +
              projectRow("Mobile App","Planning · active") +
              (signedIn() ? '<button class="a5-viewall" data-project-all>View all →</button>' : '<button class="a5-viewall" data-login-projects>Log in to keep projects</button>') +
            '</div></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          quoteCard() +
          '<div class="a5-card a5-news-card"><div class="a5-cardhead"><div><h2>Latest News</h2><span>Search when you need it</span></div></div>' +
            '<button class="a5-newsrow" data-news="Search the latest AI and developer news."><span>' + ico("search") + '</span><div><b>AI and developer news</b><small>Fresh search results when you ask</small></div><b>›</b></button>' +
            '<button class="a5-newsrow" data-news="Search the latest agent and automation updates."><span>' + ico("agent") + '</span><div><b>Agents & automation</b><small>Browse current changes</small></div><b>›</b></button>' +
            '<button class="a5-newsrow" data-news="Search current creative AI image and video updates."><span>' + ico("media") + '</span><div><b>Creative AI</b><small>Images, video and multimodal</small></div><b>›</b></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

  $$("#page [data-action]").forEach((b) => b.onclick = () => {
    const action = b.dataset.action;
    if (["agent","projects","schedule","library"].includes(action) && !handleProtected(action)) return;
    if (action === "agent") return window.dispatchEvent(new Event("angel-agent-lab-open"));
    if (action === "more") return openToolPanel();
    if (action === "media") return showScreen("media");
    showScreen(action);
  });

  $$("#page [data-project]").forEach((b) => b.onclick = () => {
    if (!handleProtected("Projects")) return;
    showScreen("projects");
  });

  $("#page [data-project-all]")?.addEventListener("click",() => showScreen("projects"));
  $("#page [data-login-projects]")?.addEventListener("click",() => openAuth("projects"));
  $$("#page [data-news]").forEach((b) => b.onclick = () => {
    showScreen("chat");
    const input = $("#message");
    if (input) {
      input.value = b.dataset.news;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      input.focus();
    }
  });
}

function chat(chatId = null) {
  $("#page").innerHTML =
    '<section class="a5-chatpage">' +
      '<div class="a5-chatempty">' +
        '<div class="a5-chatmark">' + ico("chat") + '</div>' +
        '<h1>' + (signedIn() ? "Hello again, " + esc(userName()) : "Hello there") + '</h1>' +
        '<p>What would you like Angel to help you with today?</p>' +
        '<div class="a5-chatcontrols">' +
          '<button id="a5-think" class="' + (think ? "active" : "") + '">Think</button>' +
          '<button id="a5-engine">Search engine</button>' +
          '<button id="a5-browse">Browse web</button>' +
          '<button id="a5-model">Model: ' + esc(selectedModel) + '</button>' +
        '</div>' +
        '<div class="a5-suggestions">' +
          '<button data-prompt="Latest tech news and what changed this week">Latest tech news</button>' +
          '<button data-prompt="Create a practical marketing plan">Design a marketing plan</button>' +
          '<button data-prompt="Design a clean landing page for Angel">Design inspiration</button>' +
          '<button data-prompt="Build a beginner Python tutorial">Python tutorial</button>' +
          '<button data-prompt="Healthy meal ideas for the week">Healthy meal ideas</button>' +
        '</div>' +
      '</div>' +
      '<div id="a5-chatstream" class="a5-chatstream"></div>' +
    '</section>';

  $$("#page [data-prompt]").forEach((b) => b.onclick = () => {
    $("#message").value = b.dataset.prompt;
    $("#message").dispatchEvent(new Event("input",{bubbles:true}));
    $("#message").focus();
  });

  $("#a5-think").onclick = () => {
    think = !think;
    localStorage.setItem("angel.think",think ? "1" : "0");
    $("#a5-think").classList.toggle("active",think);
    toast(think ? "Think enabled" : "Think disabled");
  };

  $("#a5-engine").onclick = () => toast("Angel routes web research through the connected search tools.");
  $("#a5-browse").onclick = () => window.AngelCore?.toggleResearch?.();
  $("#a5-model").onclick = () => openModelMenu($("#a5-model"));

  if (chatId && !String(chatId).startsWith("demo-")) {
    setTimeout(() => window.AngelCore?.loadConversation?.(chatId),0);
  }
}

function openModelMenu(anchor) {
  closePops();
  const p = document.createElement("div");
  p.className = "a5-pop open";
  p.innerHTML =
    '<div class="a5-poptitle">Model routing</div>' +
    ["Auto|Best fit for the task","Fast|Speed first","Reasoning|More deliberate","Deep Research|Research + citations","Creative|Image and video aware"]
      .map((x) => {
        const pair = x.split("|");
        return '<button data-model="' + pair[0] + '"><b>' + pair[0] + '</b><small>' + pair[1] + '</small></button>';
      }).join("");
  document.body.appendChild(p);
  const r = anchor.getBoundingClientRect();
  p.style.left = r.left + "px";
  p.style.top = Math.min(innerHeight-250,r.bottom+6) + "px";
  p.querySelectorAll("[data-model]").forEach((b) => b.onclick = () => {
    selectedModel = b.dataset.model;
    localStorage.setItem("angel.model",selectedModel);
    p.remove();
    showScreen("chat");
  });
}

function media() {
  $("#page").innerHTML =
    '<section class="a5-page mediaPage">' +
      '<div class="a5-mediahead"><div><div class="a5-eyebrow">CREATIVE WORKSPACE</div><h1>Media Studio</h1><p>Images and video creation in one calm workspace. Guest creations stay temporary.</p></div><button class="a5-outline" id="media-login">' + (signedIn() ? "Saved workspace" : "Log in to save") + '</button></div>' +
      '<div class="a5-card">' +
        '<div class="a5-mediatabs"><button class="active" data-media-tab="images">Images</button><button data-media-tab="videos">Videos</button></div>' +
        '<div class="a5-media-search"><span>' + ico("search") + '</span><input id="mediaPrompt" placeholder="Describe what you want to create…"><button id="mediaGenerate">Create</button></div>' +
        '<div class="a5-media-section"><div class="a5-media-sectionhead"><strong>Trending</strong><button class="a5-link">View all →</button></div><div class="a5-media-grid">' +
          ["Nature Vibes","Abstract Art","Product Shot"].map((x,i) => '<button class="a5-media-tile" data-media-prompt="' + esc(["misty mountain lake at sunrise, premium editorial","abstract purple glass forms, minimal luxury","premium product photo on a soft studio set"][i]) + '"><div class="a5-art a' + (i+1) + '"></div><b>' + x + '</b><small>Image</small></button>').join("") +
        '</div></div>' +
        '<div class="a5-media-section"><div class="a5-media-sectionhead"><strong>Popular Templates</strong><button class="a5-link">View all →</button></div><div class="a5-media-grid">' +
          ["Social Media","Wallpaper","Banner"].map((x,i) => '<button class="a5-media-tile" data-media-prompt="' + esc(["clean social campaign collage","cinematic purple mountain wallpaper","elegant lifestyle banner with natural light"][i]) + '"><div class="a5-art b' + (i+1) + '"></div><b>' + x + '</b><small>Image</small></button>').join("") +
        '</div></div>' +
      '</div>' +
      '<div id="mediaResult" class="a5-mediaresult"></div>' +
    '</section>';

  $("#media-login")?.addEventListener("click",() => signedIn() ? toast("Your media stays in this account.") : openAuth("save media"));
  $("#mediaGenerate")?.addEventListener("click",generateFromMedia);
  $("#mediaPrompt")?.addEventListener("keydown",(e) => { if(e.key === "Enter"){e.preventDefault();generateFromMedia();} });
  $$("#page [data-media-prompt]").forEach((b) => b.onclick = () => {
    $("#mediaPrompt").value = b.dataset.mediaPrompt;
    generateFromMedia();
  });

  $$("#page [data-media-tab]").forEach((b) => b.onclick = () => {
    $$("#page [data-media-tab]").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    if (b.dataset.mediaTab === "videos") toast("Video creation UI is ready for the media provider connection.");
  });

  window.removeEventListener("angel-media-generated", onMediaGenerated);
  window.addEventListener("angel-media-generated", onMediaGenerated);
}

async function generateFromMedia() {
  const prompt = $("#mediaPrompt")?.value?.trim();
  if (!prompt) return toast("Describe what you want to create.");
  const button = $("#mediaGenerate");
  if (button) { button.disabled = true; button.textContent = "Creating…"; }
  try {
    await window.AngelCore?.generateImage?.(prompt);
  } catch (error) {
    toast(error?.message || "Image generation failed.");
  } finally {
    if (button) { button.disabled = false; button.textContent = "Create"; }
  }
}

function onMediaGenerated(event) {
  const result = $("#mediaResult");
  if (!result || !event.detail?.src) return;
  result.innerHTML =
    '<div class="a5-generated"><div><span class="a5-eyebrow">TEMPORARY PREVIEW</span><strong>' + (signedIn() ? "Image created" : "Image created · not saved") + '</strong></div>' +
    '<img src="' + event.detail.src + '" alt="Generated image">' +
    '<div class="a5-generated-actions"><button id="mediaUse">Use in chat</button><a href="' + event.detail.src + '" download="angel-image.png">Download</a></div></div>';
  $("#mediaUse").onclick = () => {
    showScreen("chat");
    $("#message").value = "I created an image: " + event.detail.prompt;
    $("#message").focus();
  };
}

function assistantsPage() {
  $("#page").innerHTML =
    '<section class="a5-page"><h1>Assistants</h1><p class="intro">Purpose-built companions for focused work, reusable workflows and specialist jobs.</p>' +
      '<div class="a5-grid3">' +
        [["Research Scout","Cross-check sources and build concise research briefs."],["Build Coach","Plan, code, test and review projects with you."],["Memory Steward","Keep useful long-term preferences intentional."],["Visual Analyst","Understand screenshots, images and documents."],["Custom Assistant","Create and publish one from Agent Lab."],["Agent Lab","Build, test and publish assistants."]]
          .map((x) => '<button class="a5-media" data-assistant="' + esc(x[0]) + '"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></button>').join("") +
      '</div>' +
    '</section>';
  $$("#page [data-assistant]").forEach((b) => b.onclick = () => window.dispatchEvent(new Event("angel-agent-lab-open")));
}

function simple(title, intro, rows, protectedPage=true) {
  if (protectedPage && !signedIn()) return openAuth(title);
  $("#page").innerHTML =
    '<section class="a5-page"><div class="a5-eyebrow">ANGEL WORKSPACE</div><h1>' + esc(title) + '</h1><p class="intro">' + esc(intro) + '</p><div class="a5-simplegrid">' +
      rows.map((r) => '<div class="a5-simple"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span><b>›</b></div>').join("") +
    '</div></section>';
}

function morePage() {
  const cat = (title,items) =>
    '<section class="a5-category"><h3>' + title + '</h3><div class="a5-toolgrid">' +
      items.map((x) => '<button data-moretool="' + x[0] + '" data-protected="' + x[1] + '">' + ico(x[2]) + '<span>' + x[0] + '</span><b>›</b></button>').join("") +
    '</div></section>';

  $("#page").innerHTML =
    '<section class="a5-page"><div class="a5-eyebrow">MORE TOOLS</div><h1>More</h1><p class="intro">The wider Angel workspace, grouped so the main interface stays calm.</p>' +
      cat("Productivity",[["Schedule",true,"schedule"],["Projects",true,"project"],["Library",true,"library"],["Media Studio",false,"media"]]) +
      cat("AI & Assistants",[["Agent Lab",true,"agent"],["Assistants",true,"assistant"],["Marketplace",true,"more"],["Charts",true,"chart"]]) +
      cat("Knowledge",[["Memory",true,"memory"],["Multimodal",false,"image"],["Skills",false,"agent"]]) +
      cat("Integrations",[["Plugins",true,"plug"],["Connections",true,"plug"]]) +
      cat("Security",[["Secrets",true,"lock"],["Recycle Bin",true,"trash"]]) +
    '</section>';

  $$("#page [data-moretool]").forEach((b) => b.onclick = () => {
    const n = b.dataset.moretool;
    if (b.dataset.protected === "true" && !handleProtected(n)) return;
    showTool(n,true);
  });
}

function showScreen(s,chatId=null) {
  screen = s;
  closePops();
  $$("[data-nav]").forEach((b) => b.classList.toggle("active",b.dataset.nav === s));
  document.body.classList.remove(
    "a5-home","a5-chat","a5-projects","a5-schedule","a5-library","a5-media","a5-assistants","a5-profilePage","a5-settings","a5-recycle","a5-more"
  );
  document.body.classList.add("a5","a5-" + s);

  if (s === "home") home();
  else if (s === "chat") chat(chatId);
  else if (s === "media") media();
  else if (s === "assistants") assistantsPage();
  else if (s === "projects") simple("Projects","Keep ongoing builds, coding, research and long-running work organized.",[["Angel website","UI redesign · active"],["Agent Lab","Agent workflows · active"],["Music learning app","Product scope · active"],["School ICT tools","Teaching utilities · active"]]);
  else if (s === "schedule") simple("Schedule","Reminders, recurring work and things Angel should handle later.",[["Angel UI review","Pending · tonight"],["Weekly project review","Every Friday · recurring"],["Research digest","Every Monday · recurring"],["Follow-up task","Tomorrow · scheduled"]]);
  else if (s === "library") simple("Library","Documents, generated assets and reference material live here.",[["Agent Lab capability review","PDF · 2.4 MB"],["AI assistant comparison","Document · 840 KB"],["Angel source package","ZIP · project files"],["Generated media","Collection · recent"]]);
  else if (s === "profile") simple("Profile","Your identity, plan and account settings.",[["Name",userName()],["Plan","Free plan"],["Account","Protected by Supabase Auth"],["Sync","Saved across devices"]]);
  else if (s === "settings") simple("Settings","Appearance and interaction controls for Angel.",[["Theme","Light · Dark · Device"],["Sidebar","Expanded · collapsed"],["Voice","Dictation · voice mode"],["Visual mode","Camera · screen sharing"]]);
  else if (s === "recycle") simple("Recycle Bin","Deleted chats are separated from active conversations until removed.",[["Deleted chats","Stored separately"],["Restore","Available per item"],["Empty bin","Permanent deletion requires confirmation"]]);
  else if (s === "more") morePage();

  syncNav();
  syncBottom();
  syncComposer();
  if (isMobile()) $("#sidebar")?.classList.remove("a5-mobile-open");
  $("#drawerShade")?.classList.remove("open");
}

function syncNav() {
  $$(".a5-navitem").forEach((b) => b.classList.toggle("active",b.dataset.nav === screen));
  $$(".a5-railbtn").forEach((b) => b.classList.toggle("active",b.dataset.nav === screen));
}

function renderBottom() {
  let n = $("#a5-bottomnav");
  if (!n) {
    n = document.createElement("nav");
    n.id = "a5-bottomnav";
    n.className = "a5-bottomnav";
    n.innerHTML =
      '<button data-b="home">' + ico("home") + '<span>Home</span></button>' +
      '<button data-b="chat">' + ico("chat") + '<span>Chats</span></button>' +
      '<button data-b="projects">' + ico("project") + '<span>Projects</span></button>' +
      '<button data-b="agent">' + ico("agent") + '<span>Agent Lab</span></button>' +
      '<button data-b="more">' + ico("more") + '<span>More</span></button>';
    document.body.appendChild(n);
    $$("[data-b]").forEach((b) => b.onclick = () => handleNav(b.dataset.b));
  }
}

function syncBottom() {
  const selected = screen === "agent" ? "agent" : screen === "chat" ? "chat" : screen === "projects" ? "projects" : screen === "more" ? "more" : "home";
  $$("#a5-bottomnav [data-b]").forEach((b) => b.classList.toggle("active",b.dataset.b === selected));
}

function renderComposer() {
  const bar = $("#composerBar");
  if (!bar || bar.dataset.ready === "1") return;
  bar.dataset.ready = "1";

  const add = '<button class="a5-pill" id="a5-add">+ Add</button>';
  const dictate = '<button class="a5-pill" id="a5-dictate">' + ico("mic") + '<span>Dictate</span></button>';
  const voice = '<button class="a5-pill" id="a5-voice">' + ico("voice") + '<span>Voice</span></button>';
  const visual = '<button class="a5-pill" id="a5-visual">' + ico("video") + '<span>Visual mode</span></button>';
  const thinkBtn = '<button class="a5-pill" id="a5-think-composer">' + ico("agent") + '<span>Think</span></button>';
  const modelBtn = '<button class="a5-pill" id="a5-model-composer">Model: ' + esc(selectedModel) + '</button>';

  bar.innerHTML =
    '<div class="a5-composer-left">' +
      add + dictate + voice + visual + thinkBtn + modelBtn +
    '</div>';

  $("#a5-add").onclick = () => {
    const p = document.createElement("div");
    p.className = "a5-pop open";
    p.innerHTML =
      '<div class="a5-poptitle">Add to this chat</div>' +
      '<button data-add="image">' + ico("image") + '<span>Image</span></button>' +
      '<button data-add="file">' + ico("doc") + '<span>File</span></button>' +
      '<button data-add="media">' + ico("media") + '<span>Media Studio</span></button>' +
      '<button data-add="agent">' + ico("agent") + '<span>Agent task</span></button>';
    document.body.appendChild(p);
    const r = $("#a5-add").getBoundingClientRect();
    p.style.left = r.left + "px";
    p.style.bottom = "92px";
    p.querySelectorAll("[data-add]").forEach((b) => b.onclick = () => {
      p.remove();
      if (b.dataset.add === "file") $("#fileInput")?.click();
      if (b.dataset.add === "media") showScreen("media");
      if (b.dataset.add === "agent") { $("#message").value = "Run an agent task: "; $("#message").focus(); }
      if (b.dataset.add === "image") { showScreen("media"); $("#message").value = "Create an image: "; $("#message").focus(); }
    });
  };

  $("#a5-dictate").onclick = () => window.AngelCore?.toggleMic?.();
  $("#a5-voice").onclick = () => $("#voicePanel")?.classList.add("open");
  $("#a5-visual").onclick = () => visualMode();
  $("#a5-think-composer").onclick = () => {
    think = !think;
    localStorage.setItem("angel.think",think ? "1" : "0");
    $("#a5-think-composer").classList.toggle("active",think);
    toast(think ? "Think enabled" : "Think disabled");
  };
  $("#a5-model-composer").onclick = () => openModelMenu($("#a5-model-composer"));
}

async function visualMode() {
  closePops();
  const sheet = document.createElement("section");
  sheet.className = "a5-video-sheet open";
  sheet.innerHTML =
    '<div class="a5-sheethead"><div><div class="a5-eyebrow">VISUAL MODE</div><h3>See with Angel</h3></div><button id="a5-vclose">×</button></div>' +
    '<button class="a5-video-option" id="a5-vcamera">' + ico("video") + '<span><b>Live camera</b><small>Use your camera as Angel’s visual feed.</small></span><b>›</b></button>' +
    '<button class="a5-video-option" id="a5-vscreen">' + ico("device") + '<span><b>Share screen</b><small>Let Angel see what is on your screen.</small></span><b>›</b></button>';
  document.body.appendChild(sheet);
  $("#a5-vclose").onclick = () => sheet.remove();
  $("#a5-vcamera").onclick = async () => {
    try {
      const feed = await navigator.mediaDevices.getUserMedia({video:true});
      feed.getTracks().forEach((track) => track.stop());
      toast("Camera access granted");
      sheet.remove();
    } catch {
      toast("Camera access was not granted");
    }
  };
  $("#a5-vscreen").onclick = async () => {
    try {
      const feed = await navigator.mediaDevices.getDisplayMedia({video:true});
      feed.getTracks().forEach((track) => track.stop());
      toast("Screen access granted");
      sheet.remove();
    } catch {
      toast("Screen access was not granted");
    }
  };
}

function renderAuth(mode = false) {
  const host = $("#authView");
  if (!host) return;

  const remembered = lastAccountName();
  const defaultTab = localStorage.getItem("angel.authTab") || "signin";

  host.innerHTML =
    '<div class="authKicker">YOUR AI, YOUR WAY</div>' +
    '<h1 id="authTitle">Welcome to Angel</h1>' +
    '<p class="authIntro">Sign in to keep conversations, projects, media and memory across devices. Chat and Media Studio remain available as a guest.</p>' +
    (remembered
      ? '<button class="rememberedAccount" id="rememberedAccount"><span class="rememberAvatar">' + esc(remembered.split(/\s+/).map((x) => x[0]).join("").slice(0,2)) + '</span><span><small>Continue as</small><strong>' + esc(remembered) + '</strong></span><b>›</b></button><div class="authOr"><span>or use another account</span></div>'
      : '') +
    '<div class="authTabs"><button data-auth-tab="signin" class="' + (defaultTab === "signin" ? "active" : "") + '">Sign in</button><button data-auth-tab="signup" class="' + (defaultTab === "signup" ? "active" : "") + '">Create account</button></div>' +
    '<div id="authFields"></div>' +
    '<div id="authError" class="authError"></div>' +
    '<button class="authGuest" id="authGuest">Continue as guest</button>';

  $$("#authView [data-auth-tab]").forEach((b) => b.onclick = () => {
    localStorage.setItem("angel.authTab",b.dataset.authTab);
    renderAuth();
  });
  $("#rememberedAccount")?.addEventListener("click",() => window.AngelCore?.signInWithGoogle?.());

  renderAuthFields(defaultTab);
}

function renderAuthFields(tab) {
  const host = $("#authFields");
  if (!host) return;

  if (tab === "signup") {
    host.innerHTML =
      '<button class="googleAuth" id="googleAuth">' + ico("shield") + '<span>Continue with Google</span></button>' +
      '<div class="authDivider"><span>or</span></div>' +
      '<label>Full name<input id="authName" autocomplete="name" placeholder="Your name"></label>' +
      '<label>Email<input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com"></label>' +
      '<label>Password<input id="authPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters"></label>' +
      '<button class="authPrimary" id="authSubmit">Create account</button>';
  } else {
    host.innerHTML =
      '<button class="googleAuth" id="googleAuth">' + ico("shield") + '<span>Continue with Google</span></button>' +
      '<div class="authDivider"><span>or</span></div>' +
      '<label>Email<input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com"></label>' +
      '<label>Password<input id="authPassword" type="password" autocomplete="current-password" placeholder="Your password"></label>' +
      '<button class="authPrimary" id="authSubmit">Sign in</button>' +
      '<button class="authSecondary" id="forgotPassword">Forgot password?</button>';
  }

  $("#googleAuth").onclick = () => window.AngelCore?.signInWithGoogle?.();
  $("#authSubmit").onclick = submitAuth;
  $("#forgotPassword")?.addEventListener("click",() => toast("Password reset can be added from the account security flow."));
  $("#authGuest").onclick = () => {
    window.AngelCore?.closeModal?.();
    toast("Guest mode active");
  };
}

async function submitAuth() {
  const button = $("#authSubmit");
  const error = $("#authError");
  const tab = document.querySelector(".authTabs .active")?.dataset.authTab || "signin";
  const email = $("#authEmail")?.value?.trim();
  const password = $("#authPassword")?.value || "";
  const name = $("#authName")?.value?.trim() || "";

  if (!email || !password || (tab === "signup" && !name)) {
    if (error) error.textContent = "Complete the required fields.";
    return;
  }

  if (button) { button.disabled = true; button.textContent = tab === "signup" ? "Creating…" : "Signing in…"; }
  if (error) error.textContent = "";

  try {
    if (tab === "signup") {
      await window.AngelCore?.signUpWithPassword?.(name,email,password);
      if (window.AngelCore?.getSession?.()) window.AngelCore.closeModal();
      else if (error) error.textContent = "Account created. Check your email to confirm it.";
    } else {
      await window.AngelCore?.signInWithPassword?.(email,password);
      window.AngelCore?.closeModal?.();
    }
  } catch (e) {
    if (error) error.textContent = e?.message || "Authentication failed.";
  } finally {
    if (button) { button.disabled = false; button.textContent = tab === "signup" ? "Create account" : "Sign in"; }
  }
}

function syncComposer() {
  const visible = ["home","profile","settings","more","recycle"].includes(screen) ? false : true;
  document.body.classList.toggle("a5-hidecomposer",!visible);
}

function init() {
  if (!$("#sidebar") || !$("#page")) return setTimeout(init,80);

  document.body.classList.add("a5");
  if (!isMobile() && (isTablet() || localStorage.getItem("angel.sidebarCollapsed") === "1")) {
    document.body.classList.add("a5-collapsed");
  }

  setTheme(themeMode);
  renderSidebar();
  buildTop();
  renderBottom();
  renderComposer();
  showScreen("home");

  window.AngelShell = {
    showScreen,
    handleNav,
    renderSidebar,
    openToolPanel,
    closeAuth:() => window.AngelCore?.closeModal?.()
  };

  document.addEventListener("angel-auth-changed",() => {
    renderSidebar();
    buildTop();
    loadChats();
    showScreen(screen === "chat" ? "chat" : "home");
  });

  document.addEventListener("angel-open-auth",(e) => {
    renderAuth(e.detail?.reason || "");
  });

  window.addEventListener("resize",() => {
    if (innerWidth > 1100) $("#sidebar")?.classList.remove("a5-mobile-open");
    if (innerWidth <= 760 && document.body.classList.contains("a5-collapsed")) document.body.classList.remove("a5-collapsed");
  });

  window.addEventListener("click",(e) => {
    if (e.target.closest(".a5-pop") || e.target.closest(".a5-toolpanel") || e.target.closest(".a5-profilepanel") || e.target.closest(".a5-topbtn")) return;
    closePops();
  });

  setInterval(() => {
    const p = document.querySelector(".a5-quote p");
    if (p) {
      const quotes = [
        "“The best tool disappears into the work.”",
        "“Make useful things beautifully.”",
        "“Good systems reduce friction.”",
        "“Ideas become real through iteration.”"
      ];
      p.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
  },42000);
}

setTimeout(init,100);
