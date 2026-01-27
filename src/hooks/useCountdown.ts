import { useState, useEffect, useCallback } from 'react';

interface UseCountdownProps {
  from?: number;
  onComplete?: () => void;
}

export function useCountdown({ from = 3, onComplete }: UseCountdownProps = {}) {
  const [count, setCount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => {
    setCount(from);
    setIsActive(true);
  }, [from]);

  const reset = useCallback(() => {
    setCount(null);
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (!isActive || count === null) return;

    if (count === 0) {
      setIsActive(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isActive, onComplete]);

  return {
    count,
    isActive,
    start,
    reset,
  };
}
