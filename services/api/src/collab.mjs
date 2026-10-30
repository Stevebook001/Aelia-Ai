import crypto from "node:crypto";
import {resolveTxt} from "node:dns/promises";
import net from "node:net";

const ALLOWED_SCOPES=new Set(["platform:read","capabilities:read","chat:execute","agents:run"]);
const hash=value=>crypto.createHash("sha256").update(String(value)).digest("hex");
const safeEqual=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y);};
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const json=(res,status,data)=>{const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Allow-Methods":"GET,POST,PATCH,OPTIONS","Vary":"Origin"};if(res.__aeliaCorsOrigin)headers["Access-Control-Allow-Origin"]=res.__aeliaCorsOrigin;res.writeHead(status,headers);res.end(JSON.stringify(data));};
const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""));
const validDomain=value=>{const d=String(value||"").toLowerCase().replace(/\.$/,"");return d.length<=253&&d.includes(".")&&!net.isIP(d)&&d.split(".").every(x=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x))&&!["localhost","local","internal","test"].some(s=>d===s||d.endsWith("."+s))&&!/(^|\.)aeliaai\.org\.ng$/.test(d);};

export async function initCollabDb(db){
 if(!db)return;
 await db.query(`CREATE TABLE IF NOT EXISTS aelia_admin_notifications(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),category TEXT NOT NULL DEFAULT 'system',severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,message TEXT NOT NULL,resource_type TEXT NULL,resource_id UUID NULL,action_url TEXT NULL,
  read_at TIMESTAMPTZ NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
 await db.query(`CREATE INDEX IF NOT EXISTS aelia_admin_notifications_unread ON aelia_admin_notifications(read_at,created_at DESC)`);
 await db.query(`CREATE TABLE IF NOT EXISTS aelia_collab_applications(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),organization_name TEXT NOT NULL,website_url TEXT NOT NULL,domain TEXT NOT NULL,
  contact_name TEXT NOT NULL,contact_email TEXT NOT NULL,purpose TEXT NOT NULL,requested_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_verification',verification_token_hash TEXT NOT NULL,verification_expires_at TIMESTAMPTZ NOT NULL,
  domain_verified_at TIMESTAMPTZ NULL,email_verification_hash TEXT NOT NULL,email_verification_expires_at TIMESTAMPTZ NOT NULL,
  email_verified_at TIMESTAMPTZ NULL,reviewed_by TEXT NULL,review_note TEXT NULL,approved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
 await db.query(`CREATE INDEX IF NOT EXISTS aelia_collab_applications_queue ON aelia_collab_applications(status,created_at DESC)`);
 await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS aelia_collab_active_domain ON aelia_collab_applications(domain) WHERE status IN ('pending_verification','pending_review','approved')`);
 await db.query(`CREATE TABLE IF NOT EXISTS aelia_collab_credentials(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),application_id UUID NOT NULL REFERENCES aelia_collab_applications(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL UNIQUE,key_hash TEXT NOT NULL,scopes JSONB NOT NULL DEFAULT '[]'::jsonb,status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),last_used_at TIMESTAMPTZ NULL,expires_at TIMESTAMPTZ NOT NULL,revoked_at TIMESTAMPTZ NULL)`);
 await db.query(`CREATE INDEX IF NOT EXISTS aelia_collab_credentials_lookup ON aelia_collab_credentials(key_prefix,status)`);
 await db.query(`CREATE TABLE IF NOT EXISTS aelia_collab_usage_windows(
  credential_id UUID NOT NULL REFERENCES aelia_collab_credentials(id) ON DELETE CASCADE,window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(credential_id,window_start))`);
 await db.query(`CREATE TABLE IF NOT EXISTS aelia_audit_logs(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),actor_type TEXT NOT NULL,actor_id TEXT NULL,action TEXT NOT NULL,
  resource_type TEXT NOT NULL,resource_id TEXT NULL,metadata JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
}

