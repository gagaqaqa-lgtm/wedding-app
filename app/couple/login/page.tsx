'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

// 開発用パスワード（IDが1の場合）
const DEV_PASSWORD = '1234';

function CoupleLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [weddingId, setWeddingId] = useState(id || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // 開発用: IDが1の場合、パスワードは1234
    if (id === '1' && password === DEV_PASSWORD) {
      // ログイン成功
      setTimeout(() => {
        setIsLoading(false);
        router.push('/couple/dashboard');
      }, 500);
    } else if (id === '1') {
      // パスワードが間違っている場合
      setTimeout(() => {
        setIsLoading(false);
        setError('パスワードが正しくありません。開発用パスワード: 1234');
      }, 500);
    } else {
      // IDが1以外の場合（将来的に拡張可能）
      setTimeout(() => {
        setIsLoading(false);
        setError('このIDは現在サポートされていません');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景画像（ぼかし） */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      </div>

      {/* コンテンツ */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        {/* 半透明の白いカード */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10">
          {/* ロゴ */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Paple'a
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              結婚式準備を、もっと楽しむ
            </p>
          </div>

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID（挙式コード） */}
            <div>
              <label htmlFor="weddingId" className="block text-sm font-semibold text-gray-700 mb-2">
                ID（または挙式コード）
              </label>
              <input
                id="weddingId"
                type="text"
                value={weddingId}
                onChange={(e) => setWeddingId(e.target.value)}
                placeholder="例: WEDDING-2024-001"
                className={cn(
                  "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900 placeholder:text-gray-400"
                )}
                required
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={id === '1' ? '開発用パスワード: 1234' : 'パスワードを入力'}
                className={cn(
                  "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  error ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-emerald-500",
                  "text-gray-900 placeholder:text-gray-400"
                )}
                required
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white text-base",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "active:scale-95 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  ログイン中...
                </span>
              ) : (
                'Start Wedding Prep'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CoupleLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <CoupleLoginContent />
    </Suspense>
  );
}