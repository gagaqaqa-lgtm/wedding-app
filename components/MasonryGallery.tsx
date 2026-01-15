'use client';

import React, { useMemo } from 'react';
import { ResponsiveMasonry } from 'react-responsive-masonry';
import { motion } from 'framer-motion';
import { AdCard } from '@/components/AdCard';

interface PhotoItem {
  id: string | number;
  url: string;
  alt?: string;
  [key: string]: unknown;
}

interface AdItem {
  id: string;
  type: 'ad';
  imageUrl: string;
  catchCopy: string;
  targetUrl: string;
  badgeText?: string;
  advertiserName?: string;
  onImpression?: (id: string) => void;
  onClick?: (id: string) => void;
}

type GalleryItem = { type: 'photo'; data: PhotoItem } | AdItem;

interface MasonryGalleryProps {
  /** 写真データの配列 */
  photos: PhotoItem[];
  /** 写真をクリックした時のハンドラ */
  onPhotoClick?: (photo: PhotoItem) => void;
  /** 広告挿入の間隔（デフォルト: 9枚ごと） */
  adInterval?: number;
  /** 最初のN枚は広告を入れない（デフォルト: 9枚） */
  initialPhotoCount?: number;
  /** 広告データの生成関数（オプション） */
  generateAd?: (index: number) => Omit<AdItem, 'type'>;
  /** カラム数の設定（レスポンシブ） */
  columnsCountBreakPoints?: { [key: number]: number };
  /** カスタムクラス名 */
  className?: string;
}

/**
 * World-Class Masonry Gallery Component
 * - 写真と広告が混在しても順序が崩れないMasonryレイアウト
 * - ビジネスロジック: 最初のN枚は写真を連続表示し、以降N枚ごとに広告を挟む
 * - パフォーマンス最適化: react-responsive-masonryによる効率的なレンダリング
 */
export function MasonryGallery({
  photos,
  onPhotoClick,
  adInterval = 9,
  initialPhotoCount = 9,
  generateAd,
  columnsCountBreakPoints = {
    350: 1,
    750: 2,
    900: 3,
  },
  className,
}: MasonryGalleryProps) {
  // 広告を含むアイテムリストを生成
  const itemsWithAds: GalleryItem[] = useMemo(() => {
    const items: GalleryItem[] = [];
    let adIndex = 0;

    photos.forEach((photo, index) => {
      // 写真を追加
      items.push({ type: 'photo', data: photo });

      // 最初のN枚の後、以降N枚ごとに広告を挿入
      if (index >= initialPhotoCount - 1 && (index - initialPhotoCount + 1) % adInterval === 0) {
        const adData = generateAd
          ? generateAd(adIndex)
          : {
              id: `ad-${adIndex + 1}`,
              imageUrl: `https://via.placeholder.com/400x400?text=New+Life+Ad+${adIndex + 1}`,
              catchCopy: '新生活にお得な情報',
              targetUrl: `https://example.com/ad/${adIndex + 1}`,
              badgeText: 'Sponsored' as const,
            };
        items.push({ ...adData, type: 'ad' });
        adIndex++;
      }
    });

    return items;
  }, [photos, adInterval, initialPhotoCount, generateAd]);

  return (
    <div className={className}>
      <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
        <div className="masonry-grid">
          {itemsWithAds.map((item, index) => {
            if (item.type === 'photo') {
              return (
                <motion.div
                  key={`photo-${item.data.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="masonry-item mb-4"
                >
                  <button
                    onClick={() => onPhotoClick?.(item.data)}
                    className="relative w-full rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={item.data.url}
                      alt={item.data.alt || `Photo ${item.data.id}`}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={`ad-${item.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="masonry-item mb-4"
                >
                  <AdCard
                    id={item.id}
                    imageUrl={item.imageUrl}
                    catchCopy={item.catchCopy}
                    targetUrl={item.targetUrl}
                    badgeText={item.badgeText}
                    advertiserName={item.advertiserName}
                    onImpression={item.onImpression}
                    onClick={item.onClick}
                  />
                </motion.div>
              );
            }
          })}
        </div>
      </ResponsiveMasonry>
    </div>
  );
}
