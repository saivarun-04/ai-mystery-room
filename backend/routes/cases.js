import { Router } from "express";
import { Case } from "../models/Case.js";
import { serializePublic, computeScore, DIFFICULTY, generateCase } from "../services/caseService.js";
import { validate, requireObjectId } from "../middleware/validators.js";
import { discoverClueBody, accuseBody, createCaseBody } from "../middleware/validators.js";

const router = Router();

// ─── POST /api/cases ───────────────────────────────────────────────────────
router.post(
  "/",
  validate(createCaseBody),
  async (req, res, next) => {
    try {
      const caseData = await generateCase(req.validated.difficulty, req.validated.theme);
      const caseDoc = new Case(caseData);
      await caseDoc.save();
      res.status(201).json(serializePublic(caseDoc));
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/cases/:id ────────────────────────────────────────────────────
router.get(
  "/:id",
  requireObjectId("id"),
  async (req, res, next) => {
    try {
      const caseDoc = await Case.findById(req.params.id).select("-culprit -solution");
      if (!caseDoc) {
        const err = new Error("Case not found");
        err.status = 404;
        err.code = "NOT_FOUND";
        return next(err);
      }
      res.json(serializePublic(caseDoc));
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/cases/:id/clues/:clueId/discover ────────────────────────────
router.post(
  "/:id/clues/:clueId/discover",
  requireObjectId("id"),
  requireObjectId("clueId"),
  validate(discoverClueBody),
  async (req, res, next) => {
    try {
      const { id, clueId } = req.params;
      const playerId = req.validated.playerId || "anonymous";

      // Check if already discovered
      const existing = await Case.findById(id).select("clues.stats");
      if (!existing) {
        const err = new Error("Case not found");
        err.status = 404;
        err.code = "NOT_FOUND";
        return next(err);
      }

      const clue = existing.clues.find(c => c.id === clueId);
      if (!clue) {
        const err = new Error("Clue not found");
        err.status = 404;
        err.code = "CLUE_NOT_FOUND";
        return next(err);
      }

      const alreadyDiscovered = clue.discoveredBy.includes(playerId);
      if (alreadyDiscovered) {
        return res.json({ scoreDelta: 0, discoveredAt: clue.discoveredBy.includes(playerId) ? clue.discoveredAt : null });
      }

      // Atomic: add playerId and increment counter
      await Case.findByIdAndUpdate(id, {
        $push: { "clues.$[elem].discoveredBy": playerId },
        $set: { "clues.$[elem].discoveredAt": new Date() },
        $inc: { "stats.cluesDiscovered": 1, version: 1 },
      }, {
        arrayFilters: [{ "elem.id": clueId }],
        new: true,
      });

      const diff = DIFFICULTY[existing.difficulty];
      const scoreDelta = 5;

      res.json({ scoreDelta, discoveredAt: new Date() });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/cases/:id/hints ─────────────────────────────────────────────
router.post(
  "/:id/hints",
  requireObjectId("id"),
  async (req, res, next) => {
    try {
      const caseDoc = await Case.findById(req.params.id).select("-culprit -solution stats clues hintsUsed");
      if (!caseDoc) {
        const err = new Error("Case not found");
        err.status = 404;
        err.code = "NOT_FOUND";
        return next(err);
      }
      if (caseDoc.completedAt) {
        const err = new Error("Cannot get hints after case completion");
        err.status = 400;
        err.code = "CASE_COMPLETED";
        return next(err);
      }

      const diff = DIFFICULTY[caseDoc.difficulty];
      if (caseDoc.stats.hintsUsed >= diff.hints) {
        const err = new Error("No more hints remaining for this difficulty");
        err.status = 400;
        err.code = "NO_HINTS_LEFT";
        return next(err);
      }

      const hintIndex = caseDoc.stats.hintsUsed;
      const cost = 10;

      await Case.findByIdAndUpdate(req.params.id, {
        $inc: { "stats.hintsUsed": 1, version: 1 },
      });

      res.json({ index: hintIndex, content: `[Hint ${hintIndex + 1} of ${diff.hints}]`, cost });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/cases/:id/accuse ────────────────────────────────────────────
router.post(
  "/:id/accuse",
  requireObjectId("id"),
  validate(accuseBody),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { suspectId } = req.validated;

      // Fetch full doc (including private fields) for comparison
      const caseDoc = await Case.findById(id);
      if (!caseDoc) {
        const err = new Error("Case not found");
        err.status = 404;
        err.code = "NOT_FOUND";
        return next(err);
      }
      if (caseDoc.completedAt) {
        const err = new Error("Case already completed");
        err.status = 400;
        err.code = "CASE_COMPLETED";
        return next(err);
      }

      const correct = suspectId === caseDoc.culprit;
      const diff = DIFFICULTY[caseDoc.difficulty];
      const score = computeScore({
        correct,
        cluesDiscovered: caseDoc.stats.cluesDiscovered,
        hintsUsed: caseDoc.stats.hintsUsed,
        base: diff.base,
      });

      // Atomic: mark completed with score
      await Case.findByIdAndUpdate(id, {
        completedAt: new Date(),
        finalScore: score,
        verdict: correct ? "CORRECT" : "INCORRECT",
        version: { $exists: true } ? caseDoc.version + 1 : 1,
      });

      res.json({
        verdict: correct ? "CORRECT" : "INCORRECT",
        score,
        culprit: correct ? caseDoc.culprit : null,
        solution: correct ? caseDoc.solution : null,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/cases/:id/result ─────────────────────────────────────────────
router.get(
  "/:id/result",
  requireObjectId("id"),
  async (req, res, next) => {
    try {
      const caseDoc = await Case.findById(req.params.id);
      if (!caseDoc) {
        const err = new Error("Case not found");
        err.status = 404;
        err.code = "NOT_FOUND";
        return next(err);
      }
      if (!caseDoc.completedAt) {
        const err = new Error("Case not yet completed — accuse first");
        err.status = 400;
        err.code = "CASE_INCOMPLETE";
        return next(err);
      }

      res.json({
        verdict: caseDoc.verdict,
        score: caseDoc.finalScore,
        elapsedSeconds: caseDoc.completedAt
          ? Math.floor((caseDoc.completedAt - caseDoc.createdAt) / 1000)
          : null,
        culprit: caseDoc.culprit,
        solution: caseDoc.solution,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
