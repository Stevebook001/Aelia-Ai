const AELIA = {
  apiBase: localStorage.getItem("aelia_api_base") || "",
  model: localStorage.getItem("aelia_model") || "gpt-5.6-luna",
  storageKey: "aelia_workspace_v1"
};

const state = {
  view: "home",
  conversations: JSON.parse(localStorage.getItem(AELIA.storageKey) || "null") || [{
    id: crypto.randomUUID(), title:"Welcome to AELIA", messages:[
      {role:"assistant",content:"Welcome to AELIA AI. This workspace is now interactive. Connect the AELIA API when you are ready for live model responses; until then I can run in local foundation/demo mode."}
    ]
  }],
  agents: [
    {id:"researcher",name:"Research Agent",desc:"Find, compare and synthesize information.",caps:["SEARCH","ANALYZE","VERIFY"],status:"Ready"},
    {id:"developer",name:"Developer Agent",desc:"Plan, write, test and review software.",caps:["READ","WRITE","EXECUTE","VERIFY"],status:"Foundation"},
    {id:"operator",name:"Workflow Operator",desc:"Turn repeatable work into auditable workflows.",caps:["PLAN","SCHEDULE","AUTOMATE"],status:"Foundation"}
  ],
  projects: [
    {name:"AELIA Core",type:"Platform",status:"Active"},
    {name:"Agent Runtime",type:"Engineering",status:"Planning"},
    {name:"Connector Hub",type:"Ecosystem",status:"Planning"}
  ],
  files: [],
  connectors: [
    {name:"Novella Matrix",desc:"First-party business and publishing ecosystem.",status:"Planned",icon:"N"},
    {name:"SeaChat",desc:"First-party sovereign communication connector.",status:"Planned",icon:"S"},
    {name:"Akode",desc:"First-party developer ecosystem connector.",status:"Planned",icon:"A"},
    {name:"GitHub",desc:"Repositories, issues, pull requests and code workflows.",status:"Planned",icon:"G"},
    {name:"Google",desc:"Drive, Calendar, Gmail and workspace services.",status:"Planned",icon:"G"},
    {name:"Microsoft",desc:"OneDrive, Outlook and Microsoft 365 services.",status:"Planned",icon:"M"}
  ]
};

function save(){localStorage.setItem(AELIA.storageKey,JSON.stringify(state.conversations));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2600);}
function activeConv(){return state.conversations[0];}
function setView(view){
  state.view=view; document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  const labels={home:"Home",chat:"Chat",agents:"Agents",projects:"Projects",files:"Files",connectors:"Connectors",workflows:"Workflows",developers:"Developers",settings:"Settings"};
  document.querySelector("#crumb").textContent=labels[view]||"AELIA";
  render();
}
function render(){const root=document.querySelector("#view"); root.innerHTML=views[state.view](); bind(); if(state.view==="chat") scrollMessages();}

