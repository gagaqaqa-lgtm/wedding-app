'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Info } from 'lucide-react'; // Infoアイコン追加: 透明性のため
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
// import Image from 'next/image'; // Next.js環境に合わせて有効化（外部ドメイン設定が必要）

interface AdCardProps {
  id: string; // トラッキング用にIDは必須
  imageUrl?: string;
  catchCopy?: string;
  targetUrl?: string;
  className?: string;
  badgeText?: string;
  advertiserName?: string; // 信頼性向上: 広告主名
  /** インプレッション計測用コールバック */
  onImpression?: (id: string) => void;
  /** クリック計測用コールバック */
  onClick?: (id: string) => void;
}

/**
 * World-Class AdCard Component
 * - パフォーマンス最適化 (Next/Image対応準備)
 * - ビジネスロジック統合 (Click/Impression Tracking)
 * - UX/アクセシビリティ強化
 */
export function AdCard({
  id,
  imageUrl = 'https://via.placeholder.com/400x400?text=New+Life+Ad',
  catchCopy = '新生活にお得な情報',
  targetUrl = 'https://example.com/ad',
  className,
  badgeText = 'Sponsored',
  advertiserName,
  onImpression,
  onClick,
}: AdCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hasImpressed, setHasImpressed] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  // ビジネスロジック: クリック計測
  const handleClick = (e: React.MouseEvent) => {
    // 伝播を止める必要がある場合は e.stopPropagation();
    
    // アナリティクス送信
    if (onClick) {
      onClick(id);
    }
    
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // IntersectionObserver: インプレッション計測（画面内に50%以上表示された時点で発火）
  useEffect(() => {
    if (!onImpression || !cardRef.current || hasImpressed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 50%以上表示された場合にインプレッションを計測
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (onImpression && !hasImpressed) {
              onImpression(id);
              setHasImpressed(true);
            }
            // 計測後は監視を停止
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0.5], // 50%表示された時点で発火
        rootMargin: '0px',
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [id, onImpression, hasImpressed]);

  if (imgError) {
    // フォールバックUI（画像エラー時もレイアウトを崩さない）
    return (
      <div className={cn("aspect-square rounded-lg bg-gray-100 flex items-center justify-center", className)}>
         <span className="text-xs text-gray-400">Sponsored Content</span>
      </div>
    );
  }

  return (
    <motion.button
      ref={cardRef}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden bg-gray-100 group w-full',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'transition-shadow duration-300 hover:shadow-lg', // 立体感の強化
        className
      )}
      aria-label={`${badgeText}: ${catchCopy}`}
    >
      {/* 画像レイヤー */}
      <div className="absolute inset-0">
        {/* Next/Imageの使用を強く推奨するが、外部ドメイン設定が不明なため一旦imgタグとする。
            本番環境では <Image fill sizes="..." ... /> に置き換えること。 */}
        <img
          src={imageUrl}
          alt={catchCopy} // 具体的な内容をaltにする
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" // 内部でのズーム効果でリッチさを演出
          loading="lazy"
          onError={() => setImgError(true)}
        />
        
        {/* グラデーションオーバーレイ: 視認性確保のため常に薄くかける + ホバーで濃くする */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ヘッダーエリア: バッジと透明性 */}
      <div className="absolute top-2 right-2 left-2 z-10 flex justify-between items-start">
        {/* 広告主名がある場合は表示（信頼性向上） */}
        {advertiserName && (
             <span className="text-[10px] text-white/90 bg-black/20 backdrop-blur-[2px] px-1.5 py-0.5 rounded truncate max-w-[50%]">
               {advertiserName}
             </span>
        )}
        <div className="ml-auto px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10 shadow-sm">
          <span className="text-[10px] text-white font-medium tracking-wide uppercase flex items-center gap-1">
            {badgeText}
            <Info className="w-3 h-3 opacity-70" />
          </span>
        </div>
      </div>

      {/* フッターエリア: コピーとアクション */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white font-bold font-serif line-clamp-2 leading-tight drop-shadow-md">
            {catchCopy}
          </p>
          <div className="flex items-center gap-1 text-emerald-300 text-xs font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span>詳細を見る</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
