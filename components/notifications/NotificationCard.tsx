/**
 * 通知カードコンポーネント
 * 
 * 個別の通知を表示するカードコンポーネントです。
 * 通知の種類、既読状態に応じて適切なスタイルを適用します。
 */

import React from 'react';
import type { Notification } from '@/lib/types/notifications';
import { getNotificationStyle } from '@/lib/utils/notificationStyle';
import { formatNotificationDate } from '@/lib/utils/dateFormatter';

/**
 * 通知カードのプロパティ
 */
export interface NotificationCardProps {
  /** 表示する通知 */
  notification: Notification;
  
  /** 通知クリック時のハンドラ */
  onClick: (notification: Notification) => void;
  
  /** 現在のユーザーが既読にしているかどうか */
  isRead: boolean;
}

/**
 * 通知カードコンポーネント
 * 
 * 通知の種類（alert, info, success, system）と既読状態に応じて、
 * 適切なアイコン、色、レイアウトを表示します。
 * 
 * @param props - 通知データとイベントハンドラ
 */
export function NotificationCard({ notification, onClick, isRead }: NotificationCardProps) {
  const style = getNotificationStyle(notification.type, isRead);
  const Icon = style.icon;
  const formattedDate = formatNotificationDate(notification.date);

  return (
    <div
      onClick={() => onClick(notification)}
      className={`
        bg-white rounded-xl border shadow-sm
        cursor-pointer transition-all duration-200
        ${
          !isRead
            ? `${style.accentColor} border-l-4 hover:shadow-md bg-blue-50/30`
            : 'hover:shadow-md hover:border-gray-300 border-gray-200'
        }
      `}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* アイコン */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center ${style.iconColor}`}
          >
            <Icon />
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                {/* バッジ（重要・未読） */}
                <div className="flex items-center gap-2 mb-1">
                  {notification.isImportant && !isRead && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                      重要
                    </span>
                  )}
                  {!isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                      未読
                    </span>
                  )}
                </div>

                {/* タイトル */}
                <h3
                  className={`text-base leading-relaxed ${
                    !isRead
                      ? 'font-bold text-gray-900'
                      : 'font-medium text-gray-700'
                  }`}
                >
                  {notification.title}
                </h3>
              </div>

              {/* 日時 */}
              <span className="flex-shrink-0 text-xs text-gray-500 font-medium whitespace-nowrap">
                {formattedDate}
              </span>
            </div>

            {/* 本文 */}
            <p
              className={`text-sm leading-relaxed ${
                isRead ? 'text-gray-600' : 'text-gray-700'
              }`}
            >
              {notification.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
