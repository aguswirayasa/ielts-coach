# IELTS Personal Coach — Progress

**Version:** 2.0 | **Last Updated:** 2026-08-07 | **Status:** Planning Restart (Opus 5 regeneration)

---

## Overall Project Completion

```
Planning  ████████████████████  100%
Phase 1   ████████████████████  100%
Phase 2   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 3   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 4   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 5   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 6   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 7   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 8   ░░░░░░░░░░░░░░░░░░░░    0%
Phase 9   ░░░░░░░░░░░░░░░░░░░░    0%

Overall:  ████░░░░░░░░░░░░░░░░   ~19% (Phases 0–1 complete)
```

---

## Current Milestone
**Phase 1 — Project Setup** ✅ Complete. Awaiting approval to begin Phase 2 (Material Ingestion + RAG).

## Current Sprint
Sprint 1 (Phase 1) — complete. Sprint 2 = Phase 2.

---

## Recently Completed
- ✅ **Phase 1 — Project Setup** (2026-08-07): Next.js 16.3.0 scaffold; shadcn/ui Nova preset + 8 components; dark gothic theme; Prisma 7 schema (9 models, 4 enums) migrated to SQLite; `lib/ai/client.ts` → 9router; `lib/ai/yoru.ts` persona module; dashboard layout (sidebar + header + YoruStatusPill); 6 placeholder pages; `/api/health`; verified: tsc 0 errors, build 8/8 routes, browser renders gothic theme + "Yoru online" pill.
- ✅ PRODUCT_REQUIREMENTS.md v2.0+ (Next.js 16, Yoru persona, RAG, security, full AC)
- ✅ ARCHITECTURE.md v2.0+ (unified 9router, Yoru module, vector/RAG, job strategy)
- ✅ ROADMAP.md / TASKS.md / BACKLOG.md / DECISIONS.md / PROGRESS.md v2.x

## Current Work
Awaiting approval to begin Phase 2 (Material Ingestion + RAG).

## Upcoming Work
1. Phase 2: upload UI, PDF/DOCX/TXT/OCR parsers, chunker, local embeddings (transformers.js), cosine RAG, upload security
2. Phase 3: Diagnostic flow
3. Phase 4: Core practice (generate + evaluate + chat)

---

## Known Issues
None (pre-implementation).

## Technical Debt
None (pre-implementation).

## Risks
| Risk | Status | Mitigation |
|------|--------|------------|
| LLM band accuracy | Open | Detailed IELTS-descriptor prompts; feedback rating |
| OCR quality | Open | tesseract.js + paste fallback |
| Speaking eval without prosody | Accepted | Transparent; future audio analysis |
| 9router downtime | Open | Retry + cached exercises + status pill |
| Embedding model mismatch | Low | Pin model in config |

---

## Decision Log (see DECISIONS.md)
| Date | Decision |
|------|----------|
| 2026-08-07 | Next.js 16 (not 15) |
| 2026-08-07 | Unified AI via 9router (no Ollama ambiguity) |
| 2026-08-07 | Yoru as first-class persona module |
| 2026-08-07 | RAG with in-SQLite embeddings (no vector DB) |
| 2026-08-07 | Lazy background jobs (no scheduler) |
| 2026-08-07 | Upload security allowlist + sanitize |
| 2026-08-07 | Mocked LLM in tests |

## Change Log
| Date | Change |
|------|--------|
| 2026-08-07 | v2.0 — Full regeneration by Claude Opus 5 (prior v1.0 treated as draft) |
| 2026-08-07 | v2.1 — Free-tier verification: embeddings local (transformers.js), STT Web Speech API; LLM stays free via 9router FreeModel (ADR-012) |
| 2026-08-07 | v2.2 — TTS decision: Fish Audio free tier (anime voices + 15s clone) primary, Kokoro-82M local CPU fallback; hardware verified no GPU (ADR-013) |
