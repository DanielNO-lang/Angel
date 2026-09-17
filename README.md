# Angel ✦

Angel is a private AI companion built around authenticated conversations, persistent history, deterministic capability routing and resilient multi-provider reasoning.

## Production architecture

- **Frontend:** `site/` static production app deployed by Netlify.
- **Auth + database:** Supabase Auth/Postgres with row-level security.
- **Orchestration:** `angel-orchestrator` classifies tasks and applies deterministic capability/provider policy.
- **Chat:** `angel-chat` uses Gemini first, then Groq, then Cloudflare AI as tertiary fallback.
- **Agent engine:** `angel-agent` adds a persistent plan → act → observe → repeat execution loop with tasks, memory, approvals, research, live X search, image generation and video generation when provider credentials are available.
- **Specialized tools:** `angel-tools` handles transcription, speech and web research; vision and document analysis have dedicated functions.
- **Secrets:** provider credentials stay server-side in Supabase secrets.
- **Source of truth:** production frontend, database migrations and Edge Function source are tracked in this repository.

## Capability policy

Angel treats provider selection as a routing decision rather than a permanent vendor lock-in. Capability policy assigns defaults while chat and agent layers keep fallback paths where credentials are available.

| Capability | Current primary path | Fallback / extension |
|---|---|---|
| Normal chat / reasoning | Multi-provider `angel-chat` | Gemini, Groq, OpenAI, Anthropic, xAI, DeepSeek, Mistral, Cloudflare when configured |
| Agent workflows | `angel-agent` | Multiple planner providers |
| Fast/realtime reasoning | Groq / routed provider | Gemini |
| Voice transcription | Groq Whisper | provider layer |
| Voice output | ElevenLabs / Groq | provider layer |
| Web research | Ollama / Perplexity | graceful unavailable state |
| Live X search | xAI X Search | unavailable until XAI credentials are configured |
| Vision | Gemini | multimodal provider layer |
| Documents | Gemini | multimodal provider layer |
| Image generation | xAI Imagine / Stability | provider layer |
| Video generation | xAI Imagine Video | unavailable until XAI credentials are configured |

## Deploy

Netlify publishes `site/` using the root `netlify.toml`. Supabase Edge Functions are deployed independently from `supabase/functions/`.

Supabase migrations live in `supabase/migrations/`.

## Foundation guarantees

- Google authentication with persisted Supabase sessions.
- User-scoped conversations, messages, memory, tasks, approvals and agent runs protected by RLS.
- Conversation history can be opened and continued after refresh/sign-in.
- Username and display-name settings are stored in the database, not only browser storage.
- Chat requests accept both the current `messages` format and simple `message`/`prompt`/`task` payloads.
- Agent runs persist their steps and results instead of pretending work happened.
- Risky actions can pause for explicit user approval.
- Public custom assistants have a marketplace-ready schema and Agent Lab UI.
- Provider requests have timeouts, model fallback and structured user-safe errors.
- API credentials are never placed in the browser.

## Roadmap

1. Foundation hardening — complete
2. Orchestrator + deterministic model routing — complete
3. Memory + conversation intelligence — active
4. Voice — foundation complete; realtime voice experience next
5. Vision + multimodal — foundation complete; richer multimodal workflows next
6. Agent engine — execution loop foundation complete; connector expansion next
7. Connectors
8. Projects/workspace
9. Web/research — foundation complete; source-quality workflow next
10. Proactive Angel
11. Offline/cross-device
12. 3D Angel

The supplied comparison material is treated as a capability checklist, not as authoritative product documentation. Angel keeps useful capabilities and verified technical paths while avoiding stale or unsupported competitor claims as hard requirements.

Do not commit API keys or service-role credentials. The browser may contain only the Supabase publishable key, protected by RLS.
