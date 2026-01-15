'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils/cn';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';
import { PostWeddingThankYouCard } from '@/components/PostWeddingThankYouCard';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

// アイコン (インラインSVG)
const Icons = {
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
  MessageSquareText: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  PenLine: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Circle: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
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
  ImageOff: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M10.5 10.5L7 7l-3 3v8a2 2 0 0 0 2 2h12l-3-3"/>
      <path d="M14 14l-4-4-4 4"/>
      <path d="M17 17l-3-3 3-3"/>
      <path d="M21 15V7a2 2 0 0 0-2-2H9l4 4h8z"/>
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Images: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
};

// モックデータ
const MOCK_WEDDING = {
  weddingDate: new Date('2026-03-15'),
  tables: [
    // 1. 写真あり・完了状態 (A卓)
    {
      id: 'table-a',
      name: 'A',
      message: 'みんな久しぶり！今日は楽しんでいってね！',
      photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop',
      photos: [] as File[],
      isSkipped: false,
      isCompleted: true,
    },
    // 2. 写真なし・完了状態 (B卓 - スキップ済み)
    {
      id: 'table-b',
      name: 'B卓 (親族)',
      message: '',
      photoUrl: null,
      photos: [] as File[],
      isSkipped: true,
      isCompleted: true,
    },
    // 3. 未完了状態 (C卓)
    {
      id: 'table-c',
      name: 'C卓',
      message: '',
      photoUrl: null,
      photos: [] as File[],
      isCompleted: false,
    },
    // 4. 写真あり・完了状態 (D卓)
    {
      id: 'table-d',
      name: 'D',
      message: 'いつもありがとう！',
      photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1949&auto=format&fit=crop',
      photos: [] as File[],
      isSkipped: false,
      isCompleted: true,
    },
    // 5. 写真なし・完了状態 (E卓 - スキップ済み)
    {
      id: 'table-e',
      name: 'E',
      message: '',
      photoUrl: null,
      photos: [] as File[],
      isSkipped: true,
      isCompleted: true,
    },
    // 6. 未完了状態 (F卓)
    {
      id: 'table-f',
      name: 'F',
      message: '',
      photoUrl: null,
      photos: [] as File[],
      isSkipped: false,
      isCompleted: false,
    },
  ],
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

export default function CoupleTablesPage() {
  const [daysUntil, setDaysUntil] = useState(calculateDaysUntil(MOCK_WEDDING.weddingDate));
  const [tables, setTables] = useState(MOCK_WEDDING.tables);
  
  // 式前/式後の判定（当日以降は式後とみなす）
  const isWeddingDayOrAfter = daysUntil === 0 || daysUntil < 0;
  
  // 卓ごとの設定の状態
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isTableSheetOpen, setIsTableSheetOpen] = useState(false);
  const [currentTableName, setCurrentTableName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentPhotos, setCurrentPhotos] = useState<File[]>([]);
  
  // 共通の状態
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'table' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // コンプライアンスチェック関連
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasAgreedToCompliance, setHasAgreedToCompliance] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // プレビューURLのクリーンアップ（モーダルが閉じられたとき）
  useEffect(() => {
    if (!showComplianceModal && previewUrls.length > 0) {
      // モーダルが閉じられたときにプレビューURLをクリーンアップ
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComplianceModal]);

  // 日付の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil(MOCK_WEDDING.weddingDate));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // Celebration Mode: 当日以降は紙吹雪を表示
  useEffect(() => {
    if (isWeddingDayOrAfter) {
      const duration = 3000;
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

        const particleCount = 50 * (timeLeft / duration);
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
    }
  }, [isWeddingDayOrAfter]);

  // 卓ごとの設定のハンドラー
  const handleTableClick = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(tableId);
      setCurrentTableName(table.name);
      setCurrentMessage(table.message);
      setCurrentPhotos(table.photos);
      setIsTableSheetOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // ファイルをステートに保存してコンプライアンスチェックモーダルを表示
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    
    // プレビューURLを生成
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setShowComplianceModal(true);
    setHasAgreedToCompliance(false); // リセット
    // ファイル入力のリセット（モーダル内で確認後、アップロード実行）
    e.target.value = '';
  };
  
  // コンプライアンスチェック後の写真追加処理
  const handlePhotoUploadAfterCompliance = async () => {
    if (selectedFiles.length === 0) return;

    if (!hasAgreedToCompliance) {
      toast.error('投稿前に約束に同意してください', {
        description: 'マナーチェックボックスにチェックを入れてください',
        duration: 3000,
      });
      return;
    }

    // ファイルをcurrentPhotosに追加
    setCurrentPhotos(prev => [...prev, ...selectedFiles]);
    
    // コンプライアンスチェックモーダルを閉じる
    setShowComplianceModal(false);
    setSelectedFiles([]);
    setHasAgreedToCompliance(false);
    
    toast.success('写真を追加しました', {
      description: '保存ボタンを押して設定を保存してください',
      duration: 3000,
    });
  };

  const handleRemovePhoto = (index: number) => {
    setCurrentPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTable = async () => {
    if (!selectedTable) return;
    
    setIsUploading(true);
    
    // モック: 保存処理
    setTimeout(() => {
      setTables(prev => prev.map(table => 
        table.id === selectedTable
          ? { ...table, name: currentTableName, message: currentMessage, photos: currentPhotos, isSkipped: false }
          : table
      ));
      setIsUploading(false);
      setIsTableSheetOpen(false);
    }, 1500);
  };

  const handleSkipTable = async () => {
    if (!selectedTable) return;
    
    setIsUploading(true);
    
    // モック: スキップ処理
    setTimeout(() => {
      setTables(prev => prev.map(table => 
        table.id === selectedTable
          ? { ...table, isSkipped: true, message: '', photos: [] }
          : table
      ));
      setIsUploading(false);
      setIsTableSheetOpen(false);
    }, 500);
  };

  const handlePreview = (type: 'table') => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  // 進捗計算
  const completedTables = tables.filter(table => 
    table.isCompleted === true || table.isSkipped === true
  ).length;
  const totalTables = tables.length;
  const progressPercentage = totalTables > 0 ? (completedTables / totalTables) * 100 : 0;

  const coupleId = 1;

  // 挙式後の場合は、サンクスレターカードを表示
  if (isWeddingDayOrAfter) {
    return (
      <PostWeddingThankYouCard
        coupleId={coupleId}
        onReviewSubmit={async (rating, comment) => {
          console.log('Review submitted:', { rating, comment });
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
        {/* ヘッダー */}
        <section>
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 tracking-tight text-balance">
              卓ごとのサプライズ 📸
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              ゲストが席に着いた瞬間、懐かしい写真でお出迎え！あの頃の思い出や、みんなにしか通じない「内輪ネタ」を仕込んで、乾杯前から盛り上げちゃおう🎉
            </p>
          </div>
        </section>

        {/* 卓一覧: 詳細グリッド */}
        <section>
          {/* 進捗状況 */}
          <div className="mb-4 md:mb-6 bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-sm font-semibold text-gray-700">完了状況</span>
              <span className="text-base md:text-lg font-bold text-emerald-600">
                {completedTables} / {totalTables} 卓
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  "h-full rounded-full",
                  progressPercentage === 100 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                )}
              />
            </div>
          </div>

          <div className="mb-3 md:mb-4">
            <p className="text-sm text-gray-600 leading-relaxed mb-3 md:mb-4">
              編集したいテーブルをタップしてね 👇
            </p>
          </div>

          {/* アルバムカバー風グリッド */}
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => {
              // 状態判定: 優先順位で判定
              const hasPhotoUrl = table.photoUrl !== null && table.photoUrl !== undefined && table.photoUrl !== '';
              const isSkipped = table.isSkipped === true;
              const isCompleted = table.isCompleted === true || isSkipped || hasPhotoUrl;
              
              // パターン1: 写真あり・完了 (Done) ✨
              const pattern1 = hasPhotoUrl && isCompleted;
              // パターン2: 未登録 (ToDo) 🎨
              const pattern2 = !hasPhotoUrl && !isSkipped && !isCompleted;
              // パターン3: 登録しない/スキップ (Skipped) ⏭️
              const pattern3 = !hasPhotoUrl && isSkipped && isCompleted;

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden transition-all duration-200 active:scale-95",
                    "shadow-sm hover:shadow-md",
                    // パターン2: 未登録の場合は太めの破線枠（目立たせる）
                    pattern2 && "bg-white border-4 border-dashed border-emerald-400 ring-2 ring-emerald-200",
                    // パターン3: スキップ済みの場合は薄いグレー背景
                    pattern3 && "bg-gray-100",
                    // パターン1: 完了済みは少し薄く（未完了を目立たせるため）
                    pattern1 && "opacity-90"
                  )}
                >
                  {/* パターン1: 写真あり・完了 - 背景に写真を表示 */}
                  {pattern1 && (
                    <>
                      <img
                        src={table.photoUrl}
                        alt={`${table.name}卓の写真`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </>
                  )}

                  {/* パターン2: 未登録 - 白背景、中央に大きな＋アイコン */}
                  {pattern2 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icons.Plus className="w-20 h-20 text-emerald-500" />
                    </div>
                  )}

                  {/* パターン3: スキップ済み - 薄いグレー背景、中央に共通写真アイコン */}
                  {pattern3 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Icons.Images className="w-16 h-16 text-gray-400 mb-2" />
                    </div>
                  )}

                  {/* ステータスバッジ: 右上 */}
                  <div className="absolute top-3 right-3 z-10">
                    {pattern1 ? (
                      // パターン1: 緑のチェックマーク
                      <div className="bg-emerald-500 rounded-full p-1.5 drop-shadow-lg flex items-center justify-center">
                        <Icons.Check className="w-4 h-4 text-white" />
                      </div>
                    ) : pattern3 ? (
                      // パターン3: 「共通写真」バッジ
                      <div className="bg-gray-200 rounded-full px-2.5 py-1 drop-shadow-sm">
                        <span className="text-xs font-medium text-gray-600">共通</span>
                      </div>
                    ) : (
                      // パターン2: 「未設定」バッジ
                      <div className="bg-orange-100 rounded-full px-2.5 py-1 drop-shadow-sm">
                        <span className="text-xs font-medium text-orange-700">未設定</span>
                      </div>
                    )}
                  </div>

                  {/* 卓名ラベル: 左下に統一（全パターン共通） */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-200/50">
                      <span className="text-lg font-bold text-gray-900">
                        {table.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 卓詳細シート（下からスライドアップ） */}
      <Sheet open={isTableSheetOpen} onOpenChange={setIsTableSheetOpen}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">卓詳細設定</SheetTitle>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentTableName}
                onChange={(e) => setCurrentTableName(e.target.value)}
                className="text-2xl font-bold tracking-tight bg-transparent border-none outline-none text-gray-900 w-auto"
                placeholder="卓名"
              />
              <Icons.PenLine className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            <SheetDescription>
              写真とメッセージを登録しましょう
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* メッセージ入力 */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icons.MessageSquareText className="w-4 h-4 text-gray-600" />
                メッセージ
              </label>
              <textarea
                id="message"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="久しぶり！楽しんでね"
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
                思い出の写真を追加
              </label>
              
              {/* ネイティブファイルピッカーボタン */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* 選択された写真のプレビュー */}
              {currentPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {currentPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemovePhoto(index)}
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
              onClick={() => handlePreview('table')}
              disabled={currentPhotos.length === 0 && currentMessage.length === 0}
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
              onClick={handleSaveTable}
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

            {/* スキップボタン */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSkipTable}
                disabled={isUploading}
                className={cn(
                  "w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                この卓は個別の写真を登録しない（完了にする）
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ※その場合は、STEP 1で設定した「全員への写真」が自動的に表示されます。
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* プレビューモーダル */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">ゲストの画面プレビュー</DialogTitle>
            <DialogDescription>
              実際のゲスト画面での表示を確認できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {/* スマホモックアップ枠 */}
            <div className="relative mx-auto w-[320px] h-[600px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                {/* モックアップのコンテンツ */}
                <div className="h-full overflow-y-auto p-4">
                  {currentMessage && (
                    <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentMessage}</p>
                    </div>
                  )}
                  {currentPhotos.length > 0 ? (
                    <div className="space-y-3">
                      {currentPhotos.map((photo, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                      写真がありません
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* コンプライアンスチェックモーダル */}
      <Dialog 
        open={showComplianceModal} 
        onOpenChange={(open) => {
          setShowComplianceModal(open);
          if (!open) {
            // モーダルを閉じる際にクリーンアップ
            setSelectedFiles([]);
            setHasAgreedToCompliance(false);
            // プレビューURLのクリーンアップはuseEffectで処理
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif flex items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              写真を登録する前に
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              この写真は<strong>ゲストに公開</strong>されます。<br />
              以下の写真は絶対に登録しないでください。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* 警告エリア */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔞</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">公序良俗に反する写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">性的・暴力的な内容を含む写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💔</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">ゲストが不快になる写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">関係者を不快にさせる写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🍺</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">泥酔や迷惑行為の写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">他のゲストや会場に迷惑をかける様子の写真</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿者責任の明示 */}
            <p className="text-xs text-stone-500 text-center font-serif">
              ※登録された写真は、<strong>ゲスト全員に公開</strong>されます。
            </p>

            {/* 写真プレビュー */}
            {selectedFiles.length > 0 && previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-stone-50 rounded-lg">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={previewUrls[index]}
                      alt={`プレビュー ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 同意チェックボックス */}
            <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <Checkbox
                id="compliance-check"
                checked={hasAgreedToCompliance}
                onCheckedChange={(checked) => setHasAgreedToCompliance(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="compliance-check"
                className="flex-1 text-sm text-stone-700 font-serif cursor-pointer leading-relaxed"
              >
                マナーを守り、適切な写真を登録することを約束します
              </label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
            <button
              onClick={() => {
                setShowComplianceModal(false);
                setSelectedFiles([]);
                setHasAgreedToCompliance(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handlePhotoUploadAfterCompliance}
              disabled={!hasAgreedToCompliance || isUploading}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>追加中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>写真を追加する</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
