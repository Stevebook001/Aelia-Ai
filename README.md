# AELIA AI — Light. Intelligence. Yours.

AELIA AI is being built by Novella Matrix as a unified daily intelligence workspace.

## Foundation v0.3

The web app is intentionally more than a marketing page. It now has a bright workspace UI with:

- Today dashboard and daily launch checklist
- Chat & Reason workspace
- AELIA Agent roster
- Chief / Research / Developer / Workflow agent foundations
- Research workspace
- Create workspace for writing, image, voice, video, data and code
- Projects
- Files & Knowledge
- Automation concepts
- Connector Hub
- Developer Center
- Command Center with Ctrl/Cmd+K
- Bright/Night UI
- API health state
- Local workspace persistence

The interface is designed around a long-term product goal: users should be able to ask AELIA to understand, create, research, build, connect and automate from one place.

## API foundation

Node.js service under `services/api`:

- `GET /health`
- `GET /v1/capabilities`
- `GET /v1/agents`
- `POST /v1/chat`
- `POST /v1/tasks`
- `POST /v1/research`

The API is provider-neutral. AI secrets stay server-side.

## Architecture

`User → AELIA API → Orchestrator → Planner/Memory/Policy → Capability Registry → Agents → Tools → Verification → Result → Memory/Audit`

Long-term capability areas include chat, reasoning, memory, research, web access, browser interaction, files, documents, data analysis, code, media, translation, agents, workflows, automation, scheduling, connectors, MCP, APIs, SDKs and audit/verification.

## Ecosystem

First-party connector targets:

- Novella Matrix
- SeaChat
- Akode

Future external connectors can be installed through a permissioned connector model.

## Domains

aeliaai.org · app.aeliaai.org · api.aeliaai.org · mcp.aeliaai.org · docs.aeliaai.org · developers.aeliaai.org · status.aeliaai.org

## Current production requirements

The current web app can run without production secrets, but live AI requires:

1. Server-side AI provider API key.
2. Production API deployment.
3. PostgreSQL database for identity, projects, conversations, permissions, usage and billing records.
4. Redis or an equivalent queue/cache for long-running jobs.
5. Object storage for files and generated assets.
6. Email provider for verification, security and `@aeliaai.org` mail.
7. Payment provider for subscriptions/credits.
8. Search/web and media providers when those capabilities are enabled.
9. Monitoring, rate limiting, audit logs and backups.

Never commit secrets to GitHub.

## Product principle

AELIA should not be built as a collection of disconnected buttons. Each feature should eventually connect to the same identity, memory, permission, capability, task, verification and audit layers so users can move from a question to a real outcome.

Public product language should describe ambitious goals as goals, not unsupported claims of being the world's best.
