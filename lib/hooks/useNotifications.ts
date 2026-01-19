/**
 * 通知管理カスタムフック（ViewModel層）
 * 
 * このフックは、通知一覧の取得・更新・状態管理を担当します。
 * コンポーネント（View層）からロジックを完全に分離し、
 * 「表示」のみに専念できるようにします。
 * 
 * 【設計パターン】
 * - ViewModel: このフックがViewModelの役割を担う
 * - Repository: notificationServiceがRepositoryの役割を担う
 * - View: コンポーネントがViewの役割を担う
 * 
 * 【将来の拡張】
 * - SWRやReact Queryを使用したキャッシュ・再検証
 * - リアルタイム更新（WebSocket）
 * - オプティミスティックUI更新
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Notification } from '@/lib/types/notifications';
import {
  fetchNotificationsByVenueId,
  markNotificationAsRead,
} from '@/lib/services/notificationService';

/**
 * 通知管理フックの戻り値の型定義
 */
export interface UseNotificationsReturn {
  /** 通知一覧 */
  notifications: Notification[];
  
  /** 未読件数 */
  unreadCount: number;
  
  /** ローディング状態 */
  isLoading: boolean;
  
  /** エラー状態 */
  error: Error | null;
  
  /** 通知を既読にする関数 */
  markAsRead: (notificationId: string) => Promise<void>;
  
  /** 通知をクリックしたときのハンドラ */
  handleNotificationClick: (notification: Notification) => void;
  
  /** データを再取得する関数 */
  refetch: () => Promise<void>;
}

/**
 * 通知管理カスタムフック
 * 
 * @param venueId - 会場ID
 * @returns 通知一覧、未読件数、操作関数など
 * 
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   isLoading,
 *   markAsRead,
 *   handleNotificationClick,
 * } = useNotifications(venueId);
 * ```
 */
export function useNotifications(venueId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 通知一覧を取得する
   * 
   * エラーハンドリングを含む、データ取得のロジックを
   * 一箇所に集約しています。
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchNotificationsByVenueId(venueId);
      setNotifications(response.notifications);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('通知の取得に失敗しました');
      setError(error);
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  /**
   * 初回マウント時に通知一覧を取得
   */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * 未読件数を計算（メモ化）
   * 
   * notificationsが変更されたときのみ再計算されます。
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.has(n.id)).length;
  }, [notifications, readIds]);

  /**
   * 通知を既読にする
   * 
   * 【オプティミスティックUI更新】
   * API呼び出し前にUIを更新し、失敗時はロールバックします。
   * これにより、ユーザー体験が向上します。
   * 
   * @param notificationId - 既読にする通知のID
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // オプティミスティック更新: 即座にUIを更新
      setReadIds((prev) => new Set(prev).add(notificationId));

      try {
        // バックエンドに既読状態を送信
        await markNotificationAsRead(notificationId);
      } catch (err) {
        // エラー時はロールバック
        setReadIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });

        const error = err instanceof Error ? err : new Error('既読状態の更新に失敗しました');
        setError(error);
        console.error('Failed to mark notification as read:', error);
      }
    },
    []
  );

  /**
   * 通知をクリックしたときのハンドラ
   * 
   * 未読の通知をクリックした場合、自動的に既読にします。
   * 将来的には、actionUrlがある場合は遷移処理も追加できます。
   * 
   * @param notification - クリックされた通知
   */
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // 未読の場合は既読にする
      if (!readIds.has(notification.id)) {
        markAsRead(notification.id);
      }

      // 将来的に、actionUrlがある場合は遷移処理を追加
      // if (notification.actionUrl) {
      //   router.push(notification.actionUrl);
      // }
    },
    [markAsRead, readIds]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    handleNotificationClick,
    refetch: fetchNotifications,
  };
}
