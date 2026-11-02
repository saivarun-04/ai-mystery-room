import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";
import { motion } from "motion/react";
import { createCase } from "../utils/api.js";

const DIFFICULTY_CONFIG = {
  easy: { suspects: 3, clues: 5, hints: 2, base: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, base: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, base: 200 },
};

const Create = () => {
  const [premise, setPremise] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [selectedTheme, setTheme] = useState("noir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validatePremise = () => {
    if (!premise.trim()) return "Premise cannot be empty";
    if (premise.length > 200) return "Premise too long (max 200 chars)";
    return null;
  };

  const handleSubmit = async () => {
    const err = validatePremise();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Save theme for atmospheric background (safe for SSR/testing)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("mystery-theme", selectedTheme);
      }
      const result = await createCase(difficulty, selectedTheme);
      if (!result.id) throw new Error("Invalid response: missing case ID");
      navigate(`/investigate/${result.id}`);
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Failed to create mystery";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-midnight-navy text-paper pt-16 md:pt-20"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-display text-4xl md:text-5xl mb-6 text-center"
        >
          Create Mystery
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto"
        >
          Draft your detective story premise and choose difficulty. The AI will craft suspects, clues, and a hidden culprit.
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-burgundy/20 border border-burgundy text-paper rounded-lg"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <Card variant="dossier" className="p-6">
            <label htmlFor="premise" className="block text-sm font-medium mb-2">
              Mystery Premise (will appear in story)
            </label>
            <textarea
              id="premise"
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="A murder in the study..."
              rows={3}
              className="w-full bg-charcoal border border-burgundy/30 text-paper rounded-md p-3 focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold transition-colors resize-none"
              maxLength={200}
              disabled={isSubmitting}
            />
            <div className="text-right text-xs opacity-70 mt-1">
              {premise.length}/200 characters
            </div>
          </Card>

          <Card variant="evidence" className="p-6">
            <label className="block text-sm font-medium mb-4">
              Investigation Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setDifficulty(key)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center p-4 rounded-lg border transition-all duration-200 ease-in-out ${
                    difficulty === key
                      ? "bg-burgundy/20 border-burgundy text-antique-gold"
                      : "border-burgundy/20 hover:bg-burgundy/10"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-display text-xl capitalize mb-2">{key}</span>
                  <span className="text-xs opacity-80">
                    {cfg.suspects} suspects • {cfg.clues} clues
                  </span>
                  <span className="font-bold text-lg text-antique-gold mt-2">
                    {cfg.base} pts
                  </span>
                </motion.button>
              ))}
            </div>
          </Card>

          <Card variant="evidence" className="p-6">
            <label className="block text-sm font-medium mb-4">
              Mystery Theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {["noir", "detective", "spy", "comedy", "historical"].map((theme) => (
                <motion.button
                  key={theme}
                  type="button"
                  onClick={() => setTheme(theme)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border transition-all duration-200 ease-in-out capitalize ${
                    theme === selectedTheme
                      ? "bg-burgundy/20 border-burgundy text-antique-gold"
                      : "border-burgundy/20 hover:bg-burgundy/10"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm">{theme}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-xs opacity-60 mt-3">
              TFI-inspired themes: noir classics, detective deduction, spy intrigue, comedic crime, historical puzzles
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <Button variant="secondary" onClick={() => navigate("/")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!premise.trim() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Generating..." : "Create Mystery"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Create;
