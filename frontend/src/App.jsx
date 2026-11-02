import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Investigation from "./pages/Investigation.jsx";
import Accusation from "./pages/Accusation.jsx";
import Results from "./pages/Results.jsx";
import { AnimatePresence } from "motion/react";
import { CinematicBackground, PageWrapper } from "./components/CinematicBackground.jsx";

const AppRoutes = () => {
  const location = useLocation();

  // Scroll to top on every navigation
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageWrapper>
            <Home />
          </PageWrapper>
        } />
        <Route path="/create" element={
          <PageWrapper>
            <Create />
          </PageWrapper>
        } />
        <Route path="/investigate/:caseId" element={
          <PageWrapper>
            <Investigation />
          </PageWrapper>
        } />
        <Route path="/accuse/:caseId" element={
          <PageWrapper>
            <Accusation />
          </PageWrapper>
        } />
        <Route path="/results/:caseId" element={
          <PageWrapper>
            <Results />
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Prevent browser from restoring scroll position on back/forward navigation
  if (typeof history !== 'undefined') {
    history.scrollRestoration = 'manual';
  }
  return (
    <BrowserRouter>
      <CinematicBackground />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