async function notification(db,{category="collaboration",severity="info",title,message,resourceType=null,resourceId=null,actionUrl="/admin"}){
 const r=await db.query("INSERT INTO aelia_admin_notifications(category,severity,title,message,resource_type,resource_id,action_url) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id",[category,severity,title,message,resourceType,resourceId,actionUrl]);
 return r.rows[0].id;
}
async function alertAdmin(db,sendEmail,adminEmail,subject,title,message,resourceId){
 const id=await notification(db,{category:"collaboration",severity:"warning",title,message,resourceType:"collab_application",resourceId,actionUrl:"/admin"});
 if(adminEmail){try{await sendEmail(adminEmail,subject,`<div style="font-family:Arial,sans-serif"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><p><a href="https://admin.aeliaai.org.ng/">Open AELIA Admin</a></p></div>`);}catch(e){console.error("AELIA admin notification email failed",e.message);}}
 return id;
}
async function audit(db,actorType,actorId,action,resourceId,metadata={}){
 await db.query("INSERT INTO aelia_audit_logs(actor_type,actor_id,action,resource_type,resource_id,metadata) VALUES($1,$2,$3,'collab_application',$4,$5::jsonb)",[actorType,String(actorId||""),action,String(resourceId||""),JSON.stringify(metadata)]);
}
async function verifiedPartner(db,req){
 const token=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 if(!token.startsWith("aelia_live_"))return null;
 const prefix=token.slice(0,24),r=await db.query(`SELECT c.id,c.application_id,c.key_hash,c.scopes,c.expires_at,a.organization_name,a.domain
  FROM aelia_collab_credentials c JOIN aelia_collab_applications a ON a.id=c.application_id
  WHERE c.key_prefix=$1 AND c.status='active' AND a.status='approved' AND c.expires_at>now() LIMIT 1`,[prefix]);
 if(!r.rowCount||!safeEqual(hash(token),r.rows[0].key_hash))return null;
 return r.rows[0];
}
export async function authorizeMcpPartner(db,req,scope){
 const partner=await verifiedPartner(db,req);if(!partner||!partner.scopes.includes(scope))return null;
 const r=await db.query("INSERT INTO aelia_collab_usage_windows(credential_id,window_start,request_count) VALUES($1,date_trunc('minute',now()),1) ON CONFLICT(credential_id,window_start) DO UPDATE SET request_count=aelia_collab_usage_windows.request_count+1 WHERE aelia_collab_usage_windows.request_count<60 RETURNING request_count",[partner.id]);
 if(!r.rowCount)return null;
 await db.query("UPDATE aelia_collab_credentials SET last_used_at=now() WHERE id=$1",[partner.id]);return partner;
}
async function allowPartnerRequest(db,partner,scope,res){
 if(!partner.scopes.includes(scope)){json(res,403,{error:"This integration key does not have the required permission.",required_scope:scope});return false;}
 const r=await db.query(`INSERT INTO aelia_collab_usage_windows(credential_id,window_start,request_count)
 VALUES($1,date_trunc('minute',now()),1)
 ON CONFLICT(credential_id,window_start) DO UPDATE SET request_count=aelia_collab_usage_windows.request_count+1
 WHERE aelia_collab_usage_windows.request_count<60 RETURNING request_count`,[partner.id]);
 if(!r.rowCount){json(res,429,{error:"Integration rate limit reached.",limit:60,window:"1 minute"});return false;}
 await db.query("UPDATE aelia_collab_credentials SET last_used_at=now() WHERE id=$1",[partner.id]);
 return true;
}
function websiteDomain(value){
 let u;try{u=new URL(value);}catch{return null;}
 if(u.protocol!=="https:"||u.username||u.password)return null;
 const domain=u.hostname.toLowerCase().replace(/\.$/,"");
 return validDomain(domain)?{url:u.toString(),domain}:null;
}

