
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const URL="https://ybvyveonfvixsfusoqqz.supabase.co";
const KEY="sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const sb=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const icons={home:"⌂",agent:"✦",tasks:"✓",memory:"◉",files:"▣",multi:"◌",tools:"⌘",assistant:"◎",market:"▤",charts:"◫",search:"⌕",more:"⋯"};
let theme=localStorage.getItem("angel.theme")||"dark";
let recentsMin=localStorage.getItem("angel.recentsCollapsed")==="1";

function toast(t){const x=$("#toast");if(x){x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}}
function themeSet(t){theme=t;document.documentElement.dataset.theme=t;localStorage.setItem("angel.theme",t);renderUserMenu(false)}
function sessionName(){return document.querySelector(".aUserName")?.textContent||"there"}
function active(id){document.querySelectorAll(".aNavBtn").forEach(x=>x.classList.remove("active"));$("#"+id)?.classList.add("active")}
function nav(id,i,label){return '<button class="aNavBtn" id="'+id+'"><span class="aNavIcon">'+i+'</span><span class="aNavLabel">'+label+'</span></button>'}

function buildSidebar(){
 const s=$("#sidebar");if(!s)return;
 s.innerHTML=
 '<div class="sidebarFixedTop">'+
 '<div class="aBrandRow"><span class="angelLogo small"><img src="/angel-logo.svg" alt="Angel"></span><div class="aBrandCopy"><div class="aBrandName">Angel</div><div class="aBrandSub">private intelligence</div></div><button class="aCollapse" id="sidebarCollapse" title="Expand or collapse sidebar"><span>‹</span></button></div>'+
 '<div class="aSearchWrap" id="chatSearchWrap"><button class="aSearchBtn" id="chatSearchOpen"><span>'+icons.search+'</span><span class="label">Search chats</span><small>⌘K</small></button><input class="aSearchInput" id="chatSearchInput" placeholder="Search chats, files, memories…" autocomplete="off"><div class="aSearchPopover" id="chatSearchPopover"></div></div>'+
 '<button class="aNewChat" id="v3NewChat"><span class="plus">＋</span><span class="label">New chat</span></button></div>'+
 '<div class="aSidebarScroll"><div class="aSectionLabel">Workspace</div><nav class="aNav">'+
 nav("v3HomeNav",icons.home,"Home")+nav("agentLabNav",icons.agent,"Agent Lab")+nav("v3TasksNav",icons.tasks,"Tasks")+nav("v3MemoryNav",icons.memory,"Memories")+nav("v3FilesNav",icons.files,"Files & documents")+nav("v3MultiNav",icons.multi,"Multimodal")+nav("v3ToolsNav",icons.tools,"Tools")+nav("v3AssistantsNav",icons.assistant,"Assistants")+nav("v3MarketNav",icons.market,"Marketplace")+nav("v3ChartsNav",icons.charts,"Charts")+
 '</nav><div class="aRecentHead"><b>Recents</b><button class="aRecentToggle" id="recentToggle" title="Minimize recent chats">⌃</button></div><div id="aRecentList" class="aRecentList"></div></div>'+
 '<div class="aSidebarQuote"><div class="aQuote"><p>“Not just a tool, but a partner in your journey.”</p><small>ANGEL</small></div></div>'+
 '<div class="aUser" id="aUser"><button class="aUserBtn" id="sideUser"><span class="aAvatar">A</span><span class="aUserCopy"><span class="aUserName">Angel user</span><span class="aUserPlan">Free plan</span></span><span class="aUserChevron">⌄</span></button><div class="aUserMenu" id="aUserMenu"></div></div>'+
 '<div class="aLegacyHooks"><button id="newChat"></button><button id="angelNav"></button><button id="historyNav"></button><button id="exploreNav"></button><button id="intelligenceNav"></button><button id="projectsNav"></button><button id="settingsNav"></button><button id="sideAuth"></button><button id="authBtn"></button></div>';
}

