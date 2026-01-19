/**
 * 共通型定義ファイル (Schema)
 * 
 * このファイルは、アプリケーション全体で使用されるデータモデルの型定義を集約しています。
 * 将来のバックエンド連携を見据え、データベース設計図（ER図）の基礎となる構造を定義します。
 * 
 * 【設計原則】
 * - 各モデル間の関係（Relation）を外部キー（weddingId, tableId など）で明示
 * - 将来のデータベーススキーマとの整合性を考慮
 * - 既存のUI実装から逆算して必要なフィールドを定義
 */

// ============================================================================
// ユーザー関連
// ============================================================================

/**
 * ユーザーロール
 */
export type UserRole = 
  | 'SUPER_ADMIN'      // スーパーアドミン
  | 'VENUE_ADMIN'      // 会場管理者
  | 'PLANNER'          // プランナー
  | 'COUPLE'           // 新郎新婦
  | 'GUEST';           // ゲスト

/**
 * ユーザー基本情報
 * 
 * すべてのユーザータイプの基底となる型
 */
export interface User {
  /** ユーザーID */
  id: string;
  
  /** 名前 */
  name: string;
  
  /** メールアドレス */
  email: string;
  
  /** ユーザーロール */
  role: UserRole;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
  
  /** アバター画像URL（オプション） */
  avatarUrl?: string;
}

/**
 * ゲスト情報
 * 
 * 挙式に参加するゲストの情報
 * 
 * 【リレーション】
 * - weddingId: Wedding に紐づく
 * - tableId: Table に紐づく（配席確定前は null）
 */
export type GuestStatus = 'pending' | 'confirmed' | 'locked';
export type SurveyStatus = 'not_answered' | 'answered' | 'approved';
export type AllergyStatus = 'none' | 'reported' | 'confirmed';

export interface Guest extends User {
  role: 'GUEST';
  
  /** 挙式ID（外部キー） */
  weddingId: string;
  
  /** 卓ID（外部キー、配席確定前は null） */
  tableId: string | null;
  
  /** ゲストステータス */
  status: GuestStatus;
  
  /** アンケート回答ステータス */
  surveyStatus: SurveyStatus;
  
  /** アレルギー情報ステータス */
  allergyStatus: AllergyStatus;
  
  /** アレルギー情報（文字列配列） */
  allergies: string[];
  
  /** 前回ログイン後に追加されたか（UI用フラグ） */
  isNew?: boolean;
  
  /** 前回ログイン後に変更されたか（UI用フラグ） */
  hasChanged?: boolean;
}

/**
 * 会場アカウント情報
 * 
 * 会場管理者・プランナーのアカウント情報
 * 
 * 【リレーション】
 * - venueId: Venue に紐づく
 */
export type AccountRole = 'VENUE_ADMIN' | 'PLANNER';

export interface Account extends User {
  role: AccountRole;
  
  /** 会場ID（外部キー） */
  venueId: string;
  
  /** アカウントロール（会場管理者 / プランナー） */
  accountRole: AccountRole;
  
  /** 参加日時（ISO 8601形式） */
  joinedAt: string;
}

/**
 * スーパーアドミンチームメンバー
 * 
 * システム全体を管理するスーパーアドミンのメンバー情報
 */
export type TeamMemberRole = 'OWNER' | 'MEMBER';
export type TeamMemberStatus = 'ACTIVE' | 'INVITED';

export interface TeamMember extends User {
  role: 'SUPER_ADMIN';
  
  /** チーム内でのロール */
  teamRole: TeamMemberRole;
  
  /** メンバーステータス */
  status: TeamMemberStatus;
  
  /** 参加日時（ISO 8601形式） */
  joinedAt: string;
}

// ============================================================================
// 会場関連
// ============================================================================

/**
 * @deprecated 新しい型定義は @/lib/types/venue からインポートしてください
 * 後方互換性のため、ここから再エクスポートしています
 */
export type {
  VenuePlan,
  VenueStatus,
  Venue,
  VenueAdmin,
} from './venue';

