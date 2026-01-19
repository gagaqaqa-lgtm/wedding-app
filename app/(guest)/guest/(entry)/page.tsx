'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DEFAULT_VENUE_NAME } from '@/lib/constants/venues';

// ダミーデータ（実際はURLパラメータやAPIから取得）
const VENUE_NAME = DEFAULT_VENUE_NAME;
const WEDDINGS = [
  { id: 1, groom: '田中家', bride: '佐藤家', time: '11:00', passcode: '1111' },
  { id: 2, groom: '鈴木家', bride: '高橋家', time: '15:30', passcode: '1111' },
];

type Step = 'entrance' | 'gate';
type Wedding = typeof WEDDINGS[0];

export default function GuestPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('entrance');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shake, setShake] = useState(false);

  // パスコード入力ハンドラ
  const handleNumberPress = (num: string) => {
    if (passcode.length < 4 && !isUnlocking && !isUnlocked) {
      setPasscode((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isUnlocking && !isUnlocked) {
      setPasscode((prev) => prev.slice(0, -1));
    }
  };

  // パスコード検証
  useEffect(() => {
    if (passcode.length === 4 && selectedWedding && !isUnlocking && !isUnlocked) {
      setIsUnlocking(true);
      
      // 認証処理のシミュレーション
      setTimeout(() => {
        if (passcode === selectedWedding.passcode) {
          // 認証成功: 鍵が開くアニメーション
          setIsUnlocked(true);
          setTimeout(() => {
            // アンケートページへ直接遷移（Review Gatingフロー）
            router.push('/guest/survey');
          }, 1500);
        } else {
          // 認証失敗: シェイクアニメーション
          setIsUnlocking(false);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPasscode('');
          }, 600);
        }
      }, 500);
    }
  }, [passcode, selectedWedding, isUnlocking, isUnlocked]);


  // Step 1: Venue Entrance
  if (step === 'entrance') {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden">
        {/* 背景画像 */}
        <div className="fixed inset-0 z-0">
          <img
            src="https://picsum.photos/1000/1500?random=venue"
            alt={VENUE_NAME}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-20 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6 sm:space-y-8 pt-safe pb-safe">
            {/* ウェルカムメッセージ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="font-shippori text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 drop-shadow-2xl px-2">
                Welcome to {VENUE_NAME}
              </h1>
              <p className="text-stone-200/90 text-sm sm:text-base md:text-lg font-sans leading-relaxed drop-shadow-lg px-2">
                本日はご参列いただき、誠にありがとうございます。
              </p>
            </motion.div>

            {/* 説明カード（グラスモーフィズム） */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <p className="text-white/90 text-sm sm:text-base md:text-lg font-sans leading-relaxed text-center mb-4">
                お二人の特別な一日の写真を、皆様と共有するデジタルアルバムをご用意しました。
              </p>
              <p className="text-white/80 text-xs sm:text-sm md:text-base font-sans leading-relaxed text-center">
                ご参列の挙式を選択し、卓上のQRカードに記載された<strong className="font-bold text-white">4桁のパスコード</strong>を入力してご入場ください。
              </p>
            </motion.div>

            {/* 挙式リスト */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="space-y-3 sm:space-y-4"
            >
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-shippori font-semibold text-center mb-4 drop-shadow-lg">
                TODAY'S WEDDINGS
              </h2>
              {WEDDINGS.map((wedding) => (
                <motion.button
                  key={wedding.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedWedding(wedding);
                    setStep('gate');
                  }}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white/70 text-xs sm:text-sm font-sans mb-1">{wedding.time}〜</p>
                      <h3 className="text-white text-base sm:text-lg md:text-xl font-shippori font-semibold break-keep">
                        {wedding.groom}・{wedding.bride} 御両家 挙式
                      </h3>
                    </div>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white/90 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Secret Gate
  if (step === 'gate' && selectedWedding) {
    return (
      <div className="h-[100dvh] relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* コンテンツ - Flexboxで1画面完結 */}
        <div className="relative z-10 h-full flex flex-col justify-between items-center px-4 pt-safe pb-safe overflow-hidden">
          <div className="w-full max-w-md flex flex-col flex-1 justify-between min-h-0">
            {/* 上部エリア: 戻るボタン */}
            <div className="flex-shrink-0 pt-safe-top">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setStep('entrance');
                  setPasscode('');
                }}
                className="text-white/70 hover:text-white text-xs sm:text-sm font-sans flex items-center gap-2 py-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                挙式一覧に戻る
              </motion.button>
            </div>

            {/* 中央エリア: 鍵アイコン、メッセージ、パスコード表示 - Flexboxで均等配置 */}
            <div className="flex-1 flex flex-col justify-center items-center min-h-0 gap-2 sm:gap-3 md:gap-4">
              {/* 鍵アイコン */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex-shrink-0"
              >
                <motion.div
                  animate={shake ? {
                    x: [0, -30, 30, -30, 30, -15, 15, -8, 8, 0],
                  } : isUnlocked ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: shake ? 0.5 : 0.6,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 max-w-[80px] max-h-[80px] text-white/80"
                >
                  {isUnlocked ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </motion.div>
              </motion.div>

              {/* メッセージ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className="text-center flex-shrink-0 px-2"
              >
                <h2 className="font-shippori text-white text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 leading-tight">
                  {selectedWedding.groom}・{selectedWedding.bride} 御両家 挙式
                </h2>
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-sans leading-relaxed">
                  卓上のQRカードに記載された4桁の番号を入力してください
                </p>
              </motion.div>

              {/* パスコード表示 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                className="flex justify-center gap-2 sm:gap-3 flex-shrink-0"
              >
                {Array.from({ length: 4 }).map((_, index) => {
                  const isFilled = index < passcode.length;
                  return (
                    <motion.div
                      key={index}
                      animate={{
                        scale: isFilled ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: 'easeOut',
                      }}
                      className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                        isUnlocked
                          ? 'bg-green-500 border-green-500'
                          : isFilled
                          ? 'bg-white border-white'
                          : 'bg-transparent border-2 border-white/40'
                      }`}
                    />
                  );
                })}
              </motion.div>

              {/* ロック解除中のメッセージ */}
              {isUnlocking && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/70 text-xs sm:text-sm text-center font-sans flex-shrink-0"
                >
                  ロック解除中...
                </motion.p>
              )}
            </div>

            {/* 下部エリア: テンキーパッド */}
            {!isUnlocking && !isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                className="flex-shrink-0 pb-safe-bottom"
              >
                <div className="max-w-xs mx-auto w-full">
                  {/* 数字キー 1-9 */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <motion.button
                        key={num}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleNumberPress(num.toString())}
                        disabled={passcode.length >= 4}
                        className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg sm:text-xl md:text-2xl font-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation hover:bg-white/20 active:bg-white/30"
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  {/* 下部行: 空、0、削除 */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div></div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleNumberPress('0')}
                      disabled={passcode.length >= 4}
                      className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg sm:text-xl md:text-2xl font-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation hover:bg-white/20 active:bg-white/30"
                    >
                      0
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleDelete}
                      disabled={passcode.length === 0}
                      className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-transparent text-white/70 text-xs sm:text-sm md:text-base font-normal flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation hover:text-white active:opacity-100"
                    >
                      削除
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
