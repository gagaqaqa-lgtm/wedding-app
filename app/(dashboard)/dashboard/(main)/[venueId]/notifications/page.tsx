/**
 * 通知管理ページ
 * 
 * 会場管理者向けの通知一覧・管理ページです。
 * 
 * 【アーキテクチャ】
 * - View層: このコンポーネント（表示のみに専念）
 * - ViewModel層: useNotificationsフック（ロジック管理）
 * - Repository層: notificationService（データ取得・更新）
 * 
 * 【設計意図】
 * このコンポーネントは「表示」のみを担当し、すべてのロジックは
 * カスタムフック（useNotifications）に委譲しています。
 * これにより、テスト容易性と保守性が向上します。
 */

'use client';

import React, { use } from 'react';
import { getVenueInfo } from '@/lib/constants/venues';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationList } from '@/components/notifications/NotificationList';
import type { Notification } from '@/lib/types/notifications';

/**
 * ページのプロパティ
 */
interface VenueNotificationsPageProps {
  params: Promise<{ venueId: string }>;
}

/**
 * 会場通知管理ページ
 * 
 * 会場IDに基づいて通知一覧を表示し、既読管理を行います。
 * 
 * @param props - ルートパラメータ
 */
export default function VenueNotificationsPage({ params }: VenueNotificationsPageProps) {
  const { venueId } = use(params);
  const venueInfo = getVenueInfo(venueId);

  // Contextから通知データとアクションを取得
  const { notifications, unreadCount, markAsRead, isReadByCurrentUser } = useNotification();

  // 通知をクリック（既読にする）
  const handleNotificationClick = (notification: Notification) => {
    if (!isReadByCurrentUser(notification.id)) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* ページヘッダー */}
          <NotificationHeader
            venueName={venueInfo.name}
            venueId={venueId}
            unreadCount={unreadCount}
          />

          {/* コンテンツエリア */}
          <div className="p-8">
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              isReadByCurrentUser={isReadByCurrentUser}
              isLoading={false}
              error={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