const views = {
home:()=>`
  <div class="hero-card">
    <div class="eyebrow">AELIA AI · Light. Intelligence. Yours.</div>
    <h1>One workspace for <span class="gradient">intelligence, creation and action.</span></h1>
    <p>AELIA is being built as a real AI application—not only a landing page. This foundation already includes navigation, chat state, agents, projects, files, connectors, workflows, developer settings and an API integration layer.</p>
    <div class="actions"><button class="btn primary" data-view="chat">Open AELIA Chat →</button><button class="btn secondary" data-view="agents">Build an Agent</button><a class="btn" href="https://wa.me/2348104468690?text=Hello%20AELIA%20AI%20team" target="_blank" rel="noopener">WhatsApp AELIA</a></div>
  </div>
  <div class="stats">
    <div class="stat"><strong>1</strong><span>Unified workspace foundation</span></div><div class="stat"><strong>8+</strong><span>Core capability areas</span></div><div class="stat"><strong>6</strong><span>Connector targets defined</span></div><div class="stat"><strong>API-ready</strong><span>Live provider can be attached</span></div>
  </div>
  <div class="section-title"><div><h2>What is already here</h2><p>Designed to grow into the production platform.</p></div></div>
  <div class="grid">
    <article class="card feature"><div class="card-icon">◌</div><h3>Chat & reasoning</h3><p>Persistent local conversation state, model selection and a backend-ready request path.</p></article>
    <article class="card feature"><div class="card-icon">✦</div><h3>Agent workspace</h3><p>Agent definitions, capability sets and a foundation for task orchestration.</p></article>
    <article class="card feature"><div class="card-icon">◈</div><h3>Connector hub</h3><p>First-party and external services can become scoped AELIA capabilities.</p></article>
    <article class="card feature"><div class="card-icon">▦</div><h3>Projects</h3><p>Separate work by project so context, files, agents and workflows can later be scoped.</p></article>
    <article class="card feature"><div class="card-icon">□</div><h3>Files</h3><p>Browser file selection is available now; persistent object storage comes next.</p></article>
    <article class="card feature"><div class="card-icon">↯</div><h3>Automation</h3><p>Workflow concepts are in place for scheduled and long-running tasks.</p></article>
  </div>`,
chat:()=>`
  <div class="workspace">
    <aside class="conversation-list"><button class="btn secondary" style="width:100%;margin-bottom:8px" data-action="new-chat">＋ New chat</button>${state.conversations.map((c,i)=>`<div class="conv ${i===0?"active":""}"><strong>${esc(c.title)}</strong><small>${c.messages.length} messages</small></div>`).join("")}</aside>
    <section class="chat-panel">
      <div class="chat-head"><div><strong>AELIA Chat</strong><small> · ${esc(AELIA.model)}</small></div><button class="mini" data-action="clear-chat">Clear</button></div>
      <div class="messages" id="messages">${activeConv().messages.map(m=>`<div class="msg ${m.role}"><div class="bubble">${esc(m.content)}</div></div>`).join("")}</div>
      <form class="composer" id="chat-form"><textarea id="chat-input" placeholder="Ask AELIA anything… (Enter to send, Shift+Enter for a new line)"></textarea><button class="send">↑</button></form>
    </section>
  </div>`,
agents:()=>`
  <div class="page-head"><div><h1>Agents</h1><p>Specialized AELIA workers with scoped capabilities.</p></div><button class="btn primary" data-action="new-agent">＋ Create agent</button></div>
  <div class="list">${state.agents.map(a=>`<div class="row"><div class="row-main"><div class="avatar">✦</div><div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small>${a.caps.map(c=>`<span class="tag">${c}</span>`).join("")}</div></div><div class="row-actions"><span class="tag">${esc(a.status)}</span><button class="mini" data-action="agent-run" data-id="${a.id}">Run</button></div></div>`).join("")}</div>`,
projects:()=>`
  <div class="page-head"><div><h1>Projects</h1><p>Project-scoped context, files, agents and workflows.</p></div><button class="btn primary" data-action="new-project">＋ New project</button></div>
  <div class="list">${state.projects.map(p=>`<div class="row"><div class="row-main"><div class="avatar">▦</div><div><strong>${esc(p.name)}</strong><small>${esc(p.type)} · ${esc(p.status)}</small></div></div><button class="mini">Open</button></div>`).join("")}</div>`,
files:()=>`
  <div class="page-head"><div><h1>Files</h1><p>Upload files into the current workspace. Persistent storage is the next backend step.</p></div><label class="btn primary">＋ Upload<input id="file-input" type="file" multiple hidden></label></div>
  <div class="panel"><div class="empty">Drop files here or use Upload. Browser metadata is stored locally in this foundation build.</div></div>
  <div class="list">${state.files.length?state.files.map(f=>`<div class="row"><div class="row-main"><div class="avatar">□</div><div><strong>${esc(f.name)}</strong><small>${f.size} bytes · ${esc(f.type||"unknown")}</small></div></div><span class="tag">Local</span></div>`).join(""):'<div class="empty">No files yet.</div>'}</div>`,
connectors:()=>`
  <div class="page-head"><div><h1>Connector Hub</h1><p>Any authorized app, platform or service can become an AELIA capability.</p></div><button class="btn primary" data-action="add-connector">＋ Add connector</button></div>
  <div class="connector-grid">${state.connectors.map(c=>`<article class="card connector ${c.status==="Connected"?"connected":""}"><span class="state">${esc(c.status)}</span><div class="card-icon">${esc(c.icon)}</div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><div style="margin-top:14px"><button class="mini" data-action="connector" data-name="${esc(c.name)}">${c.status==="Connected"?"Manage":"Configure"}</button></div></article>`).join("")}</div>`,
workflows:()=>`
  <div class="page-head"><div><h1>Workflows</h1><p>Build repeatable, observable multi-step tasks.</p></div><button class="btn primary" data-action="new-workflow">＋ New workflow</button></div>
  <div class="grid"><article class="card feature"><div class="card-icon">↯</div><h3>Research → brief</h3><p>Search sources → extract evidence → synthesize → verify → export.</p><div class="actions"><button class="mini" data-action="workflow-demo">Run demo</button></div></article><article class="card feature"><div class="card-icon">⌘</div><h3>Code delivery</h3><p>Inspect repository → plan → implement → test → review → deploy.</p></article><article class="card feature"><div class="card-icon">◈</div><h3>Ecosystem automation</h3><p>Trigger authorized actions across Novella Matrix, SeaChat and Akode.</p></article></div>`,
developers:()=>`
  <div class="page-head"><div><h1>Developer Center</h1><p>Build on AELIA through API keys, webhooks, MCP and SDKs.</p></div></div>
  <div class="panel"><h3>Base API</h3><p>Production target</p><div class="code">https://api.aeliaai.org/v1</div></div>
  <div class="panel"><h3>MCP server</h3><p>Planned endpoint for AELIA tools and ecosystem interoperability.</p><div class="code">https://mcp.aeliaai.org</div></div>
  <div class="panel"><h3>Example request</h3><pre class="code">curl -X POST https://api.aeliaai.org/v1/chat \
  -H "Authorization: Bearer YOUR_AELIA_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AELIA"}'</pre></div>
  <div class="panel"><h3>Developer domains</h3><p>docs.aeliaai.org · developers.aeliaai.org · status.aeliaai.org</p></div>`,
settings:()=>`
  <div class="page-head"><div><h1>Settings</h1><p>Workspace configuration and future identity controls.</p></div></div>
  <div class="panel"><h3>AELIA identity</h3><p>All official product mail should use the aeliaai.org domain.</p><div class="form-grid"><div class="field"><label>Display name</label><input value="Ibrahim Akanni Ahmad" id="display-name"></div><div class="field"><label>Primary product email</label><input value="hello@aeliaai.org" id="product-email"></div></div></div>
  <div class="panel"><h3>AI connection</h3><p>The browser never receives your provider secret. Configure the API server environment instead.</p><div class="form-grid"><div class="field"><label>API base URL</label><input value="${esc(AELIA.apiBase)}" id="api-base"></div><div class="field"><label>Model</label><input value="${esc(AELIA.model)}" id="model-name"></div></div><div class="actions"><button class="btn primary" data-action="save-settings">Save settings</button></div></div>
  <div class="panel"><h3>Official email aliases to provision</h3><p>hello@aeliaai.org · support@aeliaai.org · security@aeliaai.org · privacy@aeliaai.org · developers@aeliaai.org · billing@aeliaai.org · no-reply@aeliaai.org</p></div>
  <div class="panel"><h3>Security</h3><p>Never paste API keys, SMTP passwords or payment secrets into GitHub source code. Put them in Vercel/Coolify environment variables.</p></div>`
};

