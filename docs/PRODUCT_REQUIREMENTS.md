# IELTS Personal Coach — Product Requirements Document

**Version:** 2.0 (Claude Opus 5 regeneration)  
**Date:** 2026-08-07  
**Status:** Draft — Awaiting Approval

---

## 1. Project Overview

IELTS Personal Coach is a **local-first web application** built with **Next.js 16** that acts as a personal IELTS tutor. It is powered end-to-end by **Yoru (夜)** — a Japanese head-maid AI persona — served through Master's local **9router AI gateway**. The user feeds it their own study materials; Yoru diagnoses their current English level across all four IELTS skills, generates targeted practice exercises from those materials, evaluates responses with detailed band-aligned feedback delivered in her voice, tracks improvement, and gamifies the journey to sustain daily study.

The application is **not a generic LLM chat wrapper**. It is a structured coaching system: every AI interaction is a typed operation (diagnose / generate / evaluate / explain) routed through Yoru's fixed persona and IELTS scoring expertise.

---

## 2. Vision

Give any IELTS candidate a devoted, always-available study partner who knows their weak points better than any prep book, adapts every session to close the gap to their target band, and keeps them motivated through a gothic-maid-gamified learning ritual.

---

## 3. Goals

| # | Goal | Traceable to |
|---|------|--------------|
| G1 | Accurately assess current IELTS band across all four skills | US-02 |
| G2 | Generate exercises derived from the user's uploaded materials (RAG, not generic templates) | US-03, US-13 |
| G3 | Provide detailed, actionable, criterion-aligned feedback on every response | US-04, US-05 |
| G4 | Track skill progression over time with clear visualization | US-06 |
| G5 | Sustain daily practice through gamification | US-07 |
| G6 | Run fully locally — no external subscription for core usage | NFR-03 |
| G7 | Cover all four skills (Reading, Writing, Listening, Speaking) | US-01..US-05 |
| G8 | Deliver every interaction in Yoru's consistent persona | NFR-06 |

---

## 4. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Diagnostic accuracy | Band estimate within ±0.5 of a real mock-test score | Compare Yoru's diagnostic vs. a graded practice test |
| Exercise relevance | ≥ 80% rated "relevant" | In-app 👍/👎 on each generated exercise |
| Feedback helpfulness | ≥ 80% rated "helpful" | In-app rating after feedback |
| Session completion | ≥ 70% of started exercises completed | Attempt table vs. session starts |
| Daily return | ≥ 5 active days/week during study window | UserProfile.lastActiveDate streak |
| Band improvement | ≥ 0.5 band / 4 weeks for active users | Progress snapshots |

---

## 5. User Personas

### Primary — The Focused Candidate (Kingz archetype)
- Adult, non-native English speaker, target band 7+, test in ~2–3 months
- Pain: generic books ignore personal weak areas; no time for classes; wants honest, specific feedback
- Behavior: 1–2 h/day, uses own materials, motivated by visible progress

### Secondary — The Re-taker
- Has sat IELTS, knows exact weak sections (often Writing Task 2 or Speaking)
- Pain: wasted a test fee; wants surgical drills
- Behavior: focuses 1–2 skills, time-pressured

### Tertiary — The Material Hoarder
- Has notes, PDFs, class handouts but no study system
- Pain: material scattered, never practiced
- Behavior: bulk-uploads, relies on RAG to surface relevant drills

---

## 6. Functional Requirements

### 6.1 Material Ingestion (INGEST)
| ID | Requirement |
|----|-------------|
| INGEST-01 | Upload PDF, DOCX, TXT, and image (PNG/JPG) files |
| INGEST-02 | Paste raw text as a material source |
| INGEST-03 | Add a YouTube URL; app fetches + stores transcript (future, P2) |
| INGEST-04 | Parse → chunk → embed → store locally |
| INGEST-05 | Label material by skill (READING / WRITING / LISTENING / SPEAKING / GENERAL) |
| INGEST-06 | Delete or archive materials (cascades to chunks) |
| INGEST-07 | Reject unsupported file types and files > 25 MB with a clear message |
| INGEST-08 | Detect non-English source text and warn that exercises generate in English |

### 6.2 Diagnostic Assessment (DIAG)
| ID | Requirement |
|----|-------------|
| DIAG-01 | Initial diagnostic covering all four skills |
| DIAG-02 | Per-skill band estimate + overall (rounded average) |
| DIAG-03 | Retake allowed after ≥ 14 days |
| DIAG-04 | Weakest skill highlighted with a concrete improvement tip |
| DIAG-05 | Each diagnostic item scored by Yoru against IELTS criteria |

