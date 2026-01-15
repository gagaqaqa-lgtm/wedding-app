'use client';

import { motion } from 'framer-motion';

interface OpeningModalProps {
  timeLeft: number;
}

export function OpeningModal({ timeLeft }: OpeningModalProps) {
  return (
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
  );
}