// 後方互換性のため、既存の型名もエクスポート（新しい型定義と同じ）
export type { VenuePlan as VenuePlanType } from './venue';
export type { VenueStatus as VenueStatusType } from './venue';
  
  /** レビュー通知メールアドレス */
  reviewNotificationEmail?: string;
}

// ============================================================================
// 挙式関連
// ============================================================================

/**
 * 挙式モード
 */
export type WeddingMode = 'INTERACTIVE' | 'SIMPLE';

/**
 * 挙式情報
 * 
 * 個別の結婚式の情報
 * 
 * 【リレーション】
 * - venueId: Venue に紐づく（将来的に追加予定）
 * - plannerId: Account (PLANNER) に紐づく（将来的に追加予定）
 */
export interface Wedding {
  /** 挙式ID */
  id: string;
  
  /** 挙式日（ISO 8601形式の日付） */
  date: string;
  
  /** 挙式開始時間（HH:mm形式） */
  time: string;
  
  /** 会場名（ホール名） */
  hall: string;
  
  /** 新郎新婦の家族名（表示用） */
  familyNames: string;
  
  /** 新郎の姓 */
  groomSei?: string;
  
  /** 新郎の名 */
  groomMei?: string;
  
  /** 新婦の姓 */
  brideSei?: string;
  
  /** 新婦の名 */
  brideMei?: string;
  
  /** データ確定（ロック）されているか */
  isLocked: boolean;
  
  /** ロック日時（ISO 8601形式、ロックされていない場合は null） */
  lockedAt: string | null;
  
  /** ロックしたユーザーID（外部キー、ロックされていない場合は null） */
  lockedBy: string | null;
  
  /** 担当プランナー名（表示用） */
  plannerName?: string;
  
  /** 参加人数 */
  guestCount?: number;
  
  /** 挙式モード */
  mode?: WeddingMode;
  
  /** ギャラリー画面の背景に使われる新郎新婦のトップ画像URL */
  welcomeImageUrl?: string;
  
  /** 会場ID（外部キー、将来的に追加予定） */
  venueId?: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}

// ============================================================================
// 卓関連
// ============================================================================

/**
 * 卓情報
 * 
 * 挙式の卓（テーブル）の情報
 * 
 * 【リレーション】
 * - weddingId: Wedding に紐づく
 */
export interface Table {
  /** 卓ID */
  id: string;
  
  /** 卓名（例: "A", "B", "1", "2"） */
  name: string;
  
  /** 新郎新婦からのメッセージ */
  message: string;
  
  /** 卓用の写真URL（新郎新婦が設定した写真） */
  photoUrl: string | null;
  
  /** 最大収容人数 */
  capacity?: number;
  
  /** スキップ済みか（共通写真を使用する場合） */
  isSkipped: boolean;
  
  /** 完了状態（写真・メッセージが設定済みか） */
  isCompleted: boolean;
  
  /** 挙式ID（外部キー） */
  weddingId: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}

/**
 * 席次表（配席計画）
 * 
 * 挙式全体の配席情報
 * 
 * 【リレーション】
 * - weddingId: Wedding に紐づく
 * - tables: Table[] を含む
 */
export interface SeatingPlan {
  /** 挙式ID（外部キー） */
  weddingId: string;
  
  /** 卓の配列 */
  tables: Table[];
  
  /** 最終更新日時（ISO 8601形式） */
  lastUpdated: string;
  
  /** ロック日時（ISO 8601形式、ロックされていない場合は null） */
  lockedAt: string | null;
}

// ============================================================================
// 写真関連
// ============================================================================

/**
 * 写真ソース
 */
export type PhotoSource = 'couple' | 'guest' | 'table';

/**
 * 写真承認ステータス
 */
export type PhotoApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * 写真情報
 * 
 * アップロードされた写真の情報
 * 
 * 【リレーション】
 * - weddingId: Wedding に紐づく
 * - tableId: Table に紐づく（卓ごとの写真の場合、全員向けの場合は null）
 * - uploadedBy: User (GUEST または COUPLE) に紐づく
 */
export interface Photo {
  /** 写真ID */
  id: string;
  
