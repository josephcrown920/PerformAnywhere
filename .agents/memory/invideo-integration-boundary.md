---
name: InVideo integration boundary
description: The supported integration shape for InVideo model and workflow entries in Aurora.
---

InVideo's documented developer surface is a hosted remote MCP server at `https://mcp.invideo.io/sse`, not a public per-model generation API. Treat model-picker entries as workflow-backed unless an official app-facing API or supported connection is confirmed.

**Why:** Sending screenshot model names to an invented REST endpoint would create a misleading generation path and could charge users for work that cannot run.

**How to apply:** Keep workflow-only entries visibly labeled, allow users to copy a structured brief, and reject direct InVideo generation requests before credit creation. Re-check the official InVideo developer docs before adding a direct adapter.