# AELIA AI — Light. Intelligence. Yours.

AELIA AI is the unified AI workspace being built by **Novella Matrix**.

**Founder:** Ibrahim Akanni Ahmad  
**Organization:** Novella Matrix — Lagos, Nigeria  
**Website:** https://aeliaai.org.ng/  
**Public contact:** hello@aeliaai.org.ng  
**Sponsor / guest-post contact:** blogs@aeliaai.org.ng

> Founder phone numbers are intentionally not published in this repository or website.

## Foundation

The current web app is a bright, responsive workspace foundation with:

- Animated glass AELIA identity
- Chat & Reason
- AELIA Agents
- Research
- Creation / media studio foundations
- Code and developer workspace
- Projects
- Files & Knowledge
- Automations
- Connector Hub
- Channels
- Developer Center
- Bright / Night mode
- Local workspace persistence
- SEO metadata, canonical URL, robots.txt and sitemap.xml

## 100+ capability roadmap

AELIA is designed as a provider-neutral orchestration layer. Planned capabilities include:

1. Chat
2. Reasoning
3. Long-context tasks
4. Structured output
5. Deep research
6. Web search
7. Source verification
8. Summarization
9. Translation
10. Multilingual conversation
11. Memory
12. Knowledge bases
13. Document Q&A
14. OCR
15. Vision
16. Speech-to-text
17. Text-to-speech
18. Voice conversations
19. Real-time voice
20. Voice calls
21. Video-call assistant
22. Writing
23. Editing
24. Image generation
25. Image editing
26. Image understanding
27. Video generation
28. Long-form video pipeline
29. Voice-over generation
30. Music generation
31. Song assistance
32. Tone / melody assistance
33. Sound effects
34. Captions
35. Presentations
36. Social content
37. Brand assets
38. PDF generation
39. Spreadsheet generation
40. Data analysis
41. Code generation
42. Code explanation
43. Debugging
44. Test generation
45. Code review
46. Repository analysis
47. GitHub workflows
48. Pull-request assistance
49. Issue triage
50. Deployment assistance
51. API design
52. Database design
53. SQL assistance
54. Architecture planning
55. Agent development
56. Sandboxed execution
57. Log analysis
58. Security review
59. Performance review
60. Documentation generation
61. Chief orchestrator agent
62. Research agent
63. Developer agent
64. Creative agent
65. Media agent
66. Voice agent
67. Support agent
68. Sales agent
69. Marketing agent
70. Data agent
71. Workflow operator
72. Scheduled jobs
73. Approval workflows
74. Human handoff
75. Tool permissions
76. Agent memory
77. Audit trail
78. Retry and recovery
79. Queues
80. Long-running tasks
81. GitHub connector
82. Google connector
83. Microsoft connector
84. Telegram connector
85. WhatsApp Business Platform connector
86. Email connector
87. Webhooks
88. REST APIs
89. MCP-compatible tools
90. Novella Matrix connector
91. SeaChat connector
92. AKODE connector
93. Payment connector
94. Cloud storage
95. Calendar
96. CRM
97. Support systems
98. Analytics
99. Publishing platforms
100. AELIA developer apps
101. Connector marketplace
102. Agent marketplace
103. Usage and credit controls
104. Team workspaces
105. Organization roles
106. Secure sharing
107. Export and deletion
108. Observability
109. Cost controls
110. Human approval gates

This roadmap is a plan; features are only considered live after their backend, permissions, infrastructure and testing are completed.

## Architecture direction

`User → AELIA API → Orchestrator → Policy/Memory → Capability Registry → Agents → Tools → Verification → Result → Audit`

- Web: Vercel
- DNS / edge / security: Cloudflare
- API: Vercel Functions, Cloudflare Workers, or Coolify depending workload
- Storage: R2 or S3-compatible object storage
- Database: production database selected during backend phase
- Queues: queue/worker layer for long jobs
- AI: provider adapter layer so AELIA can route each task appropriately
- Integrations: OAuth, API keys, webhooks and scoped permissions

## Domains

Primary:
- https://aeliaai.org.ng/
- https://www.aeliaai.org.ng/

Planned:
- https://api.aeliaai.org.ng/
- https://dev.aeliaai.org.ng/
- https://admin.aeliaai.org.ng/

## Messaging

AELIA is being prepared for:

- WhatsApp Business Platform / Cloud API
- Telegram Bot API
- Web chat
- Future SeaChat integration
- Email workflows

Admin controls will include:

- WhatsApp AI ON / OFF
- Telegram AI ON / OFF
- Human takeover
- Maintenance mode
- Emergency stop
- Rate and usage limits

## Email

Planned public addresses:

- hello@aeliaai.org.ng
- support@aeliaai.org.ng
- admin@aeliaai.org.ng
- security@aeliaai.org.ng
- billing@aeliaai.org.ng
- developers@aeliaai.org.ng
- blogs@aeliaai.org.ng

Cloudflare Email Routing can forward these addresses to an existing inbox. A full mailbox provider is a separate decision.

## Ecosystem

Known Novella Matrix projects:

- https://novellamatrix.org/
- https://seachat.me/
- https://akode.dev/
- https://gorovik.com/
- https://aeliaai.org.ng/

Additional canonical project links can be added as they are confirmed.

## Environment variables

Never commit real secrets.

Production integrations may require:

- AI provider API keys
- Search credentials
- Database URL
- Storage credentials
- WhatsApp credentials
- Telegram bot token
- OAuth credentials
- Payment credentials
- Email provider credentials
- Cloudflare credentials where required

See `.env.example`.

## Security

- No secrets in Git
- Least-privilege OAuth
- Per-connector permissions
- Webhook signature verification
- User confirmation for sensitive actions
- Rate limiting
- Abuse protection
- Audit logs
- Data retention controls
- Account export and deletion
- Separate public frontend and privileged backend

## Development rule

The public frontend can be deployed before sensitive integrations are enabled. Credentials belong only in Vercel, Cloudflare or Coolify environment settings.

© Novella Matrix. AELIA AI is a Novella Matrix project.
