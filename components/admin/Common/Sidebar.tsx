'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Grid3x3, 
  AlertTriangle, 
  Settings,
  Lock,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'ダッシュボード', path: '/admin' },
  { icon: Users, label: 'ゲスト管理', path: '/admin/guests' },
  { icon: Grid3x3, label: '配席管理', path: '/admin/seating' },
  { icon: AlertTriangle, label: 'アレルギー管理', path: '/admin/allergies' },
  { icon: Printer, label: '印刷プレビュー', path: '/admin/print' },
  { icon: Lock, label: 'データ確定', path: '/admin/settings/lock' },
  { icon: Settings, label: '設定', path: '/admin/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-stone-200 shadow-sm z-40">
      <div className="flex flex-col h-full">
        {/* ロゴ */}
        <div className="p-6 border-b border-stone-200">
          <h1 className="text-xl tracking-widest text-stone-800 border-b-2 border-[#AB9A83] pb-2 inline-block font-shippori">
            THE GRAND GARDEN
          </h1>
          <p className="text-xs text-stone-500 mt-2 font-sans">管理画面</p>
        </div>

        {/* メニュー */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans ${
                  isActive
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-stone-100 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#AB9A83]' : ''}`} />
                <span className="relative z-10 text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* フッター */}
        <div className="p-4 border-t border-stone-200">
          <p className="text-xs text-stone-400 text-center font-sans">
            Planner Dashboard v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
