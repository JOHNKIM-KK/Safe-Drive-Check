import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { useGameTimer } from '@/hooks/useGameTimer';

interface Position {
  x: number;
  y: number;
}

export default function Concentration({ onComplete }: GameProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [ballPosition, setBallPosition] = useState<Position>({ x: 50, y: 50 });
  const [fingerPosition, setFingerPosition] = useState<Position | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const { success } = useHaptic();

  const gameDuration = 10;

  const calculateAccuracy = useCallback(() => {
    if (sampleCount === 0) return 0;
    // 평균 거리를 정확도로 변환 (거리가 작을수록 정확도 높음)
    const avgDistance = totalDistance / sampleCount;
    // 최대 거리를 100px로 가정, 0px = 100%, 100px+ = 0%
    const accuracy = Math.max(0, Math.min(100, 100 - avgDistance));
    return Math.round(accuracy);
  }, [totalDistance, sampleCount]);

  const handleComplete = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const accuracy = calculateAccuracy();
    setTimeout(() => {
      onComplete(accuracy);
    }, 1000);
  }, [calculateAccuracy, onComplete]);

  const { timeLeft, start } = useGameTimer({
    duration: gameDuration,
    onComplete: handleComplete,
  });

  // 공의 움직임 애니메이션 (sin 파형)
  function animateBall() {
    timeRef.current += 0.02;
    const t = timeRef.current;
    
    // Lissajous 곡선을 사용한 부드러운 움직임
    const x = 50 + 30 * Math.sin(t * 1.5);
    const y = 50 + 30 * Math.sin(t * 2.3 + Math.PI / 4);
    
    setBallPosition({ x, y });
    animationRef.current = requestAnimationFrame(animateBall);
  }

  const handleStart = () => {
    setIsStarted(true);
    start();
    animateBall();
  };

  // 터치/마우스 이동 처리
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !isStarted) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setFingerPosition({ x, y });

    // 공과의 거리 계산
    const distance = Math.sqrt(
      Math.pow(x - ballPosition.x, 2) + Math.pow(y - ballPosition.y, 2)
    );
    
    setTotalDistance((prev) => prev + distance);
    setSampleCount((prev) => prev + 1);
  }, [isStarted, ballPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
        <div className="text-6xl mb-6">🎯</div>
        <h2 className="text-2xl font-bold text-white mb-2">집중력 테스트</h2>
        <p className="text-neutral-400 text-center mb-6 px-6">
          움직이는 공을 손가락으로<br />계속 따라가세요
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

  const currentAccuracy = calculateAccuracy();

  return (
    <motion.div
      className="game-container flex flex-col min-h-[400px] bg-neutral-900 rounded-3xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-neutral-800 px-4 py-2 rounded-full">
          <span className="text-emerald-400 font-bold">{currentAccuracy}%</span>
          <span className="text-neutral-400 ml-1">정확도</span>
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

      {/* 게임 영역 */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-neutral-800 rounded-2xl overflow-hidden touch-none"
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
      >
        {/* 공 */}
        <motion.div
          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg shadow-orange-500/50" />
        </motion.div>

        {/* 손가락 위치 */}
        {fingerPosition && (
          <motion.div
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${fingerPosition.x}%`,
              top: `${fingerPosition.y}%`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="w-full h-full bg-white/30 rounded-full border-2 border-white/50" />
          </motion.div>
        )}

        {/* 안내 텍스트 */}
        {!fingerPosition && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-neutral-500 text-lg">화면을 터치하고 공을 따라가세요</p>
          </div>
        )}
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
            <div className="text-3xl font-bold text-white mb-2">{currentAccuracy}%</div>
            <p className="text-neutral-400">집중력 정확도</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
