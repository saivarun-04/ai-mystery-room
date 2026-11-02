import React from 'react';
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { useEffect, useState } from "react";

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { icon: "🔍", title: "AI-Generated Mysteries", desc: "Each case is crafted by Gemini with unique suspects, clues, and a hidden culprit." },
    { icon: "📋", title: "Detective Tools", desc: "Discover evidence, use hints, and build your case before accusing." },
    { icon: "⭐", title: "Progressive Scoring", desc: "Earn points for clues, lose for hints—master the investigation." },
  ];

  const difficultyData = [
    { level: "easy", suspects: 3, clues: 5, base: 100 },
    { level: "medium-easy", suspects: 4, clues: 7, base: 150 },
    { level: "medium-hard", suspects: 5, clues: 9, base: 200 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={mounted ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-midnight-navy/95 text-paper pb-12 pt-16 md:pt-20 page-enter"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 px-2"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-7xl mb-4 tracking-tight title-cinematic">
            AI Mystery Room
          </h1>
          <p className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 font-light opacity-90 leading-relaxed">
            A cinematic noir detective game where you investigate AI-generated mysteries, uncover clues, and accuse the culprit.
          </p>
          <Link to="/create">
            <Button size="lg" className="px-8 py-4 shadow-glow-gold">
              Start Investigation
            </Button>
          </Link>
        </motion.div>

        {/* Stamp decoration */}
        <div className="text-center mb-8">
          <span className="stamp text-6xl md:text-8xl select-none">CLASSIFIED</span>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-2"
        >
          {features.map((f, i) => (
            <motion.div
              key={`feature-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.1 * i, duration: 0.5, ease: "easeOut" }}
            >
              <Card variant="evidence" className="text-center p-5 md:p-6 h-full">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display text-lg md:text-xl mb-2">{f.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Difficulty Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-2"
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl mb-6 text-center title-cinematic">
            Choose Your Investigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {difficultyData.map((d) => (
              <Card key={d.level} variant="dossier" className="text-center p-5 md:p-6">
                <div className="font-display text-xl md:text-2xl mb-2 capitalize">{d.level.replace('-', '-')}</div>
                <div className="text-xs opacity-70 mb-3">
                  {d.suspects} suspects • {d.clues} clues
                </div>
                <div className="font-bold text-lg text-antique-gold text-shimmer">
                  {d.base} pts
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
