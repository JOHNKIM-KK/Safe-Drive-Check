# Safe Drive Check 🚗

음주운전 예방 인지능력 테스트 웹 서비스

평소 인지능력을 측정하고, 음주 또는 컨디션 저하 상태에서 재측정하여 운전 적합성을 판단할 수 있는 모바일 웹 서비스입니다.

## 핵심 기능

### 5가지 인지능력 테스트 (총 2분)
- ⚡ **반응속도 테스트** - 급정거 상황 대응 능력
- 👁️ **주변시야 인지 테스트** - 보행자, 신호등 인지 능력
- 🎯 **집중력 테스트** - 차선 유지 능력
- 🚦 **판단력 테스트** - 교통상황 판단 능력
- 🎮 **협응력 테스트** - 핸들/페달 조작 능력

### 판정 시스템
- 🟢 **안전** - 모든 항목 평소 대비 15% 이내 저하
- 🟡 **주의** - 1개 이상 항목 15-30% 저하
- 🔴 **위험** - 1개 이상 항목 30% 이상 저하

## 기술 스택

- **Framework**: React 19 + TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie.js)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

## 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 프로덕션 빌드

```bash
pnpm build
```

### 프리뷰

```bash
pnpm preview
```

## 프로젝트 구조

```
src/
├── app/                # App 진입점
│   ├── App.tsx
│   └── Router.tsx
├── components/         # 공통 컴포넌트
│   ├── ui/            # UI 컴포넌트 (Button, Card 등)
│   └── common/        # 공통 화면 (MainScreen)
├── features/           # 기능별 모듈
│   ├── onboarding/    # 온보딩
│   ├── baseline/      # 평소 기록 측정
│   ├── current-test/  # 현재 상태 측정
│   ├── results/       # 결과 화면
│   └── history/       # 기록 보기
├── games/              # 5가지 측정 게임
│   ├── ReactionTime/
│   ├── PeripheralVision/
│   ├── Concentration/
│   ├── Judgment/
│   └── Coordination/
├── hooks/              # Custom Hooks
├── stores/             # Zustand Stores
├── lib/                # 유틸리티
├── types/              # TypeScript 타입
└── styles/             # 글로벌 스타일
```

## 주요 특징

### 개인 맞춤형 비교
- 절대 기준이 아닌 개인별 평소 기록 대비 측정
- 사람마다 다른 기준치 반영

### 과학적 접근
- 운전에 필요한 5가지 핵심 능력 측정
- 단순 재미가 아닌 실질적 판단 도구

### 접근성
- 앱 설치 불필요, 웹으로 즉시 이용
- PWA 지원으로 오프라인 사용 가능
- 무료, 회원가입 불필요

### 개인정보 보호
- 모든 데이터 로컬 저장 (IndexedDB)
- 서버 전송 없음
- 개인 식별 정보 미수집

## 법적 고지

⚠️ **주의사항**
- 본 서비스는 의료기기가 아니며, 참고용 도구입니다
- 음주 후에는 측정 결과와 무관하게 절대 운전하지 마세요
- 법적 음주운전 기준은 혈중알코올농도 0.03%입니다
- 본 서비스 결과에 대한 법적 책임은 사용자에게 있습니다

## 라이선스

MIT License
