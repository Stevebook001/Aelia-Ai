const AELIA={
  apiBase:localStorage.getItem("aelia_api_base")||"https://api.aeliaai.org",
  model:localStorage.getItem("aelia_model")||"gpt-5.6-luna",
  storageKey:"aelia_workspace_v2",
  theme:localStorage.getItem("aelia_theme")||"bright"
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
  goals:[{title:"Connect the production AELIA API",done:false},{title:"Create your first AELIA Agent",done:false},{title:"Connect a project or repository",done:false}]
};

function persist(){localStorage.setItem(AELIA.storageKey,JSON.stringify(state));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[c]));}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2600);}
function activeConv(){return state.conversations[0];}
function setView(view){state.view=view;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));const labels={home:"Today",chat:"Chat & Reason",agents:"AELIA Agents",research:"Research",create:"Create",projects:"Projects",files:"Files & Knowledge",workflows:"Automations",connectors:"Connectors",developers:"Developers",settings:"Settings"};document.querySelector("#crumb").textContent=labels[view]||"AELIA";render();}
function render(){document.body.classList.toggle("night",AELIA.theme==="night");const root=document.querySelector("#view");root.innerHTML=views[state.view]();bind();if(state.view==="chat")scrollMessages();}

const views={
home:()=>`
  <div class="hero-card">
    <div class="eyebrow">AELIA AI · Light. Intelligence. Yours.</div>
    <h1>Your intelligence, <span class="gradient">always within reach.</span></h1>
    <p>AELIA is being shaped as a daily AI operating workspace: one place to think, research, create, code, understand files, coordinate agents, connect your apps and automate work. The interface is live now; production capabilities are being connected underneath it.</p>
    <div class="actions"><button class="btn primary" data-view="chat">Ask AELIA →</button><button class="btn secondary" data-view="agents">Meet AELIA Agents</button><button class="btn" data-view="research">Start research</button></div>
  </div>
  <div class="stats">
    <div class="stat"><strong>24/7</strong><span>Designed for daily use</span></div>
    <div class="stat"><strong>30+</strong><span>Capability primitives planned</span></div>
    <div class="stat"><strong>8</strong><span>Connector targets defined</span></div>
    <div class="stat"><strong>4</strong><span>Core agents in foundation</span></div>
    <div class="stat"><strong>1</strong><span>Unified AELIA workspace</span></div>
  </div>
  <div class="section-title"><div><h2>Start anywhere</h2><p>Shortcuts for the things you will do every day.</p></div></div>
  <div class="quick-grid">
    <button class="quick" data-action="quick-chat"><strong>Ask anything</strong><small>Reason through a question, plan or decision.</small></button>
    <button class="quick" data-action="quick-research"><strong>Deep research</strong><small>Gather sources, compare evidence and produce a brief.</small></button>
    <button class="quick" data-action="quick-create"><strong>Create something</strong><small>Write, design, outline, transform or generate.</small></button>
    <button class="quick" data-action="quick-code"><strong>Build software</strong><small>Plan, code, test and review a project.</small></button>
    <button class="quick" data-action="quick-files"><strong>Understand files</strong><small>Summarize, extract, compare and organize documents.</small></button>
    <button class="quick" data-action="quick-agent"><strong>Delegate to an agent</strong><small>Give AELIA a goal and let specialists collaborate.</small></button>
    <button class="quick" data-action="quick-automate"><strong>Automate work</strong><small>Turn repeated steps into observable workflows.</small></button>
    <button class="quick" data-action="quick-connect"><strong>Connect an app</strong><small>Bring an authorized service into AELIA.</small></button>
  </div>
  <div class="section-title"><div><h2>Your AELIA launch checklist</h2><p>These items are persisted locally until the production identity layer arrives.</p></div></div>
  <div class="list">${state.goals.map((g,i)=>`<div class="row"><div class="row-main"><div class="avatar">${g.done?"✓":"○"}</div><div><strong>${esc(g.title)}</strong><small>${g.done?"Completed in this workspace":"Ready for the next build stage"}</small></div></div><button class="mini" data-action="toggle-goal" data-index="${i}">${g.done?"Undo":"Mark done"}</button></div>`).join("")}</div>
`,
chat:()=>`
  <div class="workspace">
    <aside class="conversation-list"><button class="btn secondary" style="width:100%;margin-bottom:8px" data-action="new-chat">＋ New chat</button>${state.conversations.map((c,i)=>`<div class="conv ${i===0?"active":""}"><strong>${esc(c.title)}</strong><small>${c.messages.length} messages</small></div>`).join("")}</aside>
    <section class="chat-panel">
      <div class="chat-head"><div><strong>AELIA Chat</strong><small> · ${esc(AELIA.model)}</small></div><button class="mini" data-action="clear-chat">Clear</button></div>
      <div class="messages" id="messages">${activeConv().messages.map(m=>`<div class="msg ${m.role}"><div class="bubble">${esc(m.content)}</div></div>`).join("")}</div>
      <form class="composer" id="chat-form"><textarea id="chat-input" placeholder="Ask AELIA anything…"></textarea><button class="send">↑</button></form>
    </section>
  </div>`,
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
connectors:()=>`
  <div class="page-head"><div><h1>Connector Hub</h1><p>Apps become AELIA capabilities through scoped permissions, authentication and health checks.</p></div><button class="btn primary" data-action="add-connector">＋ Add connector</button></div>
  <div class="connector-grid">${state.connectors.map(c=>`<article class="card connector"><span class="state">${esc(c.status)}</span><div class="card-icon">${esc(c.icon)}</div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><div style="margin-top:14px"><button class="mini" data-action="connector" data-name="${esc(c.name)}">${c.status==="Connected"?"Manage":"Configure"}</button></div></article>`).join("")}</div>
  <div class="panel" style="margin-top:14px"><h3>Connector contract</h3><p>Manifest → OAuth/API authentication → permissions → capability discovery → tool execution → health → audit → disconnect/revoke. AELIA should never silently gain access to an external account.</p></div>
`,
developers:()=>`
  <div class="page-head"><div><h1>Developer Center</h1><p>Build AELIA into apps, agents and connected products.</p></div></div>
  <div class="grid"><article class="card feature"><div class="card-icon">⌘</div><h3>API</h3><p>Use AELIA as an intelligence and orchestration layer.</p><span class="tag">api.aeliaai.org</span></article><article class="card feature"><div class="card-icon">◈</div><h3>MCP</h3><p>Expose AELIA capabilities to compatible agent and tool clients.</p><span class="tag">mcp.aeliaai.org</span></article><article class="card feature"><div class="card-icon">⚡</div><h3>SDKs</h3><p>JavaScript, Python and future SDKs can share one provider-neutral contract.</p><span class="tag">Planned</span></article></div>
  <div class="panel"><h3>Base API</h3><div class="code">https://api.aeliaai.org/v1</div></div>
  <div class="panel"><h3>MCP server</h3><div class="code">https://mcp.aeliaai.org</div></div>
  <div class="panel"><h3>Example request</h3><pre class="code">curl -X POST https://api.aeliaai.org/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AELIA"}'</pre></div>
`,
settings:()=>`
  <div class="page-head"><div><h1>Settings</h1><p>Workspace configuration. Production identity and billing will move server-side.</p></div></div>
  <div class="panel"><h3>AELIA identity</h3><p>Official product mail should use the aeliaai.org domain.</p><div class="form-grid"><div class="field"><label>Display name</label><input value="Ibrahim Akanni Ahmad" id="display-name"></div><div class="field"><label>Primary product email</label><input value="hello@aeliaai.org" id="product-email"></div></div></div>
  <div class="panel"><h3>AI connection</h3><p>The browser never receives a provider secret. Configure the API server environment instead.</p><div class="form-grid"><div class="field"><label>API base URL</label><input value="${esc(AELIA.apiBase)}" id="api-base"></div><div class="field"><label>Model</label><input value="${esc(AELIA.model)}" id="model-name"></div></div><div class="actions"><button class="btn primary" data-action="save-settings">Save settings</button></div></div>
  <div class="panel"><h3>Official email aliases</h3><p>hello@aeliaai.org · support@aeliaai.org · security@aeliaai.org · privacy@aeliaai.org · developers@aeliaai.org · billing@aeliaai.org · partnerships@aeliaai.org · no-reply@aeliaai.org</p></div>
  <div class="panel"><h3>Security</h3><p>Never paste API keys, SMTP passwords or payment secrets into GitHub source code. Put secrets in Vercel/Coolify environment variables.</p></div>
`
};

