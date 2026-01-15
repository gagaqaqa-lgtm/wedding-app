/**
 * 日付フォーマットユーティリティ
 * 
 * 通知の日時表示を統一するためのユーティリティ関数です。
 * 相対時間（「3分前」など）と絶対時間（「2024/01/15 14:30」）を
 * 適切に使い分けます。
 */

/**
 * 日付文字列を相対時間またはフォーマット済み文字列に変換する
 * 
 * 【表示ルール】
 * - 60分未満: 「X分前」
 * - 24時間未満: 「X時間前」
 * - 7日未満: 「X日前」
 * - 7日以上: 「YYYY/MM/DD HH:mm」形式
 * 
 * @param dateString - ISO 8601形式の日付文字列
 * @returns フォーマット済みの日付文字列
 * 
 * @example
 * ```typescript
 * formatNotificationDate('2024-01-15T10:00:00Z') // 「3時間前」（現在時刻が13:00の場合）
 * formatNotificationDate('2024-01-10T10:00:00Z') // 「2024/01/10 10:00」（7日以上前の場合）
 * ```
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // 負の値（未来の日付）の場合は、絶対時間を返す
  if (diffMs < 0) {
    return formatAbsoluteDateTime(date);
  }
  
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  
  // 60分未満: 「X分前」
  if (diffMins < 60) {
    return `${diffMins}分前`;
  }
  
  // 24時間未満: 「X時間前」
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  
  // 7日未満: 「X日前」
  if (diffDays < 7) {
    return `${diffDays}日前`;
  }
  
  // 7日以上: 絶対時間形式
  return formatAbsoluteDateTime(date);
}

/**
 * 日付を絶対時間形式（YYYY/MM/DD HH:mm）にフォーマットする
 * 
 * @param date - フォーマットする日付オブジェクト
 * @returns フォーマット済みの日付文字列
 * 
 * @example
 * ```typescript
 * formatAbsoluteDateTime(new Date('2024-01-15T14:30:00Z'))
 * // 「2024/01/15 14:30」
 * ```
 */
function formatAbsoluteDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