  /** 写真URL（ストレージ上のパスまたはURL） */
  url: string;
  
  /** 写真の説明・キャプション */
  alt?: string;
  
  /** 写真ソース */
  source: PhotoSource;
  
  /** 挙式ID（外部キー） */
  weddingId: string;
  
  /** 卓ID（外部キー、卓ごとの写真の場合、全員向けの場合は null） */
  tableId: string | null;
  
  /** アップロードしたユーザーID（外部キー） */
  uploadedBy: string;
  
  /** 承認ステータス */
  approvalStatus?: PhotoApprovalStatus;
  
  /** お気に入りフラグ（新郎新婦がお気に入りにしたか） */
  isFavorite?: boolean;
  
  /** 自分の写真か（ゲスト側のUI用フラグ） */
  isMyPhoto?: boolean;
  
  /** アップロード日時（ISO 8601形式） */
  uploadedAt: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}

// ============================================================================
// フィードバック・レビュー関連
// ============================================================================

/**
 * フィードバックソース
 */
export type FeedbackSource = 'COUPLE' | 'GUEST';

/**
 * フィードバック情報
 * 
 * 新郎新婦・ゲストからのフィードバック・レビュー
 * 
 * 【リレーション】
 * - weddingId: Wedding に紐づく
 * - userId: User (COUPLE または GUEST) に紐づく
 */
export interface Feedback {
  /** フィードバックID */
  id: string;
  
  /** フィードバック内容 */
  content: string;
  
  /** 評価（1-5の星評価） */
  rating: number;
  
  /** フィードバックソース */
  source: FeedbackSource;
  
  /** 挙式ID（外部キー） */
  weddingId: string;
  
  /** ユーザーID（外部キー） */
  userId: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
}

// ============================================================================
// 通知関連
// ============================================================================

/**
 * 通知タイプ
 */
export type NotificationType = 'system' | 'alert' | 'info' | 'success';

/**
 * 通知優先度
 */
export type NotificationPriority = 'normal' | 'important';

/**
 * 通知情報
 * 
 * システムからの通知・お知らせ
 * 
 * 【リレーション】
 * - venueId: Venue に紐づく（会場向け通知の場合）
 * - relatedResourceId: 関連リソースID（挙式ID、ゲストIDなど）
 */
export interface Notification {
  /** 通知ID */
  id: string;
  
  /** 通知タイトル */
  title: string;
  
  /** 通知本文 */
  content: string;
  
  /** 通知発行日時（ISO 8601形式） */
  date: string;
  
  /** 既読にしたユーザーIDの配列 */
  readByUserIds: string[];
  
  /** 通知タイプ */
  type: NotificationType;
  
  /** 通知優先度 */
  priority?: NotificationPriority;
  
  /** 重要通知かどうか（非推奨: 将来的に priority に置き換え予定） */
  isImportant?: boolean;
  
  /** 会場ID（外部キー、会場向け通知の場合） */
  venueId?: string;
  
  /** 関連リソースID（挙式ID、ゲストIDなど） */
  relatedResourceId?: string;
  
  /** アクションURL（通知クリック時の遷移先） */
  actionUrl?: string;
}

// ============================================================================
// お知らせ関連
// ============================================================================

/**
 * お知らせ優先度
 */
export type AnnouncementPriority = 'NORMAL' | 'HIGH';

/**
 * お知らせステータス
 */
export type AnnouncementStatus = 'SENT' | 'DRAFT';

/**
 * お知らせ情報
 * 
 * システム全体へのお知らせ
 */
export interface Announcement {
  /** お知らせID */
  id: string;
  
  /** お知らせタイトル */
  title: string;
  
  /** お知らせ本文 */
  body: string;
  
  /** 優先度 */
  priority: AnnouncementPriority;
  
  /** ステータス */
  status: AnnouncementStatus;
  
  /** 配信日時（ISO 8601形式） */
  sentAt: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
}

// ============================================================================
// 広告関連
// ============================================================================

/**
 * 広告情報
 * 
 * インフィード広告の情報
 * 
 * 【リレーション】
 * - venueId: Venue に紐づく（会場ごとの広告の場合）
 */
