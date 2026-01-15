'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

// アイコン (インラインSVG)
const Icons = {
  Home: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  LayoutGrid: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Images: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <circle cx="7" cy="7" r="1"/>
      <circle cx="17" cy="7" r="1"/>
      <path d="M2 16l4-4h3l2 2h4l4-4"/>
      <path d="M14 16l-2 2"/>
    </svg>
  ),
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'ホーム', href: '/couple', icon: Icons.Home },
  { label: '卓設定', href: '/couple/tables', icon: Icons.LayoutGrid },
  { label: 'みんなの写真', href: '/couple/gallery', icon: Icons.Images },
];

// 挙式日のモックデータ（実際のアプリではAPIから取得）
const MOCK_WEDDING_DATE = new Date('2026-03-15');

// 式場のカバー写真（実際のアプリではAPIから取得）
const MOCK_WEDDING = {
  venueCoverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
};

// カウントダウン計算
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 日付フォーマット
function formatWeddingDate(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

// ヒーローエリアコンポーネント
function HeroCountdown() {
  const [daysUntil, setDaysUntil] = useState(calculateDaysUntil(MOCK_WEDDING_DATE));
  const isWeddingDayOrAfter = daysUntil === 0 || daysUntil < 0;

  useEffect(() => {
    // 日付の更新（1時間ごと）
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil(MOCK_WEDDING_DATE));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden min-h-[280px] md:min-h-[400px]"
    >
      {/* 背景画像: 式場のカバー写真 */}
      <div className="absolute inset-0">
        <img
          src={MOCK_WEDDING.venueCoverImage}
          alt="式場のカバー写真"
          className="w-full h-full object-cover"
        />
        {/* 視認性確保のためのオーバーレイ */}
        {/* 全体をほんのり暗く */}
        <div className="absolute inset-0 bg-black/20" />
        {/* 下からグラデーション（文字の背景を自然に暗く） */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-4 md:py-8">
        <div className="text-center text-white drop-shadow-lg">
          {!isWeddingDayOrAfter ? (
            <>
              <p className="text-xs md:text-sm text-white mb-1.5 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {formatWeddingDate(MOCK_WEDDING_DATE)}
              </p>
              <p className="text-sm md:text-base text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">The Big Day</p>
              <div className="flex items-baseline justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                <span className="text-3xl md:text-4xl font-bold leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  あと
                </span>
                <motion.span
                  key={daysUntil}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl md:text-6xl font-bold leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                >
                  {daysUntil}
                </motion.span>
                <span className="text-xl md:text-2xl font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">日</span>
              </div>
              <p className="text-xs md:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ゲストをおもてなしする準備を進めましょう
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-1.5 md:mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                Happy Wedding!
              </h1>
              <p className="text-base md:text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ご結婚おめでとうございます！
              </p>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-gray-50 pb-20 md:pb-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif' }}>
      {/* ヒーローエリア（カウントダウン） */}
      <HeroCountdown />

      {/* メインコンテンツ */}
      <main className="min-h-dvh">
        {children}
      </main>

      {/* フッターナビゲーション（モバイル専用） */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 active:scale-95",
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "text-emerald-600")} />
                <span className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-emerald-600" : "text-gray-500"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}