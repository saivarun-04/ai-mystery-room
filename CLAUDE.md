# AI Mystery Room — Working Rules

## Session protocol (IMPORTANT)
1. At session start: read PROGRESS.md only (not the whole repo). Continue from "Next action".
2. Read only the SPEC.md section relevant to the current task (grep headings first).
3. Work on ONE stage per session. Finish it, run /checkpoint, then stop.
4. Never re-ask questions already answered in SPEC.md or PROGRESS.md.

## Token economy
- Don't re-read files you just wrote. Use grep/ranges instead of full-file reads.
- Edit with targeted replacements; don't rewrite whole files.
- Batch related file creations and `npm install` calls.
- Run tests/builds quietly: `npm test --silent 2>&1 | tail -40`.
- No long explanations. Progress updates: max 2 lines.
- Screenshots only at the end of the UI stage, at 3 widths (390/768/1280), not per change.
- Don't investigate unrelated repos or install extra tools.

## Stack
React+Vite, React Router, Tailwind, Axios, `motion`, lucide-react / Express, Mongoose (Atlas), @google/genai, Zod, helmet, cors, express-rate-limit / Vitest, RTL, supertest (Gemini always mocked in tests). JS + ES modules.

## Non-negotiables
- Culprit, solution, answer key stay server-side until a successful accusation. Public/private data separated at schema + serializer level.
- Scoring only on backend. Idempotent, atomic conditional updates for clue/hint/accuse.
- Never put GEMINI_API_KEY in VITE_*. Never commit secrets. Never claim a push/deploy/test passed unless it did.

## UI
Use the `frontend-design` skill for any UI work. Follow the Design Tokens in SPEC.md. Respect prefers-reduced-motion.

## Commands
/resume — start of session. /checkpoint — end of stage.