import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCase, DIFFICULTY } from "../services/caseService.js";
import { serializePublic } from "../services/caseService.js";
import * as geminiModule from "../services/geminiService.js";

const validEasyCase = {
  difficulty: "easy",
  story: "A murder in the study.",
  setup: "Lord Harrington found dead.",
  suspects: [
    { id: "s1", name: "Lady Harrington", motive: "inheritance", alibi: "was in kitchen", seenWith: "none" },
    { id: "s2", name: "Butler", motive: "revenge", alibi: "was cleaning hall", seenWith: "none" },
    { id: "s3", name: "Guest", motive: "robbery", alibi: "was in bedroom", seenWith: "none" },
  ],
  clues: [
    { id: "c1", title: "Blood on sword", description: "red", suspectIds: ["s1"], location: "study" },
    { id: "c2", title: "Missing will", description: "red", suspectIds: ["s2"], location: "library" },
    { id: "c3", title: "Footprints", description: "red", suspectIds: ["s3"], location: "hall" },
    { id: "c4", title: "Poison bottle", description: "red", suspectIds: ["s1"], location: "kitchen" },
    { id: "c5", title: "Broken window", description: "red", suspectIds: ["s3"], location: "hall" },
  ],
  culprit: "s1",
  solution: {
    suspectId: "s1",
    reasoning: "Blood on sword found in study points to Lady Harrington",
    hintIds: ["c4"],
    evidenceIds: ["c1"],
  },
};

describe("Gemini integration", () => {
  let generateMysterySpy;

  beforeEach(() => {
    vi.clearAllMocks();
    generateMysterySpy = vi.spyOn(geminiModule, "generateMystery").mockResolvedValue(validEasyCase);
  });

  it("generates valid easy case with correct counts", async () => {
    const result = await generateCase("easy");
    expect(result.difficulty).toBe("easy");
    expect(result.suspects).toHaveLength(DIFFICULTY.easy.suspects);
    expect(result.clues).toHaveLength(DIFFICULTY.easy.clues);
    expect(result.culprit).toBe("s1");
  });

  it("passes theme to Gemini prompt", async () => {
    await generateCase("easy", "spy");
    expect(generateMysterySpy).toHaveBeenCalledWith("easy", "spy");
  });

  it("fails on malformed JSON output", async () => {
    generateMysterySpy.mockRejectedValue(new Error("Invalid JSON output"));
    await expect(generateCase("easy")).rejects.toThrow("Invalid JSON output");
  });

  it("fails when JSON parsing fails", async () => {
    generateMysterySpy.mockRejectedValue(new Error("Invalid JSON output"));
    await expect(generateCase("easy")).rejects.toThrow();
  });

  it("fails on invalid culprit reference", async () => {
    generateMysterySpy.mockRejectedValue(new Error("Culprit must be one of the suspects"));
    await expect(generateCase("easy")).rejects.toThrow("Culprit must be one of the suspects");
  });

  it("fails on clue referencing unknown suspect", async () => {
    generateMysterySpy.mockRejectedValue(new Error("Clue references unknown suspect"));
    await expect(generateCase("easy")).rejects.toThrow("Clue references unknown suspect");
  });

  it("retries on transient errors and succeeds", async () => {
    let calls = 0;
    generateMysterySpy.mockImplementation(async () => {
      calls++;
      if (calls <= 2) throw new Error("transient");
      return validEasyCase;
    });

    const result = await generateCase("easy");
    expect(result.difficulty).toBe("easy");
    expect(calls).toBe(3);
  });

  it("exhausts retries and throws", async () => {
    let calls = 0;
    generateMysterySpy.mockImplementation(async () => {
      calls++;
      throw new Error("always fails");
    });

    await expect(generateCase("easy")).rejects.toThrow("always fails");
    expect(calls).toBe(3);
  });

  it("handles Gemini 429 rate limit error", async () => {
    const err = new Error("rate limit");
    err.status = 429;
    generateMysterySpy.mockRejectedValue(err);
    await expect(generateCase("easy")).rejects.toThrow("rate limit");
  });

  it("handles Gemini 503 unavailable error", async () => {
    const err = new Error("service unavailable");
    err.status = 503;
    generateMysterySpy.mockRejectedValue(err);
    await expect(generateCase("easy")).rejects.toThrow("service unavailable");
  });

  it("correct counts per difficulty", async () => {
    for (const diff of ["easy", "medium", "hard"]) {
      const mockCase = {
        difficulty: diff,
        story: "Test",
        setup: "Test",
        suspects: Array.from({ length: DIFFICULTY[diff].suspects }, (_, i) => ({
          id: `s${i}`, name: `Name${i}`, motive: "m", alibi: "a", seenWith: "s",
        })),
        clues: Array.from({ length: DIFFICULTY[diff].clues }, (_, i) => ({
          id: `c${i}`, title: `T${i}`, description: "d", suspectIds: [], location: "l",
        })),
        culprit: "s0",
        solution: { suspectId: "s0", reasoning: "r", hintIds: [], evidenceIds: [] },
      };
      generateMysterySpy.mockResolvedValue(mockCase);
      const result = await generateCase(diff);
      expect(result.suspects).toHaveLength(DIFFICULTY[diff].suspects);
      expect(result.clues).toHaveLength(DIFFICULTY[diff].clues);
    }
  });

  it("solution is server-side only - not returned in public serializer", async () => {
    generateMysterySpy.mockResolvedValue(validEasyCase);
    const result = await generateCase("easy");

    const doc = { toObject: () => result };
    const publicData = serializePublic(doc);
    expect(publicData.culprit).toBeUndefined();
    expect(publicData.solution).toBeUndefined();
  });
});
