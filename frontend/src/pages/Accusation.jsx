import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { useState, useEffect } from "react";
import { getCase, accuse } from "../utils/api.js";

const Accusation = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCase = async () => {
    try {
      const result = await getCase(caseId);
      setCaseData(result);
    } catch (err) {
      setError(err.message || "Failed to load case");
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleSubmit = async () => {
    if (!selectedSuspect || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await accuse(caseId, selectedSuspect);
      // Redirect to results page with the verdict data
      navigate(`/results/${caseId}`, { state: result });
    } catch (err) {
      if (err.code === "CASE_COMPLETED") {
        navigate(`/results/${caseId}`);
      } else {
        setError(err.message || "Failed to submit accusation");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !caseData) {
    return (
      <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
        <Card variant="evidence" className="p-5 md:p-6 max-w-md mx-4">
          <h2 className="font-display text-lg md:text-xl mb-4">Error Loading Case</h2>
          <p className="text-burgundy mb-4 text-sm md:text-base">{error}</p>
          <Link to="/">
            <Button onClick={fetchCase} disabled={isSubmitting}>
              Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-midnight-navy/95 text-paper flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="font-display text-xl md:text-2xl mb-4 title-cinematic">Loading...</h2>
          <p className="opacity-70 text-sm md:text-base">Preparing accusation...</p>
          <Link to="/">
            <Button className="mt-4">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          Accuse the Culprit
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center text-base md:text-lg lg:text-xl mb-8 opacity-90 max-w-2xl mx-auto px-2 leading-relaxed"
        >
          Choose the suspect you believe is guilty based on the evidence gathered.
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
          className="mb-8 px-2"
        >
          <h2 className="font-display text-xl md:text-2xl mb-4">Suspects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {caseData.suspects.map((suspect) => {
              const isSelected = selectedSuspect === suspect.id;
              return (
                <motion.div
                  key={suspect.id}
                  whileTap={isSelected ? {} : { scale: 0.98 }}
                  onClick={() => setSelectedSuspect(suspect.id)}
                  className={`cursor-pointer p-4 md:p-6 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? "bg-burgundy/30 border-burgundy text-antique-gold shadow-glow-burgundy"
                      : "border-burgundy/20 hover:bg-burgundy/10"
                  }`}
                  role="button"
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedSuspect(suspect.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0 ${
                      isSelected ? "bg-burgundy text-paper" : "bg-charcoal border border-burgundy/30"
                    }`}>
                      {isSelected ? "✓" : suspect.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base md:text-xl truncate">{suspect.name}</h3>
                      <p className="text-xs md:text-sm opacity-70 truncate">{suspect.motive}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-2"
        >
          <Button
            variant="secondary"
            onClick={() => navigate(`/investigate/${caseId}`)}
            disabled={isSubmitting}
          >
            Back to Investigation
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedSuspect || isSubmitting}
            className="min-w-[180px] sm:min-w-[200px] shadow-glow-burgundy"
          >
            {isSubmitting ? "Submitting..." : "Submit Accusation"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Accusation;
