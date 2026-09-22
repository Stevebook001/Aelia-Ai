# AELIA Domain & Deployment Plan

## Primary
- `aeliaai.org` — public website/app
- `www.aeliaai.org` — optional redirect/canonical host

## Application/services
- `app.aeliaai.org` — authenticated web app
- `api.aeliaai.org` — API
- `mcp.aeliaai.org` — MCP server
- `docs.aeliaai.org` — documentation
- `developers.aeliaai.org` — developer portal
- `status.aeliaai.org` — status/uptime

## Deployment
The recommended production layout is:

```
Spaceship DNS
   │
   ├── aeliaai.org ────────→ web app
   ├── app.aeliaai.org ────→ web app
   ├── api.aeliaai.org ────→ AELIA API
   └── mcp.aeliaai.org ────→ MCP service

Coolify
   ├── web
   ├── api
   ├── worker
   ├── PostgreSQL
   ├── Redis
   └── object storage
```

Keep databases private on the Docker network. Only public HTTP/HTTPS services should receive public domains.
