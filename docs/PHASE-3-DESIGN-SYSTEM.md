# Angel Phase 3: Product + Experience Design System

## North star

Angel should feel like a premium personal workspace, not an AI demo. The interface should be calm, editorial, tactile and unmistakably its own. Intelligence is expressed through behavior and useful status, not glowing orbs, excessive gradients, robot imagery or generic purple AI styling.

## Research synthesis

### Product patterns worth borrowing

- **Arena Max:** model routing can be an infrastructure decision rather than a user burden. Angel therefore routes by capability and task, with explicit overrides only when useful.
- **ChatGPT / Work:** long-running work benefits from visible progress, connected files/apps, approvals and resumable tasks.
- **Gemini:** proactive briefs, multimodality, agentic actions and cross-app context point toward Angel becoming an assistant that can act, not only answer.
- **Perplexity:** deep research should expose source quality, breadth, calculations, files and an understandable research process.
- **Claude / Vibe:** work, coding and professional workflows are better represented as modes/workspaces than as one endless chat box.
- **Grok:** speech-to-speech, visual creation and long-running agent work demonstrate the direction of richer realtime interaction.
- **Meta AI:** personal context, daily briefs, app integrations, creative generation and wearable access show the value of ambient assistance.
- **Apple Intelligence:** personal context, screen awareness, cross-app actions and privacy-first integration suggest Angel should eventually understand the user's workspace while remaining explicit about permissions.
- **Microsoft HAX:** make capabilities and limitations clear, explain consequential actions, provide feedback controls and show what the system is doing without pretending certainty.
- **Apple / Figma motion guidance:** motion should orient, provide feedback, preserve continuity and add narrative, not decorate every surface.
- **Premium productivity products:** keyboard-first navigation, restrained chrome, strong typography, contextual panels and fast feedback should shape Angel's desktop experience.

## Brand direction

- Replace the current star/orb visual language.
- Use a custom Angel mark slot that can accept the final logo later.
- Core palette: deep ink, warm paper, muted stone, copper/amber accent and a restrained sage success tone.
- Avoid neon purple, rainbow gradients, glass everywhere and circular AI blobs.
- Typography: highly legible sans-serif for UI/body, expressive serif/display face for selected brand moments only.
- Surfaces should be layered by elevation and contrast, not by heavy borders.
- Rounded corners are moderate and purposeful, not pill-shaped everywhere.

## Motion language

1. **Presence:** subtle breathing/settling only when Angel is actively working.
2. **Thinking:** a quiet moving trace, not a spinner.
3. **Research:** source-count and stage transitions reflect actual requests.
4. **Voice:** waveform responds to real recording state.
5. **Success:** short tactile confirmation.
6. **Panels:** preserve spatial continuity when opening/closing.
7. **Errors:** calm inline recovery state, never a scary red wall.
8. Respect `prefers-reduced-motion`.

## Core experience

### Navigation

- Angel home
- History
- Explore capabilities
- Projects / workspaces
- Settings
- Account

### Composer

- Text
- Dictation
- Research
- Attachments
- Future tools menu
- Send

### Conversation

- Clean editorial messages
- Source cards for research
- Tool/activity timeline when useful
- Copy, listen and regenerate controls
- Provider/model metadata hidden behind an advanced detail affordance
- No fake claims about tools, memory or actions

### Activity states

Use truthful states such as:

- Preparing
- Thinking
- Researching
- Reading sources
- Analyzing file
- Listening
- Speaking
- Finishing

Never display a tool state unless the corresponding operation has actually started.

## Capability map

| Capability | Current / target owner |
|---|---|
| Normal reasoning | Gemini primary, Groq fallback, Cloudflare fallback |
| Fast reasoning | Groq |
| Voice transcription | Groq Whisper |
| Voice output | Groq TTS |
| Research | Ollama web search + future multi-source research engine |
| Vision | Gemini multimodal |
| Documents | Gemini multimodal |
| Orchestration | Angel orchestrator |
| Agent planning | Angel agent |
| Memory | Supabase memory layer |
| Future computer use | Tool/agent layer with explicit approvals |
| Future connectors | MCP/connector layer |

## Future capability horizon

Angel should be architected toward:

- multimodal live voice
- screen and camera awareness
- deep research with plans, source graphs and citations
- browser/computer control
- coding workspaces and sandboxed execution
- scheduled and trigger-based tasks
- long-running agents with resumable jobs
- subagents / specialist workers
- persistent project memory
- user-controlled memory and privacy boundaries
- local/on-device fallback where practical
- app connectors and MCP
- generated documents, slides, spreadsheets and websites
- image/video/audio creation through pluggable providers
- personalized daily briefs
- proactive but permissioned suggestions
- wearable/ambient interfaces
- eventually spatial/3D interfaces

## Future intelligence architecture

The UI must remain provider-agnostic. Users should experience **Angel**, while the routing layer selects the best available capability. Provider choice can be exposed as an advanced control, but should not clutter normal conversations.

## Safety / trust

- Never claim an action that did not happen.
- Show what Angel is doing when an operation takes time.
- Ask before consequential external actions.
- Provide cancellation where technically possible.
- Give users control over memory and connected sources.
- Keep credentials server-side.
- Distinguish generated content from retrieved sources.
- Label experimental features.

## Future updates and rumours

Public announcements, research and product signals are valid inputs to the roadmap. Unverified leaks are **not** treated as product facts or implementation requirements. They may be recorded separately as watch items and only promoted after reliable confirmation.

## Phase 3 delivery sequence

1. Replace visual foundation and branding shell.
2. Rebuild responsive navigation and composer.
3. Rebuild conversation surface and activity states.
4. Upgrade research/source presentation.
5. Upgrade voice/dictation presentation.
6. Upgrade file/vision/document presentation.
7. Add settings/explore surfaces.
8. Add accessibility, reduced motion and keyboard navigation.
9. Validate production JavaScript and deploy.
10. User acceptance pass, then proceed to Phase 4 capability expansion.
