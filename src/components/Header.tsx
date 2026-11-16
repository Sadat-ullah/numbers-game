import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Home, Grid } from 'lucide-react';
import { sound } from '../game/audio/soundEngine';

interface HeaderProps {
  currentLevelId?: number;
  worldTitle?: string;
  onGoHome?: () => void;
  onOpenLevelGrid?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevelId,
  worldTitle,
  onGoHome,
  onOpenLevelGrid,
}) => {
  const [musicMuted, setMusicMuted] = useState(sound.musicMuted);
  const [sfxMuted, setSfxMuted] = useState(sound.sfxMuted);

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
    <header className="relative z-20 flex items-center justify-between px-4 py-3 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-stone-200/60 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3">
        {onGoHome && (
          <button
            onClick={() => {
              sound.playTilePickup();
              onGoHome();
            }}
            title="Return to Home"
            className="w-10 h-10 rounded-xl bg-white border border-stone-300/80 flex items-center justify-center text-stone-700 shadow-sm active:scale-95 transition-all hover:bg-stone-50"
          >
            <Home size={20} />
          </button>
        )}

        {onOpenLevelGrid && (
          <button
            onClick={() => {
              sound.playTilePickup();
              onOpenLevelGrid();
            }}
            title="Chapter Grid (100 Levels)"
            className="w-10 h-10 rounded-xl bg-white border border-stone-300/80 flex items-center justify-center text-stone-700 shadow-sm active:scale-95 transition-all hover:bg-stone-50"
          >
            <Grid size={20} />
          </button>
        )}

        {currentLevelId !== undefined && (
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {worldTitle || `Level ${currentLevelId}`}
            </span>
            <span className="text-lg font-bold text-stone-800 leading-tight">
              Level {currentLevelId} <span className="text-stone-400 font-normal text-sm">/ 100</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleMusic}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm active:scale-95 transition-all ${
            musicMuted
              ? 'bg-stone-200/80 border-stone-300 text-stone-400'
              : 'bg-amber-50 border-amber-300/80 text-amber-700'
          }`}
          title={musicMuted ? "Unmute Music" : "Mute Music"}
        >
          <Music size={19} />
        </button>

        <button
          onClick={toggleSfx}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm active:scale-95 transition-all ${
            sfxMuted
              ? 'bg-stone-200/80 border-stone-300 text-stone-400'
              : 'bg-teal-50 border-teal-300/80 text-teal-700'
          }`}
          title={sfxMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
        >
          {sfxMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
      </div>
    </header>
  );
};
