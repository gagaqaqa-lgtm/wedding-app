"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, BarChart3, Users, Settings, LogOut, Megaphone } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // ベースパス
  const basePath = `/admin`;

  // スーパー管理者専用メニュー
  const menuItems: MenuItem[] = [
    { label: "ホーム", href: basePath, icon: LayoutDashboard },
    { label: "会場管理", href: `${basePath}/venues`, icon: Building2 },
    { label: "お知らせ", href: `${basePath}/announcements`, icon: Megaphone },
    { label: "広告収益", href: `${basePath}/ads`, icon: BarChart3 },
    { label: "チーム管理", href: `${basePath}/team`, icon: Users },
  ];

  // 設定メニュー（最下部に配置）
  const settingsMenuItem: MenuItem = { label: "設定", href: `${basePath}/settings`, icon: Settings };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* サイドバー */}
      <div className="w-64 bg-indigo-800 shadow-lg flex-shrink-0 flex flex-col">
        {/* ロゴエリア */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-indigo-700">
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
                    : "text-indigo-50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* アクティブ時の左端バー */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300 rounded-r-full" />
                )}
                
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 設定メニューとログアウトボタン（最下部） */}
        <div className="px-4 py-4 border-t border-indigo-700 space-y-2">
          {/* 設定メニュー */}
          <Link
            href={settingsMenuItem.href}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
              pathname === settingsMenuItem.href || pathname?.startsWith(settingsMenuItem.href)
                ? "bg-white/10 text-white font-bold shadow-sm"
                : "text-indigo-50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {pathname === settingsMenuItem.href || pathname?.startsWith(settingsMenuItem.href) ? (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300 rounded-r-full" />
            ) : null}
            <Settings className="w-5 h-5" />
            <span className="flex-1">{settingsMenuItem.label}</span>
          </Link>
          <button
            onClick={() => {
              // TODO: ログアウト処理を実装
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-indigo-50 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1">ログアウト</span>
          </button>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
