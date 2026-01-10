'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// 型定義
type Session = {
  weddingId: number;
  familyNames: string;
  tableId: string;
  hall: string;
  time: string;
} | null;

type Step = 'select' | 'pin' | 'main';

// 挙式情報（日本語化）
const WEDDINGS = [
  { id: 1, date: '2024.10.20', name: '田中家・鈴木家 結婚披露宴', time: '11:00', hall: '御披露宴会場 A' },
  { id: 2, date: '2024.11.05', name: '佐藤家・高橋家 ウェディングパーティー', time: '15:30', hall: '御披露宴会場 B' },
];

// パスコードと挙式・テーブルの対応表
const PIN_MAP: Record<string, { weddingId: number; tableId: string; pin: string }> = {
  '1111': { weddingId: 1, tableId: 'A', pin: '1111' }, // 田中家・A卓
  '1112': { weddingId: 1, tableId: 'B', pin: '1112' }, // 田中家・B卓
  '2222': { weddingId: 2, tableId: 'A', pin: '2222' }, // 佐藤家・A卓
  '2223': { weddingId: 2, tableId: 'B', pin: '2223' }, // 佐藤家・B卓
};

// 挙式情報マッピング
const WEDDING_INFO: Record<number, { familyNames: string; hall: string; time: string }> = {
  1: { familyNames: '田中家・鈴木家', hall: '御披露宴会場 A', time: '11:00' },
  2: { familyNames: '佐藤家・高橋家', hall: '御披露宴会場 B', time: '15:30' },
};

const PIN_LENGTH = 4;

