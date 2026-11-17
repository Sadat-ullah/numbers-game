import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../game/audio/soundEngine';

export type MascotState = 'idle' | 'tap_react' | 'dragging' | 'celebrate' | 'encourage' | 'hint';

export interface BuilderMascotProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg';
  speechBubbleText?: string;
  showSpeechBubble?: boolean;
  dragPosition?: { x: number; y: number } | null;
  onTap?: () => void;
  className?: string;
}

const DEFAULT_SPEECH_PHRASES: Record<MascotState, string[]> = {
  idle: [
    "Hi, I'm Pip! Let's build! 🔨",
    "Drag the blocks to solve! ✨",
    "You can do it! 🚀",
    "Numbers are fun! 🧩",
    "Tap me anytime! 💛",
  ],
  tap_react: [
    "Wooo! You're awesome! 🎉",
    "High five, builder! 🖐️",
    "Tickles! Hehe! 😄",
    "Let's crack the code! 🔍",
    "Math power activated! ⚡",
  ],
  dragging: [
    "Ooh, where does that go? 👀",
    "Careful drop... 🎯",
    "Look at that move! ✨",
  ],
  celebrate: [
    "YOU DID IT! 🏆",
    "Super Math Master! ⭐⭐⭐",
    "Brilliant equation! 🌟",
    "Woohoo! High score! 🎊",
  ],
  encourage: [
    "So close! Try swapping a block! 🔄",
    "Almost there! Keep trying! 💪",
    "You got this, friend! 🌟",
  ],
  hint: [
    "Psst... check the glowing tile! 💡",
    "Follow the magic trail! ✨",
    "Here's a clue for you! 🔍",
  ],
};

