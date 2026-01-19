# Guest画面コードレビュー用 - 全ファイル連結

## ファイル一覧
1. `app/(guest)/layout.tsx` - Guest画面共通レイアウト
2. `app/(guest)/guest/(entry)/page.tsx` - ゲストエントリーページ（Portal）
3. `app/(guest)/guest/(main)/gallery/page.tsx` - ギャラリーページ
4. `app/(guest)/guest/(onboarding)/survey/page.tsx` - アンケート/レビューページ
5. `components/guest/OpeningModal.tsx` - オープニングモーダルコンポーネント
6. `components/guest/Lightbox.tsx` - ライトボックスコンポーネント
7. `components/DownloadWaitModal.tsx` - ダウンロード待機モーダルコンポーネント

---

## 1. app/(guest)/layout.tsx

```tsx
import { ReactNode } from 'react';

/**
 * ゲスト画面共通レイアウト
 * 
 * Route Group `(guest)` の共通レイアウトです。
 * ゲスト用のシンプルなレイアウトを提供します（認証不要）。
 */
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* シンプルなレイアウト（認証不要） */}
      {children}
    </div>
  );
}
```

---

## 2. app/(guest)/guest/(entry)/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_VENUE_NAME } from '@/lib/constants/venues';

// ダミーデータ（実際はURLパラメータやAPIから取得）
const VENUE_NAME = DEFAULT_VENUE_NAME;
const WEDDINGS = [
  { id: 1, groom: '田中家', bride: '佐藤家', time: '11:00', passcode: '1111' },
  { id: 2, groom: '鈴木家', bride: '高橋家', time: '15:30', passcode: '1111' },
];

