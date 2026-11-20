# AELIA self-hosting and infrastructure plan

## Goal
Minimize recurring third-party inference and delivery dependencies while keeping AELIA's own APIs as the stable interface. An API is a contract between components; self-hosting a service removes a vendor dependency but does not remove the need for an interface.

## GPU: what we rent and what survives
A rented GPU is compute capacity billed while allocated. It is not a consumable product and it does not expire as hardware. When a rental stops, its compute becomes unavailable; files survive only on persistent storage or in our own object storage. Keep model weights, datasets, checkpoints, configs and deployment manifests outside ephemeral GPU disks.

Use a short pilot to validate one quantized open-weight language model and an inference server. Do not rent 24/7 or buy a physical GPU until throughput, latency, memory, electricity, cooling, network and total cost are measured.

## Self-hosting sequence
1. Language model inference: vLLM or another compatible inference runtime, with an adapter behind AELIA's existing /v1/chat API.
2. Fine-tuning: begin with licensed open weights and LoRA/QLoRA; keep training data consented, documented and versioned.
3. Embeddings and retrieval: self-host embedding model and vector search, with retention and deletion controls.
4. Speech: separate speech-to-text and text-to-speech services after measuring CPU/GPU demand.
5. Images: self-host a compatible diffusion model after licensing and hardware evaluation.
6. Video: asynchronous scene generation, audio, rendering and storage jobs; do not promise one-shot 60-minute generation.
7. Browser automation: isolated browser workers with SSRF protection, download controls and per-user job sandboxes.

## Email without Resend
Target stack: Postfix SMTP, Dovecot IMAP/mailboxes, Rspamd filtering, DKIM signing, SPF and DMARC, TLS certificates, queue monitoring, bounce processing, abuse controls, backups and webmail/admin. Cloudflare Email Routing is forwarding only; it is not a mailbox or outbound SMTP replacement. Test deliverability and reputation on a dedicated mail host before changing production sending. Do not expose SMTP credentials in frontend code.

## Cost controls
- GPU workloads are queued and metered; shut down idle compute.
- Keep persistent model/data storage separate from ephemeral GPU disks.
- Per-user quotas, maximum runtime, concurrency caps and budget alerts.
- Route small jobs to CPU or smaller quantized models when practical.
- Record provider, model, hardware, tokens/seconds, latency and cost per job.

## Security and governance
No private conversation data is used for model training by default. Users must explicitly opt in to any training use. Keep tenant isolation, encrypted secrets, access scopes, audit trails, deletion/export workflows and model license checks. Self-hosting transfers operational responsibility to AELIA; it does not remove it.
