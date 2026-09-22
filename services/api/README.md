# AELIA API — Foundation v0.2

The API is now executable rather than only a placeholder.

## Endpoints
- `GET /health`
- `GET /v1/capabilities`
- `POST /v1/chat`
- `POST /v1/tasks`

## AI provider
The server uses a provider-neutral adapter:
- `AI_API_KEY` or `OPENAI_API_KEY`
- `AI_BASE_URL` (optional)
- `AI_MODEL`

OpenAI's current JavaScript quickstart uses the server-side SDK and Responses API; keep provider secrets on the server, never in browser code. The adapter can later be expanded for additional providers without changing the web app.

## Next backend work
1. PostgreSQL identity and organization layer.
2. Redis/queue for tasks.
3. Object storage for files.
4. Capability registry.
5. Agent runtime + permissions.
6. OAuth connector accounts.
7. Usage/credits/billing.
8. Audit logs and rate limits.
9. MCP server at `mcp.aeliaai.org`.
