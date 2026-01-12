// 通知データの型定義と初期データ
export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  type: 'system' | 'alert' | 'info' | 'success';
  isImportant?: boolean;
}

// ダミーデータ（実際の実装ではAPIから取得）
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'システムメンテナンスのお知らせ',
    content: '2026年1月15日（水）2:00〜4:00の間、システムメンテナンスを実施いたします。この時間帯はサービスをご利用いただけません。ご不便をおかけいたしますが、何卒ご理解とご協力をお願いいたします。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    isRead: false,
    type: 'alert',
    isImportant: true,
  },
  {
    id: '2',
    title: '新機能「席次表自動レイアウト」が追加されました！',
    content: 'プランナーの皆様の声にお応えし、席次表を自動でレイアウトする新機能を追加いたしました。ゲストの関係性や要望を考慮して、最適な配席を提案します。ぜひお試しください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5時間前
    isRead: false,
    type: 'info',
  },
  {
    id: '3',
    title: '[田中・佐藤ご両家] ゲストからアレルギー情報の登録がありました',
    content: 'ゲスト「山田 花子」様からアレルギー情報（ナッツ類、乳製品）の登録がございました。お食事の準備の際はご注意ください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1日前
    isRead: true,
    type: 'info',
  },
  {
    id: '4',
    title: 'パスワード変更完了のお知らせ',
    content: 'パスワードの変更が正常に完了しました。もし心当たりがない場合は、すぐにサポートまでご連絡ください。',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3日前
    isRead: true,
    type: 'success',
  },
];

// 未読件数を取得するヘルパー関数
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.isRead).length;
};
