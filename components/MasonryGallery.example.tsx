/**
 * MasonryGallery 使用例
 * 
 * このファイルは実装例として参考にしてください。
 * 実際の使用時は、各ページに適切に統合してください。
 */

'use client';

import React from 'react';
import { MasonryGallery } from '@/components/MasonryGallery';

// 使用例1: 基本的な使用
export function BasicMasonryExample() {
  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1', alt: 'Photo 1' },
    { id: 2, url: 'https://images.unsplash.com/photo-2', alt: 'Photo 2' },
    // ... 20枚以上の写真
  ];

  const handlePhotoClick = (photo: typeof photos[0]) => {
    console.log('Photo clicked:', photo.id);
    // ライトボックスを開くなどの処理
  };

  const handleAdImpression = (adId: string) => {
    console.log('Ad impression:', adId);
    // アナリティクスに送信
  };

  const handleAdClick = (adId: string) => {
    console.log('Ad clicked:', adId);
    // アナリティクスに送信
  };

  return (
    <MasonryGallery
      photos={photos}
      onPhotoClick={handlePhotoClick}
      adInterval={9}
      initialPhotoCount={9}
      generateAd={(index) => ({
        id: `ad-${index + 1}`,
        imageUrl: `https://via.placeholder.com/400x400?text=Ad+${index + 1}`,
        catchCopy: '新生活にお得な情報',
        targetUrl: `https://example.com/ad/${index + 1}`,
        badgeText: 'Sponsored',
        advertiserName: '広告主名',
        onImpression: handleAdImpression,
        onClick: handleAdClick,
      })}
      columnsCountBreakPoints={{
        350: 1,
        750: 2,
        900: 3,
      }}
      className="px-4 py-6"
    />
  );
}
