import type { GameConfig, GameName } from '@/types';

// 게임 설정
export const GAME_CONFIGS: GameConfig[] = [
  {
    name: 'reactionTime',
    title: '반응속도 테스트',
    description: '화면이 초록색으로 바뀌면 최대한 빠르게 터치하세요',
    duration: 15,
    icon: '⚡',
  },
  {
    name: 'peripheralVision',
    title: '주변시야 인지 테스트',
    description: '화면 곳곳에 나타나는 원을 빠르게 터치하세요',
    duration: 20,
    icon: '👁️',
  },
  {
    name: 'concentration',
    title: '집중력 테스트',
    description: '움직이는 공을 손가락으로 따라가세요',
    duration: 20,
    icon: '🎯',
  },
  {
    name: 'judgment',
    title: '판단력 테스트',
    description: '교통 신호와 표지판을 빠르게 판단하세요',
    duration: 30,
    icon: '🚦',
  },
  {
    name: 'coordination',
    title: '협응력 테스트',
    description: '좌우 버튼을 지시에 따라 번갈아 터치하세요',
    duration: 20,
    icon: '🎮',
  },
];

// 게임별 설정 맵
export const GAME_CONFIG_MAP: Record<GameName, GameConfig> = GAME_CONFIGS.reduce(
  (acc, config) => ({ ...acc, [config.name]: config }),
  {} as Record<GameName, GameConfig>
);

// 판정 기준
export const JUDGMENT_THRESHOLDS = {
  safe: 15,      // 15% 이내 저하
  caution: 30,   // 30% 이내 저하
  // 30% 초과 → danger
};

// 반응속도 기준값 (ms)
export const REACTION_TIME_BENCHMARKS = {
  excellent: 200,
  good: 250,
  average: 300,
  belowAverage: 350,
  poor: 400,
};

// 결과 메시지
export const RESULT_MESSAGES = {
  safe: {
    title: '운전 가능',
    subtitle: '평소와 비슷한 상태입니다',
    emoji: '🟢',
    color: 'emerald',
  },
  caution: {
    title: '주의 필요',
    subtitle: '컨디션이 저하되었습니다',
    emoji: '🟡',
    color: 'amber',
  },
  danger: {
    title: '운전 위험',
    subtitle: '운전하기 위험한 상태입니다',
    emoji: '🔴',
    color: 'red',
  },
};

// 법적 고지 사항
export const LEGAL_DISCLAIMER = `
⚠️ 주의사항
• 본 서비스는 의료기기가 아니며, 참고용 도구입니다
• 음주 후에는 측정 결과와 무관하게 절대 운전하지 마세요
• 법적 음주운전 기준은 혈중알코올농도 0.03%입니다
• 본 서비스 결과에 대한 법적 책임은 사용자에게 있습니다
`;

// 대리운전 딥링크
export const PROXY_DRIVER_LINKS = {
  kakaoT: 'https://t.kakao.com',
};

// 온보딩 슬라이드
export const ONBOARDING_SLIDES = [
  {
    title: 'Safe Drive Check',
    description: '평소 인지능력을 기록하고,\n음주 후 상태와 비교해보세요',
    emoji: '🚗',
  },
  {
    title: '5가지 테스트',
    description: '반응속도, 시야, 집중력, 판단력, 협응력\n총 2분이면 측정 완료!',
    emoji: '📊',
  },
  {
    title: '객관적인 비교',
    description: '"한 잔 정도는 괜찮겠지?"\n숫자로 직접 확인하세요',
    emoji: '📉',
  },
  {
    title: '안전한 귀가',
    description: '위험 판정 시 대리운전을\n바로 호출할 수 있어요',
    emoji: '🏠',
  },
];
