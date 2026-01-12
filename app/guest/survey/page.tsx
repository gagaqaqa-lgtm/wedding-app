'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || '';
  
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // 評価が高い場合（4-5）はGoogleマップ誘導あり、低い場合（1-3）は内部サンクスのみ
  const isHighRating = rating >= 4;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  // ギャラリーへの遷移処理
  const navigateToGallery = () => {
    setIsUnlocked(true);
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 1500);
  };

  // Googleマップへの誘導（星4以上の場合）
  const handleMapClick = () => {
    // Googleマップを開く（実際の会場のURLに置き換える）
    window.open('https://www.google.com/maps', '_blank');
    setHasReviewed(true);
    // レビュー完了後、ギャラリーへ遷移
    setTimeout(() => {
      navigateToGallery();
    }, 500);
  };

  // フィードバック送信（星3以下の場合）
  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    setHasSubmitted(true);
    // サンクスメッセージ表示後、ギャラリーへ遷移
    setTimeout(() => {
      navigateToGallery();
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center px-4 py-12 sm:py-16 md:py-20 overflow-hidden bg-stone-50">
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

      {/* メインコンテンツ */}
      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-xl border-2 border-stone-200/50 rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12 space-y-8 sm:space-y-10 relative overflow-hidden"
        >
          {/* ヘッダー */}
          <motion.div className="text-center space-y-6">
            <motion.div
              animate={{
                scale: isUnlocked ? 1.2 : 1,
                rotate: isUnlocked ? -10 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="flex justify-center"
            >
              {isUnlocked ? (
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              )}
            </motion.div>

            <h1 className="font-serif text-stone-800 text-2xl sm:text-3xl md:text-4xl font-bold">
              ご感想をお聞かせください
            </h1>
            <div className="w-20 h-px bg-stone-300 mx-auto"></div>
            <p className="font-serif text-stone-600 text-base sm:text-lg leading-relaxed">
              本日の式場の雰囲気・サービスはいかがでしたか？
            </p>
          </motion.div>

          {/* サンクスメッセージ（星3以下の場合、送信後） */}
          <AnimatePresence>
            {hasSubmitted && !isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-6xl mb-4"
                >
                  🙏
                </motion.div>
                <h2 className="font-serif text-stone-800 text-xl sm:text-2xl font-semibold">
                  ご協力ありがとうございました
                </h2>
                <p className="font-serif text-stone-600 text-base leading-relaxed">
                  貴重なご意見をいただき、誠にありがとうございます。<br />
                  より良いサービスを目指してまいります。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 星評価コンポーネント（ロック解除前のみ表示） */}
          {!isUnlocked && !hasSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-2 sm:gap-3 py-4"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  onClick={() => handleStarClick(value)}
                  onMouseEnter={() => setHoveredStar(value)}
                  onMouseLeave={() => setHoveredStar(0)}
                  whileTap={{ scale: 0.7 }}
                  whileHover={{ scale: 1.25, y: -5 }}
                  animate={{
                    scale: rating >= value || hoveredStar >= value ? 1.2 : 1,
                    color: rating >= value || hoveredStar >= value ? '#f59e0b' : '#d1d5db',
                    y: rating >= value ? -8 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <motion.svg
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{
                      rotate: rating >= value && rating === value ? -20 : 0,
                      scale: rating >= value && rating === value ? 1.3 : rating >= value ? 1.1 : 1,
                    }}
                    transition={{
                      type: 'tween',
                      duration: 0.6,
                      ease: 'easeOut',
                    }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </motion.svg>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* 星評価後のコンテンツ */}
          <AnimatePresence>
            {rating > 0 && !isUnlocked && !hasSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden pt-6 border-t border-stone-200"
              >
                {/* パターンA: 高評価（4-5）の場合 - Googleマップ誘導 */}
                {isHighRating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <p className="font-serif text-stone-700 text-base sm:text-lg text-center leading-relaxed">
                      高評価をいただき、誠にありがとうございます。<br />
                      Googleマップに口コミを投稿していただけると幸いです。
                    </p>
                    <motion.button
                      onClick={handleMapClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-serif text-lg sm:text-xl font-semibold py-5 sm:py-6 px-8 rounded-2xl shadow-xl relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          type: 'tween',
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Googleマップに口コミを投稿する</span>
                      </span>
                    </motion.button>
                    {hasReviewed && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-serif text-stone-600 text-sm text-center"
                      >
                        ありがとうございます。アルバムへご案内します...
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* パターンB: 低評価（1-3）の場合 - 内部サンクスのみ */}
                {!isHighRating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <p className="font-serif text-stone-700 text-base sm:text-lg text-center leading-relaxed">
                      より良いサービスのために、ご意見をお聞かせください（任意）
                    </p>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="ご意見・ご感想をご記入ください"
                      className="w-full h-32 sm:h-40 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-serif text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none transition-all duration-200"
                    />
                    <motion.button
                      onClick={handleFeedbackSubmit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-stone-700 hover:bg-stone-800 text-white font-serif text-lg sm:text-xl font-semibold py-5 sm:py-6 px-8 rounded-2xl shadow-xl text-center flex items-center justify-center gap-3 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>送信する</span>
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ロック解除中の表示 */}
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-6 space-y-4 border-t border-amber-200 text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-amber-700 text-lg sm:text-xl font-semibold"
              >
                ロック解除中...
              </motion.p>
              <motion.div
                className="flex justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
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
