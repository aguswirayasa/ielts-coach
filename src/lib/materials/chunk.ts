const WORDS_PER_CHUNK = 500;
const OVERLAP_WORDS = 50;

export function chunkText(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks: string[] = [];
  for (let start = 0; start < words.length; start += WORDS_PER_CHUNK - OVERLAP_WORDS) {
    chunks.push(words.slice(start, start + WORDS_PER_CHUNK).join(" "));
    if (start + WORDS_PER_CHUNK >= words.length) break;
  }
  return chunks;
}

export const chunkConfig = { wordsPerChunk: WORDS_PER_CHUNK, overlapWords: OVERLAP_WORDS } as const;
