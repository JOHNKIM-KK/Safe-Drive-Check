import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function useHaptic() {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!hapticEnabled) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [hapticEnabled]);

  const light = useCallback(() => vibrate(10), [vibrate]);
  const medium = useCallback(() => vibrate(20), [vibrate]);
  const heavy = useCallback(() => vibrate(40), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([30, 100, 30]), [vibrate]);
  const warning = useCallback(() => vibrate([20, 80, 20]), [vibrate]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
    warning,
  };
}
