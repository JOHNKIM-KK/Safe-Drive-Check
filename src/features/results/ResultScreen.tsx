import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend
} from 'recharts';
import { useTestStore } from '@/stores/testStore';
import { calculateOverallResult, getGameNameKorean, getGameUnit, formatDecreaseRate } from '@/lib/calculations';
import { RESULT_MESSAGES, PROXY_DRIVER_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { TestScores, GameName } from '@/types';

export default function ResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetails, setShowDetails] = useState(false);

  const { scores, baselineStats, resetTest } = useTestStore();
  const testType = (location.state as { type?: string })?.type || 'baseline';
  
  const isComparison = testType === 'current' && baselineStats;
  const fullScores = scores as TestScores;

  // 비교 결과 계산
  const result = useMemo(() => {
    if (!isComparison || !baselineStats) return null;
    return calculateOverallResult(fullScores, baselineStats);
  }, [fullScores, baselineStats, isComparison]);

  // 레이더 차트 데이터
  const chartData = useMemo(() => {
    const gameNames: GameName[] = ['reactionTime', 'peripheralVision', 'concentration', 'judgment', 'coordination'];
    
    if (!isComparison || !baselineStats) {
      // 평소 측정일 때는 현재 점수만 표시 (정규화)
      return gameNames.map((name) => ({
        subject: getGameNameKorean(name),
        현재: normalizeForChart(name, fullScores[name]),
      }));
    }

    // 현재 상태 측정일 때는 비교
    return gameNames.map((name) => {
      const baseline = baselineStats[name].mean;
      const current = fullScores[name];
      
      return {
        subject: getGameNameKorean(name),
        평소: normalizeForChart(name, baseline),
        현재: normalizeForChart(name, current),
      };
    });
  }, [fullScores, baselineStats, isComparison]);

  // 점수 정규화 (차트용)
  function normalizeForChart(name: GameName, value: number): number {
    switch (name) {
      case 'reactionTime':
        // 150ms = 100, 500ms = 0
        return Math.max(0, Math.min(100, ((500 - value) / 350) * 100));
      case 'peripheralVision':
        return Math.min(100, (value / 40) * 100);
      case 'concentration':
      case 'judgment':
        return Math.min(100, value);
      case 'coordination':
        return Math.min(100, (value / 50) * 100);
      default:
        return value;
    }
  }

  const config = result ? RESULT_MESSAGES[result.status] : RESULT_MESSAGES.safe;

  // 공유하기
  const handleShare = async () => {
    const shareText = isComparison && result
      ? `Safe Drive Check 결과: ${config.title}\n${result.comparisons.map(c => 
          `${getGameNameKorean(c.gameName)}: ${formatDecreaseRate(c.decreaseRate, c.gameName)}`
        ).join('\n')}`
      : `Safe Drive Check으로 인지능력을 측정했어요!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Safe Drive Check 결과',
          text: shareText,
          url: window.location.origin,
        });
      } catch (e) {
        // 사용자가 취소한 경우
      }
    } else {
      // 클립보드에 복사
      await navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  // 대리운전 호출
  const handleCallProxy = () => {
    window.open(PROXY_DRIVER_LINKS.kakaoT, '_blank');
  };

  const handleDone = () => {
    resetTest();
    navigate('/');
  };

  useEffect(() => {
    // 0.5초 후 상세 정보 표시
    const timer = setTimeout(() => setShowDetails(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 safe-area-top safe-area-bottom">
      {/* 판정 결과 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 text-center ${
          result?.status === 'danger' ? 'bg-gradient-to-b from-red-500/20 to-transparent' :
          result?.status === 'caution' ? 'bg-gradient-to-b from-amber-500/20 to-transparent' :
          'bg-gradient-to-b from-emerald-500/20 to-transparent'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-7xl mb-4"
        >
          {isComparison ? config.emoji : '✅'}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-bold mb-2 ${
            result?.status === 'danger' ? 'text-red-400' :
            result?.status === 'caution' ? 'text-amber-400' :
            'text-emerald-400'
          }`}
        >
          {isComparison ? config.title : '측정 완료'}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-neutral-400"
        >
          {isComparison ? config.subtitle : '평소 기록이 저장되었습니다'}
        </motion.p>
      </motion.div>

      <div className="px-4 pb-8 space-y-4">
        {/* 레이더 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              {isComparison ? '평소 vs 현재' : '측정 결과'}
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#404040" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#a3a3a3', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#737373', fontSize: 10 }}
                    axisLine={false}
                  />
                  {isComparison && (
                    <Radar
                      name="평소"
                      dataKey="평소"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )}
                  <Radar
                    name="현재"
                    dataKey="현재"
                    stroke={isComparison ? '#ef4444' : '#10b981'}
                    fill={isComparison ? '#ef4444' : '#10b981'}
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: '#d4d4d4' }}>{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* 상세 점수 */}
        {isComparison && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated">
              <h2 className="text-lg font-bold text-white mb-4">상세 비교</h2>
              <div className="space-y-3">
                {result.comparisons.map((comp) => (
                  <div key={comp.gameName} className="flex items-center justify-between">
                    <div>
                      <span className="text-neutral-300">{getGameNameKorean(comp.gameName)}</span>
                      <div className="text-xs text-neutral-500">
                        {Math.round(comp.baseline)}{getGameUnit(comp.gameName)} → {Math.round(comp.current)}{getGameUnit(comp.gameName)}
                      </div>
                    </div>
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      comp.status === 'danger' ? 'bg-red-500/20 text-red-400' :
                      comp.status === 'caution' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {formatDecreaseRate(comp.decreaseRate, comp.gameName)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 평소 측정 시 점수 표시 */}
        {!isComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated">
              <h2 className="text-lg font-bold text-white mb-4">측정 점수</h2>
              <div className="space-y-3">
                {(['reactionTime', 'peripheralVision', 'concentration', 'judgment', 'coordination'] as GameName[]).map((name) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-neutral-300">{getGameNameKorean(name)}</span>
                    <span className="font-semibold text-emerald-400">
                      {Math.round(fullScores[name])}{getGameUnit(name)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 권장사항 */}
        {isComparison && result && result.status !== 'safe' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 20 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`border-2 ${
              result.status === 'danger' ? 'border-red-500/50 bg-red-500/10' :
              'border-amber-500/50 bg-amber-500/10'
            }`}>
              <p className={`text-center ${
                result.status === 'danger' ? 'text-red-300' : 'text-amber-300'
              }`}>
                {result.recommendation}
              </p>
            </Card>
          </motion.div>
        )}

        {/* 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showDetails ? 1 : 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 pt-4"
        >
          {result?.status === 'danger' && (
            <Button
              onClick={handleCallProxy}
              variant="danger"
              size="xl"
              className="w-full"
            >
              🚗 대리운전 호출하기
            </Button>
          )}

          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="w-full"
          >
            📤 결과 공유하기
          </Button>

          <Button
            onClick={handleDone}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            홈으로 돌아가기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
