import { z } from "zod";

/** Zod schemas for request bodies */
export const discoverClueBody = z.object({
  playerId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  ip: z.string().optional(),
});

export const accuseBody = z.object({
  suspectId: z.string().min(1, "suspectId is required"),
});

/** Valid mystery themes — TFI-inspired + default noir */
export const MYSTERY_THEMES = ["noir", "detective", "spy", "comedy", "historical"];

export const createCaseBody = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  theme: z.enum(MYSTERY_THEMES).default("noir"),
});

/**
 * Wrap a Zod schema as an Express middleware.
 * Validates req.body and attaches parsed data to req.validated.
 */
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const msg = Object.entries(errors)
        .map(([k, v]) => `${k}: ${v.join(", ")}`)
        .join("; ");
      const err = new Error(`Validation failed: ${msg}`);
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      return next(err);
    }
    req.validated = result.data;
    next();
  };

/** Validate that a route param is a valid MongoDB ObjectId */
export const requireObjectId = (paramName) => {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || !/^[0-9a-fA-F]{24}$/.test(val)) {
      const err = new Error(`Invalid ObjectId for ${paramName}`);
      err.status = 400;
      err.code = "INVALID_ID";
      return next(err);
    }
    next();
  };
};
