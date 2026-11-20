# AELIA Model Programme

## Product principle

AELIA owns the model product, model gateway, training/evaluation pipeline, user experience and data controls. AELIA should not be permanently dependent on a commercial inference API. During the transition, optional external providers may be used as temporary fallbacks behind the same internal gateway, with provider use disclosed and disabled by default when our own runtime is ready.

## Model family (working product names)

| Product name | Intended role | Release status |
|---|---|---|
| AELIA 5.4 Mini | Small, efficient everyday assistant; first independently hosted model target | Planned |
| AELIA 5.4 | Flagship general assistant | Planned |
| AELIA 5.4 Reasoning | Longer reasoning, coding and agent planning | Planned |
| AELIA 5.4 Vision | Image understanding and multimodal input | Planned |

These are working names, not claims of trained weights, benchmark results or production availability.

## Recommended technical path

1. **Own the inference gateway:** keep the public AELIA API stable; add an internal model registry and provider adapter. Never expose inference credentials to the browser.
2. **Start with open weights:** evaluate commercially usable open-weight models, their licences, dataset terms and hardware requirements. Do not copy another provider's weights or training data.
3. **Host our first model:** use vLLM behind a private network and reverse proxy. vLLM offers an OpenAI-compatible serving interface, so the existing AELIA server adapter can route to our endpoint through `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.
4. **Build AELIA identity:** create instruction data, tool-use examples, Nigerian/West African language evaluation, coding tasks and domain-specific datasets that we have rights to use.
5. **Fine-tune before pre-training from scratch:** use supervised fine-tuning and preference optimisation to create a distinctive AELIA assistant. Full foundation pre-training is a later, much larger research and compute programme.
6. **Evaluate and release:** publish model cards, licence details, safety tests, quality benchmarks, latency, cost per million tokens and known limitations before calling a version production-ready.

## Initial model infrastructure

- Model serving: vLLM on a GPU host, isolated from public traffic.
- Gateway: AELIA API on the existing API project; only the gateway can call the private inference service.
- Data: PostgreSQL for metadata/evaluations, object storage for datasets and model artefacts.
- Training: separate, temporary GPU jobs; shut them down when not training.
- Observability: request IDs, token counts, latency, queue depth, GPU memory, errors and cost. Do not log private conversation content by default.
- Security: private model endpoint, rotated service credentials, rate limits, abuse controls, signed model artefacts and dataset provenance.

## Spend gates

- **No GPU purchase today.** First complete model selection, licence review, dataset plan and a reproducible local evaluation.
- For a small inference pilot, use an on-demand 24–48 GB GPU and shut it down outside test windows. Confirm the live quote before launching.
- A 24/7 RTX 4090 at $0.89/hour is approximately $648/month before storage, bandwidth and tax. A 48 GB L40S at $1.09/hour is approximately $796/month. An 80 GB A100 at $2.09/hour is approximately $1,526/month. These are illustrative calculations from current listed rates, not a purchase recommendation.
- Training a foundation model from scratch is not a small monthly subscription. It requires a large curated dataset, many high-memory GPUs, engineering time and repeated experiments. Start with a small open-weight model and fine-tune.

## Definition of done for an AELIA model release

- We own or have explicit rights to the model weights and training/evaluation data.
- Reproducible training/fine-tuning and evaluation records exist.
- Model card, licence, safety policy and limitations are published.
- The model runs behind AELIA's private inference gateway.
- Chat, streaming, tools, structured output and error handling pass integration tests.
- Quality, latency, reliability and unit economics meet release thresholds.
- The UI labels the model as available only after the deployed runtime passes those checks.
