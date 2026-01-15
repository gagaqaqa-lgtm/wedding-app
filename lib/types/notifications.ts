/**
 * 通知システムの型定義
 * 
 * このファイルは、通知機能全体で使用される型定義を集約しています。
 * バックエンドAPIのレスポンス型と完全に一致させることで、
 * 型安全性を保証します。
 */

/**
 * 通知の種類
 * - system: システムからの通知（メンテナンス、アップデートなど）
 * - alert: 警告（重要な注意事項）
 * - info: 情報（一般的なお知らせ）
 * - success: 成功（操作完了の確認など）
 */
export type NotificationType = 'system' | 'alert' | 'info' | 'success';

/**
 * 通知の重要度
 * - normal: 通常の通知
 * - important: 重要な通知（未読時にバッジ表示）
 */
export type NotificationPriority = 'normal' | 'important';

/**
 * 通知エンティティ
 * 
 * バックエンドAPIから取得される通知データの構造を定義します。
 * 将来的にAPIレスポンスと完全に一致させる必要があります。
 */
export interface Notification {
  /** 通知の一意な識別子 */
  id: string;
  
  /** 通知のタイトル */
  title: string;
  
  /** 通知の本文 */
  content: string;
  
  /** 通知の発行日時（ISO 8601形式） */
  date: string;
  
  /** 既読にしたユーザーIDの配列 */
  readByUserIds: string[];
  
  /** 通知の種類 */
  type: NotificationType;
  
  /** 重要通知かどうか（非推奨: 将来的に `priority` に置き換え予定） */
  isImportant?: boolean;
  
  /** 通知の優先度（将来の拡張用） */
  priority?: NotificationPriority;
  
  /** 関連するリソースID（例: 挙式ID、ゲストIDなど） */
  relatedResourceId?: string;
  
  /** アクションURL（通知クリック時の遷移先） */
  actionUrl?: string;
}

/**
 * 通知一覧取得APIのレスポンス型
 * 
 * 将来的にバックエンドAPIと統合する際に使用します。
 */
export interface NotificationListResponse {
  /** 通知一覧 */
  notifications: Notification[];
  
  /** 総件数 */
  totalCount: number;
  
  /** 未読件数 */
  unreadCount: number;
  
  /** ページネーション情報（将来の拡張用） */
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
  };
}

/**
 * 通知を既読にするAPIのリクエスト型
 */
export interface MarkAsReadRequest {
  /** 既読にする通知のID（配列で複数指定可能） */
  notificationIds: string[];
}

/**
 * 通知を既読にするAPIのレスポンス型
 */
export interface MarkAsReadResponse {
  /** 更新された通知のID */
  updatedIds: string[];
  
  /** 更新後の未読件数 */
  unreadCount: number;
}

/**
 * 通知スタイルの設定
 * 
 * UI表示に必要なスタイル情報を型安全に管理します。
 */
export interface NotificationStyle {
  /** アイコンコンポーネント */
  icon: React.ComponentType<{ className?: string }>;
  
  /** アイコンの背景色クラス */
  iconBg: string;
  
  /** アイコンの色クラス */
  iconColor: string;
  
  /** 左側のアクセントボーダーの色クラス */
  accentColor: string;
  
  /** バッジの色クラス */
  badgeColor: string;
}
