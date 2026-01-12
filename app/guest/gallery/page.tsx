'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

// LINE ID（環境変数または定数で管理する想定）
const LINE_ID = '@あなたのLINE_ID'; // TODO: .envから取得するように変更

// 会場データ（将来的にDBから取得する想定）
const VENUE_INFO = {
  name: '表参道テラス',
  coverImage: 'https://picsum.photos/800/600?random=venue',
  date: '2026.01.20',
};

// コンフェッティの色
const CONFETTI_COLORS = [
  '#f1ce88', // シャンパンゴールド
  '#ff9980', // コーラルピンク
  '#ffffff', // 白
  '#fefbf3', // クリーム
  '#ffd6cc', // ライトコーラル
];

function GalleryContent() {
  const searchParams = useSearchParams();
  const tableID = searchParams.get('table');
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [showOpeningModal, setShowOpeningModal] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [viewingImage, setViewingImage] = useState<{ id: number; url: string; alt: string } | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
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
  const handleImageLoad = (photoId: number) => {
    setImageLoading((prev) => ({ ...prev, [photoId]: false }));
  };

  const handleImageStartLoad = (photoId: number) => {
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

  const handleImageToggle = (photo: { id: number; url: string; alt: string }) => {
    if (!isSelectMode) {
      // 通常モード：拡大表示
      setViewingImage(photo);
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
  const handleImageContextMenu = (e: React.MouseEvent, photo: { id: number; url: string; alt: string }) => {
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
    const currentIndex = photos.findIndex((p) => p.id === viewingImage.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setViewingImage(photos[nextIndex]);
    x.set(0);
    y.set(0);
  };

  const handlePrevImage = () => {
    if (!viewingImage) return;
    const currentIndex = photos.findIndex((p) => p.id === viewingImage.id);
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    setViewingImage(photos[prevIndex]);
    x.set(0);
    y.set(0);
  };


  // ダミーの写真データ（150枚）
  const photos = Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/400/300?random=${i + 1}`,
    alt: `写真 ${i + 1}`,
  }));

  // インフィード広告を含む写真リストを生成（12枚おきに広告を挿入）
  const itemsWithAds: Array<{ type: 'photo'; data: typeof photos[0] } | { type: 'ad'; index: number }> = [];
  photos.forEach((photo, index) => {
    itemsWithAds.push({ type: 'photo', data: photo });
    // 12枚おきに広告を挿入（最初と最後は除く）
    if ((index + 1) % 12 === 0 && index < photos.length - 1) {
      itemsWithAds.push({ type: 'ad', index: Math.floor((index + 1) / 12) });
    }
  });

  // コンフェッティ生成
  const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
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

          <div className="text-center space-y-8 w-full max-w-md relative z-10">
            {/* SPONSORED - エレガントなデザイン */}
            <div className="mb-6">
              <p className="font-serif text-stone-300/80 text-sm font-semibold tracking-[0.3em] uppercase">
                SPONSORED
              </p>
            </div>

            {/* メインメッセージ */}
            <div className="mb-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-stone-100 text-2xl sm:text-3xl font-light tracking-wide leading-relaxed px-4 mb-6 break-keep text-balance text-center"
              >
                お二人の特別な一日の写真を<br />ご覧いただけます
              </motion.p>
            </div>

            {/* 広告枠（グラスモーフィズム） */}
            <div className="mb-8 flex justify-center">
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
                  animate={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* カウントダウン - エレガント */}
            <div className="flex items-baseline justify-center gap-2">
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">あと</p>
              <p className="font-serif text-amber-300 text-6xl sm:text-7xl font-light drop-shadow-lg">
                {timeLeft}
              </p>
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">秒</p>
            </div>
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

            {/* 画像インデックス表示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm border border-white/10 shadow-lg"
            >
              {photos.findIndex((p) => p.id === viewingImage.id) + 1} / {photos.length}
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

      {/* メインコンテンツ */}
      {!showOpeningModal && (
        <>
          {/* ヒーローセクション */}
          <section
            ref={heroRef}
            className="relative w-full h-[60vh] min-h-[400px] overflow-hidden"
          >
            {/* 背景画像 */}
            <div className="absolute inset-0">
              <img
                src={VENUE_INFO.coverImage}
                alt={VENUE_INFO.name}
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
                className="text-center"
              >
                <h1 className="font-serif text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
                  Wedding Photo Gallery
                </h1>
                <p className="font-serif text-amber-200 text-xl md:text-2xl font-light tracking-wider drop-shadow-lg">
                  お二人の思い出
                </p>
              </motion.div>
            </div>

            {/* 装飾要素 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
          </section>

          {/* ヘッダー - スクロール時に会場名を表示 */}
          <motion.header
            initial={false}
            animate={{
              backgroundColor: isScrolled ? 'rgba(253, 251, 247, 0.95)' : 'transparent',
              backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
            }}
            className="sticky top-0 z-40 border-b border-stone-200/50 shadow-sm transition-all duration-300"
          >
            <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto relative">
              {/* 中央: タイトル */}
              <motion.div
                className="absolute left-1/2 transform -translate-x-1/2"
                initial={false}
                animate={{
                  opacity: isScrolled ? 1 : 0,
                }}
              >
                <h1 className="font-bold text-stone-800 text-base font-shippori whitespace-nowrap">
                  Wedding Photo Gallery
                </h1>
              </motion.div>

              {/* 右側: 選択ボタン */}
              <button
                onClick={handleSelectModeToggle}
                className={`ml-auto font-semibold text-base active:opacity-50 transition-all duration-200 px-4 py-2 rounded-lg ${
                  isScrolled
                    ? 'text-champagne-700 bg-champagne-50/50 hover:bg-champagne-50'
                    : 'text-white bg-white/10 backdrop-blur-sm hover:bg-white/20'
                }`}
              >
                {isSelectMode ? 'キャンセル' : '選択'}
              </button>
            </div>
          </motion.header>

          <div className="container mx-auto px-0 py-4 pb-28 relative z-10">
            {/* 写真グリッド - インフィード広告込み */}
            <div className="grid grid-cols-3 gap-1">
              {itemsWithAds.map((item, index) => {
                  if (item.type === 'photo') {
                    const isSelected = selectedImageIds.includes(item.data.id);
                    return (
                      <motion.div
                        key={`photo-${item.data.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleImageToggle(item.data)}
                        className={`aspect-square bg-stone-200 overflow-hidden relative transition-all duration-200 rounded-sm ${
                          isSelectMode
                            ? 'active:opacity-80 cursor-pointer hover:scale-105'
                            : 'active:opacity-80 cursor-pointer hover:scale-105'
                        } shadow-md hover:shadow-xl`}
                      >
                        {(imageLoading[item.data.id] === undefined || imageLoading[item.data.id] === true) && (
                          <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: imageLoading[item.data.id] === false ? 0 : 1 }}
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
                            imageLoading[item.data.id] === false ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(item.data.id)}
                          onLoadStart={() => handleImageStartLoad(item.data.id)}
                          onContextMenu={(e) => handleImageContextMenu(e, item.data)}
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
          </div>

          {/* フッターバー - 親指ゾーン最適化 */}
          <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/50 shadow-2xl pb-[env(safe-area-inset-bottom)] z-[9997]">
            <div className="px-4 py-4">
              <button
                onClick={handleSaveClick}
                className={`w-full active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 font-shippori text-xl py-6 px-8 rounded-2xl shadow-xl ${
                  isSelectMode && selectedImageIds.length > 0
                    ? 'bg-gradient-to-r from-champagne-500 to-champagne-600 active:from-champagne-600 active:to-champagne-700 text-white hover:shadow-2xl'
                    : 'bg-gradient-to-r from-stone-800 to-stone-900 active:from-stone-900 active:to-black text-white hover:shadow-2xl'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-semibold">
                  {isSelectMode && selectedImageIds.length > 0
                    ? `${selectedImageIds.length}枚を保存`
                    : '一括保存'}
                </span>
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 font-sans">読み込み中...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
