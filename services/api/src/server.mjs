import "dotenv/config";
import http from "node:http";
import OpenAI from "openai";

const PORT=Number(process.env.PORT||3000);
const AI_API_KEY=process.env.AI_API_KEY||process.env.OPENAI_API_KEY||"";
const AI_BASE_URL=process.env.AI_BASE_URL||"";
const AI_MODEL=process.env.AI_MODEL||"gpt-5.6-luna";
const CORS_ORIGIN=process.env.CORS_ORIGIN||"*";
const client=AI_API_KEY?new OpenAI({apiKey:AI_API_KEY,...(AI_BASE_URL?{baseURL:AI_BASE_URL}:{})}):null;

function send(res,status,data){
  res.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8",
    "Access-Control-Allow-Origin":CORS_ORIGIN,
    "Access-Control-Allow-Headers":"Content-Type, Authorization",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "X-Content-Type-Options":"nosniff",
    "Cache-Control":"no-store"
  });
  res.end(JSON.stringify(data));
}
function body(req){
  return new Promise((resolve,reject)=>{
    let raw="";
    req.on("data",chunk=>{raw+=chunk;if(raw.length>2e6){req.destroy();reject(new Error("Payload too large"));}});
    req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});
    req.on("error",reject);
  });
}
function capabilities(){
  return [
    "chat","reason","memory","search","research","browser","files","documents","data-analysis",
    "code","images","audio","video","translation","agents","multi-agent","projects","workflows",
    "automation","scheduling","connectors","mcp","api","sdk","webhooks","audit","verification"
  ];
}
const AGENTS={
  chief:{name:"AELIA Chief Agent",system:"You are AELIA Chief Agent. Plan the user's objective, break it into concrete steps, choose the safest useful approach, and verify the final result. Be concise but actionable."},
  researcher:{name:"AELIA Research Agent",system:"You are AELIA Research Agent. Analyze the request, identify what evidence would be needed, distinguish facts from assumptions, and return a structured research brief. Never invent sources."},
  developer:{name:"AELIA Developer Agent",system:"You are AELIA Developer Agent. Act as a senior software engineer. Design maintainable production code, explain implementation decisions briefly, identify tests and security concerns, and prefer incremental changes."},
  operator:{name:"AELIA Workflow Operator",system:"You are AELIA Workflow Operator. Turn the user's objective into an executable workflow with triggers, steps, required permissions, failure handling, verification and a clear completion condition."}
};

async function chat(payload){
  if(!client)return {output:"AELIA API is online in foundation mode. Add a server-side AI_API_KEY/OPENAI_API_KEY to enable live model responses.",mode:"foundation",model:payload.model||AI_MODEL};
  const response=await client.responses.create({
    model:payload.model||AI_MODEL,
    input:payload.message||"",
    store:false
  });
  return {output:response.output_text||"No text returned.",mode:"live",model:payload.model||AI_MODEL};
}

async function runAgent(payload){
  const agent=AGENTS[payload.agent]||AGENTS.chief;
  if(!client){
    return {accepted:true,mode:"foundation",agent:agent.name,status:"queued",run_id:crypto.randomUUID(),message:"Agent runtime is configured. Add the server-side AI key to execute the agent."};
  }
  const task=String(payload.task||payload.message||"").trim();
  if(!task) throw new Error("Agent task is required");
  const response=await client.responses.create({
    model:payload.model||AI_MODEL,
    instructions:agent.system,
    input:task,
    store:false
  });
  return {accepted:true,mode:"live",agent:agent.name,status:"completed",run_id:crypto.randomUUID(),output:response.output_text||"No output returned."};
}
const server=http.createServer(async(req,res)=>{
  if(req.method==="OPTIONS"){send(res,204,{});return;}
  try{
    const url=new URL(req.url||"/","http://aelia.local");
    if(req.method==="GET"&&url.pathname==="/health"){
      send(res,200,{ok:true,service:"aelia-api",version:"0.3",mode:client?"live":"foundation",time:new Date().toISOString()});return;
    }
    if(req.method==="GET"&&url.pathname==="/v1/capabilities"){
      send(res,200,{capabilities:capabilities(),version:"0.3"});return;
    }
    if(req.method==="GET"&&url.pathname==="/v1/agents"){
      send(res,200,{agents:Object.entries(AGENTS).map(([id,a])=>({id,name:a.name,status:client?"live":"foundation",capabilities:id==="chief"?["plan","delegate","verify","memory"]:id==="researcher"?["search","analyze","verify"]:id==="developer"?["read","write","execute","test"]:["schedule","automate","audit"]}))});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/chat"){
      const payload=await body(req);send(res,200,await chat(payload));return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/briefing"){
      const payload=await body(req);
      send(res,200,{ok:true,briefing:{summary:"AELIA briefing foundation generated.",focus:payload.focus||"priority work",next_steps:payload.next_steps||[]},mode:client?"live":"foundation"});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/agents/run"){
      const payload=await body(req);
      const result=await runAgent(payload);
      send(res,result.mode==="live"?200:202,result);return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/tasks"){
      const payload=await body(req);
      send(res,202,{accepted:true,task_id:crypto.randomUUID(),status:"queued",type:payload.type||"general",message:"Task accepted by the AELIA foundation runtime. Worker execution will be attached to the production queue."});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/research"){
      const payload=await body(req);
      send(res,202,{accepted:true,task_id:crypto.randomUUID(),status:"queued",type:"research",query:payload.query||""});return;
    }
    send(res,404,{error:"Not found"});
  }catch(err){
    console.error(err);
    send(res,500,{error:"AELIA API error",message:process.env.NODE_ENV==="production"?"Request failed":err.message});
  }
});
server.listen(PORT,()=>console.log("AELIA API listening on :"+PORT));
