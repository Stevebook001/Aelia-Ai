# AELIA Connector Hub

AELIA should treat external products and first-party apps as **scoped capabilities**, not as hard-coded screens.

## First-party targets
- Novella Matrix — `novellamatrix.org`
- SeaChat — `seachat.me`
- Akode — `akode.dev`

## Connector contract
Each connector should eventually provide:
1. Manifest: name, version, owner, scopes.
2. Authentication: OAuth/API key/service account.
3. Permission model: read/write/action scopes.
4. Tools: machine-readable capability definitions.
5. Webhooks/events.
6. Health check.
7. Audit policy.
8. Cost/rate limits.
9. Disconnect/revoke flow.

## Planned external connectors
GitHub, Google, Microsoft, Slack, Shopify, Stripe/PayPal, cloud storage, analytics and other services can be added without making them mandatory.

AELIA remains the orchestration layer; each connector is replaceable and permission-scoped.
