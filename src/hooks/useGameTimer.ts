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
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    hasCompletedRef.current = false;
    setTimeLeft(duration);
    setIsRunning(false);
    setIsCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setIsRunning(false);
            setIsCompleted(true);
            onCompleteRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

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
