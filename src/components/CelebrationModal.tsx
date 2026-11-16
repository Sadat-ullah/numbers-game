import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Grid, Lightbulb } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';

interface CelebrationModalProps {
  levelId: number;
  stars: number;
  hintEarned?: boolean;
  hintsEarned?: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelGrid: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  levelId,
  stars,
  hintEarned = false,
  hintsEarned,
  onNextLevel,
  onReplayLevel,
  onOpenLevelGrid,
}) => {
  const earnedCount = hintsEarned !== undefined ? hintsEarned : hintEarned ? 1 : 0;
  useEffect(() => {
    // Fire geometric pastel confetti
    confetti({
      particleCount: 80,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#F43F5E'],
      shapes: ['square', 'circle'],
    });
  }, []);

  return (
    <div
      data-testid="celebration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Top Trophy Banner */}
        <div className="w-18 h-18 -mt-13 mb-2 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white flex items-center justify-center shadow-lg text-4xl animate-bounce">
          🏆
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
          Solved!
        </h2>
        <span className="text-stone-400 font-bold text-xs uppercase tracking-wider mt-0.5">
          Level {levelId}
        </span>

        {/* Star Rating Reveal */}
        <div className="flex items-center justify-center gap-3 my-4">
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
                  size={38}
                  fill={isEarned ? '#F59E0B' : '#E2E8F0'}
                  stroke={isEarned ? '#D97706' : '#CBD5E1'}
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>

        {/* Hint Earned Badge */}
        {earnedCount > 0 && (
          <div
            data-testid="hint-reward-badge"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-900 font-extrabold text-xs mb-3 shadow-xs animate-bounce"
          >
            <Lightbulb size={15} className="fill-amber-500 text-amber-600 shrink-0" />
            <span>+{earnedCount} 💡 Hint{earnedCount > 1 ? 's' : ''} Earned!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-1">
          <button
            onClick={() => {
              sound.playTilePickup();
              onNextLevel();
            }}
            data-testid="celebration-next-button"
            className="tactile-button w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-lg flex items-center justify-center gap-2 border-b-4 border-orange-700 active:border-b-0 cursor-pointer shadow-md"
          >
            <span>Next</span>
            <ArrowRight size={20} strokeWidth={3} />
          </button>

          <div className="flex items-center gap-2.5 w-full">
            <button
              onClick={() => {
                sound.playTilePickup();
                onReplayLevel();
              }}
              data-testid="celebration-replay-button"
              className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs border border-stone-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                sound.playTilePickup();
                onOpenLevelGrid();
              }}
              data-testid="celebration-grid-button"
              className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs border border-stone-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Grid size={14} />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
