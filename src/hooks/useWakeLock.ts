import { useEffect, useRef, useCallback, useState } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.error('Wake Lock error:', err);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // 페이지 visibility 변경 시 재요청
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, requestWakeLock]);

  return {
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
}
