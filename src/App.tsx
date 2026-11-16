import { useState, useEffect } from 'react';
import { ALL_LEVELS } from './game/levels/data';
import { Header } from './components/Header';
import { FloatingGeometrics } from './components/FloatingGeometrics';
import { HomeScreen } from './components/HomeScreen';
import { ChapterGridScreen } from './components/ChapterGridScreen';
import { EquationBoard } from './components/EquationBoard';
import { CelebrationModal } from './components/CelebrationModal';

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

  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState(3);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nb_current_level', String(currentLevelId));
  }, [currentLevelId]);

  useEffect(() => {
    localStorage.setItem('nb_unlocked_level', String(maxUnlockedLevel));
  }, [maxUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('nb_level_stars', JSON.stringify(levelStars));
  }, [levelStars]);

  const activeLevel = ALL_LEVELS.find(l => l.id === currentLevelId) || ALL_LEVELS[0];

  const totalStars = Object.values(levelStars).reduce((acc, curr) => acc + curr, 0);

  const handleLevelCompleted = (stars: number) => {
    setCelebrationStars(stars);
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
    if (currentLevelId < 100) {
      setCurrentLevelId(prev => prev + 1);
    } else {
      // Reached the end of Level 100!
      setScreen('grid');
    }
  };

  const handleReplayLevel = () => {
    setIsCelebrationOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col relative overflow-x-hidden">
      {/* Dynamic Geometric Backdrop */}
      <FloatingGeometrics />

      {/* Header bar (on play and grid screens) */}
      {screen !== 'home' && (
        <Header
          currentLevelId={screen === 'play' ? currentLevelId : undefined}
          worldTitle={screen === 'play' ? `World ${activeLevel.world}: ${activeLevel.worldTitle}` : undefined}
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
            onStartGame={() => setScreen('play')}
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
            level={activeLevel}
            onLevelCompleted={handleLevelCompleted}
            onOpenLevelGrid={() => setScreen('grid')}
          />
        )}
      </main>

      {/* Celebration Win Modal */}
      {isCelebrationOpen && (
        <CelebrationModal
          levelId={currentLevelId}
          stars={celebrationStars}
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
