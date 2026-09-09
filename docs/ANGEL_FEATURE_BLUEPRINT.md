# Angel Feature Blueprint

This blueprint merges the current Angel product roadmap with the attached competitor capability references. The attached material distinguishes source-backed facts from third-party claims, so capability targets below are treated as product requirements rather than claims that Angel already has them.

## North Star
Angel is a private, account-aware AI companion that can converse, remember, reason, create, research, use tools, work with files, operate projects, and safely execute approved actions.

## Capability Matrix

### Core conversation
- Reliable authenticated chat
- Conversation history, restore, rename, delete, search
- Recent and pinned conversations
- Draft persistence
- Streaming responses
- Regenerate / edit / retry
- Message actions and feedback

### Intelligence
- Angel orchestrator
- Complexity detection
- Model routing
- Thinking/effort selection
- Context management
- Memory retrieval and writing
- Verification layer
- Structured error recovery
- Multi-model provider abstraction

### Memory and personalization
- Account profile and username
- Custom instructions
- Persistent memories with controls
- Memory import/export
- Project-specific instructions and knowledge
- Personalization layers
- Optional recap and time/focus features

### Files, code and artifacts
- Upload PDFs, documents, spreadsheets, images, code and text
- File parsing and retrieval
- Code execution in a sandbox
- Generate/edit DOCX, XLSX, PPTX, PDF and text files
- Interactive artifacts and mini-apps
- Charts, diagrams and visual outputs

### Multimodal
- Image understanding
- Image generation
- Image editing
- Audio input/output
- Natural voice conversation
- Video understanding
- Video generation where an approved provider is available

### Research and web
- Live web search
- Multi-step research mode
- Source citations
- Browser automation
- Page interaction
- Search result verification
- Real-time feeds/connectors where permitted

### Agents and tools
- Tool/function calling
- Permission layer before external side effects
- Connector framework
- Skills/workflows
- Long-running agent jobs
- Scheduled and recurring tasks
- Tool result verification
- Audit trail for actions

### Projects/workspace
- Persistent projects
- Project knowledge/RAG
- Project files
- Project instructions
- Share/collaborate later
- Workspace dashboard

### Integrations
- Google ecosystem
- Microsoft 365
- Slack
- Notion
- Drive
- Calendar
- GitHub
- Additional MCP-compatible services

### Product surfaces
- Responsive web app
- Desktop app target
- Mobile target
- Keyboard shortcuts
- Notifications
- Appearance/font controls
- Capability toggles
- Privacy/export/delete controls

## Phase Gates

### Phase 1: Foundation
Production deployment, authentication, reliable chat, persistence, profiles, database integrity, error handling, source control and CI.

### Phase 2: Angel Brain / Orchestrator
Request understanding → complexity → model routing → context assembly → memory retrieval → tool decision → permission check → execution → verification → response.

### Phase 3: Memory
Durable memory extraction, relevance retrieval, user controls, project memory and personalization.

### Phase 4: Voice
Low-latency speech input/output and natural conversational turn-taking.

### Phase 5: Vision / Multimodal
Images, documents and additional media understanding, then generation/editing capabilities.

### Phase 6: Agent Engine
Tools, permissions, long-running work, browser operations, scheduling and verification.

### Phase 7: Connectors
MCP-compatible services and first-party integrations.

### Phase 8: Projects / Workspace
Project knowledge, files, instructions, sharing and collaboration.

### Phase 9: Web / Research
Search, source-grounded research, citations and browser workflows.

### Phase 10: Proactive Angel
Recaps, reminders, scheduled work, notifications and user-approved proactive assistance.

### Phase 11: Cross-device
Desktop/mobile packaging, sync, offline-aware state and device permissions.

### Phase 12: 3D Angel
Optional visual embodiment and spatial interfaces.

## Design Rule
Features are implemented behind stable capability interfaces so provider changes do not require rewriting the product. Secrets remain server-side. External side effects require explicit permission gates. Every agent action must be observable and verifiable.
