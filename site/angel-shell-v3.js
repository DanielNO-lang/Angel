import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL="https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY="sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const sb5=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const path={
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
camera:"M5 8h3l1.4-2h5.2L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm7 2.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
brain:"M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v2a3 3 0 0 0 3 3h2V4zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v2a3 3 0 0 1-3 3h-2V4zM9 8h6M8 12h8M9 16h6",
send:"M4 12 21 5l-5 14-3.5-5.5zM12.5 13.5 21 5",
plus:"M12 5v14M5 12h14",
moon:"M20 15.5A7.5 7.5 0 1 1 8.5 4 6 6 0 0 0 20 15.5",
sun:"M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10",
device:"M4 5h16v12H4zM9 21h6M12 17v4",
lock:"M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
trash:"M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13",
chart:"M5 19V9M12 19V5M19 19v-8",
memory:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0-8-8zm0 4v4l3 2",
plug:"M8 12h8M10 5v4m4-4v4M7 13a5 5 0 0 0 10 0",
image:"M4 5h16v14H4zM8 13l2-2 2 2 2-3 4 5H6z",
doc:"M7 3h7l4 4v14H7zM14 3v5h5",
agent:"M12 4l1.8 4.6L19 10.5l-5.2 1.8L12 17l-1.8-4.7L5 10.5z",
search:"M9 3h6v3h2v7l-2 2v6h-4v-6l-2-2V6h2zM10 6h4M12 14v4",
keyboard:"M3 6h18v12H3zM6 9h2m2 0h2m2 0h2m2 0h2M6 13h10m2 0h0"
};
const ico=n=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(path[n]||path.more)+'"></path></svg>';

let screen="home";
let chatData=[];
let pinned=new Set(JSON.parse(localStorage.getItem("angel.pinned")||"[]"));
let archived=new Set(JSON.parse(localStorage.getItem("angel.archived")||"[]"));
let deleted=new Set(JSON.parse(localStorage.getItem("angel.deleted")||"[]"));
let locked=new Set();
let secretUnlocked=false;
let themeMode=localStorage.getItem("angel.theme.mode")||localStorage.getItem("angel.theme")||"dark";
let selectedModel=localStorage.getItem("angel.model")||"Auto";
let think=localStorage.getItem("angel.think")==="1";
let signedIn=!!window.AngelCore?.getSession?.();

const isMobile=()=>innerWidth<=760;
const toast=t=>{const x=$("#toast");if(!x)return;x.textContent=t;x.classList.add("show");clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove("show"),2200)};
const userName=()=>window.AngelCore?.getDisplayName?.()||localStorage.getItem("angel.displayName")||"there";
const initials=n=>String(n).trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"A";
const persist=(k,s)=>localStorage.setItem(k,JSON.stringify([...s]));
const requireAuth=()=>{if(signedIn)return true;window.AngelCore?.openModal?.();return false};

