import { Case } from "../models/Case.js";

/**
 * Difficulty config — enforced in one place.
 */
export const DIFFICULTY = {
  easy:   { suspects: 3, clues: 5,  hints: 2,  base: 100 },
  medium: { suspects: 4, clues: 7,  hints: 3,  base: 150 },
  hard:   { suspects: 5, clues: 9,  hints: 3,  base: 200 },
};

/**
 * Generate a new case by calling the AI service.
 * S3 will wire up Gemini here; S2 stubs the interface.
 */
import { generateMystery, withRetry, validateConsistency } from "./geminiService.js";

/**
 * Generate a new case by calling the AI service.
 */
export async function generateCase(difficulty, theme = "noir") {
  return withRetry(() => generateMystery(difficulty, theme), 3);
}

/**
 * Serialize a Case doc to its public shape (no culprit/solution).
 */
export function serializePublic(caseDoc) {
  const { culprit, solution, ...rest } = caseDoc.toObject();
  return rest;
}

/**
 * Compute score for an accusation attempt.
 * @returns {number} minimum 0
 */
export function computeScore({ correct, cluesDiscovered, hintsUsed, base }) {
  const raw = (correct ? base : 0) + 5 * cluesDiscovered - 10 * hintsUsed;
  return Math.max(0, raw);
}
