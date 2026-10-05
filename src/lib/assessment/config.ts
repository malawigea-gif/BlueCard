// Eligibility assessment (online MCQ test) — settings shared by the server and the browser.
// Change the numbers here to adjust the test.

export const DURATION_MIN = 50; // the paper closes automatically after this many minutes
export const MAX_ATTEMPTS = 5; // attempts allowed per member
export const QUESTIONS_PER_PAPER = 40;
export const PASS_PERCENT = 60; // pass mark shown to the member and the admin

/** Journey step (src/lib/journey.ts) during which the test can be started. */
export const ASSESSMENT_STAGE = 2;

export const SECTIONS = ["EN", "GK", "MA", "DE"] as const;
export type Section = (typeof SECTIONS)[number];

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";

export function passed(score: number | null | undefined, total = QUESTIONS_PER_PAPER) {
  return score != null && total > 0 && (score / total) * 100 >= PASS_PERCENT;
}