function setTheme(m){
  themeMode=m;localStorage.setItem("angel.theme.mode",m);
  const resolved=m==="device"?(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"):m;
  localStorage.setItem("angel.theme",resolved);
  document.documentElement.dataset.theme=resolved;
  refreshTheme();
}
function refreshTheme(){$$(".a5-theme").forEach(b=>b.classList.toggle("active",b.dataset.theme===themeMode))}
function closePops(){$$(".a5-pop.open,.a5-popmenu.open,.a5-profile.open,.a5-video-sheet.open").forEach(x=>x.classList.remove("open"))}

function toggleSidebar(){
  if(isMobile()){
    const open=$("#sidebar")?.classList.contains("a5-mobile-open");
    if(open){$("#sidebar")?.classList.remove("a5-mobile-open");return}
    document.body.classList.remove("a5-collapsed");localStorage.setItem("angel.sidebarCollapsed","0");
    renderSidebar();$("#sidebar")?.classList.add("a5-mobile-open");return;
  }
  const collapsed=document.body.classList.toggle("a5-collapsed");
  localStorage.setItem("angel.sidebarCollapsed",collapsed?"1":"0");
  renderSidebar();
}

function navBtn(id,label,iconName){return '<button class="a5-navitem" data-nav="'+id+'"><span class="a5-navicon">'+ico(iconName)+'</span><span class="a5-navlabel">'+label+'</span></button>'}
function renderSidebar(){
  const guest=!signedIn;
  const collapsed=document.body.classList.contains("a5-collapsed");
  const tools=guest?
    [["media","Media Studio","media"],["more","More","more"]]:
    [["agent","Agent Lab","agent"],["projects","Projects","project"],["schedule","Schedule","schedule"],["library","Library","library"],["media","Media Studio","media"],["assistants","Assistants","assistant"],["more","More","more"]];
  const expanded='<div class="a5-expanded">'+
    '<div class="a5-brandrow"><button class="a5-brand" id="a5-brand" title="Angel home"><img src="/angel-logo.svg" alt="Angel"></button><div class="a5-brand-name">Angel</div><button class="a5-collapse" id="a5-collapse" title="Collapse sidebar">‹</button></div>'+
    '<div class="a5-searchrow" id="a5-searchrow"><button class="a5-searchbutton" id="a5-searchbutton" title="Search chats">'+ico("search")+'</button><input id="a5-searchinput" class="a5-searchinput" placeholder="Search chats…" autocomplete="off"></div>'+
    '<button class="a5-newchat" data-nav="chat"><span class="a5-plus">＋</span><span>New chat</span></button>'+
    navBtn("home","Home","home")+
    '<div class="a5-scroll"><div class="a5-section">Tools</div>'+
    tools.map(x=>navBtn(x[0],x[1],x[2])).join("")+
    '<div class="a5-section">Recents</div><div class="a5-chatlist" id="a5-recents"></div>'+
    '<button class="a5-subtoggle" data-toggle="pinned"><span>Pinned</span><b>›</b></button><div id="a5-pinned" class="a5-chatlist"></div>'+
    '<button class="a5-subtoggle" data-toggle="archived"><span>Archived</span><b>›</b></button><div id="a5-archived" class="a5-chatlist"></div></div>'+
    '<div class="a5-quote"><p>'+["“Make useful things beautifully.”","“A good day can start small.”","“Keep the useful. Lose the noise.”","“Make room for the interesting parts.”"][Math.floor(Math.random()*4)]+'</p></div>'+
    '<div class="a5-profile" id="a5-profile"><button class="a5-profilebtn" id="a5-profilebtn"><span class="a5-avatar">'+initials(userName())+'</span><span style="min-width:0"><span class="a5-name">'+esc(userName())+'</span><span class="a5-plan">'+(guest?"Guest":"Free plan")+'</span></span><span style="margin-left:auto;color:var(--a5-faint)">›</span></button><div class="a5-profilemenu" id="a5-profilemenu"></div><div class="a5-helppanel" id="a5-helppanel"></div></div>'+
    '</div>';
  const railTools=guest?[["chat","chat"],["home","home"],["media","media"],["more","more"]]:[["chat","chat"],["home","home"],["agent","agent"],["projects","project"],["schedule","schedule"],["library","library"],["media","media"],["assistants","assistant"],["more","more"]];
  const rail='<div class="a5-collapsed"><button class="a5-collapsed-logo" id="a5-rail-open" title="Open sidebar"><img src="/angel-logo.svg" alt="Angel"></button><div class="a5-rail">'+
    railTools.map(x=>'<button class="a5-railbtn" data-nav="'+x[0]+'" title="'+x[0]+'">'+ico(x[1])+'</button>').join("")+
    '</div><div class="a5-railspacer"></div><button class="a5-railavatar" id="a5-rail-profile">'+initials(userName())+'</button></div>'+
    '<div class="a5-hoverpanel">'+expanded+'</div>';
  $("#sidebar").innerHTML=collapsed?rail:expanded;
  bindSidebar();paintChats();
}

function bindSidebar(){
  $("#a5-collapse")?.addEventListener("click",toggleSidebar);
  $("#a5-rail-open")?.addEventListener("click",()=>{document.body.classList.remove("a5-collapsed");localStorage.setItem("angel.sidebarCollapsed","0");renderSidebar()});
  $("#a5-brand")?.addEventListener("click",()=>showScreen("home"));
  $("#a5-searchbutton")?.addEventListener("click",()=>{const r=$("#a5-searchrow");r.classList.add("open");$("#a5-searchinput")?.focus();showSearch("")});
  $("#a5-searchinput")?.addEventListener("input",e=>showSearch(e.target.value));
  $("#a5-profilebtn")?.addEventListener("click",openProfile);
  $("#a5-rail-profile")?.addEventListener("click",openProfileFromRail);
  $$("[data-nav]").forEach(b=>b.addEventListener("click",()=>handleNav(b.dataset.nav)));
  $$(".a5-subtoggle").forEach(b=>b.addEventListener("click",()=>{const t=b.dataset.toggle,box=$("#a5-"+t),hidden=box.classList.contains("a5-hidden");box.classList.toggle("a5-hidden",!hidden);b.querySelector("b").textContent=hidden?"⌄":"›"}));
}

function handleNav(n){
  if(n==="home")return showScreen("home");
  if(n==="chat")return window.AngelCore?.newChat?.()||showScreen("chat");
  if(n==="media")return showScreen("media");
  if(n==="more")return showScreen("more");
  if(n==="agent")return openAgentLab();
  if(!requireAuth())return;
  if(n==="projects")return showScreen("projects");
  if(n==="schedule")return showScreen("schedule");
  if(n==="library")return showScreen("library");
  if(n==="assistants")return showScreen("assistants");
}

function paintChats(){
  const a=$("#a5-recents"),p=$("#a5-pinned"),r=$("#a5-archived");
  if(!a)return;
  const visible=x=>!deleted.has(x.id)&&!locked.has(x.id);
  const row=x=>'<div class="a5-chatrow" data-chat="'+esc(x.id)+'" role="button" tabindex="0"><span class="a5-chat-icon">'+ico("chat")+'</span><span class="a5-chat-title">'+esc(x.title)+'</span><button type="button" class="a5-chat-more" data-more="'+esc(x.id)+'">···</button></div>';
  a.innerHTML=chatData.filter(x=>visible(x)&&!pinned.has(x.id)&&!archived.has(x.id)).slice(0,10).map(row).join("")||'<div class="a5-notice">'+(signedIn?"No recent chats yet.":"Your recent chats will appear here while you are here.")+'</div>';
  p.innerHTML=chatData.filter(x=>visible(x)&&pinned.has(x.id)).map(row).join("")||'<div class="a5-notice">Nothing pinned.</div>';
  r.innerHTML=chatData.filter(x=>visible(x)&&archived.has(x.id)).map(row).join("")||'<div class="a5-notice">Nothing archived.</div>';
  $$("#sidebar [data-chat]").forEach(b=>b.addEventListener("click",e=>{if(e.target.closest("[data-more]"))return;showScreen("chat",b.dataset.chat)}));
  $$("#sidebar [data-more]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openChatMenu(b.dataset.more,b)}));
}

async function loadLocked(){
  locked=new Set();
  if(!signedIn)return;
  try{
    const s=(await sb5.auth.getSession()).data.session;
    const ids=s?.user?.user_metadata?.angel_locked_chats||[];
    locked=new Set(Array.isArray(ids)?ids:[]);
  }catch{}
}
async function loadChats(){
  chatData=[];
  if(signedIn){
    try{
      const s=(await sb5.auth.getSession()).data.session;
      if(s){
        const r=await sb5.from("conversations").select("id,title,updated_at").eq("user_id",s.user.id).order("updated_at",{ascending:false}).limit(40);
        chatData=(r.data||[]).filter(x=>!deleted.has(x.id)).map(x=>({id:x.id,title:x.title||"Conversation"}));
      }
    }catch{}
  }
  await loadLocked();paintChats();
}

async function updateUserMeta(patch){
  const client=window.AngelCore?.supabase||sb5;
  const result=await client.auth.updateUser({data:patch});
  if(result.error)throw result.error;
  await loadLocked();return result.data.user;
}

function openChatMenu(id,btn){
  closePops();
  const m=document.createElement("div");m.className="a5-pop open";
  m.innerHTML='<div class="a5-poptitle">Chat options</div>'+
    ["share:Share chat","rename:Rename chat","pin:Pin / unpin chat","lock:Lock chat","archive:Archive chat","delete:Move to Recycle Bin"].map(x=>{const[a,b]=x.split(":");return '<button data-cm="'+a+'" class="'+(a==="delete"?"danger":"")+'">'+b+'</button>'}).join("");
  document.body.appendChild(m);
  const r=btn.getBoundingClientRect();m.style.left=Math.max(8,r.right-245)+"px";m.style.top=Math.min(innerHeight-235,r.bottom+4)+"px";
  m.querySelectorAll("[data-cm]").forEach(b=>b.onclick=async()=>{await chatAction(id,b.dataset.cm);m.remove()});
}

async function chatAction(id,a){
  if(a==="pin"){pinned.has(id)?pinned.delete(id):pinned.add(id);persist("angel.pinned",pinned);paintChats();return}
  if(a==="archive"){archived.add(id);persist("angel.archived",archived);paintChats();return}
  if(a==="delete"){deleted.add(id);persist("angel.deleted",deleted);paintChats();toast("Moved to Recycle Bin");return}
  if(a==="share"){navigator.clipboard?.writeText(location.origin+"/?chat="+encodeURIComponent(id));toast("Chat link copied");return}
  if(a==="rename"){
    const current=chatData.find(x=>x.id===id);const title=prompt("Rename this chat",current?.title||"Conversation");if(!title?.trim())return;
    if(signedIn){try{await sb5.from("conversations").update({title:title.trim()}).eq("id",id)}catch{}}
    if(current)current.title=title.trim();paintChats();return;
  }
  if(a==="lock")return lockChat(id);
}

async function hashValue(value,salt){
  const data=new TextEncoder().encode(salt+":"+value);
  const hash=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
const secretMeta=()=>window.AngelCore?.getUser?.()?.user_metadata?.angel_secret||null;

async function setSecretPasscode(){
  if(!signedIn)return requireAuth();
  const p1=prompt("Create a Secret passcode","");if(p1===null)return false;
  if(!/^\d{6,12}$/.test(p1)){toast("Use 6–12 digits.");return false}
  const p2=prompt("Confirm the passcode","");if(p1!==p2){toast("The passcodes did not match.");return false}
  const salt=crypto.getRandomValues(new Uint8Array(16)).join(".");
  const hash=await hashValue(p1,salt);
  await updateUserMeta({angel_secret:{salt,hash}});
  toast("Secret passcode saved");return true;
}
async function verifySecretPasscode(){
  const meta=secretMeta();
  if(!meta)return setSecretPasscode();
  const p=prompt("Enter your Secret passcode","");
  if(p===null)return false;
  const hash=await hashValue(p,meta.salt||"");
  if(hash!==meta.hash){toast("That passcode is not correct.");return false}
  secretUnlocked=true;toast("Secrets unlocked");return true;
}
async function lockChat(id){
  if(!requireAuth())return;
  let meta=secretMeta();
  if(!meta){const ok=await setSecretPasscode();if(!ok)return;meta=secretMeta()}
  if(!meta)return;
  const ids=new Set(Array.isArray(window.AngelCore?.getUser?.()?.user_metadata?.angel_locked_chats)?window.AngelCore.getUser().user_metadata.angel_locked_chats:[]);
  ids.add(id);
  await updateUserMeta({angel_locked_chats:[...ids]});
  toast("Chat moved to Secrets");paintChats();
}

async function openSecrets(){
  if(!requireAuth())return;
  const ok=await verifySecretPasscode();if(!ok)return;
  const ids=[...locked];
  const rows=chatData.filter(x=>ids.includes(x.id));
  $("#page").innerHTML='<section class="a5-page a5-secret-page"><div class="a5-secret-head"><div><h1>Secrets</h1><p class="intro">Locked conversations stay out of your normal recents.</p></div><button class="a5-outline" id="a5-lock-new">Lock a chat</button></div><div class="a5-secret-list">'+
    (rows.length?rows.map(x=>'<button class="a5-secret-row" data-secret="'+esc(x.id)+'">'+ico("lock")+'<span>'+esc(x.title)+'</span><small>Locked</small></button>').join(""):'<div class="a5-emptybox">No locked chats yet.</div>')+'</div></section>';
  $$("#page [data-secret]").forEach(b=>b.onclick=()=>showScreen("chat",b.dataset.secret));
  $("#a5-lock-new")?.addEventListener("click",()=>toast("Lock chats from the ··· menu beside a recent chat."));
}

function showSearch(term){
  let p=$("#a5-searchresults");
  if(!p){p=document.createElement("div");p.id="a5-searchresults";p.className="a5-pop open";document.body.appendChild(p)}
  const t=term.trim().toLowerCase();const rows=chatData.filter(x=>!locked.has(x.id)&&(!t||x.title.toLowerCase().includes(t)));
  p.innerHTML='<div class="a5-poptitle">Search chats</div>'+rows.slice(0,8).map(x=>'<button data-sr="'+esc(x.id)+'">'+ico("chat")+'<span style="margin-left:7px">'+esc(x.title)+'</span></button>').join("")+(rows.length?'':'<div class="a5-notice">No matching chats.</div>');
  const sr=$("#a5-searchrow")?.getBoundingClientRect();
  if(isMobile()){p.style.left="10px";p.style.top="62px";p.style.right="10px"}else{p.style.left=((sr?.right||300)+8)+"px";p.style.top=(sr?.top||90)+"px"}
  p.querySelectorAll("[data-sr]").forEach(b=>b.onclick=()=>{p.remove();showScreen("chat",b.dataset.sr)});
}

function openProfileFromRail(){document.body.classList.remove("a5-collapsed");localStorage.setItem("angel.sidebarCollapsed","0");renderSidebar();setTimeout(openProfile,0)}
function openProfile(){
  const w=$("#a5-profile"),m=$("#a5-profilemenu");if(!w||!m)return;
  w.classList.toggle("open");if(!w.classList.contains("open"))return;
  m.innerHTML='<div class="a5-menuhead"><strong>'+esc(userName())+'</strong><small>'+ (signedIn?"Free plan":"Guest session") +'</small></div>'+
    (signedIn?'<div class="a5-planbox"><b>Free plan</b><button class="a5-upgrade">Try Plus free</button></div>':'')+
    [["sun","Personalization"],["chat","Profile"],["device","Settings"]].map(x=>'<button class="a5-menubtn" data-prof="'+x[1].toLowerCase()+'">'+ico(x[0])+'<span>'+x[1]+'</span></button>').join("")+
    '<div class="a5-divider"></div><button class="a5-menubtn" data-prof="help">'+ico("more")+'<span>Help</span><span style="margin-left:auto">›</span></button>'+
    (signedIn?'<button class="a5-menubtn danger" data-prof="logout">'+ico("lock")+'<span>Log out</span></button>':'<button class="a5-menubtn" data-prof="login">'+ico("lock")+'<span>Log in</span></button>');
  m.querySelectorAll("[data-prof]").forEach(b=>b.onclick=()=>profileAction(b.dataset.prof));
}
function profileAction(a){
  if(a==="help")return openHelp();$("#a5-profile")?.classList.remove("open");
  if(a==="personalization")return openTheme();if(a==="profile")return showScreen("profile");if(a==="settings")return showScreen("settings");
  if(a==="logout")return window.AngelCore?.signOut?.();if(a==="login")return window.AngelCore?.openModal?.();
}
function openHelp(){
  const p=$("#a5-helppanel"),w=$("#a5-profile");if(!p||!w)return;
  p.innerHTML='<div class="a5-menuhead"><strong>Help & Support</strong><button id="a5-help-close" class="a5-xbtn">×</button></div>'+
    ["Help Center","Release Notes","Keyboard Shortcuts","Terms of Service","Privacy Policy","Report a Bug"].map(x=>'<button class="a5-menubtn"><span>'+x+'</span><span style="margin-left:auto">›</span></button>').join("");
  p.classList.add("open");$("#a5-help-close").onclick=()=>p.classList.remove("open");
}
function openTheme(){
  closePops();const p=document.createElement("div");p.className="a5-pop open";
  p.innerHTML='<div class="a5-poptitle">Theme</div><div class="a5-themegrid"><button class="a5-theme" data-theme="dark">'+ico("moon")+'<br>Dark</button><button class="a5-theme" data-theme="light">'+ico("sun")+'<br>Light</button><button class="a5-theme" data-theme="device">'+ico("device")+'<br>Device</button></div>';
  document.body.appendChild(p);const r=$("#a5-theme-btn")?.getBoundingClientRect()||{right:innerWidth-20,top:60};p.style.left=Math.max(8,r.right-245)+"px";p.style.top=Math.min(innerHeight-120,r.top)+"px";
  p.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{setTheme(b.dataset.theme);p.remove()});refreshTheme();
}

function buildTop(){
  const h=$(".topbar");h.className="topbar a5-topbar";
  h.innerHTML='<div class="a5-mobilebar"><button id="a5-mobilemenu" class="a5-topicon">'+ico("more")+'</button><strong>Angel</strong></div><div class="a5-topspacer"></div><div id="a5-topactions" class="a5-topactions"></div>';
  $("#a5-mobilemenu")?.addEventListener("click",toggleSidebar);syncTopbar();
}
function syncTopbar(){
  const host=$("#a5-topactions");if(!host)return;
  const guest=!signedIn;
  let html='<button class="a5-topbtn offer" id="a5-plus">Try Plus free</button>';
  if(guest)html+='<button class="a5-topbtn" id="a5-login">Log in</button><button class="a5-topbtn strongGhost" id="a5-signup">Sign up</button>';
  if(screen==="chat"&&signedIn)html+='<button class="a5-topbtn" id="a5-share">Share chat</button>';
  html+='<button class="a5-topbtn a5-topicon" id="a5-theme-btn" title="Theme">'+ico("sun")+'</button>';
  host.innerHTML=html;
  $("#a5-plus")?.addEventListener("click",()=>toast(signedIn?"Plus plans are coming together here.":"Sign in to explore Plus."));
  $("#a5-login")?.addEventListener("click",()=>window.AngelCore?.openModal?.());
  $("#a5-signup")?.addEventListener("click",()=>window.AngelCore?.openModal?.());
  $("#a5-share")?.addEventListener("click",()=>{const id=new URLSearchParams(location.search).get("chat");navigator.clipboard?.writeText(id?location.origin+"/?chat="+id:location.href);toast("Chat link copied")});
  $("#a5-theme-btn")?.addEventListener("click",openTheme);
}

function morePage(){
  const items=[["Marketplace","More assistants and reusable tools","more"],["Charts","Turn data into clear visuals","chart"],["Memory","Review what Angel remembers","memory"],["Multimodal","Work across images, files and media","image"],["Skills","Reusable ways of working","agent"],["Plugins","Extend Angel with capabilities","plug"],["Connections","Connect external services","plug"],["Secrets","Locked conversations","lock"],["Recycle Bin","Deleted chats","trash"]];
  $("#page").innerHTML='<section class="a5-page a5-more-screen"><h1>More</h1><div class="a5-moregrid">'+items.map(x=>'<button class="a5-morecard" data-moretool="'+x[0]+'"><span class="a5-moreicon">'+ico(x[2])+'</span><b>'+x[0]+'</b><small>'+x[1]+'</small></button>').join("")+'</div></section>';
  $$("#page [data-moretool]").forEach(b=>b.onclick=()=>showTool(b.dataset.moretool));
}

function showTool(t){
  if(["Marketplace","Charts","Memory","Multimodal","Skills","Plugins","Connections"].includes(t)&&!requireAuth())return;
  if(t==="Secrets")return openSecrets();
  if(t==="Recycle Bin")return showScreen("recycle");
  if(t==="Marketplace")return showScreen("marketplace");
  if(t==="Charts")return showScreen("charts");
  if(t==="Memory")return showScreen("memory");
  if(t==="Multimodal")return showScreen("multimodal");
  if(t==="Skills")return showScreen("skills");
  if(t==="Plugins")return showScreen("plugins");
  if(t==="Connections")return showScreen("connections");
}

function randomGreeting(){
  const pool=[
    "How was your day? 🌿",
    "What’s been on your mind today?",
    "How are things going?",
    "Anything interesting happen today?",
    "What are you up to?",
    "Need a little company while you work? ☕",
    "How’s your day treating you?",
    "What should we get into today?",
    "Been a busy one?",
    "What’s the mood today? ✨",
    "Anything you feel like talking about?",
    "How are you holding up today?"
  ];
  return pool[Math.floor(Math.random()*pool.length)];
}
function randomPrompt(){
  const pool=[
    "What have you been thinking about lately?",
    "What should we look at together?",
    "Need help with something?",
    "Tell me what’s on your mind.",
    "What are you working through?",
    "What would make today easier?"
  ];
  return pool[Math.floor(Math.random()*pool.length)];
}

function showScreen(s,chatId=null){
  screen=s;
  [...document.body.classList].forEach(cls=>{if(cls.startsWith("a5-"))document.body.classList.remove(cls)});
  document.body.classList.add("a5","a5-"+s);
  if(s==="home")home();
  else if(s==="chat")chat(chatId);
  else if(s==="projects")simple("Projects",[["Angel website","Active build"],["Agent Lab","Agent workflows"],["Music learning app","Parked idea"],["School ICT tools","Teaching utilities"]]);
  else if(s==="schedule")simple("Schedule",[["Angel UI review","Tonight"],["Weekly project review","Friday"],["Research digest","Monday"],["Follow-up task","Tomorrow"]]);
  else if(s==="library")simple("Library",[["Agent Lab capability review","Reference"],["AI assistant comparison","Reference"],["Angel agent scaffold","Source package"],["Generated media","Collection"]]);
  else if(s==="media")media();
  else if(s==="assistants")assistantsPage();
  else if(s==="profile")simple("Profile",[["Name",userName()],["Plan",signedIn?"Free plan":"Guest"],["Personalization","Available"],["Account security","Supabase Auth"]]);
  else if(s==="settings")simple("Settings",[["Theme","Dark, light or device"],["Sidebar","Expanded or collapsed"],["Voice","Dictation and voice mode"],["Visual","Camera or screen"]]);
  else if(s==="recycle")simple("Recycle Bin",[["Deleted chats","Moved here from chat actions"],["Restore","Available in the next pass"],["Empty bin","Permanent deletion requires confirmation"]]);
  else if(s==="marketplace")simple("Marketplace",[["Public assistants","Browse reusable assistants"],["Install","Add useful assistants to Angel"],["Publish","Create from Agent Lab"]]);
  else if(s==="charts")simple("Charts",[["Quick chart","Turn data into a visual"],["Compare","Side-by-side data views"],["Export","Use analysis results in projects"]]);
  else if(s==="memory")simple("Memory",[["Preferences","Useful things Angel can remember"],["Review","Inspect stored memories"],["Clean up","Remove what is no longer useful"]]);
  else if(s==="multimodal")simple("Multimodal",[["Images","Understand screenshots and photos"],["Documents","Read and analyze files"],["Live visual","Camera and screen context"]]);
  else if(s==="skills")simple("Skills",[["Research Scout","Search, cross-check, synthesize"],["Build Coach","Plan, code, test"],["Memory Steward","Keep memory intentional"],["Visual Analyst","Understand images and docs"]]);
  else if(s==="plugins")simple("Plugins",[["Capability catalog","Connected tools"],["Permissions","Control what tools can do"],["Health","See what is connected"]]);
  else if(s==="connections")simple("Connections",[["External services","Connect supported apps"],["Access","Manage permissions"],["Status","See active connections"]]);
  else if(s==="agent"){syncTopbar();window.dispatchEvent(new Event("angel-agent-lab-open"));return;}
  syncNav();syncBottom();syncComposer();syncTopbar();
}

function home(){
  $("#page").innerHTML='<section class="a5-home"><div class="a5-homehead"><h1 class="a5-greeting">'+randomGreeting()+'</h1><span class="a5-presence" title="Angel is here"></span></div>'+
    '<div class="a5-dashboardgrid">'+
      '<div class="a5-card"><div class="a5-cardhead"><h2>Latest News</h2></div><div class="a5-news">'+
        news("AI + technology","What’s changed recently?","latest AI technology news")+news("Agents","New ideas in browsing, automation and agents.","latest AI agents news")+news("Business + tech","Fresh headlines worth knowing.","latest technology business news")+news("Creative AI","Image, video and multimodal updates.","latest creative AI news")+
      '</div></div>'+
      '<div class="a5-card"><div class="a5-cardhead"><h2>Recent Activity</h2></div><div class="a5-activity">'+activity("Website redesign","Projects","project")+activity("Research task","Agent Lab","agent")+activity("Media work","Media Studio","image")+'</div></div>'+
    '</div>'+
    '<div class="a5-card a5-agent-home"><div class="a5-agentline"><span class="a5-actionicon">'+ico("agent")+'</span><div><b>Agent Lab</b></div><div class="a5-flex"></div><button class="a5-outline" data-nav="agent">Open</button></div></div>'+
  '</section>';
  $("#page [data-nav]")?.forEach(b=>b.onclick=()=>handleNav(b.dataset.nav));
  $("#page [data-news]")?.forEach(b=>b.onclick=()=>{showScreen("chat");const input=$("#message");if(input){input.value=b.dataset.news;input.dispatchEvent(new Event("input",{bubbles:true}));input.focus()}});
}
function news(a,b,c){return '<button class="a5-newsrow" data-news="'+esc(c)+'"><span class="a5-newsdot"></span><div><b>'+a+'</b><small>'+b+'</small></div></button>'}
function activity(a,b,i){return '<div class="a5-activityrow"><span class="a5-activityicon">'+ico(i)+'</span><div><b>'+a+'</b><small>'+b+'</small></div></div>'}

function chat(chatId=null){
  $("#page").innerHTML='<section class="a5-chatpage"><div class="a5-chatwelcome"><h1>'+randomPrompt()+'</h1><div class="a5-chips">'+
    '<button class="a5-chip" data-prompt="What’s happening in technology this week?">What’s happening in tech?</button>'+
    '<button class="a5-chip" data-prompt="Help me think through something.">Help me think this through</button>'+
    '<button class="a5-chip" data-prompt="Let’s plan something practical.">Plan something practical</button>'+
    '<button class="a5-chip" data-prompt="I have a rough idea. Help me shape it.">Shape an idea</button>'+
    '</div></div><div id="a5-chatstream" class="a5-chatstream"></div></section>';
  $$("#page [data-prompt]")?.forEach(b=>b.onclick=()=>{$("#message").value=b.dataset.prompt;$("#message").dispatchEvent(new Event("input",{bubbles:true}));$("#message").focus()});
  if(chatId&&!String(chatId).startsWith("demo-")&&window.AngelCore?.loadConversation)setTimeout(()=>window.AngelCore.loadConversation(chatId),0);
  syncComposer();
}

function assistantsPage(){
  $("#page").innerHTML='<section class="a5-page"><h1>Assistants</h1><div class="a5-grid3"><article class="a5-media"><b>Research Scout</b><span>Cross-check sources and build research briefs.</span></article><article class="a5-media"><b>Build Coach</b><span>Plan, code, test and review projects.</span></article><article class="a5-media"><b>Memory Steward</b><span>Keep useful long-term preferences clean.</span></article><article class="a5-media"><b>Visual Analyst</b><span>Understand screenshots, images and documents.</span></article><button class="a5-media" id="a5-open-agent-assistant"><b>Custom Assistant</b><span>Create one in Agent Lab.</span></button></div></section>';
  $("#a5-open-agent-assistant")?.addEventListener("click",openAgentLab);
}
function media(){
  $("#page").innerHTML='<section class="a5-page"><h1>Media Studio</h1><div class="a5-card"><div class="a5-cardhead"><h2>Images</h2></div><div class="a5-grid3">'+["Nature moodboard","Product concept","Editorial portrait","Social pack","Wallpaper series","Brand banner"].map(x=>'<button class="a5-media"><b>'+x+'</b><span>Image workflow</span></button>').join("")+'</div></div><div class="a5-card" style="margin-top:13px"><div class="a5-cardhead"><h2>Video</h2></div><div class="a5-grid3">'+["Product teaser","Explainer","Short-form story"].map(x=>'<button class="a5-media"><b>'+x+'</b><span>Video workflow</span></button>').join("")+'</div></div></section>';
}
function simple(t,rows){$("#page").innerHTML='<section class="a5-page"><h1>'+t+'</h1><div class="a5-simplegrid">'+rows.map(r=>'<div class="a5-simple"><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></div>').join("")+'</div></section>'}

function renderComposer(){
  const host=$(".composerInner");
  if(!host||host.dataset.shellReady==="1")return;
  host.dataset.shellReady="1";
  host.innerHTML=
    '<div class="a5-composer"><div class="a5-addwrap"><button id="a5-add-btn" class="a5-compose-btn a5-add-btn">'+ico("plus")+'<span>Add</span></button><div class="a5-popmenu a5-addmenu" id="a5-add-menu">'+
      [["files","Files & photos","doc"],["camera","Camera","camera"],["web","Deep research","search"],["apps","Connected apps","plug"],["library","Library","library"],["project","Project","project"],["canvas","Canvas / build","agent"],["image","Create image","image"],["video","Create video","video"],["data","Data analysis","chart"],["agent","Agent task","agent"],["skill","Skills","agent"]].map(x=>'<button class="a5-menuaction a5-additem" data-add="'+x[0]+'">'+ico(x[2])+'<span>'+x[1]+'</span></button>').join("")+
    '</div></div><textarea id="message" rows="1" placeholder="Message Angel…"></textarea><div class="a5-compose-right">'+
      '<button id="a5-think-btn" class="a5-compose-btn" title="Think">'+ico("brain")+'<span>Think</span></button>'+
      '<button id="a5-dictate-btn" class="a5-compose-btn" title="Dictate">'+ico("mic")+'<span>Dictate</span></button>'+
      '<div class="a5-visual-wrap"><button id="a5-visual-btn" class="a5-compose-btn" title="Visual">'+ico("camera")+'<span>Visual</span></button><div class="a5-popmenu a5-visual-menu" id="a5-visual-menu"><button class="a5-menuaction" data-visual="camera">'+ico("camera")+'<span>Live camera</span></button><button class="a5-menuaction" data-visual="screen">'+ico("device")+'<span>Share screen</span></button></div></div>'+
      '<button id="a5-voice-btn" class="a5-compose-btn" title="Voice">'+ico("voice")+'<span>Voice</span></button>'+
      '<div class="a5-model-wrap"><button id="a5-model-btn" class="a5-compose-btn" title="Model"><span class="a5-model-mark">A</span><span>Model</span></button><div class="a5-popmenu a5-model-menu" id="a5-model-menu">'+["Auto","Fast","Reasoning","Deep Research","Creative"].map(x=>'<button class="a5-menuaction" data-model="'+x+'"><b>'+x+'</b></button>').join("")+'</div></div>'+
      '<button id="a5-send-visible" class="a5-send-visible" title="Voice">'+ico("voice")+'</button></div></div>';
  const msg=$("#message");
  msg.addEventListener("input",()=>{
    msg.style.height="auto";
    msg.style.height=Math.min(msg.scrollHeight,170)+"px";
    updateSendState();
  });
  msg.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();window.AngelCore?.send?.()}});
  msg.addEventListener("focus",()=>document.body.classList.add("a5-composer-focus"));
  $("#a5-add-btn").onclick=()=>$("#a5-add-menu").classList.toggle("open");
  $("#a5-think-btn").onclick=()=>{think=!think;localStorage.setItem("angel.think",think?"1":"0");$("#a5-think-btn").classList.toggle("active",think);toast(think?"Think on":"Think off")};
  $("#a5-dictate-btn").onclick=()=>$("#micBtn")?.click();
  $("#a5-voice-btn").onclick=()=>$("#voicePanel")?.classList.add("open");
  $("#a5-model-btn").onclick=()=>$("#a5-model-menu").classList.toggle("open");
  $("#a5-send-visible").onclick=()=>{const filled=!!msg.value.trim();if(filled)$("#sendBtn")?.click();else $("#voicePanel")?.classList.add("open")};
  $$(".a5-additem").forEach(b=>b.onclick=()=>addAction(b.dataset.add));
  $$("#a5-visual-menu [data-visual]").forEach(b=>b.onclick=()=>visualMode(b.dataset.visual));
  $$("#a5-model-menu [data-model]").forEach(b=>b.onclick=()=>{selectedModel=b.dataset.model;localStorage.setItem("angel.model",selectedModel);$("#a5-model-menu").classList.remove("open");toast("Model: "+selectedModel)});
  updateSendState();
}
function updateSendState(){
  const filled=!!$("#message")?.value?.trim();const b=$("#a5-send-visible");if(!b)return;
  b.classList.toggle("send-mode",filled);b.title=filled?"Send":"Voice";b.innerHTML=ico(filled?"send":"voice");
}
function addAction(kind){
  $("#a5-add-menu")?.classList.remove("open");
  if(kind==="files"){if(!requireAuth())return;$("#uploadBtn")?.click();return}
  if(kind==="camera")return visualMode("camera");
  if(kind==="web"){if(!requireAuth())return;$("#researchBtn")?.click();return}
  if(kind==="apps"){if(!requireAuth())return;showScreen("connections");return}
  if(kind==="library"){if(!requireAuth())return;showScreen("library");return}
  if(kind==="project"){if(!requireAuth())return;showScreen("projects");return}
  if(kind==="canvas"){toast("Canvas / build workspace is ready in the next connection.");return}
  const input=$("#message");if(!input)return;
  if(kind==="image")input.value=(input.value?"":"")+"Create an image: ";
  if(kind==="video")input.value=(input.value?"":"")+"Create a video: ";
  if(kind==="data")input.value=(input.value?"":"")+"Analyze this data: ";
  if(kind==="agent")input.value=(input.value?"":"")+"Run an agent task: ";
  if(kind==="skill")input.value=(input.value?"":"")+"Use a skill: ";
  input.focus();input.dispatchEvent(new Event("input",{bubbles:true}));
}
async function visualMode(kind){
  const s=document.createElement("div");s.className="a5-video-sheet open";
  s.innerHTML='<h3>Visual</h3><button class="a5-video-option" id="a5-vcamera">'+ico("camera")+'<span><b>Live camera</b><small>Use your camera as Angel’s visual context.</small></span></button><button class="a5-video-option" id="a5-vscreen">'+ico("device")+'<span><b>Share screen</b><small>Let Angel see your current screen.</small></span></button><button class="a5-xbtn" id="a5-vclose">Close</button>';
  document.body.append(s);$("#a5-vclose").onclick=()=>s.remove();$("#a5-vcamera").onclick=async()=>{try{await navigator.mediaDevices.getUserMedia({video:true});toast("Camera access granted");s.remove()}catch{toast("Camera access was not granted")}};$("#a5-vscreen").onclick=async()=>{try{await navigator.mediaDevices.getDisplayMedia({video:true});toast("Screen access granted");s.remove()}catch{toast("Screen access was not granted")}};
}
function renderBottom(){
  if($("#a5-bottomnav"))return;
  const n=document.createElement("nav");n.id="a5-bottomnav";n.className="a5-bottomnav";
  n.innerHTML='<button data-b="home">'+ico("home")+'<span>Home</span></button><button data-b="chat">'+ico("chat")+'<span>Chats</span></button><button data-b="projects">'+ico("project")+'<span>Projects</span></button><button data-b="agent">'+ico("agent")+'<span>Agent Lab</span></button><button data-b="more">'+ico("more")+'<span>More</span></button>';
  $$("[data-b]").forEach(b=>b.onclick=()=>handleNav(b.dataset.b));
}
function syncBottom(){
  $$("#a5-bottomnav [data-b]").forEach(b=>{
    const target=screen==="agent"?"agent":screen==="chat"?"chat":screen==="projects"?"projects":screen==="more"?"more":"home";
    b.classList.toggle("active",b.dataset.b===target);
    if(!signedIn&&b.dataset.b==="projects")b.classList.add("a5-bottom-auth");
  });
}
function syncNav(){$$(".a5-navitem").forEach(b=>b.classList.toggle("active",b.dataset.nav===screen))}
function syncComposer(){document.body.classList.toggle("a5-hidecomposer",screen!=="chat")}
function openAgentLab(){if(!requireAuth())return;screen="agent";document.body.classList.remove("a5-home","a5-chat","a5-more");document.body.classList.add("a5","a5-agent","a5-hidecomposer");syncTopbar();syncNav();syncBottom();window.dispatchEvent(new Event("angel-agent-lab-open"))}

