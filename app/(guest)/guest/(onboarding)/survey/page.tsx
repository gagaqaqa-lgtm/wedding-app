'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Send, Sparkles, Heart, Lock, Unlock, Key, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';

// ============================================================================
// レビュー設定（会場ごとに変更可能）
// 将来的にバックエンド（Venue設定）から取得する想定
// ============================================================================
const REVIEW_CONFIG = {
  /** レビュー投稿先URL（管理画面で登録されたURL） */
  url: 'https://maps.google.com/?q=表参道テラス', // TODO: 実際のレビュー投稿URLに置き換え
  /** 外部誘導する最低星数（この値以上なら外部誘導、未満なら内部フィードバック） */
  minRatingForExternal: 4, // 4以上なら外部、3以下なら内部
} as const;

// ============================================================================
// LocalStorage管理
// ============================================================================
const getReviewStorageKey = (guestId?: string) => {
  return `wedding_app_review_completed_${guestId || 'default'}`;
};

type Step = 'locked' | 'rating' | 'action' | 'unlocking' | 'redirecting';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || '';
  const guestId = searchParams.get('guestId') || undefined; // ゲストID（オプション）
  
  const [step, setStep] = useState<Step>('locked');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // 評価が高い場合（設定値以上）は外部誘導あり、低い場合（設定値未満）は内部フィードバックのみ
  const isHighRating = rating >= REVIEW_CONFIG.minRatingForExternal;

  // 初期状態：ロックされた鍵アイコンを表示
  useEffect(() => {
    // 少し遅延してから評価ステップへ遷移（ロック状態を一瞬表示）
    const timer = setTimeout(() => {
      setStep('rating');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStarClick = (value: number) => {
    setRating(value);
    // 星をクリックした瞬間にアクションステップへ遷移
    setTimeout(() => {
      setStep('action');
    }, 300);
  };

  // レビュー完了状態をLocalStorageに保存
  const markReviewCompleted = () => {
    try {
      const storageKey = getReviewStorageKey(guestId);
      localStorage.setItem(storageKey, 'true');
      // レビュー情報も保存（オプション）
      localStorage.setItem(`${storageKey}_data`, JSON.stringify({
        rating,
        feedbackText,
        completedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save review status:', error);
    }
  };

  // 紙吹雪エフェクトを発火
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // 左側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'], // emerald, teal, gold, coral, white
      });
      
      // 右側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'],
      });
    }, 250);
  };

  // ロック解除演出を表示（解除アクション実行後）
  const showUnlockAnimation = () => {
    setStep('unlocking');
    
    // レビュー完了状態を保存
    markReviewCompleted();
    
    // 紙吹雪エフェクトを発火
    triggerConfetti();
  };

  // 外部レビューサイトへの誘導（高評価の場合）
  const handleExternalReviewClick = () => {
    // 外部サイトを開く
    window.open(REVIEW_CONFIG.url, '_blank', 'noopener,noreferrer');
    
    toast.success('ありがとうございます！', {
      description: 'レビューサイトで口コミを投稿していただけると幸いです',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示（URLを開いた瞬間に解除）
    showUnlockAnimation();
  };

  // フィードバック送信（低評価の場合）
  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    // TODO: API呼び出しでフィードバックを保存
    // TODO: API経由でフィードバックを送信
    
    toast.success('ご意見ありがとうございます', {
      description: '貴重なご意見をいただき、ありがとうございます',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示
    showUnlockAnimation();
  };

  // ギャラリーへ進むボタン（ロック解除後のみ表示）
  const handleGoToGallery = () => {
    setStep('redirecting');
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 500);
  };

  return (
    <div className="min-h-dvh relative flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
      {/* 背景装飾: 優しいグラデーションのオーバーレイ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl"
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
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200/50 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 0: 初期状態 - ロックされた鍵アイコン */}
            {step === 'locked' && (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg">
                    <Lock className="w-12 h-12 text-emerald-600" />
                  </div>
                </motion.div>
                <p className="text-base sm:text-lg text-gray-600 font-serif">
                  レビューを完了すると、ギャラリーが開きます
                </p>
              </motion.div>
            )}

            {/* Step 1: 評価 ('rating') */}
            {step === 'rating' && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* ヘッダー */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                    <h1 className="font-serif text-emerald-800 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Thank You!
                    </h1>
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed">
                    本日はお越しいただき、ありがとうございました
                    <br />
                    お時間のあるときに、ご感想をお聞かせください
                  </p>
                </motion.div>

                {/* 星評価 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex justify-center items-center gap-2 sm:gap-3 py-6"
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isActive = rating >= value || hoveredStar >= value;
                    return (
                      <motion.button
                        key={value}
                        onClick={() => handleStarClick(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(0)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "transition-all duration-200",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full p-1"
                        )}
                        aria-label={`${value}つ星`}
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-all duration-200",
                            isActive
                              ? "text-emerald-500 fill-emerald-500"
                              : "text-gray-300 fill-gray-100"
                          )}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* ヒントテキスト */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-sm text-gray-500 font-serif"
                >
                  星をタップして評価してください
                </motion.p>
              </motion.div>
            )}

            {/* Step 2: アクション ('action') - ロック解除アクションを実行 */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* 高評価（設定値以上）の場合 - 外部レビューサイト誘導 */}
                {isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        素晴らしい評価をありがとうございます！
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        よろしければレビューサイトにも思い出を投稿していただけませんか？
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* ロック解除アクションボタン（高評価） */}
                      <motion.button
                        onClick={handleExternalReviewClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        )}
                      >
                        <ExternalLink className="w-6 h-6" />
                        <span>口コミを投稿してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}

                {/* 低評価（設定値未満）の場合 - フィードバック入力 */}
                {!isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-emerald-600" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        貴重なご意見ありがとうございます
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        新郎新婦へのメッセージがあればご記入ください
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="ご意見・ご感想をご記入ください（任意）"
                        rows={5}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-emerald-50/50 border-2 border-emerald-200",
                          "text-gray-800 font-serif text-sm sm:text-base",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                          "resize-none transition-all duration-200"
                        )}
                      />

                      {/* ロック解除アクションボタン（低評価） */}
                      <motion.button
                        onClick={handleFeedbackSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Send className="w-5 h-5" />
                        <span>メッセージを送信してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: ロック解除演出 ('unlocking') - ここで初めて「ギャラリーへ進む」ボタンを表示 */}
            {step === 'unlocking' && (
              <motion.div
                key="unlocking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-8"
              >
                {/* 鍵アイコン（ロック状態 → アンロック状態） */}
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0, 0] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Lock className="w-20 h-20 text-gray-400" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1], scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <div className="relative">
                        <Unlock className="w-20 h-20 text-emerald-500" />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Key className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* メッセージ */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 font-serif">
                    ギャラリーの鍵が開きました！
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 font-serif">
                    ありがとうございます。思い出の写真をご覧いただけます
                  </p>
                </motion.div>

                {/* パーティクルエフェクト（視覚的な演出） */}
                <motion.div
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 0.8],
                        y: [0, -20],
                      }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className="w-3 h-3 rounded-full bg-emerald-400"
                    />
                  ))}
                </motion.div>

                {/* ギャラリーへ進むボタン（ロック解除後に初めて表示） */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="pt-4"
                >
                  <motion.button
                    onClick={handleGoToGallery}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                      "hover:from-emerald-600 hover:to-teal-700",
                      "text-white font-serif text-lg sm:text-xl font-semibold",
                      "py-5 sm:py-6 px-8 rounded-2xl",
                      "shadow-lg hover:shadow-xl",
                      "transition-all duration-200",
                      "flex items-center justify-center gap-3",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>ギャラリーへ進む</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: リダイレクト ('redirecting') */}
            {step === 'redirecting' && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-emerald-800 text-lg sm:text-xl font-semibold"
                >
                  ギャラリーへ移動します
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 font-serif"
                >
                  しばらくお待ちください...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-emerald-700 font-serif">読み込み中...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
