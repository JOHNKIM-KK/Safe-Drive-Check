import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/settingsStore';
import { ONBOARDING_SLIDES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
      navigate('/', { replace: true });
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col safe-area-top safe-area-bottom">
      {/* 스킵 버튼 */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-neutral-500 text-sm px-4 py-2"
        >
          건너뛰기
        </button>
      </div>

      {/* 슬라이드 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              className="text-8xl mb-8"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              {slide.emoji}
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-4">{slide.title}</h1>
            <p className="text-neutral-400 text-lg whitespace-pre-line">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 인디케이터 및 버튼 */}
      <div className="p-6 space-y-6">
        {/* 페이지 인디케이터 */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full ${
                idx === currentSlide ? 'bg-emerald-500 w-6' : 'bg-neutral-700 w-2'
              }`}
              animate={{ width: idx === currentSlide ? 24 : 8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* 다음/시작 버튼 */}
        <Button onClick={handleNext} size="xl" className="w-full">
          {isLastSlide ? '시작하기' : '다음'}
        </Button>
      </div>
    </div>
  );
}
