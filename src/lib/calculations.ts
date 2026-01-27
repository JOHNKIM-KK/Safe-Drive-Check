import type { TestScores, BaselineStats, ComparisonResult, OverallResult, JudgmentResult, GameName } from '@/types';

// 점수 정규화 (0-100 스케일)
export function normalizeScore(gameName: GameName, rawScore: number): number {
  switch (gameName) {
    case 'reactionTime':
      // 반응속도: 150ms(최고) ~ 500ms(최저) → 100 ~ 0
      const rtClamped = Math.max(150, Math.min(500, rawScore));
      return Math.round(((500 - rtClamped) / 350) * 100);
    
    case 'peripheralVision':
      // 주변시야: 0개 ~ 40개 → 0 ~ 100
      return Math.round((Math.min(40, rawScore) / 40) * 100);
    
    case 'concentration':
      // 집중력: 이미 % 값
      return Math.round(Math.min(100, rawScore));
    
    case 'judgment':
      // 판단력: 이미 % 값
      return Math.round(Math.min(100, rawScore));
    
    case 'coordination':
      // 협응력: 0 ~ 50회 → 0 ~ 100
      return Math.round((Math.min(50, rawScore) / 50) * 100);
    
    default:
      return rawScore;
  }
}

// 저하율 계산
export function calculateDecreaseRate(
  gameName: GameName,
  baseline: number,
  current: number
): number {
  // 반응속도는 값이 높아지면 나빠진 것
  if (gameName === 'reactionTime') {
    if (baseline === 0) return 0;
    return Math.round(((current - baseline) / baseline) * 100);
  }
  
  // 나머지는 값이 낮아지면 나빠진 것
  if (baseline === 0) return 0;
  return Math.round(((baseline - current) / baseline) * 100);
}

// 개별 항목 판정
export function judgeItem(decreaseRate: number): JudgmentResult {
  if (decreaseRate <= 15) return 'safe';
  if (decreaseRate <= 30) return 'caution';
  return 'danger';
}

// 종합 판정
export function calculateOverallResult(
  currentScores: TestScores,
  baselineStats: BaselineStats
): OverallResult {
  const gameNames: GameName[] = [
    'reactionTime',
    'peripheralVision',
    'concentration',
    'judgment',
    'coordination'
  ];

  const comparisons: ComparisonResult[] = gameNames.map((name) => {
    const baseline = baselineStats[name].mean;
    const current = currentScores[name];
    const decreaseRate = calculateDecreaseRate(name, baseline, current);
    
    return {
      gameName: name,
      baseline,
      current,
      decreaseRate,
      status: judgeItem(decreaseRate),
    };
  });

  // 가장 나쁜 결과를 기준으로 종합 판정
  const hasoDanger = comparisons.some(c => c.status === 'danger');
  const hasCaution = comparisons.some(c => c.status === 'caution');

  let status: JudgmentResult;
  let message: string;
  let recommendation: string;

  if (hasoDanger) {
    status = 'danger';
    message = '운전하기 위험한 상태입니다';
    recommendation = '대리운전이나 택시를 이용해주세요. 안전이 최우선입니다.';
  } else if (hasCaution) {
    status = 'caution';
    message = '컨디션이 저하되었습니다';
    recommendation = '운전에 주의가 필요합니다. 가능하다면 대중교통을 이용해주세요.';
  } else {
    status = 'safe';
    message = '평소와 비슷한 상태입니다';
    recommendation = '안전운전 하세요!';
  }

  return {
    status,
    comparisons,
    message,
    recommendation,
  };
}

// 평균 점수 계산
export function calculateAverageScore(scores: TestScores): number {
  const normalized = {
    reactionTime: normalizeScore('reactionTime', scores.reactionTime),
    peripheralVision: normalizeScore('peripheralVision', scores.peripheralVision),
    concentration: normalizeScore('concentration', scores.concentration),
    judgment: normalizeScore('judgment', scores.judgment),
    coordination: normalizeScore('coordination', scores.coordination),
  };

  const total = Object.values(normalized).reduce((a, b) => a + b, 0);
  return Math.round(total / 5);
}

// 백분위 계산 (간단한 추정)
export function calculatePercentile(averageScore: number): number {
  // 정규분포 가정, 평균 50, 표준편차 15
  const z = (averageScore - 50) / 15;
  
  // 누적 분포 함수 근사
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  let percentile = z > 0 ? (1 - p) * 100 : p * 100;
  return Math.round(Math.max(1, Math.min(99, percentile)));
}

// 게임 이름 한글 변환
export function getGameNameKorean(gameName: GameName): string {
  const names: Record<GameName, string> = {
    reactionTime: '반응속도',
    peripheralVision: '주변시야',
    concentration: '집중력',
    judgment: '판단력',
    coordination: '협응력',
  };
  return names[gameName];
}

// 게임 단위
export function getGameUnit(gameName: GameName): string {
  const units: Record<GameName, string> = {
    reactionTime: 'ms',
    peripheralVision: '개',
    concentration: '%',
    judgment: '%',
    coordination: '회',
  };
  return units[gameName];
}

// 저하율 포맷
export function formatDecreaseRate(rate: number, gameName: GameName): string {
  if (gameName === 'reactionTime') {
    // 반응속도는 느려지면 양수, 빨라지면 음수
    if (rate > 0) return `${rate}% 느려짐`;
    if (rate < 0) return `${Math.abs(rate)}% 빨라짐`;
    return '변화 없음';
  }
  
  // 나머지는 저하되면 양수
  if (rate > 0) return `${rate}% 저하`;
  if (rate < 0) return `${Math.abs(rate)}% 향상`;
  return '변화 없음';
}
