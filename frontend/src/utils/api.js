import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

/**
 * Create a new mystery case
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {string} theme - mystery theme (default: 'noir')
 * @returns {Promise<{id: string, difficulty: string, story: string, setup: string, suspects: Array, clues: Array}>}
 */
export const createCase = async (difficulty, theme = "noir") => {
  const res = await api.post("/cases", { difficulty, theme });
  return res.data;
};

/**
 * Get case by ID (public fields only)
 */
export const getCase = async (caseId) => {
  const res = await api.get(`/cases/${caseId}`);
  return res.data;
};

/**
 * Discover a clue (idempotent)
 */
export const discoverClue = async (caseId, clueId) => {
  const res = await api.post(`/cases/${caseId}/clues/${clueId}/discover`);
  return res.data;
};

/**
 * Get a hint
 */
export const getHint = async (caseId) => {
  const res = await api.post(`/cases/${caseId}/hints`);
  return res.data;
};

/**
 * Make an accusation
 */
export const accuse = async (caseId, suspectId) => {
  const res = await api.post(`/cases/${caseId}/accuse`, { suspectId });
  return res.data;
};

/**
 * Get case result (only after completion)
 */
export const getCaseResult = async (caseId) => {
  const res = await api.get(`/cases/${caseId}/result`);
  return res.data;
};

export default api;
