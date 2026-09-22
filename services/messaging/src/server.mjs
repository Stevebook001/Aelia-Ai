import "dotenv/config";
import http from "node:http";
import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";

const PORT=Number(process.env.PORT||3100);
const AELIA_API_BASE=(process.env.AELIA_API_BASE||"http://localhost:3000").replace(/\/$/,"");
const TELEGRAM_BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN||"";
const TELEGRAM_WEBHOOK_SECRET=process.env.TELEGRAM_WEBHOOK_SECRET||"";
const WHATSAPP_AUTH_DIR=process.env.WHATSAPP_AUTH_DIR||"/data/whatsapp-auth";
const WHATSAPP_PHONE_NUMBER=(process.env.WHATSAPP_PHONE_NUMBER||"").replace(/\D/g,"");
const logger=pino({level:process.env.LOG_LEVEL||"info"});
let whatsapp=null;
let whatsappState="starting";

async function askAelia(message, channel){
  const r=await fetch(AELIA_API_BASE+"/v1/chat",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({message,channel,model:process.env.AI_MODEL||undefined})
  });
  if(!r.ok) throw new Error("AELIA API returned "+r.status);
  const data=await r.json();
  return data.output||"AELIA could not produce a response.";
}

async function startWhatsApp(){
  const {state,saveCreds}=await useMultiFileAuthState(WHATSAPP_AUTH_DIR);
  const sock=makeWASocket({
    auth:state,
    browser:Browsers.ubuntu("AELIA AI"),
    logger:pino({level:"silent"}),
    markOnlineOnConnect:false
  });
  whatsapp=sock;
  whatsappState=state.creds.registered?"connected":"awaiting_pairing";
  sock.ev.on("creds.update",saveCreds);
  sock.ev.on("connection.update",({connection,lastDisconnect})=>{
    if(connection==="open") whatsappState="connected";
    if(connection==="close"){
      whatsappState="disconnected";
      const code=lastDisconnect?.error?.output?.statusCode;
      if(code!==DisconnectReason.loggedOut){
        setTimeout(()=>startWhatsApp().catch(e=>logger.error(e)),3000);
      }
    }
  });
  sock.ev.on("messages.upsert",async({messages,type})=>{
    if(type!=="notify") return;
    for(const msg of messages){
      if(!msg.message||msg.key.fromMe) continue;
      const jid=msg.key.remoteJid;
      if(!jid||jid.endsWith("@g.us")) continue;
      const text=msg.message.conversation||msg.message.extendedTextMessage?.text||"";
      if(!text.trim()) continue;
      try{
        const reply=await askAelia(text.trim(),"whatsapp");
        await sock.sendMessage(jid,{text:reply});
      }catch(err){
        logger.error({err},"WhatsApp message handling failed");
        await sock.sendMessage(jid,{text:"AELIA is temporarily unavailable. Please try again in a moment."});
      }
    }
  });
}

async function telegram(method,body){
  if(!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const r=await fetch("https://api.telegram.org/bot"+TELEGRAM_BOT_TOKEN+"/"+method,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
  const data=await r.json();
  if(!data.ok) throw new Error(data.description||"Telegram API error");
  return data.result;
}

async function handleTelegram(update){
  const message=update?.message;
  const text=message?.text?.trim();
  if(!message?.chat?.id||!text) return;
  const reply=await askAelia(text,"telegram");
  await telegram("sendMessage",{chat_id:message.chat.id,text:reply});
}

function json(res,status,data){
  res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
  res.end(JSON.stringify(data));
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    let raw="";
    req.on("data",c=>{raw+=c;if(raw.length>2e6){req.destroy();reject(new Error("Payload too large"));}});
    req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});
    req.on("error",reject);
  });
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||"/","http://aelia-messaging.local");
    if(req.method==="GET"&&url.pathname==="/health"){
      json(res,200,{ok:true,service:"aelia-messaging",whatsapp:whatsappState,telegram:Boolean(TELEGRAM_BOT_TOKEN),aelia_api:AELIA_API_BASE});
      return;
    }
    if(req.method==="POST"&&url.pathname==="/telegram/webhook"){
      if(TELEGRAM_WEBHOOK_SECRET && req.headers["x-telegram-bot-api-secret-token"]!==TELEGRAM_WEBHOOK_SECRET){
        json(res,401,{error:"invalid webhook secret"});return;
      }
      const update=await readBody(req);
      await handleTelegram(update);
      json(res,200,{ok:true});
      return;
    }
    if(req.method==="POST"&&url.pathname==="/telegram/set-webhook"){
      const secret=TELEGRAM_WEBHOOK_SECRET;
      const publicUrl=(process.env.PUBLIC_BASE_URL||"").replace(/\/$/,"");
      if(!publicUrl) throw new Error("PUBLIC_BASE_URL is required");
      const result=await telegram("setWebhook",{url:publicUrl+"/telegram/webhook",secret_token:secret||undefined,allowed_updates:["message"]});
      json(res,200,{ok:true,result});
      return;
    }
    json(res,404,{error:"Not found"});
  }catch(err){
    logger.error({err},"messaging request failed");
    json(res,500,{error:"AELIA messaging error",message:err.message});
  }
});

server.listen(PORT,async()=>{
  logger.info("AELIA messaging listening on :"+PORT);
  try{await startWhatsApp();}catch(err){whatsappState="error";logger.error({err},"WhatsApp startup failed");}
});
