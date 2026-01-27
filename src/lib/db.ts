import Dexie, { type Table } from 'dexie';
import type { TestRecord, BaselineStats, Settings } from '@/types';

class SafeDriveDB extends Dexie {
  testRecords!: Table<TestRecord>;
  baselineStats!: Table<BaselineStats>;
  settings!: Table<Settings>;

  constructor() {
    super('SafeDriveDB');
    this.version(1).stores({
      testRecords: '++id, timestamp, type',
      baselineStats: 'id',
      settings: 'id'
    });
  }
}

export const db = new SafeDriveDB();

// 기본 설정 초기화
export async function initializeSettings(): Promise<Settings> {
  const existingSettings = await db.settings.get('app-settings');
  
  if (!existingSettings) {
    const defaultSettings: Settings = {
      id: 'app-settings',
      hapticEnabled: true,
      soundEnabled: true,
      onboardingCompleted: false,
    };
    await db.settings.put(defaultSettings);
    return defaultSettings;
  }
  
  return existingSettings;
}

// 테스트 기록 저장
export async function saveTestRecord(record: Omit<TestRecord, 'id'>): Promise<number> {
  return await db.testRecords.add(record as TestRecord);
}

// 평소 기록 가져오기 (최근 10개)
export async function getBaselineRecords(limit = 10): Promise<TestRecord[]> {
  return await db.testRecords
    .where('type')
    .equals('baseline')
    .reverse()
    .limit(limit)
    .toArray();
}

// 기준치 통계 업데이트
export async function updateBaselineStats(): Promise<BaselineStats | null> {
  const baselineRecords = await getBaselineRecords(10);
  
  if (baselineRecords.length === 0) {
    return null;
  }

  const calculateStats = (values: number[]) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    return {
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const stats: BaselineStats = {
    id: 'current',
    reactionTime: calculateStats(baselineRecords.map(r => r.scores.reactionTime)),
    peripheralVision: calculateStats(baselineRecords.map(r => r.scores.peripheralVision)),
    concentration: calculateStats(baselineRecords.map(r => r.scores.concentration)),
    judgment: calculateStats(baselineRecords.map(r => r.scores.judgment)),
    coordination: calculateStats(baselineRecords.map(r => r.scores.coordination)),
    measurementCount: baselineRecords.length,
    lastUpdated: Date.now(),
  };

  await db.baselineStats.put(stats);
  return stats;
}

// 기준치 통계 가져오기
export async function getBaselineStats(): Promise<BaselineStats | null> {
  return (await db.baselineStats.get('current')) || null;
}

// 전체 기록 개수
export async function getTotalRecordCount(): Promise<number> {
  return await db.testRecords.count();
}

// 모든 기록 가져오기 (페이지네이션)
export async function getAllRecords(offset = 0, limit = 20): Promise<TestRecord[]> {
  return await db.testRecords
    .orderBy('timestamp')
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

// 기록 삭제
export async function deleteRecord(id: number): Promise<void> {
  await db.testRecords.delete(id);
  await updateBaselineStats();
}

// 모든 데이터 초기화
export async function resetAllData(): Promise<void> {
  await db.testRecords.clear();
  await db.baselineStats.clear();
  const settings = await db.settings.get('app-settings');
  if (settings) {
    await db.settings.put({
      ...settings,
      onboardingCompleted: false,
    });
  }
}
