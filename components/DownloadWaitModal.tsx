'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadWaitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadStart: () => void;
  /** 待機時間（秒）デフォルト: 5秒 */
  waitTime?: number;
  /** 広告画像URL */
  adImageUrl?: string;
  /** 広告の遷移先URL */
  adTargetUrl?: string;
  /** 広告のキャッチコピー */
  adCatchCopy?: string;
}

/**
 * ダウンロード準備中の待機時間を活用した広告モーダル
 * 3〜5秒間の待機中に広告を表示し、カウントダウン後にダウンロードを開始
 */
export function DownloadWaitModal({
  open,
  onOpenChange,
  onDownloadStart,
  waitTime = 5,
  adImageUrl = 'https://via.placeholder.com/600x400?text=New+Life+Advertisement',
  adTargetUrl = 'https://example.com/ad',
  adCatchCopy = '新生活にお得な情報',
}: DownloadWaitModalProps) {
  const [countdown, setCountdown] = useState(waitTime);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      // モーダルが閉じられたときにリセット
      setCountdown(waitTime);
      setProgress(0);
      return;
    }

    // カウントダウン開始
    setCountdown(waitTime);
    setProgress(0);

    // プログレスバーを滑らかに更新（100msごと）
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (waitTime * 10); // 100msごとに更新
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 100);

    // カウントダウン（1秒ごと）
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          clearInterval(progressInterval);
          // ダウンロード開始
          onDownloadStart();
          onOpenChange(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [open, waitTime, onDownloadStart, onOpenChange]);

  const handleAdClick = () => {
    if (adTargetUrl) {
      window.open(adTargetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900 font-serif flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            写真を準備しています...
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600 mt-2 font-serif">
            ダウンロード準備中です。しばらくお待ちください。
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* 広告バナー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer group"
            onClick={handleAdClick}
          >
            {/* Sponsoredバッジ */}
            <div className="absolute top-3 right-3 z-10">
              <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                <span className="text-xs text-white font-medium tracking-wide">
                  Sponsored
                </span>
              </div>
            </div>

            {/* 広告画像 */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={adImageUrl}
                alt="広告"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* オーバーレイ（ホバー時） */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>

            {/* キャッチコピー */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base text-white font-semibold font-serif">
                  {adCatchCopy}
                </p>
                <ExternalLink className="w-5 h-5 text-white/80 flex-shrink-0" />
              </div>
            </div>
          </motion.div>

          {/* プログレスバー */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-serif">
                ダウンロード開始まであと
              </span>
              <span className="text-emerald-600 font-bold font-serif">
                {countdown}秒...
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* フッターメッセージ */}
          <p className="text-center text-sm text-gray-500 font-serif">
            準備が完了すると自動的にダウンロードが始まります
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
