import "dotenv/config";
import makeWASocket, { useMultiFileAuthState, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";

const dir=process.env.WHATSAPP_AUTH_DIR||"/data/whatsapp-auth";
const number=(process.env.WHATSAPP_PHONE_NUMBER||"").replace(/\D/g,"");
if(!number) throw new Error("Set WHATSAPP_PHONE_NUMBER with country code, e.g. 2348104468690");

const {state,saveCreds}=await useMultiFileAuthState(dir);
const sock=makeWASocket({
  auth:state,
  browser:Browsers.ubuntu("AELIA AI"),
  logger:pino({level:"silent"}),
  printQRInTerminal:false
});
sock.ev.on("creds.update",saveCreds);
sock.ev.on("connection.update",async({connection,qr})=>{
  if(qr) console.log("QR available. Use the WhatsApp Linked Devices screen to scan it.");
  if(connection==="open"){
    console.log("WhatsApp connected. Auth is stored in "+dir);
    process.exit(0);
  }
});
await new Promise(r=>setTimeout(r,2500));
if(!state.creds.registered){
  const code=await sock.requestPairingCode(number);
  console.log("\nAELIA WhatsApp pairing code: "+code);
  console.log("On the phone: WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number instead.\n");
}
