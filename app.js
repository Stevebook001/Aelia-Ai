const AELIA={
  apiBase:localStorage.getItem("aelia_api_base")||"/api",
  model:localStorage.getItem("aelia_model")||"gpt-5.6-luna",
  storageKey:"aelia_workspace_v2",
  theme:localStorage.getItem("aelia_theme")||"bright",
  token:localStorage.getItem("aelia_token")||"",
  user:JSON.parse(localStorage.getItem("aelia_user")||"null")
};

const saved=JSON.parse(localStorage.getItem(AELIA.storageKey)||"null");
const state=saved||{
  view:"home",
  conversations:[{id:crypto.randomUUID(),title:"Welcome to AELIA",messages:[{role:"assistant",content:"Welcome to AELIA AI. Your daily intelligence workspace is being built around one principle: ask, create, research, automate and build from one place."}]}],
  agents:[
    {id:"chief",name:"AELIA Chief Agent",desc:"Routes complex requests across specialist agents and verifies results.",caps:["PLAN","DELEGATE","VERIFY","MEMORY"],status:"Ready"},
    {id:"researcher",name:"Research Agent",desc:"Find, compare, synthesize and cite information.",caps:["SEARCH","ANALYZE","VERIFY"],status:"Ready"},
    {id:"developer",name:"Developer Agent",desc:"Plan, write, test and review software.",caps:["READ","WRITE","EXECUTE","DEPLOY"],status:"Foundation"},
    {id:"operator",name:"Workflow Operator",desc:"Turn repeatable work into auditable automations.",caps:["PLAN","SCHEDULE","AUTOMATE"],status:"Foundation"}
  ],
  projects:[{name:"AELIA Core",type:"Platform",status:"Active"},{name:"Agent Runtime",type:"Engineering",status:"Planning"},{name:"Connector Hub",type:"Ecosystem",status:"Planning"}],
  files:[],
  connectors:[
    {name:"Novella Matrix",desc:"First-party business, publishing and platform connector.",status:"Planned",icon:"N"},
    {name:"SeaChat",desc:"First-party communication and identity connector.",status:"Planned",icon:"S"},
    {name:"Akode",desc:"First-party developer and repository connector.",status:"Planned",icon:"A"},
    {name:"GitHub",desc:"Repositories, issues, pull requests and code workflows.",status:"Planned",icon:"G"},
    {name:"Google",desc:"Drive, Calendar, Gmail and workspace services.",status:"Planned",icon:"G"},
    {name:"Microsoft",desc:"OneDrive, Outlook and Microsoft 365 services.",status:"Planned",icon:"M"},
    {name:"Web",desc:"Search, browsing and source-grounded research.",status:"Planned",icon:"W"},
    {name:"Payments",desc:"Billing, credits, subscriptions and invoices.",status:"Planned",icon:"₦"}
  ],
  goals:[{title:"Connect the production AELIA API",done:false},{title:"Create your first AELIA Agent",done:false},{title:"Connect a project or repository",done:false}],
  tasks:[],
  memories:[]
};

function persist(){localStorage.setItem(AELIA.storageKey,JSON.stringify(state));} function save(){persist();}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2600);}
function activeConv(){return state.conversations[0];}
const ROUTES={home:"/",chat:"/chat",agents:"/agents",research:"/research",create:"/create",projects:"/projects",files:"/files",workflows:"/automations",connectors:"/connectors",channels:"/channels",developers:"/developers",settings:"/settings",account:"/account",blog:"/blog",about:"/about",contact:"/contact",legal:"/legal",pricing:"/pricing",docs:"/docs",business:"/business",company:"/company",feedback:"/feedback","blog-submit":"/blog-submit",admin:"/admin",verify:"/verify-email"};
const PATH_TO_VIEW=Object.fromEntries(Object.entries(ROUTES).map(([view,path])=>[path,view]));
const labels={home:"Today",chat:"Chat & Reason",agents:"AELIA Agents",research:"Research",create:"Create",projects:"Projects",files:"Files & Knowledge",workflows:"Automations",connectors:"Connectors",channels:"Channels",developers:"Developers",settings:"Settings",account:"Account",blog:"Blog",about:"About",contact:"Contact",legal:"Terms & Policies",pricing:"Pricing",docs:"Docs",business:"Business",company:"Company",feedback:"Feedback","blog-submit":"Submit a blog",admin:"Admin",verify:"Verify email"};
function routeFor(view){return ROUTES[view]||"/";}
function setView(view,options={}){state.view=view;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));document.querySelector("#crumb").textContent=labels[view]||"AELIA";render();if(options.push!==false){const target=routeFor(view);if(location.pathname!==target)history.pushState({view},"",target);}}
function viewFromPath(pathname){const clean=pathname.replace(/\\/+$/,"")||"/";return PATH_TO_VIEW[clean]||"home";}
function syncRoute(){setView(viewFromPath(location.pathname),{push:false});}
window.addEventListener("popstate",syncRoute);
function render(){document.body.classList.toggle("night",AELIA.theme==="night");document.body.classList.toggle("public-home",state.view==="home");const root=document.querySelector("#view");root.innerHTML=views[state.view]();bind();if(state.view==="chat")scrollMessages();}

