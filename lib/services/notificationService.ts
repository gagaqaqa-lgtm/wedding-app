/**
 * 通知サービス（Repository Pattern）
 * 
 * このファイルは、通知データの取得・更新を行うサービス層です。
 * 現在はモックデータを使用していますが、将来的にバックエンドAPIと統合する際は、
 * このファイル内の関数を `fetch('/api/notifications/...')` に置き換えるだけで
 * 本番環境に対応できます。
 * 
 * 【設計意図】
 * - データ取得ロジックをコンポーネントから完全に分離
 * - APIエンドポイントの変更がコンポーネントに影響しない
 * - テスト容易性の向上（モックと実装の切り替えが容易）
 */

import type {
  Notification,
  NotificationListResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
} from '@/lib/types/notifications';
import { INITIAL_NOTIFICATIONS } from '@/lib/data/notifications';

/**
 * 会場IDに基づいて通知一覧を取得する
 * 
 * 【将来の実装例】
 * ```typescript
 * export async function fetchNotificationsByVenueId(
 *   venueId: string
 * ): Promise<NotificationListResponse> {
 *   const response = await fetch(`/api/venues/${venueId}/notifications`, {
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 *   
 *   if (!response.ok) {
 *     throw new Error(`Failed to fetch notifications: ${response.statusText}`);
 *   }
 *   
 *   return response.json();
 * }
 * ```
 * 
 * @param venueId - 会場ID
 * @returns 通知一覧とメタデータを含むレスポンス
 * @throws {Error} データ取得に失敗した場合
 */
export async function fetchNotificationsByVenueId(
  venueId: string
): Promise<NotificationListResponse> {
  // モック実装: 実際のAPI呼び出しをシミュレート
  // 将来的には、この部分を `fetch('/api/...')` に置き換える
  
  // 非同期処理をシミュレート（実際のAPI呼び出しの遅延を再現）
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // モックデータを返す
  // 実際の実装では、venueIdに基づいてフィルタリングする
  const notifications: Notification[] = INITIAL_NOTIFICATIONS;
  // 注意: unreadCountはユーザーIDが必要なため、呼び出し側で計算する
  // 将来的には userId パラメータを受け取るようにする
  const unreadCount = 0; // TODO: ユーザーIDに基づいて計算
  
  return {
    notifications,
    totalCount: notifications.length,
    unreadCount,
  };
}

/**
 * 通知を既読にする
 * 
 * 【将来の実装例】
 * ```typescript
 * export async function markNotificationsAsRead(
 *   request: MarkAsReadRequest
 * ): Promise<MarkAsReadResponse> {
 *   const response = await fetch('/api/notifications/mark-as-read', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(request),
 *   });
 *   
 *   if (!response.ok) {
 *     throw new Error(`Failed to mark as read: ${response.statusText}`);
 *   }
 *   
 *   return response.json();
 * }
 * ```
 * 
 * @param request - 既読にする通知のIDリスト
 * @returns 更新結果と未読件数
 * @throws {Error} 更新に失敗した場合
 */
export async function markNotificationsAsRead(
  request: MarkAsReadRequest
): Promise<MarkAsReadResponse> {
  // モック実装: 実際のAPI呼び出しをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  // 実際の実装では、バックエンドで既読状態を更新し、
  // 更新後の未読件数を返す
  
  return {
    updatedIds: request.notificationIds,
    unreadCount: 0, // モック実装では固定値
  };
}

/**
 * 単一の通知を既読にする（便利関数）
 * 
 * @param notificationId - 既読にする通知のID
 * @returns 更新結果と未読件数
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  return markNotificationsAsRead({ notificationIds: [notificationId] });
}