export async function handleCollabRequest(req,res,ctx){
 const {db,authUser,sendEmail,adminEmail,chat,runAgent,capabilities}=ctx;
 const url=new URL(req.url||"/","https://api.aeliaai.org.ng");
 let path=url.pathname;
 if(path.startsWith("/api/"))path=path.slice(4);
 if(path==="/v1/collab"&&req.method==="GET")return json(res,200,{service:"AELIA Collaboration API",version:"1.0",application_endpoint:"/v1/collab/applications",ownership_proof:"DNS TXT and verified contact email are both mandatory",approval:"Manual AELIA administrator approval is mandatory",partner_api_base:"https://api.aeliaai.org.ng/v1/collab/v1",mcp_endpoint:"https://mcp.aeliaai.org.ng/mcp",documentation:"https://developers.aeliaai.org.ng/collaboration"});
 if(path==="/v1/collab/applications"&&req.method==="POST"){
  if(!db)return json(res,503,{error:"Collaboration database is unavailable."});
  const p=await readBody(req),org=String(p.organization_name||"").trim(),site=websiteDomain(p.website_url),name=String(p.contact_name||"").trim(),email=String(p.contact_email||"").trim().toLowerCase(),purpose=String(p.purpose||"").trim();
  const scopes=Array.isArray(p.requested_scopes)?[...new Set(p.requested_scopes.map(String))]:["platform:read","capabilities:read"];
  if(org.length<2||org.length>160||!site||name.length<2||!validEmail(email)||purpose.length<20||purpose.length>3000)return json(res,400,{error:"Provide an organization name, HTTPS website, contact name, valid contact email and a purpose of at least 20 characters."});
  if(!scopes.length||scopes.some(s=>!ALLOWED_SCOPES.has(s)))return json(res,400,{error:"One or more requested permissions are not available.",available_scopes:[...ALLOWED_SCOPES]});
  const exists=await db.query("SELECT id,status FROM aelia_collab_applications WHERE domain=$1 AND status IN ('pending_verification','pending_review','approved') LIMIT 1",[site.domain]);
  if(exists.rowCount)return json(res,409,{error:"An active or pending application already exists for this domain.",application_id:exists.rows[0].id,status:exists.rows[0].status});
  const dnsToken=crypto.randomBytes(32).toString("hex"),emailToken=crypto.randomBytes(32).toString("hex");
  let app;
  try{const r=await db.query(`INSERT INTO aelia_collab_applications(organization_name,website_url,domain,contact_name,contact_email,purpose,requested_scopes,verification_token_hash,verification_expires_at,email_verification_hash,email_verification_expires_at)
   VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,now()+interval '72 hours',$9,now()+interval '24 hours') RETURNING id,domain,status,created_at`,
   [org,site.url,site.domain,name,email,purpose,JSON.stringify(scopes),hash(dnsToken),hash(emailToken)]);app=r.rows[0];}
  catch(e){if(e.code==="23505")return json(res,409,{error:"An application for this domain is already in progress."});throw e;}
  const verifyLink="https://collab.aeliaai.org.ng/?verify_email="+encodeURIComponent(app.id)+"&token="+encodeURIComponent(emailToken);
  let emailSent=false;try{const sent=await sendEmail(email,"Verify your AELIA collaboration contact",`<div style="font-family:Arial,sans-serif"><h2>Verify your organization contact</h2><p>Confirm that you control this contact email for ${escapeHtml(org)}.</p><p><a href="${verifyLink}">Verify contact email</a></p><p>This link expires in 24 hours. AELIA will not approve the integration until both email and domain ownership are verified.</p></div>`);emailSent=!!sent?.sent;}catch(e){console.error("partner verification email failed",e.message);}
  await alertAdmin(db,sendEmail,adminEmail,"New AELIA collaboration application","New collaboration application",org+" submitted an integration request for "+site.domain+". Both contact-email and DNS ownership verification are required before review.",app.id);
  await audit(db,"external",site.domain,"collaboration.application.created",app.id,{requested_scopes:scopes,email_sent:emailSent});
  return json(res,201,{ok:true,application_id:app.id,status:"pending_verification",email_verification_email_sent:emailSent,dns_verification:{record_type:"TXT",host:"_aelia-verification."+site.domain,value:"aeliaai-verification="+dnsToken,expires_in_hours:72},next_steps:["Publish the supplied DNS TXT record.","Verify the contact email using the email sent to the application contact.","AELIA administrators review verified applications manually."],approval_is_not_automatic:true});
 }
 const emailVerify=path.match(/^\/v1\/collab\/applications\/([0-9a-f-]+)\/verify-email$/i);
 if(emailVerify&&req.method==="POST"){
  if(!db)return json(res,503,{error:"Collaboration database is unavailable."});
  const p=await readBody(req),token=String(p.token||"");if(token.length<32)return json(res,400,{error:"Email verification token is required."});
  const r=await db.query("SELECT * FROM aelia_collab_applications WHERE id=$1",[emailVerify[1]]);
  if(!r.rowCount)return json(res,404,{error:"Application not found."});
  const app=r.rows[0];if(app.email_verified_at)return json(res,200,{ok:true,email_verified:true,status:app.status});
  if(new Date(app.email_verification_expires_at)<new Date()||!safeEqual(hash(token),app.email_verification_hash))return json(res,400,{error:"Email verification link is invalid or expired."});
  const updated=await db.query("UPDATE aelia_collab_applications SET email_verified_at=now(),status=CASE WHEN domain_verified_at IS NOT NULL THEN 'pending_review' ELSE 'pending_verification' END,updated_at=now() WHERE id=$1 RETURNING status",[app.id]);
  await audit(db,"external",app.domain,"collaboration.contact_email.verified",app.id,{});
  await alertAdmin(db,sendEmail,adminEmail,"AELIA partner contact verified","Partner contact email verified",app.organization_name+" has verified its organization contact email. DNS domain ownership remains "+(app.domain_verified_at?"verified":"pending")+".",app.id);
  if(updated.rows[0].status==="pending_review")await alertAdmin(db,sendEmail,adminEmail,"AELIA collaboration ready for review","Collaboration ownership verified",app.organization_name+" has verified both its contact email and DNS domain. The application is ready for manual approval.",app.id);
  return json(res,200,{ok:true,email_verified:true,status:updated.rows[0].status,message:updated.rows[0].status==="pending_review"?"Both ownership checks passed. The application is waiting for AELIA administrator approval.":"Email verified. Complete DNS ownership verification next."});
 }
 const dnsVerify=path.match(/^\/v1\/collab\/applications\/([0-9a-f-]+)\/verify-domain$/i);
 if(dnsVerify&&req.method==="POST"){
  if(!db)return json(res,503,{error:"Collaboration database is unavailable."});
  const r=await db.query("SELECT * FROM aelia_collab_applications WHERE id=$1",[dnsVerify[1]]);
  if(!r.rowCount)return json(res,404,{error:"Application not found."});
  const app=r.rows[0];if(app.domain_verified_at)return json(res,200,{ok:true,domain_verified:true,status:app.status});
  if(new Date(app.verification_expires_at)<new Date())return json(res,400,{error:"DNS verification challenge expired. Submit a new application."});
  let records=[];try{records=(await resolveTxt("_aelia-verification."+app.domain)).map(parts=>parts.join(""));}catch{return json(res,409,{verified:false,error:"The DNS TXT record was not found yet. Publish it and retry after DNS propagation."});}
  const expected="aeliaai-verification="+app.verification_token_hash;
  // The database stores only a hash; compare the DNS proof by hashing the supplied record suffix.
  const valid=records.some(record=>record.startsWith("aeliaai-verification=")&&safeEqual(hash(record.slice("aeliaai-verification=".length)),app.verification_token_hash));
  if(!valid)return json(res,403,{verified:false,error:"The DNS TXT record does not match this application's verification challenge."});
  const updated=await db.query("UPDATE aelia_collab_applications SET domain_verified_at=now(),status=CASE WHEN email_verified_at IS NOT NULL THEN 'pending_review' ELSE 'pending_verification' END,updated_at=now() WHERE id=$1 RETURNING status",[app.id]);
  await audit(db,"external",app.domain,"collaboration.domain.verified",app.id,{});
  await alertAdmin(db,sendEmail,adminEmail,"AELIA partner domain verified","Partner DNS ownership verified",app.organization_name+" has proven control of "+app.domain+" using its DNS TXT challenge. Contact email remains "+(app.email_verified_at?"verified":"pending")+".",app.id);
  if(updated.rows[0].status==="pending_review")await alertAdmin(db,sendEmail,adminEmail,"AELIA collaboration ready for review","Collaboration ownership verified",app.organization_name+" has verified both its contact email and DNS domain. The application is ready for manual approval.",app.id);
  return json(res,200,{ok:true,domain_verified:true,status:updated.rows[0].status,message:updated.rows[0].status==="pending_review"?"Both ownership checks passed. The application is waiting for AELIA administrator approval.":"Domain verified. Verify the contact email next."});
 }
 const partnerRoute=path.match(/^\/v1\/collab\/v1\/(health|capabilities|chat|agents\/run)$/);
 if(partnerRoute){
  if(!db)return json(res,503,{error:"Collaboration database is unavailable."});
  const partner=await verifiedPartner(db,req);if(!partner)return json(res,401,{error:"A valid, approved AELIA integration API key is required.",documentation:"https://developers.aeliaai.org.ng/collaboration"});
  const kind=partnerRoute[1],scope=kind==="health"?"platform:read":kind==="capabilities"?"capabilities:read":kind==="chat"?"chat:execute":"agents:run";
  if(!await allowPartnerRequest(db,partner,scope,res))return;
  if(kind==="health"){await audit(db,"partner",partner.id,"collaboration.health",partner.application_id,{});return json(res,200,{ok:true,service:"AELIA Collaboration API",version:"1.0",partner:partner.organization_name,rate_limit_per_minute:60});}
  if(kind==="capabilities"){await audit(db,"partner",partner.id,"collaboration.capabilities.read",partner.application_id,{});return json(res,200,{capabilities:capabilities(),version:"1.0"});}
  const p=await readBody(req);
  if(kind==="chat"){const message=String(p.message||"").trim();if(!message||message.length>12000)return json(res,400,{error:"message must contain 1–12000 characters."});const result=await chat({message});await audit(db,"partner",partner.id,"collaboration.chat",partner.application_id,{mode:result.mode});return json(res,result.mode==="live"?200:503,{...result,partner:partner.organization_name});}
  const task=String(p.task||"").trim();if(!task||task.length>12000)return json(res,400,{error:"task must contain 1–12000 characters."});
  const result=await runAgent({agent:p.agent,task});await audit(db,"partner",partner.id,"collaboration.agent.run",partner.application_id,{agent:p.agent||"chief",mode:result.mode});
  return json(res,result.mode==="live"?200:503,{...result,partner:partner.organization_name});
 }
 if(path.startsWith("/v1/admin/")){
  const admin=await authUser(req);
  if(!admin||!admin.email_verified_at)return json(res,401,{error:"Verified administrator authentication is required."});
  if(!adminEmail||admin.email.toLowerCase()!==adminEmail.toLowerCase())return json(res,403,{error:"Administrator access denied."});
  if(req.method==="GET"&&path==="/v1/admin/notifications"){
   const r=await db.query("SELECT * FROM aelia_admin_notifications ORDER BY created_at DESC LIMIT 100");
   return json(res,200,{items:r.rows,unread_count:r.rows.filter(x=>!x.read_at).length});
  }
  if(req.method==="PATCH"&&(path==="/v1/admin/notifications/read-all")){
   await db.query("UPDATE aelia_admin_notifications SET read_at=now() WHERE read_at IS NULL");return json(res,200,{ok:true});
  }
  const read=path.match(/^\/v1\/admin\/notifications\/([0-9a-f-]+)\/read$/i);
  if(req.method==="PATCH"&&read){const r=await db.query("UPDATE aelia_admin_notifications SET read_at=COALESCE(read_at,now()) WHERE id=$1 RETURNING id",[read[1]]);return json(res,r.rowCount?200:404,{ok:!!r.rowCount});}
  if(req.method==="GET"&&path==="/v1/admin/collab-applications"){
   const r=await db.query("SELECT id,organization_name,website_url,domain,contact_name,contact_email,purpose,requested_scopes,status,domain_verified_at,email_verified_at,review_note,created_at FROM aelia_collab_applications ORDER BY created_at DESC LIMIT 100");
   return json(res,200,{items:r.rows});
  }
  const decision=path.match(/^\/v1\/admin\/collab-applications\/([0-9a-f-]+)\/decision$/i);
  if(req.method==="POST"&&decision){
   const p=await readBody(req),choice=String(p.decision||""),note=String(p.note||"").trim();
   if(!["approve","reject","suspend"].includes(choice))return json(res,400,{error:"Decision must be approve, reject or suspend."});
   const r=await db.query("SELECT * FROM aelia_collab_applications WHERE id=$1",[decision[1]]);
   if(!r.rowCount)return json(res,404,{error:"Application not found."});
   const app=r.rows[0];
   if(choice==="approve"){
    if(app.status!=="pending_review"||!app.domain_verified_at||!app.email_verified_at)return json(res,409,{error:"Approval blocked: both domain and contact-email ownership must be verified, and the application must be in manual review."});
    const scopes=app.requested_scopes.filter(s=>ALLOWED_SCOPES.has(s));
    const apiKey="aelia_live_"+crypto.randomBytes(36).toString("base64url"),prefix=apiKey.slice(0,24);
    await db.query("INSERT INTO aelia_collab_credentials(application_id,key_prefix,key_hash,scopes,expires_at) VALUES($1,$2,$3,$4::jsonb,now()+interval '90 days')",[app.id,prefix,hash(apiKey),JSON.stringify(scopes)]);
    await db.query("UPDATE aelia_collab_applications SET status='approved',reviewed_by=$1,review_note=$2,approved_at=now(),updated_at=now() WHERE id=$3",[admin.email,note,app.id]);
    await audit(db,"admin",admin.email,"collaboration.application.approved",app.id,{scopes});
    await alertAdmin(db,sendEmail,adminEmail,"AELIA integration approved","Integration approved",app.organization_name+" ("+app.domain+") was approved. A partner API credential was issued.",app.id);
    try{await sendEmail(app.contact_email,"Your AELIA collaboration request was approved",`<div style="font-family:Arial,sans-serif"><h2>Integration approved</h2><p>Your organization has been approved to connect with AELIA AI.</p><p>API base: <code>https://api.aeliaai.org.ng/v1/collab/v1</code></p><p>Documentation: <a href="https://developers.aeliaai.org.ng/collaboration">AELIA collaboration docs</a></p><p>Your administrator will share the one-time API credential through the agreed secure channel.</p></div>`);}catch(e){console.error("partner approval email failed",e.message);}
    return json(res,200,{ok:true,decision:"approved",application_id:app.id,api_key:apiKey,api_key_shown_once:true,scopes,expires_in_days:90});
   }
   if(choice==="suspend"){await db.query("UPDATE aelia_collab_credentials SET status='revoked',revoked_at=now() WHERE application_id=$1 AND status='active'",[app.id]);}
   await db.query("UPDATE aelia_collab_applications SET status=$1,reviewed_by=$2,review_note=$3,updated_at=now() WHERE id=$4",[choice==="reject"?"rejected":"suspended",admin.email,note,app.id]);
   await audit(db,"admin",admin.email,"collaboration.application."+choice,app.id,{note});
   await alertAdmin(db,sendEmail,adminEmail,"AELIA collaboration decision recorded","Collaboration decision recorded",app.organization_name+" ("+app.domain+") was "+choice+" by an AELIA administrator.",app.id);
   try{await sendEmail(app.contact_email,"AELIA collaboration application update","<p>Your AELIA collaboration application status is: "+escapeHtml(choice)+".</p>");}catch(e){console.error("partner decision email failed",e.message);}
   return json(res,200,{ok:true,decision:choice,application_id:app.id});
  }
 }
 return false;
}

async function readBody(req){
 return new Promise((resolve,reject)=>{let raw="";req.on("data",chunk=>{raw+=chunk;if(raw.length>2e6){req.destroy();reject(new Error("Payload too large"));}});req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});req.on("error",reject);});
}
