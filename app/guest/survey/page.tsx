'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'rating' | 'action' | 'redirecting';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || '';
  
  const [step, setStep] = useState<Step>('rating');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // 評価が高い場合（4-5）はGoogleマップ誘導あり、低い場合（1-3）は内部サンクスのみ
  const isHighRating = rating >= 4;

  const handleStarClick = (value: number) => {
    setRating(value);
    // 星をクリックした瞬間にアクションステップへ遷移
    setTimeout(() => {
      setStep('action');
    }, 100);
  };

  // ギャラリーへの遷移処理
  const navigateToGallery = () => {
    setStep('redirecting');
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 1500);
  };

  // Googleマップへの誘導（星4以上の場合）
  const handleMapClick = () => {
    // Googleマップを開く（実際の会場のURLに置き換える）
    window.open('https://www.google.com/maps', '_blank');
    // レビュー完了後、リダイレクトステップへ遷移
    setTimeout(() => {
      navigateToGallery();
    }, 300);
  };

  // フィードバック送信（星3以下の場合）
  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    // 送信後、リダイレクトステップへ遷移
    setTimeout(() => {
      navigateToGallery();
    }, 300);
  };

  return (
    <div className="h-[100dvh] relative flex items-center justify-center px-4 overflow-hidden bg-stone-50">
      {/* 背景装飾: 淡いグラデーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-100/15 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* メインコンテンツ - スクロールなしの1画面完結 */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/80 backdrop-blur-xl border-2 border-stone-200/50 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* Step 1: 評価 ('rating') */}
            {step === 'rating' && (
              <motion.div
                key="rating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                <h1 className="font-serif text-stone-800 text-xl sm:text-2xl md:text-3xl font-bold">
                  ご感想をお聞かせください
                </h1>
                <div className="w-20 h-px bg-stone-300 mx-auto"></div>
                
                {/* 星評価 */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 py-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <motion.button
                      key={value}
                      onClick={() => handleStarClick(value)}
                      onMouseEnter={() => setHoveredStar(value)}
                      onMouseLeave={() => setHoveredStar(0)}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: rating >= value || hoveredStar >= value ? 1.15 : 1,
                        color: rating >= value || hoveredStar >= value ? '#f59e0b' : '#d1d5db',
                      }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: アクション ('action') */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* 高評価（4-5）の場合 - Googleマップ誘導 */}
                {isHighRating && (
                  <>
                    <p className="font-serif text-stone-700 text-base sm:text-lg leading-relaxed">
                      高評価をいただき、誠にありがとうございます。<br />
                      Googleマップに口コミを投稿していただけると幸いです。
                    </p>
                    <motion.button
                      onClick={handleMapClick}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-serif text-lg sm:text-xl font-semibold py-5 sm:py-6 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Googleマップに口コミを投稿する</span>
                    </motion.button>
                  </>
                )}

                {/* 低評価（1-3）の場合 - フィードバック入力 */}
                {!isHighRating && (
                  <>
                    <p className="font-serif text-stone-700 text-base sm:text-lg leading-relaxed">
                      より良いサービスのために、ご意見をお聞かせください（任意）
                    </p>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="ご意見・ご感想をご記入ください"
                      className="w-full h-32 sm:h-36 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-serif text-sm sm:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none transition-all duration-200"
                    />
                    <motion.button
                      onClick={handleFeedbackSubmit}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-stone-700 hover:bg-stone-800 text-white font-serif text-lg sm:text-xl font-semibold py-5 sm:py-6 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>送信する</span>
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: リダイレクト ('redirecting') */}
            {step === 'redirecting' && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.div>
                <p className="font-serif text-stone-700 text-base sm:text-lg font-medium">
                  アルバムへ移動します
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 font-serif">読み込み中...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
