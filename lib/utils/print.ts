// 印刷ユーティリティ

/**
 * 印刷用CSSスタイルを適用するクラス名
 */
export const printStyles = {
  container: 'print-container',
  noPrint: 'no-print',
  pageBreak: 'page-break',
};

/**
 * 印刷用の日時フォーマット
 */
export function formatDateForPrint(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/**
 * 印刷用の時刻フォーマット
 */
export function formatTimeForPrint(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
