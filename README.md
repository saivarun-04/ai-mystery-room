# AI Mystery Room

A cinematic noir detective game where you investigate AI-generated mysteries, uncover clues, and accuse the culprit. Built with React+Vite frontend and Express+MongoDB backend.

## Features

- **AI-Generated Mysteries**: Each case is crafted by Google Gemini with unique suspects, clues, and a hidden culprit
- **Detective Tools**: Discover evidence, use hints, and build your case before accusing
- **Progressive Scoring**: Earn points for clues, lose for hints—master the investigation
- **Cinematic UI**: Noir-themed design with smooth animations

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS for styling
- motion.dev for animations
- React Router for navigation
- Vitest + Testing Library for tests

### Backend
- Express.js API server
- MongoDB with Mongoose ODM
- Zod for validation
- Google Gemini AI integration
- Helmet, CORS, rate limiting for security

## Project Structure

```
ai-mystery-room/
├── backend/
│   ├── config/           # Environment validation
│   ├── middleware/       # Error handling, validators
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic (Gemini, scoring)
│   └── tests/            # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Global styles & design tokens
│   │   └── utils/        # API client
│   └── tests/            # Frontend tests
└── SPEC.md               # Full specification
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/mystery-room
# GEMINI_API_KEY=your-api-key
# CLIENT_URL=http://localhost:5173

npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:3000/api

npm run dev
```

## API Endpoints

### Cases
- `POST /api/cases` — Create new mystery case
- `GET /api/cases/:id` — Get case (public data only)
- `GET /api/cases/:id/result` — Get results after accusation

### Clues
- `POST /api/cases/:id/clues/:clueId/discover` — Discover a clue (idempotent)

### Hints
- `POST /api/cases/:id/hints` — Request a hint (limited per difficulty)

### Accusation
- `POST /api/cases/:id/accuse` — Submit accusation with suspect ID

## Scoring System

Score = (correct ? base : 0) + 5×clues discovered − 10×hints used (min 0)

| Difficulty | Suspects | Clues | Hints | Base Points | Max Score* | All Hints Used |
|------------|----------|-------|-------|-------------|------------|----------------|
| Easy       | 3        | 5     | 2     | 100         | 125        | 105            |
| Medium     | 4        | 7     | 3     | 150         | 185        | 155            |
| Hard       | 5        | 9     | 3     | 200         | 245        | 215            |

\*Max Score = all clues discovered, no hints used. All Hints Used = all clues discovered, every hint consumed.

## Security

- `culprit` and `solution` fields are private (`select: false`)
- Solutions never leave backend until successful accusation
- Rate limiting (100 requests/minute)
- Helmet for security headers
- CORS restricted to specified client URL
- Body size limited to 10kb

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Build & Deploy

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```

### Deployment Options

- **Backend**: Render, Railway, or any Node.js hosting
- **Frontend**: Vercel, Netlify, or static hosting
- **Database**: MongoDB Atlas recommended for production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup guides.

## License

MIT
