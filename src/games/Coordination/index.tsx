import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { useGameTimer } from '@/hooks/useGameTimer';

type Direction = 'left' | 'right';

export default function Coordination({ onComplete }: GameProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<Direction>('left');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const lastDirectionRef = useRef<Direction>('right');
  const { light, error, success } = useHaptic();

  const gameDuration = 20;

  const handleComplete = useCallback(() => {
    setTimeout(() => {
      onComplete(score);
    }, 1000);
  }, [score, onComplete]);

  const { timeLeft, start } = useGameTimer({
    duration: gameDuration,
    onComplete: handleComplete,
  });

  const generateNextDirection = useCallback((): Direction => {
    // 번갈아가며 지시 (같은 방향 연속 최소화)
    const opposite = lastDirectionRef.current === 'left' ? 'right' : 'left';
    lastDirectionRef.current = opposite;
    return opposite;
  }, []);

  const handleTap = useCallback((tapped: Direction) => {
    if (feedback) return;

    if (tapped === currentDirection) {
      setScore((s) => s + 1);
      setCombo((c) => {
        const newCombo = c + 1;
        setMaxCombo((m) => Math.max(m, newCombo));
        return newCombo;
      });
      setFeedback('correct');
      light();
    } else {
      setCombo(0);
      setFeedback('wrong');
      error();
    }

    // 빠른 피드백 후 다음 지시
    setTimeout(() => {
      setFeedback(null);
      setCurrentDirection(generateNextDirection());
    }, 150);
  }, [currentDirection, feedback, light, error, generateNextDirection]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    setCurrentDirection(generateNextDirection());
    start();
  }, [start, generateNextDirection]);

  useEffect(() => {
    if (timeLeft === 0 && isStarted) {
      success();
    }
  }, [timeLeft, isStarted, success]);

  if (!isStarted) {
    return (
      <motion.div
        className="game-container flex flex-col items-center justify-center min-h-[400px] bg-neutral-800 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-6">🎮</div>
        <h2 className="text-2xl font-bold text-white mb-2">협응력 테스트</h2>
        <p className="text-neutral-400 text-center mb-6 px-6">
          화살표 방향에 맞춰<br />좌우 버튼을 빠르게 터치하세요
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
        <div className="flex gap-2">
          <div className="bg-neutral-800 px-4 py-2 rounded-full">
            <span className="text-emerald-400 font-bold">{score}</span>
            <span className="text-neutral-400 ml-1">회</span>
          </div>
          {combo > 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-amber-500/20 px-3 py-2 rounded-full"
            >
              <span className="text-amber-400 font-bold">{combo}x</span>
            </motion.div>
          )}
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
        />
      </div>

      {/* 지시 화살표 */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {timeLeft > 0 ? (
            <motion.div
              key={`${currentDirection}-${score}`}
              initial={{ scale: 0.5, opacity: 0, rotate: currentDirection === 'left' ? -90 : 90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`text-9xl ${
                feedback === 'correct' ? 'text-emerald-400' :
                feedback === 'wrong' ? 'text-red-400' : ''
              }`}
            >
              {currentDirection === 'left' ? '⬅️' : '➡️'}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎮</div>
              <div className="text-3xl font-bold text-white mb-2">{score}회</div>
              <p className="text-neutral-400">최대 콤보: {maxCombo}x</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 선택 버튼 */}
      {timeLeft > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTap('left')}
            className={`py-8 rounded-2xl font-bold text-2xl transition-all ${
              feedback === 'correct' && currentDirection === 'left'
                ? 'bg-emerald-500 scale-105'
                : feedback === 'wrong' && currentDirection !== 'left'
                ? 'bg-red-500'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700'
            }`}
          >
            ⬅️
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTap('right')}
            className={`py-8 rounded-2xl font-bold text-2xl transition-all ${
              feedback === 'correct' && currentDirection === 'right'
                ? 'bg-emerald-500 scale-105'
                : feedback === 'wrong' && currentDirection !== 'right'
                ? 'bg-red-500'
                : 'bg-gradient-to-br from-purple-500 to-purple-600 active:from-purple-600 active:to-purple-700'
            }`}
          >
            ➡️
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
