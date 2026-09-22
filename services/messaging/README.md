# AELIA Messaging Gateway

This service connects AELIA to messaging channels without putting provider secrets in the browser.

## WhatsApp — Baileys

Baileys connects a WhatsApp account as a linked multi-device client. It is useful for an owner-controlled prototype, but it is not the official WhatsApp Business Platform. The service stores the WhatsApp auth state under `WHATSAPP_AUTH_DIR`; in production this must be a persistent Coolify volume.

Set:

- `WHATSAPP_PHONE_NUMBER=2348104468690`
- `WHATSAPP_AUTH_DIR=/data/whatsapp-auth`
- `AELIA_API_BASE=https://api.aeliaai.org`

Run `npm run whatsapp:pair` once and complete the phone-number pairing flow. After the auth state is saved, `npm start` reconnects automatically.

Do not use this channel for unsolicited bulk messaging. For a production business deployment, add the official WhatsApp Business Platform/Cloud API adapter as a second provider.

## Telegram

Create the bot with BotFather and store the token only as `TELEGRAM_BOT_TOKEN`.

Set:

- `PUBLIC_BASE_URL=https://msg.aeliaai.org`
- `TELEGRAM_WEBHOOK_SECRET=<random-secret>`

After deployment, call `POST /telegram/set-webhook` once. Telegram will then deliver incoming updates to `/telegram/webhook`.

## Message flow

User → WhatsApp/Telegram → AELIA Messaging Gateway → AELIA API → model/agent runtime → reply → channel.

The same gateway can later expose channel routing, user identity linking, conversation memory, voice/media handling, agent selection, rate limits and audit logs.
