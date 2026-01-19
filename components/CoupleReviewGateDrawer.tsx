'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Star, Heart, Mail, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CoupleReviewGateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  googleMapsUrl?: string; // TODO: externalReviewUrl にリネーム予定
  ratingThreshold?: number; // デフォルト: 4
  coupleId?: string | number; // localStorage用のID
}

export function CoupleReviewGateDrawer({
  open,
  onOpenChange,
  onUnlock,
  googleMapsUrl,
  ratingThreshold = 4,
  coupleId = 'default',
}: CoupleReviewGateDrawerProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'feedback'>('rating');

  // localStorageのキー生成
  const getReviewStorageKey = () => `wedding_app_has_reviewed_${coupleId}`;

  // レビュー完了をlocalStorageに保存
  const markReviewAsCompleted = () => {
    try {
      localStorage.setItem(getReviewStorageKey(), 'true');
    } catch (error) {
      console.error('Error saving review status to localStorage:', error);
    }
  };

  // ドロワーが閉じられたときに状態をリセット
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRating(null);
      setFeedback('');
      setStep('rating');
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    // スムーズにSTEP 2へ遷移
    setTimeout(() => {
      setStep('feedback');
    }, 400);
  };

  // Google Mapsレビュー投稿（スコアに関わらず常に利用可能）
  const handleGoogleMapsSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. 【最優先】まずドロワーを閉じる
      onOpenChange(false);
      
      // 2. その後に外部サイトを開く（Reactの再レンダリング競合を避けるため、わずかな遅延を入れる）
      if (googleMapsUrl) {
        // ユーザーアクションのコンテキストを保持するため、すぐに開く
        setTimeout(() => {
          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        }, 0);
      }
      
      // 3. レビュー完了をlocalStorageに保存（二重表示の防止）
      markReviewAsCompleted();

      // 4. 完了トーストを表示
      toast.success('ご協力ありがとうございます！', {
        description: '写真を閲覧できるようになりました',
        duration: 3000,
      });
      
      // 5. ロック解除（閲覧ロック解除）
      onUnlock();
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      setIsSubmitting(false);
      // エラー時もドロワーを閉じる
      onOpenChange(false);
    }
  };

  // 内部フィードバック送信（スコアに関わらず常に利用可能）
  const handleInternalFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. フィードバック送信（非同期処理を開始）
      // TODO: API呼び出しでフィードバックを送信
      const submitPromise = new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 2. レビュー完了をlocalStorageに保存（二重表示の防止）
      markReviewAsCompleted();

      // 3. 感謝のトーストを表示
      toast.success('貴重なご意見をありがとうございます', {
        description: '写真を閲覧できるようになりました',
        duration: 3000,
      });
      
      // 4. 【重要】即座にドロワーを閉じる（API完了を待たない）
      onOpenChange(false);
      
      // 5. ロック解除（閲覧ロック解除）
      onUnlock();
      
      // 6. バックグラウンドでAPI処理を完了
      await submitPromise;
      
      setIsSubmitting(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
      // エラー時もドロワーを閉じる
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "h-[85vh] overflow-y-auto",
          "bg-[#FAF9F6] border-t-2 border-[#D4AF37]" // 紙の質感 + ゴールドライン
        )}
      >
        {/* 装飾: 上部のゴールドラインとSparkles */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <div className="absolute top-4 right-4 opacity-30">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
        </div>

        <SheetHeader className="relative pt-8 pb-6">
          <SheetTitle className={cn(
            "text-2xl md:text-3xl font-serif text-gray-900",
            "leading-relaxed tracking-wide",
            "text-center md:text-left"
          )}>
            {step === 'rating' ? '最高の1日を、お手伝いできたことに感謝して。' : ''}
          </SheetTitle>
          <SheetDescription className={cn(
            "text-base md:text-lg text-gray-700 leading-relaxed",
            "mt-6 space-y-4",
            "text-center md:text-left"
          )}>
            {step === 'rating' && (
              <div className="space-y-4 font-serif">
                <p>
                  この度は誠におめでとうございます。
                </p>
                <p>
                  お二人の大切な門出に立ち会えたこと、スタッフ一同心より嬉しく思います。
                </p>
                <p className="pt-2">
                  幸せの余韻の中で、もしよろしければ、
                  <br className="md:hidden" />
                  お二人の率直な感想をお聞かせいただけませんか？
                </p>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 md:mt-12 space-y-8 md:space-y-10 px-4 md:px-0">
          {/* STEP 1: 祝福と評価 */}
          {step === 'rating' && (
            <div className="flex flex-col items-center space-y-8 md:space-y-10 py-4">
              <div className="flex items-center gap-4 md:gap-6">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = selectedRating !== null && selectedRating >= rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => handleRatingSelect(rating)}
                      className={cn(
                        'transition-all duration-300 ease-out active:scale-95',
                        isSelected
                          ? 'text-[#D4AF37] fill-[#D4AF37] scale-110 drop-shadow-lg'
                          : 'text-gray-300 fill-gray-300 hover:scale-105 hover:text-gray-400'
                      )}
                    >
                      <Star className="w-12 h-12 md:w-16 md:h-16" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: フィードバック選択（スコアに関わらず両方のオプションを表示） */}
          {step === 'feedback' && (
            <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300 px-2 md:px-0">
              <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-[#D4AF37]/20">
                  <Heart className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
                <div className="space-y-4 max-w-2xl">
                  <h3 className={cn(
                    "text-xl md:text-2xl font-serif font-bold text-gray-900",
                    "leading-relaxed"
                  )}>
                    お二人の率直な感想をお聞かせください
                  </h3>
                  <p className={cn(
                    "text-base md:text-lg text-gray-700 leading-relaxed",
                    "font-serif whitespace-pre-line"
                  )}>
                    より多くのカップルに幸せを届けるために、ご協力をお願いいたします。
                  </p>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* Google Mapsレビューボタン（googleMapsUrlが存在する場合のみ表示） */}
                {googleMapsUrl && (
                  <Button
                    onClick={handleGoogleMapsSubmit}
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
                    <span className="flex items-center justify-center gap-2 md:gap-3">
                      Googleマップで応援コメントを書く
                      <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
                    </span>
                  </Button>
                )}

                {/* 区切り線 */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[#FAF9F6] px-4 text-gray-500 font-serif">または</span>
                  </div>
                </div>

                {/* 内部フィードバックフォーム */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 font-serif">
                      スタッフへ直接メッセージを送る
                    </label>
                    <p className="text-xs text-gray-500 font-serif">
                      返信が必要な方はこちら
                    </p>
                  </div>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="ご意見・ご要望・改善してほしい点など、お気軽にお聞かせください..."
                    rows={6}
                    className={cn(
                      'resize-none transition-all duration-200',
                      'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                      'border-gray-300 rounded-xl',
                      'text-base md:text-lg leading-relaxed',
                      'p-4 md:p-6',
                      'bg-white/80 backdrop-blur-sm',
                      'font-serif'
                    )}
                  />

                  <Button
                    onClick={handleInternalFeedbackSubmit}
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
                      <span className="flex items-center justify-center gap-2 md:gap-3">
                        <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        送信中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 md:gap-3">
                        スタッフへご意見・ご要望を送る
                        <Mail className="w-5 h-5 md:w-6 md:h-6" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
