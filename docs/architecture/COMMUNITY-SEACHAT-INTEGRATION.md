# SeaChat → AELIA Community deployment contract

## Canonical product address
The SeaChat application is served at https://community.aeliaai.org.ng/. Do not create, publish or redirect users to seachat.aeliaai.org.ng. The existing private repository is Stevebook001/seachat and the existing Vercel project is seachat.

## Product scope
Keep SeaChat's existing privacy-first messaging plan. The Community launch must include private one-to-one conversations, group rooms, contacts/invitations, persistent messages, attachments, delivery/read states, reactions, message actions, moderation/reporting, responsive mobile layout, push notifications and voice/video-call foundations. Do not add Status/Stories and do not add Channels. The professional publishing feed is a separate surface: posts, images/documents/video, reactions, comments, reposts, follows, profiles and organisation pages.

## Integration boundary
SeaChat remains the messaging application and owns conversation membership and message authorization. AELIA provides shared account/identity handoff and AI assistance through server-to-server integration. Do not share raw database credentials or expose internal SeaChat APIs to browsers. Map AELIA user identity to SeaChat identity with verified, signed, expiring tokens and explicit account-link consent. AELIA AI access to a conversation must be user-invoked and clearly visible; never silently read private chats.

## Deployment checklist
1. Confirm the seachat Vercel project is connected to Stevebook001/seachat and its current deployment is READY.
2. Remove the old seachat.aeliaai.org.ng project-domain assignment; the Vercel connector currently has no domain-removal action, so this step requires the Vercel dashboard.
3. Release community.aeliaai.org.ng from the AELIA frontend project and attach it to the SeaChat project.
4. Update the Cloudflare CNAME to the target Vercel provides for the SeaChat project, DNS-only unless a tested proxy design requires otherwise.
5. Add the Community PWA manifest, service worker, cookie preferences and platform-specific install guidance to the SeaChat application itself.
6. Configure the database, OAuth, object storage, WebSocket/Socket.IO, email, push and call secrets in the SeaChat deployment environment. Do not copy secrets into Git.
7. Test registration/login, room authorization, two-device real-time messaging, attachment permissions, offline retry, privacy settings, encryption claims, abuse reporting and account deletion before launch.

## Privacy requirements
Do not claim end-to-end encryption until the implementation and key management have been independently reviewed. Use TLS in transit, encryption at rest, least-privilege server access, per-room authorization, secure session revocation and auditable privacy settings. No Status or Channels feature is in this product scope.
