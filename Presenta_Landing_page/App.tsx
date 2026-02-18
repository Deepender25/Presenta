import React, { useState, useLayoutEffect, useEffect } from 'react';
import { CinematicLogo } from './components/CinematicLogo';
import { HeroContent } from './components/HeroContent';
import { PlatformTicker } from './components/PlatformTicker';
import { Workflow } from './components/Workflow';
import { Features } from './components/Features';
import { UseCases } from './components/UseCases';
import { TechSpecs } from './components/TechSpecs';
import { Footer } from './components/Footer';
import { ANIMATION_STYLES } from './constants';

import { Documentation } from './components/Documentation';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'docs'>('landing');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#docs') {
        setCurrentView('docs');
      } else {
        setCurrentView('landing');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Force scroll to top on mount to ensure animation plays from start
  useLayoutEffect(() => {
    if (currentView === 'landing') {
      // Disable default browser scroll restoration
      if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
      }

      // Force scroll to top immediately
      window.scrollTo(0, 0);

      // Safety check: ensure we're at top even after a small delay
      // This helps with some browsers that might try to restore scroll later
      const timeout = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [currentView]);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    if (currentView !== 'landing') {
      window.location.hash = '';
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (currentView === 'docs') {
    return <Documentation onBack={() => window.location.hash = ''} />;
  }

  return (
    <div className="relative w-full bg-cream font-sans overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth">
      {/* Inject specific keyframe styles for the cinematic sequence */}
      <style>{ANIMATION_STYLES}</style>

      {/* Floating Header Card */}
      <header
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.04)] px-4 py-2 md:px-6 md:py-3 flex justify-between items-center z-50 opacity-0 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        style={{ animation: 'fadeIn 1s ease forwards 6.2s' }}
      >
        <div className="text-xl md:text-2xl font-script text-ink leading-none mt-1 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Presenta
        </div>
        <button
          className="group p-2 space-y-[6px] cursor-pointer hover:bg-gray-50 rounded-full transition-colors -mr-2 z-50 relative"
          onClick={toggleMenu}
        >
          <div className={`w-6 md:w-7 h-[2px] bg-ink transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[8px]' : 'group-hover:translate-x-1'}`}></div>
          <div className={`w-6 md:w-7 h-[2px] bg-ink transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 md:w-7 h-[2px] bg-ink transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[8px]' : 'group-hover:-translate-x-1'}`}></div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-cream z-40 flex items-center justify-center transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-8 text-center">
          <button onClick={() => scrollToSection('workflow')} className="text-3xl font-serif-display text-ink hover:text-gray-600 transition-colors">Process</button>
          <button onClick={() => scrollToSection('features')} className="text-3xl font-serif-display text-ink hover:text-gray-600 transition-colors">Features</button>
          <button onClick={() => scrollToSection('use-cases')} className="text-3xl font-serif-display text-ink hover:text-gray-600 transition-colors">Use Cases</button>
          <button onClick={() => scrollToSection('tech-specs')} className="text-3xl font-serif-display text-ink hover:text-gray-600 transition-colors">Specs</button>
          <button onClick={() => { setIsMenuOpen(false); window.location.hash = '#docs'; }} className="text-3xl font-serif-display text-ink hover:text-gray-600 transition-colors">Docs</button>
        </div>
      </div>

      {/* 
        Main Animation Wrapper
        The container handles the "Camera Pan" by sliding the top section (Intro) out of view.
      */}
      <div
        className="relative w-full"
        style={{
          willChange: 'margin-top',
          animation: 'panCameraUp 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards 3.5s'
        }}
      >

        {/* 
           SECTION 1: INTRO 
           - h-[100dvh]: Force full viewport height.
        */}
        <div className="h-[100dvh] w-full flex items-center justify-center relative z-20 overflow-hidden">
          <CinematicLogo />
        </div>

        {/* SECTION 2: MAIN CONTENT (Starts immediately below Intro) */}
        <div
          className="relative z-10 w-full bg-cream flex flex-col"
          style={{
            opacity: 0,
            transform: 'translateY(40px)',
            animation: 'revealContent 1.2s ease-out forwards 4.5s'
          }}
        >
          {/* 
            FIRST SCREEN CONTAINER (The "Fold")
            - min-h-[100dvh]: Ensures full screen coverage.
            - flex flex-col: Stacks layout.
          */}
          <div className="min-h-[100dvh] w-full flex flex-col relative">

            {/* 
                Hero Wrapper
                - flex-1: Takes up all available space between top of screen and ticker.
                - pt-28: Clears the header.
                - justify-center: Vertically centers the content in the viewport.
             */}
            <div className="flex-1 w-full flex flex-col justify-center pt-40 pb-4 md:pt-24">
              <HeroContent />
            </div>

            {/* Ticker - Rigid at bottom of first screen */}
            <div className="flex-shrink-0 w-full">
              <PlatformTicker />
            </div>
          </div>

          {/* REST OF CONTENT - Normal flow */}
          <div className="w-full bg-cream">
            <Workflow />
            <Features />
            <UseCases />
            <TechSpecs />
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;