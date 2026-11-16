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

  const [rewardedMilestones, setRewardedMilestones] = useState<number[]>(() => {
    const saved = localStorage.getItem('nb_rewarded_milestones');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState(3);
  const [hintsEarnedThisLevel, setHintsEarnedThisLevel] = useState<number>(0);

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

  useEffect(() => {
    localStorage.setItem('nb_rewarded_milestones', JSON.stringify(rewardedMilestones));
  }, [rewardedMilestones]);

  const activeLevel = ALL_LEVELS.find(l => l.id === currentLevelId) || ALL_LEVELS[0];
  const totalStars = Object.values(levelStars).reduce((acc, curr) => acc + curr, 0);

  const handleUseHint = () => {
    setHintBalance(prev => Math.max(0, prev - 1));
  };

  const handleLevelCompleted = (stars: number) => {
    setCelebrationStars(stars);

    // Save star rating (keep best)
    const newLevelStars = {
      ...levelStars,
      [currentLevelId]: Math.max(levelStars[currentLevelId] || 0, stars),
    };
    setLevelStars(newLevelStars);

    // Earning Hints: On completion of 10 levels, 2 hints are added to user's hint balance
    const totalCompletedLevels = Object.keys(newLevelStars).length;
    const milestoneTarget = Math.floor(totalCompletedLevels / 10) * 10;

    let earned = 0;
    if (milestoneTarget >= 10 && !rewardedMilestones.includes(milestoneTarget)) {
      earned = 2;
      setHintBalance(prev => prev + 2);
      setRewardedMilestones(prev => [...prev, milestoneTarget]);
    }

    setHintsEarnedThisLevel(earned);
    setIsCelebrationOpen(true);

    // Unlock next level
    if (currentLevelId < 100) {
      setMaxUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    setHintsEarnedThisLevel(0);
    if (currentLevelId < 100) {
      setCurrentLevelId(prev => prev + 1);
    } else {
      setScreen('grid');
    }
  };

  const handleReplayLevel = () => {
    setIsCelebrationOpen(false);
    setHintsEarnedThisLevel(0);
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
          hintsEarned={hintsEarnedThisLevel}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onOpenLevelGrid={() => {
            setIsCelebrationOpen(false);
            setHintsEarnedThisLevel(0);
            setScreen('grid');
          }}
        />
      )}
    </div>
  );
}

export default App;
