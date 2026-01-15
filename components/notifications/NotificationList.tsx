/**
 * 通知一覧コンポーネント
 * 
 * 通知のリストを表示するコンポーネントです。
 * ローディング状態、エラー状態、空状態を適切に処理します。
 */

import React from 'react';
import type { Notification } from '@/lib/types/notifications';
import { NotificationCard } from './NotificationCard';
import { NotificationEmptyState } from './EmptyState';

/**
 * 通知一覧のプロパティ
 */
export interface NotificationListProps {
  /** 表示する通知一覧 */
  notifications: Notification[];
  
  /** 通知クリック時のハンドラ */
  onNotificationClick: (notification: Notification) => void;
  
  /** 現在のユーザーが既読にしているかどうかを判定する関数 */
  isReadByCurrentUser: (notificationId: string) => boolean;
  
  /** ローディング状態 */
  isLoading?: boolean;
  
  /** エラー状態 */
  error?: Error | null;
}

/**
 * 通知一覧コンポーネント
 * 
 * 通知のリストを表示し、各種状態（ローディング、エラー、空）を
 * 適切に処理します。
 * 
 * @param props - 通知データと状態
 */
export function NotificationList({
  notifications,
  onNotificationClick,
  isReadByCurrentUser,
  isLoading = false,
  error = null,
}: NotificationListProps) {
  // ローディング状態
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 mt-4">読み込み中...</p>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-16 text-center">
        <p className="text-red-600 text-lg mb-2">エラーが発生しました</p>
        <p className="text-sm text-gray-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // 空状態
  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  // 通知一覧
  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
          isRead={isReadByCurrentUser(notification.id)}
        />
      ))}
    </div>
  );
}
