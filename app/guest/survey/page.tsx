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

  // 評価が高い場合（4-5）はGoogleマップ誘導あり、低い場合（1-3）は意見フォーム
  const isHighRating = rating >= 4;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  // ギャラリーへの遷移処理（共通化）
  const navigateToGallery = () => {
    setIsUnlocked(true);
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 800);
  };

  const handleMapClick = () => {
    // マップを開く
    window.open('https://www.google.com/maps', '_blank');
    // ギャラリーへ遷移
    navigateToGallery();
  };

  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    // ギャラリーへ遷移
    navigateToGallery();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* 背景画像（チラ見せ効果） */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/800/1200?random=wedding"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
      </div>

      {/* メインコンテンツ（ロック解除パネル） */}
      <div className="relative z-10 max-w-lg w-full">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 space-y-6 relative overflow-hidden"
        >
          {/* ヘッダー：鍵アイコン + タイトル */}
          <motion.div layout className="text-center space-y-4">
            {/* 鍵アイコンとシステムラベル */}
            <motion.div
              layout
              className="flex flex-col items-center gap-2"
            >
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
              >
                {isUnlocked ? (
                  <svg
                    className="w-20 h-20 text-green-600"
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
                    className="w-20 h-20 text-stone-600"
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
              {/* システムラベル */}
              <span className="text-xs font-sans text-stone-500 tracking-widest uppercase">
                Service Survey
              </span>
            </motion.div>

            <h1 className="font-shippori text-3xl text-stone-800 font-bold">Unlock Album</h1>
            <div className="w-20 h-px bg-[#AB9A83] mx-auto"></div>
            <p className="font-shippori text-stone-800 text-base leading-relaxed">
              フォトアルバムへのアクセスには、サービス向上のためのアンケート（満足度調査）へのご協力をお願いしております。
            </p>
          </motion.div>

          {/* 質問文 */}
          <motion.p
            layout
            className="font-shippori text-stone-800 text-lg text-center leading-relaxed"
          >
            本日の<strong className="font-bold">式場の雰囲気・サービス</strong>はいかがでしたか？
          </motion.p>

          {/* 星評価コンポーネント */}
          <motion.div
            layout
            className="flex justify-center items-center gap-3"
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
                  color: rating >= value || hoveredStar >= value ? '#facc15' : '#d1d5db',
                  y: rating >= value ? -8 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <motion.svg
                  className="w-14 h-14 md:w-16 md:h-16"
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
                    rotate: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    }
                  }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </motion.svg>
              </motion.button>
            ))}
          </motion.div>

          {/* 星評価後のコンテンツ（アコーディオン展開） */}
          <AnimatePresence>
            {rating > 0 && !isUnlocked && (
              <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-6 border-t border-stone-200">
                  {/* パターンA: 高評価（4-5）の場合 */}
                  {isHighRating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      <p className="font-shippori text-stone-800 text-base text-center leading-relaxed">
                        高評価ありがとうございます。Googleマップにクチコミを投稿してロック解除
                      </p>
                      <motion.button
                        onClick={handleMapClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white font-shippori text-lg font-semibold py-6 px-8 rounded-2xl shadow-xl relative overflow-hidden group"
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
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Googleマップに投稿して解除 🔓</span>
                        </span>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* パターンB: 低評価（1-3）の場合 */}
                  {!isHighRating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      <p className="font-shippori text-stone-800 text-base text-center leading-relaxed">
                        より良いサービスのためにご意見をお聞かせください
                      </p>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="ご意見・ご感想をご記入ください（任意）"
                        className="w-full h-32 px-4 py-3 bg-[#FDFBF7] border border-stone-300 rounded-xl text-stone-800 font-sans text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                        style={{
                          WebkitAppearance: 'none',
                        }}
                      />
                      <motion.button
                        onClick={handleFeedbackSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-blue-600 text-white font-shippori text-lg font-semibold py-6 px-8 rounded-2xl shadow-xl text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>意見を送信して解除 🔓</span>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ロック解除中の表示 */}
          {isUnlocked && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-4 space-y-4 border-t border-green-200"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-shippori text-green-700 text-center text-lg font-bold"
              >
                ロック解除中...
              </motion.p>
            </motion.div>
          )}

          {/* フッター：運営側であることを示す */}
          <motion.div
            layout
            className="pt-4 border-t border-stone-200/50"
          >
            <p className="text-xs font-sans text-stone-400 text-center">
              Provided by Venue Operations
            </p>
          </motion.div>
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
          <p className="text-stone-600 font-sans">読み込み中...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
