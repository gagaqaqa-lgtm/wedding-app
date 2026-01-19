/**
 * Venue型定義
 * 
 * 将来のRDB設計を見越した会場情報の型定義
 * 管理者情報は正規化の準備として admin オブジェクトにネスト
 */

/**
 * 契約プラン
 */
export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';

/**
 * 会場ステータス
 */
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

/**
 * 会場管理者情報
 * 
 * 将来のRDB設計では、別テーブル（users または admins）に正規化される予定
 */
export interface VenueAdmin {
  /** 管理者名 */
  name: string;
  
  /** 管理者メールアドレス（ログインIDとしても使用） */
  email: string;
}

/**
 * 会場情報
 * 
 * 結婚式場の基本情報と契約情報
 * 
 * 【RDB設計の想定】
 * - venues テーブル: id, name, code, plan, status, coverImageUrl, enableLineUnlock, ...
 * - venue_admins テーブル（将来）: venueId (FK), name, email, ...
 * 
 * 現時点では admin をフラットに持つが、将来的には外部キーで参照する
 */
export interface Venue {
  /** 会場ID（主キー） */
  id: string;
  
  /** 会場名 */
  name: string;
  
  /** 会場コード（URLに使用される識別子、ユニーク制約） */
  code: string;
  
  /** 契約プラン */
  plan: VenuePlan;
  
  /** 会場ステータス */
  status: VenueStatus;
  
  /** 管理者情報（ネストされたオブジェクト） */
  admin: VenueAdmin;
  
  /** 最終アクティブ日時（ISO 8601形式） */
  lastActiveAt: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
  
  /** 会場カバー画像URL（ゲスト入口画面の背景に使われる） */
  coverImageUrl?: string;
  
  /** LINE連携による投稿制限解除機能の有効/無効 */
  enableLineUnlock?: boolean;
  
  /** Google MapsレビューURL（オプション） */
  googleMapsReviewUrl?: string;
  
  /** LINE公式アカウントURL（オプション） */
  lineOfficialAccountUrl?: string;
  
  /** 表示会場名（オプション、UI表示用） */
  displayVenueName?: string;
  
  /** 口コミ収集設定（新郎新婦向け、オプション） */
  coupleReviewUrl?: string;
  coupleReviewThreshold?: number;
  
  /** 口コミ収集設定（ゲスト向け、オプション） */
  guestReviewUrl?: string;
  guestReviewThreshold?: number;
}