### 6.3 Exercise Generation (EXER)
| ID | Requirement |
|----|-------------|
| EXER-01 | Reading: TF/NG, MCQ, matching, gap-fill, short answer |
| EXER-02 | Writing: Task 1 (chart/process/letter) + Task 2 (essay) |
| EXER-03 | Listening: comprehension from transcript/audio |
| EXER-04 | Speaking: Part 1 Qs, Part 2 cue card, Part 3 discussion |
| EXER-05 | **RAG**: when materials exist, generate from the most relevant chunks |
| EXER-06 | User selects skill, type, difficulty (band 4.0–9.0) before generation |
| EXER-07 | Regenerate if unsatisfied |

### 6.4 Submission & Evaluation (EVAL)
| ID | Requirement |
|----|-------------|
| EVAL-01 | Written submission (Writing, Reading short-answer) via editor |
| EVAL-02 | Spoken submission (Speaking) via browser mic |
| EVAL-03 | Audio → transcription (Whisper via 9router) for evaluation |
| EVAL-04 | Evaluate against IELTS criteria; deliver in Yoru's voice |
| EVAL-05 | Feedback: overall band + per-criterion scores + inline highlights + suggestions |
| EVAL-06 | Writing criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy |
| EVAL-07 | Speaking criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation (best-effort from transcript) |
| EVAL-08 | Reading/Listening: correct/incorrect + explanation |
| EVAL-09 | "Explain this feedback" follow-up (Yoru clarifies any point) |

### 6.5 Progress Tracking (PROG)
| ID | Requirement |
|----|-------------|
| PROG-01 | Band estimate per skill over time |
| PROG-02 | Trend charts per skill |
| PROG-03 | Exercises completed per skill |
| PROG-04 | Recurring error patterns (extracted from highlights) |
| PROG-05 | Overall band history |
| PROG-06 | Target band vs. current distance |

### 6.6 Gamification (GAME)
| ID | Requirement |
|----|-------------|
| GAME-01 | Daily streak (lazy-evaluated on activity) |
| GAME-02 | XP per completed exercise + bonus for high bands |
| GAME-03 | 6-level tiers: Beginner → Elementary → Intermediate → Upper-Intermediate → Advanced → Expert |
| GAME-04 | 8 badge types |
| GAME-05 | Weekly challenge (stored as a Challenge row, generated Monday) |
| GAME-06 | Local personal-best leaderboard |

### 6.7 Yoru Chat (YORU)
| ID | Requirement |
|----|-------------|
| YORU-01 | A chat panel where Master converses with Yoru about anything IELTS |
| YORU-02 | Yoru can pull context from past attempts/progress when asked |
| YORU-03 | Yoru's persona is fixed; she never breaks character |

### 6.8 Settings & Configuration (CONF)
| ID | Requirement |
|----|-------------|
| CONF-01 | Target band + test date |
| CONF-02 | IELTS type (Academic / General Training) |
| CONF-03 | AI endpoint config (default: `http://127.0.0.1:20128/v1`, model `fma/claude-opus-5`) |
| CONF-04 | Daily goal (minutes / exercises) |
| CONF-05 | Theme (dark / light) |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Exercise generation first token < 3 s; full < 8 s |
| NFR-02 | Performance | Evaluation first token < 3 s; full < 12 s |
| NFR-03 | Privacy | All data local; only LLM calls leave the machine (to 9router, which is local) |
| NFR-04 | Accessibility | WCAG 2.1 AA |
| NFR-05 | Reliability | Works offline with 9router (local models) |
| NFR-06 | Persona | Yoru's voice is consistent across generate/evaluate/chat |
| NFR-07 | Maintainability | Next.js 16 conventions; typed; documented |
| NFR-08 | Security | Upload allowlist + size cap + sanitized filenames + no path traversal |
| NFR-09 | Testability | AI calls mocked in tests; deterministic fixtures |

---

## 8. User Stories (with Acceptance Criteria)

