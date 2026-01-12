'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ダミーデータ
const VENUE_NAME = '表参道テラス';
const WEDDINGS = [
  { id: 1, groom: '田中家', bride: '佐藤家', time: '11:00', passcode: '1111' },
  { id: 2, groom: '鈴木家', bride: '高橋家', time: '15:30', passcode: '1111' },
];

type Step = 'entrance' | 'gate' | 'dashboard';
type Wedding = typeof WEDDINGS[0];

export default function GuestPortalPage() {
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
            setIsUnlocking(false);
            setIsUnlocked(false);
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
              <p className="text-champagne-200/90 text-sm sm:text-base md:text-lg font-sans leading-relaxed drop-shadow-lg px-2">
                本日はご参列いただき、誠にありがとうございます。
              </p>
            </motion.div>

            {/* 説明カード（グラスモーフィズム） */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-champagne-400/20 backdrop-blur-sm flex items-center justify-center border border-champagne-300/30">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-champagne-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg font-sans leading-relaxed px-2">
                  お二人の特別な一日の写真を、皆様と共有するデジタルアルバムをご用意しました。
                </p>
                <p className="text-white/90 text-xs sm:text-sm md:text-base font-sans leading-relaxed px-2">
                  ご参列の挙式を選択し、卓上のQRカードに記載された<strong className="text-champagne-300 font-semibold">4桁のパスコード</strong>を入力してご入場ください。
                </p>
              </div>
            </motion.div>

            {/* TODAY'S WEDDINGS タイトル */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              <h2 className="font-shippori text-champagne-200 text-lg sm:text-xl md:text-2xl font-semibold tracking-wider drop-shadow-lg mb-4 sm:mb-6">
                TODAY'S WEDDINGS
              </h2>
            </motion.div>

            {/* 結婚式リスト */}
            <div className="w-full space-y-3 sm:space-y-4">
              {WEDDINGS.map((wedding, index) => (
                <motion.button
                  key={wedding.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedWedding(wedding);
                    setStep('gate');
                  }}
                  className="w-full bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-champagne-600 text-xs sm:text-sm font-sans font-semibold mb-1 sm:mb-2">{wedding.time}</p>
                      <h3 className="font-shippori text-stone-800 text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0 sm:mb-1 break-keep">
                        {wedding.groom}・{wedding.bride} 御両家 挙式
                      </h3>
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-champagne-600 group-hover:translate-x-1 transition-transform duration-300"
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
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Secret Gate
  if (step === 'gate' && selectedWedding) {
    return (
      <div className="min-h-[100dvh] relative overflow-y-auto bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4 py-8 sm:py-12">
        {/* 背景装飾 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-champagne-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md my-auto pt-safe pb-safe">
          {/* 戻るボタン */}
          <button
            onClick={() => {
              setStep('entrance');
              setSelectedWedding(null);
              setPasscode('');
              setIsUnlocking(false);
              setIsUnlocked(false);
            }}
            className="mb-4 sm:mb-6 md:mb-8 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-sans text-sm sm:text-base pt-safe-top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>

          {/* メインコンテンツ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 border border-white/20 shadow-2xl"
          >
            {/* 鍵アイコン */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <motion.div
                animate={isUnlocked ? {
                  scale: [1, 1.3, 1.2],
                  rotate: [0, -15, 15, 0],
                } : {}}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="relative"
              >
                {isUnlocked ? (
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-champagne-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </motion.div>
            </div>

            {/* タイトル */}
            <h2 className="font-shippori text-white text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4">
              Secret Gate
            </h2>
            <p className="text-white/80 text-center mb-6 sm:mb-8 font-sans text-sm sm:text-base px-2">
              卓上のQRカードに記載された4桁の番号を入力してください
            </p>

            {/* パスコード表示 */}
            <motion.div
              animate={shake ? {
                x: [0, -20, 20, -20, 20, -10, 10, 0],
              } : {}}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
              className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8"
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
                      duration: 0.2,
                      ease: 'easeOut',
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isFilled
                        ? 'bg-champagne-500 border-champagne-400'
                        : 'bg-transparent border-white/30'
                    }`}
                  >
                    {isFilled && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* テンキーパッド */}
            {!isUnlocked && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberPress(num.toString())}
                    disabled={isUnlocking || passcode.length >= 4}
                    className="aspect-square rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xl sm:text-2xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all touch-manipulation"
                  >
                    {num}
                  </motion.button>
                ))}
                <div></div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumberPress('0')}
                  disabled={isUnlocking || passcode.length >= 4}
                  className="aspect-square rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xl sm:text-2xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all touch-manipulation"
                >
                  0
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={isUnlocking || passcode.length === 0}
                  className="aspect-square rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all touch-manipulation"
                >
                  削除
                </motion.button>
              </div>
            )}

            {/* 認証中の表示 */}
            {isUnlocking && !isUnlocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 sm:mt-6 text-center"
              >
                <p className="text-white/80 text-sm font-sans">認証中...</p>
              </motion.div>
            )}

            {/* ロック解除中の表示 */}
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 sm:mt-6 text-center pb-safe-bottom"
              >
                <p className="text-green-400 text-base sm:text-lg font-bold font-shippori">
                  ロック解除中...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Step 3: Dashboard
  if (step === 'dashboard' && selectedWedding) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-stone-50 via-champagne-50/30 to-stone-50 p-4 sm:p-6 overflow-y-auto">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 pt-safe-top pt-6 sm:pt-8"
        >
          <h1 className="font-shippori text-stone-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 px-2">
            Welcome to {selectedWedding.groom}・{selectedWedding.bride} 御両家 挙式
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-sans">{VENUE_NAME}</p>
        </motion.header>

        {/* メニューカード */}
        <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* GALLERY カード */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/guest/gallery">
              <div className="group relative h-full bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                {/* 背景画像 */}
                <div className="absolute inset-0">
                  <img
                    src="https://picsum.photos/600/400?random=gallery"
                    alt="Gallery"
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  />
                </div>

                {/* グラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-br from-champagne-100/50 to-coral-100/30" />

                {/* コンテンツ */}
                <div className="relative z-10 p-5 sm:p-6 md:p-8 lg:p-10 h-full flex flex-col">
                  {/* アイコン */}
                  <div className="mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-champagne-400 to-champagne-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl sm:text-3xl">📸</span>
                    </div>
                  </div>

                  {/* タイトルと説明 */}
                  <h3 className="font-shippori text-stone-800 text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                    GALLERY
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 font-sans leading-relaxed flex-grow">
                    当日の思い出写真はこちらから
                  </p>

                  {/* 矢印アイコン */}
                  <div className="flex items-center gap-2 text-champagne-700 group-hover:gap-4 transition-all duration-300">
                    <span className="font-sans font-semibold text-sm sm:text-base">写真を見る</span>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* MESSAGE カード */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/guest/survey">
              <div className="group relative h-full bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                {/* 背景画像 */}
                <div className="absolute inset-0">
                  <img
                    src="https://picsum.photos/600/400?random=message"
                    alt="Message"
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  />
                </div>

                {/* グラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral-100/50 to-champagne-100/30" />

                {/* コンテンツ */}
                <div className="relative z-10 p-5 sm:p-6 md:p-8 lg:p-10 h-full flex flex-col">
                  {/* アイコン */}
                  <div className="mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl sm:text-3xl">✉️</span>
                    </div>
                  </div>

                  {/* タイトルと説明 */}
                  <h3 className="font-shippori text-stone-800 text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                    MESSAGE
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 font-sans leading-relaxed flex-grow">
                    新郎新婦へのメッセージ・アンケート
                  </p>

                  {/* 矢印アイコン */}
                  <div className="flex items-center gap-2 text-coral-700 group-hover:gap-4 transition-all duration-300">
                    <span className="font-sans font-semibold text-sm sm:text-base">メッセージを送る</span>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ログアウトボタン */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 sm:mt-12 pb-safe-bottom pb-6 sm:pb-8"
        >
          <button
            onClick={() => {
              setStep('entrance');
              setSelectedWedding(null);
              setPasscode('');
              setIsUnlocking(false);
              setIsUnlocked(false);
            }}
            className="text-stone-500 text-xs sm:text-sm hover:text-stone-700 transition-colors font-sans py-2 px-4 rounded-lg hover:bg-stone-100 active:bg-stone-200 touch-manipulation"
          >
            &lt; ログアウト
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
