# AELIA AI — Product North Star

## Mission

AELIA should become a daily intelligence workspace: a place where a person can ask, think, create, research, organize, build, automate and connect without constantly jumping between disconnected tools.

The goal is not to make a beautiful dashboard. The goal is to make the product useful enough that users naturally return to it for important daily work.

## Product loop

**Intent → Understand → Plan → Act → Verify → Remember → Improve**

Every major AELIA feature should fit this loop.

## Daily-use pillars

1. **Chat** — universal natural-language entry point.
2. **AELIA Agents** — specialized workers for research, coding, operations, creativity and other domains.
3. **Tasks** — convert requests into observable work.
4. **Memory** — preserve useful context with permissions and user controls.
5. **Projects** — scope files, memory, agents and workflows.
6. **Files & Documents** — read, search, compare, transform and generate.
7. **Web Research** — search, source tracking, evidence and verification.
8. **AI Studio** — image, video, voice, audio, data and document workflows.
9. **Connectors** — turn authorized external services into capabilities.
10. **Workflows** — repeatable multi-step automation.
11. **Developer Platform** — API, SDK, CLI, webhooks and MCP.
12. **Identity & Billing** — secure accounts, organizations, usage, credits and subscriptions.

## Ecosystem principle

AELIA should not hard-code every external product into the core UI.

Instead, use a capability contract:

**manifest → authentication → permissions → capabilities → health → execution → verification → audit**

This lets first-party products such as Novella Matrix, SeaChat and Akode become deeply integrated while leaving room for external developers to build connectors, agents and tools.

## Trust principle

No capability should receive unrestricted access by default.

Production execution should enforce:

- authentication
- authorization
- scoped permissions
- confirmation for risky actions
- rate limits
- audit logs
- secret isolation
- retries and failure handling
- user-visible task state

## Engineering principle

Start modular. Do not create dozens of microservices before the product needs them.

The first production split should be practical:

- Web app
- API/orchestrator
- worker runtime
- database
- Redis/queue
- object storage
- observability
- MCP gateway

Services can be split further when scale, security or operational needs justify it.

## Near-term build order

1. Identity and secure sessions
2. PostgreSQL persistence
3. API authentication and rate limiting
4. Real model adapter
5. Agent runtime
6. Task queue and workers
7. File/object storage
8. Memory and retrieval
9. Connector SDK
10. Web research
11. AI Studio modalities
12. MCP
13. Billing/credits
14. First-party ecosystem connectors

## Quality bar

A new feature is not complete merely because it renders in the UI.

For production readiness it should have:

- a real API contract
- persistent data where appropriate
- authorization rules
- error states
- loading/progress states
- auditability
- tests
- monitoring
- documentation
- a clear fallback when a dependency is unavailable
