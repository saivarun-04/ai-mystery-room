import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { env } from "./config/env.js";
import casesRouter from "./routes/cases.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const config = env();

// ─── Security middleware ────────────────────────────────────────────────────
app.use(helmet());

// Allow both dev frontend ports (5173 and 5174) plus localhost
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);
      // Allow both configured client URL and localhost
      if (config.CLIENT_URL && origin === config.CLIENT_URL) return callback(null, true);
      // Always allow localhost variations
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10kb" }));

// ─── Rate limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});
app.use("/api", limiter);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/cases", casesRouter);

// ─── 404 + error handler ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── MongoDB + startup ──────────────────────────────────────────────────────
async function start() {
  await mongoose.connect(config.MONGODB_URI);
  console.log(`[ready] MongoDB connected`);

  const server = app.listen(config.PORT, () => {
    console.log(`[ready] Backend listening on port ${config.PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[shutting down] Graceful shutdown initiated...");
    server.close(async () => {
      await mongoose.connection.close();
      console.log("[shut down] Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((err) => {
  console.error("[FATAL] Failed to start server:", err.message);
  process.exit(1);
});

export default app;
