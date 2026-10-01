import "dotenv/config";
import http from "node:http";
import crypto from "node:crypto";
import OpenAI from "openai";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const {Pool}=pg;

const PORT=Number(process.env.PORT||3000);
const AI_API_KEY=process.env.AI_API_KEY||process.env.OPENAI_API_KEY||"";
const AI_BASE_URL=process.env.AI_BASE_URL||"";
const AI_MODEL=process.env.AI_MODEL||"gpt-5.6-luna";
const CORS_ORIGIN=process.env.CORS_ORIGIN||"*";
const DATABASE_URL=process.env.DATABASE_URL||"";
const JWT_SECRET=process.env.JWT_SECRET||"";
const PUBLIC_APP_URL=(process.env.PUBLIC_APP_URL||"https://aeliaai.org.ng").replace(/\/$/,"");
const MAIL_FROM=process.env.MAIL_FROM||"AELIA AI <no-reply@aeliaai.org.ng>";
const RESEND_API_KEY=process.env.RESEND_API_KEY||"";
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||"";
const db=DATABASE_URL?new Pool({connectionString:DATABASE_URL,ssl:!DATABASE_URL.includes("localhost")&&!DATABASE_URL.includes("127.0.0.1")?{rejectUnauthorized:false}:undefined}):null;
const client=AI_API_KEY?new OpenAI({apiKey:AI_API_KEY,...(AI_BASE_URL?{baseURL:AI_BASE_URL}:{})}):null;

