import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestScores, GameName, BaselineStats } from '@/types';
import { db, saveTestRecord, updateBaselineStats, getBaselineStats } from '@/lib/db';
import { calculateAverageScore, calculatePercentile } from '@/lib/calculations';

interface TestState {
  // 현재 진행 중인 테스트
  testType: 'baseline' | 'current' | null;
  currentGameIndex: number;
  scores: Partial<TestScores>;
  testTag: string;
  
  // 기준치 통계
  baselineStats: BaselineStats | null;
  
  // 측정 횟수
  totalMeasurements: number;
  
  // 액션
  startTest: (type: 'baseline' | 'current', tag?: string) => void;
  recordGameScore: (gameName: GameName, score: number) => void;
  nextGame: () => void;
  completeTest: () => Promise<void>;
  resetTest: () => void;
  loadBaselineStats: () => Promise<void>;
  incrementMeasurements: () => void;
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      testType: null,
      currentGameIndex: 0,
      scores: {},
      testTag: '평소',
      baselineStats: null,
      totalMeasurements: 0,

      startTest: (type, tag = '평소') => {
        set({
          testType: type,
          currentGameIndex: 0,
          scores: {},
          testTag: tag,
        });
      },

      recordGameScore: (gameName, score) => {
        set((state) => ({
          scores: {
            ...state.scores,
            [gameName]: score,
          },
        }));
      },

      nextGame: () => {
        set((state) => ({
          currentGameIndex: state.currentGameIndex + 1,
        }));
      },

      completeTest: async () => {
        const { testType, scores, testTag } = get();
        
        if (!testType || Object.keys(scores).length < 5) {
          console.error('Test incomplete');
          return;
        }

        const fullScores = scores as TestScores;
        const averageScore = calculateAverageScore(fullScores);
        const percentile = calculatePercentile(averageScore);

        await saveTestRecord({
          timestamp: Date.now(),
          type: testType,
          testTag,
          scores: fullScores,
          averageScore,
          percentile,
        });

        // 평소 측정이면 기준치 업데이트
        if (testType === 'baseline') {
          await updateBaselineStats();
        }

        // 기준치 다시 로드
        const stats = await getBaselineStats();
        const count = await db.testRecords.count();
        
        set({
          baselineStats: stats,
          totalMeasurements: count,
        });
      },

      resetTest: () => {
        set({
          testType: null,
          currentGameIndex: 0,
          scores: {},
          testTag: '평소',
        });
      },

      loadBaselineStats: async () => {
        const stats = await getBaselineStats();
        const count = await db.testRecords.count();
        set({
          baselineStats: stats,
          totalMeasurements: count,
        });
      },

      incrementMeasurements: () => {
        set((state) => ({
          totalMeasurements: state.totalMeasurements + 1,
        }));
      },
    }),
    {
      name: 'safe-drive-test',
      partialize: (state) => ({
        totalMeasurements: state.totalMeasurements,
      }),
    }
  )
);
