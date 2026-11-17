import React from 'react';
import { Play, Grid, Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';
import { BuilderMascot } from './BuilderMascot';

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
  };

  const toggleSfx = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    sound.setSfxMuted(next);
    if (!next) sound.playTilePickup();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[100dvh] max-w-5xl mx-auto px-4 py-3 sm:py-6 text-center select-none">
      {/* Top audio bar */}
      <div className="w-full flex items-center justify-end gap-2">
        <button
          onClick={toggleMusic}
          data-testid="audio-music-toggle"
          className={`p-2.5 rounded-2xl border flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95 ${
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
          data-testid="audio-sfx-toggle"
          className={`p-2.5 rounded-2xl border flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95 ${
            sfxMuted
              ? 'bg-stone-200/80 border-stone-300 text-stone-400'
              : 'bg-teal-50 border-teal-300/80 text-teal-700'
          }`}
          title={sfxMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {sfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Main Hero Section with Logo & Interactive Mascot Pip */}
      <div className="flex flex-col items-center my-auto w-full max-w-3xl">
        <div className="relative mb-2 sm:mb-4 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
          {/* Main 3D Title Logo */}
          <div
            className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
            onClick={() => sound.playTileSnap()}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/logo_number_builder.png`}
              alt="Number Builder"
              data-testid="game-logo"
              style={{ width: 'clamp(250px, 58vw, 480px)' }}
              className="h-auto max-h-[30vh] sm:max-h-[34vh] drop-shadow-2xl object-contain animate-float-slow"
            />
          </div>

          {/* Interactive Workshop Mascot "Pip" */}
          <div className="flex items-center justify-center mt-2 md:mt-0">
            <BuilderMascot
              size="md"
              className="scale-90 sm:scale-100"
              speechBubbleText="Tap me to play! 🔨"
            />
          </div>
        </div>

        {/* Player Stats Chips */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-2.5 sm:my-4">
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-xs">
            <span className="text-xl">⭐</span>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-600 uppercase">Stars</div>
              <div className="text-base font-extrabold text-amber-900 leading-none">{totalStars}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-teal-50/90 border border-teal-200 shadow-xs">
            <span className="text-xl">🗺️</span>
            <div className="text-left">
              <div className="text-[10px] font-bold text-teal-600 uppercase">Levels</div>
              <div className="text-base font-extrabold text-teal-900 leading-none">{maxUnlockedLevel}/100</div>
            </div>
          </div>
        </div>

        {/* Action Buttons: START button with shimmer & pulse */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md px-2 mt-1 sm:mt-2">
          <button
            onClick={() => {
              sound.playTilePickup();
              sound.unlockAudio();
              onStartGame();
            }}
            data-testid="start-button"
            title={`Start Level ${currentLevelId}`}
            className="tactile-button relative overflow-hidden w-full sm:flex-1 py-3.5 sm:py-4 px-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-shimmer text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-3 border-b-4 border-orange-700 active:border-b-0 cursor-pointer shadow-xl transition-all active:scale-95"
          >
            <Play size={24} className="fill-white" />
            <span>START</span>
          </button>

          <button
            onClick={() => {
              sound.playTilePickup();
              onOpenLevelGrid();
            }}
            data-testid="levels-button"
            className="w-full sm:w-auto py-3.5 sm:py-4 px-6 rounded-3xl bg-white hover:bg-stone-50 text-stone-700 font-extrabold text-base border-2 border-stone-200 flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Grid size={20} />
            <span>100 Levels</span>
          </button>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
};