const views={
home:()=>`
<section class="oa-home">
  <nav class="oa-nav">
    <button class="oa-brand" data-view="home"><img src="/aelia-mark.svg" alt="AELIA AI"><span>AELIA <b>AI</b></span></button>
    <div class="oa-main-links">
      <button data-view="research">Research</button>
      <button data-action="open-public-menu" data-menu="products">Products</button>
      <button data-view="business">Business</button>
      <button data-view="developers">Developers</button>
      <button data-action="open-public-menu" data-menu="company">Company</button>
    </div>
    <div class="oa-nav-actions"><button class="oa-search" data-action="command-palette">⌕</button><button class="btn primary" data-view="chat">Try AELIA →</button><button class="nav-signin" data-view="account">Sign in</button><button class="mobile-nav" data-action="toggle-public-menu">☰</button></div>
  </nav>
  <div id="public-menu" class="public-menu">
    <div><strong>Research</strong><button data-view="research">Research Overview</button><button data-view="research">Research Index</button><button data-view="research">Economic Research</button><button data-view="legal">Safety & Trust</button><button data-view="legal">Security & Privacy</button><button data-view="legal">Trust & Transparency</button></div>
    <div><strong>Products</strong><button data-view="chat">AELIA Chat & Reason</button><button data-view="agents">AELIA Agents</button><button data-view="projects">AELIA Workspace</button><button data-view="business">AELIA for Teams / Business</button><button data-view="blog">Release Notes</button></div>
    <div><strong>Developers</strong><button data-view="developers">API Platform</button><button data-view="developers">API Log In</button><button data-view="docs">API Docs</button><button data-view="connectors">Connector Hub</button><button data-view="developers">SDKs & Tools</button><button data-view="contact">Developer Forum</button></div>
    <div><strong>Company</strong><button data-view="about">About Us</button><button data-view="blog">Blog</button><button data-view="company">Careers</button><button data-view="contact">Contact Us</button><button data-view="legal">Terms & Policies</button></div>
  </div>
  <section class="oa-hero">
    <div class="oa-hero-copy">
      <span class="eyebrow">LIGHT · INTELLIGENCE · YOURS</span>
      <h1>One intelligence workspace for <span class="gradient">everything you want to build.</span></h1>
      <p>AELIA is being built as a real AI platform—not a decorative chatbot. Chat, research, create, code, work with files, delegate to agents, connect services and automate work from one identity.</p>
      <div class="actions"><button class="btn primary" data-view="chat">Start a chat →</button><button class="btn secondary" data-view="account">Create account / Sign in</button></div>
      <button class="oa-doc-link" data-view="docs">Explore the docs →</button>
    </div>
    <div class="oa-orbit-stage"><div class="luminous-mark large"><span class="mark-ring ring-one"></span><span class="mark-ring ring-two"></span><span class="mark-core">∞</span><span class="mark-spark s1"></span><span class="mark-spark s2"></span><span class="mark-spark s3"></span></div><small>AELIA AI · Built by Novella Matrix</small></div>
  </section>
  <section class="oa-feature-intro"><span class="eyebrow">THE AELIA PLATFORM</span><h2>One intelligence layer. Many ways to work.</h2><p>Explore the complete AELIA vision across conversation, creation, communication, agents, research and developer infrastructure.</p></section>
  <section class="oa-capabilities">
    <article><span>01</span><h2>Chat & Reason</h2><p>Start conversations, keep history, continue where you left off, understand files and work through complex ideas.</p><button data-view="chat">Open chat →</button></article>
    <article><span>02</span><h2>AELIA Agents</h2><p>Delegate research, development, browsing, analysis, repetitive workflows and multi-step tasks to agents with permissions and verification.</p><button data-view="agents">Explore agents →</button></article>
    <article><span>03</span><h2>Research</h2><p>Source-grounded research with evidence, verification, documents, web discovery, comparison and structured briefs.</p><button data-view="research">Explore research →</button></article>
    <article><span>04</span><h2>Create</h2><p>Writing, images, sound, songs, voice, video, presentations, documents, data and code in one surface.</p><button data-view="create">Explore Create →</button></article>
    <article><span>05</span><h2>Connectors</h2><p>Authorized services become tools with permissions, authentication, health checks and auditable actions.</p><button data-view="connectors">Connector Hub →</button></article>
    <article><span>06</span><h2>Developer Platform</h2><p>APIs, SDKs, webhooks, agents, files, media, jobs, usage, MCP-compatible tooling and application infrastructure.</p><button data-view="developers">Build with AELIA →</button></article>
  </section>
  <section class="oa-product-catalog">
    <div class="oa-feature-intro"><span class="eyebrow">WHAT AELIA IS BEING BUILT TO DO</span><h2>More than chat.</h2><p>A complete intelligence workspace for everyday users, creators, teams and developers.</p></div>
    <div class="oa-catalog-grid">
      <button data-view="chat"><b>💬 Chat & Reason</b><small>Conversation, reasoning, history, memory and files.</small></button>
      <button data-view="channels"><b>📞 Voice & Video Calls</b><small>Voice conversations, video calling and communication experiences.</small></button>
      <button data-view="create"><b>🎨 Image Generation</b><small>Generate and edit images, graphics and visual concepts.</small></button>
      <button data-view="create"><b>🎬 Video Generation</b><small>Storyboard, generate, edit, caption and publish video.</small></button>
      <button data-view="create"><b>🎙 Voice & Speech</b><small>Speech input, transcription, narration and conversational voice.</small></button>
      <button data-view="create"><b>🎵 Sound & Song</b><small>Create audio concepts, sound design and music experiences.</small></button>
      <button data-view="agents"><b>🤖 AI Agents</b><small>Plan, delegate, execute, verify and report multi-step work.</small></button>
      <button data-view="research"><b>🌐 Web Research</b><small>Search, browse, compare sources and produce evidence-grounded work.</small></button>
      <button data-view="files"><b>📄 Files & Knowledge</b><small>Upload, extract, organize and work across documents and knowledge.</small></button>
      <button data-view="projects"><b>🧩 Projects</b><small>Keep conversations, files, tools, memory and tasks together.</small></button>
      <button data-view="workflows"><b>⚡ Automations</b><small>Build triggers, workflows, approvals, schedules and notifications.</small></button>
      <button data-view="connectors"><b>🔗 Connectors</b><small>Turn authorized services into scoped AELIA tools.</small></button>
      <button data-view="developers"><b>⌘ Coding & Developer Tools</b><small>Code, repositories, APIs, SDKs, tests and deployment workflows.</small></button>
      <button data-view="developers"><b>🧠 Models & API</b><small>Build applications with AELIA intelligence through APIs.</small></button>
      <button data-view="projects"><b>👥 Team Workspace</b><small>Shared projects, permissions, collaboration and organization controls.</small></button>
      <button data-view="channels"><b>📱 Cross-platform Channels</b><small>Web, mobile, desktop and future communication surfaces.</small></button>
    </div>
  </section>
  <section class="oa-journey"><div><span class="eyebrow">THE JOURNEY</span><h2>From discovery to execution.</h2><p>One identity connects the public experience, conversations, projects, agents, connectors and developer platform.</p></div><div class="oa-steps"><span>Discover</span><i>→</i><span>Create account</span><i>→</i><span>Start chat</span><i>→</i><span>Use tools</span><i>→</i><span>Build projects</span><i>→</i><span>Automate</span></div></section>
  <section class="oa-blog"><div class="oa-section-head"><div><span class="eyebrow">AELIA BLOG</span><h2>Latest from AELIA.</h2><p>Product, engineering, research and company stories.</p></div><button class="btn" data-view="blog">View all posts →</button></div><div class="oa-blog-list"><article><span>AI & Product · October 1, 2026</span><h3>Why the next AI interface should be a workspace, not just a chat box</h3><p>Chat is the doorway. A real AI workspace needs memory, files, research, creation, agents and tools.</p><button data-action="read-blog" data-slug="ai-workspace">Read →</button></article><article><span>Agents · October 1, 2026</span><h3>Designing AI agents around permissions, verification and trust</h3><p>The hardest part of an agent is not giving it more tools. It is defining what it may do and how people verify the result.</p><button data-action="read-blog" data-slug="agents-permissions">Read →</button></article><article><span>Developers · October 1, 2026</span><h3>What a complete AI developer platform should expose</h3><p>AELIA APIs are being planned for chat, agents, research, files, media, connectors, jobs and usage.</p><button data-action="read-blog" data-slug="developer-platform">Read →</button></article></div></section>
  <section class="oa-trust"><div><span class="eyebrow">BUILT IN LAGOS</span><h2>Light. Intelligence. Yours.</h2><p>Built by Novella Matrix · Lagos, Nigeria</p></div><div class="oa-trust-mark"><img src="/aelia-mark.svg" alt="AELIA AI"></div></section>
  <section class="oa-final"><span class="eyebrow">AELIA AI</span><h2>One platform. Many ways to create, reason and act.</h2><div class="actions"><button class="btn primary" data-view="chat">Try AELIA →</button><button class="btn secondary" data-view="account">Create account / Sign in</button></div></section>
</section>`,

today:()=>`
  <div class="page-head"><div><h1>Today</h1><p>Your AELIA daily command center.</p></div><button class="btn primary" data-action="daily-briefing">Generate briefing</button></div>
  <div class="kpi-grid"><div class="kpi"><strong>${state.tasks.filter(t=>t.status==="Next").length}</strong><span>Next actions</span></div><div class="kpi"><strong>${state.tasks.filter(t=>t.status==="In progress").length}</strong><span>In progress</span></div><div class="kpi"><strong>${state.memories.length}</strong><span>Useful memories</span></div></div>
  <div class="section-title"><div><h2>Quick actions</h2><p>Turn intent into work.</p></div></div>
  <div class="quick-grid"><button class="quick" data-action="quick-research"><b>🔎 Research</b><small>Create a research task.</small></button><button class="quick" data-action="quick-write"><b>✍ Create</b><small>Open a creation chat.</small></button><button class="quick" data-action="quick-code"><b>⌘ Build</b><small>Assign Developer Agent.</small></button><button class="quick" data-action="quick-organize"><b>✓ Organize</b><small>Plan daily priorities.</small></button></div>
  <div class="section-title"><div><h2>Priority queue</h2><p>Tasks AELIA knows about right now.</p></div></div>
  <div class="list">${state.tasks.slice(0,5).map(t=>`<div class="row"><div class="row-main"><div class="avatar">✓</div><div><strong>${esc(t.title)}</strong><small>${esc(t.agent)} · ${esc(t.status)}</small></div></div><div class="row-actions"><span class="tag">${esc(t.priority)}</span><button class="mini" data-action="task-done" data-id="${t.id}">Done</button></div></div>`).join("")}</div>`,
tasks:()=>`
  <div class="page-head"><div><h1>Tasks</h1><p>Turn requests into trackable execution.</p></div><button class="btn primary" data-action="new-task">＋ New task</button></div>
  <div class="list">${state.tasks.map(t=>`<div class="row"><div class="row-main"><div class="avatar">${t.status==="Done"?"✓":"•"}</div><div><strong>${esc(t.title)}</strong><small>${esc(t.agent)} · ${esc(t.priority)} priority · ${esc(t.status)}</small></div></div><div class="row-actions">${t.status!=="Done"?`<button class="mini" data-action="task-done" data-id="${t.id}">Mark done</button>`:""}</div></div>`).join("")}</div>
  <div class="panel" style="margin-top:14px"><h3>Production runtime target</h3><p>Persist tasks in the API database, then execute long-running work through workers and queues with progress, retries, approvals and audit logs.</p></div>`,
memory:()=>`
  <div class="page-head"><div><h1>Memory</h1><p>Useful context should be permissioned, inspectable and removable.</p></div><button class="btn primary" data-action="add-memory">＋ Remember</button></div>
  <div class="panel"><h3>Memory architecture</h3><p>Separate conversation context, project memory and long-term user memory. Production memory will need provenance, access rules and deletion controls.</p></div>
  <div class="list">${state.memories.map(m=>`<div class="row"><div class="row-main"><div class="avatar">◎</div><div><strong>${esc(m.title)}</strong><small>${esc(m.text)} · ${esc(m.source)}</small></div></div><button class="mini" data-action="forget-memory" data-id="${m.id}">Forget</button></div>`).join("")}</div>`,
studio:()=>`
  <div class="page-head"><div><h1>AI Studio</h1><p>One workspace for text, images, video, voice, documents and data.</p></div></div>
  <div class="grid"><article class="card feature"><div class="card-icon">✦</div><h3>Image Studio</h3><p>Generate, edit and organize visual assets.</p><button class="mini" data-action="studio-demo">Open foundation</button></article><article class="card feature"><div class="card-icon">▶</div><h3>Video Studio</h3><p>Storyboard, generate, caption and publish.</p><button class="mini" data-action="studio-demo">Open foundation</button></article><article class="card feature"><div class="card-icon">◉</div><h3>Voice Studio</h3><p>Speech, transcription, narration and voice agents.</p><button class="mini" data-action="studio-demo">Open foundation</button></article><article class="card feature"><div class="card-icon">□</div><h3>Document Lab</h3><p>Extract, compare, search and transform documents.</p><button class="mini" data-action="studio-demo">Open foundation</button></article><article class="card feature"><div class="card-icon">⌁</div><h3>Data Lab</h3><p>Analyze datasets and explain findings.</p><button class="mini" data-action="studio-demo">Open foundation</button></article><article class="card feature"><div class="card-icon">◌</div><h3>Web Research</h3><p>Research with evidence and verification.</p><button class="mini" data-action="studio-demo">Open foundation</button></article></div>`,
agents:()=>`
  <div class="page-head"><div><h1>AELIA Agents</h1><p>Specialists that can eventually collaborate under one orchestrator.</p></div><button class="btn primary" data-action="new-agent">＋ Create agent</button></div>
  <div class="grid">${state.agents.map(a=>`<article class="card feature"><div class="card-icon">✦</div><h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p><div>${a.caps.map(c=>`<span class="tag">${c}</span>`).join("")}</div><div class="actions"><span class="tag">${esc(a.status)}</span><button class="mini" data-action="agent-run" data-id="${a.id}">Run</button></div></article>`).join("")}</div>
  <div class="panel" style="margin-top:14px"><h3>Agent architecture</h3><p>User goal → planner → capability search → specialist agents → tool execution → verification → result → memory/audit. Permissions will be enforced by the API runtime before actions can affect connected systems.</p></div>
`,
research:()=>`
  <div class="page-head"><div><h1>Research</h1><p>Turn a question into a structured, source-grounded research job.</p></div><button class="btn primary" data-action="start-research">＋ New research</button></div>
  <div class="grid">
    <article class="card feature"><div class="card-icon">⌕</div><h3>Deep research</h3><p>Discover sources, extract evidence, compare claims and build a brief.</p><div class="actions"><button class="mini" data-action="start-research">Start</button></div></article>
    <article class="card feature"><div class="card-icon">◈</div><h3>Source workspace</h3><p>Keep URLs, documents, notes and extracted evidence together.</p><span class="tag">Planned</span></article>
    <article class="card feature"><div class="card-icon">✓</div><h3>Verification</h3><p>Separate sourced facts, calculations, assumptions and unresolved questions.</p><span class="tag">Planned</span></article>
  </div>
  <div class="panel" style="margin-top:14px"><h3>Research prompt</h3><div class="field"><textarea id="research-input" rows="5" placeholder="What should AELIA research? Include the audience, date range and desired output."></textarea></div><div class="actions"><button class="btn primary" data-action="run-research">Queue research</button></div></div>
`,
create:()=>`
  <div class="page-head"><div><h1>Create</h1><p>AELIA should be a creative workspace, not only a chatbot.</p></div></div>
  <div class="grid">
    <article class="card feature"><div class="card-icon">✧</div><h3>Writing studio</h3><p>Draft, rewrite, summarize, translate and adapt content for different audiences.</p><span class="tag">Text</span></article>
    <article class="card feature"><div class="card-icon">▣</div><h3>Image studio</h3><p>Generate and edit visual concepts through a provider-neutral media layer.</p><span class="tag">Media</span></article>
    <article class="card feature"><div class="card-icon">◉</div><h3>Voice studio</h3><p>Speech input, transcription, narration and conversational voice experiences.</p><span class="tag">Audio</span></article>
    <article class="card feature"><div class="card-icon">▶</div><h3>Video studio</h3><p>Plan, generate, edit and publish video through a controlled media pipeline.</p><span class="tag">Video</span></article>
    <article class="card feature"><div class="card-icon">▦</div><h3>Data studio</h3><p>Analyze tables, clean datasets, calculate metrics and explain findings.</p><span class="tag">Analysis</span></article>
    <article class="card feature"><div class="card-icon">⌘</div><h3>Code studio</h3><p>Build software with repository context, tests, review and deployment hooks.</p><span class="tag">Developer</span></article>
  </div>
`,
projects:()=>`
  <div class="page-head"><div><h1>Projects</h1><p>Persistent context will eventually bind files, agents, tools, memory and tasks to each project.</p></div><button class="btn primary" data-action="new-project">＋ New project</button></div>
  <div class="list">${state.projects.map(p=>`<div class="row"><div class="row-main"><div class="avatar">▦</div><div><strong>${esc(p.name)}</strong><small>${esc(p.type)} · ${esc(p.status)}</small></div></div><button class="mini" data-action="open-project" data-name="${esc(p.name)}">Open</button></div>`).join("")}</div>`,
files:()=>`
  <div class="page-head"><div><h1>Files & Knowledge</h1><p>Local file selection is available now. Production storage, extraction and retrieval come next.</p></div><label class="btn primary">＋ Upload<input id="file-input" type="file" multiple hidden></label></div>
  <div class="grid"><article class="card feature"><div class="card-icon">□</div><h3>Document intelligence</h3><p>Read PDFs, documents and spreadsheets, then ask questions against them.</p></article><article class="card feature"><div class="card-icon">⌁</div><h3>Knowledge memory</h3><p>Store authorized facts and project context with clear controls.</p></article><article class="card feature"><div class="card-icon">⌕</div><h3>Semantic retrieval</h3><p>Find the right context before an agent reasons or acts.</p></article></div>
  <div class="panel" style="margin-top:14px"><div class="empty">Upload files to test the local workspace. Persistent object storage and document processing require production infrastructure.</div></div>
  <div class="list">${state.files.length?state.files.map(f=>`<div class="row"><div class="row-main"><div class="avatar">□</div><div><strong>${esc(f.name)}</strong><small>${f.size} bytes · ${esc(f.type||"unknown")}</small></div></div><span class="tag">Local</span></div>`).join(""):'<div class="empty">No files yet.</div>'}</div>`,
workflows:()=>`
  <div class="page-head"><div><h1>Automations</h1><p>Move from one-off prompts to reliable, observable work.</p></div><button class="btn primary" data-action="new-workflow">＋ New workflow</button></div>
  <div class="grid"><article class="card feature"><div class="card-icon">↯</div><h3>Research → brief</h3><p>Search → extract → synthesize → verify → export.</p><button class="mini" data-action="workflow-demo">Run demo</button></article><article class="card feature"><div class="card-icon">⌘</div><h3>Code delivery</h3><p>Inspect → plan → implement → test → review → deploy.</p></article><article class="card feature"><div class="card-icon">◈</div><h3>Ecosystem automation</h3><p>Trigger authorized actions across Novella Matrix, SeaChat and Akode.</p></article><article class="card feature"><div class="card-icon">◷</div><h3>Scheduled agents</h3><p>Daily briefings, monitoring, recurring research and scheduled jobs.</p></article><article class="card feature"><div class="card-icon">✓</div><h3>Human approval gates</h3><p>Require approval before sensitive external actions or spending.</p></article><article class="card feature"><div class="card-icon">◉</div><h3>Run history</h3><p>Track inputs, tool calls, outputs, failures and verification evidence.</p></article></div>
`,
channels:()=>`
  <div class="page-head"><div><h1>AELIA Channels</h1><p>Bring AELIA into the places people already communicate.</p></div></div>
  <div class="grid">
    <div class="card feature"><div class="card-icon">◉</div><h3>WhatsApp · 08104468690</h3><p>Owner-controlled Baileys gateway is wired into the AELIA API. Pair the phone once, keep the auth volume persistent, and incoming messages can be answered by AELIA.</p><span class="tag">Baileys</span><span class="tag">Linked device</span><div class="actions"><a class="btn primary" href="https://wa.me/2348104468690?text=Hello%20AELIA%20AI" target="_blank" rel="noopener">Open WhatsApp</a><button class="btn" data-action="channel-info" data-channel="whatsapp">Setup checklist</button></div></div>
    <div class="card feature"><div class="card-icon">✈</div><h3>Telegram · BotFather</h3><p>Telegram webhook gateway is wired into the same AELIA API. Create the bot with BotFather, store the bot token server-side, then register the webhook.</p><span class="tag">Bot API</span><span class="tag">Webhook</span><div class="actions"><button class="btn primary" data-action="channel-info" data-channel="telegram">Setup checklist</button></div></div>
    <div class="card feature"><div class="card-icon">∞</div><h3>One AELIA identity</h3><p>Next we link channel identities to AELIA users so the same agent, memory, permissions, projects and tasks can follow the user across web, WhatsApp and Telegram.</p><span class="tag">Identity</span><span class="tag">Memory</span><span class="tag">Permissions</span></div>
  </div>
  <div class="section-title"><div><h2>Channel architecture</h2><p>Every channel becomes an adapter, not a separate brain.</p></div></div>
  <div class="panel"><div class="code">WEB / WHATSAPP / TELEGRAM / FUTURE CHANNELS
        ↓
AELIA CHANNEL GATEWAY
        ↓
IDENTITY → MEMORY → POLICY → AGENT ROUTER
        ↓
TOOLS / CONNECTORS / WORKFLOWS
        ↓
VERIFICATION → RESPONSE → AUDIT</div></div>
`,
connectors:()=>`
  <div class="page-head"><div><h1>Connector Hub</h1><p>Apps become AELIA capabilities through scoped permissions, authentication and health checks.</p></div><button class="btn primary" data-action="add-connector">＋ Add connector</button></div>
  <div class="connector-grid">${state.connectors.map(c=>`<article class="card connector"><span class="state">${esc(c.status)}</span><div class="card-icon">${esc(c.icon)}</div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><div style="margin-top:14px"><button class="mini" data-action="connector" data-name="${esc(c.name)}">${c.status==="Connected"?"Manage":"Configure"}</button></div></article>`).join("")}</div>
  <div class="panel" style="margin-top:14px"><h3>Connector contract</h3><p>Manifest → OAuth/API authentication → permissions → capability discovery → tool execution → health → audit → disconnect/revoke. AELIA should never silently gain access to an external account.</p></div>
`,
developers:()=>`
  <div class="page-head"><div><h1>Developer Center</h1><p>Build AELIA into apps, agents and connected products.</p></div></div>
  <div class="grid"><article class="card feature"><div class="card-icon">⌘</div><h3>API</h3><p>Use AELIA as an intelligence and orchestration layer.</p><span class="tag">api.aeliaai.org</span></article><article class="card feature"><div class="card-icon">◈</div><h3>MCP</h3><p>Expose AELIA capabilities to compatible agent and tool clients.</p><span class="tag">mcp.aeliaai.org</span></article><article class="card feature"><div class="card-icon">⚡</div><h3>SDKs</h3><p>JavaScript, Python and future SDKs can share one provider-neutral contract.</p><span class="tag">Planned</span></article></div>
  <div class="panel"><h3>Base API</h3><div class="code">https://api.aeliaai.org.ng/v1</div></div>
  <div class="panel"><h3>MCP server</h3><div class="code">https://mcp.aeliaai.org</div></div>
  <div class="panel"><h3>Example request</h3><pre class="code">curl -X POST https://api.aeliaai.org.ng/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AELIA"}'</pre></div>
`,
account:()=>`
  <div class="page-head"><div><h1>${AELIA.user?"Your AELIA account":"Join AELIA"}</h1><p>Accounts, conversations, agents and future projects will live behind one AELIA identity.</p></div></div>
  ${AELIA.user?`
    <div class="auth-card"><div class="eyebrow">AELIA IDENTITY</div><h2>Welcome, ${esc(AELIA.user.name||"AELIA user")}.</h2><p>${esc(AELIA.user.email)}</p><div class="account-chip"><div class="account-avatar">${esc((AELIA.user.name||"A").slice(0,1).toUpperCase())}</div><div><strong>Signed in</strong><small>AELIA account is connected to this browser.</small></div></div><div class="actions"><button class="btn" data-action="refresh-account">Refresh account</button><button class="btn secondary" data-action="logout">Sign out</button><button class="btn primary" data-view="chat">Start chatting →</button></div></div>`
  :`
    <div class="auth-card"><div class="auth-tabs"><button class="auth-tab active" data-auth-tab="register">Create account</button><button class="auth-tab" data-auth-tab="login">Sign in</button></div>
      <form id="auth-form" class="auth-form"><input id="auth-name" placeholder="Your name" autocomplete="name" required><input id="auth-email" type="email" placeholder="Email address" autocomplete="email" required><input id="auth-password" type="password" placeholder="Password (8+ characters)" autocomplete="new-password" minlength="8" required><button class="btn primary" type="submit">Create my AELIA account →</button></form>
      <p id="auth-status" style="color:var(--muted);font-size:12px">Your password is sent only to the AELIA API over HTTPS; never put API secrets in the browser.</p>
    </div>`
  }`,
about:()=>`
<div class="page-head"><div><span class="eyebrow">ABOUT AELIA</span><h1>Light. Intelligence. Yours.</h1><p>AELIA AI is a Novella Matrix project being built in Lagos, Nigeria.</p></div></div><div class="panel prose"><h2>What AELIA is</h2><p>A unified intelligence workspace for conversation, reasoning, research, creation, development, files, agents, connectors and automation.</p><h2>What we are building</h2><p>A reliable account and chat foundation first, followed by agents, tools, media, connectors, developer APIs, mobile experiences and deeper automation.</p><h2>Our principle</h2><p>Users should know what AELIA can access, what an agent is doing, which connector is being used and how to disconnect it.</p></div>`,
blog:()=>`
<div class="page-head"><div><span class="eyebrow">AELIA BLOG</span><h1>AI, technology, builders and intelligent software.</h1><p>Original AELIA writing, product updates and carefully sourced explainers.</p></div><button class="btn primary" data-view="blog-submit">Submit a blog →</button></div><div class="blog-grid blog-list"><article class="blog-card"><div class="blog-image image-ai"></div><div class="blog-body"><small>AI Interfaces · Sep 30, 2026</small><h3>Why the next AI interface should be a workspace</h3><p>A modern AI product needs a public website, application workspace, conversations, tools and documentation.</p><button class="mini" data-action="read-blog" data-title="AI workspace">Read →</button></div></article><article class="blog-card"><div class="blog-image image-agents"></div><div class="blog-body"><small>Agents · Sep 30, 2026</small><h3>Designing AELIA Agents around permissions and verification</h3><p>Agents need explicit scopes, approval gates, observable runs and failure handling.</p><button class="mini" data-action="read-blog" data-title="Agents">Read →</button></div></article><article class="blog-card"><div class="blog-image image-dev"></div><div class="blog-body"><small>Engineering · Sep 30, 2026</small><h3>Building a provider-neutral AI platform from Nigeria</h3><p>AELIA uses adapters so models, search, storage and messaging can evolve independently.</p><button class="mini" data-action="read-blog" data-title="Provider neutral">Read →</button></div></article><article class="blog-card"><div class="blog-image image-research"></div><div class="blog-body"><small>AI Research · Sep 2026</small><h3>What current AI research means for everyday software</h3><p>Reasoning, coding agents, multimodal systems and voice are changing the design space.</p><button class="mini" data-action="read-blog" data-title="AI research">Read →</button></div></article></div><div class="panel"><h3>Editorial standard</h3><p>Current claims about models, research or companies are checked against primary sources and dated. AELIA plans are labeled as plans until the feature is actually live.</p></div>`,
docs:()=>`
<div class="page-head"><div><span class="eyebrow">DOCUMENTATION</span><h1>AELIA Docs</h1><p>Learn the product before connecting it to your work.</p></div><button class="btn primary" data-view="chat">Try AELIA →</button></div><div class="doc-layout"><aside class="doc-nav"><strong>Getting started</strong><button data-action="doc-jump" data-target="overview">Overview</button><button data-action="doc-jump" data-target="identity">AELIA ID</button><button data-action="doc-jump" data-target="chat-doc">Chat</button><strong>Build</strong><button data-action="doc-jump" data-target="agents-doc">Agents</button><button data-action="doc-jump" data-target="api-doc">API</button><button data-action="doc-jump" data-target="sdk-doc">SDKs</button><strong>Trust</strong><button data-action="doc-jump" data-target="privacy-doc">Privacy & safety</button></aside><article class="doc-content"><section id="overview"><h2>Overview</h2><p>The public website is the discovery layer; the authenticated workspace is the execution layer.</p></section><section id="identity"><h2>AELIA ID</h2><p>Create an account with email verification. Verified accounts receive an authenticated session for the workspace.</p></section><section id="chat-doc"><h2>Chat</h2><p>Start a new conversation or continue an existing one. Provider credentials remain server-side.</p></section><section id="agents-doc"><h2>Agents</h2><p>Agents are scoped specialists with permissions, tool selection, run status, verification and audit records.</p></section><section id="api-doc"><h2>API</h2><pre class="code">https://api.aeliaai.org.ng/v1
POST /chat
POST /auth/register
POST /auth/login
POST /auth/verify-email
GET  /auth/me
GET  /capabilities
POST /agents/run
POST /research</pre></section><section id="sdk-doc"><h2>SDKs</h2><p>JavaScript and Python SDKs are planned around the same API contract and will be documented when production-ready.</p></section><section id="privacy-doc"><h2>Privacy & safety</h2><p>Never place provider secrets in frontend code. External actions should use least-privilege permissions, rate limits, logs and user approval where appropriate.</p></section></article></div>`,
legal:()=>`
<div class="page-head"><div><span class="eyebrow">LEGAL</span><h1>Terms, privacy and acceptable use</h1><p>These are product foundations and require formal legal review before public launch.</p></div></div><div class="legal-grid"><article class="panel"><h2>Terms of Service</h2><p>Accounts, acceptable use, subscriptions, credits, intellectual property, availability, termination and disputes.</p><span class="tag">Draft foundation</span></article><article class="panel"><h2>Privacy Policy</h2><p>Data collected through accounts, chats, files, feedback and connected services; retention, deletion, exports and controls.</p><span class="tag">Draft foundation</span></article><article class="panel"><h2>Acceptable Use</h2><p>Rules for abuse, fraud, malicious code, credential theft, harmful automation and misuse of connected systems.</p><span class="tag">Draft foundation</span></article><article class="panel"><h2>Cookie & tracking notice</h2><p>Essential cookies, analytics and consent choices where applicable.</p><span class="tag">Draft foundation</span></article></div>`,
feedback:()=>`
<div class="page-head"><div><span class="eyebrow">FEEDBACK</span><h1>Tell AELIA what happened.</h1><p>Bug, idea, complaint, feature request or a problem with any page.</p></div></div><form class="panel form-stack" id="feedback-form"><div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div></div><div class="form-grid"><div class="field"><label>Type</label><select name="type"><option>Bug</option><option>Feature request</option><option>Product feedback</option><option>Safety</option><option>Billing</option><option>Other</option></select></div><div class="field"><label>Page / feature</label><input name="page" value="${esc(state.view)}"></div></div><div class="field"><label>Message</label><textarea name="message" rows="7" required></textarea></div><button class="btn primary" type="submit">Send feedback →</button><p id="feedback-status" class="muted">Feedback is submitted to the AELIA backend.</p></form>`,
"blog-submit":()=>`
<div class="page-head"><div><span class="eyebrow">WRITER PROGRAM</span><h1>Submit an AELIA blog</h1><p>Original technology and AI articles are reviewed before publication. Target review window: 2–5 working days.</p></div></div><form class="panel form-stack" id="blog-form"><div class="form-grid"><div class="field"><label>Author name</label><input name="author" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div></div><div class="form-grid"><div class="field"><label>Article title</label><input name="title" required></div><div class="field"><label>Category</label><select name="category"><option>AI</option><option>Technology</option><option>Developer</option><option>Research</option><option>Product</option></select></div></div><div class="field"><label>Featured image URL</label><input name="image_url" type="url"></div><div class="field"><label>Article</label><textarea name="content" rows="16" required></textarea></div><label class="check"><input type="checkbox" required> I confirm this is my original work and agree to AELIA's terms.</label><button class="btn primary" type="submit">Submit for AELIA review →</button><p id="blog-status" class="muted">Publication is not automatic.</p></form>`,
business:()=>`<section class="public-page"><div class="page-head"><div><span class="eyebrow">AELIA FOR BUSINESS</span><h1>AI workspaces for teams and organizations.</h1><p>Shared projects, permissions, agents, connectors, usage controls and collaboration are part of the AELIA business vision.</p></div><button class="btn primary" data-view="contact">Talk to AELIA →</button></div><div class="feature-grid"><article class="feature-card"><b>Team Workspaces</b><p>Shared context, projects and controlled access.</p></article><article class="feature-card"><b>Organization Controls</b><p>Roles, permissions, usage and audit history.</p></article><article class="feature-card"><b>Business Agents</b><p>Repeatable workflows with approvals and verification.</p></article><article class="feature-card"><b>Enterprise Connectors</b><p>Scoped connections to business systems and services.</p></article></div></section>`,
company:()=>`<section class="public-page"><div class="page-head"><div><span class="eyebrow">COMPANY</span><h1>AELIA AI — Light. Intelligence. Yours.</h1><p>Built by Novella Matrix · Lagos, Nigeria</p></div></div><div class="feature-grid"><article class="feature-card"><b>About Us</b><p>AELIA is being built as a real AI platform—not a decorative chatbot.</p></article><article class="feature-card"><b>Careers</b><p>Future roles across engineering, research, product, design, safety and operations.</p></article><article class="feature-card"><b>Contact</b><p>Questions, partnerships, press and support have a dedicated contact path.</p><button data-view="contact">Contact AELIA →</button></article><article class="feature-card"><b>Blog</b><p>Product, engineering, research and company updates.</p><button data-view="blog">Read the blog →</button></article></div></section>`,
settings:()=>`
  <div class="page-head"><div><h1>Settings</h1><p>Workspace configuration. Production identity and billing will move server-side.</p></div></div>
  <div class="panel"><h3>AELIA identity</h3><p>Official product mail uses the current public domain aeliaai.org.ng.</p><div class="form-grid"><div class="field"><label>Display name</label><input value="Ibrahim Akanni Ahmad" id="display-name"></div><div class="field"><label>Primary product email</label><input value="hello@aeliaai.org" id="product-email"></div></div></div>
  <div class="panel"><h3>AI connection</h3><p>The browser never receives a provider secret. Configure the API server environment instead.</p><div class="form-grid"><div class="field"><label>API base URL</label><input value="${esc(AELIA.apiBase)}" id="api-base"></div><div class="field"><label>Model</label><input value="${esc(AELIA.model)}" id="model-name"></div></div><div class="actions"><button class="btn primary" data-action="save-settings">Save settings</button></div></div>
  <div class="panel"><h3>Official email aliases</h3><p>hello@aeliaai.org.ng · support@aeliaai.org.ng · admin@aeliaai.org.ng · security@aeliaai.org.ng · billing@aeliaai.org.ng · developers@aeliaai.org.ng · blogs@aeliaai.org.ng · no-reply@aeliaai.org.ng</p></div>
  <div class="panel"><h3>Security</h3><p>Never paste API keys, SMTP passwords or payment secrets into GitHub source code. Put secrets in Vercel/Coolify environment variables.</p></div>
`
};

