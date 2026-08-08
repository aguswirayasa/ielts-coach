# IELTS Personal Coach — Architecture

**Version:** 2.0 (Claude Opus 5 regeneration)  
**Date:** 2026-08-07  
**Status:** Draft — Awaiting Approval

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Browser (localhost:3000)                    │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐  │
│  │ Next.js 16    │  │ Zustand       │  │ Web Audio API       │  │
│  │ App Router    │  │ (session UI)  │  │ (Speaking record)  │  │
│  └──────┬───────┘  └───────────────┘  └──────────┬──────────┘  │
└─────────┼───────────────────────────────────────┼─────────────┘
          │ Server Actions / Route Handlers        │ audio blob
          ▼                                        ▼
┌────────────────────────────────────────────────────────────────┐
│                   Next.js 16 Server (Node.js 20+)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Server       │  │ File Parse   │  │ AI Service (lib/ai)    │  │
│  │ Actions      │  │ pdf/docx/    │  │  → 9router gateway    │  │
│  │              │  │ ocr/txt      │  │  (Yoru persona)      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│         │                 │                     │                │
│  ┌──────▼─────────────────▼─────────────────────▼─────────────┐  │
│  │                    Prisma ORM                              │  │
│  └──────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              ▼
   ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
   │ SQLite data/      │   │ data/uploads/        │   │ 9router gateway      │
   │ ielts.db          │   │ (sanitized files)    │   │ 127.0.0.1:20128/v1   │
   │ + vector cols     │   │                      │   │ (local models:      │
   └──────────────────┘   └─────────────────────┘   │  opus=Yoru, embed,    │
                                                       │  whisper)            │
                                                       └─────────────────────┘
