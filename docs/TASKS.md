# IELTS Personal Coach — Task List

**Version:** 2.0 | **Date:** 2026-08-07 | **Framework:** Next.js 16

Legend — Complexity: 🟢 Small (≤2h) · 🟡 Medium (2–4h) · 🔴 Large (4–8h)

---

## Phase 1 — Project Setup
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P1-01 | `create-next-app` Next.js 16 (TS, Tailwind, App Router, src/) | P0 | 🟢 | — | Completed |
| P1-02 | shadcn/ui init + base components | P0 | 🟢 | P1-01 | Completed |
| P1-03 | Dark gothic Tailwind theme (CSS vars + tokens) | P0 | 🟡 | P1-02 | Completed |
| P1-04 | Prisma schema (all models, §4 ARCH) | P0 | 🟡 | P1-01 | Completed |
| P1-05 | Migrate; verify `data/ielts.db` created | P0 | 🟢 | P1-04 | Completed |
| P1-06 | `lib/ai/client.ts` → 9router (env baseURL/model) | P0 | 🟢 | P1-01 | Completed |
| P1-07 | `lib/ai/yoru.ts` persona module + system prompt | P0 | 🟡 | P1-06 | Completed |
| P1-08 | Sidebar + Header shell + Yoru status pill | P0 | 🟡 | P1-02 | Completed |
| P1-09 | `.env.local` template + startup config validation | P0 | 🟢 | P1-06 | Completed |

---

## Phase 2 — Material Ingestion + RAG
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P2-01 | Materials page layout + routing | P0 | 🟢 | P1-08 | Backlog |
| P2-02 | Upload component (drag-drop + button, multi) | P0 | 🟡 | P2-01 | Backlog |
| P2-03 | `uploadMaterial` Server Action (validate→parse→chunk→embed→save) | P0 | 🔴 | P1-05 | Backlog |
| P2-04 | PDF parser (`lib/parser/pdf.ts`) | P0 | 🟡 | — | Backlog |
| P2-05 | DOCX parser (`lib/parser/docx.ts`) | P0 | 🟢 | — | Backlog |
| P2-06 | Plain text / paste handler | P0 | 🟢 | — | Backlog |
| P2-07 | OCR handler tesseract.js (image/scanned) | P1 | 🔴 | P2-04 | Backlog |
| P2-08 | Chunker (500-token, 50 overlap) | P0 | 🟡 | — | Backlog |
| P2-09 | `lib/ai/embed.ts` embedding via 9router | P0 | 🟡 | P1-06 | Backlog |
| P2-10 | Store Chunk.embedding (JSON Float32Array) | P0 | 🟢 | P2-09 | Backlog |
| P2-11 | `lib/ai/retrieve.ts` cosine RAG over chunks | P0 | 🟡 | P2-10 | Backlog |
| P2-12 | Material card list + delete (cascade) | P0 | 🟡 | P2-01 | Backlog |
| P2-13 | Upload security: allowlist, 25MB cap, filename sanitize | P0 | 🟡 | P2-03 | Backlog |

---

## Phase 3 — Diagnostic Assessment
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P3-01 | Diagnostic start page + CTA | P0 | 🟢 | P1-08 | Backlog |
| P3-02 | Diagnostic generator (≥2/skill, Yoru prompts) | P0 | 🔴 | P1-07 | Backlog |
| P3-03 | Reading diagnostic UI (TF/NG... MCQ) | P0 | 🟡 | P3-02 | Backlog |
| P3-04 | Writing diagnostic UI (Task 2, editor) | P0 | 🟡 | P3-02 | Backlog |
| P3-05 | Listening diagnostic UI (transcript + Qs) | P0 | 🟡 | P3-02 | Backlog |
| P3-06 | Speaking diagnostic UI (Part 1, text fallback) | P0 | 🟡 | P3-02 | Backlog |
| P3-07 | Streaming evaluation per skill (Yoru criteria) | P0 | 🔴 | P1-07 | Backlog |
| P3-08 | `lib/utils/band.ts` aggregation | P0 | 🟢 | — | Backlog |
| P3-09 | Results page (skill cards + overall) | P0 | 🟡 | P3-07 | Backlog |
| P3-10 | Save DiagnosticResult | P0 | 🟢 | P3-09 | Backlog |
| P3-11 | Weakest skill + Yoru improvement tip | P0 | 🟢 | P3-09 | Backlog |

---

