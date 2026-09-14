(() => {
  const KEY = 'angel.workspace.mode';
  const modes = [
    ['auto','Auto'], ['research','Research'], ['build','Build'], ['agent','Agent'], ['create','Create'], ['memory','Memory']
  ];
  const getMode = () => localStorage.getItem(KEY) || 'auto';
  const setMode = mode => localStorage.setItem(KEY, mode);
  const labelFor = mode => (modes.find(x => x[0] === mode) || modes[0])[1];

  function addStyles() {
    if (document.getElementById('angelLabsStyle')) return;
    const style = document.createElement('style');
    style.id = 'angelLabsStyle';
    style.textContent = `
      .angelModeBar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:0 0 8px}
      .angelMode{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#8b9490;border-radius:999px;padding:6px 10px;font:600 10px/1 DM Sans,sans-serif;cursor:pointer;transition:.2s ease}
      .angelMode:hover,.angelMode.active{color:#f5f1e9;border-color:rgba(34,215,232,.35);background:rgba(34,215,232,.07)}
      .angelModeDot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#22d7e8;margin-right:5px;vertical-align:1px;opacity:.7}
      .angelLab{padding:34px 0 100px;max-width:980px;margin:auto}
      .angelLabHead{margin-bottom:28px}
      .angelLabKicker{font:700 10px/1.2 DM Sans,sans-serif;letter-spacing:.16em;color:#22d7e8;text-transform:uppercase}
      .angelLab h1{font:500 42px/1.05 Newsreader,serif;color:#f5f1e9;margin:8px 0}
      .angelLabLead{color:#8b9490;max-width:680px;line-height:1.7;font-size:13px}
      .angelLabGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .angelLabCard{padding:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);border-radius:14px;text-align:left;color:#f5f1e9;cursor:pointer;transition:.22s ease}
      .angelLabCard:hover{transform:translateY(-2px);border-color:rgba(34,215,232,.35);background:rgba(34,215,232,.045)}
      .angelLabCard b{display:block;font:600 15px DM Sans,sans-serif;margin-bottom:7px}
      .angelLabCard p{margin:0;color:#8b9490;font:400 11px/1.6 DM Sans,sans-serif}
      .angelLabTag{display:inline-block;margin-bottom:16px;color:#d39a67;font:700 9px DM Sans,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      .angelMission{margin-top:22px;border:1px solid rgba(211,154,103,.18);background:rgba(211,154,103,.035);border-radius:14px;padding:16px;color:#8b9490;font:11px/1.65 DM Sans,sans-serif}
      .angelMission strong{color:#f5f1e9}
      @media(max-width:700px){.angelLab{padding:22px 0 90px}.angelLab h1{font-size:34px}.angelLabGrid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function addModeBar() {
    const composer = document.querySelector('.composerInner');
    if (!composer || document.getElementById('angelModeBar')) return;
    const bar = document.createElement('div');
    bar.id = 'angelModeBar';
    bar.className = 'angelModeBar';
    bar.innerHTML = modes.map(([id,label]) => `<button type="button" class="angelMode ${getMode()===id?'active':''}" data-angel-mode="${id}"><span class="angelModeDot"></span>${label}</button>`).join('');
    composer.insertBefore(bar, composer.firstChild);
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-angel-mode]'); if (!b) return;
      const mode = b.dataset.angelMode; setMode(mode);
      bar.querySelectorAll('.angelMode').forEach(x => x.classList.toggle('active', x === b));
      const research = document.getElementById('researchBtn');
      if (mode === 'research' && research && !research.classList.contains('active')) research.click();
      if (mode !== 'research' && research && research.classList.contains('active')) research.click();
      const input = document.getElementById('message');
      if (input) input.placeholder = mode === 'auto' ? 'Ask Angel anything…' : `${labelFor(mode)} mode · Tell Angel what to do…`;
    });
  }

  function injectContext() {
    const input = document.getElementById('message'); if (!input || !input.value.trim()) return;
    const mode = getMode(); if (mode === 'auto' || input.dataset.angelContext === mode) return;
    input.value = `${input.value.trim()}\n\n[Angel workspace mode: ${labelFor(mode)}. Treat this as a ${labelFor(mode).toLowerCase()} task.]`;
    input.dataset.angelContext = mode;
  }

  function openLab() {
    const page = document.getElementById('page'); if (!page) return;
    document.querySelectorAll('.navBtn').forEach(x => x.classList.remove('active'));
    document.getElementById('angelLabNav')?.classList.add('active');
    page.innerHTML = `<section class="angelLab">
      <div class="angelLabHead"><div class="angelLabKicker">Angel Mission Control</div><h1>From assistant to operating system.</h1><p class="angelLabLead">A capability layer inspired by the strongest open-source agent patterns: persistent memory, research trails, browser/computer control, voice, multi-agent work, skills and living artifacts.</p></div>
      <div class="angelLabGrid">
        <button class="angelLabCard" data-task="Research the latest information on this topic, cross-check sources, identify disagreements, and give me a cited synthesis."><span class="angelLabTag">Research engine</span><b>Deep Research</b><p>Evidence trail, source comparison and synthesis instead of a one-shot answer.</p></button>
        <button class="angelLabCard" data-task="Turn my idea into a build plan. Break it into milestones, architecture, files, risks, and the smallest working version first."><span class="angelLabTag">Builder</span><b>Build Mode</b><p>Convert ideas into executable milestones and working product increments.</p></button>
        <button class="angelLabCard" data-task="Act as my agent architect. Analyze this task, decide what tools or specialists are needed, produce a safe execution plan, and clearly mark anything that requires my approval."><span class="angelLabTag">Agent runtime</span><b>Mission Planning</b><p>Progressive autonomy with explicit approval boundaries.</p></button>
        <button class="angelLabCard" data-task="Design a useful mini-app for this idea. Define the interface, data flow, user actions, and a first implementation that can become a real feature in Angel."><span class="angelLabTag">Living artifacts</span><b>Micro-App Forge</b><p>Move beyond chat into tools, workflows and reusable artifacts.</p></button>
        <button class="angelLabCard" data-task="Organize this information into durable memory. Separate preferences, facts, projects, decisions, and temporary context, and tell me what should be remembered."><span class="angelLabTag">Second brain</span><b>Memory Graph</b><p>Turn useful conversations into structured, durable knowledge.</p></button>
        <button class="angelLabCard" data-task="Design a safe browser-agent workflow for this task. List the pages it would need, the actions it would take, and where a human approval should be required before an irreversible action."><span class="angelLabTag">Computer use</span><b>Browser & Computer Agent</b><p>Prepare Angel for browser control without pretending unsafe automation is already connected.</p></button>
      </div>
      <div class="angelMission"><strong>Foundation:</strong> chat, orchestration, research, voice, file/image analysis, authentication, memory and provider routing. <strong>Frontier:</strong> tool execution, browser control, MCP skills, multi-agent delegation and artifact generation.</div>
    </section>`;
    page.querySelectorAll('[data-task]').forEach(card => card.addEventListener('click', () => {
      const input = document.getElementById('message'); if (!input) return;
      input.value = card.dataset.task; input.focus(); input.dispatchEvent(new Event('input',{bubbles:true}));
      document.querySelector('.composer')?.scrollIntoView({behavior:'smooth',block:'end'});
    }));
  }

  function install() {
    addStyles(); addModeBar();
    const nav = document.querySelector('.sidebar .nav');
    if (nav && !document.getElementById('angelLabNav')) {
      const b = document.createElement('button'); b.className='navBtn'; b.id='angelLabNav'; b.innerHTML='<span class="navIcon">◈</span> Mission Control';
      b.addEventListener('click', openLab); nav.appendChild(b);
    }
    document.addEventListener('click', e => { if (e.target.closest('#sendBtn')) injectContext(); }, true);
    document.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'message') injectContext(); }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