function buildTopbar(){
 const h=$(".topbar");if(!h)return;
 h.innerHTML='<div class="aTopSearch"><span>'+icons.search+'</span><input id="globalChatSearch" placeholder="Search chats…" autocomplete="off"></div>'+
 '<div class="aTopActions"><button class="aTopBtn" id="shareChatTop">↗ Share</button><button class="aTopBtn offer" id="planOfferTop">Try Plus free</button><div class="aMoreWrap" id="chatMoreWrap"><button class="aTopBtn" id="chatMoreTop">⋯ More</button><div class="aMoreMenu">'+
 '<button class="aMenuItem" data-topmore="View files in chat">View files in chat</button><button class="aMenuItem" data-topmore="Pin chat">Pin chat</button><button class="aMenuItem" data-topmore="Archive chat">Archive chat</button><button class="aMenuItem danger" data-topmore="Delete chat">Delete chat</button>'+
 '</div></div></div>';
}

function userMenuHtml(s){
 const plan=s?"Free plan":"Guest / Free";
 return '<div class="aPlanBox"><b>'+plan+'</b><small>Plans, account controls and workspace preferences live here.</small><button class="aTopBtn offer" style="width:100%" data-user="plans">Try Plus free</button></div>'+
 '<div class="aMenuGroup"><button class="aMenuItem" data-user="profile">Profile <span>›</span></button><button class="aMenuItem" data-user="personalization">Personalization <span>›</span></button><button class="aMenuItem" data-user="settings">Settings <span>›</span></button></div>'+
 '<div class="aMenuGroup"><button class="aMenuItem" data-user="help">Help center</button><button class="aMenuItem" data-user="release">Release notes</button><button class="aMenuItem" data-user="apps">Download apps</button><button class="aMenuItem" data-user="shortcuts">Keyboard shortcuts</button><button class="aMenuItem" data-user="bug">Report a bug</button></div>'+
 '<div class="aMenuGroup"><button class="aMenuItem" data-user="terms">Terms of service</button><button class="aMenuItem" data-user="privacy">Privacy policy</button><div style="padding:7px 9px"><div style="font-size:8px;color:var(--a-faint);margin-bottom:5px">APPEARANCE</div><div class="aThemeRow"><button data-theme="light" class="'+(theme==="light"?"active":"")+'">Light</button><button data-theme="dark" class="'+(theme==="dark"?"active":"")+'">Dark</button></div></div></div>'+
 '<div class="aMenuGroup"><button class="aMenuItem danger" data-user="logout">'+(s?"Log out":"Sign in")+'</button></div>';
}
async function renderUserMenu(open){
 const s=(await sb.auth.getSession()).data.session||null, m=$("#aUserMenu"),u=$("#aUser");if(!m||!u)return;
 m.innerHTML=userMenuHtml(s);u.classList.toggle("is-open",open);
 m.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>themeSet(b.dataset.theme));
 m.querySelectorAll("[data-user]").forEach(b=>b.onclick=()=>userAction(b.dataset.user));
}
function userAction(a){
 $("#aUser")?.classList.remove("is-open");
 if(["profile","personalization","settings"].includes(a)){renderSettings(a);return}
 if(a==="logout"){ $("#sideAuth")?.click();return }
 if(a==="shortcuts"){toast("Enter to send · Shift+Enter for a new line · Ctrl/Cmd+K to search");return}
 if(a==="plans"){toast("Plans panel");return}
 toast(a.replaceAll("-"," ")+" selected");
}

