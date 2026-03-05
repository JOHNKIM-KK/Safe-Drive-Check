import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useTestStore } from '@/stores/testStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui/Card';

export default function MainScreen() {
  const navigate = useNavigate();
  const { baselineStats, totalMeasurements, loadBaselineStats } = useTestStore();
  const { onboardingCompleted, loadSettings } = useSettingsStore();

  // 초기 데이터 로드
  useEffect(() => {
    loadSettings();
    loadBaselineStats();
  }, [loadSettings, loadBaselineStats]);

  // 온보딩 체크
  useEffect(() => {
    if (!onboardingCompleted) {
      navigate('/onboarding', { replace: true });
    }
  }, [onboardingCompleted, navigate]);

  const hasBaseline = baselineStats && baselineStats.measurementCount >= 3;

  const handleStartBaseline = () => {
    navigate('/baseline');
  };

  const handleStartCurrent = () => {
    if (!hasBaseline) {
      alert('평소 기록을 먼저 3회 이상 측정해주세요!');
      return;
    }
    navigate('/current-test');
  };

  return (
    <div className="min-h-screen bg-neutral-950 safe-area-top safe-area-bottom">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative px-4 pt-12 pb-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-6xl mb-4"
          >
            🚗
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Safe Drive Check
          </h1>
          <p className="text-white font-bold">
            운전하기 전, 2분만 체크하세요
          </p>
        </motion.div>

        {/* 메인 버튼들 */}
        <div className="space-y-4 mb-8">
          {/* 평소 기록 측정 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              variant="elevated"
              hoverable
              onClick={handleStartBaseline}
              className="p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="text-emerald-400" size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">평소 기록 측정</h2>
                  <p className="text-neutral-400 text-sm">
                    {baselineStats
                      ? `${baselineStats.measurementCount}회 측정 완료`
                      : '아직 측정 안 함'}
                  </p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Card>
          </motion.div>

          {/* 현재 상태 측정 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              variant={hasBaseline ? 'elevated' : 'default'}
              hoverable={hasBaseline || undefined}
              onClick={handleStartCurrent}
              className={`p-6 ${!hasBaseline ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  hasBaseline ? 'bg-amber-500/20' : 'bg-neutral-700'
                }`}>
                  <Activity className={hasBaseline ? 'text-amber-400' : 'text-neutral-500'} size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">지금 운전 가능?</h2>
                  <p className="text-neutral-400 text-sm">
                    {hasBaseline ? '평소와 비교하기' : '평소 측정 3회 이상 필요'}
                  </p>
                </div>
                <div className="text-3xl">{hasBaseline ? '→' : '🔒'}</div>
              </div>
            </Card>
          </motion.div>

          {/* 나의 기록 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              variant="default"
              hoverable
              onClick={() => navigate('/history')}
              className="p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="text-purple-400" size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">나의 기록</h2>
                  <p className="text-neutral-400 text-sm">
                    총 {totalMeasurements}회 측정
                  </p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 안내 메시지 */}
        {!hasBaseline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8"
          >
            <p className="text-amber-300 text-sm text-center">
              💡 먼저 평소 상태를 <strong>3회 이상</strong> 측정해주세요.<br />
              평소 기록이 있어야 현재 상태와 비교할 수 있습니다.
            </p>
          </motion.div>
        )}

        {/* 하단 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-neutral-600 text-xs">
            ⚠️ 본 서비스는 의료기기가 아니며, 참고용 도구입니다.
          </p>
          <p className="text-neutral-600 text-xs mt-1">
            음주 후에는 측정 결과와 무관하게 절대 운전하지 마세요.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
