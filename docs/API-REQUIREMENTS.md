# AELIA API & Infrastructure Requirements

## Needed now

### 1. AI provider
Set one of:
- `AI_API_KEY`
- `OPENAI_API_KEY`

Optional:
- `AI_BASE_URL`
- `AI_MODEL`

The secret belongs only in the Coolify API environment, never in the browser or GitHub.

## Needed for the next production stage

### 2. Database
Use PostgreSQL for:
- users
- organizations
- memberships
- sessions
- projects
- conversations
- messages
- memories
- files
- agents
- capabilities
- tasks
- workflows
- connectors
- permissions
- usage
- subscriptions
- payments
- audit logs
- API keys

Environment:
`DATABASE_URL`

### 3. Queue / cache
Redis or an equivalent managed service for:
- long-running agents
- research jobs
- scheduled tasks
- retries
- rate limiting
- temporary state

Environment:
`REDIS_URL`

### 4. Object storage
S3-compatible storage for:
- uploaded documents
- images
- audio
- video
- generated files

Environment:
`OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ACCESS_KEY`, `OBJECT_STORAGE_SECRET_KEY`

### 5. Email
Needed for:
- signup verification
- password recovery
- security alerts
- billing notifications
- product notifications

Official aliases planned:
`hello@`, `support@`, `security@`, `privacy@`, `developers@`, `billing@`, `partnerships@`, `no-reply@` + `aeliaai.org`.

Environment:
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

### 6. Payments
Needed when credits/subscriptions are enabled.

Environment:
`PAYMENT_PROVIDER`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`

Do not choose a provider in code until the payment architecture is finalized.

## Later capability providers

These should be adapter-based rather than hard-coded:
- web search
- browser/computer interaction
- image generation/editing
- speech-to-text
- text-to-speech
- video generation/editing
- maps/location
- messaging
- external SaaS connectors

AELIA should be able to replace providers without rewriting the product's core orchestration layer.

## Security rule

No password, API token, SMTP credential, payment secret or OAuth refresh token should be pasted into chat or committed to GitHub. Store secrets in the production environment manager.