function recentData(){return [
 {id:"demo-1",t:"Building Angel · Agent Lab",m:"4m"},
 {id:"demo-2",t:"Recent AI agent research",m:"44m"},
 {id:"demo-3",t:"Angel frontend redesign",m:"5h"},
 {id:"demo-4",t:"Files and documents workflow",m:"yesterday"},
 {id:"demo-5",t:"Cloud architecture notes",m:"2d"},
 {id:"demo-6",t:"Task scheduling ideas",m:"3d"}
]}
function renderRecents(){
 const list=$("#aRecentList");if(!list)return;
 const rows=recentData();list.innerHTML=rows.map(x=>'<div class="aChatRow" data-chat="'+x.id+'"><span style="width:12px;color:var(--a-faint)">'+(localStorage.getItem("pin-"+x.id)?"⌖":"")+'</span><div class="aChatMain"><span class="aChatTitle">'+esc(x.t)+'</span><span class="aChatMeta">'+x.m+'</span></div><button class="aChatMore" data-more="'+x.id+'" title="Chat options">⋯</button></div>').join("");
 list.classList.toggle("is-min",recentsMin);$("#recentToggle").textContent=recentsMin?"⌄":"⌃";
}
function chatMenu(id,btn){
 $(".aContextMenu")?.remove();
 const m=document.createElement("div");m.className="aContextMenu open";m.innerHTML='<button>Share chat</button><button>Rename</button><button>Pin / unpin</button><button>Archive</button><button class="danger">Delete</button>';document.body.appendChild(m);
 const r=btn.getBoundingClientRect();m.style.left=Math.max(8,r.right-175)+"px";m.style.top=Math.min(innerHeight-170,r.bottom+4)+"px";
 m.querySelectorAll("button").forEach((b,i)=>b.onclick=()=>{if(i===2){const k="pin-"+id;localStorage.setItem(k,localStorage.getItem(k)?"":"1");renderRecents()}else toast(b.textContent);m.remove()});
}
function showSection(title,intro,body,id){active(id||"");$("#page").innerHTML='<section class="aSectionPage"><h1 class="aSectionTitle">'+title+'</h1><p class="aSectionIntro">'+intro+'</p>'+body+'</section>'}
function renderHome(){
 const g=["Good morning","Good evening","Welcome back","Good to see you","Ready when you are"][Math.floor(Math.random()*5)];
 const n=sessionName();
 const body='<div class="aHome"><div class="aHomeHead"><div><h1 class="aGreeting">'+g+', <em>'+esc(n)+'</em> ·</h1><div class="aGreetingSub">What would you like Angel to help you create, explore, understand, or get done?</div></div><div class="aStatus"><span class="aStatusDot"></span>Online / offline ready</div></div>'+
 '<div class="aHomeGrid"><div><div class="aPanel"><div class="aPanelHead"><h2>Start with Angel</h2><span>New chat</span></div><div class="aPromptBox"><div class="aPromptHint">Ask Angel anything, start a task, attach a file, or hand Angel a job.</div><div class="aToolStrip"><button class="aQuickTool" data-action="chat">Chat</button><button class="aQuickTool" data-action="image">Create image</button><button class="aQuickTool" data-action="video">Create video</button><button class="aQuickTool" data-action="research">Web search</button><button class="aQuickTool" data-action="x">Live search</button><button class="aQuickTool" data-action="agent">Run agent</button></div></div></div>'+
 '<div class="aPanel" style="margin-top:12px"><div class="aPanelHead"><h2>What would you like to do?</h2><span>Quick actions</span></div><div class="aActionGrid">'+
 '<button class="aAction" data-action="chat"><div class="aActionIcon">◌</div><b>Chat</b><small>Have a conversation with Angel</small></button><button class="aAction" data-action="image"><div class="aActionIcon">▧</div><b>Create image</b><small>Turn an idea into an image</small></button><button class="aAction" data-action="video"><div class="aActionIcon">▷</div><b>Create video</b><small>Turn your idea into video</small></button><button class="aAction" data-action="research"><div class="aActionIcon">⌕</div><b>Web search</b><small>Research the live web</small></button><button class="aAction" data-action="x"><div class="aActionIcon">𝕏</div><b>Live search</b><small>Search live signals</small></button><button class="aAction" data-action="agent"><div class="aActionIcon">✦</div><b>Run agent</b><small>Let Angel work through a task</small></button><button class="aAction" data-action="assistant"><div class="aActionIcon">◎</div><b>Custom assistant</b><small>Create a reusable Angel</small></button><button class="aAction" data-view="market"><div class="aActionIcon">▤</div><b>Marketplace</b><small>Discover reusable assistants</small></button>'+
 '</div></div><div class="aLabBanner"><div class="aLabBannerIcon">✦</div><div class="aLabBannerCopy"><b>Agent Lab</b><span>Run agents, review traces, tasks, approvals, skills and assistants.</span></div><button class="aLabOpen" id="homeAgentLab">Open Agent Lab</button></div>'+
 '<div class="aPanel" style="margin-top:12px"><div class="aPanelHead"><h2>Recent conversations</h2><span>Recents</span></div><div class="aRecentHome">'+recentData().slice(0,5).map(x=>'<button class="aHomeChat" data-chat="'+x.id+'"><span>◷</span><span><b>'+esc(x.t)+'</b><small>'+x.m+'</small></span></button>').join("")+'</div></div></div>'+
 '<div><div class="aPanel"><div class="aPanelHead"><h2>Recent activity</h2><span>Live</span></div><div class="aActivityList"><div class="aActivity"><div class="aActivityIcon">▧</div><div><b>Image generated</b><span>A scenic concept · 2m ago</span></div></div><div class="aActivity"><div class="aActivityIcon">▷</div><div><b>Video created</b><span>Project demo · 12m ago</span></div></div><div class="aActivity"><div class="aActivityIcon">✓</div><div><b>Task completed</b><span>Research follow-up · 18m ago</span></div></div><div class="aActivity"><div class="aActivityIcon">◎</div><div><b>Assistant installed</b><span>Research Scout · 1h ago</span></div></div></div></div>'+
 '<div class="aPanel" style="margin-top:12px"><div class="aPanelHead"><h2>Quick access</h2><span>Workspace</span></div><div class="aList"><button class="aListRow" data-view="tasks"><b>Tasks & schedules</b><span>›</span></button><button class="aListRow" data-view="files"><b>Stored files & documents</b><span>›</span></button><button class="aListRow" data-view="memory"><b>Memories</b><span>›</span></button><button class="aListRow" data-view="tools"><b>Plugins · Connectors · Skills</b><span>›</span></button></div></div></div></div></div>';
 $("#page").innerHTML=body;active("v3HomeNav");
 $("#page").querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>homeAction(b.dataset.action));
 $("#page").querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>go(b.dataset.view));
 $("#page").querySelectorAll(".aHomeChat").forEach(b=>b.onclick=()=>toast("Recent conversation selected"));
 $("#homeAgentLab")?.addEventListener("click",()=>$("#agentLabNav")?.click());
}
function homeAction(a){if(a==="agent"){$("#agentLabNav")?.click();return}if(a==="assistant"){renderAssistants();return}if(a==="chat"){ $("#newChat")?.click();return}const m=$("#message");if(!m)return;const p={image:"Create an image based on this idea: ",video:"Create a video based on this idea: ",research:"Research this topic deeply and cite the important sources: ",x:"Search live social signals about: "}[a]||"";m.value=p;m.focus();m.dispatchEvent(new Event("input"));toast("Ready in the composer")}
function go(v){if(v==="tasks")renderTasks();if(v==="memory")renderMemory();if(v==="files")renderFiles();if(v==="tools")renderTools();if(v==="assistants")renderAssistants();if(v==="market")renderMarket();if(v==="charts")renderCharts();if(v==="recents")renderRecentsPage()}