async function postJSON(path,payload){const base=(AELIA.apiBase||"/api").replace(/\/$/,"");const r=await fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json",...(AELIA.token?{"Authorization":"Bearer "+AELIA.token}: {})},body:JSON.stringify(payload)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed");return d;}
async function submitFeedback(e){e.preventDefault();const f=e.currentTarget,s=document.querySelector("#feedback-status");try{await postJSON("/v1/feedback",Object.fromEntries(new FormData(f).entries()));s.textContent="Thanks. Your feedback has been submitted for review.";f.reset();toast("Feedback sent");}catch(err){s.textContent=err.message;}}
async function submitBlog(e){e.preventDefault();const f=e.currentTarget,s=document.querySelector("#blog-status");try{await postJSON("/v1/blog-submissions",Object.fromEntries(new FormData(f).entries()));s.textContent="Submission received. AELIA will review it before publication. Target: 2–5 working days.";f.reset();toast("Blog submitted");}catch(err){s.textContent=err.message;}}
async function sendChat(textValue){
  const clean=textValue.trim();if(!clean)return;
  const conv=activeConv();conv.messages.push({role:"user",content:clean});conv.title=clean.slice(0,42);persist();render();
  const pending={role:"assistant",content:"Thinking…"};conv.messages.push(pending);render();
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");if(!base)throw new Error("no api");
    const res=await fetch(base+"/v1/chat",{method:"POST",headers:{"Content-Type":"application/json",...(AELIA.token?{"Authorization":"Bearer "+AELIA.token}: {})},body:JSON.stringify({message:clean,model:AELIA.model,conversation_id:conv.id,history:conv.messages.slice(-12,-1)})});
    if(!res.ok)throw new Error("API "+res.status);
    const data=await res.json();pending.content=data.output||data.message||"AELIA returned an empty response.";
  }catch(e){pending.content="AELIA foundation mode: your workspace received the request, but the production AI runtime is not connected yet. Connect api.aeliaai.org.ng and its server-side AI credentials to turn this into a live response."; }
  persist();render();
}
function scrollMessages(){const m=document.querySelector("#messages");if(m)m.scrollTop=m.scrollHeight;}
function bind(){
  document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>setView(el.dataset.view)));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>actions(el.dataset.action,el.dataset)));
  const form=document.querySelector("#chat-form");if(form)form.addEventListener("submit",e=>{e.preventDefault();const i=document.querySelector("#chat-input");sendChat(i.value);i.value="";});
  const input=document.querySelector("#chat-input");if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.querySelector("#chat-form").requestSubmit();}});
  const authForm=document.querySelector("#auth-form");
  if(authForm)authForm.addEventListener("submit",async e=>{e.preventDefault();await submitAuth(document.querySelector("#auth-form").dataset.mode||"register");});
  document.querySelectorAll("[data-auth-tab]").forEach(el=>el.addEventListener("click",()=>{document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.remove("active"));el.classList.add("active");const mode=el.dataset.authTab;const name=document.querySelector("#auth-name");const submit=document.querySelector("#auth-form button");if(mode==="login"){name.style.display="none";name.required=false;document.querySelector("#auth-form").dataset.mode="login";submit.textContent="Sign in to AELIA →";document.querySelector("#auth-password").autocomplete="current-password";}else{name.style.display="";name.required=true;document.querySelector("#auth-form").dataset.mode="register";submit.textContent="Create my AELIA account →";document.querySelector("#auth-password").autocomplete="new-password";}}));
  const feedbackForm=document.querySelector("#feedback-form");if(feedbackForm)feedbackForm.addEventListener("submit",submitFeedback);const blogForm=document.querySelector("#blog-form");if(blogForm)blogForm.addEventListener("submit",submitBlog);const files=document.querySelector("#file-input");if(files)files.addEventListener("change",()=>{[...files.files].forEach(f=>state.files.push({name:f.name,size:f.size,type:f.type}));persist();toast(files.files.length+" file(s) added to the local workspace");render();});
}
function actions(action,data){
  if(action==="verify-email"){verifyEmail();return;}
  if(action==="read-blog"){toast("AELIA article reader is being connected to the publishing CMS.");return;}
  if(action==="doc-jump"){document.getElementById(data.target)?.scrollIntoView({behavior:"smooth"});return;}
  if(action==="logout"){AELIA.token="";AELIA.user=null;localStorage.removeItem("aelia_token");localStorage.removeItem("aelia_user");toast("Signed out of AELIA.");setView("account");return;}
  if(action==="refresh-account"){loadCurrentUser();return;}
  if(action==="new-chat"){state.conversations.unshift({id:crypto.randomUUID(),title:"New conversation",messages:[]});persist();setView("chat");return;}
  if(action==="clear-chat"){activeConv().messages=[];persist();render();return;}
  if(action==="toggle-sidebar"){document.querySelector(".sidebar").classList.toggle("open");return;}\n  if(action==="toggle-public-menu"){document.querySelector("#public-menu")?.classList.toggle("open");return;}\n  if(action==="open-public-menu"){document.querySelector("#public-menu")?.classList.add("open");return;}
  if(action==="toggle-theme"){AELIA.theme=AELIA.theme==="night"?"bright":"night";localStorage.setItem("aelia_theme",AELIA.theme);render();return;}
  if(action==="command-palette"){showCommandPalette();return;}
  if(action==="quick-chat"){setView("chat");return;}
  if(action==="quick-research"){setView("research");return;}
  if(action==="quick-create"){setView("create");return;}
  if(action==="quick-code"){setView("developers");return;}
  if(action==="quick-files"){setView("files");return;}
  if(action==="quick-agent"){setView("agents");return;}
  if(action==="quick-automate"){setView("workflows");return;}
  if(action==="quick-connect"){setView("connectors");return;}
  if(action==="new-agent"){const name=prompt("Agent name?");if(name){state.agents.push({id:crypto.randomUUID(),name,desc:"Custom AELIA agent.",caps:["PLAN","REASON","VERIFY"],status:"Draft"});persist();render();toast("Agent created in the workspace.");}return;}
  if(action==="agent-run"){
    const a=state.agents.find(x=>x.id===data.id);
    if(!a)return;
    const task=prompt("What should "+a.name+" do?");
    if(!task)return;
    toast("Sending task to "+a.name+"…");
    fetch((AELIA.apiBase||"").replace(/\/$/,"")+"/v1/agents/run",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({agent:a.id,task,model:AELIA.model})})
      .then(r=>r.json())
      .then(d=>{
        const output=d.output||d.message||"Agent task accepted.";
        state.conversations.unshift({id:crypto.randomUUID(),title:a.name+": "+task.slice(0,28),messages:[{role:"user",content:task},{role:"assistant",content:output}]});
        persist();setView("chat");toast(d.status==="completed"?"Agent completed the task.":"Agent task accepted.");
      })
      .catch(()=>toast("AELIA Agent could not reach the production API."));
    return;
  }
  if(action==="new-project"){const name=prompt("Project name?");if(name){state.projects.push({name,type:"Workspace",status:"Active"});persist();render();toast("Project created.");}return;}
  if(action==="open-project"){toast(data.name+" project workspace is ready for persistent context.");return;}
  if(action==="toggle-goal"){const i=Number(data.index);state.goals[i].done=!state.goals[i].done;persist();render();return;}
  if(action==="connector"){toast(data.name+" is defined; OAuth/API credentials and scoped tools still need to be connected.");return;}
  if(action==="channel-info"){
    if(data.channel==="whatsapp"){
      alert("WHATSAPP TODAY\\n\\n1. Deploy services/messaging on Coolify with a persistent /data volume.\\n2. Set WHATSAPP_PHONE_NUMBER=2348104468690.\\n3. Set AELIA_API_BASE=https://api.aeliaai.org.\\n4. Run: npm run whatsapp:pair\\n5. On your phone: WhatsApp → Settings → Linked Devices → Link with phone number instead.\\n6. Enter the pairing code.\\n7. Keep the messaging service running.");
    }else{
      alert("TELEGRAM TODAY\\n\\n1. Open @BotFather in Telegram.\\n2. Create a bot and copy its token.\\n3. Set TELEGRAM_BOT_TOKEN on the messaging service.\\n4. Set PUBLIC_BASE_URL=https://msg.aeliaai.org.\\n5. Set TELEGRAM_WEBHOOK_SECRET to a random value.\\n6. Deploy the service and POST /telegram/set-webhook once.\\n7. Message the bot and AELIA will answer through the same API.");
    }
    return;
  }
  if(action==="add-connector"){toast("Connector SDK contract: manifest → auth → permissions → tools → health → audit.");return;}
  if(action==="new-workflow"){toast("Workflow builder is next: trigger → steps → tools → approvals → verification → outputs.");return;}
  if(action==="workflow-demo"){toast("Demo workflow queued locally: search → analyze → verify → export.");return;}
  if(action==="start-research"){setView("research");setTimeout(()=>document.querySelector("#research-input")?.focus(),50);return;}
  if(action==="run-research"){const q=document.querySelector("#research-input")?.value.trim();if(!q){toast("Add a research question first.");return;}toast("Research job recorded. Live web research will run through the AELIA API.");state.conversations.unshift({id:crypto.randomUUID(),title:"Research: "+q.slice(0,34),messages:[{role:"user",content:"Research request: "+q},{role:"assistant",content:"Research job created. The production research runtime will gather sources, extract evidence, verify claims and return a structured brief."}]});persist();setView("chat");return;}
  if(action==="agent-run"){const a=state.agents.find(x=>x.id===data.id);if(a){state.tasks.unshift({id:crypto.randomUUID(),title:"Task for "+a.name,status:"Next",priority:"Medium",agent:a.name});save();setView("tasks");toast("Task assigned to "+a.name);}return}
  if(action==="new-task"){const title=prompt("What should AELIA do?");if(title){state.tasks.unshift({id:crypto.randomUUID(),title,status:"Next",priority:"Medium",agent:"Workflow Operator"});save();render();toast("Task added");}return}
  if(action==="task-done"){const t=state.tasks.find(x=>x.id===data.id);if(t){t.status="Done";save();render();toast("Task completed");}return}
  if(action==="add-memory"){const title=prompt("Memory title?");if(title){const text=prompt("What should AELIA remember?")||"";state.memories.unshift({id:crypto.randomUUID(),title,text,source:"User"});save();render();toast("Memory saved locally");}return}
  if(action==="forget-memory"){state.memories=state.memories.filter(m=>m.id!==data.id);save();render();toast("Memory removed");return}
  if(action==="daily-briefing"){setView("today");toast("Briefing prepared from current workspace state");return}
  if(action==="quick-research"){state.tasks.unshift({id:crypto.randomUUID(),title:"Research a new question",status:"Next",priority:"Medium",agent:"Research Agent"});save();setView("tasks");toast("Research task created");return}
  if(action==="quick-write"){setView("chat");setTimeout(()=>{const i=document.querySelector("#chat-input");if(i){i.value="Help me create something useful today: ";i.focus();}},50);return}
  if(action==="quick-code"){state.tasks.unshift({id:crypto.randomUUID(),title:"Start a software build",status:"Next",priority:"High",agent:"Developer Agent"});save();setView("tasks");toast("Developer task created");return}
  if(action==="quick-organize"){state.tasks.unshift({id:crypto.randomUUID(),title:"Organize daily priorities",status:"Next",priority:"High",agent:"Workflow Operator"});save();setView("tasks");toast("Daily planning task created");return}
  if(action==="studio-demo"){toast("AI Studio foundation ready; modality providers come through adapters.");return}
  if(action==="save-settings"){AELIA.apiBase=(document.querySelector("#api-base")?.value||"").trim();AELIA.model=(document.querySelector("#model-name")?.value||"gpt-5.6-luna").trim();localStorage.setItem("aelia_api_base",AELIA.apiBase);localStorage.setItem("aelia_model",AELIA.model);toast("AELIA settings saved.");checkApi();return;}
}
function showCommandPalette(){
  const root=document.querySelector("#modal-root");
  root.innerHTML=`<div class="modal-backdrop" id="command-modal"><div class="modal"><header><h3>AELIA Command Center</h3><button class="close" data-action="close-modal">×</button></header><p>Jump directly to a capability.</p><div class="quick-grid">
    <button class="quick" data-view="chat">Chat & Reason</button><button class="quick" data-view="research">Research</button>
    <button class="quick" data-view="create">Create</button><button class="quick" data-view="agents">Agents</button>
    <button class="quick" data-view="files">Files</button><button class="quick" data-view="workflows">Automate</button>
    <button class="quick" data-view="connectors">Connect</button><button class="quick" data-view="developers">Build</button>
  </div></div></div>`;
  document.querySelectorAll("#command-modal [data-view]").forEach(el=>el.addEventListener("click",()=>{root.innerHTML="";setView(el.dataset.view);}));
  document.querySelector("#command-modal [data-action=close-modal]")?.addEventListener("click",()=>root.innerHTML="");
}
async function checkApi(){
  const el=document.querySelector("#api-state");if(!el)return;const base=(AELIA.apiBase||"").replace(/\/$/,"");
  if(!base){el.innerHTML="<i></i> Foundation mode";el.classList.remove("ok");return;}
  try{const r=await fetch(base+"/health");if(!r.ok)throw 0;const d=await r.json();el.innerHTML="<i></i> AELIA API online";el.classList.add("ok");const mt=document.querySelector("#mode-title"),ms=document.querySelector("#mode-sub");if(mt)mt.textContent=d.mode==="live"?"AELIA live runtime":"AELIA foundation";if(ms)ms.textContent=d.mode==="live"?"AI runtime connected":"API online · provider pending";}catch{el.innerHTML="<i></i> API unavailable";el.classList.remove("ok");}
}
window.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showCommandPalette();}});
syncRoute();checkApi();
async function verifyEmail(){
  const status=document.querySelector("#verify-status"); if(status)status.textContent="Verifying your AELIA email…";
  const token=new URLSearchParams(location.search).get("token");
  if(!token){if(status)status.textContent="This verification link is missing its token.";return;}
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");
    const res=await fetch(base+"/v1/auth/verify-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});
    const data=await res.json(); if(!res.ok)throw new Error(data.error||"Verification failed");
    AELIA.token=data.token;AELIA.user=data.user;localStorage.setItem("aelia_token",AELIA.token);localStorage.setItem("aelia_user",JSON.stringify(AELIA.user));
    if(status)status.textContent="Your email is verified. Your AELIA account is now active.";
    toast("Email verified successfully.");
  }catch(e){if(status)status.textContent=e.message;toast("Email verification failed.");}
}
if(location.pathname==="/verify-email"){setView("verify");verifyEmail();}

