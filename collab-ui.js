(()=> {
 const API="https://api.aeliaai.org.ng";
 const scopes=[["platform:read","Platform health"],["capabilities:read","Capability discovery"],["chat:execute","Chat execution"],["agents:run","Agent execution"]];
 views.collab=()=>`
 <section class="public-page">
  <div class="page-head"><div><span class="eyebrow">VERIFIED PARTNER INTEGRATIONS</span><h1>Connect your platform to <span class="gradient">AELIA.</span></h1><p>Every organization must prove control of its website domain and contact email. AELIA then performs a manual security review before issuing scoped access.</p></div><a class="btn" href="https://developers.aeliaai.org.ng/collaboration">Partner API docs →</a></div>
  <div class="contact-grid">
   <form id="collab-application" class="panel">
    <h2>Request a partner connection</h2><p class="muted">Do not submit passwords, API keys or private credentials in this form.</p>
    <label>Organization / platform name</label><input name="organization_name" required minlength="2" maxlength="160" placeholder="Your company or platform">
    <label>Official website (HTTPS)</label><input name="website_url" type="url" required placeholder="https://example.com">
    <label>Authorized contact name</label><input name="contact_name" required minlength="2" placeholder="Responsible contact">
    <label>Organization email</label><input name="contact_email" type="email" required placeholder="developer@example.com">
    <label>Integration purpose and data flow</label><textarea name="purpose" required minlength="20" maxlength="3000" placeholder="Explain what you want to connect, what data is exchanged and who will use it."></textarea>
    <label>Requested permissions</label><div class="scope-grid">${scopes.map(([v,l])=>'<label><input type="checkbox" name="scope" value="'+v+'" '+(["platform:read","capabilities:read"].includes(v)?"checked":"")+'> '+l+'</label>').join("")}</div>
    <button class="btn primary" type="submit">Submit for ownership verification →</button>
    <div id="collab-result" class="panel" style="display:none;margin-top:16px" aria-live="polite"></div>
   </form>
   <div class="panel"><h2>Approval process</h2><ol class="numbered"><li><b>Application screening</b><p>Organization, use case, requested scopes and website are reviewed.</p></li><li><b>DNS domain proof</b><p>Publish a unique TXT record under your organization-controlled domain.</p></li><li><b>Contact email proof</b><p>The named contact must confirm their email address.</p></li><li><b>Manual security review</b><p>An AELIA administrator checks identity, purpose, scopes and risk.</p></li><li><b>Scoped credential issuance</b><p>Only approved permissions are granted. Credentials expire and can be revoked.</p></li></ol><p class="muted">Submission does not grant access. No application is automatically approved.</p></div>
  </div>
 </section>`;
 views.collaborationDocs=()=>`
 <section class="public-page"><div class="page-head"><div><span class="eyebrow">PARTNER API · VERSION 1.0</span><h1>Build a verified connection to AELIA.</h1><p>REST and MCP integrations with domain proof, contact-email verification, least-privilege scopes and manual approval.</p></div><a class="btn" href="https://collab.aeliaai.org.ng/">Apply to collaborate →</a></div>
 <div class="panel"><h2>1. Verify your organization</h2><p>Apply at collab.aeliaai.org.ng. Publish the unique DNS TXT challenge and verify the contact email sent to the authorized contact. An application enters manual review only after both checks pass.</p><pre>Type: TXT
Host: _aelia-verification.example.com
Value: aeliaai-verification=&lt;unique-token&gt;</pre></div>
 <div class="panel"><h2>2. REST API base</h2><p><code>https://api.aeliaai.org.ng/v1/collab/v1</code></p><pre>GET  /health
GET  /capabilities
POST /chat
POST /agents/run</pre><p>Every request requires an approved partner credential:</p><pre>Authorization: Bearer aelia_live_...</pre><p>Rate limit: 60 requests per minute per credential. Keys expire after 90 days.</p></div>
 <div class="panel"><h2>3. Available permissions</h2><ul><li><code>platform:read</code> — health status.</li><li><code>capabilities:read</code> — capability discovery.</li><li><code>chat:execute</code> — chat requests.</li><li><code>agents:run</code> — agent execution.</li></ul><p>Only permissions approved by AELIA are attached to the credential.</p></div>
 <div class="panel"><h2>4. MCP endpoint</h2><p><code>https://mcp.aeliaai.org.ng/mcp</code></p><p>MCP Streamable HTTP discovery is public. Executable tools require an approved partner key with the corresponding scope. Use the same bearer credential in the Authorization header.</p></div>
 <div class="panel"><h2>5. Security rules</h2><ul><li>Never expose API keys in browser code or public repositories.</li><li>Keep credentials in server-side secret storage.</li><li>Every key is scoped, hashed at rest, expires and is revocable.</li><li>All approval and integration events are audited.</li><li>Partner origins are allowed for browser CORS only after approval.</li></ul><p>Security contact: <a href="mailto:security@aeliaai.org.ng">security@aeliaai.org.ng</a></p></div>
 </section>`;
 function show(html){const el=document.querySelector("#collab-result");if(el){el.style.display="block";el.innerHTML=html;}}
 async function checkDomain(appId){
  const el=document.querySelector("#collab-result");if(!el)return;
  const btn=el.querySelector("[data-check-domain]");if(btn){btn.disabled=true;btn.textContent="Checking DNS…";}
  try{const r=await fetch(API+"/v1/collab/applications/"+encodeURIComponent(appId)+"/verify-domain",{method:"POST"}),d=await r.json();if(!r.ok)throw new Error(d.error||"DNS verification is not complete.");
   show("<b>Domain ownership verified.</b><p>"+esc(d.message)+"</p><p>Status: "+esc(d.status)+". Manual AELIA approval is still required.</p>");
  }catch(e){show("<b>DNS verification is not complete yet.</b><p>"+esc(e.message)+"</p><button class='btn' data-check-domain='"+appId+"'>Try DNS check again</button>");}
 }
 document.addEventListener("click",e=>{const b=e.target.closest("[data-check-domain]");if(b)checkDomain(b.dataset.checkDomain);});
 document.addEventListener("submit",async e=>{
  if(e.target.id!=="collab-application")return;e.preventDefault();
  const form=e.target,button=form.querySelector('button[type="submit"]'),fd=new FormData(form);
  const payload={organization_name:fd.get("organization_name"),website_url:fd.get("website_url"),contact_name:fd.get("contact_name"),contact_email:fd.get("contact_email"),purpose:fd.get("purpose"),requested_scopes:fd.getAll("scope")};
  button.disabled=true;button.textContent="Submitting…";
  try{const r=await fetch(API+"/v1/collab/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),d=await r.json();if(!r.ok)throw new Error(d.error||"Application failed");
   sessionStorage.setItem("aelia_collab_application",d.application_id);
   show("<b>Application received. Access has NOT been granted.</b><p>Application ID: "+esc(d.application_id)+"</p><p>Contact verification email: "+(d.email_verification_email_sent?"sent":"not sent — AELIA email delivery needs configuration")+"</p><p>Publish this DNS TXT record exactly:</p><pre>Host: "+esc(d.dns_verification.host)+"\nValue: "+esc(d.dns_verification.value)+"</pre><p>After DNS propagation, verify domain ownership. Both ownership checks and manual approval are required.</p><button class='btn' data-check-domain='"+d.application_id+"'>Check domain ownership</button>");
   form.reset();
  }catch(err){show("<b>Could not submit application.</b><p>"+esc(err.message)+"</p>");}
  finally{button.disabled=false;button.textContent="Submit for ownership verification →";}
 });
 async function verifyEmailLink(){
  const p=new URLSearchParams(location.search),id=p.get("verify_email"),token=p.get("token");if(!id||!token)return;
  const r=await fetch(API+"/v1/collab/applications/"+encodeURIComponent(id)+"/verify-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})}),d=await r.json();
  if(r.ok)show("<b>Contact email verified.</b><p>"+esc(d.message)+"</p><p>Status: "+esc(d.status)+". AELIA administrators must still approve the application.</p>");
  else show("<b>Email verification failed.</b><p>"+esc(d.error||"The verification link may have expired.")+"</p>");
 }
 if(location.hostname==="collab.aeliaai.org.ng"&&location.pathname==="/"){setView("collab",{push:false});verifyEmailLink().catch(e=>show("<b>Verification error</b><p>"+esc(e.message)+"</p>"));}
 if(location.hostname==="developers.aeliaai.org.ng"&&location.pathname.replace(/\/$/,"")==="/collaboration"){
  setView("collaborationDocs",{push:false});
  document.title="AELIA Collaboration API — Partner Developer Guide";
  const meta=(name,value)=>{let el=document.querySelector('meta[name="'+name+'"]');if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el);}el.content=value;};
  meta("description","Integrate with AELIA AI using verified organization ownership, scoped partner API keys, REST endpoints and MCP tools.");
  meta("robots","index,follow");
 }
})();