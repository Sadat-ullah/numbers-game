import React from 'react';

export const FloatingGeometrics: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Warm sunlit workshop radial spotlight */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl h-[600px] rounded-full bg-gradient-to-b from-amber-200/45 via-orange-100/25 to-transparent blur-3xl -z-10" />

      {/* Blueprint Workshop Architectural Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-18" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="workshop-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#A8A29E" strokeWidth="1" strokeDasharray="2 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#workshop-grid)" />
      </svg>

      {/* Softly Floating Pastel Geometric & Math Block Shapes */}
      {/* Tile 1: Top-Left Addition Block */}
      <div
        className="absolute top-[8%] left-[5%] w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-200/50 to-orange-200/40 border-2 border-amber-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-amber-700/40 text-2xl sm:text-3xl animate-float-slow shadow-lg shadow-amber-900/5"
        style={{ willChange: 'transform' }}
      >
        +
      </div>

      {/* Tile 2: Top-Right Number 3 Block */}
      <div
        className="absolute top-[14%] right-[6%] w-18 h-18 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-bl from-teal-200/50 to-cyan-200/40 border-2 border-teal-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-teal-800/40 text-2xl sm:text-3xl animate-float-reverse shadow-lg shadow-teal-900/5"
        style={{ willChange: 'transform' }}
      >
        3
      </div>

      {/* Tile 3: Mid-Left Multiplication Block */}
      <div
        className="absolute top-[48%] left-[3%] w-14 h-14 sm:w-18 sm:h-18 rotate-12 rounded-2xl bg-gradient-to-tr from-purple-200/50 to-indigo-200/40 border-2 border-purple-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-purple-700/40 text-xl sm:text-2xl animate-float-slow shadow-lg shadow-purple-900/5"
        style={{ willChange: 'transform' }}
      >
        ×
      </div>

      {/* Tile 4: Mid-Right Number 1 Block */}
      <div
        className="absolute top-[52%] right-[4%] w-14 h-14 sm:w-16 sm:h-16 -rotate-6 rounded-2xl bg-gradient-to-br from-rose-200/50 to-pink-200/40 border-2 border-rose-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-rose-700/40 text-xl sm:text-2xl animate-float-reverse shadow-lg shadow-rose-900/5"
        style={{ willChange: 'transform' }}
      >
        1
      </div>

      {/* Tile 5: Bottom-Left Number 2 Block */}
      <div
        className="absolute bottom-[10%] left-[8%] w-20 h-20 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-tr from-yellow-200/50 to-amber-200/40 border-2 border-yellow-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-yellow-800/40 text-3xl sm:text-4xl animate-float-slow shadow-lg shadow-amber-900/5"
        style={{ willChange: 'transform' }}
      >
        2
      </div>

      {/* Tile 6: Bottom-Right Subtraction Block */}
      <div
        className="absolute bottom-[12%] right-[8%] w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-bl from-emerald-200/50 to-teal-200/40 border-2 border-emerald-300/50 backdrop-blur-xs flex items-center justify-center font-extrabold text-emerald-800/40 text-2xl sm:text-3xl animate-float-reverse shadow-lg shadow-emerald-900/5"
        style={{ willChange: 'transform' }}
      >
        −
      </div>

      {/* Ambient warm corner blooms */}
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl -z-10" />
      <div className="absolute -top-16 right-1/4 w-80 h-80 rounded-full bg-teal-100/35 blur-3xl -z-10" />
    </div>
  );
};