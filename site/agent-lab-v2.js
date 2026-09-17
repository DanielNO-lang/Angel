import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANGEL_URL = "https://ybvyveonfvixsfusoqqz.supabase.co";
const ANGEL_KEY = "sb_publishable_N5oJC6pzx87-z3pO8MgSwQ_djYeX8o9";
const sb = createClient(ANGEL_URL, ANGEL_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const fn = (name) => `${ANGEL_URL}/functions/v1/${name}`;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

async function getSession() { return (await sb.auth.getSession()).data.session || null; }
async function invoke(name, body) {
  const s = await getSession();
  if (!s) throw new Error("Sign in to use Agent Lab.");
  const r = await fetch(fn(name), { method: "POST", headers: { Authorization:`Bearer ${s.access_token}`, apikey:ANGEL_KEY, "Content-Type":"application/json" }, body:JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || d.detail || `Request failed (${r.status})`);
  return d;
}

function addNav() {
  const navs = document.querySelectorAll(".sidebar .nav");
  const nav = navs[0];
  if (!nav || $("#agentLabNav")) return;
  const b = document.createElement("button");
  b.className = "navBtn";
  b.id = "agentLabNav";
  b.innerHTML = `<span class="navIcon">⚡</span> Agent Lab`;
  const anchor = $("#projectsNav");
  nav.insertBefore(b, anchor || nav.lastElementChild);
  b.onclick = render;
}

function setActive() {
  document.querySelectorAll(".navBtn").forEach((x) => x.classList.remove("active"));
  $("#agentLabNav")?.classList.add("active");
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

function stepTimeline(steps=[]) {
  if (!steps.length) return `<div class="labEmpty">No tool steps recorded.</div>`;
  return `<div class="labTimeline">${steps.map((s,i)=>`<div class="labStep"><span class="labStepMark">${i+1}</span><div><b>${esc(s.tool||"agent step")}</b><small>${esc(s.message||"Tool execution recorded")}</small></div><span class="labStepState">${s.result?.error?"failed":"observed"}</span></div>`).join("")}</div>`;
}

async function runAgent(task) {
  const box = $("#agentResult");
  if (!box || !task.trim()) return;
  box.innerHTML = `<div class="labMuted"><span class="labCheck"></span>Angel is working…</div>`;
  try {
    const maxSteps = Number($("#agentSteps")?.value || 6);
    const d = await invoke("angel-agent", { task:task.trim(), max_steps:maxSteps });
    box.innerHTML = `<div><b>${esc(d.status === "needs_approval" ? "Waiting for your approval" : "Completed")}</b><div class="labResult">${esc(d.answer||"No final answer returned.")}</div>${stepTimeline(d.steps)}${mediaFromSteps(d.steps)}</div>`;
  } catch (e) {
    box.innerHTML = `<div class="labDanger"><b>Agent error</b><div class="labResult">${esc(e.message)}</div></div>`;
  }
  await Promise.all([loadOverview(), loadRuns(), loadTasks(), loadApprovals()]);
}

async function loadOverview() {
  const s = await getSession();
  if (!s) return;
  const [runs,tasks,approvals,assistants] = await Promise.all([
    sb.from("agent_runs").select("id",{count:"exact",head:true}),
    sb.from("agent_tasks").select("id",{count:"exact",head:true}),
    sb.from("agent_approvals").select("id",{count:"exact",head:true}).eq("status","pending"),
    sb.from("assistant_profiles").select("id",{count:"exact",head:true})
  ]);
  $("#metricRuns").textContent = String(runs.count ?? 0);
  $("#metricTasks").textContent = String(tasks.count ?? 0);
  $("#metricApprovals").textContent = String(approvals.count ?? 0);
  $("#metricAssistants").textContent = String(assistants.count ?? 0);
}

async function loadRuns() {
  const host = $("#runList"); if (!host) return;
  const s = await getSession(); if (!s) return;
  const q = await sb.from("agent_runs").select("id,task,status,provider,model,steps,created_at,finished_at,result").order("created_at",{ascending:false}).limit(10);
  if (q.error) { host.innerHTML = `<div class="labEmpty">Run history unavailable.</div>`; return; }
  const items = q.data || [];
  host.innerHTML = items.length ? items.map((x,i)=>`<button class="labItem labRunRow" data-run="${esc(x.id)}"><div><b>${esc(x.task)}</b><small>${esc(x.provider||"auto")}${x.model?` · ${esc(x.model)}`:""} · ${new Date(x.created_at).toLocaleString()}</small></div><span class="labBadge">${esc(x.status)}</span></button>`).join("") : `<div class="labEmpty">Your agent runs will appear here.</div>`;
  host.querySelectorAll("[data-run]").forEach((b)=>b.onclick=()=>showRun(b.dataset.run));
}

async function showRun(id) {
  const s = await getSession(); if (!s) return;
  const q = await sb.from("agent_runs").select("task,status,provider,model,steps,result,created_at,finished_at").eq("id",id).maybeSingle();
  const r = q.data; if (!r) return;
  $("#runDetail").innerHTML = `<div class="labSectionTitle">Run detail</div><h3>${esc(r.task)}</h3><p class="labMuted">${esc(r.provider||"auto")}${r.model?` · ${esc(r.model)}`:""} · ${esc(r.status)}</p><div class="labQuietLine"></div>${stepTimeline(r.steps||[])}<div class="labResult">${esc(r.result?.answer||r.result?.error||"")}</div>`;
  $("#runDetail").scrollIntoView({behavior:"smooth",block:"nearest"});
}

async function loadTasks() {
  const host = $("#taskList"); if (!host) return;
  const s = await getSession(); if (!s) { host.innerHTML=`<div class="labEmpty">Sign in to see your task queue.</div>`; return; }
  const q = await sb.from("agent_tasks").select("id,title,description,due_at,status,created_at").order("created_at",{ascending:false}).limit(10);
  const items = q.data || [];
  host.innerHTML = items.length ? items.map(x=>`<div class="labItem"><div><b>${esc(x.title)}</b><small>${esc(x.description||"")}${x.due_at?` · due ${esc(new Date(x.due_at).toLocaleString())}`:""}</small></div><span class="labBadge">${esc(x.status)}</span></div>`).join("") : `<div class="labEmpty">No tasks yet.</div>`;
}

async function createTask() {
  const s = await getSession(); if (!s) return alert("Sign in first.");
  const title = $("#taskTitle").value.trim(), description=$("#taskDescription").value.trim(), due=$("#taskDue").value;
  if (!title) return alert("Give the task a title.");
  const q = await sb.from("agent_tasks").insert({user_id:s.user.id,title,description:description||null,due_at:due?new Date(due).toISOString():null,source:"agent-lab"}).select("id").single();
  if (q.error) return alert(q.error.message);
  $("#taskTitle").value=""; $("#taskDescription").value=""; $("#taskDue").value=""; await loadTasks(); await loadOverview();
}

async function loadApprovals() {
  const host = $("#approvalList"); if (!host) return;
  const s = await getSession(); if (!s) return;
  const q = await sb.from("agent_approvals").select("id,action_name,action_input,risk_level,status,created_at").eq("status","pending").order("created_at",{ascending:false}).limit(10);
  const items = q.data || [];
  host.innerHTML = items.length ? items.map(x=>`<div class="labItem"><div><b>${esc(x.action_name)}</b><small>${esc(x.risk_level)} risk · ${new Date(x.created_at).toLocaleString()}</small></div><div class="labActions"><button class="labBtn" data-approve="${esc(x.id)}">Approve</button><button class="labBtn" data-reject="${esc(x.id)}">Reject</button></div></div>`).join("") : `<div class="labEmpty">No pending approvals.</div>`;
  host.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>decideApproval(b.dataset.approve,"approved"));
  host.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>decideApproval(b.dataset.reject,"rejected"));
}
async function decideApproval(id,status){const r=await sb.from("agent_approvals").update({status,decided_at:new Date().toISOString()}).eq("id",id).eq("status","pending");if(r.error)alert(r.error.message);else{await loadApprovals();await loadOverview();}}

async function loadProviders() {
  const host = $("#providerList"); if (!host) return;
  try {
    const d = await invoke("angel-tools",{action:"status"});
    const names = Object.entries(d.providers||{});
    host.innerHTML = names.map(([name,ok])=>`<div class="labItem"><div><b>${esc(name)}</b><small>${ok?"Server credential connected":"Not connected"}</small></div><span class="labBadge"><span class="labCheck" style="background:${ok?"var(--angel-sage)":"#5e6762"}"></span>${ok?"ready":"offline"}</span></div>`).join("");
  } catch { host.innerHTML=`<div class="labEmpty">Provider status is only visible after sign-in.</div>`; }
}

async function runParallelResearch() {
  const topic=$("#researchTopic").value.trim(); if(!topic)return;
  const box=$("#parallelResult"); box.textContent="Running three research lenses in parallel…";
  try{
    const queries=[`${topic} latest developments`,`${topic} official documentation or primary sources`,`${topic} expert criticism risks limitations`];
    const results=await Promise.all(queries.map((query)=>invoke("angel-tools",{action:"research",query,max_results:5})));
    box.innerHTML=results.map((r,i)=>`<div class="labItem"><div><b>${["Latest","Primary sources","Criticism & limits"][i]}</b><small>${esc(r.provider||"research")}</small><div class="labResult">${esc(r.answer||"No synthesized answer returned.")}</div></div></div>`).join("");
  }catch(e){box.textContent=e.message||"Parallel research failed.";}
}

async function marketplace() {
  const host=$("#marketList"); if(!host)return;
  const q=await sb.from("assistant_profiles").select("id,name,slug,description,tools,visibility,installs_count").eq("visibility","public").order("published_at",{ascending:false}).limit(12);
  const items=q.data||[];
  host.innerHTML=items.length?items.map(x=>`<div class="labItem"><div><b>${esc(x.name)}</b><small>${esc(x.description||"")}${x.tools?.length?` · ${esc(x.tools.join(", "))}`:""}</small></div><span class="labBadge">${x.installs_count||0} installs</span></div>`).join(""):`<div class="labEmpty">No public assistants yet.</div>`;
}

async function publishAssistant() {
  const s=await getSession();if(!s)return alert("Sign in first.");
  const name=$("#assistantName").value.trim(),slug=$("#assistantSlug").value.trim(),description=$("#assistantDescription").value.trim(),prompt=$("#assistantPrompt").value.trim(),visibility=$("#assistantVisibility").value;
  if(!name||!slug||!prompt)return alert("Name, slug and system prompt are required.");
  const q=await sb.from("assistant_profiles").insert({owner_id:s.user.id,name,slug,description:description||"",system_prompt:prompt,tools:["research_web","create_task","save_memory","generate_image"],visibility,published_at:visibility==="public"?new Date().toISOString():null}).select("id").single();
  if(q.error)return alert(q.error.message);
  ["assistantName","assistantSlug","assistantDescription","assistantPrompt"].forEach((id)=>$("#"+id).value="");
  alert(visibility==="public"?"Assistant published.":"Assistant saved as a draft.");
  await marketplace();await loadOverview();
}

function render() {
  addNav(); setActive();
  $("#page").innerHTML=`<section class="agentLab">
    <div class="agentHero">
      <div class="labCard">
        <div class="labSectionTitle">Angel execution workspace</div>
        <h1 class="pageTitle">Agent Lab</h1>
        <p class="labMuted">A quiet place to create, test, run, review and improve agents. Angel plans, acts, observes, asks for approval when needed, and leaves a trace you can inspect.</p>
      </div>
      <div class="labCard">
        <div class="labSectionTitle">Execution posture</div>
        <div class="labMuted"><span class="labCheck"></span>Guarded by approval gates</div>
        <div class="labMuted" style="margin-top:8px"><span class="labCheck"></span>Persistent run history</div>
        <div class="labMuted" style="margin-top:8px"><span class="labCheck"></span>Multi-provider routing</div>
        <div class="labMuted" style="margin-top:8px"><span class="labCheck"></span>Background scheduling foundation</div>
      </div>
    </div>

    <div class="labOverview">
      <div class="labMetric"><b id="metricRuns">0</b><span>Agent runs</span></div>
      <div class="labMetric"><b id="metricTasks">0</b><span>Tasks</span></div>
      <div class="labMetric"><b id="metricApprovals">0</b><span>Pending approvals</span></div>
      <div class="labMetric"><b id="metricAssistants">0</b><span>Assistant profiles</span></div>
    </div>

    <div class="labRun">
      <div class="labCard">
        <div class="labSectionTitle">Run</div>
        <h3>Give Angel a job</h3>
        <textarea id="agentTask" class="labInput" rows="5" placeholder="Research something, create a task, remember a preference, generate media, or combine several actions."></textarea>
        <div class="labActions" style="align-items:center">
          <label class="labMuted">Steps <select id="agentSteps" class="labInput" style="width:auto;display:inline-block;margin:0 0 0 6px;padding:7px 9px"><option>3</option><option selected>6</option><option>10</option></select></label>
          <button class="labBtn primary" id="runAgent">Run agent</button>
        </div>
        <div id="agentResult" class="labResult"></div>
      </div>
      <div class="labCard" id="runDetail">
        <div class="labSectionTitle">Run detail</div>
        <h3>Nothing selected</h3>
        <p class="labMuted">Run an agent or select a previous run to inspect the execution trace, provider, tools and final result.</p>
      </div>
    </div>

    <div class="labGrid" style="margin-top:14px">
      <div class="labCard"><div class="labSectionTitle">History</div><h3>Recent runs</h3><div id="runList" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Tasks & scheduling</div><h3>Create a task</h3><input id="taskTitle" class="labInput" placeholder="Task title"><textarea id="taskDescription" class="labInput" rows="3" placeholder="What should Angel help you remember or complete?"></textarea><input id="taskDue" class="labInput" type="datetime-local"><div class="labActions"><button class="labBtn primary" id="createTask">Save task</button></div><div class="labQuietLine"></div><div id="taskList" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Research</div><h3>Parallel research</h3><p class="labMuted">Three independent research lenses run together, then return to Angel for synthesis.</p><input id="researchTopic" class="labInput" placeholder="Topic or question"><button class="labBtn primary" id="runParallel">Research in parallel</button><div id="parallelResult" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Safety</div><h3>Approval queue</h3><p class="labMuted">External, destructive or high-impact actions pause here until you decide.</p><div id="approvalList" class="labList"></div></div>
      <div class="labCard"><div class="labSectionTitle">Connections</div><h3>Provider & capability health</h3><div id="providerList" class="labList"></div><div class="labQuietLine"></div><div class="labMuted"><span class="labCheck" style="background:#68716d"></span>Browser / desktop control is not connected yet.</div></div>
      <div class="labCard"><div class="labSectionTitle">Skills</div><h3>Reusable ways of working</h3><div class="labList"><div class="labItem"><div><b>Research Scout</b><small>Search, cross-check, synthesize, cite</small></div><span class="labBadge">skill</span></div><div class="labItem"><div><b>Build Coach</b><small>Plan, code, test, review</small></div><span class="labBadge">skill</span></div><div class="labItem"><div><b>Memory Steward</b><small>Decide what deserves long-term recall</small></div><span class="labBadge">skill</span></div><div class="labItem"><div><b>Visual Analyst</b><small>Images, screenshots, documents</small></div><span class="labBadge">skill</span></div></div></div>
      <div class="labCard"><div class="labSectionTitle">Custom assistants</div><h3>Draft, test, publish</h3><input id="assistantName" class="labInput" placeholder="Assistant name"><input id="assistantSlug" class="labInput" placeholder="assistant-slug"><input id="assistantDescription" class="labInput" placeholder="Short description"><textarea id="assistantPrompt" class="labInput" rows="4" placeholder="System behavior and specialty..."></textarea><select id="assistantVisibility" class="labInput"><option value="private">Private draft</option><option value="unlisted">Unlisted link</option><option value="public">Public marketplace</option></select><div class="labActions"><button class="labBtn primary" id="publishAssistant">Save / publish</button></div></div>
      <div class="labCard" style="grid-column:1/-1"><div class="labSectionTitle">Marketplace</div><h3>Public assistants</h3><div id="marketList" class="labList"></div></div>
    </div>
  </section>`;

  $("#runAgent").onclick=()=>runAgent($("#agentTask").value);
  $("#createTask").onclick=createTask;
  $("#runParallel").onclick=runParallelResearch;
  $("#publishAssistant").onclick=publishAssistant;
  Promise.all([loadOverview(),loadRuns(),loadTasks(),loadApprovals(),loadProviders(),marketplace()]);
}

window.addEventListener("load",()=>{addNav();const b=$("#agentLabNav");if(b)b.onclick=render;});
window.addEventListener("angel-agent-lab-open",render);
