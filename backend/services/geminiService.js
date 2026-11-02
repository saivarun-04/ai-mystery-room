import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";
import { DIFFICULTY } from "./caseService.js";

dotenv.config();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

// Zod schemas matching SPEC.md
const clueSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  suspectIds: z.array(z.string()),
  location: z.string(),
});

const suspectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  motive: z.string(),
  alibi: z.string(),
  seenWith: z.string(),
});

const solutionSchema = z.object({
  suspectId: z.string(),
  reasoning: z.string(),
  hintIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
});

const caseSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  story: z.string(),
  setup: z.string(),
  suspects: z.array(suspectSchema),
  clues: z.array(clueSchema),
  culprit: z.string(),
  solution: solutionSchema,
});

/**
 * Generate a mystery using Gemini.
 * @param {string} difficulty - 'easy'|'medium'|'hard'
 * @param {string} theme - mystery theme/style
 * @returns {Promise<z.infer<typeof caseSchema>>}
 */
export async function generateMystery(difficulty, theme = "noir") {
  const themeDescriptions = {
    noir: "a classic cinematic noir murder mystery set in a shadowy city",
    detective: "a deductive investigation with unique suspects and clever clues",
    spy: "a espionage thriller with secret identities and double agents",
    comedy: "a lighthearted comedic mystery with quirky situations and humorous dialogue",
    historical: "an ancient mystery involving puzzles, artifacts, and historical settings",
  };

  const prompt = `Generate a ${difficulty} mystery for a detective game.

Theme: ${theme} — ${themeDescriptions[theme] || themeDescriptions.noir}

You must return valid JSON matching this schema:
${JSON.stringify(caseSchema, null, 2)}

Requirements:
- Exactly ${DIFFICULTY[difficulty].suspects} suspects with unique ids
- Exactly ${DIFFICULTY[difficulty].clues} clues, each referencing suspect ids
- One culprit (one of the suspect ids)
- Coherent story where clues and alibis support the intended culprit
- Include solution with reasoning, hint ids, evidence ids
- All fields required, no extra properties
- Themes should be TFI-inspired (detective investigations, spy mysteries, comedic crime, historical puzzles) but original — do not copy specific films

Do not include any explanation outside the JSON.`;

  let result;
  try {
    result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  } catch (apiErr) {
    // Extract status code from the API error if available
    const status = apiErr.status || apiErr.response?.status;
    if (status === 429) {
      throw Object.assign(new Error("Gemini API rate limit exceeded. Please try again later."), {
        status: 429,
        code: "GEMINI_RATE_LIMITED",
      });
    } else if (status === 503) {
      throw Object.assign(new Error("Gemini service temporarily unavailable. Please try again in a few minutes."), {
        status: 503,
        code: "GEMINI_UNAVAILABLE",
      });
    }
    throw apiErr;
  }

  // Handle both successful and error responses
  let text;
  if (result && result.response && typeof result.response.text === "function") {
    text = result.response.text();
  } else if (result && result.response && result.response.message) {
    // Handle error response
    text = result.response.message;
  } else {
    // Fallback
    text = "";
  }

  // Strip markdown code fences (```json ... ```) if present
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```\w*\n([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) cleaned = fenceMatch[1];

  // Parse and validate JSON
  try {
    const parsed = JSON.parse(cleaned);
    const validated = caseSchema.parse(parsed);
    return validated;
  } catch (parseErr) {
    throw new Error(`Invalid JSON output: ${parseErr.message}`);
  }
}

/**
 * Bounded retry with exponential backoff.
 * @param {Function} fn - async function to retry
 * @param {number} maxRetries - max attempts (including first)
 */
export async function withRetry(fn, maxRetries = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        // Wait exponentially: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/**
 * Validate internal consistency (beyond Zod).
 */
export function validateConsistency(caseData) {
  const { suspects, clues, culprit, solution } = caseData;
  const suspectIds = new Set(suspects.map((s) => s.id));
  if (!suspectIds.has(culprit)) {
    throw new Error("Culprit must be one of the suspects");
  }
  if (solution.suspectId !== culprit) {
    throw new Error("Solution suspectId must match culprit");
  }
  // Verify clues reference valid suspects
  clues.forEach((c) => {
    if (c.suspectIds.some((id) => !suspectIds.has(id))) {
      throw new Error(`Clue references unknown suspect: ${c.id}`);
    }
  });
  // Verify hint/evidence IDs exist in clues
  const clueIds = new Set(clues.map((c) => c.id));
  if (solution.hintIds.some((id) => !clueIds.has(id))) {
    throw new Error("Solution references non-existent hint clue");
  }
  if (solution.evidenceIds.some((id) => !clueIds.has(id))) {
    throw new Error("Solution references non-existent evidence clue");
  }
}
