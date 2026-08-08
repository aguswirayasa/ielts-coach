// Defensive JSON extraction from a model response: strips markdown code
// fences, tries a direct parse, then falls back to the first {...} object.
export function parseJsonContent(content: string | null | undefined): unknown {
  if (!content) throw new Error("Model returned an empty response.");
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const candidate = fenced ? fenced[1]!.trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const match = candidate.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model response.");
    return JSON.parse(match[0]);
  }
}
