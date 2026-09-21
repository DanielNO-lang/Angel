import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL="https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY="sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const sb5=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

const path={
 home:"M3 10.5 12 3l9 7.5v9.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
 agent:"M12 4l1.8 4.6L19 10.5l-5.2 1.8L12 17l-1.8-4.7L5 10.5l5.2-1.9z",
 project:"M4 7h6l2 2h8v9H4z",
 schedule:"M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 12h3M8 15h6",
 library:"M5 4h13a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2zM8 4v16",
 media:"M5 6h14v12H5zM9 10h6M9 14h4",
 assistant:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-3 7 2 2 4-5",
 more:"M5 12h.01M12 12h.01M19 12h.01",
 search:"M8 3h3a2 2 0 0 1 2 2v4M8 8a4 4 0 0 0 0 8h1M13 11l3 3m-1-8a4 4 0 0 1 4 4v5m-7 0h8",
 chat:"M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
 plus:"M12 5v14M5 12h14",
 pin:"M8 4h8l-2 5 3 3-5 1v7l-2-4-2 4v-7l-5-1 3-3z",
 archive:"M4 6h16v13H4zM3 6h18v-2H3zM9 10h6",
 trash:"M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13",
 lock:"M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
 unlock:"M8 11V8a4 4 0 0 1 7.5-1.8",
 brain:"M8 7a3 3 0 0 1 5-2 3 3 0 0 1 3.5 3.8A3 3 0 0 1 16 15a3 3 0 0 1-5 1.8A3 3 0 0 1 6.5 13 3 3 0 0 1 8 7zm4-2v14M8 10h4m0 4h4",
 dictate:"M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zm-7 8a7 7 0 0 0 14 0m-7 7v3",
 visual:"M4 7h12v10H4zM16 10l4-2v8l-4-2zM8 7l2-3h3l2 3",
 voice:"M8 8.5a4 4 0 0 1 8 0v2a4 4 0 0 1-8 0zM5 11a7 7 0 0 0 14 0M12 18v3",
 send:"M3 11.2 21 4l-5.2 16-3.2-7.2zM12.2 12.8 21 4",
 model:"M7 9l5 5 5-5",
 image:"M4 5h16v14H4zM8 13l2-2 2 2 2-3 4 5H6z",
 doc:"M7 3h7l4 4v14H7zM14 3v5h5",
 data:"M5 19V9M12 19V5M19 19v-7",
 plug:"M8 12h8M10 5v4m4-4v4M7 13a5 5 0 0 0 10 0",
 canvas:"M5 5h14v14H5zM9 15l6-6M8 9h.01M16 15h.01",
 sun:"M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10",
 moon:"M20 15.5A7.5 7.5 0 1 1 8.5 4 6 6 0 0 0 20 15.5",
 device:"M4 5h16v12H4zM9 21h6M12 17v4",
 share:"M18 8a3 3 0 1 0-2.8-4A3 3 0 0 0 18 8zm-12 7a3 3 0 1 0 2.8 4A3 3 0 0 0 6 15zm12 1a3 3 0 1 0-2.8 4A3 3 0 0 0 18 16zM8.7 6.9l6.6-3.1M8.7 17.1l6.6 3.1"
};

const ico=n=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(path[n]||path.more)+'"></path></svg>';
const isMobile=()=>innerWidth<=760;
let screen="home";
let signedIn=false;
let chatData=[];
let pinned=new Set();
let archived=new Set();
let deleted=new Set();
let secretChats=new Set();
let selectedModel=localStorage.getItem("angel.model")||"Auto";
let think=localStorage.getItem("angel.think")==="1";
let themeMode=localStorage.getItem("angel.theme.mode")||"dark";
let passcodeHash="";

const guestGreetings=[
 "How was your day? 🌿",
 "What’s on your mind?",
 "How are things going?",
 "How’s your evening going? ☕",
 "What have you been up to today?",
 "Anything you feel like talking about? 🙂",
 "What’s been taking up your headspace?",
 "Need a little room to think?",
 "What are you in the mood for today?",
 "How are you feeling about the day so far?"
];
const chatGreetings=[
 "What’s on your mind?",
 "How was your day?",
 "What should we untangle together?",
 "What are you thinking about?",
 "Where should we begin?",
 "Anything you want to get off your chest?",
 "What has your attention today?"
];

