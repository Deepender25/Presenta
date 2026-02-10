import React from 'react';

const ITEMS = [
  "Twitter / X", "Instagram Reels", "TikTok", "LinkedIn", "Dribbble", "Product Hunt", "YouTube Shorts", "Behance"
];

export const PlatformTicker: React.FC = () => {
  // Duplicate list to create seamless loop
  const displayItems = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="w-full py-3 md:py-4 border-y border-ink/5 bg-white/50 backdrop-blur-sm overflow-hidden relative z-20">
      <div className="max-w-[100vw] flex">
        <div 
          className="flex whitespace-nowrap"
          style={{ animation: 'scroll 40s linear infinite' }}
        >
          {displayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-16 px-4 md:px-8">
              <span className="font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-400">
                {item}
              </span>
              <div className="w-1 h-1 rounded-full bg-ink/10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};