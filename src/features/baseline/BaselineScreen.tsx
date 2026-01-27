import { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestStore } from '@/stores/testStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { GAME_CONFIGS } from '@/lib/constants';
import { GAME_COMPONENTS, GAME_ORDER } from '@/games';
import type { GameName } from '@/types';

export default function BaselineScreen() {
  const navigate = useNavigate();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  
  const {
    testType,
    currentGameIndex,
    scores,
    startTest,
    recordGameScore,
    nextGame,
    completeTest,
    resetTest,
  } = useTestStore();

  // 테스트 시작
  useEffect(() => {
    if (!testType) {
      startTest('baseline', '평소');
    }
    requestWakeLock();
    
    return () => {
      releaseWakeLock();
    };
  }, [testType, startTest, requestWakeLock, releaseWakeLock]);

  // 게임 완료 핸들러
  const handleGameComplete = async (score: number) => {
    const gameName = GAME_ORDER[currentGameIndex] as GameName;
    recordGameScore(gameName, score);

    if (currentGameIndex >= GAME_ORDER.length - 1) {
      // 모든 게임 완료
      await completeTest();
      navigate('/result', { state: { type: 'baseline' } });
    } else {
      nextGame();
    }
  };

  // 현재 게임
  const currentGameName = GAME_ORDER[currentGameIndex];
  const CurrentGameComponent = GAME_COMPONENTS[currentGameName];
  const currentConfig = GAME_CONFIGS.find((c) => c.name === currentGameName);

  // 취소 핸들러
  const handleCancel = () => {
    resetTest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ✕ 취소
        </button>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">평소 기록</span>
          <span className="text-neutral-500">
            {currentGameIndex + 1}/{GAME_ORDER.length}
          </span>
        </div>
        <div className="w-12" /> {/* 균형용 */}
      </div>

      {/* 진행 바 */}
      <div className="px-4 mb-4">
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentGameIndex) / GAME_ORDER.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 게임 정보 */}
      {currentConfig && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{currentConfig.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{currentConfig.title}</h2>
              <p className="text-neutral-400 text-sm">{currentConfig.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 게임 영역 */}
      <div className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGameName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-neutral-400">로딩 중...</p>
                  </div>
                </div>
              }
            >
              <CurrentGameComponent onComplete={handleGameComplete} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 완료된 게임 점수 */}
      {Object.keys(scores).length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {GAME_ORDER.slice(0, currentGameIndex).map((name) => {
              const config = GAME_CONFIGS.find((c) => c.name === name);
              const score = scores[name as keyof typeof scores];
              return (
                <div
                  key={name}
                  className="flex-shrink-0 bg-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>{config?.icon}</span>
                  <span className="text-emerald-400 font-medium">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
