import React, { useEffect, useRef, useState } from 'react';

const FeatureCard: React.FC<{ title: string; description: string; index: number }> = ({ title, description, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`flex flex-col gap-3 p-6 md:p-8 border border-ink/5 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white/80 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="w-10 h-1 bg-ink/10 mb-2"></div>
      <h3 className="font-serif-display text-xl md:text-2xl text-ink">{title}</h3>
      <p className="font-sans text-gray-600 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
};

export const Features: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24 flex flex-col gap-10 md:gap-12 relative z-30">
      <div className="text-center space-y-3">
        <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-gray-500">
          What It Does
        </h2>
        <p className="font-serif-display text-3xl md:text-4xl lg:text-5xl text-ink">
          Key Capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
        <FeatureCard
          index={0}
          title="Cinematic Device Mockups"
          description="Instantly wrap screenshots or videos in realistic device shells. Toggle between minimalist Browser, iPhone 14 Pro, MacBook Pro, and iPad Air frames with adaptive glass aesthetics."
        />
        <FeatureCard
          index={1}
          title='"Human-Touch" Animation'
          description="The animation engine doesn't just scroll; it reads. It simulates a real user reading your content—speeding up over images, slowing down for text, and pausing naturally."
        />
        <FeatureCard
          index={2}
          title="Deep Customization"
          description="Gain complete control over the visual presentation. Adjust studio lighting, shadow softness, corner radii, and custom backgrounds to create the perfect aesthetic."
        />
        <FeatureCard
          index={3}
          title="4K Export Pipeline"
          description="Built for production. Export crisp, mathematically perfect WebM or MP4 video files at 60FPS. Zero pixelation, zero latency, privacy-first local processing."
        />
      </div>
    </section>
  );
};