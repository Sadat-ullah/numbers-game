import { useState, useEffect } from 'react';
import { ALL_LEVELS } from './game/levels/data';
import { Header } from './components/Header';
import { FloatingGeometrics } from './components/FloatingGeometrics';
import { HomeScreen } from './components/HomeScreen';
import { ChapterGridScreen } from './components/ChapterGridScreen';
import { EquationBoard } from './components/EquationBoard';
import { CelebrationModal } from './components/CelebrationModal';
import { sound } from './game/audio/soundEngine';

type AppScreen = 'home' | 'grid' | 'play';

export function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    const saved = localStorage.getItem('nb_current_level');
    return saved ? Math.min(100, Math.max(1, parseInt(saved, 10))) : 1;
  });

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('nb_unlocked_level');
    return saved ? Math.min(100, Math.max(1, parseInt(saved, 10))) : 1;
  });

  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('nb_level_stars');
    return saved ? JSON.parse(saved) : {};
  });

  // Persistent Hint Economy (Fix 2: Starts with 3 free hints)
  const [hintBalance, setHintBalance] = useState<number>(() => {
    const saved = localStorage.getItem('nb_hint_balance');
    return saved ? Math.max(0, parseInt(saved, 10)) : 3;
  });

  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState(3);
  const [hintEarnedThisLevel, setHintEarnedThisLevel] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nb_current_level', String(currentLevelId));
  }, [currentLevelId]);

  useEffect(() => {
    localStorage.setItem('nb_unlocked_level', String(maxUnlockedLevel));
  }, [maxUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('nb_level_stars', JSON.stringify(levelStars));
  }, [levelStars]);

  useEffect(() => {
    localStorage.setItem('nb_hint_balance', String(hintBalance));
  }, [hintBalance]);

  const activeLevel = ALL_LEVELS.find(l => l.id === currentLevelId) || ALL_LEVELS[0];
  const totalStars = Object.values(levelStars).reduce((acc, curr) => acc + curr, 0);

  const handleUseHint = () => {
    setHintBalance(prev => Math.max(0, prev - 1));
  };

  const handleLevelCompleted = (stars: number) => {
    setCelebrationStars(stars);

    // Earning Hints: Reward +1 Hint every 3-star clear or milestone
    const earnedHint = stars === 3 || currentLevelId % 3 === 0;
    if (earnedHint) {
      setHintBalance(prev => prev + 1);
      setHintEarnedThisLevel(true);
    } else {
      setHintEarnedThisLevel(false);
    }

    setIsCelebrationOpen(true);

    // Save star rating (keep best)
    setLevelStars(prev => ({
      ...prev,
      [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
    }));

    // Unlock next level
    if (currentLevelId < 100) {
      setMaxUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    setHintEarnedThisLevel(false);
    if (currentLevelId < 100) {
      setCurrentLevelId(prev => prev + 1);
    } else {
      setScreen('grid');
    }
  };

  const handleReplayLevel = () => {
    setIsCelebrationOpen(false);
    setHintEarnedThisLevel(false);
  };

  const handleStartGame = () => {
    sound.unlockAudio();
    setScreen('play');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col relative overflow-x-hidden">
      {/* Dynamic Geometric Backdrop */}
      <FloatingGeometrics />

      {/* Header bar (on play and grid screens) */}
      {screen !== 'home' && (
        <Header
          currentLevelId={screen === 'play' ? currentLevelId : undefined}
          worldTitle={screen === 'play' ? activeLevel.worldTitle : undefined}
          onGoHome={() => setScreen('home')}
          onOpenLevelGrid={screen === 'play' ? () => setScreen('grid') : undefined}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col relative z-10">
        {screen === 'home' && (
          <HomeScreen
            currentLevelId={currentLevelId}
            maxUnlockedLevel={maxUnlockedLevel}
            totalStars={totalStars}
            onStartGame={handleStartGame}
            onOpenLevelGrid={() => setScreen('grid')}
          />
        )}

        {screen === 'grid' && (
          <ChapterGridScreen
            maxUnlockedLevel={maxUnlockedLevel}
            levelStars={levelStars}
            onSelectLevel={id => {
              setCurrentLevelId(id);
              setScreen('play');
            }}
            onBackToHome={() => setScreen('home')}
          />
        )}

        {screen === 'play' && (
          <EquationBoard
            key={currentLevelId}
            level={activeLevel}
            hintBalance={hintBalance}
            onUseHint={handleUseHint}
            onLevelCompleted={handleLevelCompleted}
            onOpenLevelGrid={() => setScreen('grid')}
          />
        )}
      </main>

      {/* Celebration Win Modal (with key reset) */}
      {isCelebrationOpen && (
        <CelebrationModal
          key={`celeb-${currentLevelId}`}
          levelId={currentLevelId}
          stars={celebrationStars}
          hintEarned={hintEarnedThisLevel}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onOpenLevelGrid={() => {
            setIsCelebrationOpen(false);
            setScreen('grid');
          }}
        />
      )}
    </div>
  );
}

export default App;
