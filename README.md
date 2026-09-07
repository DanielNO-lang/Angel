# Angel ✦

Angel is a private AI companion built around authenticated conversations, Gemini reasoning, persistent history and a foundation for memory, tools and agent workflows.

## Production architecture

- **Frontend:** `site/` static production app deployed by Netlify.
- **Auth + database:** Supabase Auth/Postgres with row-level security.
- **AI:** Supabase Edge Function `angel-chat` calling Gemini.
- **Secrets:** Gemini credentials stay server-side in Supabase secrets.
- **Source of truth:** production frontend, database migrations and Edge Function source are tracked in this repository.

## Deploy

Netlify publishes `site/` using the root `netlify.toml`. A push to `main` deploys the production site.

Supabase migrations live in `supabase/migrations/`. The chat function lives in `supabase/functions/angel-chat/`.

## Foundation guarantees

- Google authentication with persisted Supabase sessions.
- User-scoped conversations, messages and profiles protected by RLS.
- Conversation history can be opened and continued after refresh/sign-in.
- Username and display-name settings are stored in the database, not only browser storage.
- Chat requests have input limits, timeouts and retry handling.
- Provider failures return structured, user-safe errors.

## Roadmap

1. Foundation hardening
2. Angel orchestrator and model routing
3. Memory and conversation intelligence
4. Voice
5. Vision and multimodal
6. Agent engine
7. Connectors
8. Projects/workspace
9. Web/research
10. Proactive Angel
11. Offline/cross-device
12. 3D Angel

Do not commit API keys or service-role credentials. The browser may contain only the Supabase publishable key, protected by RLS.
