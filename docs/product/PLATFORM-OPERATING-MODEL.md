# AELIA platform operating model

Status: product and architecture proposal; not a statement that every capability is implemented.

## Product surfaces

- `www.aeliaai.org.ng`: public marketing, product information, plans, trust and signup.
- `app.aeliaai.org.ng`: primary authenticated, installable workspace. PWA start URL and scope must remain on this origin.
- `chat.aeliaai.org.ng`: lightweight guest entry point. Guest access is limited by server-enforced quotas and abuse controls; a proposed initial allowance is five messages per rolling 24 hours, adjustable by platform policy and cost controls; signup offers account-backed history and continuity.
- `admin.aeliaai.org.ng`: private operations and publishing administration. Keep Vercel Access/SSO in front as an outer control, then require application authentication, roles and audit logging.
- `collab.aeliaai.org.ng`: authenticated partner portal for organizations and connected applications.
- `blogs.aeliaai.org.ng`: canonical public publishing site for the currently established plural host. Treat `blog.aeliaai.org.ng` as an alias only after DNS and certificate ownership are verified; redirect it to the canonical host while preserving paths. Do not operate two independent CMS instances.

## Identity and authorization

Use one identity provider / user table and a central session issuer for app, chat, admin and collaboration. Use secure, HttpOnly, SameSite cookies where cross-subdomain SSO is supported; define exact allowed origins and CSRF protections. Do not put long-lived bearer credentials in browser localStorage.

Separate roles and scopes:
- Platform owner: all platform administration, protected by MFA and audited privileged actions.
- Platform administrator: explicitly granted operational areas.
- Support: ticket and account-support access; no default access to private conversation contents.
- Moderator/editor: content review and publishing only.
- Guest-post author: submit and track their own articles.
- Paid publisher: CMS authoring/publishing entitlement for a defined paid term, never platform-owner permissions.
- Partner owner/admin/member: scoped to their own organization, applications and connected services.

A URL such as `/owner_<slug>` is a profile route, not an access control. Do not rely on a secret-looking URL for security.

## Temporary paid publishing access

Do not use a reusable token embedded in a path such as `/token`. URL tokens can leak through browser history, logs, screenshots and referrer headers.

Preferred flow:
1. Customer signs up or is invited and verifies email.
2. Payment provider confirms a signed webhook.
3. Backend creates a publishing entitlement with plan, start time, expiry, permitted seats, quotas and CMS scopes.
4. Send a one-time, high-entropy activation link. Store only a hash of its token, make it single-use, short-lived (for example 15–30 minutes), and exchange it by POST for a secure session.
5. The paid entitlement may last the purchased period (for example 24 hours, 7 days or 30 days); expiry disables publishing actions while preserving drafts and audit history.
6. Allow revocation, refunds/chargebacks handling, renewal, receipts and admin override with audit trail.

A temporary publisher must never receive owner, billing, user-management, infrastructure, model-key or partner-credential privileges. Payment grants only the purchased CMS permissions. Do not invent prices; publish a price list only after the payment and refund terms are approved.

## Publishing and partnership intake

Keep two separate public intake paths:
- Editorial submission: author, verified email, title, category, article body, original-work declaration, references/media rights and optional image. Statuses: submitted, screening, needs_changes, accepted, scheduled, published, rejected, withdrawn.
- Partnership inquiry: organization, verified business email, website/domain, proposal, requested relationship and contact details. It enters a separate partnership review queue.

Email notifications should acknowledge receipt, provide a tracking reference and explain that submission does not guarantee publication or partnership. Admin can assign an editor/reviewer, request revisions, leave internal notes, approve, schedule, publish or reject. All state changes must be audited.

## Collaboration portal

