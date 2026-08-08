# IELTS Personal Coach — Development Roadmap

**Version:** 2.0 (Claude Opus 5 regeneration)  
**Date:** 2026-08-07  
**Status:** Draft — Awaiting Approval

---

## Phase 0 — Planning ✅
**Goal:** Complete planning documentation before implementation.
**Deliverables:** 7 docs (PRD, ARCH, ROADMAP, TASKS, PROGRESS, DECISIONS, BACKLOG)
**DoD:** All written, internally consistent, no major ambiguities. ✅

---

## Phase 1 — Project Setup
**Goal:** Working Next.js 16 skeleton with DB, styling, AI client, Yoru persona module.
**Deliverables:**
- Next.js 16 (App Router, React 19, Turbopack) + TypeScript strict + Tailwind v4 + shadcn/ui
- Dark gothic theme
- Prisma + SQLite migrated
- `lib/ai/client.ts` → 9router; `lib/ai/yoru.ts` persona module
- Sidebar + Header shell with Yoru status pill
- `.env.local` template
**Tasks:** P1-01..P1-09
**DoD:** `pnpm dev` runs; dashboard shell loads; migration applied; Yoru ping via 9router succeeds.

---

## Phase 2 — Material Ingestion + RAG
**Goal:** Upload materials, extract, chunk, embed; RAG retrieval working.
**Deliverables:** Upload UI; PDF/DOCX/TXT/OCR parsers; chunker; embedder; `Chunk.embedding`; `lib/ai/retrieve.ts` cosine sim; material list/delete; upload security (allowlist, size, sanitize).
**Tasks:** P2-01..P2-11
**DoD:** Upload PDF → chunks embedded → retrieve top-k relevant chunks by query.

---

## Phase 3 — Diagnostic Assessment
**Goal:** Full diagnostic → per-skill band + overall + weakest tip.
**Deliverables:** Diagnostic flow (≥2/skill); band aggregation; results page; DiagnosticResult saved.
**Tasks:** P3-01..P3-11
**DoD:** Complete diagnostic → 4 skill bands + overall + weakest tip shown.

---

## Phase 4 — Core Practice (Generate + Evaluate + Chat)
**Goal:** Practice any skill with RAG-aware generation, Yoru evaluation, and Yoru chat.
**Deliverables:** Practice selector; `/api/generate` (RAG); 4 skill players; `/api/transcribe`; `/api/evaluate` (Yoru criteria); FeedbackPanel + HighlightedText; `/api/chat` Yoru panel; Attempt saved.
**Tasks:** P4-01..P4-17
**DoD:** Writing Task 2 → full Yoru feedback; Speaking → transcribed + scored; Yoru chat answers in-character.

---

## Phase 5 — Progress Tracking
**Goal:** Band history, trends, error patterns, target distance.
**Deliverables:** Progress page; snapshot recorder; BandHistoryChart; SkillRadarChart; error aggregator; target card.
**Tasks:** P5-01..P5-07
**DoD:** After ≥3 attempts, charts meaningful.

---

## Phase 6 — Gamification
**Goal:** XP, levels, streaks, badges, weekly challenge, Yoru-flavored rewards.
**Deliverables:** XP/level logic; StreakWidget (lazy); BadgeDisplay + pop-up; WeeklyChallenge (lazy Monday gen); gamification on dashboard.
**Tasks:** P6-01..P6-10
**DoD:** Exercise → XP animates + streak updates + first badge pops.

---

## Phase 7 — Settings & Polish
**Goal:** Configurable app, accessible, responsive, onboarding.
**Deliverables:** Settings page; theme toggle; onboarding wizard; skeletons; empty states; a11y pass; responsive.
**Tasks:** P7-01..P7-07
**DoD:** New user onboarding < 5 min; all pages have loading + empty states.

---

## Phase 8 — Testing & QA
**Goal:** Automated coverage; no critical bugs.
**Deliverables:** Vitest unit (band, xp, badges, retrieve); Playwright E2E (Reading + Writing); manual 4-skill QA; bug fixes.
**Tasks:** P8-01..P8-08
**DoD:** All tests pass; no P0/P1 open. (LLM calls mocked.)

---

## Phase 9 — Production Release
**Goal:** Packaged + documented.
**Deliverables:** README; prod build verified; seed script; optional Dockerfile.
**Tasks:** P9-01..P9-05
**DoD:** Fresh clone → install → build → start → all features work.
