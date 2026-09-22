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
async function chat(payload){
  if(!client)return {output:"AELIA API is online in foundation mode. Add a server-side AI_API_KEY/OPENAI_API_KEY to enable live model responses.",mode:"foundation",model:payload.model||AI_MODEL};
  const response=await client.responses.create({
    model:payload.model||AI_MODEL,
    input:payload.message||"",
    store:false
  });
  return {output:response.output_text||"No text returned.",mode:"live",model:payload.model||AI_MODEL};
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
      send(res,200,{agents:[
        {id:"chief",name:"AELIA Chief Agent",status:"foundation",capabilities:["plan","delegate","verify"]},
        {id:"researcher",name:"Research Agent",status:"foundation",capabilities:["search","analyze","verify"]},
        {id:"developer",name:"Developer Agent",status:"foundation",capabilities:["read","write","execute","test"]},
        {id:"operator",name:"Workflow Operator",status:"foundation",capabilities:["schedule","automate","audit"]}
      ]});return;
    }
    if(req.method==="POST"&&url.pathname==="/v1/chat"){
      const payload=await body(req);send(res,200,await chat(payload));return;
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
