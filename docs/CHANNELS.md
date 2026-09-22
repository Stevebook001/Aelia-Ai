# AELIA Channels — WhatsApp + Telegram

## Goal

AELIA should not have separate brains for web, WhatsApp and Telegram. Each channel is an adapter into the same identity, memory, permissions, agents, tools, workflows and audit layer.

## WhatsApp today

The repository includes a Baileys adapter in services/messaging.

For the phone 08104468690, use the international digits-only form: 2348104468690

Coolify environment:

    AELIA_API_BASE=https://api.aeliaai.org
    WHATSAPP_PHONE_NUMBER=2348104468690
    WHATSAPP_AUTH_DIR=/data/whatsapp-auth

The service must have a persistent volume mounted at /data. Run the pairing helper once:

    npm run whatsapp:pair

Then on the phone:

WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number instead

Enter the pairing code shown by the helper. Once linked, keep the messaging service running.

### Important production note

Baileys is a WhatsApp Web WebSocket library and is not the official WhatsApp Business Platform. Its project documentation warns that it is not affiliated with WhatsApp and discourages spam/bulk automation. Use it for the owner-controlled AELIA prototype and controlled testing. For a business-scale public deployment, add an official WhatsApp Business Platform/Cloud API adapter and keep Baileys as an optional channel adapter.

## Telegram today

1. Open @BotFather.
2. Use /newbot.
3. Choose the bot name and username.
4. Copy the bot token into TELEGRAM_BOT_TOKEN on the server. Never put it in the frontend or GitHub.
5. Deploy the messaging service at a public HTTPS address, for example https://msg.aeliaai.org.
6. Set PUBLIC_BASE_URL=https://msg.aeliaai.org and TELEGRAM_WEBHOOK_SECRET to a random value.
7. Call POST https://msg.aeliaai.org/telegram/set-webhook once.
8. Send a message to the bot.

Telegram supports webhooks as an alternative to long polling; the Bot API also supports a secret-token header for webhook requests.

## Next channel features

- Link Telegram/WhatsApp identities to one AELIA account.
- Conversation history and memory across channels.
- AELIA Agent selection with /agent, /research, /build and /automate commands.
- Voice notes → transcription → agent response.
- Images/documents → file pipeline → analysis.
- Human approval before sensitive actions.
- Per-user rate limits, abuse protection and audit logs.
- Official WhatsApp Cloud API adapter.
- SeaChat as a first-party AELIA connector.