export interface Ad {
  /** 広告ID */
  id: string;
  
  /** 広告タイトル */
  title: string;
  
  /** 広告画像URL */
  imageUrl: string;
  
  /** 広告リンクURL */
  linkUrl: string;
  
  /** 会場ID（外部キー、会場ごとの広告の場合） */
  venueId?: string;
  
  /** 表示開始日時（ISO 8601形式） */
  startAt: string;
  
  /** 表示終了日時（ISO 8601形式） */
  endAt: string;
  
  /** インプレッション数 */
  impressions?: number;
  
  /** クリック数 */
  clicks?: number;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}

// ============================================================================
// 統計・メトリクス関連
// ============================================================================

/**
 * タスクメトリクス
 * 
 * 挙式管理画面で表示するタスクの進捗状況
 */
export interface TaskMetrics {
  /** 未確定ゲスト数 */
  pendingGuests: number;
  
  /** 未回答アンケート数 */
  unansweredSurveys: number;
  
  /** アレルギー未確認数 */
  unconfirmedAllergies: number;
  
  /** 配席確定待ち数 */
  pendingSeating: number;
}

/**
 * 会場統計情報
 * 
 * 会場の月次統計情報
 */
export interface VenueStatistics {
  /** 会場ID（外部キー） */
  venueId: string;
  
  /** 対象月（YYYY-MM形式） */
  month: string;
  
  /** 今月の挙式数 */
  monthlyWeddings: number;
  
  /** 今月のゲスト数 */
  monthlyGuests: number;
  
  /** ストレージ使用量（GB） */
  storageUsed: number;
  
  /** 今月の広告収益（円） */
  monthlyAdRevenue: number;
}

// ============================================================================
// アクティビティログ関連
// ============================================================================

/**
 * アクティビティタイプ
 */
export type ActivityType = 
  | 'login'
  | 'wedding_created'
  | 'wedding_updated'
  | 'wedding_locked'
  | 'photo_uploaded'
  | 'guest_registered'
  | 'guest_updated'
  | 'table_updated'
  | 'settings_updated';

/**
 * アクティビティログ
 * 
 * 会場のアクティビティ履歴
 * 
 * 【リレーション】
 * - venueId: Venue に紐づく
 * - userId: User に紐づく（アクションを実行したユーザー）
 */
export interface ActivityLog {
  /** ログID */
  id: string;
  
  /** 会場ID（外部キー） */
  venueId: string;
  
  /** ユーザーID（外部キー、アクションを実行したユーザー） */
  userId: string;
  
  /** アクティビティタイプ */
  type: ActivityType;
  
  /** アクティビティの説明 */
  description: string;
  
  /** タイムスタンプ（ISO 8601形式） */
  timestamp: string;
  
  /** 関連リソースID（挙式ID、ゲストIDなど） */
  relatedResourceId?: string;
}

// ============================================================================
// 型エクスポート
// ============================================================================

/**
 * すべての型定義をエクスポート
 */
export type {
  // ユーザー関連
  UserRole,
  User,
  Guest,
  GuestStatus,
  SurveyStatus,
  AllergyStatus,
  Account,
  AccountRole,
  TeamMember,
  TeamMemberRole,
  TeamMemberStatus,
  
  // 会場関連
  VenuePlan,
  VenueStatus,
  Venue,
  
  // 挙式関連
  WeddingMode,
  Wedding,
  
  // 卓関連
  Table,
  SeatingPlan,
  
  // 写真関連
  PhotoSource,
  PhotoApprovalStatus,
  Photo,
  
  // フィードバック関連
  FeedbackSource,
  Feedback,
  
  // 通知関連
  NotificationType,
  NotificationPriority,
  Notification,
  
  // お知らせ関連
  AnnouncementPriority,
  AnnouncementStatus,
  Announcement,
  
  // 広告関連
  Ad,
  
  // 統計関連
  TaskMetrics,
  VenueStatistics,
  
  // アクティビティログ関連
  ActivityType,
  ActivityLog,
};
