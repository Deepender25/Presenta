import React, { useState, useEffect } from 'react';

// High-quality dark abstract backgrounds
const SLIDES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1697899001862-59699946ea29?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGRhcmslMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHwwfDB8fHww",
    alt: "Dark Liquid Flow"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1762417108285-3dcef5ae3dc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGRhcmslMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHwwfDB8fHww",
    alt: "Dark Mesh Gradient"
  },
  {
    id: 3,
    url: "https://plus.unsplash.com/premium_photo-1685916643736-84d09458b38c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTQ2fHxkYXJrJTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDB8MHwwfHx8MA%3D%3D",
    alt: "Deep Ocean Abstract"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop",
    alt: "Dark Topographic Waves"
  }
];

export const HeroContent: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="w-full h-full flex flex-col justify-center">

      {/* 
        1. MAIN TITLE
        Massive scaling for maximum impact.
      */}
      <div className="w-full flex flex-col items-center mb-6 md:mb-10 px-4">
        <h2 className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-3 font-sans font-semibold text-center opacity-0 animate-[fadeIn_1s_ease_forwards_5s]">
          Professional Device Frames & Animations
        </h2>

        <h1 className="w-full text-center font-serif-display text-ink uppercase tracking-tight leading-[0.9] transition-all duration-300"
          style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
          <span className="block">Present Your</span>
          <span className="block">Work In</span>
          <span className="block">Perfect Frames</span>
        </h1>
      </div>

      {/* 
        2. WIDE LAYOUT CONTAINER 
        - max-w-[92%]: Reduced from 96% to prevent shadow clipping on the right edge.
      */}
      <div className="w-full max-w-[92%] 2xl:max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

        {/* 
           LEFT COLUMN: Text Content 
           - col-span-5: Occupies the left 40% of the grid.
        */}
        <div className="order-2 md:order-1 md:col-span-5 flex flex-col gap-8 md:pl-2">
          <div className="w-full h-px bg-black/10 origin-left transform scale-x-100 hidden md:block"></div>

          <div className="flex flex-col gap-6">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-800 leading-relaxed font-sans text-justify md:text-left text-balance font-medium">
              Stop sharing raw screen recordings. Start telling a story.
              Presenta solves the problem of "ugly engineering demos" by instantly wrapping your content in high-fidelity device shells.
            </p>

            <div className="flex flex-wrap gap-3">
              {['Browser & Mobile', 'Smart Scrolling', '4K Export', 'Zero Latency'].map((tag) => (
                <span key={tag} className="px-4 py-2 border border-gray-200 rounded-full text-xs uppercase tracking-wider text-gray-500 font-sans bg-white/40 hover:bg-white/80 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 
           RIGHT COLUMN: Animation & Button
           - col-span-6: Takes up 50% of width.
           - col-start-7: Starts at column 7.
           - justify-end: Aligns content to right.
        */}
        <div
          className="order-1 md:order-2 md:col-span-6 md:col-start-7 w-full flex justify-center md:justify-end"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 
              Image Container
              - max-w-2xl: Smaller size.
              - rounded-2xl: Fully rounded corners to prevent the "cut off" look on the right edge.
           */}
          <div className="relative group cursor-pointer w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl"
            style={{ animation: 'float 6s ease-in-out infinite' }}>

            <div className="relative w-full h-full bg-[#0a0a0a] transition-all duration-500 hover:shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-gray-800">

              {/* Browser Controls */}
              <div className="absolute top-0 left-0 right-0 h-[8%] min-h-[24px] bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center px-[3%] gap-2 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-sm opacity-90"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-sm opacity-90"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-sm opacity-90"></div>
                {/* Fake URL Bar */}
                <div className="ml-4 flex-1 max-w-[400px] h-1/2 bg-white/5 rounded-md"></div>
              </div>

              {/* Slideshow */}
              <div className="relative w-full h-full bg-[#0a0a0a]">
                {SLIDES.map((slide, index) => (
                  <img
                    key={slide.id}
                    src={slide.url}
                    alt={slide.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                  />
                ))}
                <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
              </div>

              {/* 3. MAIN LAUNCH BUTTON - Centered in Image */}
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <button
                  onClick={() => window.location.href = '/tool'}
                  className="
                      pointer-events-auto
                      relative overflow-hidden
                      bg-white text-ink 
                      px-8 py-4 md:px-10 md:py-5
                      rounded-full 
                      shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                      flex items-center gap-4
                      transition-all duration-300 ease-out
                      hover:scale-105 hover:bg-white hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)]
                      group-hover:text-ink
                   ">
                  <span className="font-sans text-sm md:text-base font-bold tracking-widest uppercase">Launch Editor</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentSlide ? 'bg-white w-8 shadow-glow' : 'bg-white/30 w-2 hover:bg-white/50'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};