| ID | Story | Acceptance Criteria |
|----|-------|----------------------|
| US-01 | Upload my study PDFs to practice with familiar material | AC: file ≤25MB accepted; appears in list; text searchable in DB; wrong type rejected with message |
| US-02 | Take a diagnostic to know my starting band | AC: ≥2 items/skill; per-skill + overall band shown; weakest skill + tip displayed |
| US-03 | Generate a Reading exercise from my material | AC: exercise cites source material; relevant to uploaded chunk |
| US-04 | Get feedback on my Writing Task 2 | AC: 4 criteria scored; ≥3 sentences highlighted with suggestions; <12s |
| US-05 | Record Speaking answer, get fluency/grammar feedback | AC: mic records; transcription shown; 4 criteria scored |
| US-06 | See band history | AC: line chart per skill after ≥3 attempts |
| US-07 | Daily streaks + XP for motivation | AC: streak increments on daily activity; XP animates on completion; badge pops on first unlock |
| US-08 | Set target band + test date | AC: saved; dashboard shows distance-to-target |
| US-09 | See recurring errors | AC: top-5 error patterns from last 20 attempts |
| US-10 | Weekly challenge | AC: Monday-generated set; progress tracked; bonus XP on completion |
| US-11 | Chat with Yoru about IELTS | AC: Yoru responds in-character; can reference my progress |
| US-12 | Practice without materials (AI-only) | AC: generator falls back to AI-generated passages |
| US-13 | Exercises improve as I add materials | AC: RAG retrieval ranks uploaded chunks above generic |

---

## 9. Edge Cases

| # | Edge Case | Handling |
|---|-----------|----------|
| EC-01 | Scanned PDF, no text layer | OCR (tesseract.js); warn if confidence low; allow paste fallback |
| EC-02 | Empty/very short Writing response | Block evaluation; prompt for ≥50 words |
| EC-03 | Mic denied | Clear enable instructions; disable Speaking record gracefully |
| EC-04 | 9router unavailable / timeout | Retry once; on fail show retry UI; keep exercise cached |
| EC-05 | Non-English material | Detect + warn; exercises still in English |
| EC-06 | PDF > 50 pages | Process first 50; inform user |
| EC-07 | No materials + user wants RAG exercise | Fall back to AI-generated passage |
| EC-08 | File type not allowed | Reject at upload with explicit message |
| EC-09 | Filename with path chars (`../../`) | Sanitize to basename; store under `data/uploads/<id>/` |
| EC-10 | Transcription fails | Allow manual text entry instead of blocking |

---

## 10. Assumptions
- Local 9router gateway available at `127.0.0.1:20128/v1` (confirmed running)
- `fma/claude-opus-5` (Yoru) reachable via that gateway
- Single-user, localhost
- Browser supports Web Audio API + MediaRecorder
- Target/date provided by user; app does not guarantee scores

---

## 11. Constraints
- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript strict**, Tailwind CSS v4, shadcn/ui
- **SQLite + Prisma** (local file)
- **AI**: 9router gateway (`http://127.0.0.1:20128/v1`), default `fma/claude-opus-5`
- **Yoru persona is non-negotiable and fixed**
- No external auth; local filesystem storage under `data/`
- **Node.js 20+**

---

## 12. Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM band accuracy imperfect | Medium | High | Detailed IELTS-descriptor prompts; user rating feedback |
| OCR poor on scans | Medium | Medium | tesseract.js + paste fallback |
| Speaking eval without prosody | High | Medium | Transparent; future audio-analysis |
| Motivation drop | Medium | High | Gamification + early XP win |
| 9router down | Low | High | Retry + cached exercises + status indicator |
| Embedding model mismatch | Low | Medium | Pin one embedding model in config |

---

## 13. Technical Requirements
- **Runtime:** Node.js 20+
- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **DB:** SQLite via Prisma
- **AI:** OpenAI SDK → 9router (`http://127.0.0.1:20128/v1`), model `fma/claude-opus-5`
- **Persona:** Yoru (夜) baked into every system prompt
- **Embeddings:** **local transformers.js** (`all-MiniLM-L6-v2`) — free, private, no API (9router providers tested: none support embeddings)
- **STT:** browser **Web Speech API** (free, no key); optional local whisper via transformers.js fallback (9router has no registered Whisper model)
- **TTS:** **Fish Audio free tier** (cloud, 8,000 credits/mo, anime voices + 15s voice cloning) with **Kokoro-82M local CPU** fallback — pluggable `ttsProvider` (see ADR-013)
- **Parsing:** pdf-parse, mammoth, tesseract.js
- **Audio:** Web Audio API (recording) + Web Speech API (free transcription, local whisper fallback)
- **Charts:** Recharts
- **State:** Zustand + Server Actions
- **Package manager:** pnpm