## Phase 4 — Core Practice
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P4-01 | Practice selector page | P0 | 🟡 | P1-08 | Backlog |
| P4-02 | `POST /api/generate` SSE (RAG-aware) | P0 | 🟡 | P2-11 | Backlog |
| P4-03 | Reading generator prompts + player | P0 | 🟡 | P1-07 | Backlog |
| P4-04 | Writing generator prompts + player (editor, word count) | P0 | 🟡 | P1-07 | Backlog |
| P4-05 | Listening generator prompts + player | P0 | 🟡 | P1-07 | Backlog |
| P4-06 | Speaking generator (P1/2/3) + player (recorder) | P0 | 🔴 | P1-07 | Backlog |
| P4-07 | `POST /api/transcribe` (Whisper via 9router) | P0 | 🟡 | P1-06 | Backlog |
| P4-08 | `POST /api/evaluate` SSE (Yoru criteria) | P0 | 🟡 | P1-07 | Backlog |
| P4-09 | Evaluation prompts per skill (IELTS descriptors) | P0 | 🔴 | — | Backlog |
| P4-10 | FeedbackPanel + CriteriaScores | P0 | 🟡 | P4-08 | Backlog |
| P4-11 | HighlightedText (inline annotations) | P0 | 🟡 | P4-10 | Backlog |
| P4-12 | `POST /api/chat` Yoru chat SSE | P0 | 🟡 | P1-07 | Backlog |
| P4-13 | YoruChat panel (YoruAvatar, context-aware) | P0 | 🟡 | P4-12 | Backlog |
| P4-14 | Save Attempt (DB) | P0 | 🟢 | P4-08 | Backlog |
| P4-15 | "Explain feedback" follow-up (Yoru) | P1 | 🟡 | P4-08 | Backlog |
| P4-16 | Source-chunk traceability on generated exercise | P1 | 🟢 | P2-11 | Backlog |
| P4-17 | AI-only fallback when no materials | P0 | 🟢 | P4-02 | Backlog |
| P4-18 | TTS service (`lib/tts/tts.ts`, provider fish\|kokoro) | P0 | 🟡 | P1-09 | Backlog |
| P4-19 | Listening audio playback from TTS (fish free voices) | P0 | 🟡 | P4-18 | Backlog |
| P4-20 | Kokoro-82M local CPU fallback integration | P1 | 🔴 | P4-18 | Backlog |

---

## Phase 5 — Progress Tracking
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P5-01 | Progress page layout | P0 | 🟢 | P1-08 | Backlog |
| P5-02 | Progress snapshot Server Action | P0 | 🟢 | P4-14 | Backlog |
| P5-03 | BandHistoryChart (Recharts line) | P0 | 🟡 | P5-02 | Backlog |
| P5-04 | SkillRadarChart (current vs target) | P0 | 🟡 | P5-02 | Backlog |
| P5-05 | Error pattern aggregator (last 20 attempts) | P1 | 🟡 | P4-14 | Backlog |
| P5-06 | Target band progress card | P0 | 🟢 | P5-02 | Backlog |
| P5-07 | Exercises-completed-per-skill widget | P0 | 🟢 | P4-14 | Backlog |

---

## Phase 6 — Gamification
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P6-01 | `lib/gamification/xp.ts` | P0 | 🟢 | — | Backlog |
| P6-02 | `lib/gamification/levels.ts` | P0 | 🟢 | P6-01 | Backlog |
| P6-03 | XPBar (animated) | P0 | 🟡 | P6-01 | Backlog |
| P6-04 | `lib/gamification/streak.ts` lazy eval | P0 | 🟡 | — | Backlog |
| P6-05 | StreakWidget | P0 | 🟢 | P6-04 | Backlog |
| P6-06 | `lib/gamification/badges.ts` (8 types) | P0 | 🟡 | — | Backlog |
| P6-07 | BadgeDisplay + unlock pop-up | P0 | 🟡 | P6-06 | Backlog |
| P6-08 | WeeklyChallenge (lazy Monday gen + tracker) | P1 | 🔴 | P4-02 | Backlog |
| P6-09 | Integrate XP/badge into completion flow | P0 | 🟡 | P6-01, P6-06, P4-14 | Backlog |
| P6-10 | Gamification summary on dashboard | P0 | 🟡 | P6-03, P6-05 | Backlog |

---

## Phase 7 — Settings & Polish
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P7-01 | Settings page (all fields → DB) | P0 | 🟡 | P1-08 | Backlog |
| P7-02 | Theme toggle (dark/light) | P0 | 🟢 | P1-03 | Backlog |
| P7-03 | Onboarding wizard (3 steps) | P0 | 🔴 | P7-01, P3-01 | Backlog |
| P7-04 | Skeleton screens | P1 | 🟡 | all | Backlog |
| P7-05 | Empty states | P1 | 🟢 | all | Backlog |
| P7-06 | A11y audit (aria, keyboard, contrast) | P0 | 🟡 | all | Backlog |
| P7-07 | Responsive layout pass | P1 | 🟡 | all | Backlog |

---

## Phase 8 — Testing & QA
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P8-01 | Vitest setup | P0 | 🟢 | P1-01 | Backlog |
| P8-02 | Playwright setup | P0 | 🟡 | P1-01 | Backlog |
| P8-03 | Unit: band, xp, badges, retrieve (cosine) | P0 | 🟡 | P3-08, P6-01, P2-11 | Backlog |
| P8-04 | Integration: uploadMaterial, saveAttempt | P0 | 🟡 | P2-03, P4-14 | Backlog |
| P8-05 | E2E: Reading flow | P0 | 🟡 | P4 | Backlog |
| P8-06 | E2E: Writing Task 2 + feedback | P0 | 🟡 | P4 | Backlog |
| P8-07 | Manual QA: 4 skills | P0 | 🟡 | P4 | Backlog |
| P8-08 | Fix P0/P1 bugs | P0 | 🔴 | P8-07 | Backlog |

---

## Phase 9 — Production Release
| ID | Description | Prio | Cplx | Dep | Status |
|----|-------------|------|------|-----|--------|
| P9-01 | README (setup, 9router config, run) | P0 | 🟢 | P8 | Backlog |
| P9-02 | Verify prod build + start | P0 | 🟢 | P8 | Backlog |
| P9-03 | Seed script (demo data) | P1 | 🟢 | P8 | Backlog |
| P9-04 | Dockerfile (optional Coolify) | P2 | 🟡 | P9-02 | Backlog |
| P9-05 | Clean-env smoke test | P0 | 🟢 | P9-01 | Backlog |
