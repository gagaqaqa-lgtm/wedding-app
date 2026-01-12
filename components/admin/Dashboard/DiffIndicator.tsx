'use client';

import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import type { DiffItem } from '@/lib/types/admin';
import { formatRelativeTime } from '@/lib/utils/diff';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

interface DiffIndicatorProps {
  lastLoginAt: Date | null;
  diffItems: DiffItem[];
}

export function DiffIndicator({ lastLoginAt, diffItems }: DiffIndicatorProps) {
  const newItemsCount = diffItems.filter(item => item.isNew).length;

  if (!lastLoginAt) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700 font-sans">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">初回ログインです</span>
        </div>
      </div>
    );
  }

  const lastLoginText = formatDistanceToNow(lastLoginAt, { addSuffix: true, locale: ja });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-stone-600" />
          <div className="font-sans">
            <p className="text-sm text-stone-600">
              前回ログイン: <span className="font-medium text-stone-800">{lastLoginText}</span>
            </p>
          </div>
        </div>
        
        {newItemsCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-red-700 font-sans">
              変更: {newItemsCount}件
            </span>
          </motion.div>
        )}
      </div>

      {/* 最近の変更リスト */}
      {diffItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
          <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-sans mb-3">
            最近の変更
          </h4>
          <div className="space-y-2">
            {diffItems.slice(0, 5).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                  item.isNew ? 'bg-red-50 border border-red-100' : 'bg-stone-50'
                }`}
              >
                {item.isNew && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
                    New
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 font-sans">{item.description}</p>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
