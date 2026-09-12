# Perform Anywhere

An anonymous, credit-based AI video platform. Film a performance, supply identity/outfit/scene references, and restage the performance in a new world using the configured video providers.

## Workflow Engine Upgrade

Perform Anywhere now has a provider-neutral workflow engine designed around the same capabilities being added to Aurora: workflow registry, intelligent planning, compatibility checks, GPU racing, shot construction, creative variants, marketplace manifests, benchmarking, and Seedance capability profiles.

### Workflow packs

- Perform Anywhere Motion Transfer — performance preservation, motion/pose transfer, identity/outfit/scene replacement.
- Music Video Suite — lip sync, beat sync, camera choreography, dance transfer, multi-shot continuity and outfit changes.
- Product Ad Factory — studio, lifestyle, UGC, luxury and cinematic variants in 6/15/30-second formats.
- Character & Identity Lock — identity, wardrobe, hair and character consistency.
- Social Creative Variant Factory — hooks, camera, environment and composition A/B matrices with batch generation.

### API

```text
GET  /api/workflows
GET  /api/workflows/:id
GET  /api/workflows/gpus/race?minVramGb=24&freeOnly=true
POST /api/workflows/plan
POST /api/workflows/compatibility
```

The planner scores workflows against task, modality, category, aspect ratio, duration, provider preference and requested capabilities. GPU routing ranks available workers by queue time and estimated cost, with a free-only mode. Compatibility checks expose missing workflow dependencies before execution.

### Perform Anywhere controls

The workflow engine supports a shot-builder contract of Scene → Subject → Camera → Motion → Lighting → Style → Duration → Aspect Ratio and a variant matrix for hooks/cameras/environments/compositions.

Seedance profiles include Seedance 2.5, Seedance 2.5 Pro and Seedance 2.5 Fast. The actual provider/model invocation remains behind the existing generation/provider boundary so credentials and live endpoint behavior stay centralized.

### Production roadmap represented in the contracts

Workflow versioning, dependency manifests, benchmark metrics, official/community/private workflow sources, fallback provider planning, batch generation, creative A/B testing and GPU-aware execution are represented as stable backend contracts. Execution adapters can be connected incrementally without replacing the existing Express/Supabase/Paystack architecture.

## Existing platform

The platform remains anonymous and credit-based with Paystack billing, Supabase storage/data, long-running render jobs, provider fallback, prompt enhancement, project history and the existing Studio/Projects/Orchestrate pages.

See the existing API and environment-variable sections below for the current provider configuration and development commands.