function renderRecentsPage(){showSection("Recents","Previous conversations with Angel. The sidebar keeps the same history close at hand.","<div class='aPanel'><div class='aPanelHead'><h2>Recent chats</h2><button class='aTopBtn' id='newChatInner'>New chat</button></div><div class='aList'>"+recentData().map(x=>"<button class='aListRow'><b>"+esc(x.t)+"</b><span>"+x.m+" · ›</span></button>").join("")+"</div></div>");$("#newChatInner").onclick=()=>$("#v3NewChat")?.click()}
function renderTasks(){let cells="";for(let i=0;i<84;i++){let v=(i*7+3)%6;cells+="<span class='aHeat' data-v='"+v+"'></span>"}showSection("Tasks & schedules","One place for tasks, reminders and scheduled work.",'<div class="aTwoCol"><div class="aPanel"><div class="aPanelHead"><h2>Task queue</h2><span>Agent + personal</span></div><div class="aList"><div class="aListRow"><b>Finish Angel UI redesign</b><span>In progress</span></div><div class="aListRow"><b>Review cloud architecture document</b><span>Tomorrow</span></div><div class="aListRow"><b>Research next agent capability gaps</b><span>Friday</span></div><div class="aListRow"><b>Weekly Angel review</b><span>Scheduled</span></div></div></div><div class="aPanel"><div class="aPanelHead"><h2>Task activity heatmap</h2><span>12 weeks</span></div><div class="aHeatmap">'+cells+'</div></div></div>','v3TasksNav')}
function renderMemory(){showSection("Memories","Saved information Angel can use for continuity, kept inspectable and controllable.",'<div class="aCards"><div class="aCard"><h3>Angel project preferences</h3><p>Design direction, workspace structure and product goals.</p><small>Long-term · editable</small></div><div class="aCard"><h3>Work style</h3><p>Direct progress, visible implementation and phase-by-phase review.</p><small>Long-term · editable</small></div><div class="aCard"><h3>Conversation facts</h3><p>User-approved details that help Angel keep continuity.</p><small>Managed memory</small></div></div>','v3MemoryNav')}
function renderFiles(){showSection("Files & documents","Find uploaded files, created assets and documents attached to conversations.",'<div class="aPanel"><div class="aPanelHead"><h2>Stored files</h2><button class="aTopBtn">Upload</button></div><div class="aList"><div class="aFileRow"><div class="aFileIcon">PDF</div><div class="aFileMain"><b>Agent Lab capability review.pdf</b><span>Uploaded · 2.4 MB</span></div><button>⋯</button></div><div class="aFileRow"><div class="aFileIcon">DOC</div><div class="aFileMain"><b>AI assistant comparison document</b><span>Uploaded · 840 KB</span></div><button>⋯</button></div><div class="aFileRow"><div class="aFileIcon">ZIP</div><div class="aFileMain"><b>angel-agent.zip</b><span>Uploaded · Source scaffold</span></div><button>⋯</button></div></div></div>','v3FilesNav')}
function renderMultimodal(){showSection("Multimodal","One workspace for text, images, audio, video and documents.",'<div class="aCards"><div class="aCard"><h3>Vision</h3><p>Inspect screenshots, photos and visual references.</p></div><div class="aCard"><h3>Documents</h3><p>Read PDFs and office files as usable context.</p></div><div class="aCard"><h3>Voice</h3><p>Speak to Angel and receive spoken answers.</p></div><div class="aCard"><h3>Image creation</h3><p>Create or edit visual assets.</p></div><div class="aCard"><h3>Video</h3><p>Send ideas into Angel video generation.</p></div><div class="aCard"><h3>Future media</h3><p>Add new input and output types without redesigning the shell.</p></div></div>','v3MultiNav')}
function renderTools(){active("v3ToolsNav");$("#page").innerHTML='<section class="aSectionPage"><h1 class="aSectionTitle">Tools & extensions</h1><p class="aSectionIntro">Plugins add capabilities. Connectors link services. Skills package reusable ways of working.</p><div class="aExtTabs"><button class="aExtTab active" data-tab="plugins"><b>Plugins</b><span>Add capabilities</span></button><button class="aExtTab" data-tab="connectors"><b>Connectors</b><span>Link services</span></button><button class="aExtTab" data-tab="skills"><b>Skills</b><span>Reusable workflows</span></button></div><div id="extBody"></div></section>';renderExt("plugins");$("#page").querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{$("#page").querySelectorAll(".aExtTab").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderExt(b.dataset.tab)})}
function renderExt(k){const d={plugins:[["Web research","Search and synthesize live information.","Connected"],["Vision tools","Understand images and visual references.","Connected"],["Creative tools","Image and video generation.","Ready"]],connectors:[["Google Drive","Documents and files.","Connect"],["Calendar","Schedules and reminders.","Connect"],["GitHub","Repositories and build workflows.","Connected"]],skills:[["Research Scout","Search, compare, cite, synthesize.","Skill"],["Build Coach","Plan, code, test and review.","Skill"],["Memory Steward","Manage long-term recall.","Skill"]]}[k];$("#extBody").innerHTML='<div class="aCards">'+d.map(x=>'<div class="aCard"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><small>'+x[2]+'</small></div>').join("")+'</div>'}
function renderAssistants(){showSection("Assistants","Reusable Angel configurations you can create, test and keep for a specific purpose.",'<div class="aCards"><div class="aCard"><h3>Research Scout</h3><p>Deep research, source checking and concise briefs.</p><small>Private · Active</small></div><div class="aCard"><h3>Build Coach</h3><p>Turns an idea into a practical build loop.</p><small>Private · Draft</small></div><div class="aCard"><h3>New assistant</h3><p>Choose tools, skills and access.</p><small>＋ Create</small></div></div>','v3AssistantsNav')}
function renderMarket(){showSection("Marketplace","Discover reusable assistants built by you and the wider Angel ecosystem.",'<div class="aCards"><div class="aCard"><h3>Research Scout</h3><p>Fast research briefs with source tracing.</p><small>Popular</small></div><div class="aCard"><h3>Project Planner</h3><p>Break a goal into tasks and schedules.</p><small>New</small></div><div class="aCard"><h3>Visual Analyst</h3><p>Analyze screenshots, images and pages.</p><small>Featured</small></div></div>','v3MarketNav')}
function renderCharts(){showSection("Charts","Useful activity at a glance, without turning Angel into a dashboard maze.",'<div class="aTwoCol"><div class="aPanel"><div class="aPanelHead"><h2>Angel activity</h2><span>7 days</span></div><div style="height:190px;display:flex;align-items:flex-end;gap:9px;border-bottom:1px solid var(--a-line);padding:8px">'+[42,65,48,78,56,91,72].map(v=>"<i style=\"flex:1;height:"+v+"%;background:var(--a-panel-2);border:1px solid var(--a-line-strong);border-bottom-color:var(--a-accent);border-radius:5px 5px 0 0\"></i>").join("")+'</div></div><div class="aPanel"><div class="aPanelHead"><h2>At a glance</h2><span>Workspace</span></div><div class="aList"><div class="aListRow"><b>Conversations</b><span>48</span></div><div class="aListRow"><b>Agent runs</b><span>17</span></div><div class="aListRow"><b>Tasks completed</b><span>31</span></div><div class="aListRow"><b>Files processed</b><span>12</span></div></div></div></div>','v3ChartsNav')}
function renderSettings(which){active("");showSection("Settings","Profile, personalization, appearance, security, integrations, extensions and plans live under your account.",'<div class="aSettingGrid"><aside class="aSettingNav"><button class="active">Profile</button><button>Personalization</button><button>Appearance</button><button>Notifications</button><button>Privacy & security</button><button>Integrations</button><button>Plugins</button><button>Connectors</button><button>Skills</button><button>Plan</button></aside><div class="aSettingContent"><h3>'+((which==="profile")?"Profile & plan":"Appearance")+'</h3><p>'+((which==="profile")?"Your profile, personalization and current subscription level.":"Keep the white and black themes consistent across Angel.")+'</p><div class="aToggle"><span>Black theme</span><button id="darkSwitch" class="aSwitch '+(theme==="dark"?"on":"")+'"></button></div><div class="aToggle"><span>White theme</span><button id="lightSwitch" class="aSwitch '+(theme==="light"?"on":"")+'"></button></div><div class="aToggle"><span>Compact sidebar</span><button id="sideSwitch" class="aSwitch"></button></div></div></div>');$("#darkSwitch").onclick=()=>themeSet("dark");$("#lightSwitch").onclick=()=>themeSet("light");$("#sideSwitch").onclick=()=>toggleSidebar()}
function toggleSidebar(){const s=$("#sidebar"),c=s.classList.toggle("is-collapsed");document.body.classList.toggle("sidebar-collapsed",c);localStorage.setItem("angel.sidebarCollapsed",c?"1":"0")}
function init(){
 document.documentElement.dataset.theme=theme;buildSidebar();buildTopbar();
 if(localStorage.getItem("angel.sidebarCollapsed")==="1"){toggleSidebar()}
 $("#sidebarCollapse").onclick=toggleSidebar;$("#v3NewChat").onclick=()=>$("#newChat")?.click();
 $("#v3HomeNav").onclick=()=>{renderHome()};$("#v3TasksNav").onclick=renderTasks;$("#v3MemoryNav").onclick=renderMemory;$("#v3FilesNav").onclick=renderFiles;$("#v3MultiNav").onclick=renderMultimodal;$("#v3ToolsNav").onclick=renderTools;$("#v3AssistantsNav").onclick=renderAssistants;$("#v3MarketNav").onclick=renderMarket;$("#v3ChartsNav").onclick=renderCharts;
 $("#sideUser").onclick=async()=>{const u=$("#aUser");u.classList.toggle("is-open");if(u.classList.contains("is-open"))await renderUserMenu(true)};
 $("#recentToggle").onclick=()=>{recentsMin=!recentsMin;localStorage.setItem("angel.recentsCollapsed",recentsMin?"1":"0");renderRecents()};
 $("#chatSearchOpen").onclick=()=>{const w=$("#chatSearchWrap");w.classList.add("open");$("#chatSearchInput").focus();searchList("")};
 $("#chatSearchInput").oninput=e=>searchList(e.target.value);$("#chatSearchInput").onkeydown=e=>{if(e.key==="Escape")$("#chatSearchWrap").classList.remove("open")};
 $("#globalChatSearch").onfocus=()=>{searchList("");$("#chatSearchWrap").classList.add("open");$("#chatSearchInput").focus()};
 $("#globalChatSearch").onkeydown=e=>{if(e.key==="Enter"){searchList(e.target.value);toast("Searching chats")}};
 $("#shareChatTop").onclick=()=>toast("Share link will appear here");
 $("#planOfferTop").onclick=()=>{renderUserMenu(true);$("#aUser").classList.add("is-open")};
 $("#chatMoreTop").onclick=()=>$("#chatMoreWrap").classList.toggle("open");
 document.querySelectorAll("[data-topmore]").forEach(b=>b.onclick=()=>toast(b.dataset.topmore));
 $("#aRecentList").onclick=e=>{const m=e.target.closest("[data-more]");if(m){e.stopPropagation();chatMenu(m.dataset.more,m);return}const r=e.target.closest("[data-chat]");if(r)toast("Opening "+r.querySelector(".aChatTitle").textContent)};
 document.addEventListener("click",e=>{if(!e.target.closest("#aUser"))$("#aUser")?.classList.remove("is-open");if(!e.target.closest("#chatMoreWrap"))$("#chatMoreWrap")?.classList.remove("open")});
 window.addEventListener("angel-refresh-recents",renderRecents);
 renderRecents();renderHome();
}
function searchList(q){const p=$("#chatSearchPopover");if(!p)return;const rows=recentData().filter(x=>!q||x.t.toLowerCase().includes(q.toLowerCase()));p.innerHTML='<div class="aSearchPopTitle">'+(q?"Search results":"Recent searches")+'</div>'+rows.map(x=>'<button class="aSearchResult"><b>'+esc(x.t)+'</b><span>Recent chat · '+x.m+'</span></button>').join("")+(rows.length?"":"<div style='padding:10px;color:var(--a-faint);font-size:9px'>No matching chats.</div>")}
init();
