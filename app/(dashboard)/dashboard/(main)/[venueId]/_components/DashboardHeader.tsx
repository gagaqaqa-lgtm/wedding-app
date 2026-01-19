'use client';

import { useSearchParams } from 'next/navigation';
import { Building2, ShieldAlert, User } from 'lucide-react';

interface DashboardHeaderProps {
  venueId: string;
  venueName: string;
}

/**
 * ダッシュボードヘッダーコンポーネント
 * 会場名とアカウント情報を表示し、サポートモード時に表示を切り替える
 * 業務システムらしい硬派なデザインで、絵文字は一切使用しない
 */
export function DashboardHeader({ venueId, venueName }: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const isSupport = searchParams?.get('mode') === 'support';

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-stone-200 shadow-sm flex-shrink-0 flex items-center justify-between px-6 relative">
      {/* 左側: 会場名表示 */}
      <div className="flex items-center gap-3">
        <Building2 className="w-5 h-5 text-stone-600" />
        <div className="h-6 w-px bg-stone-300" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-stone-900 leading-tight">
            {venueName && venueName.trim() ? venueName : `Venue ${venueId}`}
          </span>
          <span className="text-[10px] text-stone-500 font-mono leading-tight mt-0.5">
            ID: {venueId}
          </span>
        </div>
      </div>

      {/* 右側: アカウント情報バッジ */}
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded border transition-colors ${
        isSupport 
          ? 'bg-amber-50 border-amber-300' 
          : 'bg-stone-50 border-stone-200'
      }`}>
        {isSupport ? (
          <ShieldAlert className={`w-4 h-4 ${
            isSupport ? 'text-amber-700' : 'text-stone-600'
          }`} />
        ) : (
          <User className={`w-4 h-4 ${
            isSupport ? 'text-amber-700' : 'text-stone-600'
          }`} />
        )}
        <span className={`text-xs font-semibold tracking-wider uppercase ${
          isSupport ? 'text-amber-900' : 'text-stone-700'
        }`}>
          {isSupport ? 'SUPPORT ADMIN' : 'PLANNER ACCOUNT'}
        </span>
      </div>
    </header>
  );
}
