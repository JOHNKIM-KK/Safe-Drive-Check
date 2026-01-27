import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { getAllRecords, deleteRecord, resetAllData } from '@/lib/db';
import { useTestStore } from '@/stores/testStore';
import { getGameNameKorean, getGameUnit } from '@/lib/calculations';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TestRecord, GameName } from '@/types';
import { useEffect } from 'react';

export default function HistoryScreen() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { loadBaselineStats, totalMeasurements } = useTestStore();

  // 기록 로드
  useEffect(() => {
    const load = async () => {
      const data = await getAllRecords(0, 50);
      setRecords(data);
    };
    load();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecord(null);
    await loadBaselineStats();
  };

  const handleResetAll = async () => {
    await resetAllData();
    setRecords([]);
    setShowDeleteConfirm(false);
    await loadBaselineStats();
  };

  // 통계 계산
  const baselineRecords = records.filter((r) => r.type === 'baseline');
  const currentRecords = records.filter((r) => r.type === 'current');
  const avgScore = records.length > 0
    ? Math.round(records.reduce((a, b) => a + b.averageScore, 0) / records.length)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-950 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="sticky top-0 bg-neutral-950/90 backdrop-blur-lg z-10 px-4 py-4 flex items-center justify-between border-b border-neutral-800">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">나의 기록</h1>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 -mr-2 text-neutral-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-3">
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-white">{totalMeasurements}</div>
            <div className="text-xs text-neutral-500">총 측정</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-emerald-400">{baselineRecords.length}</div>
            <div className="text-xs text-neutral-500">평소 기록</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-amber-400">{currentRecords.length}</div>
            <div className="text-xs text-neutral-500">상태 측정</div>
          </Card>
        </div>

        {avgScore > 0 && (
          <Card variant="glass" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {avgScore >= 70 ? (
                <TrendingUp className="text-emerald-400" size={24} />
              ) : (
                <TrendingDown className="text-amber-400" size={24} />
              )}
              <div>
                <div className="text-white font-semibold">평균 점수</div>
                <div className="text-neutral-400 text-sm">전체 측정 기준</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{avgScore}점</div>
          </Card>
        )}

        {/* 기록 목록 */}
        <div className="space-y-3">
          <h2 className="text-neutral-400 text-sm font-medium flex items-center gap-2">
            <Calendar size={16} />
            측정 기록
          </h2>

          {records.length === 0 ? (
            <Card variant="elevated" className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-neutral-400">아직 측정 기록이 없습니다</p>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="mt-4"
              >
                측정하러 가기
              </Button>
            </Card>
          ) : (
            <AnimatePresence>
              {records.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    variant="elevated"
                    hoverable
                    onClick={() => setSelectedRecord(record)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            record.type === 'baseline'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {record.type === 'baseline' ? '평소' : '현재'}
                          </span>
                          {record.testTag && (
                            <span className="text-xs text-neutral-500">{record.testTag}</span>
                          )}
                        </div>
                        <div className="text-neutral-400 text-sm mt-1">
                          {formatDateTime(record.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{record.averageScore}점</div>
                        <div className="text-xs text-neutral-500">
                          {formatRelativeTime(record.timestamp)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-neutral-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedRecord.type === 'baseline'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedRecord.type === 'baseline' ? '평소 기록' : '현재 상태'}
                  </span>
                  <div className="text-neutral-400 text-sm mt-1">
                    {formatDateTime(selectedRecord.timestamp)}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{selectedRecord.averageScore}점</div>
              </div>

              <div className="space-y-3 mb-6">
                {(['reactionTime', 'peripheralVision', 'concentration', 'judgment', 'coordination'] as GameName[]).map((name) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-neutral-800">
                    <span className="text-neutral-300">{getGameNameKorean(name)}</span>
                    <span className="font-semibold text-white">
                      {Math.round(selectedRecord.scores[name])}{getGameUnit(name)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => selectedRecord.id && handleDelete(selectedRecord.id)}
                  variant="danger"
                  className="flex-1"
                >
                  삭제
                </Button>
                <Button
                  onClick={() => setSelectedRecord(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  닫기
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 전체 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-neutral-900 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">모든 기록 삭제</h2>
                <p className="text-neutral-400">
                  모든 측정 기록이 삭제됩니다.<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleResetAll}
                  variant="danger"
                  className="flex-1"
                >
                  삭제
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