type Step = 'entrance' | 'gate' | 'dashboard';
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
            setStep('dashboard');
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

  const handleLogout = () => {
    setStep('entrance');
    setSelectedWedding(null);
    setPasscode('');
    setIsUnlocking(false);
    setIsUnlocked(false);
    setShake(false);
  };

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

  // Step 3: Dashboard
  if (step === 'dashboard' && selectedWedding) {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden bg-stone-50">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-8 sm:mb-12 md:mb-16 pt-safe-top"
          >
            <h1 className="font-shippori text-stone-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Welcome to {selectedWedding.groom} & {selectedWedding.bride}'s Wedding
            </h1>
            <p className="text-stone-600 text-sm sm:text-base md:text-lg font-sans">
              本日はご参列いただき、誠にありがとうございます
            </p>
          </motion.div>

          {/* メニューカード */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8"
          >
            {/* Gallery カード */}
            <motion.div
              onClick={() => router.push('/guest/gallery')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block relative h-full bg-white/60 backdrop-blur-xl border-2 border-stone-200/50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-stone-200/80 via-stone-100/80 to-stone-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="mb-6 sm:mb-8 flex items-center justify-start">
                <motion.div
                  className="text-stone-800 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-shippori font-semibold text-stone-800 mb-3 sm:mb-4">
                📸 GALLERY
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-sans leading-relaxed mb-6">
                結婚式の写真を閲覧・保存できます
              </p>
              <div className="flex items-center gap-2 text-stone-700 font-sans">
                <span className="text-sm sm:text-base">詳細を見る</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>

            {/* Message カード */}
            <motion.div
              onClick={() => router.push('/guest/survey')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block relative h-full bg-white/60 backdrop-blur-xl border-2 border-stone-200/50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/80 via-amber-100/80 to-amber-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="mb-6 sm:mb-8 flex items-center justify-start">
                <motion.div
                  className="text-amber-900 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-shippori font-semibold text-amber-900 mb-3 sm:mb-4">
                ✉️ MESSAGE
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-sans leading-relaxed mb-6">
                ご感想をお聞かせください
              </p>
              <div className="flex items-center gap-2 text-stone-700 font-sans">
                <span className="text-sm sm:text-base">詳細を見る</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* ログアウトボタン */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            onClick={handleLogout}
            className="mt-8 sm:mt-12 text-stone-500 hover:text-stone-700 text-sm sm:text-base font-sans flex items-center gap-2 pb-safe-bottom transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ログアウト</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}
```

---

## 3. app/(guest)/guest/(main)/gallery/page.tsx

※ このファイルは非常に長いため（2382行）、主要な部分のみ抜粋します。完全なコードは実際のファイルを参照してください。

```tsx
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

  // ... (以下、2382行の完全なコード)
  // 主要な機能:
  // - オープニングモーダル（3秒カウントダウン、Skipボタン付き）
  // - タブ切り替え（お二人の写真 / この卓の写真）
  // - 写真アップロード（コンプライアンスチェック、枚数制限、LINE連携）
  // - 写真ダウンロード（単一/一括、プラン別広告モーダル）
  // - ライトボックス（スワイプ対応）
  // - インフィード広告（12枚おき）
  // - プラン制限ロジック（LIGHT/STANDARD/PREMIUM）
  // - 戻るボタン（左上固定）
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
```

※ 完全なコード（2382行）は実際のファイル `app/(guest)/guest/(main)/gallery/page.tsx` を参照してください。

---

## 4. app/(guest)/guest/(onboarding)/survey/page.tsx

```tsx
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Send, Sparkles, Heart, Lock, Unlock, Key, MessageSquare, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';

// ============================================================================
// レビュー設定（会場ごとに変更可能）
// 将来的にバックエンド（Venue設定）から取得する想定
// ============================================================================
const REVIEW_CONFIG = {
  /** レビュー投稿先URL（管理画面で登録されたURL） */
  url: 'https://maps.google.com/?q=表参道テラス', // TODO: 実際のレビュー投稿URLに置き換え
  /** 外部誘導する最低星数（この値以上なら外部誘導、未満なら内部フィードバック） */
  minRatingForExternal: 4, // 4以上なら外部、3以下なら内部
} as const;

// ============================================================================
// LocalStorage管理
// ============================================================================
const getReviewStorageKey = (guestId?: string) => {
  return `wedding_app_review_completed_${guestId || 'default'}`;
};

type Step = 'locked' | 'rating' | 'action' | 'unlocking' | 'redirecting';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || '';
  const guestId = searchParams.get('guestId') || undefined; // ゲストID（オプション）
  
  const [step, setStep] = useState<Step>('locked');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // 評価が高い場合（設定値以上）は外部誘導あり、低い場合（設定値未満）は内部フィードバックのみ
  const isHighRating = rating >= REVIEW_CONFIG.minRatingForExternal;

  // 初期状態：ロックされた鍵アイコンを表示
  useEffect(() => {
    // 少し遅延してから評価ステップへ遷移（ロック状態を一瞬表示）
    const timer = setTimeout(() => {
      setStep('rating');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStarClick = (value: number) => {
    setRating(value);
    // 星をクリックした瞬間にアクションステップへ遷移
    setTimeout(() => {
      setStep('action');
    }, 300);
  };

  // レビュー完了状態をLocalStorageに保存
  const markReviewCompleted = () => {
    try {
      const storageKey = getReviewStorageKey(guestId);
      localStorage.setItem(storageKey, 'true');
      // レビュー情報も保存（オプション）
      localStorage.setItem(`${storageKey}_data`, JSON.stringify({
        rating,
        feedbackText,
        completedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save review status:', error);
    }
  };

  // 紙吹雪エフェクトを発火
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // 左側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'], // emerald, teal, gold, coral, white
      });
      
      // 右側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'],
      });
    }, 250);
  };

  // ロック解除演出を表示（解除アクション実行後）
  const showUnlockAnimation = () => {
    setStep('unlocking');
    
    // レビュー完了状態を保存
    markReviewCompleted();
    
    // 紙吹雪エフェクトを発火
    triggerConfetti();
  };

  // 外部レビューサイトへの誘導（高評価の場合）
  const handleExternalReviewClick = () => {
    // 外部サイトを開く
    window.open(REVIEW_CONFIG.url, '_blank', 'noopener,noreferrer');
    
    toast.success('ありがとうございます！', {
      description: 'レビューサイトで口コミを投稿していただけると幸いです',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示（URLを開いた瞬間に解除）
    showUnlockAnimation();
  };

  // フィードバック送信（低評価の場合）
  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    // TODO: API呼び出しでフィードバックを保存
    // TODO: API経由でフィードバックを送信
    
    toast.success('ご意見ありがとうございます', {
      description: '貴重なご意見をいただき、ありがとうございます',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示
    showUnlockAnimation();
  };

  // ギャラリーへ進むボタン（ロック解除後のみ表示）
  const handleGoToGallery = () => {
    setStep('redirecting');
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 500);
  };

  return (
    <div className="min-h-dvh relative flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
      {/* 戻るボタン */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-emerald-200/50 flex items-center justify-center text-emerald-600 hover:bg-white hover:shadow-md transition-all duration-200 active:scale-95"
        aria-label="戻る"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* 背景装飾: 優しいグラデーションのオーバーレイ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200/50 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 0: 初期状態 - ロックされた鍵アイコン */}
            {step === 'locked' && (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg">
                    <Lock className="w-12 h-12 text-emerald-600" />
                  </div>
                </motion.div>
                <p className="text-base sm:text-lg text-gray-600 font-serif">
                  レビューを完了すると、ギャラリーが開きます
                </p>
              </motion.div>
            )}

            {/* Step 1: 評価 ('rating') */}
            {step === 'rating' && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* ヘッダー */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                    <h1 className="font-serif text-emerald-800 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Thank You!
                    </h1>
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed">
                    本日はお越しいただき、ありがとうございました
                    <br />
                    お時間のあるときに、ご感想をお聞かせください
                  </p>
                </motion.div>

                {/* 星評価 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex justify-center items-center gap-2 sm:gap-3 py-6"
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isActive = rating >= value || hoveredStar >= value;
                    return (
                      <motion.button
                        key={value}
                        onClick={() => handleStarClick(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(0)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "transition-all duration-200",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full p-1"
                        )}
                        aria-label={`${value}つ星`}
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-all duration-200",
                            isActive
                              ? "text-emerald-500 fill-emerald-500"
                              : "text-gray-300 fill-gray-100"
                          )}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* ヒントテキスト */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-sm text-gray-500 font-serif"
                >
                  星をタップして評価してください
                </motion.p>
              </motion.div>
            )}

            {/* Step 2: アクション ('action') - ロック解除アクションを実行 */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* 高評価（設定値以上）の場合 - 外部レビューサイト誘導 */}
                {isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        素晴らしい評価をありがとうございます！
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        よろしければレビューサイトにも思い出を投稿していただけませんか？
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* ロック解除アクションボタン（高評価） */}
                      <motion.button
                        onClick={handleExternalReviewClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        )}
                      >
                        <ExternalLink className="w-6 h-6" />
                        <span>口コミを投稿してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}

                {/* 低評価（設定値未満）の場合 - フィードバック入力 */}
                {!isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-emerald-600" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        貴重なご意見ありがとうございます
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        新郎新婦へのメッセージがあればご記入ください
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="ご意見・ご感想をご記入ください（任意）"
                        rows={5}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-emerald-50/50 border-2 border-emerald-200",
                          "text-gray-800 font-serif text-sm sm:text-base",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                          "resize-none transition-all duration-200"
                        )}
                      />

                      {/* ロック解除アクションボタン（低評価） */}
                      <motion.button
                        onClick={handleFeedbackSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Send className="w-5 h-5" />
                        <span>メッセージを送信してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: ロック解除演出 ('unlocking') - ここで初めて「ギャラリーへ進む」ボタンを表示 */}
            {step === 'unlocking' && (
              <motion.div
                key="unlocking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-8"
              >
                {/* 鍵アイコン（ロック状態 → アンロック状態） */}
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0, 0] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Lock className="w-20 h-20 text-gray-400" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1], scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <div className="relative">
                        <Unlock className="w-20 h-20 text-emerald-500" />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Key className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* メッセージ */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 font-serif">
                    ギャラリーの鍵が開きました！
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 font-serif">
                    ありがとうございます。思い出の写真をご覧いただけます
                  </p>
                </motion.div>

                {/* パーティクルエフェクト（視覚的な演出） */}
                <motion.div
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 0.8],
                        y: [0, -20],
                      }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className="w-3 h-3 rounded-full bg-emerald-400"
                    />
                  ))}
                </motion.div>

                {/* ギャラリーへ進むボタン（ロック解除後に初めて表示） */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="pt-4"
                >
                  <motion.button
                    onClick={handleGoToGallery}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                      "hover:from-emerald-600 hover:to-teal-700",
                      "text-white font-serif text-lg sm:text-xl font-semibold",
                      "py-5 sm:py-6 px-8 rounded-2xl",
                      "shadow-lg hover:shadow-xl",
                      "transition-all duration-200",
                      "flex items-center justify-center gap-3",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>ギャラリーへ進む</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: リダイレクト ('redirecting') */}
            {step === 'redirecting' && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-emerald-800 text-lg sm:text-xl font-semibold"
                >
                  ギャラリーへ移動します
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 font-serif"
                >
                  しばらくお待ちください...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-emerald-700 font-serif">読み込み中...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
```

---

## 5. components/guest/OpeningModal.tsx

```tsx
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
```

---

## 6. components/guest/Lightbox.tsx

```tsx
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
```

---

## 7. components/DownloadWaitModal.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

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
          // ダウンロード開始（状態更新を次のイベントループで実行）
          setTimeout(() => {
            onDownloadStart();
            onOpenChange(false);
          }, 0);
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

  const handleClose = () => {
    // 明示的に閉じる処理
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto z-[150]">
        {/* 明示的な閉じるボタン（右上） */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute top-4 right-4 z-50",
            "p-2 rounded-full",
            "bg-white/90 hover:bg-white",
            "text-gray-600 hover:text-gray-900",
            "transition-all duration-200",
            "shadow-md hover:shadow-lg",
            "active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          )}
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

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

          {/* 閉じるボタン（下部にも追加） */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className={cn(
                "w-full py-3 px-4 rounded-lg",
                "bg-gray-100 hover:bg-gray-200",
                "text-gray-700 font-semibold text-sm",
                "transition-all duration-200",
                "active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              キャンセル
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## レビュー観点

### 1. 画面遷移の整合性
- **Portal → Gallery → Survey**: `app/(guest)/guest/(entry)/page.tsx` の `setStep('dashboard')` から、`router.push('/guest/gallery')` と `router.push('/guest/survey')` への遷移が実装されています。
- **Survey → Gallery**: `app/(guest)/guest/(onboarding)/survey/page.tsx` の `handleGoToGallery` で `router.push(\`/guest/gallery\${tableId ? \`?table=\${tableId}\` : ''}\`)` が実装されています。
- **戻るボタン**: Gallery と Survey の両方に `router.back()` を使用した戻るボタンが実装されています。

### 2. デザインとレスポンシブ対応
- **Tailwind CSS**: すべての画面で `sm:`, `md:`, `lg:` ブレークポイントを使用したレスポンシブデザインが実装されています。
- **framer-motion**: アニメーションとトランジションが一貫して使用されています。
- **Safe Area**: `pt-safe`, `pb-safe` などのクラスでモバイルデバイスの安全領域に対応しています。

### 3. プラン制限などのロジック
- **Gallery ページ**: `venueInfo?.plan === 'LIGHT'` の条件で広告モーダル（`DownloadWaitModal`）を表示するロジックが実装されています。
- **LINE連携**: `venueInfo?.enableLineUnlock` と `isLineConnected` の状態に基づいて、投稿枚数制限の解除機能が実装されています。
- **投稿枚数制限**: `uploadedCount >= 5` で制限をチェックし、LINE連携で無制限化できる仕組みが実装されています。

---

**注意**: `app/(guest)/guest/(main)/gallery/page.tsx` は2382行の非常に長いファイルのため、上記では主要な構造のみを記載しています。完全なコードレビューには、実際のファイルを参照してください。