export default function TopPage() {
  const [session, setSession] = useState<Session>(null);
  const [step, setStep] = useState<Step>('select');
  const [selectedWeddingId, setSelectedWeddingId] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [shake, setShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 挙式選択ハンドラ
  const handleWeddingSelect = (weddingId: number) => {
    setSelectedWeddingId(weddingId);
    setStep('pin');
    setPin('');
  };

  // 戻るボタン
  const handleBack = () => {
    setStep('select');
    setPin('');
    setSelectedWeddingId(null);
    setShake(false);
    setShowSuccess(false);
  };

  // テンキーボタンのハンドラ
  const handleNumberPress = (num: string) => {
    if (pin.length < PIN_LENGTH && !isAuthenticating && !showSuccess) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isAuthenticating && !showSuccess) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  // 認証関数（選択した挙式に合致するパスコードかチェック）
  const mockAuthenticate = useCallback(async (pinCode: string, weddingId: number): Promise<boolean> => {
    // 認証処理のシミュレーション（300ms）
    await new Promise((resolve) => setTimeout(resolve, 300));
    const pinInfo = PIN_MAP[pinCode];
    return pinInfo !== undefined && pinInfo.weddingId === weddingId;
  }, []);

  // シェイクアニメーション
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 600);
  };

  // 4桁入力時の即座の認証（ボタン操作なし）
  useEffect(() => {
    if (pin.length === PIN_LENGTH && !isAuthenticating && !session && selectedWeddingId && !showSuccess) {
      setIsAuthenticating(true);
      
      // 即座に認証処理を開始
      mockAuthenticate(pin, selectedWeddingId).then((success) => {
        setIsAuthenticating(false);
        
        if (success) {
          const pinInfo = PIN_MAP[pin];
          const weddingInfo = WEDDING_INFO[pinInfo.weddingId];
          
          if (pinInfo && weddingInfo) {
            // 認証成功: 視覚的フィードバックを表示
            console.log('認証成功:', { pin, weddingId: pinInfo.weddingId, tableId: pinInfo.tableId });
            setShowSuccess(true);
            
            // 0.6秒後、自動的にメインコンテンツへ遷移（フェードイン）
            setTimeout(() => {
              setSession({
                weddingId: pinInfo.weddingId,
                familyNames: weddingInfo.familyNames,
                tableId: pinInfo.tableId,
                hall: weddingInfo.hall,
                time: weddingInfo.time,
              });
              setStep('main');
              setShowSuccess(false);
            }, 600);
          } else {
            // データ不整合
            triggerShake();
          }
        } else {
          // 認証失敗
          console.log('認証失敗:', pin);
          triggerShake();
        }
      });
    }
  }, [pin, isAuthenticating, session, selectedWeddingId, showSuccess, mockAuthenticate]);

  const handleLogout = () => {
    setSession(null);
    setStep('select');
    setPin('');
    setSelectedWeddingId(null);
    setIsAuthenticating(false);
    setShowSuccess(false);
  };

  // --- Step 3: メインコンテンツ（ログイン後） ---
  if (session && step === 'main') {
    const getLineUrl = () => {
      const LINE_ID = '@your-line-id'; // TODO: 環境変数から取得
      const message = encodeURIComponent(`テーブル${session.tableId}の写真`);
      return `https://line.me/R/oaMessage/${LINE_ID}/?${message}`;
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="min-h-screen bg-stone-50 p-6"
      >
        {/* ヘッダー */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-xl tracking-widest text-stone-800 border-b-2 border-[#AB9A83] pb-2 inline-block mb-4">
            THE GRAND GARDEN
          </h1>
          <p className="text-stone-500 text-sm mb-2 font-sans">{session.time}〜 {session.hall}</p>
          <h2 className="text-2xl text-stone-800 font-shippori mb-2">
            Welcome! {session.familyNames}
          </h2>
          <p className="text-stone-400 text-xs font-sans">Table {session.tableId} の皆様</p>
        </header>

        <div className="max-w-md mx-auto">
          {/* Primary Action: アルバムボタン（主役・特大ボタン） */}
          <Link 
            href={`/survey?table=${session.tableId}`}
            className="block w-full bg-gradient-to-br from-[#AB9A83] to-[#8B7A6A] border-2 border-[#AB9A83] rounded-2xl p-10 shadow-2xl text-center hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 mb-8 group"
          >
            {/* 大きなアルバムアイコン */}
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-2xl text-white mb-2 font-shippori font-bold">アルバムを見る</h3>
            <p className="text-white/90 text-sm mb-4 font-sans">二人の写真を見る</p>
            <p className="text-white/80 text-xs bg-white/20 py-2 px-4 rounded-lg font-sans inline-block">
              ※閲覧には、当館のサービス向上アンケートへのご回答が必要です
            </p>
          </Link>

          {/* Secondary Action: LINEボタン（脇役・控えめ） */}
          <div className="mt-8 mb-6">
            <a 
              href={getLineUrl()}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                console.log('Line Link for Table:', session.tableId);
              }}
              className="block w-full bg-white border border-stone-300 rounded-xl p-6 text-center hover:border-stone-400 hover:bg-stone-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                {/* モノクロのLINEアイコン */}
                <svg className="w-5 h-5 text-stone-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                </svg>
                <span className="text-stone-700 text-sm font-sans font-medium">LINEで写真を受け取る（任意）</span>
              </div>
              <p className="text-stone-500 text-xs font-sans">プロカメラマン撮影データ</p>
            </a>
          </div>

          {/* ログアウトボタン */}
          <button 
            onClick={handleLogout} 
            className="text-stone-500 text-sm mt-8 block mx-auto hover:text-stone-700 transition-colors font-sans py-2 px-4 rounded-lg hover:bg-stone-100 active:bg-stone-200"
          >
            &lt; ログアウト
          </button>
        </div>
      </motion.div>
    );
  }

  // --- Step 1 & Step 2: 挙式選択とパスコード入力 ---
  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* ヘッダー（固定） */}
      <div className="pt-12 pb-6 px-6 text-center">
        <h1 className="text-xl tracking-widest text-stone-800 border-b-2 border-[#AB9A83] pb-2 inline-block mb-4">
          THE GRAND GARDEN
        </h1>
      </div>

      {/* 画面コンテンツ（横スライドアニメーション） */}
      <div className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {/* Step 1: 挙式選択画面 */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full px-6 pb-8"
            >
              <div className="max-w-md mx-auto">
                <p className="text-stone-600 text-center mb-8 leading-relaxed font-sans text-base">
                  本日はご来館ありがとうございます。<br />
                  ご参列の挙式を選択してください。
                </p>

                <div className="space-y-3">
                  {WEDDINGS.map((wedding) => (
                    <motion.button
                      key={wedding.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWeddingSelect(wedding.id)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-6 shadow-sm text-left hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-xs text-[#AB9A83] font-semibold mb-1 font-sans">{wedding.date}</p>
                      <h3 className="text-lg text-stone-800 font-shippori mb-1">{wedding.name}</h3>
                      <p className="text-sm text-stone-500 font-sans">{wedding.time}〜 {wedding.hall}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: パスコード入力画面 */}
          {step === 'pin' && selectedWeddingId && (
            <motion.div
              key="pin"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full min-h-[calc(100vh-12rem)] flex flex-col"
            >
              {/* 戻るボタン */}
              <div className="px-6 pt-4 pb-2">
                <button
                  onClick={handleBack}
                  className="text-stone-600 text-sm hover:text-stone-700 transition-colors flex items-center gap-2 font-sans py-2 px-3 -mx-3 rounded-lg hover:bg-stone-100 active:bg-stone-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  挙式一覧に戻る
                </button>
              </div>

              {/* 選択した挙式情報 */}
              {(() => {
                const selectedWedding = WEDDINGS.find(w => w.id === selectedWeddingId);
                return selectedWedding ? (
                  <div className="px-6 pb-6 text-center">
                    <p className="text-stone-600 text-sm mb-2 font-sans">
                      {selectedWedding.date} {selectedWedding.name}
                    </p>
                    <p className="text-stone-700 text-base font-sans mb-4">
                      4桁のパスコードを入力してください
                    </p>
                  </div>
                ) : null;
              })()}

              {/* インジケーター部分（中央） */}
              <div className="flex-1 flex items-center justify-center px-6">
                <motion.div
                  animate={shake ? {
                    x: [0, -30, 30, -30, 30, -15, 15, -8, 8, 0],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    ease: [0.36, 0.07, 0.19, 0.97], // iOSライクなイージング
                  }}
                  className="flex gap-4 items-center relative"
                >
                  {Array.from({ length: PIN_LENGTH }).map((_, index) => {
                    const isFilled = index < pin.length;
                    const isSuccess = showSuccess;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={false}
                        animate={{
                          scale: isFilled ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 0.25,
                          ease: 'easeOut',
                        }}
                        className={`w-4 h-4 rounded-full transition-all duration-300 relative ${
                          isSuccess && isFilled
                            ? 'bg-green-500 border-green-500' // 成功時: 緑色
                            : isFilled
                            ? 'bg-stone-800 border-stone-800' // 入力済み: サイトテーマカラー
                            : 'bg-transparent border-2 border-stone-400' // 未入力: 枠線のみ
                        }`}
                      >
                        {/* 成功時の鍵アイコン（オーバーレイ） */}
                        {isSuccess && isFilled && index === PIN_LENGTH - 1 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* テンキーパッド（下部、親指で操作しやすい位置） */}
              <div 
                className="pb-12 px-6 pt-8" 
                style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
              >
                <div className="max-w-xs mx-auto">
                  {/* 数字キー 1-9（3列グリッド） */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <motion.button
                        key={num}
                        whileTap={{ 
                          scale: 0.92,
                          opacity: 0.8,
                        }}
                        onClick={() => handleNumberPress(num.toString())}
                        disabled={isAuthenticating || pin.length >= PIN_LENGTH || showSuccess}
                        className="w-full aspect-square rounded-full bg-stone-50 border-2 border-stone-400 text-3xl text-stone-800 font-normal flex items-center justify-center transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:bg-stone-100 active:scale-[0.92] hover:border-stone-500"
                        style={{ 
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, "Noto Sans JP", sans-serif',
                          fontWeight: 400,
                        }}
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  {/* 下部行: 空、0、削除 */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* 空のスペース */}
                    <div></div>

                    {/* 0キー（最下段中央） */}
                    <motion.button
                      whileTap={{ 
                        scale: 0.92,
                        opacity: 0.8,
                      }}
                      onClick={() => handleNumberPress('0')}
                      disabled={isAuthenticating || pin.length >= PIN_LENGTH || showSuccess}
                      className="w-full aspect-square rounded-full bg-white border-2 border-stone-300 text-3xl text-stone-800 font-light flex items-center justify-center transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:bg-stone-100 active:scale-[0.92] hover:border-stone-400"
                      style={{ 
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
                        fontWeight: 300,
                      }}
                    >
                      0
                    </motion.button>

                    {/* 削除ボタン（右下、テキスト） */}
                    <motion.button
                      whileTap={{ 
                        scale: 0.92,
                        opacity: 0.8,
                      }}
                      onClick={handleDelete}
                      disabled={isAuthenticating || pin.length === 0 || showSuccess}
                      className="w-full aspect-square rounded-full bg-transparent text-stone-600 text-base font-normal flex items-center justify-center transition-all duration-75 disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation active:opacity-100 active:scale-[0.92]"
                      style={{ 
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, "Noto Sans JP", sans-serif',
                        fontWeight: 400,
                      }}
                    >
                      削除
                    </motion.button>
                  </div>
                </div>

                {/* 認証中の表示 */}
                {isAuthenticating && (
                  <div className="mt-6 text-center">
                    <p className="text-stone-600 text-sm font-sans">認証中...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 非表示のinput（OSキーボードを表示させないため） */}
      <input
        type="tel"
        inputMode="numeric"
        value={pin}
        readOnly
        className="absolute opacity-0 pointer-events-none -z-10"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
