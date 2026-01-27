import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { shuffle } from '@/lib/utils';

type QuestionType = 'traffic-light' | 'arrow' | 'number';

interface Question {
  type: QuestionType;
  value: string;
  correctAnswer: 'left' | 'right';
}

const generateQuestions = (): Question[] => {
  const questions: Question[] = [];

  // 신호등: 빨강(정지=왼쪽), 초록(진행=오른쪽)
  questions.push(
    { type: 'traffic-light', value: '🔴', correctAnswer: 'left' },
    { type: 'traffic-light', value: '🟢', correctAnswer: 'right' },
    { type: 'traffic-light', value: '🔴', correctAnswer: 'left' },
    { type: 'traffic-light', value: '🟢', correctAnswer: 'right' },
    { type: 'traffic-light', value: '🔴', correctAnswer: 'left' },
  );

  // 화살표: 왼쪽 화살표(왼쪽), 오른쪽 화살표(오른쪽)
  questions.push(
    { type: 'arrow', value: '⬅️', correctAnswer: 'left' },
    { type: 'arrow', value: '➡️', correctAnswer: 'right' },
    { type: 'arrow', value: '⬅️', correctAnswer: 'left' },
    { type: 'arrow', value: '➡️', correctAnswer: 'right' },
    { type: 'arrow', value: '⬅️', correctAnswer: 'left' },
  );

  // 숫자: 홀수(왼쪽), 짝수(오른쪽)
  questions.push(
    { type: 'number', value: '3', correctAnswer: 'left' },
    { type: 'number', value: '8', correctAnswer: 'right' },
    { type: 'number', value: '5', correctAnswer: 'left' },
    { type: 'number', value: '2', correctAnswer: 'right' },
    { type: 'number', value: '7', correctAnswer: 'left' },
  );

  return shuffle(questions);
};

export default function Judgment({ onComplete }: GameProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [questions] = useState(() => generateQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [, setTotalResponseTime] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const questionStartRef = useRef(0);
  const { light, error, success } = useHaptic();

  const totalQuestions = 15;

  const handleAnswer = useCallback((answer: 'left' | 'right') => {
    if (feedback || isComplete) return;

    const responseTime = performance.now() - questionStartRef.current;
    setTotalResponseTime((prev) => prev + responseTime);

    const currentQuestion = questions[currentIndex];
    const isCorrect = currentQuestion.correctAnswer === answer;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedback('correct');
      light();
    } else {
      setFeedback('wrong');
      error();
    }

    // 피드백 후 다음 문제
    setTimeout(() => {
      setFeedback(null);
      
      if (currentIndex + 1 >= totalQuestions) {
        setIsComplete(true);
        success();
      } else {
        setCurrentIndex((prev) => prev + 1);
        questionStartRef.current = performance.now();
      }
    }, 300);
  }, [currentIndex, questions, feedback, isComplete, light, error, success]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    questionStartRef.current = performance.now();
  }, []);

  // 완료 시 결과 전달
  useEffect(() => {
    if (isComplete) {
      const accuracy = Math.round((correctCount / totalQuestions) * 100);
      setTimeout(() => {
        onComplete(accuracy);
      }, 1500);
    }
  }, [isComplete, correctCount, onComplete]);

  const getHint = (type: QuestionType) => {
    switch (type) {
      case 'traffic-light':
        return '🔴 정지 = 왼쪽 | 🟢 진행 = 오른쪽';
      case 'arrow':
        return '화살표 방향을 따라 터치';
      case 'number':
        return '홀수 = 왼쪽 | 짝수 = 오른쪽';
      default:
        return '';
    }
  };

  if (!isStarted) {
    return (
      <motion.div
        className="game-container flex flex-col items-center justify-center min-h-[400px] bg-neutral-800 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-6">🚦</div>
        <h2 className="text-2xl font-bold text-white mb-2">판단력 테스트</h2>
        <p className="text-neutral-400 text-center mb-4 px-6">
          신호와 표지판을 빠르게 판단하세요
        </p>
        <div className="text-sm text-neutral-500 mb-6 text-center px-6">
          <p>🔴 = 왼쪽 | 🟢 = 오른쪽</p>
          <p>⬅️ = 왼쪽 | ➡️ = 오른쪽</p>
          <p>홀수 = 왼쪽 | 짝수 = 오른쪽</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold"
        >
          시작하기
        </motion.button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const accuracy = currentIndex > 0 ? Math.round((correctCount / currentIndex) * 100) : 100;

  return (
    <motion.div
      className="game-container flex flex-col min-h-[400px] bg-neutral-900 rounded-3xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-neutral-800 px-4 py-2 rounded-full">
          <span className="text-emerald-400 font-bold">{correctCount}</span>
          <span className="text-neutral-400">/{currentIndex || 1}</span>
        </div>
        <div className="bg-neutral-800 px-4 py-2 rounded-full">
          <span className="text-white font-bold">{currentIndex + 1}</span>
          <span className="text-neutral-400">/{totalQuestions}</span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-neutral-800 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* 힌트 */}
      <div className="text-center text-neutral-500 text-sm mb-4">
        {!isComplete && getHint(currentQuestion.type)}
      </div>

      {/* 문제 영역 */}
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`text-8xl ${
                feedback === 'correct' ? 'text-emerald-400' :
                feedback === 'wrong' ? 'text-red-400' : ''
              }`}
            >
              {currentQuestion.type === 'number' ? (
                <span className="font-bold">{currentQuestion.value}</span>
              ) : (
                currentQuestion.value
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎯</div>
              <div className="text-3xl font-bold text-white mb-2">{accuracy}%</div>
              <p className="text-neutral-400">{correctCount}/{totalQuestions} 정답</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 선택 버튼 */}
      {!isComplete && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer('left')}
            className={`py-6 rounded-2xl font-bold text-xl transition-colors ${
              feedback === 'correct' && currentQuestion.correctAnswer === 'left'
                ? 'bg-emerald-500'
                : feedback === 'wrong' && currentQuestion.correctAnswer !== 'left'
                ? 'bg-red-500'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            ⬅️ 왼쪽
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer('right')}
            className={`py-6 rounded-2xl font-bold text-xl transition-colors ${
              feedback === 'correct' && currentQuestion.correctAnswer === 'right'
                ? 'bg-emerald-500'
                : feedback === 'wrong' && currentQuestion.correctAnswer !== 'right'
                ? 'bg-red-500'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            오른쪽 ➡️
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
