// The steps an approved member goes through on the way to Germany.
// Titles and descriptions are in src/lib/i18n/dict.ts under "journey.<key>.*".
export const STAGES = ["approved", "assessment", "documents", "recognition", "jobs", "offer", "visa", "arrival"] as const;
export type StageKey = (typeof STAGES)[number];

/** Stage numbers start at 1. */
export function stageKey(n: number): StageKey {
  return STAGES[Math.min(Math.max(n, 1), STAGES.length) - 1];
}

export const DOC_KINDS = ["CV", "DEGREE", "TRANSCRIPT", "LANGUAGE", "EXPERIENCE", "OTHER"] as const;
export type DocKind = (typeof DOC_KINDS)[number];
