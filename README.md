# AELIA AI — Light. Intelligence. Yours.

AELIA AI is being built by Novella Matrix as a unified AI workspace.

## Foundation v0.2

This repository now contains an interactive web application foundation, not only a marketing landing page.

### Web app
- Home dashboard
- Chat workspace with local persistence
- Agent workspace
- Projects
- File selection
- Connector Hub
- Workflow concepts
- Developer Center
- Settings
- API health indicator
- WhatsApp contact: +234 810 446 8690

### API
Node.js service under `services/api`:
- `GET /health`
- `GET /v1/capabilities`
- `POST /v1/chat`
- `POST /v1/tasks`

The API is provider-neutral. AI secrets stay server-side.

## Architecture direction

User → AELIA API → Orchestrator → Planner/Memory/Policy → Capability Registry → Agents → Execution → Verification → Result → Memory/Audit.

## Ecosystem

First-party connector targets:
- Novella Matrix
- SeaChat
- Akode

Future external connectors can be installed through a permissioned connector model.

## Domains

aeliaai.org · app.aeliaai.org · api.aeliaai.org · mcp.aeliaai.org · docs.aeliaai.org · developers.aeliaai.org · status.aeliaai.org

## Required before live AI

At minimum, production needs:
1. AI provider API key.
2. Production API deployment.
3. Database.
4. Object storage for files.
5. Authentication/identity provider or native auth.
6. Email provider for @aeliaai.org.
7. Billing/payment provider.
8. Rate limiting, audit logs and monitoring.

Never commit secrets to GitHub.
