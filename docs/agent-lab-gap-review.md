# Angel Agent Lab Gap Review

Reviewed against the uploaded Angel agent scaffold, the uploaded September 2026 capability comparison, and current public product documentation checked on September 17, 2026.

## Source 1: uploaded Angel agent scaffold

The scaffold defines five priorities: a growing tool registry, persistent memory, autonomy/permission controls, a real interface, and scheduling/proactivity.

Angel already has the first four foundations in production architecture: specialized tools, persistent memory, approval controls, a web interface, voice, and authenticated history. The remaining scaffold-level gap is true background scheduling/proactivity rather than one-off task creation.

## Source 2: uploaded comparison document

The comparison calls out native image/video generation, real-time social streams, a public marketplace of custom bots, mature voice, autonomous task execution/browser automation, multi-model routing, deeper platform integrations, and context-window differences. It explicitly warns that these are third-party claims and may be stale, so they are treated as a capability checklist, not as product rankings.

Angel already has multi-model routing, voice, research, image-generation plumbing, memory, agent planning, and a marketplace foundation. New work focuses on the capabilities that remain genuinely distinct or incomplete.

## Current external research

OpenAI Workspace Agents provide reusable agents with model/reasoning selection, tools/apps/skills/files, preview/testing, sharing, schedules, API triggers, approval controls, and publishing.

Perplexity Computer emphasizes background/continuous tasks, parallel research, browser automation, connectors, skills, and long-running workflows.

Gemini Spark separates tasks, schedules, and reusable skills and supports time-based and event/monitor schedules.

Manus exposes local computer access and browser operation so an agent can work in the user's authorized environment.

AgentLab-style platforms increasingly emphasize learning loops, governance, audit trails, analytics, visual workflows, knowledge bases, and broad integrations.

## Gaps now represented in Angel's Agent Lab UX

- Persistent run history with inspectable execution traces
- Task queue with due dates
- Approval queue for high-impact actions
- Provider/capability health
- Reusable skill packs
- Draft → preview → publish flow for custom assistants
- Public assistant marketplace foundation
- Parallel research workflow
- Explicit browser/desktop control gap shown in the UI rather than implied as available
- Agent metrics and lightweight observability

## Still intentionally not claimed as complete

- Recurring/background scheduler execution
- Full browser computer-use control
- Local desktop control
- Broad connector marketplace/integrations
- Automatic long-term learning from run feedback
- Multi-agent parallel delegation beyond parallel research calls

These should be implemented only when the underlying runtime exists, rather than simulated by UI labels.
