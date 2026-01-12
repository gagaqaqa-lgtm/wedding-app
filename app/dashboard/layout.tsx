"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { INITIAL_NOTIFICATIONS, getUnreadCount } from "@/lib/data/notifications";

// アイコン (インラインSVG)
const Icons = {
  Home: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Bell: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Calendar: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Building: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><path d="M3 12h18"/></svg>,
  UserGroup: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Settings: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: number;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // パスから venueId を抽出（/dashboard/[venueId]/... の形式）
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const venueIdIndex = pathSegments.indexOf('dashboard');
  const venueId = venueIdIndex !== -1 && pathSegments[venueIdIndex + 1] ? pathSegments[venueIdIndex + 1] : null;
  
  // 未読件数を取得（実際の実装ではAPIから取得）
  const unreadCount = getUnreadCount(INITIAL_NOTIFICATIONS);

  // ベースパスを決定（venueIdがある場合は動的ルート、ない場合は従来のルート）
  const basePath = venueId ? `/dashboard/${venueId}` : '/dashboard';

  // プランナーの動線を最優先にしたメニュー順序
  const menuItems: MenuItem[] = [
    { label: "ホーム", href: basePath, icon: Icons.Home },
    { label: "お知らせ", href: `${basePath}/notifications`, icon: Icons.Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: "挙式管理", href: `${basePath}/weddings`, icon: Icons.Calendar },
    { label: "会場設定", href: `${basePath}/venues`, icon: Icons.Building },
    { label: "アカウント一覧", href: `${basePath}/accounts`, icon: Icons.UserGroup },
    { label: "設定", href: `${basePath}/settings`, icon: Icons.Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* サイドバー */}
      <div className="w-64 bg-emerald-800 shadow-lg flex-shrink-0 flex flex-col">
        {/* ロゴエリア */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-emerald-700">
          <span className="text-2xl font-extrabold text-white tracking-wider">
            Guest Link
          </span>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== basePath && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-white/10 text-white font-bold shadow-sm"
                    : "text-emerald-50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* アクティブ時の左端バー */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-300 rounded-r-full" />
                )}
                
                <Icon />
                <span className="flex-1">{item.label}</span>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
