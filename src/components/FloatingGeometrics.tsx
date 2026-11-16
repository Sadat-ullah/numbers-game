import React from 'react';

export const FloatingGeometrics: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft geometric architectural grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#78716C" strokeWidth="1" strokeDasharray="2 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Slowly floating pastel translucent geometric shapes */}
      <div className="absolute top-[8%] left-[6%] w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-200/40 to-orange-200/30 border border-amber-300/40 backdrop-blur-xs animate-float-slow" />
      
      <div className="absolute top-[20%] right-[8%] w-32 h-32 rounded-full bg-gradient-to-bl from-teal-200/40 to-cyan-200/30 border border-teal-300/40 backdrop-blur-xs animate-float-reverse" />
      
      <div className="absolute bottom-[25%] left-[4%] w-28 h-28 rotate-45 rounded-3xl bg-gradient-to-tr from-purple-200/40 to-indigo-200/30 border border-purple-300/40 backdrop-blur-xs animate-float-slow" />

      <div className="absolute bottom-[10%] right-[7%] w-36 h-36 rounded-2xl bg-gradient-to-br from-rose-200/40 to-pink-200/30 border border-rose-300/40 backdrop-blur-xs animate-float-reverse" />
      
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl -z-10" />
    </div>
  );
};
