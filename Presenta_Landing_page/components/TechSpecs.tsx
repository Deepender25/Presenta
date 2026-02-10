import React, { useEffect, useRef, useState } from 'react';

const CodeLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-white/10 py-2.5 font-mono text-xs md:text-sm group hover:bg-white/5 transition-colors px-3 -mx-3 rounded">
    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
    <span className="text-cream text-right">{value}</span>
  </div>
);

export const TechSpecs: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tech-specs" className="w-full bg-[#0a0a0a] text-cream py-16 md:py-24 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

      <div
        ref={sectionRef}
        className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
      >
        {/* Left Text */}
        <div className={`space-y-8 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="space-y-4">
            <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-gray-500">
              Technical Bragging Rights
            </h2>
            <h3 className="font-serif-display text-3xl md:text-4xl lg:text-6xl text-white leading-tight">
              Zero Dependency.<br />Real-Time Compositing.
            </h3>
            <p className="font-sans text-gray-400 text-base md:text-lg leading-relaxed max-w-xl">
              Presenta is engineered for speed and privacy. It runs entirely in your browser using a zero-dependency Vanilla JS engine, ensuring your data never leaves your device.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-gray-300">Vanilla JS</div>
            <div className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-gray-300">60 FPS</div>
            <div className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-gray-300">Local Processing</div>
          </div>
        </div>

        {/* Right Code Block */}
        <div className={`bg-[#111] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Decor Dots */}
          <div className="flex gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
          </div>

          <div className="flex flex-col gap-1">
            <CodeLine label="Engine" value="Vanilla JS (Zero-Dep)" />
            <CodeLine label="Rendering" value="Hardware Accel Canvas" />
            <CodeLine label="Preview" value="60FPS Real-Time" />
            <CodeLine label="Smart UI" value="Auto-Edge Detection" />
            <CodeLine label="Privacy" value="100% Client-Side" />
            <CodeLine label="Output" value="4K WebM / MP4" />
          </div>
        </div>
      </div>
    </section>
  );
};