async function submitAuth(mode){
  const status=document.querySelector("#auth-status");
  const name=document.querySelector("#auth-name")?.value.trim()||"";
  const email=document.querySelector("#auth-email")?.value.trim()||"";
  const password=document.querySelector("#auth-password")?.value||"";
  if(status)status.textContent=mode==="login"?"Signing in…":"Creating your AELIA account…";
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");
    const res=await fetch(base+"/v1/auth/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="register"?{name,email,password}:{email,password})});
    const data=await res.json();
    if(!res.ok){const err=new Error(data.error||data.message||"Authentication failed");err.code=data.code;throw err;}
    AELIA.token=data.token;AELIA.user=data.user;
    localStorage.setItem("aelia_token",AELIA.token);localStorage.setItem("aelia_user",JSON.stringify(AELIA.user));
    toast("AELIA account ready.");setView("account");
  }catch(e){
    if(status)status.textContent=e.message;
    if(e.code==="EMAIL_UNVERIFIED"){toast("Please verify your email first.");setTimeout(()=>setView("account"),250);}
    else toast("Account request failed.");
  }
}
async function loadCurrentUser(){
  if(!AELIA.token){setView("account");return;}
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");
    const res=await fetch(base+"/v1/auth/me",{headers:{Authorization:"Bearer "+AELIA.token}});
    if(!res.ok)throw new Error("Session expired");
    const data=await res.json();AELIA.user=data.user;localStorage.setItem("aelia_user",JSON.stringify(AELIA.user));render();toast("Account refreshed.");
  }catch(e){AELIA.token="";AELIA.user=null;localStorage.removeItem("aelia_token");localStorage.removeItem("aelia_user");render();toast("Please sign in again.");}
}

