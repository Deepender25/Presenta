import React, { useEffect } from 'react';

const DocSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-12 md:mb-16">
        <h3 className="font-serif-display text-2xl md:text-3xl text-ink mb-6">{title}</h3>
        <div className="font-sans text-gray-600 leading-relaxed space-y-4 text-base md:text-lg">
            {children}
        </div>
    </div>
);

export const Documentation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-cream w-full relative">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-cream/80 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-ink hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-sans uppercase tracking-widest text-xs font-semibold">Back to Home</span>
                </button>
                <div className="font-script text-2xl text-ink">Presenta</div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-32 md:py-40">
                <div className="text-center mb-20">
                    <h1 className="font-serif-display text-5xl md:text-7xl text-ink mb-6">Documentation</h1>
                    <p className="font-sans text-xl text-gray-500 max-w-2xl mx-auto">
                        A comprehensive guide to creating cinematic product demos with Presenta.
                    </p>
                </div>

                <DocSection title="Introduction">
                    <p>
                        Presenta is a privacy-first, zero-dependency tool designed to transform static screenshots and screen recordings into high-fidelity, cinematic motion graphics.
                        It runs entirely in your browser using a custom Vanilla JS engine, ensuring your data never leaves your device.
                    </p>
                </DocSection>

                <DocSection title="Core Features">
                    <strong className="text-ink block mb-2">Cinematic Device Mockups</strong>
                    <p>
                        Instantly wrap your content in realistic device shells. We currently support:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Browser (Clean/Dark)</strong>: Perfect for SaaS dashboards and landing pages.</li>
                            <li><strong>iPhone 14 Pro</strong>: Ideal for mobile app demos.</li>
                            <li><strong>MacBook Pro</strong>: Best for desktop software showcases.</li>
                            <li><strong>iPad Air</strong>: Great for tablet-responsive designs.</li>
                        </ul>
                    </p>

                    <strong className="text-ink block mt-6 mb-2">"Human-Touch" Animation</strong>
                    <p>
                        Our proprietary animation engine simulates natural user behavior. Instead of a linear scroll, it:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Accelerates over large images.</li>
                            <li>Decelerates when it detects text blocks, simulating reading time.</li>
                            <li>Pauses naturally at key focal points.</li>
                        </ul>
                    </p>

                    <strong className="text-ink block mt-6 mb-2">4K Export Pipeline</strong>
                    <p>
                        Export your creations in broadcast-quality formats. We support WebM and MP4 containers at up to 4K resolution (3840x2160) at a buttery-smooth 60 frames per second.
                    </p>
                </DocSection>

                <DocSection title="Workflow Guide">
                    <ol className="list-decimal pl-5 space-y-4">
                        <li>
                            <strong>Upload Content</strong>: Drag and drop your image (PNG, JPG) or video (MP4, WEBM) file directly onto the canvas.
                        </li>
                        <li>
                            <strong>Frame Selection</strong>: Use the sidebar controls to choose your desired device frame. Adjust the corner radius, shadow intensity, and background color to match your brand guidelines.
                        </li>
                        <li>
                            <strong>Animation Settings</strong>: Toggle "Human Scroll" for automatic pacing or "Linear" for consistent speed. Adjust the total duration to fit your platform's limits (e.g., 15s for Instagram Stories).
                        </li>
                        <li>
                            <strong>Export</strong>: Click the "Export" button. The rendering happens locally on your GPU. Once complete, the file will automatically download.
                        </li>
                    </ol>
                </DocSection>

                <DocSection title="Use Cases & Best Practices">
                    <strong className="text-ink block mb-2">For SaaS Founders</strong>
                    <p>
                        Create "Launch Day" videos for Product Hunt or Twitter. Use the Browser frame with a solid background color that contrasts with your app's UI. Keep animations under 30 seconds for maximum engagement.
                    </p>

                    <strong className="text-ink block mt-6 mb-2">For Designers</strong>
                    <p>
                        Showcase your Dribbble shots or Behance case studies. The 4K export ensures your pixel-perfect designs remain sharp even after social media compression.
                    </p>
                </DocSection>

                <DocSection title="Technical Specifications">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-b border-ink/10 py-6">
                        <div>
                            <span className="block text-gray-400 uppercase tracking-widest text-xs mb-1">Engine</span>
                            <span className="text-ink">Custom Vanilla JS (Zero-Dep)</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 uppercase tracking-widest text-xs mb-1">Rendering</span>
                            <span className="text-ink">Hardware Accelerated Canvas 2D</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 uppercase tracking-widest text-xs mb-1">Privacy</span>
                            <span className="text-ink">100% Client-Side / Offline Capable</span>
                        </div>
                        <div>
                            <span className="block text-gray-400 uppercase tracking-widest text-xs mb-1">Output Attributes</span>
                            <span className="text-ink">Up to 4K @ 60FPS (WebM/MP4)</span>
                        </div>
                    </div>
                </DocSection>

                <div className="mt-20 pt-10 border-t border-ink/5 text-center text-gray-400 text-sm">
                    <p>© 2026 Presenta. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};