function init(){
  if(!$("#sidebar")||!$("#page")||!$(".composerInner"))return setTimeout(init,80);
  document.body.classList.add("a5");
  if(!isMobile()&&localStorage.getItem("angel.sidebarCollapsed")==="1")document.body.classList.add("a5-collapsed");
  setTheme(themeMode);
  renderSidebar();buildTop();renderBottom();renderComposer();loadChats();showScreen("home");
  window.AngelShell={showScreen,handleNav,renderSidebar,openToolPanel:()=>showScreen("more"),renderComposer};
  document.addEventListener("angel-auth-changed",e=>{
    signedIn=!!e.detail?.signedIn;
    if(!signedIn){chatData=[];locked=new Set();secretUnlocked=false}
    renderSidebar();syncTopbar();syncNav();syncBottom();loadChats();
  });
  document.addEventListener("angel-conversation-changed",e=>{
    const id=e.detail?.conversationId;if(!id)return;
    const title=e.detail?.title||"Conversation";
    const found=chatData.find(x=>x.id===id);
    if(found)found.title=title;else chatData.unshift({id,title});
    paintChats();
  });
  document.addEventListener("click",e=>{
    if(!e.target.closest(".a5-popmenu,.a5-add-btn,#a5-model-btn,#a5-visual-btn,.a5-profile"))closePops();
  });
  window.addEventListener("resize",()=>{if(innerWidth>760)$("#sidebar")?.classList.remove("a5-mobile-open")});
}
setTimeout(init,220);
