import React from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const CinematicBackground = () => {
  const location = useLocation();

  // Read theme from localStorage (set by Create page)
  const theme = typeof window !== "undefined" ? localStorage.getItem("mystery-theme") || "noir" : "noir";

  // Apply theme to root element for CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="cinematic-bg" aria-hidden="true">
      <div className="cinematic-bg__grain" />
      <div className="cinematic-bg__spotlight" />
      <div className="cinematic-bg__beam" />
      <div className="cinematic-bg__pillar" />
      <div className="cinematic-bg__vignette" />
    </div>
  );
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const key = location.key;

  return (
    <div className="page-content min-h-screen" key={key}>
      {children}
    </div>
  );
};

export { CinematicBackground, PageWrapper };