```

---

## 2. System Components

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| UI Layer | Next.js 16 App Router + React 19 | Pages, components, streaming UI |
| Server Actions | Next.js 16 Server Actions | Mutations (upload, save attempt, settings) |
| Route Handlers | `app/api/*/route.ts` | SSE streaming for generate/evaluate/chat; audio transcribe |
| **AI Service** | **OpenAI SDK → 9router gateway** | **LLM (generate/evaluate/chat) via Yoru persona; embeddings local; STT browser/local** |
| **Yoru Persona** | `lib/ai/yoru.ts` + prompt modules | Fixed system prompt; coaching voice for every interaction |
| File Parser | pdf-parse, mammoth, tesseract.js | Extract text from uploads |
| Embeddings | **transformers.js local** (`all-MiniLM-L6-v2`) | `Chunk.embedding` (Float32Array) — free, no API (9router has no embedding-capable provider) |
| RAG Retriever | `lib/ai/retrieve.ts` | Cosine similarity over chunks for exercise generation |
| Audio | Web Audio API + MediaRecorder (browser) | Capture Speaking |
| STT | **Web Speech API** (free) + transformers.js whisper fallback | Transcribe audio → text |
| TTS | **Fish Audio free tier** (anime voices/clone) + **Kokoro-82M CPU** fallback | Listening audio + Yoru spoken feedback |
| ORM | Prisma | Type-safe DB access |
| DB | SQLite | Persistence + vector columns |
| Client state | Zustand | Active session UI state |
| Charts | Recharts | Progress visualization |

---

## 3. Module Responsibilities

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header (Yoru status)
│   │   ├── page.tsx               # Home dashboard (gamification + next action)
│   │   ├── practice/
│   │   │   ├── page.tsx           # Skill + type selector
│   │   │   └── [skill]/page.tsx   # Exercise player
│   │   ├── diagnostic/
│   │   │   ├── page.tsx           # Start
│   │   │   └── results/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── materials/page.tsx
│   │   ├── chat/page.tsx          # Yoru chat panel
│   │   └── settings/page.tsx
│   └── api/
│       ├── generate/route.ts      # SSE exercise generation (RAG-aware)
│       ├── evaluate/route.ts      # SSE evaluation
│       ├── transcribe/route.ts    # audio → text
│       └── chat/route.ts          # SSE Yoru chat
│
├── components/
│   ├── ui/                        # shadcn/ui
│   ├── exercise/                  # Reading/Writing/Listening/Speaking players
│   ├── feedback/                  # FeedbackPanel, CriteriaScores, HighlightedText
│   ├── gamification/              # XPBar, StreakWidget, BadgeDisplay
│   ├── charts/                    # BandHistoryChart, SkillRadarChart
│   ├── yoru/                      # YoruChat, YoruAvatar, YoruStatusPill
│   └── layout/                    # Sidebar, Header
│
├── lib/
│   ├── ai/
│   │   ├── client.ts              # OpenAI client → 9router (baseURL from env)
│   │   ├── yoru.ts                # Yoru system prompt + persona helpers
│   │   ├── embed.ts               # embedding helper (via 9router)
│   │   ├── retrieve.ts            # cosine sim RAG over Chunk.embedding
│   │   ├── generate.ts            # exercise generation (with RAG context)
│   │   ├── evaluate.ts            # evaluation (Yoru criteria prompts)
│   │   ├── diagnostic.ts          # diagnostic scoring
│   │   ├── chat.ts                # Yoru free chat (context-aware)
│   │   └── prompts/               # reading/writing/listening/speaking/evaluate/chat
│   ├── parser/                    # pdf.ts, docx.ts, ocr.ts, text.ts, index.ts
│   ├── audio/                     # recorder helpers
│   ├── tts/                       # tts.ts (provider: fish|kokoro), lib callers
│   ├── gamification/              # xp.ts, levels.ts, badges.ts, streak.ts
│   └── utils/                     # band.ts, format.ts, files.ts (sanitize)
│
├── actions/                       # Server Actions
│   ├── materials.ts
│   ├── exercises.ts
│   ├── progress.ts
│   └── settings.ts
│
├── store/                         # Zustand
│   ├── session.ts
│   └── ui.ts
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## 4. Database Design (Prisma / SQLite)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }

model Material {
  id          String   @id @default(cuid())
  title       String
  skill       SkillTag
  fileType    String   // pdf|docx|txt|image
  storedName  String   // sanitized, e.g. <id>.pdf
  rawText     String
  chunkCount  Int      @default(0)
  createdAt   DateTime @default(now())
  archived    Boolean  @default(false)
  chunks      Chunk[]
  exercises   Exercise[]
}

model Chunk {
  id         String  @id @default(cuid())
  materialId String
  idx        Int
  text       String
  embedding  String? // JSON-encoded Float32Array (cosine RAG)
  material   Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
}

model Exercise {
  id         String       @id @default(cuid())
  skill      SkillTag
  type       ExerciseType
  difficulty Float
  prompt     String
  content    String        // passage / transcript / question body
  answerKey  Json?        // objective answer key
  materialId String?
  material   Material?    @relation(fields: [materialId], references: [id])
  sourceChunks Json?      // chunk ids used (RAG traceability)
  createdAt  DateTime     @default(now())
  attempts   Attempt[]
}

model Attempt {
  id           String   @id @default(cuid())
  exerciseId   String
  exercise     Exercise @relation(fields: [exerciseId], references: [id])
  response     String
  audioPath    String?
  transcript   String?
  bandEstimate Float?
  feedback     Json     // structured Yoru feedback
  scores       Json
  completedAt  DateTime @default(now())
  sessionId    String
  session      Session  @relation(fields: [sessionId], references: [id])
}

model Session {
  id          String   @id @default(cuid())
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  skill       SkillTag?
  xpEarned    Int      @default(0)
  attempts    Attempt[]
}

model DiagnosticResult {
  id            String   @id @default(cuid())
  takenAt       DateTime @default(now())
  readingBand   Float
  writingBand   Float
  listeningBand Float
  speakingBand  Float
  overallBand   Float
  weakestSkill SkillTag
  responses     Json
}

model Progress {
  id            String   @id @default(cuid())
  recordedAt    DateTime @default(now())
  skill         SkillTag
  bandEstimate  Float
  exercisesDone Int
}

model Challenge {
  id          String   @id @default(cuid())
  weekStart   DateTime
  requirements Json    // [{skill,type,count}]
  xpReward     Int
  completed    Boolean @default(false)
}

model UserProfile {
  id             String    @id @default("singleton")
  targetBand     Float     @default(7.0)
  testDate       DateTime?
  ieltsType      IeltsType @default(ACADEMIC)
  totalXp        Int       @default(0)
  level          Int       @default(1)
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  lastActiveDate DateTime?
  aiBaseUrl      String    @default("http://127.0.0.1:20128/v1")
  aiModel        String    @default("fma/claude-opus-5")
  aiEmbedModel   String    @default("all-MiniLM-L6-v2") // local transformers.js
  ttsProvider    String    @default("fish") // fish (free cloud) | kokoro (local CPU)
  ttsVoice       String    @default("") // fish voice id or kokoro voice name
  dailyGoalMin   Int       @default(30)
  theme          String    @default("dark")
  badges         Badge[]
}

model Badge {
  id       String   @id @default(cuid())
  userId   String
  user     UserProfile @relation(fields: [userId], references: [id])
  type     BadgeType
  earnedAt DateTime @default(now())
}

enum SkillTag    { READING WRITING LISTENING SPEAKING GENERAL }
enum ExerciseType{ TF_NG MCQ MATCHING GAP_FILL SHORT_ANSWER WRITING_T1 WRITING_T2 SPEAKING_P1 SPEAKING_P2 SPEAKING_P3 }
enum IeltsType   { ACADEMIC GENERAL }
enum BadgeType   { FIRST_EXERCISE STREAK_7 STREAK_30 BAND_IMPROVED WRITING_MASTER SPEAKING_BRAVE FULL_DIAGNOSTIC WEEKLY_CHALLENGE }
```

**Vector strategy:** SQLite stores embeddings as JSON-encoded `Float32Array` in `Chunk.embedding`. Retrieval computes cosine similarity in Node (≤ a few thousand chunks — trivially fast locally). Embeddings are generated locally with **transformers.js** (`all-MiniLM-L6-v2`) — free, private, no API key. No external vector DB needed. If material volume grows large, migrate to `sqlite-vec` extension later (documented in DECISIONS).

---

## 5. API Architecture

### Server Actions (mutations)
| Action | File | Purpose |
|--------|------|---------|
| `uploadMaterial` | `actions/materials.ts` | Validate → parse → chunk → embed → store |
| `deleteMaterial` | `actions/materials.ts` | Cascade delete |
| `saveAttempt` | `actions/exercises.ts` | Persist attempt + award XP/badges |
| `updateSettings` | `actions/settings.ts` | Update UserProfile |
| `recordProgress` | `actions/progress.ts` | Snapshot band estimate |

### Route Handlers (streaming SSE)
| Route | Purpose |
|-------|---------|
| `POST /api/generate` | Generate exercise (RAG context injected) |
| `POST /api/evaluate` | Evaluate response (Yoru criteria feedback) |
| `POST /api/transcribe` | Audio blob → text (Whisper) |
| `POST /api/chat` | Yoru free chat (context-aware) |

### Feedback shape (streamed JSON)
```typescript
interface Feedback {
  overallBand: number
  criteria: Record<string, { score: number; comment: string }>
  highlights: { text: string; issue: string; suggestion: string }[]
  summary: string
  improvementTips: string[]
}
```

---

## 6. State Management
- **Server:** Prisma + Server Actions (persistent data)
- **Client:** Zustand `session.ts` (current exercise, response, audio, feedback, phase)

---

## 7. Authentication & Authorization
None. Single-user local app (see DECISIONS ADR-005). If exposed publicly later, add auth first.

---

## 8. Background Jobs (no external scheduler)

Next.js has no built-in cron. Strategy:
- **Streak:** lazy-evaluated. On any activity, compare `lastActiveDate` to today/yesterday; update streak inline. No timer needed.
- **Weekly Challenge:** generated lazily on Monday fetch if no `Challenge` row for the current week.
- **Progress snapshot:** written at session end (Server Action), not a timer.

This avoids a separate process while keeping behavior correct.

---

## 9. Caching
| Layer | What | TTL |
|-------|------|-----|
| `unstable_cache` | Material list | 1 h |
| `unstable_cache` | Progress history | 5 min |
| Zustand | Active session | session lifetime |
| None | AI generate/evaluate/chat | always fresh (streamed) |

---

## 10. Error Handling
| Layer | Strategy |
|-------|----------|
| Server Actions | `try/catch` → `{ error }`; never throw to client |
| Route Handlers | Structured `{ code, message }`; SSE error event on failure |
| AI Service | Retry once on timeout; surface friendly message; keep exercise cached |
| File parse | Partial result + warning on failure |
| Audio | Graceful degradation → manual text entry |
| UI | Error Boundary per section + toasts |

---

## 11. Security
- Upload allowlist: `pdf, docx, txt, png, jpg, jpeg`; reject others
- Size cap: 25 MB
- Filename sanitized to basename; stored as `<cuid>.<ext>` under `data/uploads/`
- No user-supplied path used in filesystem operations
- Uploads handled server-side only
- Never log user responses or file contents
- 9router is local; no secrets leave the machine

---

## 12. Logging
- Dev: console
- Prod: `pino` → `logs/app.log` (error/warn/info/debug)
- Log model, tokens, latency — never prompt/response content

---

## 13. Deployment
```
pnpm build && pnpm start  →  http://localhost:3000
data/ielts.db + data/uploads/  (gitignored, auto-created)
AI: 9router at http://127.0.0.1:20128/v1 (local)
Optional Coolify Docker (P2): Node 20 image, volume for /data
```

---

## 14. Folder Structure
See section 3 (above).
