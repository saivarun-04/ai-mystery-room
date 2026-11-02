# AI Mystery Room — Specification

## 1. Overview
Players generate a mystery with Gemini, investigate suspects, discover clues, use hints, accuse, get verdict + score. Case is server-generated and persisted; solution never leaves backend until successful accusation.

## 2. Architecture
- Backend: Express.js with Mongoose, Node.js ES modules
- Frontend: React+Vite, React Router, Tailwind CSS, motion, lucide-react
- Database: MongoDB (local or Atlas)
- AI: @google/genai (structured JSON generation, fully mocked in tests)

## 3. User Flow
Home → Create (select difficulty, generate case) → Investigation (view story, suspects, clues, hints) → Accusation → Results (verdict + score, culprit reveal)

## 4. API Contracts

### Cases
- POST /api/cases — create new case (difficulty: easy/medium/hard, theme: noir/detective/spy/comedy/historical). Returns {id, difficulty, story, setup, clues[], suspects[], ...}. Public data only.
- GET /api/cases/:id — retrieve case (public). Returns case without culprit/solution.
- GET /api/cases/:id/result — returns only after completion (score, verdict, elapsed seconds). Requires completion.

### Clues
- POST /api/cases/:id/clues/:clueId/discover — idempotent, atomic. Body: {playerId?, timestamp?, ip?}. Returns {scoreDelta, discoveredAt}.
- IDempotent: subsequent discovers return same result, not new score.

### Hints
- POST /api/cases/:id/hints — acquire a hint (cost, limit per case). Returns {index, content, cost}.

### Accusation
- POST /api/cases/:id/accuse — accept suspectId + optional retry flag. Returns verdict + score (if correct) or prompt to continue. Atomic; later same accusation has no effect.

### Generic
All routes validate ObjectIds, rate-limit (100/min), helmet, CORS (CLIENT_URL), body size (10kb), graceful shutdown, and centralized error handler.

## 5. Database Schema

### Case
```js
{
  _id: ObjectId,
  difficulty: "easy"|"medium"|"hard",
  seed: String, // for reproduction in tests
  story: String,
  setup: String,
  suspects: [{
    id: String,
    name: String,
    motive: String,
    alibi: String,
    seenWith: String
  }],
  clues: [{
    id: String,
    title: String,
    description: String,
    suspectIds: [String],
    discoveredBy: [ObjectId], // track who saw it
    location: String
  }],
  // public/private separation
  culprit: { type: String, select: false }, // private
  solution: { type: Object, select: false }, // private, includes reasoning
  // metadata
  createdAt: Date,
  completedAt: Date, // null until accusation success
  stats: {
    cluesDiscovered: Number,
    hintsUsed: Number,
    attempts: Number
  },
  // auditing
  version: Number, // for concurrent updates
}
```

### PlayerProgress (for scoring)
Track per-case progress for score calculation (atomic updates).

## 6. Gemini + Zod Validation

#### Zod Gemini Output Schema
```js
const ClueSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: String,
  suspectIds: [z.string()],
  location: z.string(),
});

const SuspectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  motive: z.string(),
  alibi: z.string(),
  seenWith: z.string()
});

const CaseSchema = z.object({
  difficulty: z.enum(["easy","medium","hard"]),
  story: z.string(),
  setup: z.string(),
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  culprit: z.string(),
  solution: z.object({
    suspectId: z.string(),
    reasoning: z.string(),
    hintIds: [z.string()],
    evidenceIds: [z.string()]
  })
});
```

#### Bounded Retry Logic
- Max 2 retries on malformed output (duplicate IDs, missing fields, inconsistent alibi).
- Clean error on failure; never fall back to a fake case.

## 7. Difficulty Table & Scoring

| Difficulty | Suspects | Clues | Hints | Base pts |
|------------|----------|-------|-------|----------|
| easy       | 3        | 5     | 2     | 100      |
| medium     | 4        | 7     | 3     | 150      |
| hard       | 5        | 9     | 3     | 200      |

Score = (correct ? base : 0) + 5×clues discovered − 10×hints used, min 0.
- Max score (all clues, 0 hints): Easy 125, Medium 185, Hard 245
- With all hints used (all clues): Easy 105, Medium 155, Hard 215
- Themes: noir, detective, spy, comedy, historical (TFI-inspired)
Scoring only on backend, atomic conditional updates.

## 8. Atomic/Idempotent Updates
All updates use `$inc`, `$push`, `$set` with `version` checks to prevent race conditions. Duplicate discovery, hint, or accusation has no effect after first.

## 9. Solution Confidentiality
- `culprit` and `solution` fields have `select: false`.
- Only exposed in result after successful accusation.
- Random case IDs, no hints in IDs/classes/metadata.

## 10. Security
- helmet, CORS from CLIENT_URL, express-rate-limit (100/min per IP)
- body size limit 10kb
- graceful shutdown with cleanup
- Zod validation for all bodies
- Central error handler returns shape: {error: "message", code?: "VALIDATION_ERROR"}
- env validation at startup (PORT, MONGODB_URI, GEMINI_API_KEY, CLIENT_URL)

## 11. Environment

Backend .env (example in repo):
- PORT
- MONGODB_URI
- GEMINI_API_KEY
- CLIENT_URL

Frontend .env (Vite):
- VITE_API_URL

## 12. Testing (S7)
Mocked Gemini generation; cover counts per difficulty, invalid output, duplicate clue/hint/accuse, concurrency, min score 0, solution never in public responses, result locked before completion, key frontend flows.

## 13. Deployment
- Docker support (npm start)
- MongoDB Atlas optional
- CI/CD pipeline (GitHub Actions) triggers on PR, runs tests, and deploys backend (render / railway) and frontend (Vercel / Netlify)

## 14. Design Tokens (S4)
- Cinematic noir palette: midnight navy #0B1020, charcoal #161B2B, burgundy #6B1F2A, antique gold #C9A24B, paper #E9E1CF
- Serif display (Playfair Display / Cormorant) + Inter body
- Evidence cards with paper texture, case-file folder panels, dossier suspect cards, red-string board
- Stamps: "CLASSIFIED", "EVIDENCE"
- Restrained glow, high contrast, no gradients
- Responsive 390/768/1280
- Motion for page transitions, staggered cards, clue reveal, hint expand, result reveal; honor prefers-reduced-motion

## 15. Acceptance Criteria (S1)
- S1: scaffold backend+frontend, write SPEC.md, verify with /checkpoint
- S2: DB models, validation, scoring logic, endpoints (public/private separation)
- S3: Gemini integration, Zod schema, retry, case persistence
- S4: design tokens, shared UI components
- S5: pages: Home, Create, Investigation, Accusation, Results with animations
- S6: integration, persistence checks, offline/error states
- S7: mocked tests, coverage, lint, build
- S8: README, SVG banner, deploy docs
- S9: git init, .gitignore, remote setup

All features follow non-negotiables and security rules.