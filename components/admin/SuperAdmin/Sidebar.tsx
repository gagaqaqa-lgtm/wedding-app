'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  Settings,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'ダッシュボード', path: '/admin' },
  { icon: Building2, label: '式場管理', path: '/admin/venues' },
  { icon: BarChart3, label: '統計レポート', path: '/admin/analytics' },
  { icon: Users, label: 'ユーザー管理', path: '/admin/users' },
  { icon: Settings, label: 'プラットフォーム設定', path: '/admin/settings' },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      <div className="flex flex-col h-full">
        {/* ロゴ */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-1 font-sans">
            Platform Admin
          </h1>
          <p className="text-xs text-gray-500 font-sans">Super Admin</p>
        </div>

        {/* メニュー */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-50 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="relative z-10 text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center font-sans">
            Platform Admin v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
