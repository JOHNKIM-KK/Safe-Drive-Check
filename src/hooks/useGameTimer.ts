import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGameTimerProps {
  duration: number; // seconds
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useGameTimer({ duration, onComplete, autoStart = false }: UseGameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return {
    timeLeft,
    isRunning,
    isCompleted,
    progress,
    start,
    pause,
    reset,
  };
}