function send(res,status,data){
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":CORS_ORIGIN,"Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS","X-Content-Type-Options":"nosniff","Cache-Control":"no-store"});
  res.end(JSON.stringify(data));
}
function body(req){return new Promise((resolve,reject)=>{let raw="";req.on("data",c=>{raw+=c;if(raw.length>2e6){req.destroy();reject(new Error("Payload too large"));}});req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});req.on("error",reject);});}
function randomToken(){return crypto.randomBytes(32).toString("hex");}
async function initDb(){
  if(!db)return;
  await db.query(`CREATE TABLE IF NOT EXISTS aelia_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await db.query(`ALTER TABLE aelia_users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ NULL`);
  await db.query(`CREATE TABLE IF NOT EXISTS aelia_email_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES aelia_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await db.query(`CREATE INDEX IF NOT EXISTS aelia_email_tokens_lookup ON aelia_email_tokens(token_hash,purpose,expires_at)`);
  await db.query(`CREATE TABLE IF NOT EXISTS aelia_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Other',
    page TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS aelia_blog_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'AI',
    image_url TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    reviewer_email TEXT NULL,
    review_note TEXT NULL,
    reviewed_at TIMESTAMPTZ NULL,
    published_at TIMESTAMPTZ NULL,
    slug TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await db.query(`ALTER TABLE aelia_blog_submissions ADD COLUMN IF NOT EXISTS reviewer_email TEXT NULL`);
  await db.query(`ALTER TABLE aelia_blog_submissions ADD COLUMN IF NOT EXISTS review_note TEXT NULL`);
  await db.query(`ALTER TABLE aelia_blog_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL`);
  await db.query(`ALTER TABLE aelia_blog_submissions ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL`);
  await db.query(`ALTER TABLE aelia_blog_submissions ADD COLUMN IF NOT EXISTS slug TEXT NULL`);
}
function tokenFor(user){if(!JWT_SECRET)throw new Error("JWT_SECRET is not configured");return jwt.sign({sub:user.id,email:user.email},JWT_SECRET,{expiresIn:"30d"});}
async function authUser(req){const h=req.headers.authorization||"";if(!h.startsWith("Bearer ")||!JWT_SECRET)return null;try{const p=jwt.verify(h.slice(7),JWT_SECRET);if(!db)return null;const r=await db.query("SELECT id,name,email,email_verified_at,created_at FROM aelia_users WHERE id=$1",[p.sub]);return r.rows[0]||null;}catch{return null;}}
async function sendEmail(to,subject,html){
  if(!RESEND_API_KEY)return {sent:false,reason:"RESEND_API_KEY not configured"};
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from:MAIL_FROM,to:[to],subject,html})});
  if(!r.ok){const t=await r.text();throw new Error("Email provider error: "+r.status+" "+t.slice(0,300));}
  return {sent:true};
}
async function issueEmailToken(user,purpose){
  const raw=randomToken(), hash=crypto.createHash("sha256").update(raw).digest("hex");
  await db.query("UPDATE aelia_email_tokens SET used_at=now() WHERE user_id=$1 AND purpose=$2 AND used_at IS NULL",[user.id,purpose]);
  await db.query("INSERT INTO aelia_email_tokens(user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,now()+$4::interval)",[user.id,hash,purpose,purpose==="verify"?"24 hours":"1 hour"]);
  return raw;
}
async function chat(payload){
  if(!client)return {output:"AELIA API is online in foundation mode. Add a server-side AI_API_KEY/OPENAI_API_KEY to enable live model responses.",mode:"foundation",model:payload.model||AI_MODEL};
  const response=await client.responses.create({model:payload.model||AI_MODEL,input:payload.message||"",store:false});
  return {output:response.output_text||"No text returned.",mode:"live",model:payload.model||AI_MODEL};
}
const AGENTS={
  chief:{name:"AELIA Chief Agent",system:"You are AELIA Chief Agent. Plan the user's objective, break it into concrete steps, choose the safest useful approach, and verify the final result."},
  researcher:{name:"AELIA Research Agent",system:"You are AELIA Research Agent. Analyze the request, identify evidence needed, distinguish facts from assumptions, and never invent sources."},
  developer:{name:"AELIA Developer Agent",system:"You are AELIA Developer Agent. Act as a senior software engineer. Design maintainable production code and identify tests and security concerns."},
  operator:{name:"AELIA Workflow Operator",system:"You are AELIA Workflow Operator. Turn the objective into an executable workflow with triggers, permissions, failure handling and verification."}
};
async function runAgent(payload){
  const agent=AGENTS[payload.agent]||AGENTS.chief;
  if(!client)return {accepted:true,mode:"foundation",agent:agent.name,status:"queued",run_id:crypto.randomUUID(),message:"Agent runtime is configured. Add the server-side AI key to execute the agent."};
  const task=String(payload.task||payload.message||"").trim();if(!task)throw new Error("Agent task is required");
  const response=await client.responses.create({model:payload.model||AI_MODEL,instructions:agent.system,input:task,store:false});
  return {accepted:true,mode:"live",agent:agent.name,status:"completed",run_id:crypto.randomUUID(),output:response.output_text||"No output returned."};
}
function capabilities(){return ["chat","reason","memory","search","research","browser","files","documents","data-analysis","code","images","audio","video","translation","agents","multi-agent","projects","workflows","automation","scheduling","connectors","mcp","api","sdk","webhooks","audit","verification"];}

const requestHandler=async(req,res)=>{
  if(req.method==="OPTIONS"){send(res,204,{});return;}
  try{
    const url=new URL(req.url||"/","http://aelia.local");
    if(url.pathname.startsWith("/api/")) url.pathname=url.pathname.slice(4);
    if(req.method==="POST"&&url.pathname==="/v1/auth/register"){
      const p=await body(req),name=String(p.name||"").trim(),email=String(p.email||"").trim().toLowerCase(),password=String(p.password||"");
      if(!db)return send(res,503,{error:"Account database is not configured yet."});
      if(!JWT_SECRET)return send(res,503,{error:"Account security is not configured yet."});
      if(name.length<2||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||password.length<8)return send(res,400,{error:"Name, valid email and an 8+ character password are required."});
      const exists=await db.query("SELECT id,email_verified_at FROM aelia_users WHERE email=$1",[email]);
      if(exists.rowCount){if(!exists.rows[0].email_verified_at)return send(res,409,{error:"An account exists but email verification is still pending.",code:"EMAIL_UNVERIFIED"});return send(res,409,{error:"An AELIA account already exists for this email."});}
      const hash=await bcrypt.hash(password,12),r=await db.query("INSERT INTO aelia_users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,email_verified_at,created_at",[name,email,hash]),user=r.rows[0];
      let emailSent=false;
      try{const t=await issueEmailToken(user,"verify");const link=PUBLIC_APP_URL+"/verify-email?token="+t;await sendEmail(email,"Verify your AELIA AI email",`<div style="font-family:Arial,sans-serif"><h2>Welcome to AELIA AI</h2><p>Verify your email to activate your account.</p><p><a href="${link}">Verify my AELIA email</a></p><p>This link expires in 24 hours.</p></div>`);emailSent=true;}catch(e){console.error("verification email failed",e.message);}
      send(res,201,{user,verification_required:true,email_sent:emailSent,message:emailSent?"Check your inbox to verify your AELIA account.":"Account created, but the email provider is not configured yet."});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/auth/verify-email"){
      const p=await body(req),raw=String(p.token||"");if(!db||!raw)return send(res,400,{error:"Verification token is required."});
      const hash=crypto.createHash("sha256").update(raw).digest("hex"),r=await db.query("SELECT t.id AS token_id,t.user_id,u.id AS user_id,u.name,u.email,u.email_verified_at FROM aelia_email_tokens t JOIN aelia_users u ON u.id=t.user_id WHERE t.token_hash=$1 AND t.purpose='verify' AND t.used_at IS NULL AND t.expires_at>now()",[hash]);
      if(!r.rowCount)return send(res,400,{error:"Verification link is invalid or expired."});
      const u=r.rows[0];await db.query("UPDATE aelia_email_tokens SET used_at=now() WHERE id=$1",[u.token_id]);await db.query("UPDATE aelia_users SET email_verified_at=now() WHERE id=$1",[u.user_id]);
      const user={id:u.user_id,name:u.name,email:u.email,email_verified_at:new Date().toISOString()};send(res,200,{verified:true,token:tokenFor(user),user});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/auth/resend-verification"){
      const p=await body(req),email=String(p.email||"").trim().toLowerCase();if(!db)return send(res,503,{error:"Account database is not configured yet."});
      const r=await db.query("SELECT id,name,email,email_verified_at FROM aelia_users WHERE email=$1",[email]);if(!r.rowCount)return send(res,200,{ok:true});const u=r.rows[0];if(u.email_verified_at)return send(res,200,{ok:true,already_verified:true});
      try{const t=await issueEmailToken(u,"verify");await sendEmail(email,"Verify your AELIA AI email",`<div style="font-family:Arial,sans-serif"><h2>Verify your AELIA email</h2><p><a href="${PUBLIC_APP_URL}/verify-email?token=${t}">Verify my email</a></p><p>This link expires in 24 hours.</p></div>`);}catch(e){console.error("resend verification failed",e.message);}
      send(res,200,{ok:true});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/auth/login"){
      const p=await body(req),email=String(p.email||"").trim().toLowerCase(),password=String(p.password||"");if(!db)return send(res,503,{error:"Account database is not configured yet."});if(!JWT_SECRET)return send(res,503,{error:"Account security is not configured yet."});
      const r=await db.query("SELECT id,name,email,password_hash,email_verified_at,created_at FROM aelia_users WHERE email=$1",[email]),user=r.rows[0];
      if(!user||!(await bcrypt.compare(password,user.password_hash)))return send(res,401,{error:"Email or password is incorrect."});
      if(!user.email_verified_at)return send(res,403,{error:"Please verify your email before signing in.",code:"EMAIL_UNVERIFIED"});
      delete user.password_hash;send(res,200,{token:tokenFor(user),user});return;
    }
    if(req.method==="GET"&&url.pathname==="/v1/auth/me"){const user=await authUser(req);if(!user)return send(res,401,{error:"Authentication required."});send(res,200,{user});return;}
    if(req.method==="GET"&&url.pathname==="/health"){send(res,200,{ok:true,service:"aelia-api",version:"0.4",mode:client?"live":"foundation",database:!!db,email_provider:!!RESEND_API_KEY,time:new Date().toISOString()});return;}
    if(req.method==="GET"&&url.pathname==="/v1/capabilities"){send(res,200,{capabilities:capabilities(),version:"0.4"});return;}
    if(req.method==="GET"&&url.pathname==="/v1/agents"){send(res,200,{agents:Object.entries(AGENTS).map(([id,a])=>({id,name:a.name,status:client?"live":"foundation"}))});return;}
    if(req.method==="POST"&&url.pathname==="/v1/chat"){send(res,200,await chat(await body(req)));return;}
    if(req.method==="POST"&&url.pathname==="/v1/briefing"){const p=await body(req);send(res,200,{ok:true,briefing:{summary:"AELIA briefing foundation generated.",focus:p.focus||"priority work",next_steps:p.next_steps||[]},mode:client?"live":"foundation"});return;}
    if(req.method==="POST"&&url.pathname==="/v1/agents/run"){const result=await runAgent(await body(req));send(res,result.mode==="live"?200:202,result);return;}
    if(req.method==="POST"&&url.pathname==="/v1/tasks"){const p=await body(req);send(res,202,{accepted:true,task_id:crypto.randomUUID(),status:"queued",type:p.type||"general"});return;}
    if(req.method==="POST"&&url.pathname==="/v1/research"){const p=await body(req);send(res,202,{accepted:true,task_id:crypto.randomUUID(),status:"queued",type:"research",query:p.query||""});return;}
    if(req.method==="POST"&&url.pathname==="/v1/feedback"){
      const p=await body(req),name=String(p.name||"").trim(),email=String(p.email||"").trim().toLowerCase(),type=String(p.type||"Other").trim(),page=String(p.page||"").trim(),message=String(p.message||"").trim();
      if(!db)return send(res,503,{error:"Feedback database is not configured yet."});
      if(name.length<2||!email||message.length<3)return send(res,400,{error:"Name, email and message are required."});
      const r=await db.query("INSERT INTO aelia_feedback(name,email,type,page,message) VALUES($1,$2,$3,$4,$5) RETURNING id,created_at",[name,email,type,page,message]);
      if(ADMIN_EMAIL&&RESEND_API_KEY){try{await sendEmail(ADMIN_EMAIL,"New AELIA feedback: "+type,`<h2>New AELIA feedback</h2><p><b>From:</b> ${name} (${email})</p><p><b>Page:</b> ${page}</p><p><b>Type:</b> ${type}</p><p>${message.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`);}catch(e){console.error("feedback email failed",e.message);}}
      send(res,201,{ok:true,id:r.rows[0].id});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/blog-submissions"){
      const p=await body(req),author=String(p.author||"").trim(),email=String(p.email||"").trim().toLowerCase(),title=String(p.title||"").trim(),category=String(p.category||"AI").trim(),image_url=String(p.image_url||"").trim(),content=String(p.content||"").trim();
      if(!db)return send(res,503,{error:"Blog submission database is not configured yet."});
      if(author.length<2||!email||title.length<5||content.length<100)return send(res,400,{error:"Author, email, title and a substantive article are required."});
      const r=await db.query("INSERT INTO aelia_blog_submissions(author,email,title,category,image_url,content) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,created_at",[author,email,title,category,image_url,content]);
      if(ADMIN_EMAIL&&RESEND_API_KEY){try{await sendEmail(ADMIN_EMAIL,"AELIA blog submission: "+title,`<h2>New blog submission</h2><p><b>Author:</b> ${author} (${email})</p><p><b>Category:</b> ${category}</p><p><b>Title:</b> ${title}</p><p>A submission is waiting for AELIA review. Review it in the admin workflow.</p>`);}catch(e){console.error("blog submission email failed",e.message);}}
      send(res,201,{ok:true,id:r.rows[0].id,status:"pending_review",review_window:"2-5 working days"});return;
    }
    if(req.method==="GET"&&url.pathname==="/v1/blogs"){
      if(!db)return send(res,503,{error:"Blog database is not configured yet."});
      const r=await db.query("SELECT id,author,title,category,image_url,content,slug,published_at FROM aelia_blog_submissions WHERE status='published' ORDER BY published_at DESC NULLS LAST, created_at DESC");
      send(res,200,{blogs:r.rows});return;
    }
    if(url.pathname.startsWith("/v1/admin/")){
      const admin=await authUser(req);
      if(!admin)return send(res,401,{error:"Admin authentication required."});
      if(!ADMIN_EMAIL||admin.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase())return send(res,403,{error:"Admin access denied."});
      if(req.method==="GET"&&url.pathname==="/v1/admin/feedback"){
        if(!db)return send(res,503,{error:"Database is not configured."});
        const r=await db.query("SELECT * FROM aelia_feedback ORDER BY created_at DESC LIMIT 200");
        send(res,200,{items:r.rows});return;
      }
      if(req.method==="GET"&&url.pathname==="/v1/admin/blog-submissions"){
        if(!db)return send(res,503,{error:"Database is not configured."});
        const r=await db.query("SELECT * FROM aelia_blog_submissions ORDER BY created_at DESC LIMIT 200");
        send(res,200,{items:r.rows});return;
      }
      const m=url.pathname.match(/^\/v1\/admin\/blog-submissions\/([^/]+)\/review$/);
      if(req.method==="POST"&&m){
        if(!db)return send(res,503,{error:"Database is not configured."});
        const p=await body(req),status=String(p.status||"").trim(),note=String(p.note||"").trim(),allowed=["pending_review","changes_requested","approved","rejected","published"];
        if(!allowed.includes(status))return send(res,400,{error:"Invalid review status."});
        const publish=status==="published"||status==="approved";
        const slug=String(p.slug||"").trim()||crypto.randomUUID();
        const r=await db.query("UPDATE aelia_blog_submissions SET status=$1,reviewer_email=$2,review_note=$3,reviewed_at=now(),published_at=CASE WHEN $4 THEN COALESCE(published_at,now()) ELSE published_at END,slug=CASE WHEN $4 THEN COALESCE(slug,$5) ELSE slug END WHERE id=$6 RETURNING *",[publish?"published":status,admin.email,note,publish,slug,m[1]]);
        if(!r.rowCount)return send(res,404,{error:"Submission not found."});
        send(res,200,{ok:true,item:r.rows[0]});return;
      }
      return send(res,404,{error:"Admin route not found."});
    }
    send(res,404,{error:"Not found"});
  }catch(err){console.error(err);send(res,500,{error:"AELIA API error",message:process.env.NODE_ENV==="production"?"Request failed":err.message});}
};

let initialized;
async function ensureInitialized(){
  if(!initialized) initialized=initDb().catch(err=>{console.error("Database initialization failed",err);});
  await initialized;
}

export default async function handler(req,res){
  await ensureInitialized();
  return requestHandler(req,res);
}

if(!process.env.VERCEL){
  ensureInitialized().then(()=>http.createServer(requestHandler).listen(PORT,()=>console.log("AELIA API listening on :"+PORT)));
}
