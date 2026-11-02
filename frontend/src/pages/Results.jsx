import React from 'react';
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";
import { getCase, getCaseResult } from "../utils/api.js";

const Results = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResult = async () => {
    try {
      const res = await getCaseResult(caseId);
      setResult(res);
      setLoading(false);
    } catch (err) {
      if (err.code === "CASE_INCOMPLETE") {
        // Try to use result from navigation state (from accusation)
        if (location.state?.verdict) {
          setResult(location.state);
          setLoading(false);
          return;
        }
        setError("Case has not been completed yet");
      } else {
        setError(err.message || "Failed to load result");
      }
      setLoading(false);
    }
  };

  const fetchCase = async () => {
    try {
      const res = await getCase(caseId);
      setCaseData(res);
    } catch (err) {
      setError(err.message || "Failed to load case");
    }
  };

  useEffect(() => {
    Promise.all([fetchResult(), fetchCase()]);
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="font-display text-xl md:text-2xl mb-4 title-cinematic">Calculating Results...</h2>
          <p className="opacity-70 text-sm md:text-base">Processing your investigation</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
        <Card variant="evidence" className="p-5 md:p-6 max-w-md mx-4">
          <h2 className="font-display text-lg md:text-xl mb-4">Error</h2>
          <p className="text-burgundy mb-4 text-sm md:text-base">{error}</p>
          <Button onClick={fetchResult} disabled={loading}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!result || !caseData) {
    return null;
  }

  const isCorrect = result.verdict === "CORRECT";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-midnight-navy/95 text-paper pt-16 md:pt-20 pb-12 page-enter"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Verdict Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-10 md:mb-12 px-2"
        >
          <div className={`inline-block px-6 md:px-8 py-3 md:py-4 rounded-lg border-2 mb-6 ${
            isCorrect
              ? "bg-antique-gold/20 border-antique-gold text-antique-gold shadow-glow-gold"
              : "bg-burgundy/20 border-burgundy text-burgundy shadow-glow-burgundy"
          }`}>
            <h1 className="font-display text-2xl md:text-4xl lg:text-6xl tracking-widest uppercase">
              {isCorrect ? "Correct!" : "Incorrect"}
            </h1>
          </div>
          <p className="text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
            {isCorrect
              ? "You have successfully solved the mystery!"
              : "The culprit escaped justice this time."}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <Card variant="dossier" className="p-6 md:p-8 text-center">
            <h2 className="font-display text-lg md:text-2xl mb-4 md:mb-6">Final Score</h2>
            <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-antique-gold text-shimmer mb-2 md:mb-4">
              {result.score}
            </div>
            <p className="text-xs md:text-sm opacity-70">points earned</p>
          </Card>
        </motion.div>

        {/* Solution Reveal */}
        {(isCorrect || location.state?.solution) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8 px-2"
          >
            <Card variant="evidence" className="p-5 md:p-6 border-2 border-antique-gold shadow-glow-gold">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="text-3xl md:text-4xl flex-shrink-0">🔍</div>
                <div className="min-w-0">
                  <h3 className="font-display text-base md:text-xl mb-2">The Truth Revealed</h3>
                  <p className="opacity-90 mb-3 text-sm md:text-base">
                    The culprit was <strong className="text-antique-gold">{caseData.suspects.find(s => s.id === result.culprit)?.name}</strong>.
                  </p>
                  {result.solution?.reasoning && (
                    <p className="text-xs md:text-sm opacity-80 leading-relaxed">{result.solution.reasoning}</p>
                  )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

        {/* Case Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <Card variant="dossier" className="p-5 md:p-6">
            <h3 className="font-display text-base md:text-xl mb-4">Case Details</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div>
                <span className="opacity-70">Difficulty:</span>
                <span className="ml-2 capitalize">{caseData.difficulty}</span>
              </div>
              <div>
                <span className="opacity-70">Clues Discovered:</span>
                <span className="ml-2">{caseData.stats?.cluesDiscovered || 0}/{caseData.clues?.length || 0}</span>
              </div>
              <div>
                <span className="opacity-70">Hints Used:</span>
                <span className="ml-2">{caseData.stats?.hintsUsed || 0}</span>
              </div>
              <div>
                <span className="opacity-70">Verdict:</span>
                <span className={`ml-2 font-bold ${isCorrect ? "text-antique-gold" : "text-burgundy"}`}>
                  {result.verdict}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 px-2"
        >
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Main Menu
          </Button>
          <Button
            size="lg"
            onClick={() => navigate("/create")}
          >
            Play Again
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Results;
