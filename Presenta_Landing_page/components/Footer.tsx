import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-cream py-12 border-t border-ink/5">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex items-center gap-4">
          <span className="font-script text-3xl text-ink">Presenta</span>
          <span className="text-gray-400 text-sm">© 2026</span>
        </div>

        <div className="flex gap-8">
          <a href="#docs" className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:text-ink transition-colors">Documentation</a>
        </div>

      </div>
    </footer>
  );
};