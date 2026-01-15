'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'ホーム', path: '/admin' },
  { icon: Building2, label: '会場管理', path: '/admin/venues' },
  { icon: Megaphone, label: 'お知らせ', path: '/admin/announcements' },
  { icon: BarChart3, label: '広告収益', path: '/admin/ads' },
  { icon: Users, label: 'チーム管理', path: '/admin/team' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-indigo-800 shadow-lg flex-shrink-0 flex flex-col">
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
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              href={item.path}
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
              <span className="flex-1 text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 設定メニューとログアウトボタン（最下部） */}
      <div className="px-4 py-4 border-t border-indigo-700 space-y-2">
        {/* 設定メニュー */}
        <Link
          href="/admin/settings"
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
            pathname === '/admin/settings' || pathname?.startsWith('/admin/settings')
              ? "bg-white/10 text-white font-bold shadow-sm"
              : "text-indigo-50 hover:bg-white/10 hover:text-white"
          }`}
        >
          {pathname === '/admin/settings' || pathname?.startsWith('/admin/settings') ? (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300 rounded-r-full" />
          ) : null}
          <Settings className="w-5 h-5" />
          <span className="flex-1 text-sm">設定</span>
        </Link>

        {/* ログアウトボタン */}
        <button
          onClick={() => {
            // TODO: ログアウト処理を実装
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-indigo-50 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-sm">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
