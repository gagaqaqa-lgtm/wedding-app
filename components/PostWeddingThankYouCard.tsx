'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Heart, Mail, ExternalLink, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';

interface PostWeddingThankYouCardProps {
  onReviewSubmit?: (rating: number, comment: string) => Promise<void>;
  albumPath?: string;
  externalReviewUrl?: string; // 口コミサイトURL（汎用的な設計）
  ratingThreshold?: number; // デフォルト: 4
  coupleId?: string | number; // localStorage用のID
}

export function PostWeddingThankYouCard({
  onReviewSubmit,
  albumPath = '/couple/gallery',
  externalReviewUrl = 'https://www.google.com/maps/search/?api=1&query=wedding+venue',
  ratingThreshold = 4,
  coupleId = 'default',
}: PostWeddingThankYouCardProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'feedback'>('rating');
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // 紙吹雪エフェクト（初回ロード時のみ）
  useEffect(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    // スムーズにフィードバックステップへ遷移
    setTimeout(() => {
      setStep('feedback');
    }, 400);
  };

  // localStorageのキー生成
  const getReviewStorageKey = () => `wedding_app_has_reviewed_${coupleId}`;

  // マウント時にレビュー済みかどうかをチェック
  useEffect(() => {
    const checkReviewStatus = () => {
      try {
        const reviewStorageKey = getReviewStorageKey();
        const hasReviewedInStorage = localStorage.getItem(reviewStorageKey) === 'true';
        if (hasReviewedInStorage) {
          setHasAlreadyReviewed(true);
        }
      } catch (error) {
        console.error('Error reading review status from localStorage:', error);
      }
    };

    checkReviewStatus();
  }, [coupleId]);

  // レビュー完了をlocalStorageに保存
  const markReviewAsCompleted = () => {
    try {
      localStorage.setItem(getReviewStorageKey(), 'true');
      setHasAlreadyReviewed(true);
    } catch (error) {
      console.error('Error saving review status to localStorage:', error);
    }
  };

  // Case A: 高評価（4-5つ星）→ 外部口コミサイトへ投稿
  const handleHighRatingSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. 外部口コミサイトを別タブで開く（性善説UX: ボタンクリック = 完了とみなす）
      if (externalReviewUrl) {
        window.open(externalReviewUrl, '_blank', 'noopener,noreferrer');
      }

      // 2. レビュー完了をlocalStorageに保存
      markReviewAsCompleted();

      // 3. トーストを表示
      toast.success('ご協力ありがとうございます！', {
        description: 'アルバムを開きます',
        duration: 2000,
      });

      // 4. アルバムページへ遷移（同時または直後）
      setTimeout(() => {
        router.push(albumPath);
      }, 300);
    } catch (error) {
      console.error('Error opening external review site:', error);
      toast.error('エラーが発生しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  // Case B: 低評価（1-3つ星）→ 内部フィードバック送信
  const handleLowRatingSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('ご意見を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. フィードバック送信（Mock）
      if (onReviewSubmit) {
        await onReviewSubmit(selectedRating!, feedback);
      } else {
        // デフォルトのMock処理
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. レビュー完了をlocalStorageに保存
      markReviewAsCompleted();

      // 3. トーストを表示
      toast.success('貴重なご意見をありがとうございます', {
        description: 'アルバムを開きます',
        duration: 2000,
      });

      // 4. アルバムページへ遷移
      setTimeout(() => {
        router.push(albumPath);
      }, 500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('送信に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  const isHighRating = selectedRating !== null && selectedRating >= ratingThreshold;
  const isLowRating = selectedRating !== null && selectedRating < ratingThreshold;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 背景: ブラーのかかった幸せな雰囲気の画像 */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
          alt="Wedding celebration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* ブラーオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/70 to-amber-50/80 backdrop-blur-sm" />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'w-full max-w-2xl',
            'bg-[#FAF9F6] rounded-3xl shadow-2xl',
            'p-8 md:p-12',
            'border border-gray-200/50'
          )}
        >
          {/* 装飾: 上部のゴールドラインとSparkles */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-t-3xl" />
          <div className="absolute top-6 right-6 opacity-40">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>

          {/* コンテンツエリア */}
          <div className="relative space-y-8 md:space-y-10">
            {/* 完了モード: レビュー済みの場合 */}
            {hasAlreadyReviewed ? (
              <div className="text-center space-y-8 md:space-y-10">
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-[#D4AF37]/20">
                    <Heart className="w-12 h-12 md:w-14 md:h-14 text-[#D4AF37] fill-[#D4AF37]" />
                  </div>
                  <div className="space-y-4">
                    <h2 className={cn(
                      'text-2xl md:text-3xl font-serif font-bold',
                      'text-gray-900 tracking-wide',
                      'leading-loose'
                    )}>
                      感想をお寄せいただき、ありがとうございました！
                    </h2>
                    <p className={cn(
                      'text-base md:text-lg text-gray-700',
                      'font-serif leading-relaxed'
                    )}>
                      お二人の末永い幸せをお祈り申し上げます。
                    </p>
                  </div>
                </div>

                {/* アルバムを見るボタン */}
                <Button
                  onClick={() => router.push(albumPath)}
                  className={cn(
                    'w-full h-14 md:h-16',
                    'bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37]',
                    'hover:from-amber-500 hover:via-[#D4AF37] hover:to-amber-500',
                    'text-white font-semibold text-base md:text-lg',
                    'transition-all duration-200 active:scale-95',
                    'shadow-lg hover:shadow-xl',
                    'rounded-xl',
                    'font-serif'
                  )}
                >
                  アルバムを見る
                </Button>
              </div>
            ) : (
              <>
                {/* ヘッダー: お祝いの言葉 */}
                <div className="text-center space-y-6">
                  <h1 className={cn(
                    'text-2xl md:text-3xl font-serif font-bold',
                    'text-[#D4AF37] tracking-wide',
                    'leading-loose'
                  )}>
                    この度は誠におめでとうございます。
                  </h1>
              
              <div className={cn(
                'space-y-4 text-gray-700',
                'text-base md:text-lg leading-loose',
                'font-serif'
              )}>
                <p>
                  最高の1日を、お手伝いできたことに感謝して。
                </p>
                <p>
                  お二人の大切な門出に立ち会えたこと、スタッフ一同心より嬉しく思います。
                </p>
              </div>

              <div className={cn(
                'pt-4 border-t border-gray-200/50',
                'text-gray-600 text-sm md:text-base leading-relaxed',
                'font-serif'
              )}>
                <p>
                  より多くのカップルに幸せを届けるために、お二人の率直な感想をお聞かせいただけませんか？
                </p>
              </div>
            </div>

            {/* STEP 1: 星評価 */}
            {step === 'rating' && (
              <div className="flex flex-col items-center space-y-4 py-4">
                <label className="text-sm text-gray-600 font-medium">
                  評価をお願いします
                </label>
                <div className="flex items-center gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = selectedRating !== null && selectedRating >= rating;
                    return (
                      <button
                        key={rating}
                        onClick={() => handleRatingSelect(rating)}
                        className={cn(
                          'transition-all duration-300 ease-out',
                          'active:scale-95',
                          isSelected
                            ? 'text-[#D4AF37] fill-[#D4AF37] scale-110 drop-shadow-md'
                            : 'text-gray-300 fill-gray-300 hover:scale-105 hover:text-gray-400'
                        )}
                        aria-label={`${rating}つ星`}
                      >
                        <Star className="w-10 h-10 md:w-12 md:h-12" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: 評価による分岐フロー */}
            <AnimatePresence>
              {step === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="space-y-8 md:space-y-10"
                >
                  {/* Case A: 高評価 (4-5つ星) */}
                  {isHighRating && (
                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                        <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-[#D4AF37]/20">
                          <Heart className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                          <p className={cn(
                            "text-base md:text-lg text-gray-700 leading-relaxed",
                            "font-serif"
                          )}>
                            温かい評価をありがとうございます！よろしければ、Googleマップにもご投稿いただけると励みになります。
                          </p>
                        </div>
                      </div>

                      {/* Primary Action: Googleマップへ投稿してアルバムを見る */}
                      <Button
                        onClick={handleHighRatingSubmit}
                        disabled={isSubmitting}
                        className={cn(
                          'w-full h-14 md:h-16',
                          'bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37]',
                          'hover:from-amber-500 hover:via-[#D4AF37] hover:to-amber-500',
                          'text-white font-semibold text-base md:text-lg',
                          'transition-all duration-200 active:scale-95',
                          'shadow-lg hover:shadow-xl',
                          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                          'rounded-xl',
                          'font-serif'
                        )}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            開いています...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2 md:gap-3">
                            口コミサイトへ投稿してアルバムを見る
                            <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
                          </span>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Case B: 低評価 (1-3つ星) */}
                  {isLowRating && (
                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                        <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-emerald-200/50">
                          <Mail className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                          <p className={cn(
                            "text-base md:text-lg text-gray-700 leading-relaxed",
                            "font-serif"
                          )}>
                            ご期待に添えず申し訳ありません。改善のため、気になった点を具体的にお聞かせください。
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        {/* フィードバック入力エリア */}
                        <div className="space-y-3">
                          <label htmlFor="feedback" className="block text-sm text-gray-600 font-medium">
                            ご意見・ご感想
                          </label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="気になった点や、改善してほしい点について..."
                            rows={8}
                            required
                            className={cn(
                              'resize-none transition-all duration-200',
                              'focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
                              'border-gray-300 rounded-xl',
                              'text-base md:text-lg leading-relaxed',
                              'p-4 md:p-6',
                              'bg-white/80 backdrop-blur-sm',
                              'font-serif',
                              'placeholder:text-gray-400'
                            )}
                          />
                        </div>

                        {/* Primary Action: ご意見を送ってアルバムを見る */}
                        <Button
                          onClick={handleLowRatingSubmit}
                          disabled={isSubmitting || !feedback.trim()}
                          className={cn(
                            'w-full h-14 md:h-16',
                            'bg-gradient-to-r from-emerald-500 to-teal-600',
                            'hover:from-emerald-600 hover:to-teal-700',
                            'text-white font-semibold text-base md:text-lg',
                            'transition-all duration-200 active:scale-95',
                            'shadow-lg hover:shadow-xl',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                            'rounded-xl',
                            'font-serif'
                          )}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-3">
                              <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              送信中...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2 md:gap-3">
                              ご意見を送ってアルバムを見る
                              <Send className="w-5 h-5 md:w-6 md:h-6" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