export const BuilderMascot: React.FC<BuilderMascotProps> = ({
  state = 'idle',
  size = 'md',
  speechBubbleText,
  showSpeechBubble = true,
  dragPosition = null,
  onTap,
  className = '',
}) => {
  const [internalState, setInternalState] = useState<MascotState>(state);
  const [tapBounce, setTapBounce] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Sync external state changes
  useEffect(() => {
    setInternalState(state);
    if (state === 'celebrate') {
      sound.playMascotCelebrate();
    }
  }, [state]);

  // Periodic eye blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Handle direct tap/click on Pip
  const handleMascotTap = () => {
    // Gentle haptic feedback on supported mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(30);
      } catch {}
    }

    sound.playMascotChirp();
    setTapBounce(true);
    setInternalState('tap_react');
    setPhraseIndex(prev => prev + 1);

    if (onTap) {
      onTap();
    }

    setTimeout(() => {
      setTapBounce(false);
      setInternalState(state === 'tap_react' ? 'idle' : state);
    }, 1200);
  };

  // Determine speech bubble text
  const currentPhrases = DEFAULT_SPEECH_PHRASES[internalState] || DEFAULT_SPEECH_PHRASES.idle;
  const activeSpeech = speechBubbleText || currentPhrases[phraseIndex % currentPhrases.length];

  // Calculate eye pupil offset toward dragged tile or cursor
  const pupilOffset = useMemo(() => {
    if (!dragPosition || !mascotRef.current) {
      if (internalState === 'hint') return { x: 3, y: -2 };
      if (internalState === 'encourage') return { x: -2, y: 3 };
      return { x: 0, y: 0 };
    }

    const rect = mascotRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = dragPosition.x - centerX;
    const dy = dragPosition.y - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return { x: 0, y: 0 };
    const maxOffset = 5;
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, (dx / dist) * maxOffset)),
      y: Math.max(-maxOffset, Math.min(maxOffset, (dy / dist) * maxOffset)),
    };
  }, [dragPosition, internalState]);

  // Size scalings
  const dimensions = {
    sm: { width: 68, height: 76, bubbleText: 'text-[10px]', bubblePad: 'px-2 py-1' },
    md: { width: 92, height: 104, bubbleText: 'text-xs', bubblePad: 'px-3 py-1.5' },
    lg: { width: 124, height: 140, bubbleText: 'text-sm', bubblePad: 'px-4 py-2' },
  }[size];

  return (
    <div
      ref={mascotRef}
      data-testid="builder-mascot"
      onClick={handleMascotTap}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div
          data-testid="mascot-speech-bubble"
          className={`absolute -top-12 z-30 transition-all duration-300 transform pointer-events-none whitespace-nowrap bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-amber-300 font-extrabold text-stone-700 animate-in fade-in zoom-in-90 ${dimensions.bubblePad} ${dimensions.bubbleText} ${
            internalState === 'celebrate'
              ? 'border-amber-400 bg-amber-50 text-amber-900 scale-105 animate-bounce'
              : internalState === 'encourage'
              ? 'border-rose-300 bg-rose-50 text-rose-900'
              : ''
          }`}
          style={{
            boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.25)',
          }}
        >
          <span>{activeSpeech}</span>
          {/* Speech bubble tail */}
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-300" />
        </div>
      )}

      {/* SVG Character Avatar "Pip" */}
      <div
        className={`transition-transform duration-300 ease-out transform ${
          tapBounce
            ? 'scale-115 -rotate-6 animate-bounce'
            : internalState === 'celebrate'
            ? 'scale-110 animate-bounce'
            : internalState === 'dragging'
            ? 'scale-105'
            : 'hover:scale-105 active:scale-95 animate-float-slow'
        }`}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 120 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          <defs>
            {/* Body metallic/craft gradients */}
            <linearGradient id="pipBodyGrad" x1="20" y1="35" x2="100" y2="125" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="pipBellyGrad" x1="35" y1="70" x2="85" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>

            <linearGradient id="pipGoggleLens" x1="30" y1="40" x2="90" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>

            <linearGradient id="pipBrassTrim" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Antenna with golden beacon bulb */}
          <g>
            <rect x="57" y="10" width="6" height="20" rx="3" fill="url(#pipBrassTrim)" />
            {/* Glowing Antenna Bulb */}
            <circle
              cx="60"
              cy="9"
              r="7"
              fill={internalState === 'hint' ? '#FBBF24' : '#38BDF8'}
              filter="url(#softGlow)"
            />
            <circle cx="58" cy="7" r="2.5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Left Wing / Robotic Arm */}
          <g
            className="transition-transform duration-300"
            style={{
              transformOrigin: '24px 75px',
              transform:
                internalState === 'celebrate'
                  ? 'rotate(-55deg) translate(-4px, -12px)'
                  : tapBounce
                  ? 'rotate(-40deg)'
                  : internalState === 'hint'
                  ? 'rotate(-25deg)'
                  : 'rotate(0deg)',
            }}
          >
            <path
              d="M 24 68 C 10 72 4 86 12 96 C 18 102 26 94 28 85 Z"
              fill="url(#pipBodyGrad)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Tiny wooden wrench tool in hand */}
            <circle cx="10" cy="94" r="4.5" fill="#0D9488" stroke="#042F2E" strokeWidth="1.5" />
          </g>

          {/* Right Wing / Waving Hand */}
          <g
            className="transition-transform duration-300"
            style={{
              transformOrigin: '96px 75px',
              transform:
                internalState === 'celebrate'
                  ? 'rotate(55deg) translate(4px, -12px)'
                  : tapBounce
                  ? 'rotate(45deg)'
                  : internalState === 'dragging'
                  ? 'rotate(20deg)'
                  : 'rotate(0deg)',
            }}
          >
            <path
              d="M 96 68 C 110 72 116 86 108 96 C 102 102 94 94 92 85 Z"
              fill="url(#pipBodyGrad)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            <circle cx="110" cy="94" r="4.5" fill="#0D9488" stroke="#042F2E" strokeWidth="1.5" />
          </g>

          {/* Main Bot Body (Round Chunky Owl/Bot) */}
          <rect
            x="20"
            y="26"
            width="80"
            height="90"
            rx="40"
            fill="url(#pipBodyGrad)"
            stroke="#B45309"
            strokeWidth="3.5"
          />

          {/* Soft Cream Belly Plate */}
          <rect
            x="32"
            y="68"
            width="56"
            height="42"
            rx="21"
            fill="url(#pipBellyGrad)"
            stroke="#F59E0B"
            strokeWidth="2"
          />

          {/* Tiny Mathematical Symbol Embellishment on Belly (+ / = badge) */}
          <g opacity="0.45" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round">
            <line x1="60" y1="83" x2="60" y2="93" />
            <line x1="55" y1="88" x2="65" y2="88" />
          </g>

          {/* Builder Goggles Strap */}
          <rect x="18" y="47" width="84" height="11" rx="5.5" fill="#78350F" />
          <line x1="20" y1="52.5" x2="100" y2="52.5" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 3" />

          {/* Left Goggle Rim & Lens */}
          <g>
            <circle cx="43" cy="52" r="19" fill="#92400E" stroke="url(#pipBrassTrim)" strokeWidth="3" />
            <circle cx="43" cy="52" r="15" fill="url(#pipGoggleLens)" />
            {/* Lens Gloss Reflection */}
            <path d="M 33 44 Q 43 38 52 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

            {/* Left Eye / Pupil */}
            {!isBlinking ? (
              internalState === 'celebrate' ? (
                // Star eyes when celebrating!
                <text x="36" y="58" fontSize="16" fill="#FBBF24" fontWeight="bold">⭐</text>
              ) : (
                <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}>
                  <circle cx="43" cy="52" r="7.5" fill="#0F172A" />
                  <circle cx="40.5" cy="49.5" r="2.5" fill="#FFFFFF" />
                  <circle cx="45" cy="54" r="1.2" fill="#FFFFFF" />
                </g>
              )
            ) : (
              // Happy squint / blink line
              <path d="M 36 53 Q 43 57 50 53" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* Goggle Center Bridge */}
          <rect x="58" y="49" width="4" height="7" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />

          {/* Right Goggle Rim & Lens */}
          <g>
            <circle cx="77" cy="52" r="19" fill="#92400E" stroke="url(#pipBrassTrim)" strokeWidth="3" />
            <circle cx="77" cy="52" r="15" fill="url(#pipGoggleLens)" />
            {/* Lens Gloss Reflection */}
            <path d="M 67 44 Q 77 38 86 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

            {/* Right Eye / Pupil */}
            {!isBlinking ? (
              internalState === 'celebrate' ? (
                // Star eyes when celebrating!
                <text x="70" y="58" fontSize="16" fill="#FBBF24" fontWeight="bold">⭐</text>
              ) : (
                <g style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}>
                  <circle cx="77" cy="52" r="7.5" fill="#0F172A" />
                  <circle cx="74.5" cy="49.5" r="2.5" fill="#FFFFFF" />
                  <circle cx="79" cy="54" r="1.2" fill="#FFFFFF" />
                </g>
              )
            ) : (
              // Happy squint / blink line
              <path d="M 70 53 Q 77 57 84 53" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* Cute Beak / Mouth */}
          <g>
            {internalState === 'celebrate' ? (
              // Big happy open cheering smile
              <path
                d="M 52 74 Q 60 84 68 74 Z"
                fill="#EF4444"
                stroke="#B45309"
                strokeWidth="2"
              />
            ) : internalState === 'encourage' ? (
              // Thoughtful curious circle mouth
              <circle cx="60" cy="74" r="4.5" fill="#B45309" />
            ) : (
              // Cute friendly beak smile
              <path
                d="M 53 71 Q 60 78 67 71"
                stroke="#B45309"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* Rosy Cheek Blush */}
          <ellipse cx="28" cy="67" rx="4.5" ry="3" fill="#F87171" opacity="0.6" />
          <ellipse cx="92" cy="67" rx="4.5" ry="3" fill="#F87171" opacity="0.6" />

          {/* Chunky Feet / Magnetic Base */}
          <rect x="36" y="114" width="18" height="9" rx="4.5" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          <rect x="66" y="114" width="18" height="9" rx="4.5" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};