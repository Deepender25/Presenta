import React, { useEffect, useRef, useState } from 'react';

const Step: React.FC<{ number: string; title: string; desc: string; delay: number }> = ({ number, title, desc, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center gap-4 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-ink flex items-center justify-center font-serif-display text-xl md:text-2xl text-ink bg-cream z-10 relative">
          {number}
        </div>
        <div className="absolute inset-0 bg-ink/5 rounded-full blur-md transform scale-110"></div>
      </div>
      <h3 className="font-serif-display text-xl md:text-2xl text-ink mt-2">{title}</h3>
      <p className="font-sans text-sm md:text-base text-gray-600 max-w-[260px] leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export const Workflow: React.FC = () => {
  return (
    <section id="workflow" className="w-full py-16 md:py-24 relative">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-gray-500">
            Process
          </h2>
          <p className="font-serif-display text-3xl md:text-4xl lg:text-5xl text-ink">
            From Raw to Polished
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-10 justify-items-center">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent"></div>

          <Step
            number="01"
            title="Upload Content"
            desc="Drag and drop your raw screen recordings or screenshots directly into the browser."
            delay={0}
          />
          <Step
            number="02"
            title="Customize Frame"
            desc="Select your device, adjust the shadows, and fine-tune the corner radius."
            delay={200}
          />
          <Step
            number="03"
            title="Auto-Animate"
            desc="Enable 'Human Scroll' mode and export a buttery smooth 60fps video."
            delay={400}
          />
        </div>
      </div>
    </section>
  );
};