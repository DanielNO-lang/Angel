# Angel Architecture

## Current foundation

```text
Browser
  -> Supabase Auth
  -> Supabase Postgres (RLS)
  -> Supabase Edge Function: angel-chat
  -> Gemini
```

The browser never receives the Gemini API key. The Edge Function validates the request, applies size limits, calls Gemini with a timeout/retry policy, and returns a safe response.

## Conversation lifecycle

1. Authenticate the user.
2. Create a conversation on the first message.
3. Store the user message.
4. Send the conversation context to `angel-chat`.
5. Store the assistant response.
6. Update the conversation timestamp.
7. History queries only the authenticated user's rows.
8. Opening a history item restores the messages into the active client context.

## Security boundaries

All user-owned tables use RLS. Messages additionally require that their conversation belongs to the same authenticated user. Profiles are keyed directly to `auth.users` and have user-scoped policies.

## Phase 2 boundary

The next layer is the Angel orchestrator. It will sit behind the current `angel-chat` gateway and introduce request understanding, complexity classification, model routing, memory retrieval, tools, permissions, execution and verification without breaking the foundation storage contracts.
