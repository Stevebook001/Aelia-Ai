# AELIA Connector, Plugin and Community Product Plan

## Product decisions

- `connectors.aeliaai.org.ng` is the developer-facing integration ecosystem, inspired by the discover/build/connect patterns of platforms such as Coze. It is not a clone of another provider.
- `plugin.aeliaai.org.ng` is the end-user plugin directory and management surface, inspired by ChatGPT's plugin/GPT discovery model.
- `community.aeliaai.org.ng` is the group and organisation conversation product, with invite links and shared spaces.
- `developer.spyrochat.org` is an external partner-owned developer domain. It is not an AELIA subdomain and must be onboarded as a verified integration partner.

## Connector platform

### Developer journey
1. Developer creates an AELIA developer/partner account.
2. Developer creates an organisation and registers an application.
3. AELIA verifies the developer's domain and contact email.
4. Developer submits an integration manifest and redirect/callback URLs.
5. Developer requests specific scopes and documents each tool's side effects.
6. AELIA reviews the app, security posture and test evidence.
7. AELIA issues scoped, revocable credentials after approval.
8. Users authorise the app; the connector runtime records usage and audit events.

### Integration protocols
- OAuth 2.1 / PKCE for user-delegated connections where supported.
- Server-side API keys for providers that do not support OAuth; secrets must never be exposed to browser code.
- MCP server registration with explicit tool discovery and per-tool approval.
- OpenAPI import with schema validation, safe defaults and human approval for side-effecting operations.
- Webhooks with signature verification, replay protection and delivery logs.

### SpyroChat partner
The proposed SpyroChat integration should be registered by the SpyroChat team through `developer.spyrochat.org`. AELIA should provide a partner app manifest, documented bot invocation API, OAuth/API credential exchange, webhook callbacks, usage metering and a sandbox. Do not issue production credentials until domain/email verification, scope review and end-to-end testing are complete.

## Plugin Hub

The plugin directory is for end users. Each listing should include:
- Publisher identity and verification status.
- Description, category, screenshots and support URL.
- Requested scopes and data handling disclosure.
- Tool list, input schema and side-effect warnings.
- Compatibility, version, changelog and review status.
- Install/enable, configure, disable and revoke actions.
- User ratings/reports only after moderation and anti-abuse controls exist.

## Community

Community is a distinct messaging product, not a blog feed. Required capabilities:
- Organisation and group creation.
- Private invite links with expiry, revocation and usage limits.
- Owner, admin, moderator and member roles.
- Real-time group messaging with pagination and durable storage.
- File sharing with scoped object access and malware scanning.
- Mentions, replies, reactions, notifications and unread counts.
- Member removal, reporting, blocking, retention controls and moderation logs.
- Rate limits, spam controls, abuse reporting and privacy controls.

Do not simulate cross-device group chat with localStorage. The community UI must be labelled as in development until the authenticated API, database schema and real-time delivery layer are implemented.

## Release sequence

1. Identity, organisation model, permissions and audit events.
2. Connector manifest registry, developer verification and sandbox.
3. OAuth/API key vault, MCP/OpenAPI ingestion and safe tool runtime.
4. Plugin directory, review queue and user connection management.
5. Community groups, invitations, membership and persistent messaging.
6. Real-time delivery, notifications, file sharing and moderation.
7. Billing, usage metering, developer payouts and marketplace policies.

## Release acceptance

A product is production-ready only when the user journey works end-to-end, permissions are enforced server-side, tests cover the critical paths, errors are observable, data can be backed up/restored, and public documentation matches the actual deployed behaviour.
