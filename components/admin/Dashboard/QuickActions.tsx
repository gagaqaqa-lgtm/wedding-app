'use client';

import { motion } from 'framer-motion';
import { Edit, Printer, Lock, Download } from 'lucide-react';
import Link from 'next/link';

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}

function QuickActionButton({ icon: Icon, label, description, href, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full bg-gradient-to-br ${color} text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left group`}
      >
        <div className="flex items-start justify-between mb-3">
          <Icon className="w-6 h-6 opacity-90 group-hover:opacity-100 transition-opacity" />
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-xs opacity-75">→</span>
          </motion.div>
        </div>
        <h3 className="text-lg font-bold mb-1 font-sans">{label}</h3>
        <p className="text-sm opacity-90 font-sans">{description}</p>
      </motion.button>
    </Link>
  );
}

export function QuickActions() {
  const actions: QuickActionProps[] = [
    {
      icon: Edit,
      label: '配席編集',
      description: 'ドラッグ&ドロップで配席を編集',
      href: '/admin/seating',
      color: 'from-[#AB9A83] to-[#8B7A6A]',
    },
    {
      icon: Printer,
      label: '印刷プレビュー',
      description: '席次表・アレルギー一覧を印刷',
      href: '/admin/print',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Lock,
      label: 'データ確定',
      description: '最終確認後にデータをロック',
      href: '/admin/settings/lock',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Download,
      label: 'エクスポート',
      description: 'CSV/Excel形式でデータを出力',
      href: '/admin/export',
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <QuickActionButton {...action} />
        </motion.div>
      ))}
    </div>
  );
}
