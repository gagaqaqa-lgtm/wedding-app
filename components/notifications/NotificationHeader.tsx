/**
 * 通知ページヘッダーコンポーネント
 * 
 * ページタイトル、会場情報、未読件数を表示するヘッダーコンポーネントです。
 * 責務を明確に分離し、再利用可能な設計にしています。
 */

import React from 'react';
import { Bell } from 'lucide-react';

/**
 * 通知ヘッダーのプロパティ
 */
export interface NotificationHeaderProps {
  /** 会場名 */
  venueName: string;
  
  /** 会場ID */
  venueId: string;
  
  /** 未読件数 */
  unreadCount: number;
}

/**
 * 通知ページヘッダーコンポーネント
 * 
 * @param props - ヘッダーに表示する情報
 */
export function NotificationHeader({
  venueName,
  venueId,
  unreadCount,
}: NotificationHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-5 mb-8">
      <div className="flex items-center gap-4">
        {/* アイコン */}
        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
          <Bell className="w-6 h-6" />
        </div>

        {/* タイトルと会場情報 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">お知らせ</h1>
          <p className="text-sm text-gray-600 mt-1">
            会場: {venueName} ({venueId})
          </p>
        </div>

        {/* 未読件数バッジ */}
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            {unreadCount}件の未読
          </span>
        )}
      </div>
    </div>
  );
}
