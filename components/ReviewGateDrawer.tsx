'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Star, Sparkles, MessageSquareQuote, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ReviewGateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  googleMapsUrl?: string;
}

export function ReviewGateDrawer({ open, onOpenChange, onUnlock, googleMapsUrl }: ReviewGateDrawerProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'feedback'>('rating');

  // ドロワーが閉じられたときに状態をリセット
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 閉じる時にリセット
      setSelectedRating(null);
      setFeedback('');
      setStep('rating');
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    // スムーズにSTEP 2へ遷移（アニメーションを考慮）
    setTimeout(() => {
      setStep('feedback');
    }, 400);
  };

  const handleHighRatingSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Google Mapsを開く
      if (googleMapsUrl) {
        window.open(googleMapsUrl, '_blank');
      }
      // 少し遅延を入れてからロック解除
      setTimeout(() => {
        onUnlock();
        onOpenChange(false);
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      setIsSubmitting(false);
    }
  };

  const handleLowRatingSubmit = async () => {
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: API呼び出しでフィードバックを送信
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onUnlock();
      onOpenChange(false);
      setIsSubmitting(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setIsSubmitting(false);
    }
  };

  const isHighRating = selectedRating !== null && selectedRating >= 4;
  const isLowRating = selectedRating !== null && selectedRating <= 3;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif text-gray-900">
            ご出席ありがとうございます
          </SheetTitle>
          <SheetDescription className="text-base text-gray-600">
            {step === 'rating' && '素敵な写真をダウンロードする前に、今日の結婚式の感想を5段階で教えてください。'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* STEP 1: 星評価 */}
          {step === 'rating' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = selectedRating !== null && selectedRating >= rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => handleRatingSelect(rating)}
                      className={cn(
                        'transition-all duration-200 ease-out active:scale-95',
                        isSelected
                          ? 'text-yellow-400 fill-yellow-400 scale-110'
                          : 'text-gray-200 fill-gray-200 hover:scale-105'
                      )}
                    >
                      <Star className="w-12 h-12 md:w-14 md:h-14" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: 条件分岐フロー */}
          {step === 'feedback' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* ケースA: 高評価 */}
              {isHighRating && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-full">
                      <Sparkles className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        素晴らしい評価をありがとうございます
                      </h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        よろしければ、Googleマップにも感想を投稿していただけませんか？{'\n'}
                        あなたの言葉が、新郎新婦と会場スタッフの大きな励みになります。
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleHighRatingSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base',
                      'transition-all duration-200 active:scale-95',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      口コミを投稿して写真を見る
                      <ExternalLink className="w-5 h-5" />
                    </span>
                  </Button>
                </div>
              )}

              {/* ケースB: 低評価 */}
              {isLowRating && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-full">
                      <MessageSquareQuote className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        貴重なご意見ありがとうございます
                      </h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        より良いサービスを提供するために、気になった点や改善点を教えていただけませんか？{'\n'}
                        ご意見は会場責任者のみが閲覧します。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="スタッフの対応や、料理についてなど..."
                      rows={6}
                      className={cn(
                        'resize-none transition-all duration-200',
                        'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                        'border-gray-300'
                      )}
                    />

                    <Button
                      onClick={handleLowRatingSubmit}
                      disabled={isSubmitting || !feedback.trim()}
                      className={cn(
                        'w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base',
                        'transition-all duration-200 active:scale-95',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
                      )}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          送信中...
                        </span>
                      ) : (
                        '意見を送信して写真を見る'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
