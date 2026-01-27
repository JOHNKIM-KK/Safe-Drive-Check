import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loaded pages
const MainScreen = lazy(() => import('@/components/common/MainScreen'));
const OnboardingScreen = lazy(() => import('@/features/onboarding/OnboardingScreen'));
const BaselineScreen = lazy(() => import('@/features/baseline/BaselineScreen'));
const CurrentTestScreen = lazy(() => import('@/features/current-test/CurrentTestScreen'));
const ResultScreen = lazy(() => import('@/features/results/ResultScreen'));
const HistoryScreen = lazy(() => import('@/features/history/HistoryScreen'));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-neutral-400">로딩 중...</p>
      </div>
    </div>
  );
}

// Baseline required screen
function BaselineRequiredScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      <div className="text-6xl mb-6">📊</div>
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        평소 기록이 필요합니다
      </h1>
      <p className="text-neutral-400 text-center mb-8">
        현재 상태를 비교하려면<br />
        먼저 평소 기록을 3회 이상 측정해주세요.
      </p>
      <a
        href="/"
        className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/baseline" element={<BaselineScreen />} />
        <Route path="/current-test" element={<CurrentTestScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/baseline-required" element={<BaselineRequiredScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
