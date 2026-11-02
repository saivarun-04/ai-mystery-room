import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().url(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  CLIENT_URL: z.string().url(),
});

export const env = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Missing/invalid env vars: ${Object.entries(keys)
        .filter(([, v]) => v && v.length > 0)
        .map(([k]) => k)
        .join(", ")}`
    );
  }
  return parsed.data;
};
