<div align="center">

<img src="assets/mystery-room-banner.svg" alt="AI Mystery Room — Enter the Unknown" width="100%" />

<p>
  <b>A cinematic, AI-powered detective experience.</b><br/>
  Investigate mysterious cases, uncover evidence, connect the clues, and expose the culprit.
</p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-Fast%20Builds-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
</p>

<p>
  <a href="#-gameplay">Gameplay</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-run-locally">Run Locally</a> ·
  <a href="#-api-overview">API</a>
</p>

</div>

---

## 🕵️ Gameplay

> Every case has a story. Every clue matters. The truth is yours to uncover.

1. **Start a case** — generate a mystery with suspects, evidence, and a concealed solution.
2. **Investigate** — explore the case and discover clues.
3. **Use your instincts** — request limited hints when you need a nudge.
4. **Make the accusation** — choose the suspect you believe is responsible.
5. **Reveal the result** — see how your investigation performed and earn your score.

## ✨ Features

- **AI-generated cases** — mysteries powered by Google Gemini, with suspects, clues, and a hidden culprit.
- **Interactive investigation** — discover evidence and build your theory before accusing.
- **Difficulty-based gameplay** — Easy, Medium, and Hard cases with varying investigation depth.
- **Scoring system** — earn points for discovering clues; hints come with a score trade-off.
- **Cinematic noir interface** — atmospheric visuals and smooth motion.
- **Protected solutions** — the culprit and solution remain server-side until the accusation result.
- **Validated API** — request validation, error handling, security headers, CORS, and rate limiting.

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Motion, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini |
| Validation & Security | Zod, Helmet, CORS, rate limiting |
| Testing | Vitest, Testing Library, backend test suite |

## 🗂️ Project Structure

```text
ai-mystery-room/
├── backend/
│   ├── config/          # Environment configuration
│   ├── middleware/      # Validation and error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Gemini integration and game logic
│   └── tests/           # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI
│   │   ├── pages/       # Application pages
│   │   ├── styles/      # Styling and design tokens
│   │   └── utils/       # API client and helpers
│   └── tests/           # Frontend tests
├── SPEC.md
└── DEPLOYMENT.md
```

## 🚀 Run Locally

### Requirements

- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- Google Gemini API key

### 1. Configure the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set your values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mystery-room
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm start
```

### 2. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and set:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

Open **http://localhost:5173**.

> Never commit real API keys or credentials. Keep them in local environment files and configure production secrets in your hosting provider.

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/cases` | Create a mystery case |
| `GET` | `/api/cases/:id` | Retrieve public case details |
| `GET` | `/api/cases/:id/result` | Retrieve results after accusation |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Discover a clue |
| `POST` | `/api/cases/:id/hints` | Request a hint |
| `POST` | `/api/cases/:id/accuse` | Submit an accusation |

## 🧮 Scoring

```text
Score = (correct accusation ? base points : 0)
        + 5 × clues discovered
        − 10 × hints used
        (minimum score: 0)
```

| Difficulty | Suspects | Clues | Hints | Base | Maximum |
|---|---:|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 | 125 |
| Medium | 4 | 7 | 3 | 150 | 185 |
| Hard | 5 | 9 | 3 | 200 | 245 |

Maximum score assumes every clue is discovered and no hints are used.

## 🛡️ Security Notes

- Sensitive solution fields are excluded from normal database queries.
- The solution is not exposed before the accusation result.
- API requests are validated and rate-limited.
- Helmet provides security headers.
- CORS is configured for the allowed client origin.
- Request body size is limited.

## 🧪 Tests

Run frontend tests:

```bash
cd frontend
npm test
```

Run backend tests:

```bash
cd backend
npm test
```

## 🌐 Deployment

- **Frontend:** Vercel or Netlify
- **Backend:** Render, Railway, or another Node.js host
- **Database:** MongoDB Atlas

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment configuration and environment variables.

## 📄 License

MIT

---

<div align="center">
  <sub>Built for curious minds. Powered by AI. Driven by deduction.</sub>
</div>
