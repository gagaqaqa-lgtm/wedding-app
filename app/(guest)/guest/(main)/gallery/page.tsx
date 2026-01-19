'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Heart, Users, Camera, MessageCircle, Infinity as InfinityIcon, Trash2, ShieldAlert, Download, X, Mail, ArrowLeft } from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadWaitModal } from '@/components/DownloadWaitModal';
import { api } from '@/lib/services/api';
import type { Photo } from '@/lib/types/schema';
import { getVenueInfo } from '@/lib/services/mock/venueService';
import { getWeddingInfo, getTableInfo } from '@/lib/services/mock/weddingService';

// LINE ID（環境変数または定数で管理する想定）
const LINE_ID = '@あなたのLINE_ID'; // TODO: .envから取得するように変更

// LINE公式アカウントの友達追加URL（ソフトゲート用）
// TODO: 本番環境ではここに実際のLINE公式アカウントのURLを設定する
const LINE_ADD_FRIEND_URL = 'https://line.me/R/ti/p/@your_line_id';

const MOCK_VENUE_ID = 'venue-1'; // TODO: URLパラメータまたは認証情報から取得
const MOCK_WEDDING_ID = 'wedding-1'; // TODO: URLパラメータまたは認証情報から取得

// コンフェッティの色
const CONFETTI_COLORS = [
  '#f1ce88', // シャンパンゴールド
  '#ff9980', // コーラルピンク
  '#ffffff', // 白
  '#fefbf3', // クリーム
  '#ffd6cc', // ライトコーラル
];

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableID = searchParams.get('table');
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [showOpeningModal, setShowOpeningModal] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<{ id: string; url: string; alt: string } | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('couple');
  // 投稿枚数制限関連
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isLineConnected, setIsLineConnected] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  // 削除確認ダイアログ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 一括ダウンロード確認ダイアログ
  const [showDownloadAllConfirm, setShowDownloadAllConfirm] = useState(false);
  // ダウンロード待機モーダル
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [pendingDownloadAction, setPendingDownloadAction] = useState<(() => void | Promise<void>) | null>(null);
  // デバッグパネル
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  // コンプライアンスチェック関連
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [hasAgreedToCompliance, setHasAgreedToCompliance] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // 会場・挙式データ
  const [venueInfo, setVenueInfo] = useState<{ name: string; coverImage: string; enableLineUnlock: boolean; plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' } | null>(null);
  const [weddingWelcomeImage, setWeddingWelcomeImage] = useState<string | null>(null);
  const [weddingInfo, setWeddingInfo] = useState<{ message?: string } | null>(null);
  const [tableInfo, setTableInfo] = useState<{ id: string; name: string; message: string } | null>(null);
  // 初期ローディング状態（全てのデータが読み込まれるまでtrue）
  const [isLoading, setIsLoading] = useState(true);

  // 会場・挙式データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [venue, wedding] = await Promise.all([
          getVenueInfo(MOCK_VENUE_ID),
          getWeddingInfo(MOCK_WEDDING_ID),
        ]);
        // venueがundefinedの場合のフォールバック
        if (venue) {
          setVenueInfo({
            name: venue.name,
            coverImage: venue.coverImageUrl || 'https://picsum.photos/800/600?random=venue',
            enableLineUnlock: venue.enableLineUnlock || false,
            plan: venue.plan || 'PREMIUM', // プラン情報を追加
          });
        } else {
          // データが見つからない場合のフォールバック
          setVenueInfo({
            name: `Venue ${MOCK_VENUE_ID}`,
            coverImage: 'https://picsum.photos/800/600?random=venue',
            enableLineUnlock: false,
            plan: 'STANDARD',
          });
        }
        setWeddingWelcomeImage(wedding.welcomeImageUrl || null);
        setWeddingInfo({ message: wedding.message });
      } catch (error) {
        console.error('Failed to load venue/wedding data:', error);
        // フォールバック
        setVenueInfo({
          name: '表参道テラス',
          coverImage: 'https://picsum.photos/800/600?random=venue',
          enableLineUnlock: false,
          plan: 'PREMIUM', // デフォルトはPREMIUM
        });
      } finally {
        // データ読み込み完了（エラーでも完了として扱う）
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 卓情報の読み込み
  useEffect(() => {
    const loadTableInfo = async () => {
      if (tableID) {
        try {
          const info = await getTableInfo(tableID);
          setTableInfo(info);
        } catch (error) {
          console.error('Failed to load table info:', error);
        }
      }
    };
    loadTableInfo();
  }, [tableID]);

  // プレビューURLのクリーンアップ（モーダルが閉じられたとき）
  useEffect(() => {
    if (!showComplianceModal && previewUrls.length > 0) {
      // モーダルが閉じられたときにプレビューURLをクリーンアップ
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComplianceModal]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetHeight;
        setIsScrolled(window.scrollY > heroBottom - 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // LINE URL生成関数
  const getLineUrl = () => {
    if (tableID) {
      const message = encodeURIComponent(`テーブル${tableID}の写真`);
      return `https://line.me/R/oaMessage/${LINE_ID}/?${message}`;
    }
    return `https://line.me/R/ti/p/${LINE_ID}`;
  };

  // 画像読み込みハンドラ
  const handleImageLoad = (photoId: string) => {
    setImageLoading((prev) => ({ ...prev, [photoId]: false }));
  };

  const handleImageStartLoad = (photoId: string) => {
    setImageLoading((prev) => ({ ...prev, [photoId]: true }));
  };

  useEffect(() => {
    if (!showOpeningModal) return;

    // スクロールロック
    document.body.style.overflow = 'hidden';

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowOpeningModal(false);
          document.body.style.overflow = 'unset';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = 'unset';
    };
  }, [showOpeningModal]);

  // Skipボタンでモーダルを閉じる処理
  const handleSkipOpening = () => {
    setShowOpeningModal(false);
    setTimeLeft(0);
    document.body.style.overflow = 'unset';
  };

  // ライトボックス表示時のスクロールロック
  useEffect(() => {
    if (viewingImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingImage]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
    // 選択モードの場合はリセット
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedImageIds([]);
    }
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleSelectModeToggle = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // キャンセル時は選択をリセット
      setSelectedImageIds([]);
    }
  };

  const handleImageToggle = (photo: { id: string; url: string; alt: string }) => {
    if (!isSelectMode) {
      // 通常モード：拡大表示
      setViewingImage({ id: photo.id, url: photo.url, alt: photo.alt });
      return;
    }

    // 選択モード：トグル
    setSelectedImageIds((prev) => {
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id);
      } else {
        return [...prev, photo.id];
      }
    });
  };

  // 画像の右クリック/長押し時のLINE誘導
  const handleImageContextMenu = (e: React.MouseEvent, photo: { id: string; url: string; alt: string }) => {
    e.preventDefault();
    setShowLineModal(true);
  };

  const handleCloseLightbox = () => {
    setViewingImage(null);
    x.set(0);
    y.set(0);
  };

  const handleNextImage = () => {
    if (!viewingImage) return;
    const photos = getCurrentPhotos();
    const currentIndex = photos.findIndex((p) => String(p.id) === String(viewingImage.id));
    const nextIndex = (currentIndex + 1) % photos.length;
    const nextPhoto = photos[nextIndex];
    setViewingImage({ id: String(nextPhoto.id), url: nextPhoto.url, alt: nextPhoto.alt });
    x.set(0);
    y.set(0);
  };

  const handlePrevImage = () => {
    if (!viewingImage) return;
    const photos = getCurrentPhotos();
    const currentIndex = photos.findIndex((p) => String(p.id) === String(viewingImage.id));
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    const prevPhoto = photos[prevIndex];
    setViewingImage({ id: String(prevPhoto.id), url: prevPhoto.url, alt: prevPhoto.alt });
    x.set(0);
    y.set(0);
  };

  // 単一写真のダウンロード機能（Web Share API優先、フォールバックはBlobダウンロード）- 実際の実行処理
  const executeSingleDownload = async (url: string, alt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${alt || 'wedding-photo'}-${Date.now()}.jpg`, { type: blob.type });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          toast.success('写真を保存しました', {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
          });
          return;
        } catch (shareError: unknown) {
          // ユーザーが共有をキャンセルした場合など、AbortError以外は通常のダウンロードにフォールバック
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            return; // ユーザーがキャンセルした場合は何もしない
          }
          // その他のエラーは通常のダウンロードにフォールバック
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success('写真をダウンロードしました', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
      });
    }
  };

  // 単一写真のダウンロード - プラン判定を行うゲートキーパー関数
  const handleDownload = (url: string, alt: string) => {
    // 実行する処理を定義（クロージャで引数を保持）
    const action = () => executeSingleDownload(url, alt);

    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => action);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      action();
    }
  };

  // 選択した写真の一括ダウンロード機能（ZIP化） - 実際の実行処理
  const executeBulkDownload = async () => {
    if (selectedImageIds.length === 0) {
      toast.error('写真を選択してください', {
        duration: 2000,
      });
      return;
    }

    try {
      toast.loading(`${selectedImageIds.length}枚の写真をダウンロード中...`, {
        id: 'bulk-download',
      });

      const zip = new JSZip();
      const photos = getCurrentPhotos();
      const selectedPhotos = photos.filter((p) => selectedImageIds.includes(String(p.id)));

      // 各写真をZIPに追加
      await Promise.all(
        selectedPhotos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const fileName = `${photo.alt || `photo-${index + 1}`}.jpg`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to fetch photo ${photo.id}:`, error);
          }
        })
      );

      // ZIPファイルを生成
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], `wedding-photos-${Date.now()}.zip`, { type: 'application/zip' });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [zipFile] })) {
        try {
          await navigator.share({ files: [zipFile] });
          toast.success(`${selectedImageIds.length}枚の写真を保存しました`, {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
            id: 'bulk-download',
          });
          setIsSelectMode(false);
          setSelectedImageIds([]);
          return;
        } catch (shareError: unknown) {
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            toast.dismiss('bulk-download');
            return;
          }
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(zipBlob);
      link.href = objectUrl;
      link.download = zipFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`${selectedImageIds.length}枚の写真をダウンロードしました`, {
        duration: 3000,
        id: 'bulk-download',
      });

      // 選択モードを解除
      setIsSelectMode(false);
      setSelectedImageIds([]);
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
        id: 'bulk-download',
      });
    }
  };

  // 選択した写真の一括ダウンロード - モーダル表示用ハンドラ
  const handleBulkDownload = () => {
    if (selectedImageIds.length === 0) {
      toast.error('写真を選択してください', {
        duration: 2000,
      });
      return;
    }

    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => executeBulkDownload);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      executeBulkDownload();
    }
  };

  // 全写真の一括ダウンロード機能（ZIP化） - 実際の実行処理
  const executeDownloadAll = async () => {
    const photos = getCurrentPhotos();
    
    if (photos.length === 0) {
      toast.error('ダウンロードする写真がありません', {
        duration: 2000,
      });
      return;
    }
    
    try {
      toast.loading(`ZIPファイルを作成中... (${photos.length}枚)`, {
        id: 'download-all',
      });

      const zip = new JSZip();

      // 各写真をZIPに追加
      await Promise.all(
        photos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            // ファイル名を整理（特殊文字を削除）
            const sanitizedAlt = (photo.alt || `photo-${index + 1}`).replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
            const fileName = `${sanitizedAlt || `photo-${index + 1}`}.jpg`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to fetch photo ${photo.id}:`, error);
          }
        })
      );

      // ZIPファイルを生成
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = activeTab === 'couple' 
        ? `お二人の写真-${Date.now()}.zip`
        : `この卓の写真-${Date.now()}.zip`;
      const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [zipFile] })) {
        try {
          await navigator.share({ files: [zipFile] });
          toast.success(`${photos.length}枚の写真を保存しました`, {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
            id: 'download-all',
          });
          return;
        } catch (shareError: unknown) {
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            toast.dismiss('download-all');
            return;
          }
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(zipBlob);
      link.href = objectUrl;
      link.download = zipFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`${photos.length}枚の写真をダウンロードしました`, {
        duration: 3000,
        id: 'download-all',
      });
    } catch (error) {
      console.error('Download all failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
        id: 'download-all',
      });
    }
  };

  // 全写真の一括ダウンロード - モーダル表示用ハンドラ
  const handleDownloadAll = async () => {
    const photos = getCurrentPhotos();
    
    if (photos.length === 0) {
      toast.error('ダウンロードする写真がありません', {
        duration: 2000,
      });
      return;
    }

    // 確認ダイアログを表示
    setShowDownloadAllConfirm(true);
  };

  // 一括ダウンロード確認後の処理（確認ダイアログから呼ばれる）
  const handleDownloadAllConfirm = () => {
    setShowDownloadAllConfirm(false);
    
    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => executeDownloadAll);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      executeDownloadAll();
    }
  };

  // 新郎新婦が登録した写真（STEP 1, STEP 2）
  const [couplePhotos] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      url: `https://picsum.photos/400/300?random=couple${i + 1}`,
      alt: `新郎新婦からの写真 ${i + 1}`,
      source: 'couple' as const,
    }))
  );

  // この卓のゲストがアップロードした写真（APIから取得）
  const [tablePhotos, setTablePhotos] = useState<Photo[]>([]);
  
  // 初期データの読み込み（実際の実装ではAPIから取得）
  useEffect(() => {
    const loadPhotos = async () => {
      if (tableID) {
        try {
          // TODO: 実際のweddingIdを取得（認証情報から）
          const weddingId = 'wedding-1';
          const photos = await api.getPhotosByTable(tableID);
          setTablePhotos(photos);
        } catch (error) {
          console.error('Failed to load photos:', error);
        }
      }
    };
    
    // 開発用: モックデータを設定
    // 本番環境では loadPhotos() を呼び出す
    // loadPhotos();
    
    // モックデータ（開発用）
    setTablePhotos([
      {
        id: '1001',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        alt: '楽しそうな飲み会の様子 1',
        source: 'table',
        weddingId: 'wedding-1',
        tableId: tableID || null,
        uploadedBy: 'guest-1',
        isMyPhoto: true,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '1002',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        alt: '美味しそうな料理の写真 1',
        source: 'table',
        weddingId: 'wedding-1',
        tableId: tableID || null,
        uploadedBy: 'guest-2',
        isMyPhoto: false,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, [tableID]);

  // 現在のタブに応じた写真リストを取得
  // ゲスト側のUI用の型（Photo型を変換）
  type PhotoType = { id: string; url: string; alt: string; isMyPhoto?: boolean };
  const getCurrentPhotos = (): PhotoType[] => {
    if (activeTab === 'couple') {
      // 新郎新婦からの写真（モックデータ）
      return couplePhotos.map(p => ({ id: String(p.id), url: p.url, alt: p.alt }));
    } else {
      // この卓の写真（APIから取得）
      return tablePhotos.map(p => ({
        id: p.id,
        url: p.url,
        alt: p.alt || '写真',
        isMyPhoto: p.isMyPhoto,
      }));
    }
  };
  const currentPhotos = getCurrentPhotos();
  
  // 削除処理
  const handleDeletePhoto = async () => {
    if (!viewingImage) return;
    
    // 現在のタブに応じて削除
    if (activeTab === 'table') {
      try {
        // TODO: 実際のuserIdを取得（認証情報から）
        const userId = 'guest-1';
        
        // API経由で削除
        await api.deletePhoto(viewingImage.id, userId);
        
        // ローカル状態を更新
        const deletedPhoto = tablePhotos.find((p) => p.id === viewingImage.id);
        setTablePhotos((prev) => prev.filter((p) => p.id !== viewingImage.id));
        
        // 自分の写真を削除した場合、投稿数を減らす
        if (deletedPhoto?.isMyPhoto) {
          setUploadedCount((prev) => Math.max(0, prev - 1));
        }
        
        // ライトボックスを閉じる
        handleCloseLightbox();
        
        // 削除確認ダイアログを閉じる
        setShowDeleteConfirm(false);
        
        // フィードバック: トースト通知
        toast.success('写真を削除しました', {
          description: '削除された写真は復元できません',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to delete photo:', error);
        toast.error('削除に失敗しました', {
          description: 'もう一度お試しください',
          duration: 3000,
        });
      }
    } else {
      // 新郎新婦からの写真は削除不可
      handleCloseLightbox();
      setShowDeleteConfirm(false);
    }
  };

  // パーティクルエフェクト（紙吹雪）をトリガー
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // ゴールド、ホワイト、エメラルド系の色
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#f1ce88', '#10b981', '#ffffff', '#fefbf3', '#34d399'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#f1ce88', '#10b981', '#ffffff', '#fefbf3', '#34d399'],
      });
    }, 250);
  };

  // ファイル選択時の処理（コンプライアンスチェックモーダルを表示）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 制限チェック: uploadedCount >= 5 かつ LINE未連携の場合、アップロードをブロック
    const UPLOAD_LIMIT = 5;
    const fileCount = files.length;
    const newUploadedCount = uploadedCount + fileCount;

    // 既に上限に達している場合、または新規アップロードで上限を超える場合
    if ((uploadedCount >= UPLOAD_LIMIT || newUploadedCount > UPLOAD_LIMIT) && !isLineConnected) {
      // 会場設定による分岐
      if (venueInfo?.enableLineUnlock) {
        // パターンA: LINE連携機能が有効な場合、制限解除モーダルを表示
        setShowLimitModal(true);
      } else {
        // パターンB: LINE連携機能が無効な場合、エラートーストを表示
        toast.error('申し訳ありません。投稿枚数の上限（5枚）に達しました。', {
          duration: 4000,
        });
      }
      // ファイル入力のリセット
      event.target.value = '';
      return;
    }

    // ファイルをステートに保存してコンプライアンスチェックモーダルを表示
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    
    // プレビューURLを生成
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setShowComplianceModal(true);
    setHasAgreedToCompliance(false); // リセット
    // ファイル入力のリセット（モーダル内で確認後、アップロード実行）
    event.target.value = '';
  };

  // 写真アップロード処理（実際のアップロード実行）
  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (!hasAgreedToCompliance) {
      toast.error('投稿前に約束に同意してください', {
        description: 'マナーチェックボックスにチェックを入れてください',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // TODO: 実際のweddingIdとuserIdを取得（認証情報から）
      const weddingId = 'wedding-1';
      const userId = 'guest-1';
      
      // API経由で写真をアップロード
      const uploadedPhotos = await api.uploadPhotos(
        selectedFiles,
        weddingId,
        tableID || null,
        userId
      );

      // ローカル状態を更新
      setTablePhotos((prev) => [...prev, ...uploadedPhotos]);
      
      // 投稿数を更新
      setUploadedCount((prev) => prev + selectedFiles.length);
      
      // 新しい写真のIDを記録（アニメーション用）
      const newIds = uploadedPhotos.map((p) => p.id);
      setNewPhotoIds(new Set(newIds));

      // リッチなトースト通知を表示
      toast.success('素敵な写真をありがとうございます！', {
        description: '新郎新婦もきっと喜びます✨ ギャラリーに追加されました。',
        duration: 4000,
        icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
        className: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200',
        style: {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
        },
      });

      // パーティクルエフェクトをトリガー
      triggerConfetti();

      // 新しい写真のIDを3秒後にクリア（アニメーション終了後）
      setTimeout(() => {
        setNewPhotoIds(new Set());
      }, 3000);

      // コンプライアンスチェックモーダルを閉じる
      setShowComplianceModal(false);
      setSelectedFiles([]);
      setHasAgreedToCompliance(false);
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error('アップロードに失敗しました', {
        description: 'もう一度お試しください。',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // インフィード広告を含む写真リストを生成（12枚おきに広告を挿入）
  const itemsWithAds: Array<{ type: 'photo'; data: PhotoType } | { type: 'ad'; index: number }> = useMemo(() => {
    const photos = getCurrentPhotos();
    const items: Array<{ type: 'photo'; data: PhotoType } | { type: 'ad'; index: number }> = [];
    const shouldShowAds = venueInfo?.plan !== 'PREMIUM'; // PREMIUM以外では広告を表示
    photos.forEach((photo, index) => {
      items.push({ type: 'photo', data: photo });
      // 12枚おきに広告を挿入（最初と最後は除く、かつPREMIUM以外の場合のみ）
      if (shouldShowAds && (index + 1) % 12 === 0 && index < photos.length - 1) {
        items.push({ type: 'ad', index: Math.floor((index + 1) / 12) });
      }
    });
    return items;
  }, [activeTab, couplePhotos, tablePhotos, venueInfo?.plan]);

  // コンフェッティ生成
  const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 4,
  }));

  // ローディング中はスピナーのみ表示
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-stone-200 border-t-emerald-600 rounded-full"
            />
            <p className="text-stone-600 font-serif text-lg">読み込み中...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-dvh relative overflow-hidden"
    >
      {/* 背景アニメーション - 光のボケ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-champagne-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-coral-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 60, -80, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-champagne-300/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* コンフェッティエフェクト */}
      {!showOpeningModal && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: particle.left,
                top: '-10px',
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, Math.random() * 200 - 100],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
      {/* オープニングモーダル - 華やかなデザイン */}
      {showOpeningModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4"
          style={{ 
            height: '100dvh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          }}
        >
          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-champagne-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-coral-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="text-center space-y-6 md:space-y-8 w-full max-w-md relative z-10">
            {/* SPONSORED - エレガントなデザイン */}
            <div className="mb-4 md:mb-6">
              <p className="font-serif text-stone-300/80 text-sm font-semibold tracking-[0.3em] uppercase">
                SPONSORED
              </p>
            </div>

            {/* メインメッセージ */}
            <div className="mb-6 md:mb-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-stone-100 text-2xl sm:text-3xl font-light tracking-wide leading-relaxed px-4 mb-6 break-keep text-balance text-center"
              >
                お二人の特別な一日の写真を<br />ご覧いただけます
              </motion.p>
            </div>

            {/* 広告枠（グラスモーフィズム） */}
            <div className="mb-6 md:mb-8 flex justify-center">
              <div className="w-full max-w-[300px] h-[200px] sm:h-[250px] bg-white/10 backdrop-blur-xl border border-stone-400/20 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl">
                {/* ダミー広告 */}
                <div className="absolute inset-0">
                  <img
                    src="https://picsum.photos/300/250?random=999"
                    alt="Advertisement"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
                <div className="relative z-10 bg-stone-900/50 backdrop-blur-md px-6 py-4 rounded-xl border border-stone-400/20">
                  <p className="text-stone-100 text-sm sm:text-base font-serif">広告バナーが入ります</p>
                </div>
              </div>
            </div>

            {/* プログレスバー - くすみカラー */}
            <div className="w-full max-w-sm mx-auto px-4 mb-6">
              <div className="w-full bg-stone-800/30 backdrop-blur-sm rounded-full h-2 overflow-hidden shadow-inner border border-stone-400/20">
                <motion.div
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 h-2 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${((3 - timeLeft) / 3) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* カウントダウン - エレガント */}
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">あと</p>
              <p className="font-serif text-amber-300 text-6xl sm:text-7xl font-light drop-shadow-lg">
                {timeLeft}
              </p>
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">秒</p>
            </div>

            {/* Skipボタン */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              onClick={handleSkipOpening}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Skip
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ライトボックス - 拡大表示（スワイプ対応） */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            {/* 閉じるボタン */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 削除ボタン（自分の写真の場合のみ表示） */}
            {(() => {
              const photos = getCurrentPhotos();
              const currentPhoto = photos.find((p) => p.id === viewingImage.id);
              if (currentPhoto?.isMyPhoto && activeTab === 'table') {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="absolute bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md flex items-center justify-center text-white active:bg-red-700 transition-all duration-200 border border-red-300/30 shadow-lg hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                );
              }
              return null;
            })()}

            {/* 前の画像ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 次の画像ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* 画像表示（ドラッグ可能 - スワイプ対応） */}
            <motion.div
              drag
              dragConstraints={{ left: -300, right: 300, top: -100, bottom: 200 }}
              dragElastic={0.5}
              onDragEnd={(event, info) => {
                const horizontalThreshold = 50;
                const verticalThreshold = 100;
                const horizontalVelocityThreshold = 300;
                const verticalVelocityThreshold = 500;

                // 下方向スワイプ（閉じる）を優先
                if (info.offset.y > verticalThreshold || info.velocity.y > verticalVelocityThreshold) {
                  handleCloseLightbox();
                  return;
                }

                // 左右スワイプ（前後の画像へ移動）
                if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(info.velocity.x) > horizontalVelocityThreshold) {
                  if (info.offset.x > 0 || info.velocity.x > 0) {
                    handlePrevImage();
                  } else {
                    handleNextImage();
                  }
                }

                // 元の位置に戻す
                x.set(0);
                y.set(0);
              }}
              style={{ x, y }}
              className="relative max-w-full max-h-full w-full h-full flex items-center justify-center p-4 touch-none cursor-grab active:cursor-grabbing"
              onClick={(e) => {
                // 小さなドラッグの場合はクリックとして扱わない
                if (Math.abs(x.get()) < 10 && Math.abs(y.get()) < 10) {
                  e.stopPropagation();
                }
              }}
            >
              <motion.img
                key={viewingImage.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                src={viewingImage.url}
                alt={viewingImage.alt}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>

            {/* ダウンロードボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(viewingImage.url, viewingImage.alt);
              }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center gap-2 text-stone-800 active:scale-95 transition-all duration-200 border border-stone-200/50 shadow-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              <span>保存</span>
            </button>

            {/* 画像インデックス表示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm border border-white/10 shadow-lg"
            >
              {(() => {
                const photos = getCurrentPhotos();
                const currentIndex = photos.findIndex((p) => p.id === viewingImage.id);
                return currentIndex >= 0 ? `${currentIndex + 1} / ${photos.length}` : '';
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINE誘導モーダル（画像右クリック/長押し時） */}
      <AnimatePresence>
        {showLineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center p-4"
            onClick={() => setShowLineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center border border-stone-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLineModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">📸</span>
                </div>
                <h2 className="font-serif text-stone-800 text-xl sm:text-2xl font-semibold mb-2">
                  高画質な写真をLINEで受け取る
                </h2>
                <p className="font-serif text-stone-600 text-sm leading-relaxed">
                  この写真の高画質版を、公式LINEよりお届けします
                </p>
              </div>

              <a
                href={getLineUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl py-4 px-4 shadow-lg shadow-green-200 transition-all font-serif font-semibold"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                  </svg>
                  <span>LINEで受け取る</span>
                </div>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 保存完了＆LINE誘導モーダル（訴求強化版） */}
      {showSaveModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={handleCloseSaveModal}
        >
          <div 
            className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-8 shadow-2xl relative animate-[slideUp_0.3s_ease-out] text-center border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button 
              onClick={handleCloseSaveModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 active:opacity-50 transition-opacity"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* アイコン & タイトル */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-champagne-200 to-champagne-300 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <span className="text-4xl">📸</span>
              <motion.span
                className="absolute text-2xl -mr-10 -mt-10"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✨
              </motion.span>
            </div>
            
            <h2 className="font-semibold text-2xl sm:text-3xl text-stone-800 mb-4 font-serif">
              保存完了しました
            </h2>
            
            {/* 注意喚起エリア */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/50 rounded-xl p-5 sm:p-6 mb-6 text-left backdrop-blur-sm">
              <p className="font-semibold text-rose-800 text-base sm:text-lg mb-3 flex items-center gap-2 font-serif">
                <span>📸</span>
                <span>高画質な写真をLINEで受け取れます</span>
              </p>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-serif">
                {tableID ? (
                  <>プロカメラマンが撮影した<strong className="font-semibold">【テーブル{tableID}での記念写真】</strong>を、公式LINEより高画質版でお届けします。</>
                ) : (
                  <>プロカメラマンが撮影した<strong className="font-semibold">【こちらのテーブルの記念写真】</strong>を、公式LINEより高画質版でお届けします。</>
                )}
              </p>
            </div>

            {/* LINEボタン */}
            <div className="relative mb-6">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-coral-500 to-coral-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-pulse whitespace-nowrap border border-white/20">
                受け取り予約
              </div>
              <a
                href={getLineUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl py-5 px-4 shadow-lg shadow-green-200 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-center gap-3 leading-tight flex-nowrap">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                  </svg>
                  <span className="font-bold text-base sm:text-lg whitespace-nowrap">LINEで受け取る</span>
                </div>
              </a>
            </div>
            
            {/* 閉じるリンク */}
            <button
              onClick={handleCloseSaveModal}
              className="text-stone-400 text-xs hover:text-stone-600 font-medium underline decoration-stone-300 underline-offset-4 active:opacity-50 transition-opacity"
            >
              追加の写真は受け取らずに閉じる
            </button>
          </div>
        </div>
      )}

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
        <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif flex items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              写真アップロードの前に
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              すべての写真は<strong>新郎新婦と会場スタッフが確認</strong>します。<br />
              以下の写真は絶対に投稿しないでください。
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
                    <p className="font-semibold text-orange-800 text-sm font-serif">新郎新婦や他のゲストが不快になる写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">元交際相手など、関係者を不快にさせる写真</p>
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
              ※投稿された写真は、<strong>あなたの名前（LINE名/ゲスト名）と共に</strong>記録されます。
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
                マナーを守り、祝福の写真を投稿することを約束します
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
              onClick={handlePhotoUpload}
              disabled={!hasAgreedToCompliance || isUploading}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>アップロード中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>投稿する</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
              写真を削除しますか？
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handleDeletePhoto}
              className="w-full sm:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              <Trash2 className="w-4 h-4" />
              削除する
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 一括ダウンロード確認ダイアログ */}
      <Dialog open={showDownloadAllConfirm} onOpenChange={setShowDownloadAllConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
              一括ダウンロード
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              {(() => {
                const photos = getCurrentPhotos();
                const tabName = activeTab === 'couple' ? 'お二人の写真' : 'この卓の写真';
                return `表示中の${photos.length}枚の写真を一括ダウンロードしますか？`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <button
              onClick={() => setShowDownloadAllConfirm(false)}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handleDownloadAllConfirm}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              <Download className="w-4 h-4" />
              ダウンロードする
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 制限解除モーダル（LINE連携機能が有効な場合のみ表示） */}
      {venueInfo?.enableLineUnlock && (
        <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
                写真の投稿上限（5枚）に達しました
              </DialogTitle>
              <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
                もっと写真をアップロードするには、LINEで友達追加をして無制限モードを解放してください✨
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // LINE公式アカウントの友達追加URLを別タブで開く（ソフトゲート）
                  window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                  
                  // 即座に制限を解除（無条件で連携済みにする）
                  setIsLineConnected(true);
                  setShowLimitModal(false);
                  
                  // フィードバック: トースト通知を表示
                  toast.success('無制限モードが解放されました！🎉', {
                    description: 'これからは何枚でもアップロードできます✨',
                    duration: 4000,
                  });
                }}
                className="w-full sm:w-auto px-6 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
              >
                <MessageCircle className="w-5 h-5" />
                LINE友達追加で無制限にする
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 戻るボタン */}
      {!showOpeningModal && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.back()}
          className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 active:scale-95 shadow-lg"
          aria-label="戻る"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* メインコンテンツ */}
      {!showOpeningModal && (
        <>
          {/* ヒーローセクション */}
          <section
            ref={heroRef}
            className="relative w-full h-[50dvh] md:h-[60vh] min-h-[300px] md:min-h-[400px] overflow-hidden"
          >
            {/* 背景画像 */}
            <div className="absolute inset-0">
              <img
                src={venueInfo?.coverImage || 'https://picsum.photos/800/600?random=venue'}
                alt={venueInfo?.name || '会場'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent" />
            </div>

            {/* タイトル */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center max-w-2xl"
              >
                <h1 className="font-serif text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
                  Wedding Photo Gallery
                </h1>
                <p className="font-serif text-amber-200 text-xl md:text-2xl font-light tracking-wider drop-shadow-lg mb-6">
                  お二人の思い出
                </p>
                
                {/* 全員へのメッセージ */}
                {weddingInfo?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                    className="mt-6 px-4"
                  >
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
                      <p className="font-serif text-white text-sm md:text-base leading-relaxed whitespace-pre-wrap drop-shadow-lg max-w-2xl mx-auto text-center">
                        {weddingInfo.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* 装飾要素 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
          </section>

          {/* タブ構造（TabsListとTabsContentを同じTabsコンポーネント内に配置） */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* タブ切り替えエリア（Stickyヘッダー - 上部固定） */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
              <div className="max-w-md mx-auto px-4 py-3">
                <TabsList className="grid w-full grid-cols-2 bg-stone-100/80 backdrop-blur-sm rounded-xl p-1">
                  <TabsTrigger 
                    value="couple" 
                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    お二人の写真
                  </TabsTrigger>
                  <TabsTrigger 
                    value="table"
                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    この卓の写真
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* メインコンテンツエリア（スクロール可能、上下のバーに隠れないようpadding調整） */}
            <div className="container mx-auto px-4 py-4 pb-32 pt-4 relative z-10 max-w-4xl">
              {/* タブ1: お二人の写真 */}
              <TabsContent value="couple" className="mt-0">
                {couplePhotos.length === 0 ? (
                  <div className="text-center py-12 md:py-16 px-4">
                    <Heart className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-600 text-lg font-serif">まだ写真が届いていません。お楽しみに！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {itemsWithAds.map((item, index) => {
                      if (item.type === 'photo') {
                        const isSelected = selectedImageIds.includes(String(item.data.id));
                        return (
                          <motion.div
                            key={`photo-${item.data.id}`}
                            initial={newPhotoIds.has(String(item.data.id)) ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={newPhotoIds.has(String(item.data.id)) 
                              ? { 
                                  type: 'spring', 
                                  stiffness: 200, 
                                  damping: 20,
                                  delay: 0.1 
                                }
                              : { delay: index * 0.02 }
                            }
                            onClick={() => handleImageToggle({ id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                            className={`aspect-square bg-stone-200 overflow-hidden relative transition-all duration-200 rounded-sm ${
                              isSelectMode
                                ? 'active:opacity-80 cursor-pointer hover:scale-105'
                                : 'active:opacity-80 cursor-pointer hover:scale-105'
                            } shadow-md hover:shadow-xl`}
                          >
                            {(imageLoading[String(item.data.id)] === undefined || imageLoading[String(item.data.id)] === true) && (
                              <motion.div 
                                initial={{ opacity: 1 }}
                                animate={{ opacity: imageLoading[String(item.data.id)] === false ? 0 : 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse flex items-center justify-center z-10"
                              >
                                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </motion.div>
                            )}
                            <img
                              src={item.data.url}
                              alt={item.data.alt}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoading[String(item.data.id)] === false ? 'opacity-100' : 'opacity-0'
                              }`}
                              onLoad={() => handleImageLoad(String(item.data.id))}
                              onLoadStart={() => handleImageStartLoad(String(item.data.id))}
                              onContextMenu={(e) => handleImageContextMenu(e, { id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                              loading="lazy"
                            />

                            {/* チェックマーク（選択モード時のみ表示） */}
                            {isSelectMode && (
                              <div
                                className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg ${
                                  isSelected
                                    ? 'bg-champagne-500 border-champagne-600 scale-110'
                                    : 'bg-white/80 border-white/90 backdrop-blur-md'
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      } else {
                        // インフィード広告
                        return (
                          <motion.div
                            key={`ad-${item.index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="aspect-square bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md overflow-hidden relative flex flex-col items-center justify-center border border-white/30 rounded-sm shadow-lg"
                          >
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-champagne-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest shadow-md">
                                PR
                              </span>
                            </div>
                            <div className="text-center p-4 mt-4 relative z-0">
                              <div className="w-full h-24 bg-white/20 backdrop-blur-sm rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/20">
                                <img
                                  src={`https://picsum.photos/300/300?random=${900 + item.index}`}
                                  alt="Advertisement"
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </div>
                              <p className="text-xs text-stone-700 font-medium">広告</p>
                            </div>
                          </motion.div>
                        );
                      }
                    })}
                  </div>
                )}
              </TabsContent>

              {/* タブ2: この卓の写真 */}
              <TabsContent value="table" className="mt-0">
                {/* 卓メッセージカード */}
                {tableInfo?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 p-6 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-xl text-center shadow-md"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-serif text-base font-semibold text-stone-800">
                        新郎新婦から、{tableInfo.name}の皆様へ
                      </h3>
                    </div>
                    <p className="font-serif text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {tableInfo.message}
                    </p>
                  </motion.div>
                )}

                {/* 投稿枚数進捗表示 */}
                <div className="mb-4 px-4">
                  {isLineConnected ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm font-serif">
                      <InfinityIcon className="w-5 h-5" />
                      <span>✨ 無制限モード適用中</span>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                      uploadedCount >= 5 
                        ? 'bg-red-50 border-2 border-red-200' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <span className={`font-semibold text-sm font-serif ${
                        uploadedCount >= 5 
                          ? 'text-red-700' 
                          : 'text-orange-700'
                      }`}>
                        {uploadedCount >= 5 
                          ? '上限に達しました' 
                          : `残り投稿可能数: ${Math.max(0, 5 - uploadedCount)}枚`
                        }
                      </span>
                      {uploadedCount >= 5 && venueInfo?.enableLineUnlock && (
                        <span className="text-xs text-red-600 font-serif font-bold">⚠️ LINEで無制限化</span>
                      )}
                      {uploadedCount >= 5 && !venueInfo?.enableLineUnlock && (
                        <span className="text-xs text-red-600 font-serif font-bold">⚠️ 上限到達</span>
                      )}
                    </div>
                  )}
                </div>

                {/* LINE連携CTAバナー（STANDARD/PREMIUMプラン向け、LINE未連携の場合のみ） */}
                {venueInfo?.plan !== 'LIGHT' && venueInfo?.enableLineUnlock && !isLineConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mx-4 mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-green-900 font-bold text-sm font-serif mb-1">
                          写真をたくさん撮りましたか？
                        </p>
                        <p className="text-green-700 text-xs font-serif">
                          LINE連携で枚数制限なしで投稿できます
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // LINE公式アカウントの友達追加URLを別タブで開く
                          window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                          
                          // 即座に制限を解除（無条件で連携済みにする）
                          setIsLineConnected(true);
                          
                          // フィードバック: トースト通知を表示
                          toast.success('無制限モードが解放されました！🎉', {
                            description: 'これからは何枚でもアップロードできます✨',
                            duration: 4000,
                          });
                        }}
                        className="px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a3f] text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4" />
                        連携する
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 写真グリッド または エンプティステート */}
                {tablePhotos.length === 0 ? (
                  <div className="text-center py-12 md:py-16 px-4">
                    <Camera className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-600 text-lg font-serif mb-2">まだ写真がありません。</p>
                    <p className="text-stone-500 text-base font-serif">最初の1枚を投稿しましょう！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {itemsWithAds.map((item, index) => {
                  if (item.type === 'photo') {
                    const isSelected = selectedImageIds.includes(String(item.data.id));
                    return (
                      <motion.div
                        key={`photo-${item.data.id}`}
                        initial={newPhotoIds.has(String(item.data.id)) ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={newPhotoIds.has(String(item.data.id)) 
                          ? { 
                              type: 'spring', 
                              stiffness: 200, 
                              damping: 20,
                              delay: 0.1 
                            }
                          : { delay: index * 0.02 }
                        }
                        onClick={() => handleImageToggle({ id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                        className={`aspect-square bg-stone-200 overflow-hidden relative transition-all duration-200 rounded-sm ${
                          isSelectMode
                            ? 'active:opacity-80 cursor-pointer hover:scale-105'
                            : 'active:opacity-80 cursor-pointer hover:scale-105'
                        } shadow-md hover:shadow-xl`}
                      >
                        {(imageLoading[String(item.data.id)] === undefined || imageLoading[String(item.data.id)] === true) && (
                          <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: imageLoading[String(item.data.id)] === false ? 0 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse flex items-center justify-center z-10"
                          >
                            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </motion.div>
                        )}
                        <img
                          src={item.data.url}
                          alt={item.data.alt}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoading[String(item.data.id)] === false ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(String(item.data.id))}
                          onLoadStart={() => handleImageStartLoad(String(item.data.id))}
                          onContextMenu={(e) => handleImageContextMenu(e, { id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                          loading="lazy"
                        />

                        {/* チェックマーク（選択モード時のみ表示） */}
                        {isSelectMode && (
                          <div
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg ${
                              isSelected
                                ? 'bg-champagne-500 border-champagne-600 scale-110'
                                : 'bg-white/80 border-white/90 backdrop-blur-md'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  } else {
                    // インフィード広告
                    return (
                      <motion.div
                        key={`ad-${item.index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="aspect-square bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md overflow-hidden relative flex flex-col items-center justify-center border border-white/30 rounded-sm shadow-lg"
                      >
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-champagne-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest shadow-md">
                            PR
                          </span>
                        </div>
                        <div className="text-center p-4 mt-4 relative z-0">
                          <div className="w-full h-24 bg-white/20 backdrop-blur-sm rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/20">
                            <img
                              src={`https://picsum.photos/300/300?random=${900 + item.index}`}
                              alt="Advertisement"
                              className="w-full h-full object-cover opacity-80"
                            />
                          </div>
                          <p className="text-xs text-stone-700 font-medium">広告</p>
                        </div>
                      </motion.div>
                    );
                  }
                })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* 固定フッター - ダウンロードアクション（両方のタブで表示） */}
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg pb-[env(safe-area-inset-bottom)] z-50">
            <div className="px-4 py-3 max-w-md mx-auto">
              {isSelectMode ? (
                /* 選択モード時: 選択枚数とダウンロードボタン */
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedImageIds([]);
                    }}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>キャンセル</span>
                  </button>
                  <button
                    onClick={handleBulkDownload}
                    disabled={selectedImageIds.length === 0}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>{selectedImageIds.length}枚を保存</span>
                  </button>
                </div>
              ) : (
                /* 通常時: 一括保存と選択して保存の2ボタン */
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-3 bg-white border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 font-semibold rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>一括保存</span>
                  </button>
                  <button
                    onClick={handleSelectModeToggle}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>選択して保存</span>
                  </button>
                </div>
              )}
            </div>
          </footer>

          {/* アップロード用フッター（「この卓の写真」タブのみ、ダウンロードフッターの上に表示） */}
          {activeTab === 'table' && !isSelectMode && (
            <footer className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/50 shadow-lg pb-0 z-40">
              <div className="px-4 py-3 max-w-md mx-auto">
                {/* 投稿上限到達時: LINE連携ボタンに変化（会場設定で有効な場合のみ） */}
                {uploadedCount >= 5 && !isLineConnected && venueInfo?.enableLineUnlock ? (
                  <motion.button
                    type="button"
                    onClick={() => {
                      // LINE公式アカウントの友達追加URLを別タブで開く（ソフトゲート）
                      window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                      
                      // 即座に制限を解除（無条件で連携済みにする）
                      setIsLineConnected(true);
                      
                      // フィードバック: トースト通知を表示
                      toast.success('無制限モードが解放されました！🎉', {
                        description: 'これからは何枚でもアップロードできます✨',
                        duration: 4000,
                      });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 font-shippori text-lg py-4 px-6 rounded-xl shadow-md bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a3f] text-white hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">LINE連携で無制限にする</span>
                  </motion.button>
                ) : uploadedCount >= 5 && !isLineConnected && !venueInfo?.enableLineUnlock ? (
                  /* 上限到達時（LINE連携機能無効）: 無効化されたアップロードボタン */
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-300 text-gray-600 rounded-xl py-4 px-6 font-semibold cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    <span className="font-semibold">投稿上限に達しました（5枚）</span>
                  </button>
                ) : (
                  /* 通常時: アップロードボタン */
                  <label className="block w-full">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <motion.button
                      type="button"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isUploading}
                      className="w-full active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 text-lg py-4 px-6 rounded-xl shadow-md bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-semibold">アップロード中...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span className="font-semibold">写真をアップロード</span>
                        </>
                      )}
                    </motion.button>
                  </label>
                )}
              </div>
            </footer>
          )}

          {/* ダウンロード待機モーダル（広告表示付き） */}
          <DownloadWaitModal
            open={isDownloadModalOpen}
            onOpenChange={(open) => {
              setIsDownloadModalOpen(open);
              if (!open) {
                // モーダルが閉じられた場合はキャンセル
                setPendingDownloadAction(null);
              }
            }}
            onDownloadStart={() => {
              // カウントダウン終了時にダウンロード処理を実行
              if (pendingDownloadAction) {
                pendingDownloadAction();
              }
              // モーダルの閉じる処理は DownloadWaitModal 側で行われるため、ここでは実行しない
              setPendingDownloadAction(null);
            }}
            waitTime={5}
            adImageUrl="https://via.placeholder.com/600x400?text=Wedding+Ad"
            adTargetUrl="https://example.com/ad"
            adCatchCopy="新生活応援キャンペーン実施中！"
          />

          {/* 開発用デバッグパネル */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-32 right-4 z-[9999]">
              {!isDebugOpen ? (
                <button
                  onClick={() => setIsDebugOpen(true)}
                  className="bg-black/80 hover:bg-black/90 text-yellow-400 p-3 rounded-full shadow-xl border border-white/20 hover:scale-110 transition-all duration-200 active:scale-95"
                  title="デバッグパネルを開く"
                >
                  <span className="text-xl">🔧</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-black/90 backdrop-blur-md rounded-xl text-white text-xs border border-white/20 shadow-2xl w-64"
                >
                  {/* ヘッダー */}
                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                    <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                      <span>🔧</span>
                      <span>Debugger</span>
                    </h3>
                    <button
                      onClick={() => setIsDebugOpen(false)}
                      className="text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors active:scale-95"
                      title="最小化"
                    >
                      ー
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* プラン切り替え */}
                    <div>
                      <p className="text-stone-400 mb-1.5">
                        現在のプラン: <span className="text-white font-bold">{venueInfo?.plan || 'N/A'}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'LIGHT', enableLineUnlock: false });
                            }
                          }}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          LIGHT
                        </button>
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'STANDARD', enableLineUnlock: true });
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          STANDARD
                        </button>
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'PREMIUM', enableLineUnlock: false });
                            }
                          }}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          PREMIUM
                        </button>
                      </div>
                    </div>

                    {/* LINE連携状態切り替え */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 mb-1.5">
                        LINE連携: <span className="text-white font-bold">{isLineConnected ? 'ON' : 'OFF'}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLineConnected(true)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          ON
                        </button>
                        <button
                          onClick={() => setIsLineConnected(false)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          OFF
                        </button>
                      </div>
                    </div>

                    {/* 投稿数リセット */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 mb-1.5">
                        投稿数: <span className="text-white font-bold">{uploadedCount}枚</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUploadedCount(0)}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          0枚
                        </button>
                        <button
                          onClick={() => setUploadedCount(5)}
                          className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          5枚(上限)
                        </button>
                      </div>
                    </div>

                    {/* 現在の状態表示（参考情報） */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 text-[10px] leading-relaxed">
                        LINE連携機能: {venueInfo?.enableLineUnlock ? '有効' : '無効'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 font-sans">読み込み中...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