async function sendChat(textValue){
  const clean=textValue.trim();if(!clean)return;
  const conv=activeConv();conv.messages.push({role:"user",content:clean});conv.title=clean.slice(0,42);persist();render();
  const pending={role:"assistant",content:"Thinking…"};conv.messages.push(pending);render();
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");if(!base)throw new Error("no api");
    const res=await fetch(base+"/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:clean,model:AELIA.model,conversation_id:conv.id,history:conv.messages.slice(-12,-1)})});
    if(!res.ok)throw new Error("API "+res.status);
    const data=await res.json();pending.content=data.output||data.message||"AELIA returned an empty response.";
  }catch(e){pending.content="AELIA foundation mode: your workspace received the request, but the production AI runtime is not connected yet. Connect api.aeliaai.org and its server-side AI credentials to turn this into a live response."; }
  persist();render();
}
function scrollMessages(){const m=document.querySelector("#messages");if(m)m.scrollTop=m.scrollHeight;}
function bind(){
  document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>setView(el.dataset.view)));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>actions(el.dataset.action,el.dataset)));
  const form=document.querySelector("#chat-form");if(form)form.addEventListener("submit",e=>{e.preventDefault();const i=document.querySelector("#chat-input");sendChat(i.value);i.value="";});
  const input=document.querySelector("#chat-input");if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.querySelector("#chat-form").requestSubmit();}});
  const files=document.querySelector("#file-input");if(files)files.addEventListener("change",()=>{[...files.files].forEach(f=>state.files.push({name:f.name,size:f.size,type:f.type}));persist();toast(files.files.length+" file(s) added to the local workspace");render();});
}
function actions(action,data){
  if(action==="new-chat"){state.conversations.unshift({id:crypto.randomUUID(),title:"New conversation",messages:[]});persist();setView("chat");return;}
  if(action==="clear-chat"){activeConv().messages=[];persist();render();return;}
  if(action==="toggle-sidebar"){document.querySelector(".sidebar").classList.toggle("open");return;}
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
  if(action==="agent-run"){toast("Agent execution is waiting for the production runtime, permissions and tools.");return;}
  if(action==="new-project"){const name=prompt("Project name?");if(name){state.projects.push({name,type:"Workspace",status:"Active"});persist();render();toast("Project created.");}return;}
  if(action==="open-project"){toast(data.name+" project workspace is ready for persistent context.");return;}
  if(action==="toggle-goal"){const i=Number(data.index);state.goals[i].done=!state.goals[i].done;persist();render();return;}
  if(action==="connector"){toast(data.name+" is defined; OAuth/API credentials and scoped tools still need to be connected.");return;}
  if(action==="add-connector"){toast("Connector SDK contract: manifest → auth → permissions → tools → health → audit.");return;}
  if(action==="new-workflow"){toast("Workflow builder is next: trigger → steps → tools → approvals → verification → outputs.");return;}
  if(action==="workflow-demo"){toast("Demo workflow queued locally: search → analyze → verify → export.");return;}
  if(action==="start-research"){setView("research");setTimeout(()=>document.querySelector("#research-input")?.focus(),50);return;}
  if(action==="run-research"){const q=document.querySelector("#research-input")?.value.trim();if(!q){toast("Add a research question first.");return;}toast("Research job recorded. Live web research will run through the AELIA API.");state.conversations.unshift({id:crypto.randomUUID(),title:"Research: "+q.slice(0,34),messages:[{role:"user",content:"Research request: "+q},{role:"assistant",content:"Research job created. The production research runtime will gather sources, extract evidence, verify claims and return a structured brief."}]});persist();setView("chat");return;}
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
setView("home");checkApi();
