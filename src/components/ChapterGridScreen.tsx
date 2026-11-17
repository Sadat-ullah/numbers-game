import React, { useState, useRef, useEffect } from 'react';
import { ALL_LEVELS, WORLD_METADATA } from '../game/levels/data';
import { ChapterBadge } from './ChapterBadge';
import { Star, ArrowLeft, Play, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';
import { BuilderMascot } from './BuilderMascot';

interface ChapterGridScreenProps {
  maxUnlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onBackToHome: () => void;
}

const WORLD_THEMES: Record<number, {
  accent: string;
  bgLight: string;
  borderLight: string;
  badgeGradient: string;
  glow: string;
  tag: string;
}> = {
  1: { accent: '#F97316', bgLight: 'from-amber-500/10 to-orange-500/10', borderLight: 'border-orange-300', badgeGradient: 'from-amber-400 to-orange-500', glow: 'rgba(249, 115, 22, 0.25)', tag: 'text-orange-700 bg-orange-100' },
  2: { accent: '#0D9488', bgLight: 'from-teal-500/10 to-emerald-500/10', borderLight: 'border-teal-300', badgeGradient: 'from-teal-400 to-emerald-500', glow: 'rgba(13, 148, 136, 0.25)', tag: 'text-teal-700 bg-teal-100' },
  3: { accent: '#E11D48', bgLight: 'from-rose-500/10 to-pink-500/10', borderLight: 'border-rose-300', badgeGradient: 'from-rose-400 to-pink-500', glow: 'rgba(225, 29, 72, 0.25)', tag: 'text-rose-700 bg-rose-100' },
  4: { accent: '#7C3AED', bgLight: 'from-purple-500/10 to-indigo-500/10', borderLight: 'border-purple-300', badgeGradient: 'from-purple-400 to-indigo-500', glow: 'rgba(124, 58, 237, 0.25)', tag: 'text-purple-700 bg-purple-100' },
  5: { accent: '#D97706', bgLight: 'from-amber-500/10 to-yellow-500/10', borderLight: 'border-amber-300', badgeGradient: 'from-yellow-400 to-amber-500', glow: 'rgba(217, 119, 6, 0.25)', tag: 'text-amber-700 bg-amber-100' },
  6: { accent: '#059669', bgLight: 'from-emerald-500/10 to-teal-500/10', borderLight: 'border-emerald-300', badgeGradient: 'from-emerald-400 to-teal-600', glow: 'rgba(5, 150, 105, 0.25)', tag: 'text-emerald-700 bg-emerald-100' },
  7: { accent: '#2563EB', bgLight: 'from-blue-500/10 to-cyan-500/10', borderLight: 'border-blue-300', badgeGradient: 'from-blue-400 to-indigo-500', glow: 'rgba(37, 99, 235, 0.25)', tag: 'text-blue-700 bg-blue-100' },
  8: { accent: '#4F46E5', bgLight: 'from-indigo-500/10 to-violet-500/10', borderLight: 'border-indigo-300', badgeGradient: 'from-indigo-400 to-violet-600', glow: 'rgba(79, 70, 229, 0.25)', tag: 'text-indigo-700 bg-indigo-100' },
  9: { accent: '#C026D3', bgLight: 'from-fuchsia-500/10 to-pink-500/10', borderLight: 'border-fuchsia-300', badgeGradient: 'from-fuchsia-400 to-pink-600', glow: 'rgba(192, 38, 211, 0.25)', tag: 'text-fuchsia-700 bg-fuchsia-100' },
  10: { accent: '#E11D48', bgLight: 'from-rose-500/10 to-red-500/10', borderLight: 'border-rose-300', badgeGradient: 'from-rose-500 to-red-600', glow: 'rgba(225, 29, 72, 0.25)', tag: 'text-rose-700 bg-rose-100' },
};

export const ChapterGridScreen: React.FC<ChapterGridScreenProps> = ({
  maxUnlockedLevel,
  levelStars,
  onSelectLevel,
  onBackToHome,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number>(() => {
    return Math.min(10, Math.ceil(maxUnlockedLevel / 10));
  });

  const worldTabsRef = useRef<HTMLDivElement>(null);
  const worldMeta = WORLD_METADATA.find(w => w.world === selectedWorld) || WORLD_METADATA[0];
  const worldLevels = ALL_LEVELS.filter(lvl => lvl.world === selectedWorld);
  const theme = WORLD_THEMES[selectedWorld] || WORLD_THEMES[1];

  // Auto-scroll selected world pill into view smoothly
  useEffect(() => {
    if (worldTabsRef.current) {
      const activeTab = worldTabsRef.current.querySelector(`[data-world-tab="${selectedWorld}"]`) as HTMLElement;
      if (activeTab) {
        const container = worldTabsRef.current;
        const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedWorld]);

  const handleScrollLeft = () => {
    if (worldTabsRef.current) {
      worldTabsRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (worldTabsRef.current) {
      worldTabsRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex flex-col min-h-[calc(100dvh-68px)]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => {
            sound.playTilePickup();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-stone-200 text-stone-700 font-extrabold text-sm shadow-xs hover:bg-white active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
            100 Levels Map
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-bold mt-0.5">
            Unlocked: <span className="text-amber-600 font-extrabold">{Math.min(100, maxUnlockedLevel)}</span> / 100
          </p>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* World Selection Carousel with Smooth Scroll & Edge Fade Indicators */}
      <div className="relative w-full mb-6">
        {/* Left Scroll Button */}
        <button
          onClick={handleScrollLeft}
          title="Scroll Left"
          className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:bg-stone-50 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scroll Container */}
        <div
          ref={worldTabsRef}
          data-testid="world-selector-bar"
          className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {WORLD_METADATA.map(meta => {
            const isWorldUnlocked = maxUnlockedLevel >= (meta.world - 1) * 10 + 1;
            const isSelected = meta.world === selectedWorld;
            const worldTheme = WORLD_THEMES[meta.world] || WORLD_THEMES[1];

            return (
              <button
                key={meta.world}
                data-testid={`world-pill-${meta.world}`}
                data-world-tab={meta.world}
                onClick={() => {
                  sound.playTilePickup();
                  setSelectedWorld(meta.world);
                }}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `bg-white shadow-md scale-105 border-amber-500`
                    : 'bg-white/70 border-stone-200/80 hover:bg-white/95'
                }`}
                style={{
                  scrollSnapAlign: 'center',
                  borderColor: isSelected ? worldTheme.accent : undefined,
                  boxShadow: isSelected ? `0 8px 18px -4px ${worldTheme.glow}` : undefined,
                }}
              >
                <ChapterBadge world={meta.world} size={34} unlocked={isWorldUnlocked} />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-extrabold text-stone-800 leading-tight">
                    World {meta.world}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold truncate max-w-[100px]">
                    Lv. {(meta.world - 1) * 10 + 1}–{meta.world * 10}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={handleScrollRight}
          title="Scroll Right"
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:bg-stone-50 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Active World Banner */}
      <div
        className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
        style={{ borderColor: theme.borderLight }}
      >
        <div className="flex items-center gap-4">
          <ChapterBadge world={worldMeta.world} size={54} unlocked={maxUnlockedLevel >= (worldMeta.world - 1) * 10 + 1} />
          <div>
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1"
              style={{ color: theme.accent, backgroundColor: `${theme.accent}15` }}
            >
              World {worldMeta.world}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-800">
              {worldMeta.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              {worldMeta.desc}
            </p>
          </div>
        </div>

        {/* World Progress Indicator */}
        <div className="flex items-center gap-2 self-end sm:self-center px-3.5 py-1.5 rounded-2xl bg-stone-100 border border-stone-200">
          <span className="text-xs font-bold text-stone-600">
            Levels {(selectedWorld - 1) * 10 + 1}–{selectedWorld * 10}
          </span>
        </div>
      </div>

      {/* 10-Level World Grid with Mascot on Latest Active Card */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-5 mb-8">
        {worldLevels.map(lvl => {
          const isUnlocked = lvl.id <= maxUnlockedLevel;
          const isCurrentActive = lvl.id === maxUnlockedLevel;
          const stars = levelStars[lvl.id] || 0;

          return (
            <div key={lvl.id} className="relative">
              {/* Mascot Avatar Perched on Active Unlocked Level Card */}
              {isCurrentActive && (
                <div
                  data-testid="map-mascot-marker"
                  className="absolute -top-9 -right-3 z-30 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    sound.playMascotChirp();
                  }}
                  title="Pip: Current Level!"
                >
                  <BuilderMascot
                    size="sm"
                    showSpeechBubble={false}
                    className="scale-75 sm:scale-85 origin-bottom-right"
                  />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[9px] shadow-sm animate-bounce whitespace-nowrap">
                    Here! ⭐
                  </div>
                </div>
              )}

              <button
                data-testid={`level-card-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playTilePickup();
                    onSelectLevel(lvl.id);
                  } else {
                    sound.playInvalidShake();
                  }
                }}
                className={`w-full relative rounded-3xl p-4 flex flex-col items-center justify-between h-36 border-2 transition-all ${
                  isUnlocked
                    ? isCurrentActive
                      ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/40 border-amber-400 ring-4 ring-amber-300/40 shadow-lg cursor-pointer active:scale-95'
                      : 'bg-white hover:bg-stone-50/80 border-stone-200/90 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer active:scale-95'
                    : 'bg-stone-100/90 border-stone-300/60 text-stone-400 cursor-not-allowed shadow-inner'
                }`}
                style={{
                  boxShadow: isCurrentActive ? '0 10px 25px -4px rgba(245, 158, 11, 0.35)' : undefined,
                }}
              >
                {/* Top Bar: Level Number & Star Rating */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-xl ${
                      isUnlocked
                        ? isCurrentActive
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700'
                        : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    #{lvl.id}
                  </span>

                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map(sIdx => (
                        <Star
                          key={sIdx}
                          size={13}
                          fill={sIdx <= stars ? '#F59E0B' : '#E2E8F0'}
                          stroke={sIdx <= stars ? '#D97706' : '#CBD5E1'}
                          strokeWidth={2}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center">
                      <Lock size={11} strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Center Content: Target Numeral or Warm Wooden Padlock */}
                {isUnlocked ? (
                  <div className="my-auto flex flex-col items-center">
                    <div className="text-3xl font-extrabold text-stone-800 tracking-tight">
                      {lvl.target}
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
                      TARGET
                    </span>
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center opacity-70">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-stone-200 to-stone-300 border border-stone-300 flex items-center justify-center text-stone-500 shadow-inner">
                      <Lock size={18} className="text-stone-400" />
                    </div>
                  </div>
                )}

                {/* Bottom Action Hint */}
                {isUnlocked && (
                  <div
                    className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-extrabold py-0.5 rounded-xl ${
                      isCurrentActive
                        ? 'text-amber-800 bg-amber-100/80'
                        : 'text-stone-500'
                    }`}
                  >
                    <Play size={11} className={isCurrentActive ? "fill-amber-800" : "fill-stone-500"} />
                    <span>Play</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};