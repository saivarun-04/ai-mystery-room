import React from 'react';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";
import { getCase, discoverClue, getHint } from "../utils/api.js";

const Investigation = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState(new Set());
  const [hints, setHints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCase = async () => {
    try {
      const result = await getCase(caseId);
      setCaseData(result);
      setLoading(false);
      if (result.discoveredClues) {
        setDiscoveredClues(new Set(result.discoveredClues));
      }
      if (result.hints) {
        setHints(result.hints);
      }
    } catch (err) {
      setError(err.message || "Failed to load case");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleDiscoverClue = async (clueId) => {
    if (isSubmitting || discoveredClues.has(clueId)) return;
    setIsSubmitting(true);
    try {
      const result = await discoverClue(caseId, clueId);
      setDiscoveredClues(prev => new Set(prev).add(clueId));
      setCaseData(prev => ({
        ...prev,
        stats: { ...prev.stats, cluesDiscovered: (prev.stats?.cluesDiscovered || 0) + 1 }
      }));
    } catch (err) {
      setError(err.message || "Failed to discover clue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await getHint(caseId);
      setHints(prev => [...prev, result]);
      setCaseData(prev => ({
        ...prev,
        stats: { ...prev.stats, hintsUsed: (prev.stats?.hintsUsed || 0) + 1 }
      }));
    } catch (err) {
      setError(err.message || "Failed to get hint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoading = () => (
    <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="font-display text-xl md:text-2xl mb-4 title-cinematic">Investigation Loading...</h2>
        <p className="opacity-70 text-sm md:text-base">Fetching case details</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
      <Card variant="evidence" className="p-5 md:p-6 max-w-md mx-4">
        <h2 className="font-display text-lg md:text-xl mb-4">Error Loading Case</h2>
        <p className="text-burgundy mb-4 text-sm md:text-base">{error}</p>
        <Button onClick={fetchCase} disabled={isSubmitting}>
          Retry
        </Button>
      </Card>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!caseData) return renderLoading();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-midnight-navy/95 text-paper pt-16 md:pt-20 pb-12 page-enter"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 title-cinematic px-2"
        >
          Investigation Room
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <Card variant="dossier" className="p-4 md:p-6">
            <h2 className="font-display text-lg md:text-xl mb-3">Case File</h2>
            <p className="text-base md:text-lg opacity-90 mb-2 leading-relaxed">{caseData.story}</p>
            <p className="text-xs md:text-sm opacity-70">{caseData.setup}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <h2 className="font-display text-xl md:text-2xl mb-4">Suspects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {caseData.suspects.map((suspect) => (
              <Card
                key={suspect.id}
                variant="suspect"
                className="p-3 md:p-4 cursor-pointer transition-transform hover:scale-105"
              >
                <h3 className="font-bold text-base md:text-lg mb-2">{suspect.name}</h3>
                <p className="text-xs opacity-80 mb-2">{suspect.motive}</p>
                <p className="text-xs opacity-70">{suspect.alibi}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <h2 className="font-display text-xl md:text-2xl mb-4">Evidence ({discoveredClues.size}/{caseData.clues?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {caseData.clues?.map((clue, clueIdx) => {
              const isDiscovered = discoveredClues.has(clue.id);
              return (
                <motion.div
                  key={clue.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border transition-all ${isDiscovered
                    ? "bg-burgundy/20 border-burgundy text-antique-gold"
                    : "border-burgundy/20 hover:bg-burgundy/10 cursor-pointer"
                  }`}
                  onClick={() => !isDiscovered && handleDiscoverClue(clue.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-base md:text-lg">{clue.title}</span>
                    {isDiscovered && (
                      <span className="text-xs bg-antique-gold text-burgundy px-2 py-1 rounded font-bold">
                        DISCOVERED
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-80">{clue.description}</p>
                  <p className="text-xs opacity-70 mt-2">
                    Location: {clue.location}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8 px-2"
        >
          <h2 className="font-display text-xl md:text-2xl mb-4">Hints ({caseData.hints?.length || 0})</h2>
          {caseData.hints?.map((hint, hintIdx) => (
            <motion.div
              key={hintIdx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3 p-3 bg-paper/10 border border-paper/20 rounded-lg"
            >
              <p className="text-sm">{hint.content}</p>
            </motion.div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGetHint}
            disabled={isSubmitting}
            className="mt-2"
          >
            Get Hint
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8 p-4 bg-charcoal/50 rounded-lg border border-burgundy/30"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-display text-base md:text-lg">Progress:</span>
              <span className="font-bold text-xl md:text-2xl text-antique-gold ml-2">
                {discoveredClues.size}/{caseData.clues?.length || 0} clues
              </span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs opacity-70">
                {hints.length} hint{hints.length !== 1 ? "s" : ""} used
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex justify-center px-2"
        >
          <Button
            size="lg"
            onClick={() => navigate(`/accuse/${caseId}`)}
            disabled={isSubmitting}
            className="px-8 md:px-12 py-3 md:py-4 shadow-glow-burgundy"
          >
            Accuse Suspect
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Investigation;
