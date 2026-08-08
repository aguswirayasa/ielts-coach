-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "embedding" TEXT,
    CONSTRAINT "Chunk_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skill" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" REAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answerKey" JSONB,
    "materialId" TEXT,
    "sourceChunks" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "audioPath" TEXT,
    "transcript" TEXT,
    "bandEstimate" REAL,
    "feedback" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "Attempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "skill" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "DiagnosticResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readingBand" REAL NOT NULL,
    "writingBand" REAL NOT NULL,
    "listeningBand" REAL NOT NULL,
    "speakingBand" REAL NOT NULL,
    "overallBand" REAL NOT NULL,
    "weakestSkill" TEXT NOT NULL,
    "responses" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skill" TEXT NOT NULL,
    "bandEstimate" REAL NOT NULL,
    "exercisesDone" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "requirements" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "targetBand" REAL NOT NULL DEFAULT 7.0,
    "testDate" DATETIME,
    "ieltsType" TEXT NOT NULL DEFAULT 'ACADEMIC',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "aiBaseUrl" TEXT NOT NULL DEFAULT 'http://127.0.0.1:20128/v1',
    "aiModel" TEXT NOT NULL DEFAULT 'fma/claude-opus-5',
    "aiEmbedModel" TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    "ttsProvider" TEXT NOT NULL DEFAULT 'fish',
    "ttsVoice" TEXT NOT NULL DEFAULT '',
    "dailyGoalMin" INTEGER NOT NULL DEFAULT 30,
    "theme" TEXT NOT NULL DEFAULT 'dark'
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
