/**
 * 通知データの初期データ（モック）
 * 
 * このファイルは、開発・テスト用のモックデータを提供します。
 * 本番環境では、notificationServiceを通じてAPIから取得します。
 */

import type { Notification } from '@/lib/types/notifications';

// 型定義は lib/types/notifications.ts に移動しました
// 後方互換性のため、ここから再エクスポートします
export type { Notification } from '@/lib/types/notifications';

// ダミーデータ（実際の実装ではAPIから取得）
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'システムメンテナンスのお知らせ',
    content: '2026年1月15日（水）2:00〜4:00の間、システムメンテナンスを実施いたします。この時間帯はサービスをご利用いただけません。ご不便をおかけいたしますが、何卒ご理解とご協力をお願いいたします。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    readByUserIds: [], // 誰も既読にしていない
    type: 'alert',
    isImportant: true,
  },
  {
    id: '2',
    title: '新機能「席次表自動レイアウト」が追加されました！',
    content: 'プランナーの皆様の声にお応えし、席次表を自動でレイアウトする新機能を追加いたしました。ゲストの関係性や要望を考慮して、最適な配席を提案します。ぜひお試しください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5時間前
    readByUserIds: [], // 誰も既読にしていない
    type: 'info',
  },
  {
    id: '3',
    title: '[田中・佐藤ご両家] ゲストからアレルギー情報の登録がありました',
    content: 'ゲスト「山田 花子」様からアレルギー情報（ナッツ類、乳製品）の登録がございました。お食事の準備の際はご注意ください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
    readByUserIds: ['planner-01'], // planner-01が既読にしている
    type: 'info',
  },
  {
    id: '4',
    title: 'パスワード変更完了のお知らせ',
    content: 'パスワードの変更が正常に完了しました。もし心当たりがない場合は、すぐにサポートまでご連絡ください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3日前
    readByUserIds: ['planner-01', 'planner-02'], // 複数のプランナーが既読にしている
    type: 'success',
  },
];

// 未読件数を取得するヘルパー関数（特定のユーザーIDに対して）
export const getUnreadCount = (notifications: Notification[], userId: string): number => {
  return notifications.filter(n => !n.readByUserIds.includes(userId)).length;
};
