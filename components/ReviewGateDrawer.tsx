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

  // Google Mapsレビュー投稿（スコアに関わらず常に利用可能）
  const handleGoogleMapsSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Google Mapsを開く
      if (googleMapsUrl) {
        window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
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

  // 内部フィードバック送信（スコアに関わらず常に利用可能）
  const handleInternalFeedbackSubmit = async () => {
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

          {/* STEP 2: フィードバック選択（スコアに関わらず両方のオプションを表示） */}
          {step === 'feedback' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-emerald-50 rounded-full">
                  <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    ご感想をお聞かせください
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    より良いサービスを提供するために、ご協力をお願いいたします。
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Google Mapsレビューボタン（googleMapsUrlが存在する場合のみ表示） */}
                {googleMapsUrl && (
                  <Button
                    onClick={handleGoogleMapsSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base',
                      'transition-all duration-200 active:scale-95',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Googleマップで応援コメントを書く
                      <ExternalLink className="w-5 h-5" />
                    </span>
                  </Button>
                )}

                {/* 区切り線 */}
                {googleMapsUrl && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">または</span>
                    </div>
                  </div>
                )}

                {/* 内部フィードバックフォーム */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      スタッフへ直接メッセージを送る
                    </label>
                    <p className="text-xs text-gray-500">
                      返信が必要な方はこちら
                    </p>
                  </div>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="ご意見・ご要望・改善してほしい点など、お気軽にお聞かせください..."
                    rows={6}
                    className={cn(
                      'resize-none transition-all duration-200',
                      'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                      'border-gray-300'
                    )}
                  />

                  <Button
                    onClick={handleInternalFeedbackSubmit}
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
                      <span className="flex items-center justify-center gap-2">
                        スタッフへご意見・ご要望を送る
                        <MessageSquareQuote className="w-5 h-5" />
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