Collaboration is more than an API-key request. Each organization should have:
- Sign-up/sign-in and email verification for partner users, with an organization owner who can invite teammates and assign organization-level roles.
- Organization profile, verified domain, owner and team membership.
- Connected-app registry with app name, environment, redirect origins, callback URLs, status and last activity.
- OAuth / API / MCP connection setup, scope selection, secret rotation and revocation.
- Sandbox and production environments with separate credentials.
- API explorer, webhook registration, signing-secret rotation, delivery attempts and replay controls.
- Usage, quota, latency, errors, rate-limit events and billing records.
- Project/workspace sharing, co-build requests, integration templates and partner support.
- Approval, compliance review, security contacts, contract/terms acceptance and renewal history.

Require email and domain ownership verification, manual approval for sensitive scopes, least privilege, environment separation, credential expiry and immutable audit records. Partner users must only see their own organization's resources.

## Admin platform observability

Build a service registry for all verified AELIA hostnames and services, with owner, environment, deployment target, health endpoint, criticality and escalation contact. Instrument frontend and backend services with OpenTelemetry-compatible traces, metrics and structured logs. Collect:
- Availability, latency percentiles, error rates and synthetic route checks.
- Deployment version, build result, rollback and incident history.
- API requests by route, tenant, key, status and latency (avoid logging secrets or message bodies).
- Queue depth, job duration, retries and dead-letter counts.
- Database connection saturation, query latency and backup freshness.
- Email delivery events, payment webhook outcomes and storage usage.
- Voice/video provider connectivity, call setup success, duration and failure categories.
- PWA install/launch diagnostics and client-side exceptions.

Admin should show a service map and incidents, not claim a service is healthy merely because its DNS record exists. Never collect private chat content as general telemetry. Restrict access to sensitive operational data, redact personal data, set retention limits and audit admin queries.

## Voice, calls and media

Treat these as separate real-time product capabilities with explicit provider adapters and operational metrics:
- Voice input and speech output.
- Low-latency, two-way voice conversations with AELIA.
- User-initiated voice calls and camera-enabled video sessions with AELIA, only where a real-time model/provider supports them.
- Microphone/camera permission indicators, mute/end controls, consent and recording settings.
- Optional transcript, summary and user-controlled deletion.
- Screen sharing as a separately permissioned later feature.
- Queue-based asynchronous image/video/audio generation; never hold long media jobs in a synchronous HTTP request.

Do not advertise languages, durations, call recording, video generation or provider support until verified end-to-end.

## Domain consolidation

Use one canonical destination per product. Proposed current choice:
- `blogs.aeliaai.org.ng` is the existing canonical blog host.
- `blog.aeliaai.org.ng` should redirect to it after DNS/domain verification.
- Keep `app`, `chat`, `admin`, `collab`, `api`, `mcp`, `docs`/developer documentation and distinct media tools separate where their jobs are genuinely different.
- Merge aliases only after checking DNS, Vercel/Cloudflare attachment, certificates, route behaviour, analytics and inbound links. Preserve paths and query strings on redirects.

## PWA requirements

The app PWA must have an app-specific manifest with name/short_name, icons, theme/background colors, `start_url: /`, `scope: /`, standalone display and app-specific shortcuts. Serve manifest, icons and service worker from the app origin. The service worker must not cache authenticated admin/API responses or stale private data. Verify Android installation and confirm the installed window opens `https://app.aeliaai.org.ng/`, not the marketing host.

Admin may have its own installable PWA, but it remains protected by Vercel Access/SSO plus application-level MFA and role checks. Offline caching must exclude privileged pages and API responses.

## Release and readiness gates

1. Route and accessibility tests on every canonical host.
2. Authentication, cross-subdomain SSO, CSRF, session expiry and role-isolation tests.
3. Guest quota enforcement tested on the server, not only in JavaScript.
4. Partner tenant-isolation and credential-scope tests.
5. Publishing entitlement expiry, refund, revocation and audit tests.
6. PWA installation tests on Android and service-worker security review.
7. API health, email, AI provider and payment webhooks verified with production credentials.
8. Load and cost tests before any user-count or concurrency claim.
9. Launch claims must distinguish live, beta, foundation and planned capabilities.
