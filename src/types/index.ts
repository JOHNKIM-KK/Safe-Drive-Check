// 테스트 결과 타입
export interface TestScores {
  reactionTime: number;      // ms (낮을수록 좋음)
  peripheralVision: number;  // 개수 (높을수록 좋음)
  concentration: number;     // 정확도 % (높을수록 좋음)
  judgment: number;          // 정답률 % (높을수록 좋음)
  coordination: number;      // 점수 (높을수록 좋음)
}

// 테스트 기록 타입
export interface TestRecord {
  id?: number;
  timestamp: number;
  type: 'baseline' | 'current';
  testTag?: string; // '평소', '음주 후', '피곤할 때'
  scores: TestScores;
  averageScore: number;
  percentile?: number;
}

// 기준치 통계 타입
export interface StatValue {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface BaselineStats {
  id: 'current';
  reactionTime: StatValue;
  peripheralVision: StatValue;
  concentration: StatValue;
  judgment: StatValue;
  coordination: StatValue;
  measurementCount: number;
  lastUpdated: number;
}

// 설정 타입
export interface Settings {
  id: 'app-settings';
  hapticEnabled: boolean;
  soundEnabled: boolean;
  onboardingCompleted: boolean;
}

// 게임 상태 타입
export type GameName = 'reactionTime' | 'peripheralVision' | 'concentration' | 'judgment' | 'coordination';

export interface GameConfig {
  name: GameName;
  title: string;
  description: string;
  duration: number; // seconds
  icon: string;
}

// 판정 결과 타입
export type JudgmentResult = 'safe' | 'caution' | 'danger';

export interface ComparisonResult {
  gameName: GameName;
  baseline: number;
  current: number;
  decreaseRate: number; // percentage
  status: JudgmentResult;
}

export interface OverallResult {
  status: JudgmentResult;
  comparisons: ComparisonResult[];
  message: string;
  recommendation: string;
}

// 게임 공통 Props
export interface GameProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
}

// 라우터 상태
export interface TestState {
  type: 'baseline' | 'current';
  currentGameIndex: number;
  scores: Partial<TestScores>;
  testTag?: string;
}
