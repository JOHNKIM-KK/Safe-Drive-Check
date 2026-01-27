import { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestStore } from '@/stores/testStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { GAME_CONFIGS, LEGAL_DISCLAIMER } from '@/lib/constants';
import { GAME_COMPONENTS, GAME_ORDER } from '@/games';
import type { GameName } from '@/types';
import { Button } from '@/components/ui/Button';

export default function CurrentTestScreen() {
  const navigate = useNavigate();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const {
    testType,
    currentGameIndex,
    baselineStats,
    startTest,
    recordGameScore,
    nextGame,
    completeTest,
    resetTest,
  } = useTestStore();

  // 기준치 없으면 평소 측정으로 안내
  useEffect(() => {
    if (!baselineStats) {
      navigate('/baseline-required');
    }
  }, [baselineStats, navigate]);

  // 테스트 시작
  useEffect(() => {
    if (!testType && !showDisclaimer) {
      startTest('current', '현재 상태');
      requestWakeLock();
    }
    
    return () => {
      releaseWakeLock();
    };
  }, [testType, showDisclaimer, startTest, requestWakeLock, releaseWakeLock]);

  const handleAgree = () => {
    setShowDisclaimer(false);
  };

  // 게임 완료 핸들러
  const handleGameComplete = async (score: number) => {
    const gameName = GAME_ORDER[currentGameIndex] as GameName;
    recordGameScore(gameName, score);

    if (currentGameIndex >= GAME_ORDER.length - 1) {
      await completeTest();
      navigate('/result', { state: { type: 'current' } });
    } else {
      nextGame();
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    resetTest();
    navigate('/');
  };

  // 면책 조항 화면
  if (showDisclaimer) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col safe-area-top safe-area-bottom p-4">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <span className="text-6xl">⚠️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            측정 전 확인사항
          </h1>

          <div className="bg-neutral-900 rounded-2xl p-4 mb-6">
            <pre className="text-neutral-400 text-sm whitespace-pre-wrap font-sans">
              {LEGAL_DISCLAIMER}
            </pre>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-neutral-300">
              음주 후에는 측정 결과와 무관하게 절대 운전하지 않겠습니다
            </span>
          </label>

          <div className="space-y-3">
            <Button
              onClick={handleAgree}
              disabled={!agreed}
              size="xl"
              className="w-full"
            >
              확인하고 측정 시작
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 현재 게임
  const currentGameName = GAME_ORDER[currentGameIndex];
  const CurrentGameComponent = GAME_COMPONENTS[currentGameName];
  const currentConfig = GAME_CONFIGS.find((c) => c.name === currentGameName);

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
          <span className="text-amber-400 font-semibold">현재 상태</span>
          <span className="text-neutral-500">
            {currentGameIndex + 1}/{GAME_ORDER.length}
          </span>
        </div>
        <div className="w-12" />
      </div>

      {/* 진행 바 */}
      <div className="px-4 mb-4">
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
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
    </div>
  );
}
