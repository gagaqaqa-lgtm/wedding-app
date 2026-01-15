/**
 * 通知スタイルユーティリティ
 * 
 * 通知の種類（type）と既読状態に基づいて、
 * UI表示に必要なスタイル情報を返すユーティリティ関数です。
 * 
 * 【設計意図】
 * - スタイルロジックをコンポーネントから分離
 * - デザインシステムの変更が一箇所で完結
 * - 型安全性の確保
 */

import React from 'react';
import type { NotificationType, NotificationStyle } from '@/lib/types/notifications';

/**
 * 通知タイプに応じたアイコンコンポーネント
 * 
 * 将来的に lucide-react などのアイコンライブラリに
 * 置き換えることを想定しています。
 */
const Icons = {
  Alert: ({ className }: { className?: string }) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Info: ({ className }: { className?: string }) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  System: ({ className }: { className?: string }) => (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

/**
 * 通知の種類と既読状態に基づいてスタイル情報を取得する
 * 
 * 【スタイルルール】
 * - 未読: 濃い色（白文字）、左側にアクセントボーダー、背景色あり
 * - 既読: 薄い色（グレー文字）、通常のボーダー、背景色なし
 * 
 * @param type - 通知の種類
 * @param isRead - 既読状態
 * @returns スタイル情報（アイコン、色クラスなど）
 */
export function getNotificationStyle(
  type: NotificationType,
  isRead: boolean
): NotificationStyle {
  const baseIconColor = isRead ? 'text-gray-400' : 'text-white';

  switch (type) {
    case 'alert':
      return {
        icon: Icons.Alert,
        iconBg: isRead ? 'bg-orange-100' : 'bg-orange-500',
        iconColor: isRead ? 'text-orange-600' : baseIconColor,
        accentColor: 'border-l-orange-500',
        badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      };

    case 'info':
      return {
        icon: Icons.Info,
        iconBg: isRead ? 'bg-blue-100' : 'bg-blue-500',
        iconColor: isRead ? 'text-blue-600' : baseIconColor,
        accentColor: 'border-l-blue-500',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      };

    case 'success':
      return {
        icon: Icons.Check,
        iconBg: isRead ? 'bg-green-100' : 'bg-green-500',
        iconColor: isRead ? 'text-green-600' : baseIconColor,
        accentColor: 'border-l-green-500',
        badgeColor: 'bg-green-100 text-green-700 border-green-200',
      };

    case 'system':
      return {
        icon: Icons.System,
        iconBg: isRead ? 'bg-gray-100' : 'bg-gray-600',
        iconColor: isRead ? 'text-gray-600' : baseIconColor,
        accentColor: 'border-l-gray-500',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      };

    default:
      // 型安全性のため、未定義のtypeが来た場合のフォールバック
      return {
        icon: Icons.Info,
        iconBg: isRead ? 'bg-gray-100' : 'bg-gray-500',
        iconColor: isRead ? 'text-gray-600' : baseIconColor,
        accentColor: 'border-l-gray-500',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      };
  }
}
