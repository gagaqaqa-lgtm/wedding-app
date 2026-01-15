'use client';

import { motion, useMotionValue } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

interface Photo {
  id: number;
  url: string;
  alt: string;
}

interface LightboxProps {
  viewingImage: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ viewingImage, photos, onClose, onNext, onPrev }: LightboxProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  if (!viewingImage) return null;

  const currentIndex = photos.findIndex((p) => p.id === viewingImage.id);

  return (
    <AnimatePresence>
      {viewingImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
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
              onPrev();
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
              onNext();
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
                onClose();
                return;
              }

              // 左右スワイプ（前後の画像へ移動）
              if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(info.velocity.x) > horizontalVelocityThreshold) {
                if (info.offset.x > 0 || info.velocity.x > 0) {
                  onPrev();
                } else {
                  onNext();
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
            {currentIndex + 1} / {photos.length}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
