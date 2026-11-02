import React from 'react';
import { forwardRef } from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "relative rounded-lg border border-burgundy/30 bg-charcoal/50 p-4 shadow-sm backdrop-blur-sm",
  {
    variants: {
      variant: {
        evidence: "bg-paper/10 border-paper/20 shadow-[0_2px_8px_rgba(233,225,207,0.15)]",
        suspect: "bg-charcoal border-burgundy/20 shadow-[0_2px_8px_rgba(107,31,42,0.1)]",
        dossier: "bg-midnight-navy border-burgundy/40 shadow-[0_4px_12px_rgba(11,16,32,0.2)]",
      },
    },
    defaultVariants: {
      variant: "evidence",
    },
  }
);

export const Card = forwardRef(({ className, variant, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cardVariants({ variant, className })}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));
