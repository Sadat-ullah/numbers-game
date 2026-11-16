import React, { useState } from 'react';
import { ALL_LEVELS, WORLD_METADATA } from '../game/levels/data';
import { ChapterBadge } from './ChapterBadge';
import { Star, ShieldAlert, ArrowLeft, Play } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';

interface ChapterGridScreenProps {
  maxUnlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onBackToHome: () => void;
}

export const ChapterGridScreen: React.FC<ChapterGridScreenProps> = ({
  maxUnlockedLevel,
  levelStars,
  onSelectLevel,
  onBackToHome,
}) => {
  // Currently viewed world tab (1 to 10)
  const [selectedWorld, setSelectedWorld] = useState<number>(() => {
    // Default to the world of the highest unlocked level
    const currentWorld = Math.min(10, Math.ceil(maxUnlockedLevel / 10));
    return currentWorld;
  });

  const worldMeta = WORLD_METADATA.find(w => w.world === selectedWorld) || WORLD_METADATA[0];
  const worldLevels = ALL_LEVELS.filter(lvl => lvl.world === selectedWorld);

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full flex flex-col min-h-[calc(100dvh-68px)]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            sound.playTilePickup();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border border-stone-200 text-stone-700 font-bold text-sm shadow-xs hover:bg-white active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
            100 Levels Map
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Unlocked: {Math.min(100, maxUnlockedLevel)} / 100
          </p>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* World Selection Carousel / Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {WORLD_METADATA.map(meta => {
          const isWorldUnlocked = maxUnlockedLevel >= (meta.world - 1) * 10 + 1;
          const isSelected = meta.world === selectedWorld;

          return (
            <button
              key={meta.world}
              onClick={() => {
                sound.playTilePickup();
                setSelectedWorld(meta.world);
              }}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md scale-105'
                  : 'bg-white/60 border-stone-200/80 hover:bg-white/90'
              }`}
            >
              <ChapterBadge world={meta.world} size={32} unlocked={isWorldUnlocked} />
              <div className="text-left">
                <div className="text-xs font-extrabold text-stone-800 leading-tight">
                  World {meta.world}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active World Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ChapterBadge world={worldMeta.world} size={50} unlocked={maxUnlockedLevel >= (worldMeta.world - 1) * 10 + 1} />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              World {worldMeta.world}
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-stone-800">
              {worldMeta.title}
            </h2>
          </div>
        </div>
      </div>

      {/* 10-Level World Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {worldLevels.map(lvl => {
          const isUnlocked = lvl.id <= maxUnlockedLevel;
          const stars = levelStars[lvl.id] || 0;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  sound.playTilePickup();
                  onSelectLevel(lvl.id);
                } else {
                  sound.playInvalidShake();
                }
              }}
              className={`relative rounded-3xl p-4 flex flex-col items-center justify-between h-32 border-2 transition-all ${
                isUnlocked
                  ? 'bg-white hover:bg-amber-50/50 border-stone-200 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer active:scale-95'
                  : 'bg-stone-200/50 border-stone-300/40 text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600">
                  #{lvl.id}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(sIdx => (
                      <Star
                        key={sIdx}
                        size={12}
                        fill={sIdx <= stars ? '#F59E0B' : '#E2E8F0'}
                        stroke={sIdx <= stars ? '#D97706' : '#CBD5E1'}
                      />
                    ))}
                  </div>
                ) : (
                  <ShieldAlert size={16} className="text-stone-400" />
                )}
              </div>

              {isUnlocked ? (
                <div className="my-auto flex flex-col items-center">
                  <div className="text-2xl font-extrabold text-stone-800">
                    {lvl.target}
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                    Target
                  </span>
                </div>
              ) : (
                <div className="my-auto text-center">
                  <div className="w-8 h-8 rounded-full bg-stone-300/80 flex items-center justify-center text-stone-500 mx-auto">
                    🔒
                  </div>
                </div>
              )}

              {isUnlocked && (
                <div className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-stone-500">
                  <Play size={10} className="fill-stone-500" />
                  <span>Play</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
