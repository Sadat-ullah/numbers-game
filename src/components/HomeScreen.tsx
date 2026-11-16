import React from 'react';
import { Play, Grid, Sparkles, Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';

interface HomeScreenProps {
  currentLevelId: number;
  maxUnlockedLevel: number;
  totalStars: number;
  onStartGame: () => void;
  onOpenLevelGrid: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLevelId,
  maxUnlockedLevel,
  totalStars,
  onStartGame,
  onOpenLevelGrid,
}) => {
  const [musicMuted, setMusicMuted] = React.useState(sound.musicMuted);
  const [sfxMuted, setSfxMuted] = React.useState(sound.sfxMuted);

  const toggleMusic = () => {
    const next = !musicMuted;
    setMusicMuted(next);
    sound.setMusicMuted(next);
    if (!next) sound.startStudioMusic();
  };

  const toggleSfx = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    sound.setSfxMuted(next);
    if (!next) sound.playTilePickup();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[calc(100vh-68px)] max-w-4xl mx-auto px-4 py-8 text-center select-none">
      {/* Top audio bar */}
      <div className="w-full flex items-center justify-end gap-2">
        <button
          onClick={toggleMusic}
          className={`p-2.5 rounded-xl border flex items-center justify-center shadow-xs transition-all ${
            musicMuted
              ? 'bg-stone-200/80 border-stone-300 text-stone-400'
              : 'bg-amber-50 border-amber-300/80 text-amber-700'
          }`}
          title={musicMuted ? "Unmute Music" : "Mute Music"}
        >
          <Music size={18} />
        </button>

        <button
          onClick={toggleSfx}
          className={`p-2.5 rounded-xl border flex items-center justify-center shadow-xs transition-all ${
            sfxMuted
              ? 'bg-stone-200/80 border-stone-300 text-stone-400'
              : 'bg-teal-50 border-teal-300/80 text-teal-700'
          }`}
          title={sfxMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {sfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Main Logo & Title Hero */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative mb-4 group cursor-pointer" onClick={() => sound.playTileSnap()}>
          {/* Logo with clean drop shadow */}
          <img
            src="/assets/logo_number_builder.png"
            alt="Number Builder"
            className="w-80 sm:w-96 max-w-full h-auto drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-stone-200 shadow-xs mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-xs sm:text-sm font-bold text-stone-700 tracking-wide">
            Tactile Geometric Math Puzzle • Ages 3–12
          </span>
        </div>

        <p className="text-stone-500 max-w-md text-sm sm:text-base font-medium leading-relaxed px-4">
          Snap magnetic wooden blocks to balance equations, discover arithmetic patterns, and conquer all 10 worlds!
        </p>

        {/* Player Stats Chips */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
            <span className="text-xl">⭐</span>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-600 uppercase">Stars</div>
              <div className="text-base font-extrabold text-amber-900 leading-none">{totalStars}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200 shadow-xs">
            <span className="text-xl">🗺️</span>
            <div className="text-left">
              <div className="text-[10px] font-bold text-teal-600 uppercase">Progress</div>
              <div className="text-base font-extrabold text-teal-900 leading-none">{maxUnlockedLevel}/100</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md">
          <button
            onClick={() => {
              sound.playTilePickup();
              sound.startStudioMusic();
              onStartGame();
            }}
            className="tactile-button w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center gap-2 border-b-4 border-orange-700 active:border-b-0 cursor-pointer shadow-lg hover:brightness-105"
          >
            <Play size={22} className="fill-white" />
            <span>Play Level {currentLevelId}</span>
          </button>

          <button
            onClick={() => {
              sound.playTilePickup();
              onOpenLevelGrid();
            }}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-extrabold text-base border-2 border-stone-200 flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <Grid size={20} />
            <span>100 Levels</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-xs text-stone-400 font-medium py-2">
        Warm Pastel Studio • Lo-fi Kalimba & Tactile Physics
      </footer>
    </div>
  );
};
