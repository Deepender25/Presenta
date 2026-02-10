import React from 'react';

export const CinematicLogo: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center select-none pointer-events-none p-0">
      {/* 
         Responsive Container:
         - Widths matched to user preference (95vw mobile, 60vw tablet, 45vw desktop).
      */}
      <div className="relative w-[95vw] md:w-[60vw] lg:w-[45vw] mx-auto flex items-center justify-center">
        <svg 
          /* 
             ViewBox Strategy:
             - We use "0 0 1000 850" to define the layout boundary around the text (Y=400).
             - The text is at Y=400, which is near the vertical center (425) of this box.
             - This ensures the text is centered on the screen.
             - The tail extends well beyond 850 (to 1650), so we use overflow-visible.
          */
          viewBox="0 0 1000 850" 
          className="w-full h-auto overflow-visible"
          aria-label="Presenta Logo"
        >
          {/* 
             Main Text "Presenta"
             - Reverted to exact user coordinates (y=400) and stroke weights (3.5px).
          */}
          <text 
            x="50%" 
            y="400" 
            textAnchor="middle" 
            className="font-script"
            style={{
              fontSize: '240px', 
              fill: '#1a1a1a',
              fillOpacity: 0,
              stroke: '#1a1a1a',
              strokeWidth: '3.5px', 
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: `
                write 2.5s cubic-bezier(0.37, 0, 0.63, 1) forwards 0.5s,
                fillIn 2s ease forwards 1.0s
              `
            }}
          >
            Presenta
          </text>

          {/* 
             The Tail Path
             - Exact coordinates from previous version to ensure perfect connection with text.
             - Stroke width restored to 4.5px.
          */}
          <path 
            d="M 495,360 
               C 600,300 950,350 955,520 
               C 915,640 300,580 300,450 
               C 300,350 580,450 600,700 
               C 610,850 550,950 580,1100
               C 600,1200 580,1300 580,1650" 
            style={{
              fill: 'none',
              stroke: '#1a1a1a',
              strokeWidth: '4.5px',
              strokeLinecap: 'round',
              strokeDasharray: 3500,
              strokeDashoffset: 3500,
              opacity: 0,
              animation: `
                dropTail 2.8s cubic-bezier(0.45, 0, 0.55, 1) forwards 2.7s,
                fadeOut 1s ease forwards 5.2s
              `
            }}
          />
        </svg>
      </div>
    </div>
  );
};