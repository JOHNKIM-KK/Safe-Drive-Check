import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { randomBetween } from '@/lib/utils';

type GameState = 'waiting' | 'ready' | 'go' | 'tooEarly' | 'result';

export default function ReactionTime({ onComplete }: GameProps) {
  const [state, setState] = useState<GameState>('waiting');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const { light, error, success } = useHaptic();

  const totalRounds = 3;

  const startRound = useCallback(() => {
    setState('ready');
    
    // 2~4초 후 초록색으로 전환
    const delay = randomBetween(2000, 4000);
    timerRef.current = window.setTimeout(() => {
      setState('go');
      startTimeRef.current = performance.now();
      light();
    }, delay);
  }, [light]);

  const handleTap = useCallback(() => {
    if (state === 'waiting') {
      startRound();
      return;
    }

    if (state === 'ready') {
      // 너무 일찍 터치
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setState('tooEarly');
      error();
      
      // 1.5초 후 다시 시작
      setTimeout(() => {
        startRound();
      }, 1500);
      return;
    }

    if (state === 'go') {
      const reactionTime = performance.now() - startTimeRef.current;
      setCurrentTime(Math.round(reactionTime));
      setTimes((prev) => [...prev, reactionTime]);
      success();

      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= totalRounds) {
        setState('result');
      } else {
        setState('waiting');
      }
    }

    if (state === 'tooEarly') {
      return;
    }
  }, [state, round, startRound, error, success]);

  // 결과 계산 및 완료 처리
  useEffect(() => {
    if (state === 'result' && times.length === totalRounds) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      
      // 잠시 후 완료 콜백 호출
      const timer = setTimeout(() => {
        onComplete(avgTime);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state, times, onComplete]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getBackgroundColor = () => {
    switch (state) {
      case 'ready':
        return 'bg-red-500';
      case 'go':
        return 'bg-emerald-500';
      case 'tooEarly':
        return 'bg-amber-500';
      default:
        return 'bg-neutral-800';
    }
  };

  const getMessage = () => {
    switch (state) {
      case 'waiting':
        return currentTime !== null
          ? `${currentTime}ms! 다음 라운드 시작하려면 터치`
          : '화면을 터치하여 시작';
      case 'ready':
        return '초록색이 되면 터치하세요...';
      case 'go':
        return '지금 터치!';
      case 'tooEarly':
        return '너무 빨랐어요! 기다리세요...';
      case 'result':
        return `평균 반응속도: ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`game-container flex flex-col items-center justify-center min-h-[400px] rounded-3xl transition-colors duration-200 ${getBackgroundColor()}`}
      onClick={handleTap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 라운드 표시 */}
      <div className="absolute top-4 left-4 bg-black/20 px-3 py-1 rounded-full">
        <span className="text-white font-medium">
          {round}/{totalRounds}
        </span>
      </div>

      {/* 메인 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="text-center"
        >
          {state === 'go' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-8xl mb-4"
            >
              👆
            </motion.div>
          )}
          
          {state === 'ready' && (
            <div className="text-6xl mb-4">🔴</div>
          )}
          
          {state === 'tooEarly' && (
            <div className="text-6xl mb-4">⚠️</div>
          )}

          {state === 'result' && (
            <div className="text-6xl mb-4">⚡</div>
          )}

          <p className="text-white text-xl font-semibold px-6">
            {getMessage()}
          </p>

          {/* 이전 기록 표시 */}
          {times.length > 0 && state !== 'result' && (
            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              {times.map((time, idx) => (
                <span
                  key={idx}
                  className="bg-black/20 px-2 py-1 rounded text-sm text-white/80"
                >
                  {Math.round(time)}ms
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