async function sendChat(textValue){
  const textValueClean=textValue.trim(); if(!textValueClean)return;
  const conv=activeConv(); conv.messages.push({role:"user",content:textValueClean}); save(); render();
  const pending={role:"assistant",content:"Thinking…"}; conv.messages.push(pending); render();
  try{
    const base=(AELIA.apiBase||"").replace(/\/$/,"");
    if(!base) throw new Error("demo");
    const res=await fetch(base+"/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:textValueClean,model:AELIA.model,conversation_id:conv.id})});
    if(!res.ok) throw new Error("API "+res.status);
    const data=await res.json(); pending.content=data.output||data.message||"AELIA returned an empty response.";
  }catch(e){
    pending.content="Foundation mode response: AELIA received your request, but the live AI provider is not connected yet. Connect api.aeliaai.org (or set an API base URL in Settings) to enable live model responses. Your conversation is already stored locally.";
  }
  save(); render();
}
function scrollMessages(){const m=document.querySelector("#messages");if(m)m.scrollTop=m.scrollHeight;}
function bind(){
  document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>setView(el.dataset.view)));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>actions(el.dataset.action,el.dataset)));
  const form=document.querySelector("#chat-form"); if(form) form.addEventListener("submit",e=>{e.preventDefault();const i=document.querySelector("#chat-input");sendChat(i.value);i.value=""});
  const input=document.querySelector("#chat-input");if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.querySelector("#chat-form").requestSubmit()}});
  const files=document.querySelector("#file-input");if(files)files.addEventListener("change",()=>{[...files.files].forEach(f=>state.files.push({name:f.name,size:f.size,type:f.type}));toast(files.files.length+" file(s) added to local workspace");render()});
}
function actions(action,data){
  if(action==="new-chat"){state.conversations.unshift({id:crypto.randomUUID(),title:"New conversation",messages:[]});setView("chat");return}
  if(action==="clear-chat"){activeConv().messages=[];save();render();return}
  if(action==="toggle-sidebar"){document.querySelector(".sidebar").classList.toggle("open");return}
  if(action==="command-palette"){toast("Command palette foundation ready — Ctrl/Cmd+K can be wired to actions next.");return}
  if(action==="new-agent"){const name=prompt("Agent name?");if(name){state.agents.push({id:crypto.randomUUID(),name,desc:"Custom AELIA agent.",caps:["PLAN","REASON","VERIFY"],status:"Draft"});render();toast("Agent created");}return}
  if(action==="agent-run"){toast("Agent runtime is scaffolded. Live tool execution will be enabled by the API runtime.");return}
  if(action==="new-project"){const name=prompt("Project name?");if(name){state.projects.push({name,type:"Workspace",status:"Active"});render();toast("Project created");}return}
  if(action==="connector"){toast(data.name+" connector is defined and waiting for OAuth/API configuration.");return}
  if(action==="add-connector"){toast("Connector SDK foundation is next: manifest → auth → permissions → tools → health.");return}
  if(action==="new-workflow"){toast("Workflow builder foundation is ready. Next step is persisted workflow execution.");return}
  if(action==="workflow-demo"){toast("Demo workflow queued: search → analyze → verify → export.");return}
  if(action==="save-settings"){AELIA.apiBase=(document.querySelector("#api-base")?.value||"").trim();AELIA.model=(document.querySelector("#model-name")?.value||"gpt-5.6-luna").trim();localStorage.setItem("aelia_api_base",AELIA.apiBase);localStorage.setItem("aelia_model",AELIA.model);toast("AELIA settings saved");checkApi();return}
}
async function checkApi(){
  const el=document.querySelector("#api-state");if(!el)return;
  const base=(AELIA.apiBase||"").replace(/\/$/,"");
  if(!base){el.innerHTML="<i></i> Foundation mode";el.classList.remove("ok");return}
  try{const r=await fetch(base+"/health");if(!r.ok)throw 0;el.innerHTML="<i></i> API online";el.classList.add("ok")}catch{el.innerHTML="<i></i> API unavailable";el.classList.remove("ok")}
}
window.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();toast("Command palette foundation ready.");}});
setView("home"); checkApi();