function toast(t){const x=$("#toast");if(!x)return;x.textContent=t;x.classList.add("show");clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove("show"),2200)}
function userName(){return localStorage.getItem("angel.displayName")||window.AngelCore?.getDisplayName?.()||"there"}
function initials(n){return String(n).trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"A"}
function persist(k,s){localStorage.setItem(k,JSON.stringify([...s]))}
function closePops(){$$(".a5-pop.open,.a5-profile.open,.a5-toolpanel.open,.a5-video-sheet.open,.a5-addmenu.open").forEach(x=>x.classList.remove("open"))}
function setTheme(m){
 themeMode=m;localStorage.setItem("angel.theme.mode",m);
 const resolved=m==="device"?(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"):m;
 document.documentElement.dataset.theme=resolved;
 $$(".a5-theme-option").forEach(b=>b.classList.toggle("active",b.dataset.theme===m));
}
function setScreenClass(s){
 document.body.classList.add("a5");
 [...document.body.classList].filter(x=>x.startsWith("a5-")).forEach(x=>document.body.classList.remove(x));
 document.body.classList.add("a5-"+s);
}
function navButton(id,label,icon){return '<button class="a5-navitem" data-nav="'+id+'">'+ico(icon)+'<span>'+label+'</span></button>'}
function renderSidebar(){
 const collapsed=document.body.classList.contains("a5-collapsed");
 const guest=!signedIn;
 const toolScroll=guest
   ? navButton("media","Media Studio","media")+navButton("more","More","more")
   : navButton("agent","Agent Lab","agent")+navButton("projects","Projects","project")+navButton("schedule","Schedule","schedule")+navButton("library","Library","library")+navButton("media","Media Studio","media")+navButton("assistants","Assistants","assistant")+navButton("more","More","more");
 const expanded='<div class="a5-sidebar-inner">'+
   '<div class="a5-brandrow"><button class="a5-brand" id="a5-brand" title="Angel"><img src="/angel-logo.svg" alt="Angel"></button><span class="a5-brand-name">Angel</span><button class="a5-collapse" id="a5-collapse" title="Collapse sidebar">‹</button></div>'+
   '<div class="a5-searchrow"><button class="a5-searchbutton" id="a5-searchbutton" title="Search chats">'+ico("search")+'</button><input id="a5-searchinput" class="a5-searchinput" aria-label="Search chats" placeholder="Search chats" autocomplete="off"></div>'+
   '<button class="a5-newchat" data-nav="chat"><span class="a5-plus-icon">'+ico("plus")+'</span><span>New chat</span></button>'+
   '<div class="a5-homefixed">'+navButton("home","Home","home")+'</div>'+
   '<div class="a5-tooltitle">Tools</div>'+
   '<div class="a5-scrollzone"><div class="a5-toolitems">'+toolScroll+'</div>'+
     '<div class="a5-divider"></div>'+
     '<div class="a5-chatgroups"><button class="a5-grouphead" data-toggle="pinned"><span>Pinned</span><b>›</b></button><div id="a5-pinned" class="a5-chatlist"></div>'+
     '<button class="a5-grouphead" data-toggle="archived"><span>Archived</span><b>›</b></button><div id="a5-archived" class="a5-chatlist"></div>'+
     '<button class="a5-grouphead" data-toggle="recents"><span>Recents</span><b>⌄</b></button><div id="a5-recents" class="a5-chatlist"></div></div></div>'+
   '<div class="a5-profile" id="a5-profile"><button class="a5-profilebtn" id="a5-profilebtn"><span class="a5-avatar">'+initials(userName())+'</span><span class="a5-profilecopy"><strong>'+esc(userName())+'</strong><small>'+ (signedIn?"Free plan":"Guest") +'</small></span><span class="a5-profilechev">›</span></button><div class="a5-profilemenu" id="a5-profilemenu"></div></div>'+
 '</div>';
 const rail='<div class="a5-railonly"><button class="a5-rail-logo" id="a5-rail-open" title="Open sidebar"><img src="/angel-logo.svg" alt="Angel"></button><button class="a5-railbtn" data-nav="home" title="Home">'+ico("home")+'</button><button class="a5-railbtn" data-nav="chat" title="New chat">'+ico("plus")+'</button><div class="a5-railspacer"></div><button class="a5-railavatar" id="a5-rail-profile">'+initials(userName())+'</button></div><div class="a5-hoverpanel">'+expanded+'</div>';
 $("#sidebar").innerHTML=collapsed?rail:expanded;
 bindSidebar();paintChats();
}
function bindSidebar(){
 $("#a5-collapse")?.addEventListener("click",toggleSidebar);
 $("#a5-rail-open")?.addEventListener("click",()=>{document.body.classList.remove("a5-collapsed");localStorage.setItem("angel.sidebarCollapsed","0");renderSidebar()});
 $("#a5-brand")?.addEventListener("click",()=>showScreen("home"));
 $("#a5-searchbutton")?.addEventListener("click",()=>{const row=$("#a5-searchinput");row?.classList.toggle("open");if(row?.classList.contains("open"))row.focus()});
 $("#a5-searchinput")?.addEventListener("input",e=>showSearch(e.target.value));
 $("#a5-profilebtn")?.addEventListener("click",openProfile);
 $("#a5-rail-profile")?.addEventListener("click",openProfileFromRail);
 $$("[data-nav]").forEach(b=>b.addEventListener("click",()=>handleNav(b.dataset.nav)));
 $$(".a5-grouphead").forEach(b=>b.addEventListener("click",()=>{const key=b.dataset.toggle,box=$("#a5-"+key);const hide=box?.classList.toggle("a5-hidden");b.querySelector("b").textContent=hide?"›":"⌄"}));
}
function toggleSidebar(){
 if(isMobile()){
   $("#sidebar")?.classList.toggle("a5-mobile-open");
   return;
 }
 document.body.classList.toggle("a5-collapsed");
 localStorage.setItem("angel.sidebarCollapsed",document.body.classList.contains("a5-collapsed")?"1":"0");
 renderSidebar();
}
function handleNav(n){
 if(n==="home")return showScreen("home");
 if(n==="chat"){if(!signedIn)return openAuth("Sign in to start a conversation.");return window.AngelCore?.newChat?.()||showScreen("chat");}
 if(!signedIn && ["agent","projects","schedule","library","assistants"].includes(n))return openAuth("Sign in to use this workspace.");
 if(n==="agent")return showScreen("agent");
 if(n==="projects")return showScreen("projects");
 if(n==="schedule")return showScreen("schedule");
 if(n==="library")return showScreen("library");
 if(n==="media")return showScreen("media");
 if(n==="assistants")return showScreen("assistants");
 if(n==="more")return showScreen("more");
}
function paintChats(){
 const renderRows=(items,empty)=>items.map(rowHtml).join("")||'<div class="a5-notice">'+empty+'</div>';
 const p=$("#a5-pinned"),a=$("#a5-archived"),r=$("#a5-recents");if(!p)return;
 p.innerHTML=renderRows(chatData.filter(x=>pinned.has(x.id)),"Nothing pinned.");
 a.innerHTML=renderRows(chatData.filter(x=>archived.has(x.id)),"Nothing archived.");
 r.innerHTML=renderRows(chatData.filter(x=>!pinned.has(x.id)&&!archived.has(x.id)&&!secretChats.has(x.id)),"No recent chats yet.");
 $$("#sidebar [data-chat]").forEach(x=>x.onclick=()=>showScreen("chat",x.dataset.chat));
 $$("#sidebar [data-chat-more]").forEach(x=>x.onclick=e=>{e.stopPropagation();openChatMenu(x.dataset.chatMore,x)});
}
function rowHtml(x){return '<div class="a5-chatrow" data-chat="'+esc(x.id)+'" role="button" tabindex="0"><span class="a5-chaticon">'+ico("chat")+'</span><span class="a5-chattitle">'+esc(x.title)+'</span><button class="a5-chatmore" type="button" data-chat-more="'+esc(x.id)+'">···</button></div>'}
async function loadUserState(){
 signedIn=!!(await sb5.auth.getSession()).data.session;
 if(!signedIn){chatData=[];pinned=new Set();archived=new Set();deleted=new Set();secretChats=new Set();passcodeHash="";return;}
 const session=(await sb5.auth.getSession()).data.session;
 const meta=session?.user?.user_metadata||{};
 pinned=new Set(meta.angel_pinned_chats||[]);
 archived=new Set(meta.angel_archived_chats||[]);
 deleted=new Set(meta.angel_deleted_chats||[]);
 secretChats=new Set(meta.angel_secret_chats||[]);
 passcodeHash=meta.angel_secret_pin_hash||"";
 try{
  const q=await sb5.from("conversations").select("id,title,updated_at").eq("user_id",session.user.id).order("updated_at",{ascending:false}).limit(40);
  chatData=(q.data||[]).filter(x=>!deleted.has(x.id)).map(x=>({id:x.id,title:x.title||"Conversation"}));
 }catch{chatData=[];}
}
async function saveUserState(){
 const s=(await sb5.auth.getSession()).data.session;
 if(!s)return;
 await sb5.auth.updateUser({data:{angel_pinned_chats:[...pinned],angel_archived_chats:[...archived],angel_deleted_chats:[...deleted],angel_secret_chats:[...secretChats]}});
}
async function openProfile(){
 const p=$("#a5-profile"),m=$("#a5-profilemenu");if(!p||!m)return;
 p.classList.toggle("open");if(!p.classList.contains("open"))return;
 m.innerHTML='<div class="a5-menuhead"><strong>'+esc(userName())+'</strong><small>'+(signedIn?"Signed in":"Guest")+'</small></div>'+
 '<button class="a5-menubtn" data-prof="theme">'+ico("sun")+'<span>Appearance</span></button>'+
 '<button class="a5-menubtn" data-prof="settings">'+ico("device")+'<span>Settings</span></button>'+
 (signedIn?'<button class="a5-menubtn" data-prof="secrets">'+ico("lock")+'<span>Secrets</span></button>':'')+
 '<div class="a5-divider"></div>'+
 (signedIn?'<button class="a5-menubtn danger" data-prof="logout">'+ico("unlock")+'<span>Log out</span></button>':'<button class="a5-menubtn" data-prof="login">'+ico("unlock")+'<span>Sign in</span></button>');
 m.querySelectorAll("[data-prof]").forEach(b=>b.onclick=()=>profileAction(b.dataset.prof));
}
function profileAction(a){$("#a5-profile")?.classList.remove("open");if(a==="theme")return openTheme();if(a==="settings")return showScreen("settings");if(a==="secrets")return showScreen("secrets");if(a==="logout")return window.AngelCore?.signOut?.();if(a==="login")return openAuth("Sign in to keep your conversations across devices.")}
function openProfileFromRail(){document.body.classList.remove("a5-collapsed");localStorage.setItem("angel.sidebarCollapsed","0");renderSidebar();setTimeout(openProfile,60)}
function showSearch(term){
 if(!signedIn){openAuth("Sign in to search saved chats.");return;}
 let p=$("#a5-searchresults");if(!p){p=document.createElement("div");p.id="a5-searchresults";p.className="a5-pop open";document.body.appendChild(p);}
 const q=term.trim().toLowerCase(),rows=chatData.filter(x=>x.title.toLowerCase().includes(q));
 p.innerHTML='<div class="a5-poptitle">Search chats</div>'+rows.slice(0,10).map(x=>'<button data-sr="'+esc(x.id)+'">'+ico("chat")+'<span>'+esc(x.title)+'</span></button>').join("")+(rows.length?"":'<div class="a5-notice">No matching chats.</div>');
 const r=$(".a5-searchrow"),rect=r?.getBoundingClientRect();p.style.left=Math.min(innerWidth-270,(rect?.right||300)+8)+"px";p.style.top=(rect?.top||80)+"px";
 p.querySelectorAll("[data-sr]").forEach(b=>b.onclick=()=>{p.remove();showScreen("chat",b.dataset.sr)});
}
async function chatAction(id,action){
 if(action==="pin"){pinned.has(id)?pinned.delete(id):pinned.add(id);await saveUserState();renderSidebar();return;}
 if(action==="archive"){archived.add(id);await saveUserState();renderSidebar();return;}
 if(action==="delete"){deleted.add(id);await saveUserState();renderSidebar();toast("Moved to Recycle Bin");return;}
 if(action==="rename"){
  const row=chatData.find(x=>x.id===id);const next=prompt("Rename chat",row?.title||"Conversation");if(!next?.trim())return;
  const title=next.trim();await sb5.from("conversations").update({title}).eq("id",id);if(row)row.title=title;renderSidebar();return;
 }
 if(action==="share"){const url=location.origin+"/?chat="+encodeURIComponent(id);await navigator.clipboard?.writeText(url);toast("Chat link copied");return;}
 if(action==="lock"){return lockChat(id);}
}
function openChatMenu(id,btn){
 closePops();const m=document.createElement("div");m.className="a5-pop open";
 m.innerHTML='<div class="a5-poptitle">Chat</div>'+
 '<button data-cm="share">'+ico("share")+'<span>Share chat</span></button>'+
 '<button data-cm="rename">'+ico("doc")+'<span>Rename</span></button>'+
 '<button data-cm="pin">'+ico("pin")+'<span>Pin / unpin</span></button>'+
 '<button data-cm="archive">'+ico("archive")+'<span>Archive</span></button>'+
 '<button data-cm="lock">'+ico("lock")+'<span>Move to Secrets</span></button>'+
 '<button data-cm="delete" class="danger">'+ico("trash")+'<span>Move to Recycle Bin</span></button>';
 document.body.append(m);const r=btn.getBoundingClientRect();m.style.left=Math.max(8,r.right-225)+"px";m.style.top=Math.min(innerHeight-290,r.bottom+4)+"px";
 m.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>{m.remove();chatAction(id,b.dataset.cm)});
}
async function hashCode(value){
 const bytes=new TextEncoder().encode(value);
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function setSecretPasscode(){
 const p=prompt("Set a personal Secrets passcode. Use something you will remember.");
 if(!p||p.length<4)return false;
 passcodeHash=await hashCode(p);
 if(signedIn)await sb5.auth.updateUser({data:{angel_secret_pin_hash:passcodeHash}});
 else localStorage.setItem("angel.secret.pin",passcodeHash);
 toast("Secrets passcode saved");
 return true;
}
async function unlockSecrets(){
 if(!passcodeHash) return setSecretPasscode();
 const p=prompt("Enter your Secrets passcode.");
 if(p===null)return false;
 const ok=(await hashCode(p))===passcodeHash;
 if(!ok){toast("That passcode did not match.");return false;}
 return true;
}
async function lockChat(id){
 if(!signedIn)return openAuth("Sign in to use Secrets.");
 if(!passcodeHash){const ok=await setSecretPasscode();if(!ok)return;}
 secretChats.add(id);await saveUserState();renderSidebar();toast("Chat moved to Secrets");showScreen("secrets");
}
async function secretsPage(){
 const ok=await unlockSecrets();if(!ok){showScreen("more");return;}
 const rows=chatData.filter(x=>secretChats.has(x.id));
 $("#page").innerHTML='<section class="a5-page"><div class="a5-kicker">PRIVATE SPACE</div><h1>Secrets</h1><div class="a5-secret-note">Locked chats stay out of Recents. This preview protects access with your passcode; message encryption itself is a later security layer.</div><div class="a5-secret-list">'+(rows.length?rows.map(x=>'<button class="a5-secret-row" data-secret="'+esc(x.id)+'">'+ico("lock")+'<span>'+esc(x.title)+'</span><small>Open</small></button>').join(""):'<div class="a5-notice">Nothing here yet.</div>')+'</div><button class="a5-outline" id="a5-reset-pin">Change passcode</button></section>';
 $("#a5-reset-pin").onclick=async()=>{if(await setSecretPasscode())secretsPage()};
 $$("[data-secret]").forEach(b=>b.onclick=()=>showScreen("chat",b.dataset.secret));
}
function recyclePage(){
 const rows=chatData.filter(x=>deleted.has(x.id));
 $("#page").innerHTML='<section class="a5-page"><div class="a5-kicker">SECOND CHANCE</div><h1>Recycle Bin</h1><div class="a5-simplegrid">'+(rows.length?rows.map(x=>'<div class="a5-simple"><b>'+esc(x.title)+'</b><button class="a5-outline" data-restore="'+esc(x.id)+'">Restore</button></div>').join(""):'<div class="a5-notice">Recycle Bin is empty.</div>')+'</div></section>';
 $$("[data-restore]").forEach(b=>b.onclick=async()=>{deleted.delete(b.dataset.restore);await saveUserState();await loadUserState();renderSidebar();recyclePage()});
}
function simplePage(title,rows){
 $("#page").innerHTML='<section class="a5-page"><h1>'+title+'</h1><div class="a5-simplegrid">'+rows.map(x=>'<div class="a5-simple"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div></section>';
}
function morePage(){
 const items=["Marketplace","Charts","Memory","Multimodal","Skills","Plugins","Connections","Secrets","Recycle Bin"];
 $("#page").innerHTML='<section class="a5-morepage"><div class="a5-kicker">MORE</div><h1>More</h1><div class="a5-moregrid">'+items.map(x=>'<button class="a5-morecard" data-morepage="'+x+'">'+ico(x==="Secrets"?"lock":x==="Recycle Bin"?"trash":x==="Marketplace"?"assistant":x==="Charts"?"data":x==="Connections"||x==="Plugins"?"plug":x==="Multimodal"?"image":"agent")+'<span>'+x+'</span></button>').join("")+'</div></section>';
 $$("[data-morepage]").forEach(b=>b.onclick=()=>showSecondary(b.dataset.morepage));
}
function showSecondary(name){
 if(name==="Secrets")return showScreen("secrets");
 if(name==="Recycle Bin")return showScreen("recycle");
 if(name==="Marketplace")return window.dispatchEvent(new Event("angel-agent-lab-open"));
 if(name==="Charts")return simplePage("Charts",[["Workload","Usage and activity visualizations belong here."],["Agent performance","Execution outcomes and task trends."],["Research","Source and research activity summaries."]]);
 if(name==="Memory")return simplePage("Memory",[["Saved memories","Long-term items Angel can keep."],["Review","Inspect and remove memories."],["Control","Choose what stays useful."]]);
 if(name==="Multimodal")return simplePage("Multimodal",[["Vision","Images and screenshots."],["Documents","PDF, text, spreadsheets and presentations."],["Voice","Dictation and spoken replies."]]);
 if(name==="Skills")return window.dispatchEvent(new Event("angel-agent-lab-open"));
 if(name==="Plugins")return simplePage("Plugins",[["Connected services","External tools can be added here."],["Permissions","Review what each connection can access."]]);
 if(name==="Connections")return simplePage("Connections",[["Providers","AI and research providers."],["Apps","External services and data."]]);
}
function openTheme(){
 closePops();const p=document.createElement("div");p.className="a5-pop open";
 p.innerHTML='<div class="a5-poptitle">Appearance</div><div class="a5-themegrid">'+["dark","light","device"].map(x=>'<button class="a5-theme-option" data-theme="'+x+'">'+ico(x==="dark"?"moon":x==="light"?"sun":"device")+'<span>'+x[0].toUpperCase()+x.slice(1)+'</span></button>').join("")+'</div>';
 document.body.append(p);p.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{setTheme(b.dataset.theme);p.remove()});
}
function openAuth(message="Enter Angel"){
 $("#authView p")?.replaceChildren(document.createTextNode(message));
 window.AngelCore?.openModal?.();
}
function buildTop(){
 const h=$(".topbar");if(!h)return;
 h.className="topbar a5-topbar";
 h.innerHTML='<div class="a5-mobiletitle"><button id="a5-mobilemenu" aria-label="Open menu">'+ico("more")+'</button><span>Angel</span></div><div class="a5-topspace"></div>'+
 '<button class="a5-topbtn a5-sharetop" id="a5-sharetop">'+ico("share")+'<span>Share chat</span></button>'+
 '<button class="a5-topbtn offer" id="a5-plus">Try Plus free</button>'+
 '<button class="a5-topbtn guest-login" id="a5-login">Log in</button>'+
 '<button class="a5-topbtn guest-signup" id="a5-signup">Sign up</button>'+
 '<button class="a5-topicon" id="a5-theme-top" aria-label="Theme">'+ico("sun")+'</button>';
 $("#a5-mobilemenu")?.addEventListener("click",()=>{if(isMobile())$("#sidebar")?.classList.add("a5-mobile-open");else toggleSidebar()});
 $("#a5-plus").onclick=()=>toast("Plans panel");
 $("#a5-login").onclick=()=>openAuth("Sign in to keep conversations across devices.");
 $("#a5-signup").onclick=()=>openAuth("Create your Angel account with Google.");
 $("#a5-theme-top").onclick=openTheme;
 updateTopVisibility();
}
function updateTopVisibility(){
 $("#a5-sharetop")?.classList.toggle("hidden",screen!=="chat");
 $("#a5-login")?.classList.toggle("hidden",signedIn);
 $("#a5-signup")?.classList.toggle("hidden",signedIn);
}
function addAction(icon,label,action,opts={}){
 return '<button class="a5-menuaction a5-addaction" data-action="'+action+'">'+ico(icon)+'<span><b>'+label+'</b><small>'+opts.hint+'</small></span></button>';
}
function openAddMenu(anchor){
 let p=$("#a5-addmenu");if(!p){
  p=document.createElement("div");p.id="a5-addmenu";p.className="a5-addmenu";
  const items=[
   addAction("image","Photos & camera","photo",{hint:"Upload an image or open your camera"}),
   addAction("doc","Files","file",{hint:"PDF, docs, slides and spreadsheets"}),
   addAction("search","Deep research","research",{hint:"Search the web and synthesize sources"}),
   addAction("plug","Connected apps","connections",{hint:"Use connected services and data"}),
   addAction("library","Library","library",{hint:"Use saved reference material"}),
   addAction("project","Project","project",{hint:"Bring a project into the conversation"}),
   addAction("canvas","Canvas / build","canvas",{hint:"Draft documents, apps and code"}),
   addAction("image","Create image","image",{hint:"Start an image creation prompt"}),
   addAction("visual","Create video","video",{hint:"Start a visual creation prompt"}),
   addAction("data","Data analysis","data",{hint:"Work with tables and datasets"}),
   addAction("agent","Agent task","agent",{hint:"Hand a multi-step job to Agent Lab"}),
   addAction("agent","Skills","skills",{hint:"Use a reusable way of working"})
  ];
  p.innerHTML='<div class="a5-addhead">Add capability</div><div class="a5-addgrid">'+items.join("")+'</div>';
  document.body.append(p);
  p.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>runAddAction(b.dataset.action,p));
 }
 p.classList.toggle("open");
 const r=anchor.getBoundingClientRect();p.style.left=Math.min(innerWidth-360,Math.max(10,r.left))+"px";p.style.bottom=(innerHeight-r.top+8)+"px";
}
function runAddAction(action,p){
 p.classList.remove("open");
 const msg=$("#message");
 if(action==="file")return $("#uploadBtn")?.click();
 if(action==="photo")return $("#uploadBtn")?.click();
 if(action==="research"){showScreen("chat");window.AngelCore?.toggleResearch?.();return;}
 if(action==="connections")return showSecondary("Connections");
 if(action==="library")return showScreen("library");
 if(action==="project"){showScreen("projects");return;}
 if(action==="canvas"){showScreen("chat");msg.value="Help me build this in Canvas: ";msg.focus();return;}
 if(action==="image"){showScreen("chat");msg.value="Create an image of ";msg.focus();return;}
 if(action==="video"){showScreen("chat");msg.value="Create a video about ";msg.focus();return;}
 if(action==="data"){showScreen("chat");msg.value="Analyze this data: ";msg.focus();return;}
 if(action==="agent"){showScreen("agent");return;}
 if(action==="skills")return showSecondary("Skills");
}
function renderComposer(){
 const c=$(".composer");if(!c||c.dataset.v4==="1")return;
 const msg=$("#message"),sendBtn=$("#sendBtn"),micBtn=$("#micBtn"),researchBtn=$("#researchBtn"),uploadBtn=$("#uploadBtn"),fileInput=$("#fileInput"),status=$("#footerStatus");
 c.dataset.v4="1";
 c.innerHTML="";
 const bridge=document.createElement("div");bridge.className="a5-bridge";
 [micBtn,researchBtn,uploadBtn,fileInput,status].forEach(n=>{if(n)bridge.append(n)});
 c.append(bridge);
 const row=document.createElement("div");row.className="a5-composer-row";
 const add=document.createElement("button");add.className="a5-add-btn";add.innerHTML=ico("plus")+'<span>Add</span>';add.onclick=()=>openAddMenu(add);
 const field=document.createElement("div");field.className="a5-field";
 msg.className="a5-message-input";msg.placeholder="Message Angel…";msg.rows=1;field.append(msg);
 const controls=document.createElement("div");controls.className="a5-compose-controls";
 const thinkBtn=document.createElement("button");thinkBtn.className="a5-compose-control";thinkBtn.id="a5-think";thinkBtn.innerHTML=ico("brain")+'<span>Think</span>';thinkBtn.onclick=()=>{think=!think;localStorage.setItem("angel.think",think?"1":"0");thinkBtn.classList.toggle("active",think);toast(think?"Think is on":"Think is off")};
 const dictate=document.createElement("button");dictate.className="a5-compose-control";dictate.innerHTML=ico("dictate")+'<span>Dictate</span>';dictate.onclick=()=>micBtn?.click();
 const visual=document.createElement("button");visual.className="a5-compose-control";visual.innerHTML=ico("visual")+'<span>Visual</span>';visual.onclick=()=>visualMode();
 const voice=document.createElement("button");voice.className="a5-compose-control";voice.innerHTML=ico("voice")+'<span>Voice</span>';voice.onclick=()=>{$("#voicePanel")?.classList.add("open");toast("Voice mode ready")};
 const model=document.createElement("button");model.className="a5-compose-control model";model.id="a5-model";model.innerHTML='<span>'+esc(selectedModel)+'</span>'+ico("model");model.onclick=()=>openModelMenu(model);
 sendBtn.className="a5-send-btn";sendBtn.setAttribute("aria-label","Send");
 sendBtn.innerHTML=ico("send");
 controls.append(thinkBtn,dictate,visual,voice,model,sendBtn);
 row.append(add,field,controls);
 c.append(row);
 msg.addEventListener("input",()=>{msg.style.height="auto";msg.style.height=Math.min(msg.scrollHeight,170)+"px";sendBtn.classList.toggle("ready",!!msg.value.trim())});
 sendBtn.addEventListener("click",()=>{if(!msg.value.trim())$("#voicePanel")?.classList.add("open")});
}
function openModelMenu(anchor){
 closePops();const p=document.createElement("div");p.className="a5-pop open";
 const models=[["Auto","Angel chooses the capability path"],["Fast","Speed-first routing"],["Reasoning","More deliberate reasoning"],["Deep Research","Research and citations"],["Creative","Media-aware generation"]];
 p.innerHTML='<div class="a5-poptitle">Model</div>'+models.map(x=>'<button data-model="'+x[0]+'"><b>'+x[0]+'</b><small>'+x[1]+'</small></button>').join("");
 document.body.append(p);const r=anchor.getBoundingClientRect();p.style.left=Math.max(10,Math.min(innerWidth-250,r.left))+"px";p.style.top=Math.min(innerHeight-240,r.bottom+6)+"px";
 p.querySelectorAll("[data-model]").forEach(b=>b.onclick=()=>{selectedModel=b.dataset.model;localStorage.setItem("angel.model",selectedModel);anchor.querySelector("span").textContent=selectedModel;p.remove()});
}
async function visualMode(){
 const s=document.createElement("div");s.className="a5-visual-sheet open";
 s.innerHTML='<div class="a5-visual-head"><div><strong>Visual mode</strong><small>Give Angel a visual window.</small></div><button id="a5-vclose">×</button></div>'+
 '<button class="a5-visual-option" id="a5-vcamera">'+ico("visual")+'<span><b>Live camera</b><small>Use the camera as a live visual feed.</small></span></button>'+
 '<button class="a5-visual-option" id="a5-vscreen">'+ico("device")+'<span><b>Share screen</b><small>Let Angel see the screen you choose.</small></span></button>';
 document.body.append(s);$("#a5-vclose").onclick=()=>s.remove();
 $("#a5-vcamera").onclick=async()=>{try{await navigator.mediaDevices.getUserMedia({video:true});toast("Camera access granted");s.remove()}catch{toast("Camera access was not granted")}};
 $("#a5-vscreen").onclick=async()=>{try{await navigator.mediaDevices.getDisplayMedia({video:true});toast("Screen access granted");s.remove()}catch{toast("Screen access was not granted")}};
}
function home(){
 const greeting=guestGreetings[Math.floor(Math.random()*guestGreetings.length)];
 $("#page").innerHTML='<section class="a5-home"><div class="a5-homehead"><h1>'+esc(greeting)+'</h1></div>'+
 '<div class="a5-dashboard">'+
 '<button class="a5-dashboard-card" data-nav="agent"><span class="a5-dashicon">'+ico("agent")+'</span><strong>Agent Lab</strong></button>'+
 '<button class="a5-dashboard-card" data-nav="projects"><span class="a5-dashicon">'+ico("project")+'</span><strong>Projects</strong></button>'+
 '<button class="a5-dashboard-card" data-nav="media"><span class="a5-dashicon">'+ico("media")+'</span><strong>Media Studio</strong></button>'+
 '<div class="a5-dashboard-panel"><div class="a5-cardtitle">Latest News</div><div class="a5-newslist">'+
 newsRow("AI tools","Search what changed in the AI world.","latest AI tools and product updates")+
 newsRow("Technology","Get fresh technology headlines.","latest technology news")+
 newsRow("Nigeria","Catch up on local technology and business.","Nigeria technology news")+
 newsRow("Creative","Explore new image, video and multimodal releases.","latest generative media news")+
 '</div></div>'+
 '<div class="a5-dashboard-panel"><div class="a5-cardtitle">Recent Activity</div><div class="a5-activitylist">'+
 activityRow("Projects","Website redesign")+activityRow("Agent Lab","Recent runs")+activityRow("Media Studio","Recent creations")+
 '</div></div>'+
 '</div></section>';
 $$("#page [data-nav]").forEach(b=>b.onclick=()=>handleNav(b.dataset.nav));
 $$("#page [data-news]").forEach(b=>b.onclick=()=>{if(!signedIn)return openAuth("Sign in to run live search.");showScreen("chat");const input=$("#message");input.value=b.dataset.news;input.focus();input.dispatchEvent(new Event("input",{bubbles:true}))});
 updateTopVisibility();
}
function newsRow(a,b,q){return '<button class="a5-newsrow" data-news="'+esc(q)+'"><span class="a5-newsdot"></span><span><b>'+a+'</b><small>'+b+'</small></span></button>}
function activityRow(a,b){return '<div class="a5-activityrow"><span class="a5-activityicon">'+ico(a==="Agent Lab"?"agent":a==="Projects"?"project":"media")+'</span><span><b>'+a+'</b><small>'+b+'</small></span></div>'}
function chatPage(chatId=null){
 const greeting=chatGreetings[Math.floor(Math.random()*chatGreetings.length)];
 $("#page").innerHTML='<section class="a5-chatpage"><div class="a5-chatwelcome"><h1>'+esc(greeting)+'</h1><div class="a5-chips">'+
 ['Latest tech news','Plan a project','Design something','Help me think'].map((x,i)=>'<button class="a5-chip" data-prompt="'+esc(['Latest tech news and what changed this week','Help me plan a practical project','Give me a few design directions for this app','Help me think through something'][i])+'">'+x+'</button>').join("")+
 '</div></div></section>';
 $$("#page [data-prompt]").forEach(b=>b.onclick=()=>{const input=$("#message");input.value=b.dataset.prompt;input.focus();input.dispatchEvent(new Event("input",{bubbles:true}))});
 if(chatId&&!String(chatId).startsWith("demo-")&&window.AngelCore?.loadConversation)setTimeout(()=>window.AngelCore.loadConversation(chatId),0);
 updateTopVisibility();
}
function showScreen(s,chatId=null){
 screen=s;setScreenClass(s);
 if(s==="home")home();
 else if(s==="chat")chatPage(chatId);
 else if(s==="agent"){$("#page").innerHTML='<section class="a5-page"><h1>Agent Lab</h1></section>';setTimeout(()=>window.dispatchEvent(new Event("angel-agent-lab-open")),0)}
 else if(s==="projects")simplePage("Projects",[["Angel website","UI work"],["Agent Lab","Agent workflows"],["Music learning app","Product scope"],["School ICT tools","Teaching tools"]]);
 else if(s==="schedule")simplePage("Schedule",[["Angel UI review","Tonight"],["Weekly review","Recurring"],["Research digest","Monday"],["Follow-up","Tomorrow"]]);
 else if(s==="library")simplePage("Library",[["Agent Lab research","PDF"],["AI assistant comparison","Document"],["Angel scaffold","ZIP"],["Generated media","Collection"]]);
 else if(s==="media")mediaPage();
 else if(s==="assistants")simplePage("Assistants",[["Research Scout","Research and source checking"],["Build Coach","Plan, code and review"],["Memory Steward","Keep useful memories clean"],["Visual Analyst","Understand images and documents"]]);
 else if(s==="more")morePage();
 else if(s==="secrets")secretsPage();
 else if(s==="recycle")recyclePage();
 else if(s==="settings")simplePage("Settings",[["Appearance","Use the theme control."],["Sidebar","Collapse or expand the workspace."],["Voice","Dictation and spoken replies."],["Visual","Camera and screen sharing."]]);
 syncNav();syncBottom();syncComposer();updateTopVisibility();
}
function mediaPage(){
 $("#page").innerHTML='<section class="a5-page"><h1>Media Studio</h1><div class="a5-media-grid">'+
 ["Nature moodboard","Product concept","Editorial portrait","Social pack","Wallpaper series","Brand banner","Product teaser","Explainer"].map(x=>'<button class="a5-media-card"><b>'+x+'</b><small>Visual creation workflow</small></button>').join("")+
 '</div></section>';
}
function simpleSecondary(name){
 return simplePage(name,[["Ready","This workspace is part of Angel’s broader capability system."],["Connected","Use the Add menu or More to reach it."],["Next","The detailed workflow will grow here."]]);
}
function syncNav(){$$(".a5-navitem").forEach(b=>b.classList.toggle("active",b.dataset.nav===screen))}
function renderBottom(){
 if($("#a5-bottomnav"))$("#a5-bottomnav").remove();
 const n=document.createElement("nav");n.id="a5-bottomnav";n.className="a5-bottomnav";
 n.innerHTML=signedIn
 ? '<button data-b="home">'+ico("home")+'<span>Home</span></button><button data-b="chat">'+ico("chat")+'<span>Chats</span></button><button data-b="projects">'+ico("project")+'<span>Projects</span></button><button data-b="agent">'+ico("agent")+'<span>Agent Lab</span></button><button data-b="more">'+ico("more")+'<span>More</span></button>'
 : '<button data-b="home">'+ico("home")+'<span>Home</span></button><button data-b="media">'+ico("media")+'<span>Media</span></button><button data-b="more">'+ico("more")+'<span>More</span></button>';
 document.body.append(n);$("[data-b]").forEach(b=>b.onclick=()=>{if(b.dataset.b==="media")return handleNav("media");handleNav(b.dataset.b)});
}
function syncBottom(){
 const map=screen==="agent"?"agent":screen==="chat"?"chat":screen==="projects"?"projects":screen==="more"?"more":"home";
 $$("#a5-bottomnav [data-b]").forEach(b=>b.classList.toggle("active",b.dataset.b===map));
}
function syncComposer(){
 const show=["chat"].includes(screen);
 document.body.classList.toggle("a5-hidecomposer",!show);
}
function showSecondary(name){
 if(name==="Secrets")return showScreen("secrets");
 if(name==="Recycle Bin")return showScreen("recycle");
 if(name==="Marketplace"||name==="Skills"){if(!signedIn)return openAuth("Sign in to use this workspace.");setScreenClass("agent");screen="agent";syncComposer();syncNav();syncBottom();return window.dispatchEvent(new Event("angel-agent-lab-open"));}
 if(name==="Charts")return simpleSecondary("Charts");
 if(name==="Memory"){if(!signedIn)return openAuth("Sign in to use Memory.");return simpleSecondary("Memory");}
 if(name==="Multimodal")return simpleSecondary("Multimodal");
 if(name==="Plugins"){if(!signedIn)return openAuth("Sign in to use Plugins.");return simpleSecondary("Plugins");}
 if(name==="Connections"){if(!signedIn)return openAuth("Sign in to use Connections.");return simpleSecondary("Connections");}
}
function init(){
 if(!$("#sidebar")||!$("#page"))return setTimeout(init,80);
 document.body.classList.add("a5");
 if(localStorage.getItem("angel.sidebarCollapsed")==="1"||isTablet()&&!isMobile())document.body.classList.add("a5-collapsed");
 setTheme(themeMode);
 renderSidebar();buildTop();renderBottom();renderComposer();
 sb5.auth.getSession().then(async({data})=>{signedIn=!!data.session;if(signedIn){const n=data.session.user.user_metadata?.full_name||data.session.user.user_metadata?.name||data.session.user.email?.split("@")[0];if(n)localStorage.setItem("angel.displayName",n);await loadUserState()}renderSidebar();buildTop();showScreen("home")});
 document.addEventListener("angel-auth-changed",async e=>{signedIn=!!e.detail?.signedIn;await loadUserState();renderSidebar();buildTop();syncComposer();if(screen==="home")home()});
 window.addEventListener("resize",()=>{if(isMobile()){$("#sidebar")?.classList.remove("a5-mobile-open")}});
 window.AngelShell={showScreen,handleNav,renderSidebar,openToolPanel:()=>showScreen("more")};
}
function isTablet(){return innerWidth<=1024}
setTimeout(init,160);
