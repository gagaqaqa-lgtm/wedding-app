'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Lock, ArrowRight, LogIn } from 'lucide-react';
import { toast } from 'sonner';

// 簡易認証情報（会場IDとパスワード）
const VENUE_CREDENTIALS: Record<string, { password: string; name: string }> = {
  'venue-001': {
    password: 'venue001',
    name: '表参道テラス',
  },
  'venue-002': {
    password: 'venue002',
    name: '代々木ガーデン',
  },
  'venue-003': {
    password: 'venue003',
    name: '青山ホール',
  },
};

export default function VenueLoginPage() {
  const router = useRouter();
  const [venueId, setVenueId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 簡易認証ロジック
    const venue = VENUE_CREDENTIALS[venueId];
    
    if (venue && password === venue.password) {
      // 成功時の処理
      toast.success('ログイン成功', {
        description: `${venue.name} のダッシュボードへ遷移します`,
        duration: 2000,
      });

      // 少し遅延を入れてから遷移（トーストを見せるため）
      setTimeout(() => {
        router.push(`/dashboard/${venueId}`);
      }, 500);
    } else {
      // 失敗時の処理
      setError('会場IDまたはパスワードが違います');
      toast.error('ログイン失敗', {
        description: '会場IDまたはパスワードが違います',
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      {/* 背景装飾: 淡いパーティクル風の光のボケ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 大きな光のボケ（左上） */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
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
        {/* 小さな光のボケ（右下） */}
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-slate-200/15 rounded-full blur-3xl"
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
        {/* 中央の小さな光 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20">
        {/* タイトルセクション */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-shippori font-bold text-stone-800 mb-2 sm:mb-3">
            Ppat Guest Link
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-sans">
            会場担当者ログイン
          </p>
        </motion.div>

        {/* ログインフォーム */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="bg-white/60 backdrop-blur-xl border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 会場ID入力 */}
              <div>
                <label htmlFor="venueId" className="block text-sm font-medium text-stone-700 mb-2 font-sans">
                  会場ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="venueId"
                    type="text"
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-xl bg-white/80 backdrop-blur-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200 font-sans"
                    placeholder="会場IDを入力（例: venue-001）"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* パスワード入力 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2 font-sans">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-xl bg-white/80 backdrop-blur-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200 font-sans"
                    placeholder="パスワードを入力"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-sans"
                >
                  {error}
                </motion.div>
              )}

              {/* ログインボタン */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>ログイン中...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>ログイン</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* デモ用の会場ID一覧（開発時のみ） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-blue-700 font-sans"
          >
            <p className="font-semibold mb-2">デモ用会場ID:</p>
            <ul className="space-y-1">
              {Object.entries(VENUE_CREDENTIALS).map(([id, venue]) => (
                <li key={id}>
                  ID: <code className="bg-white/80 px-1 rounded">{id}</code> / PASS: <code className="bg-white/80 px-1 rounded">{venue.password}</code> ({venue.name})
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 管理者ログインへのリンク */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 transition-colors duration-200 font-sans group"
            >
              <span>管理者ログインはこちら</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* フッター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <p className="text-xs sm:text-sm text-stone-500 font-sans">
            ご利用の際は、各画面の案内に従ってください
          </p>
        </motion.div>
      </div>
    </div>
  );
}
