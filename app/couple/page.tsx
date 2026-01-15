'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { Users, Grid, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PostWeddingThankYouCard } from '@/components/PostWeddingThankYouCard';
import { getWeddingInfo, getWeddingTables, getWeddingDate } from '@/lib/services/mock/weddingService';

// アイコン (インラインSVG)
const Icons = {
  MessageSquareText: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  ImagePlus: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Eye: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// カウントダウン計算
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

const MOCK_WEDDING_ID = 'wedding-1'; // TODO: 認証情報から取得

export default function CoupleHomePage() {
  const router = useRouter();
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [tables, setTables] = useState<Array<{ id: string; name: string; isCompleted: boolean }>>([]);
  const [daysUntil, setDaysUntil] = useState(0);
  const isWeddingDayOrAfter = daysUntil === 0 || daysUntil < 0;
  
  // 全員への写真の状態
  const [sharedPhotos, setSharedPhotos] = useState<File[]>([]);
  const [sharedMessage, setSharedMessage] = useState('');
  const [isSharedSheetOpen, setIsSharedSheetOpen] = useState(false);
  const [currentSharedPhotos, setCurrentSharedPhotos] = useState<File[]>([]);
  const [currentSharedMessage, setCurrentSharedMessage] = useState('');
  
  // 共通の状態
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'shared' | null>(null);
  const sharedFileInputRef = useRef<HTMLInputElement>(null);

  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wedding, weddingTables, date] = await Promise.all([
          getWeddingInfo(MOCK_WEDDING_ID),
          getWeddingTables(MOCK_WEDDING_ID),
          getWeddingDate(MOCK_WEDDING_ID),
        ]);
        setWeddingDate(date);
        setTables(weddingTables.map(t => ({ id: t.id, name: t.name, isCompleted: t.isCompleted })));
        setDaysUntil(calculateDaysUntil(date));
      } catch (error) {
        console.error('Failed to load wedding data:', error);
      }
    };
    loadData();
  }, []);

  // 進捗計算
  const sharedCompleted = sharedPhotos.length > 0 || sharedMessage.length > 0;
  const tableCompletedCount = tables.filter(table => table.isCompleted).length;
  
  // 2ステップ方式の完了判定
  const step1Completed = sharedCompleted;
  const step2Completed = tableCompletedCount > 0;
  const allStepsCompleted = step1Completed && step2Completed;

  // 日付の更新
  useEffect(() => {
    if (!weddingDate) return;
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil(weddingDate));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // 全員への写真のハンドラー
  const handleSharedClick = () => {
    setCurrentSharedPhotos(sharedPhotos);
    setCurrentSharedMessage(sharedMessage);
    setIsSharedSheetOpen(true);
  };

  const handleSharedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCurrentSharedPhotos(prev => [...prev, ...files]);
  };

  const handleRemoveSharedPhoto = (index: number) => {
    setCurrentSharedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveShared = async () => {
    setIsUploading(true);
    
    // モック: 保存処理
    setTimeout(() => {
      setSharedPhotos(currentSharedPhotos);
      setSharedMessage(currentSharedMessage);
      setIsUploading(false);
      setIsSharedSheetOpen(false);
    }, 1500);
  };

  const handlePreview = (type: 'shared') => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const coupleId = 1;

  // 挙式後の場合は、サンクスレターカードを表示
  if (isWeddingDayOrAfter) {
    return (
      <PostWeddingThankYouCard
        coupleId={coupleId}
        onReviewSubmit={async (rating, comment) => {
          // TODO: API経由でレビューを送信
          await new Promise(resolve => setTimeout(resolve, 1000));
        }}
        albumPath="/couple/gallery"
      />
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-24">
      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto px-4 py-4 md:py-6 space-y-3 md:space-y-6">
        {/* ゲストおもてなし準備: ステップガイド */}
        <section>
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2 tracking-tight text-balance">
              ゲストおもてなし準備
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              ゲストの皆様に喜んでいただけるよう、準備を進めましょう
            </p>
          </div>

          {/* All Set 状態の表示 */}
          {allStepsCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 md:mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 md:p-5 border-2 border-emerald-300 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-emerald-800 mb-1">
                    準備完了！
                  </p>
                  <p className="text-sm text-emerald-700">
                    あとは当日を楽しむだけです
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-3 md:space-y-4">
            {/* STEP 1: プロフィール・挨拶設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={handleSharedClick}
                className={cn(
                  "w-full rounded-xl p-4 md:p-6 border-2 shadow-sm transition-all duration-200",
                  "active:scale-[0.98] text-left relative overflow-hidden min-h-[100px] md:min-h-[120px]",
                  step1Completed
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-md"
                    : "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                )}
              >
                {/* 完了時の右端アイコン */}
                {step1Completed && (
                  <div className="absolute top-5 right-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-5 pr-20">
                  <div className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
                    step1Completed 
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-200" 
                      : "bg-emerald-50"
                  )}>
                    {step1Completed ? (
                      <Users className="w-8 h-8 text-emerald-700" />
                    ) : (
                      <Users className="w-8 h-8 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-full",
                        step1Completed
                          ? "text-emerald-800 bg-emerald-200"
                          : "text-emerald-700 bg-emerald-100"
                      )}>
                        STEP 1
                      </span>
                      {step1Completed ? (
                        <span className="text-xs font-bold text-emerald-700 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-300">
                          準備OK
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          未対応
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance">
                      プロフィール・挨拶設定
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      ゲスト全員に表示されるメッセージと写真を登録します
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* STEP 2: ゲスト・卓設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => router.push('/couple/tables')}
                className={cn(
                  "w-full rounded-xl p-4 md:p-6 border-2 shadow-sm transition-all duration-200",
                  "active:scale-[0.98] text-left relative overflow-hidden min-h-[100px] md:min-h-[120px]",
                  step2Completed
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-md"
                    : "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                )}
              >
                {/* 完了時の右端アイコン */}
                {step2Completed && (
                  <div className="absolute top-5 right-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-5 pr-20">
                  <div className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
                    step2Completed 
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-200" 
                      : "bg-emerald-50"
                  )}>
                    {step2Completed ? (
                      <Grid className="w-8 h-8 text-emerald-700" />
                    ) : (
                      <Grid className="w-8 h-8 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-full",
                        step2Completed
                          ? "text-emerald-800 bg-emerald-200"
                          : "text-emerald-700 bg-emerald-100"
                      )}>
                        STEP 2
                      </span>
                      {step2Completed ? (
                        <span className="text-xs font-bold text-emerald-700 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-300">
                          準備OK
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          未対応
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance">
                      ゲスト・卓設定
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2 md:mb-3">
                      テーブルごとに異なる思い出の写真を設定できます
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-semibold text-emerald-700 transition-colors border border-emerald-200">
                      <span>卓一覧を確認する</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 全員への写真シート（下からスライドアップ） */}
      <Sheet open={isSharedSheetOpen} onOpenChange={setIsSharedSheetOpen}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tight">
              全員へのウェルカムフォト
            </SheetTitle>
            <SheetDescription>
              会場の全員が見ることができる写真とメッセージを登録します
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* メッセージ入力 */}
            <div>
              <label htmlFor="shared-message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icons.MessageSquareText className="w-4 h-4 text-gray-600" />
                メッセージ（任意）
              </label>
              <textarea
                id="shared-message"
                value={currentSharedMessage}
                onChange={(e) => setCurrentSharedMessage(e.target.value)}
                placeholder="みなさん、本日はお越しいただきありがとうございます！"
                rows={4}
                className={cn(
                  "w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900 placeholder:text-gray-400",
                  "resize-none"
                )}
              />
            </div>

            {/* 写真選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                写真を追加
              </label>
              
              <button
                type="button"
                onClick={() => sharedFileInputRef.current?.click()}
                className={cn(
                  "w-full h-14 rounded-xl font-semibold text-emerald-600 text-base",
                  "border-2 border-emerald-300 bg-emerald-50",
                  "hover:bg-emerald-100 hover:border-emerald-400",
                  "active:scale-95 transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                )}
              >
                <Icons.ImagePlus className="w-5 h-5" />
                写真を追加
              </button>
              
              <input
                ref={sharedFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSharedFileSelect}
                className="hidden"
              />

              {/* 選択された写真のプレビュー */}
              {currentSharedPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {currentSharedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSharedPhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* プレビューボタン */}
            <button
              onClick={() => handlePreview('shared')}
              disabled={currentSharedPhotos.length === 0 && currentSharedMessage.length === 0}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-emerald-600 text-base",
                "border-2 border-emerald-300 bg-emerald-50",
                "hover:bg-emerald-100 hover:border-emerald-400",
                "active:scale-95 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              <Icons.Eye className="w-5 h-5" />
              ゲストの画面で確認する
            </button>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveShared}
              disabled={isUploading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white text-base",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "active:scale-95 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </span>
              ) : (
                '保存する'
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>プレビュー</DialogTitle>
            <DialogDescription>
              実際のゲスト画面での表示を確認できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {previewType === 'shared' && (
              <div className="space-y-4">
                {currentSharedMessage && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentSharedMessage}</p>
                  </div>
                )}
                {currentSharedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {currentSharedPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
