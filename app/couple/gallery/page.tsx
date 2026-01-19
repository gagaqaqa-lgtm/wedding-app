'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoupleReviewGateDrawer } from '@/components/CoupleReviewGateDrawer';
import { DownloadWaitModal } from '@/components/DownloadWaitModal';
import { AdCard } from '@/components/AdCard';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { Lock, Gift, Eye } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getWeddingDate, getWeddingInfo } from '@/lib/services/mock/weddingService';
import { getPhotosByWedding } from '@/lib/services/mock/photoService';
import type { Photo } from '@/lib/types/schema';

// アイコン (インラインSVG)
const Icons = {
  Heart: ({ className, filled }: { className?: string; filled?: boolean }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
    </svg>
  ),
  Download: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Users: ({ className }: { className?: string }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Smartphone: ({ className }: { className?: string }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
};

const MOCK_WEDDING_ID = '1'; // TODO: 認証情報から取得

// カウントダウン計算関数
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 日付フォーマット関数
function formatWeddingDate(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

type TabType = 'all' | 'table';

// PhotoItem型定義
interface PhotoItem {
  id: string;
  url: string;
  tableId: string | null;
  timestamp: Date;
  isFavorite: boolean;
}

function CoupleGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // デモ用デバッグモード
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [tables, setTables] = useState<Array<{ id: string; name: string }>>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // デモデータ生成関数（mode=today の場合）
  const generateDemoPhotos = (): PhotoItem[] => {
    const now = new Date();
    const demoPhotos: PhotoItem[] = [];
    
    for (let i = 0; i < 30; i++) {
      // ランダムなテーブルID（一部はnullで全員向け）
      const tableIds = ['table-a', 'table-b', 'table-c', 'table-d', null];
      const randomTableId = tableIds[Math.floor(Math.random() * tableIds.length)];
      
      // 過去30分以内のランダムなタイムスタンプ
      const randomMinutesAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(now.getTime() - randomMinutesAgo * 60 * 1000);
      
      demoPhotos.push({
        id: `demo-photo-${i + 1}`,
        url: `https://picsum.photos/400/300?random=${i + 1}`,
        tableId: randomTableId,
        timestamp: timestamp,
        isFavorite: Math.random() > 0.8, // 20%の確率でお気に入り
      });
    }
    
    return demoPhotos;
  };
  
  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        // デモモードの場合、ダミーデータを生成
        if (mode === 'today') {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          setWeddingDate(date);
          
          const demoPhotos = generateDemoPhotos();
          setPhotos(demoPhotos);
          setFavorites(new Set(demoPhotos.filter(p => p.isFavorite).map(p => p.id)));
          setDaysRemaining(0); // 当日なので0
          
          // デモ用のテーブルデータも生成
          setTables([
            { id: 'table-a', name: 'A卓' },
            { id: 'table-b', name: 'B卓' },
            { id: 'table-c', name: 'C卓' },
            { id: 'table-d', name: 'D卓' },
          ]);
          return;
        }
        
        // 通常モード: APIからデータを取得
        const [date, wedding, allPhotos] = await Promise.all([
          getWeddingDate(MOCK_WEDDING_ID),
          getWeddingInfo(MOCK_WEDDING_ID),
          getPhotosByWedding(MOCK_WEDDING_ID),
        ]);
        setWeddingDate(date);
        // 写真データを変換（Photo型から内部型へ）
        const convertedPhotos = allPhotos.map(p => ({
          id: p.id,
          url: p.url,
          tableId: p.tableId,
          timestamp: new Date(p.uploadedAt),
          isFavorite: p.isFavorite || false,
        }));
        setPhotos(convertedPhotos);
        setFavorites(new Set(convertedPhotos.filter(p => p.isFavorite).map(p => p.id)));
        setDaysRemaining(calculateDaysUntil(date));
      } catch (error) {
        console.error('Failed to load gallery data:', error);
        // フォールバック: 今日の日付を使用
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setWeddingDate(today);
        setDaysRemaining(calculateDaysUntil(today));
      }
    };
    loadData();
  }, [mode]);
  
  // 挙式日までの日数を計算
  const [daysRemaining, setDaysRemaining] = useState(0);
  const isPreWedding = daysRemaining > 0;
  
  // レビューゲートの状態管理
  // 変更点1: 初期値は false (確認するまでは開かない)
  const [isReviewGateOpen, setIsReviewGateOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isDownloadUnlocked, setIsDownloadUnlocked] = useState(false);
  
  // ダウンロード待機モーダルの状態管理
  const [isDownloadWaitModalOpen, setIsDownloadWaitModalOpen] = useState(false);
  const [pendingDownloadAction, setPendingDownloadAction] = useState<(() => void | Promise<void>) | null>(null);

  // coupleId（モック: 実際はAPIや認証から取得）
  const coupleId = 1; // TODO: 実際のcoupleIdに置き換え（ダッシュボードと同じ値を使用）

  // 変更点2: ロジックの統合
  // マウント時に一度だけ実行し、ストレージの状況に応じて「開くかどうか」を決定する
  useEffect(() => {
    const checkReviewStatus = () => {
      try {
        const reviewStorageKey = `wedding_app_has_reviewed_${coupleId}`;
        const hasReviewedInStorage = localStorage.getItem(reviewStorageKey) === 'true';
        
        if (hasReviewedInStorage) {
          // 既に回答済みの場合
          setHasReviewed(true);
          setIsReviewGateOpen(false); // 明示的に閉じたままにする
        } else {
          // 未回答の場合のみ、ゲートを開く
          setHasReviewed(false);
          setIsReviewGateOpen(true);
        }
      } catch (error) {
        console.error('Error reading review status:', error);
        // エラー時は安全側に倒してゲートを開く（あるいは閉じるか、ポリシーによる）
        setIsReviewGateOpen(true); 
      }
    };

    checkReviewStatus();
  }, [coupleId]);

  // 日付の更新（1時間ごと）
  useEffect(() => {
    if (!weddingDate) return;
    const interval = setInterval(() => {
      setDaysRemaining(calculateDaysUntil(weddingDate));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // ※以前あった `useEffect(() => { if (!hasReviewed) setIsReviewGateOpen(true); }, ...)` は削除済み
  // 競合の原因になります。

  // サンプルプレビューボタンのハンドラ
  const handlePreviewClick = () => {
    toast.success('当日はこんな風に写真が並びます！', {
      description: 'ゲストの皆様の笑顔がここに集まります',
      duration: 3000,
    });
  };

  // 写真があるかどうか
  const hasPhotos = photos.length > 0;
  // const hasPhotos = false; // エンプティステートを表示する場合はこちらを有効化

  // ローディング状態（モック: 実際はAPIから取得）
  const [isLoading] = useState(false);

  // インフィード広告を含む写真リストを生成する関数
  // ルール: 最初の12枚目の直後に1つ目、以降24枚おきに挿入（写真が5枚以下は表示しない）
  const createItemsWithAds = <T extends { id: string; url: string }>(photos: T[]) => {
    // 写真が5枚以下の場合は広告を表示しない
    if (photos.length <= 5) {
      return photos.map((photo) => ({ type: 'photo' as const, data: photo }));
    }

    const items: Array<{ type: 'photo'; data: T } | { type: 'ad'; index: number }> = [];
    let adIndex = 0;

    photos.forEach((photo, index) => {
      items.push({ type: 'photo', data: photo });

      // 最初の12枚目の直後に1つ目の広告を挿入
      if (index === 11) {
        items.push({ type: 'ad', index: adIndex++ });
      }
      // 以降、24枚おきに広告を挿入（最初の12枚目は既に処理済みなので、36枚目、60枚目...）
      else if (index > 11 && (index - 11) % 24 === 0) {
        items.push({ type: 'ad', index: adIndex++ });
      }
    });

    return items;
  };

  // みんなの写真タブ用の広告付きリスト
  const itemsWithAds = useMemo(() => {
    const sortedPhotos = [...photos].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return createItemsWithAds(sortedPhotos);
  }, [photos]);

  const handlePhotoClick = (photoId: string) => {
    setSelectedPhoto(photoId);
  };

  const handleCloseLightbox = () => {
    setSelectedPhoto(null);
  };

  // ESCキーでライトボックスを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPhoto) {
        handleCloseLightbox();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedPhoto]);

  const toggleFavorite = (photoId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  /**
   * 画像URLからBlobを取得するヘルパー関数
   */
  const fetchImageAsBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return response.blob();
  };

  /**
   * 単一画像のダウンロード処理（スマートフォン対応）
   * 1. Web Share APIを優先的に使用（iOS/Android）
   * 2. 非対応の場合はBlob形式で強制ダウンロード
   */
  const executeDownload = async (url: string) => {
    try {
      // 画像をBlobとして取得
      const blob = await fetchImageAsBlob(url);
      
      // Web Share APIが利用可能な場合（モバイル端末）
      if (navigator.share && navigator.canShare) {
        try {
          // Fileオブジェクトを作成
          const file = new File([blob], 'photo.jpg', { type: blob.type });
          
          // Web Share APIで共有（「画像を保存」などが選べる）
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: '写真を保存',
            });
            toast.success('写真を共有しました', {
              description: '共有メニューから「画像を保存」を選択してください',
              duration: 3000,
            });
            return;
          }
        } catch (shareError: unknown) {
          // ユーザーが共有をキャンセルした場合などはエラーを無視
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            console.warn('Web Share API failed, falling back to blob download:', shareError);
          } else {
            // キャンセルされた場合は処理を終了
            return;
          }
        }
      }

      // Web Share APIが使えない場合、または共有が失敗した場合
      // Blob形式で強制ダウンロード
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'photo.jpg';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success('写真をダウンロードしました', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('ダウンロードに失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
      });
    }
  };

  /**
   * 一括ダウンロード処理（ZIPファイルとして）
   * 全ての画像をZIPファイルにまとめて1回でダウンロード
   */
  const executeBulkDownload = async () => {
    const loadingToastId = toast.loading('ZIPファイルを作成中...', {
      description: '写真を読み込んでいます',
    });

    try {
      const zip = new JSZip();
      const photosToDownload = photos;
      
      // 全ての画像を並列で取得してZIPに追加
      const fetchPromises = photosToDownload.map(async (photo, index) => {
        try {
          const blob = await fetchImageAsBlob(photo.url);
          // ファイル名を生成（IDまたはインデックスを使用）
          const filename = `photo-${photo.id || index + 1}.jpg`;
          zip.file(filename, blob);
        } catch (error) {
          console.warn(`Failed to fetch photo ${photo.id}:`, error);
          // エラーが発生しても他の写真の処理は続行
        }
      });

      // 全ての画像取得を待機
      await Promise.allSettled(fetchPromises);

      // ZIPファイルを生成
      toast.loading('ZIPファイルを生成中...', {
        id: loadingToastId,
        description: 'しばらくお待ちください',
      });

      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }, // 圧縮レベル（1-9、6がバランス良い）
      });

      // ファイル名を生成（日付を含める）
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `wedding-photos-${dateStr}.zip`;

      // file-saverでダウンロード
      saveAs(zipBlob, filename);

      toast.success('ZIPファイルのダウンロードを開始しました', {
        id: loadingToastId,
        description: `${photosToDownload.length}枚の写真が含まれています`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast.error('ZIPファイルの作成に失敗しました', {
        id: loadingToastId,
        description: 'もう一度お試しください',
        duration: 3000,
      });
    }
  };

  const handleDownload = (url: string) => {
    // ダウンロードボタンクリック時は直接待機モーダルを表示（口コミチェックなし）
    setPendingDownloadAction(() => () => executeDownload(url));
    setIsDownloadWaitModalOpen(true);
  };
  
  const handleBulkDownload = () => {
    // ダウンロードボタンクリック時は直接待機モーダルを表示（口コミチェックなし）
    // 一括ダウンロードはZIP生成に時間がかかるため、async関数をラップ
    setPendingDownloadAction(() => {
      executeBulkDownload().catch((error) => {
        console.error('Bulk download error:', error);
      });
    });
    setIsDownloadWaitModalOpen(true);
  };

  // レビュー完了後の処理
  const handleReviewComplete = () => {
    setHasReviewed(true);
    setIsDownloadUnlocked(true);
    setIsReviewGateOpen(false);
    // ダウンロード待機モーダルは開かない（ダウンロードボタンを押した時だけ表示）
  };

  const selectedPhotoData = photos.find(p => p.id === selectedPhoto);

  // 挙式日前（Pre-Wedding）のロック画面
  if (isPreWedding) {
    return (
      <div className="relative min-h-dvh w-full overflow-hidden">
        {/* 背景: ブラーのかかった結婚式のイメージ画像 */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
            alt="Wedding celebration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* ブラーオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-rose-50/80 to-amber-50/90 backdrop-blur-md" />
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 min-h-dvh flex items-center justify-center px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center space-y-6 md:space-y-8 max-w-2xl"
          >
            {/* アイコン: 鍵またはギフトボックス（アニメーション付き） */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-full shadow-xl border border-[#D4AF37]/30">
                  <Gift className="w-16 h-16 md:w-20 md:h-20 text-[#D4AF37]" />
                </div>
              </div>
            </motion.div>

            {/* タイトル */}
            <div className="space-y-4">
              <h1 className={cn(
                'text-4xl md:text-5xl font-serif font-bold',
                'text-gray-900 tracking-wide',
                'leading-tight'
              )}>
                Coming Soon...
              </h1>
              <p className={cn(
                'text-xl md:text-2xl font-serif font-semibold',
                'text-[#D4AF37] tracking-wide'
              )}>
                {weddingDate ? formatWeddingDate(weddingDate) : '読み込み中...'} The Big Day
              </p>
            </div>

            {/* ボディテキスト */}
            <div className={cn(
              'space-y-4 text-gray-700',
              'text-base md:text-lg leading-relaxed',
              'font-serif max-w-lg mx-auto'
            )}>
              <p>
                ゲストが撮影した写真が、ここにリアルタイムで届きます。
              </p>
              <p>
                当日、この場所が皆様の笑顔で埋め尽くされるのを楽しみにしていてください！
              </p>
            </div>

            {/* サンプルを見るボタン */}
            <div className="pt-4">
              <button
                onClick={handlePreviewClick}
                className={cn(
                  'inline-flex items-center gap-2 md:gap-3',
                  'px-6 md:px-8 py-3 md:py-4',
                  'bg-white/80 backdrop-blur-sm',
                  'border-2 border-[#D4AF37]',
                  'text-[#D4AF37] font-semibold text-base md:text-lg',
                  'rounded-xl shadow-lg hover:shadow-xl',
                  'transition-all duration-200 active:scale-95',
                  'font-serif'
                )}
              >
                <Eye className="w-5 h-5 md:w-6 md:h-6" />
                サンプルを見る（Preview）
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 挙式当日以降の通常表示
  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight text-balance">みんなの写真</h1>
            {hasPhotos && (
              <button
                onClick={handleBulkDownload}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95",
                  "bg-emerald-600 text-white hover:bg-emerald-700",
                  "flex items-center gap-2"
                )}
              >
                <Icons.Download className="w-4 h-4" />
                一括ダウンロード
              </button>
            )}
          </div>
          
          {/* タブ */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95",
                activeTab === 'all'
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              みんなの写真
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95",
                activeTab === 'table'
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              卓ごとの写真
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {isLoading ? (
          /* ローディング状態 */
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
              <div className="mb-4 md:mb-6 flex items-center justify-center gap-3 md:gap-4">
                <Icons.Users className="w-16 h-16 text-emerald-400 animate-pulse" />
                <Icons.Smartphone className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight text-balance">
                写真を準備しています...
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                ゲストがアップロードした写真を読み込んでいます
              </p>
            </div>

            {/* ローディング中の広告バナー */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <AdCard
                  id="loading-ad-1"
                  imageUrl="https://via.placeholder.com/400x400?text=New+Life+Ad"
                  catchCopy="新生活にお得な情報"
                  targetUrl="https://example.com/ad"
                  badgeText="PR"
                />
              </div>
            </div>

            {/* スケルトンUI（写真グリッドのプレースホルダー） */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : !hasPhotos ? (
          /* エンプティステート（当日まで） */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <Icons.Users className="w-16 h-16 text-emerald-400" />
              <Icons.Smartphone className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              当日をお楽しみに！
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
              ゲストが撮影した写真がここに届きます
              <br />
              結婚式当日、ゲストの皆様がQRコードからアップロードした写真が、リアルタイムで表示されます。
            </p>
          </div>
        ) : activeTab === 'all' ? (
          /* みんなの写真（時系列）+ インフィード広告 */
          <div className="grid grid-cols-3 gap-2">
            {itemsWithAds.map((item, index) => {
              if (item.type === 'photo') {
                return (
                  <button
                    key={item.data.id}
                    onClick={() => handlePhotoClick(item.data.id)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                  >
                    <img
                      src={item.data.url}
                      alt="Guest photo"
                      className="w-full h-full object-cover"
                    />
                    {favorites.has(item.data.id) && (
                      <div className="absolute top-2 right-2">
                        <Icons.Heart className="w-5 h-5 text-red-500" filled />
                      </div>
                    )}
                  </button>
                );
              } else {
                // インフィード広告
                return (
                  <AdCard
                    key={`ad-${item.index}`}
                    id={`all-photos-ad-${item.index + 1}`}
                    imageUrl={`https://via.placeholder.com/400x400?text=New+Life+Ad+${item.index + 1}`}
                    catchCopy="新生活にお得な情報"
                    targetUrl={`https://example.com/ad/${item.index + 1}`}
                    badgeText="Sponsored"
                  />
                );
              }
            })}
          </div>
        ) : (
          /* 卓ごとの写真 */
          <div className="space-y-6">
            {tables.map((table) => {
              const tablePhotos = photos.filter(p => p.tableId === table.id);
              if (tablePhotos.length === 0) return null;

              // 卓ごとの写真にも広告を挿入（5枚以上の場合）
              const tableItemsWithAds = createItemsWithAds(tablePhotos);

              return (
                <div key={table.id}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">
                    {table.name}
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {tableItemsWithAds.map((item, index) => {
                      if (item.type === 'photo') {
                        return (
                          <button
                            key={item.data.id}
                            onClick={() => handlePhotoClick(item.data.id)}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                          >
                            <img
                              src={item.data.url}
                              alt="Guest photo"
                              className="w-full h-full object-cover"
                            />
                            {favorites.has(item.data.id) && (
                              <div className="absolute top-2 right-2">
                                <Icons.Heart className="w-5 h-5 text-red-500" filled />
                              </div>
                            )}
                          </button>
                        );
                      } else {
                        // インフィード広告
                        return (
                          <AdCard
                            key={`ad-${table.id}-${item.index}`}
                            id={`table-${table.id}-ad-${item.index + 1}`}
                            imageUrl={`https://via.placeholder.com/400x400?text=New+Life+Ad+${item.index + 1}`}
                            catchCopy="新生活にお得な情報"
                            targetUrl={`https://example.com/ad/${table.id}/${item.index + 1}`}
                            badgeText="Sponsored"
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ライトボックス */}
      {selectedPhoto && selectedPhotoData && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          {/* 閉じるボタン（右上） */}
          <button
            onClick={handleCloseLightbox}
            className={cn(
              "absolute top-4 right-4 z-[110]",
              "p-3 rounded-full",
              "bg-black/50 hover:bg-black/70",
              "text-white",
              "transition-all duration-200",
              "shadow-lg hover:shadow-xl",
              "active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
            )}
            aria-label="閉じる"
          >
            <Icons.X className="w-6 h-6" />
          </button>

          {/* 背景クリックで閉じる */}
          <div
            className="absolute inset-0 -z-10"
            onClick={handleCloseLightbox}
            aria-label="閉じる"
          />

          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhotoData.url}
              alt="Full size photo"
              className="max-w-full max-h-[90dvh] object-contain rounded-lg"
            />
          </div>

          {/* アクションボタン */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            <button
              onClick={() => toggleFavorite(selectedPhoto)}
              className={cn(
                "p-4 rounded-full transition-all duration-200 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50",
                favorites.has(selectedPhoto)
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
              aria-label={favorites.has(selectedPhoto) ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <Icons.Heart
                className="w-6 h-6"
                filled={favorites.has(selectedPhoto)}
              />
            </button>
            <button
              onClick={() => handleDownload(selectedPhotoData.url)}
              className={cn(
                "p-4 rounded-full bg-white/20 text-white hover:bg-white/30",
                "transition-all duration-200 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
              )}
              aria-label="ダウンロード"
            >
              <Icons.Download className="w-6 h-6" />
            </button>
            {/* 閉じるボタン（下部にも追加） */}
            <button
              onClick={handleCloseLightbox}
              className={cn(
                "p-4 rounded-full bg-white/20 text-white hover:bg-white/30",
                "transition-all duration-200 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
              )}
              aria-label="閉じる"
            >
              <Icons.X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* レビューゲートドロワー */}
      <CoupleReviewGateDrawer
        open={isReviewGateOpen}
        onOpenChange={setIsReviewGateOpen}
        onUnlock={handleReviewComplete}
        googleMapsUrl="https://www.google.com/maps/place/example" // TODO: 実際のGoogle Maps URLに置き換え
        ratingThreshold={4}
        coupleId={coupleId}
      />

      {/* ダウンロード待機モーダル（広告付き） */}
      <DownloadWaitModal
        open={isDownloadWaitModalOpen}
        onOpenChange={(open) => {
          setIsDownloadWaitModalOpen(open);
          // モーダルが閉じられたときに、関連する状態もリセット
          if (!open) {
            setPendingDownloadAction(null);
            // ライトボックスも閉じる（ダウンロード完了後に開いたままにならないように）
            setSelectedPhoto(null);
          }
        }}
        onDownloadStart={async () => {
          if (pendingDownloadAction) {
            try {
              // 非同期関数の場合はawait、同期関数の場合はそのまま実行
              const result = pendingDownloadAction();
              // Promiseかどうかをチェック（型安全な方法）
              if (result !== undefined && result !== null && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
                await result;
              }
            } catch (error) {
              console.error('Download action error:', error);
            } finally {
              setPendingDownloadAction(null);
            }
          }
          // ダウンロード開始後、少し遅延してからモーダルを閉じる
          setTimeout(() => {
            setIsDownloadWaitModalOpen(false);
            setSelectedPhoto(null); // ライトボックスも閉じる
          }, 500);
        }}
        waitTime={5}
        adImageUrl="https://via.placeholder.com/600x400?text=New+Life+Advertisement"
        adTargetUrl="https://example.com/ad"
        adCatchCopy="新生活にお得な情報"
      />
    </div>
  );
}

export default function CoupleGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    }>
      <CoupleGalleryContent />
    </Suspense>
  );
}