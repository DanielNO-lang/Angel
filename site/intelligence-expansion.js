import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ybvyveonfvixsfusoqqz.supabase.co";
const SUPABASE_KEY = "sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const base = `${SUPABASE_URL}/functions/v1/`;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>\"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" }[c]));

async function session() { return (await sb.auth.getSession()).data.session || null; }
async function invoke(name, body) {
  const s = await session();
  if (!s) throw new Error("Sign in to use Agent Lab.");
  const r = await fetch(`${base}${name}`, { method: "POST", headers: { Authorization: `Bearer ${s.access_token}`, apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || d.detail || `Request failed (${r.status})`);
  return d;
}

const style = document.createElement("style");
style.textContent = `
.agentLab{max-width:1080px;margin:0 auto;padding:30px 24px 120px}.agentHero{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;margin-bottom:18px}.labCard{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);border-radius:20px;padding:20px}.labCard h2,.labCard h3{margin:0 0 8px;font-family:Newsreader,Georgia,serif;font-weight:500}.labMuted{color:#8b9490;font-size:13px;line-height:1.6}.labGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.labInput{width:100%;box-sizing:border-box;background:#0e1416;color:#dce4df;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 13px;font:inherit;margin:8px 0}.labBtn{border:1px solid rgba(255,255,255,.1);background:#121a1d;color:#e7efea;border-radius:12px;padding:10px 13px;cursor:pointer}.labBtn:hover{background:#182226}.labBtn.primary{background:#dbe8df;color:#09100c;border-color:#dbe8df}.labActions{display:flex;gap:8px;flex-wrap:wrap}.labResult{white-space:pre-wrap;color:#dbe5df;line-height:1.65;margin-top:12px}.labList{display:grid;gap:9px;margin-top:10px}.labItem{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;padding:12px 13px;background:rgba(255,255,255,.025);border-radius:13px;border:1px solid rgba(255,255,255,.06)}.labItem small{color:#8b9490;display:block;margin-top:4px}.labMedia{max-width:100%;border-radius:14px;margin-top:12px}.labBadge{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.06);color:#aebbb4}.labSectionTitle{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#8b9490;margin:0 0 8px}.labDanger{border-color:rgba(255,120,120,.25)}@media(max-width:820px){.agentHero,.labGrid{grid-template-columns:1fr}.agentLab{padding:20px 15px 120px}}
`;
document.head.appendChild(style);

function addNav() {
  const nav = document.querySelector(".sidebar .nav");
  if (!nav || $("#agentLabNav")) return;
  const b = document.createElement("button");
  b.className = "navBtn"; b.id = "agentLabNav"; b.innerHTML = `<span class="navIcon">⚡</span> Agent Lab`;
  nav.insertBefore(b, $("#projectsNav") || nav.lastElementChild); b.onclick = render;
}

function mediaFromSteps(steps=[]) {
  let html = "";
  for (const s of steps) {
    const r = s?.result || {};
    if (r.video?.url) html += `<video class="labMedia" controls src="${esc(r.video.url)}"></video>`;
    if (r.url && s.tool === "generate_image") html += `<img class="labMedia" alt="Angel generated image" src="${esc(r.url)}">`;
    if (r.image_base64) html += `<img class="labMedia" alt="Angel generated image" src="data:${esc(r.mime_type||"image/png")};base64,${esc(r.image_base64)}">`;
  }
  return html;
}

async function runAgent(task) {
  const box = $("#agentResult"); if (!box) return;
  box.textContent = "Angel is working…";
  try {
    const d = await invoke("angel-agent", { task, max_steps: 6 });
    box.innerHTML = `<div><b>${esc(d.status === "needs_approval" ? "Waiting for your approval" : "Completed")}</b><div class="labResult">${esc(d.answer || "No final answer returned.")}</div>${mediaFromSteps(d.steps)}</div>`;
  } catch (e) { box.innerHTML = `<div class="labDanger"><b>Agent error</b><div class="labResult">${esc(e.message)}</div></div>`; }
  loadTasks(); loadApprovals();
}

async function loadTasks() {
  const host = $("#taskList"); if (!host) return;
  const s = await session(); if (!s) { host.innerHTML = `<div class="labMuted">Sign in to see your tasks.</div>`; return; }
  const q = await sb.from("agent_tasks").select("id,title,description,due_at,status").order("created_at", { ascending:false }).limit(12);
  const items = q.data || [];
  host.innerHTML = items.length ? items.map(x => `<div class="labItem"><div><b>${esc(x.title)}</b><small>${esc(x.description||"")}${x.due_at?` · due ${esc(new Date(x.due_at).toLocaleString())}`:""}</small></div><span class="labBadge">${esc(x.status)}</span></div>`).join("") : `<div class="labMuted">No tasks yet.</div>`;
}

async function loadApprovals() {
  const host = $("#approvalList"); if (!host) return;
  const s = await session(); if (!s) return;
  const q = await sb.from("agent_approvals").select("id,action_name,action_input,risk_level,status,created_at").eq("status","pending").order("created_at", { ascending:false }).limit(10);
  const items = q.data || [];
  host.innerHTML = items.length ? items.map(x => `<div class="labItem"><div><b>${esc(x.action_name)}</b><small>${esc(x.risk_level)} risk · ${esc(new Date(x.created_at).toLocaleString())}</small></div><div class="labActions"><button class="labBtn" data-approve="${esc(x.id)}">Approve</button><button class="labBtn" data-reject="${esc(x.id)}">Reject</button></div></div>`).join("") : `<div class="labMuted">No pending approvals.</div>`;
  host.querySelectorAll("[data-approve]").forEach(b => b.onclick = () => decide(b.dataset.approve,"approved"));
  host.querySelectorAll("[data-reject]").forEach(b => b.onclick = () => decide(b.dataset.reject,"rejected"));
}
async function decide(id,status){ const r=await sb.from("agent_approvals").update({status,decided_at:new Date().toISOString()}).eq("id",id).eq("status","pending"); if(r.error) alert(r.error.message); else loadApprovals(); }

async function marketplace() {
  const host = $("#marketList"); if (!host) return;
  const q = await sb.from("assistant_profiles").select("id,name,slug,description,tools,installs_count").eq("visibility","public").order("published_at", {ascending:false}).limit(20);
  const items = q.data || [];
  host.innerHTML = items.length ? items.map(x => `<div class="labItem"><div><b>${esc(x.name)}</b><small>${esc(x.description)}${x.tools?.length?` · ${esc(x.tools.join(", "))}`:""}</small></div><span class="labBadge">${x.installs_count||0} installs</span></div>`).join("") : `<div class="labMuted">The public assistant marketplace is ready. Publish your first assistant from the creator form.</div>`;
}

async function publishAssistant() {
  const s = await session(); if (!s) return alert("Sign in first.");
  const name = $("#assistantName")?.value.trim(), slug = $("#assistantSlug")?.value.trim(), description = $("#assistantDescription")?.value.trim(), prompt = $("#assistantPrompt")?.value.trim();
  if (!name || !slug || !prompt) return alert("Name, slug and system prompt are required.");
  const r = await sb.from("assistant_profiles").insert({owner_id:s.user.id,name,slug,description:description||"",system_prompt:prompt,tools:["research_web","create_task","save_memory","generate_image"],visibility:"public",published_at:new Date().toISOString()});
  if (r.error) alert(r.error.message); else { alert("Assistant published."); ["assistantName","assistantSlug","assistantDescription","assistantPrompt"].forEach(id=>{const x=$("#"+id); if(x)x.value=""}); marketplace(); }
}

function render() {
  addNav(); document.querySelectorAll(".navBtn").forEach(x=>x.classList.remove("active")); $("#agentLabNav")?.classList.add("active");
  $("#page").innerHTML = `<section class="agentLab">
    <div class="agentHero"><div class="labCard"><div class="labSectionTitle">Angel execution engine</div><h1 class="pageTitle">Agent Lab</h1><p class="labMuted">Plan → act → observe → repeat. Angel can now use persistent tasks, memory, research, live social search, media generation and approval gates.</p></div><div class="labCard"><div class="labSectionTitle">What is connected</div><div class="labActions"><span class="labBadge">Agent loop</span><span class="labBadge">Memory</span><span class="labBadge">Tasks</span><span class="labBadge">Approvals</span><span class="labBadge">Marketplace</span><span class="labBadge">X search*</span><span class="labBadge">Image*</span><span class="labBadge">Video*</span></div><small class="labMuted">* Provider capability appears when its server credential is configured.</small></div></div>
    <div class="labGrid">
      <div class="labCard"><div class="labSectionTitle">Run Angel</div><h3>Give Angel a job</h3><textarea id="agentTask" class="labInput" rows="5" placeholder="Example: Research the latest AI agent trends, save the important points to memory, and create a task for me to review them tomorrow."></textarea><div class="labActions"><button class="labBtn primary" id="runAgent">Run agent</button><button class="labBtn" id="imageJob">Generate image</button><button class="labBtn" id="videoJob">Generate video</button><button class="labBtn" id="xJob">Search X live</button></div><div id="agentResult" class="labResult"></div></div>
      <div class="labCard"><div class="labSectionTitle">Persistent tasks</div><h3>Your task queue</h3><div id="taskList" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Safety gate</div><h3>Pending approvals</h3><p class="labMuted">Angel will stop before risky external actions instead of silently pretending they happened.</p><div id="approvalList" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Custom assistants</div><h3>Publish your own Angel</h3><input id="assistantName" class="labInput" placeholder="Assistant name"><input id="assistantSlug" class="labInput" placeholder="assistant-slug"><input id="assistantDescription" class="labInput" placeholder="What is this assistant for?"><textarea id="assistantPrompt" class="labInput" rows="4" placeholder="System behavior and specialty..."></textarea><button class="labBtn primary" id="publishAssistant">Publish assistant</button></div>
      <div class="labCard" style="grid-column:1/-1"><div class="labSectionTitle">Assistant marketplace</div><h3>Explore public assistants</h3><div id="marketList" class="labList"></div></div>
    </div>
  </section>`;
  $("#runAgent").onclick = () => runAgent($("#agentTask").value.trim());
  $("#imageJob").onclick = () => { $("#agentTask").value = "Generate an image from this brief: " + ($("#agentTask").value.trim() || "a cinematic portrait of Angel as a calm futuristic intelligence companion"); runAgent($("#agentTask").value); };
  $("#videoJob").onclick = () => { $("#agentTask").value = "Generate a short video from this brief: " + ($("#agentTask").value.trim() || "a cinematic introduction to Angel, a private intelligence companion"); runAgent($("#agentTask").value); };
  $("#xJob").onclick = () => { $("#agentTask").value = "Search X live for: " + ($("#agentTask").value.trim() || "the latest important AI news"); runAgent($("#agentTask").value); };
  $("#publishAssistant").onclick = publishAssistant;
  loadTasks(); loadApprovals(); marketplace();
}

window.addEventListener("load", () => { addNav(); $("#agentLabNav")?.addEventListener("click", render); });
