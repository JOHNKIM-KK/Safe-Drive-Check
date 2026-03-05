import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { useGameTimer } from '@/hooks/useGameTimer';
import { randomBetween } from '@/lib/utils';

interface Target {
  id: number;
  row: number;
  col: number;
}

export default function PeripheralVision({ onComplete }: GameProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [, setMissedCount] = useState(0);
  const targetIdRef = useRef(0);
  const spawnIntervalRef = useRef<number | null>(null);
  const { light, success } = useHaptic();

  const gameDuration = 10;
  
  const handleComplete = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
    setTimeout(() => {
      onComplete(score);
    }, 1000);
  }, [score, onComplete]);

  const { timeLeft, isRunning, start } = useGameTimer({
    duration: gameDuration,
    onComplete: handleComplete,
  });

  const spawnTarget = useCallback(() => {
    const newTarget: Target = {
      id: targetIdRef.current++,
      row: randomBetween(0, 2),
      col: randomBetween(0, 2),
    };
    
    setTargets((prev) => [...prev, newTarget]);
    
    // 0.8초 후 자동 제거 (놓친 것)
    setTimeout(() => {
      setTargets((prev) => {
        const exists = prev.find((t) => t.id === newTarget.id);
        if (exists) {
          setMissedCount((m) => m + 1);
        }
        return prev.filter((t) => t.id !== newTarget.id);
      });
    }, 800);
  }, []);

  const handleTargetClick = useCallback((targetId: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    setScore((s) => s + 1);
    light();
  }, [light]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    start();
    
    // 0.5초마다 타겟 생성
    spawnIntervalRef.current = window.setInterval(() => {
      spawnTarget();
    }, 500);
  }, [start, spawnTarget]);

  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, []);

  // 게임 완료 시 결과 전달
  useEffect(() => {
    if (!isRunning && isStarted && timeLeft === 0) {
      success();
    }
  }, [isRunning, isStarted, timeLeft, success]);

  if (!isStarted) {
    return (
      <motion.div
        className="game-container flex flex-col items-center justify-center min-h-[400px] bg-neutral-800 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-6">👁️</div>
        <h2 className="text-2xl font-bold text-white mb-2">주변시야 인지 테스트</h2>
        <p className="text-neutral-400 text-center mb-6 px-6">
          화면 곳곳에 나타나는 원을<br />최대한 빠르게 터치하세요
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold"
        >
          시작하기
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="game-container flex flex-col min-h-[400px] bg-neutral-900 rounded-3xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-neutral-800 px-4 py-2 rounded-full">
          <span className="text-emerald-400 font-bold">{score}</span>
          <span className="text-neutral-400 ml-1">점</span>
        </div>
        <div className="bg-neutral-800 px-4 py-2 rounded-full">
          <span className="text-white font-bold">{timeLeft}</span>
          <span className="text-neutral-400 ml-1">초</span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-neutral-800 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / gameDuration) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 3x3 그리드 */}
      <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2">
        {Array.from({ length: 9 }).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const target = targets.find((t) => t.row === row && t.col === col);

          return (
            <div
              key={idx}
              className="relative bg-neutral-800 rounded-2xl flex items-center justify-center"
            >
              <AnimatePresence>
                {target && (
                  <motion.button
                    key={target.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => handleTargetClick(target.id)}
                    className="absolute inset-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 게임 종료 오버레이 */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 rounded-3xl flex flex-col items-center justify-center"
          >
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-3xl font-bold text-white mb-2">{score}개</div>
            <p className="text-neutral-400">터치 성공!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
