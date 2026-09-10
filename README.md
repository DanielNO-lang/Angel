# Angel ✦

Angel is a private AI companion built around authenticated conversations, persistent history, deterministic capability routing and resilient multi-provider reasoning.

## Production architecture

- **Frontend:** `site/` static production app deployed by Netlify.
- **Auth + database:** Supabase Auth/Postgres with row-level security.
- **Orchestration:** `angel-orchestrator` classifies tasks and applies deterministic capability/provider policy.
- **Chat:** `angel-chat` uses Gemini first, then Groq, then Cloudflare AI as tertiary fallback.
- **Specialized tools:** `angel-tools` handles transcription, speech and web research; vision and document analysis have dedicated functions.
- **Secrets:** provider credentials stay server-side in Supabase secrets.
- **Source of truth:** production frontend, database migrations and Edge Function source are tracked in this repository.

## Provider policy

Angel does not make the infrastructure provider choice from scratch on every request. Capability policy assigns the best default provider, while the chat layer keeps automatic failover so a provider outage does not become an Angel outage.

| Capability | Primary | Fallback |
|---|---|---|
| Normal chat / reasoning | Gemini | Groq → Cloudflare AI |
| Fast/realtime reasoning | Groq | Gemini |
| Voice transcription | Groq Whisper | provider failover layer |
| Voice output | Groq TTS | provider failover layer |
| Web research | Ollama Cloud | graceful unavailable state |
| Vision | Gemini | future multimodal fallback |
| Documents | Gemini | future multimodal fallback |
| Coding / agent planning | Gemini | Groq |

## Deploy

Netlify publishes `site/` using the root `netlify.toml`. Supabase Edge Functions are deployed independently from `supabase/functions/`.

Supabase migrations live in `supabase/migrations/`.

## Foundation guarantees

- Google authentication with persisted Supabase sessions.
- User-scoped conversations, messages and profiles protected by RLS.
- Conversation history can be opened and continued after refresh/sign-in.
- Username and display-name settings are stored in the database, not only browser storage.
- Chat requests accept both the current `messages` format and simple `message`/`prompt`/`task` payloads.
- Provider requests have timeouts, model fallback and structured user-safe errors.
- API credentials are never placed in the browser.

## Roadmap

1. Foundation hardening — complete
2. Orchestrator + deterministic model routing — complete
3. Memory + conversation intelligence — foundation complete; intelligence expansion next
4. Voice — foundation complete; realtime voice experience next
5. Vision + multimodal — foundation complete; richer multimodal workflows next
6. Agent engine — foundation complete; execution loop next
7. Connectors
8. Projects/workspace
9. Web/research — foundation complete; source-quality workflow next
10. Proactive Angel
11. Offline/cross-device
12. 3D Angel

Do not commit API keys or service-role credentials. The browser may contain only the Supabase publishable key, protected by RLS.