function startAeliaExperience(){
  if(sessionStorage.getItem("aelia_boot_seen")) return;
  sessionStorage.setItem("aelia_boot_seen","1");
  const boot=document.createElement("div");
  boot.id="aelia-boot";
  boot.innerHTML='<div class="boot-shell"><div class="boot-mark"><span class="boot-orbit"></span><span class="boot-core">A</span></div><div class="boot-kicker">AELIA AI</div><h2>Light. Intelligence. Yours.</h2><p id="boot-status">Waking your workspace…</p><div class="boot-track"><span></span></div><div class="boot-steps"><span data-step="1">Identity</span><span data-step="2">Workspace</span><span data-step="3">Intelligence</span><span data-step="4">Connectors</span></div><button class="btn primary" id="boot-enter" style="display:none">Enter AELIA →</button></div>';
  document.body.appendChild(boot);
  const status=boot.querySelector("#boot-status");
  const steps=[["1","Checking secure identity layer…"],["2","Preparing your AI workspace…"],["3","Warming reasoning and agent runtime…"],["4","Loading connector-ready capabilities…"],["5","AELIA is ready."]];
  let i=0;
  const tick=()=>{if(i<steps.length){status.textContent=steps[i][1];boot.querySelectorAll("[data-step]").forEach(x=>x.classList.toggle("live",x.dataset.step===steps[i][0]));i++;setTimeout(tick,650)}else{status.textContent="Your workspace is ready.";boot.querySelector("#boot-enter").style.display="inline-flex";}};
  boot.querySelector("#boot-enter").addEventListener("click",()=>{boot.classList.add("leave");setTimeout(()=>boot.remove(),500)});
  tick();
}
startAeliaExperience();
