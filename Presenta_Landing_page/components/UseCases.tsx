import React, { useEffect, useRef, useState } from 'react';

const UseCaseItem: React.FC<{
    role: string;
    action: string;
    iconPath: React.ReactNode;
    delay: number
}> = ({ role, action, iconPath, delay }) => {
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
            className={`group relative flex flex-col items-center text-center p-6 lg:p-8 rounded-2xl border border-transparent hover:border-ink/5 hover:bg-white/50 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="w-16 h-16 mb-6 rounded-full bg-cream border border-ink/5 flex items-center justify-center text-ink/80 group-hover:scale-110 transition-transform duration-500">
                {iconPath}
            </div>
            <h3 className="font-serif-display text-2xl text-ink mb-3">{role}</h3>
            <p className="font-sans text-gray-600 text-sm md:text-base leading-relaxed max-w-sm">
                {action}
            </p>
        </div>
    );
};

export const UseCases: React.FC = () => {
    return (
        <section id="use-cases" className="w-full bg-cream py-16 md:py-24 border-t border-ink/5">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16">
                <div className="text-center mb-16 space-y-3">
                    <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-gray-500">
                        Target Audience
                    </h2>
                    <p className="font-serif-display text-3xl md:text-4xl lg:text-5xl text-ink">
                        Built for Creators
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 justify-items-center">
                    <UseCaseItem
                        role="SaaS Founders"
                        action="Create 'Show HN' launch videos in seconds. Wrap your landing page in a browser frame and share it on Twitter."
                        delay={0}
                        iconPath={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                        }
                    />
                    <UseCaseItem
                        role="Designers"
                        action="Show off UI work in realistic context for Dribbble or Behance. Stop using static mockups."
                        delay={150}
                        iconPath={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        }
                    />
                    <UseCaseItem
                        role="Content Creators"
                        action="Turn static blog posts into engaging TikTok or Reels video content with automated human-like scrolling."
                        delay={300}
                        iconPath={
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </section>
    );
};