import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Grid } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';

interface CelebrationModalProps {
  levelId: number;
  stars: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelGrid: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  levelId,
  stars,
  onNextLevel,
  onReplayLevel,
  onOpenLevelGrid,
}) => {
  useEffect(() => {
    // Fire geometric pastel confetti
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#F43F5E'],
      shapes: ['square', 'circle'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Top Trophy Banner */}
        <div className="w-20 h-20 -mt-14 mb-2 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white flex items-center justify-center shadow-lg text-4xl animate-bounce">
          🏆
        </div>

        <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">
          Solved!
        </h2>
        <p className="text-stone-500 font-medium text-sm mt-1">
          Level {levelId} Complete
        </p>

        {/* Star Rating Reveal */}
        <div className="flex items-center justify-center gap-3 my-6">
          {[1, 2, 3].map(index => {
            const isEarned = index <= stars;
            return (
              <div
                key={index}
                className={`transition-all duration-300 transform ${
                  isEarned
                    ? 'scale-110 text-amber-400 drop-shadow-md'
                    : 'text-stone-200 scale-95'
                }`}
              >
                <Star
                  size={42}
                  fill={isEarned ? '#F59E0B' : '#E2E8F0'}
                  stroke={isEarned ? '#D97706' : '#CBD5E1'}
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={() => {
              sound.playTilePickup();
              onNextLevel();
            }}
            className="tactile-button w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 border-b-4 border-orange-700 active:border-b-0 cursor-pointer shadow-md"
          >
            <span>Next Level</span>
            <ArrowRight size={22} strokeWidth={3} />
          </button>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => {
                sound.playTilePickup();
                onReplayLevel();
              }}
              className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm border border-stone-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw size={16} />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                sound.playTilePickup();
                onOpenLevelGrid();
              }}
              className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm border border-stone-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Grid size={16} />
              <span>Chapters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
