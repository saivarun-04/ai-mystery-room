import React from 'react';
import { forwardRef } from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-burgundy text-paper hover:bg-burgundy/80 active:bg-burgundy/90",
        secondary: "bg-charcoal text-paper border border-burgundy/50 hover:bg-burgundy/10 active:bg-burgundy/20",
        ghost: "bg-transparent text-paper hover:bg-burgundy/20 active:bg-burgundy/30",
        danger: "bg-transparent text-burgundy hover:text-burgundy/80 active:text-burgundy/60",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-6 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = forwardRef(({ className, variant, size, children, ...props }, ref) => (
  <motion.button
    ref={ref}
    className={buttonVariants({ variant, size, className })}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    {...props}
  >
    {children}
  </motion.button>
));
