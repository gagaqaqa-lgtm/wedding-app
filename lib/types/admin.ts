// 管理画面用型定義

export type GuestStatus = 'pending' | 'confirmed' | 'locked'; // 未確定 | 確定 | ロック済み
export type SurveyStatus = 'not_answered' | 'answered' | 'approved'; // 未回答 | 回答済み | 承認済み
export type AllergyStatus = 'none' | 'reported' | 'confirmed'; // なし | 報告あり | 確認済み

export interface Guest {
  id: string;
  name: string;
  tableId: string | null;
  weddingId: number;
  surveyStatus: SurveyStatus;
  allergyStatus: AllergyStatus;
  allergies: string[];
  status: GuestStatus;
  updatedAt: string;
  createdAt: string;
  isNew?: boolean; // 前回ログイン後に追加されたか
  hasChanged?: boolean; // 前回ログイン後に変更されたか
}

export interface Wedding {
  id: number;
  date: string;
  familyNames: string;
  time: string;
  hall: string;
  isLocked: boolean; // データ確定（ロック）されているか
  lockedAt: string | null;
  lockedBy: string | null;
  plannerName?: string; // 担当プランナー名
  guestCount?: number; // 参加人数
  mode?: 'INTERACTIVE' | 'SIMPLE'; // インタラクティブ（テーブル共有あり） / シンプル（DLのみ）
}

export interface TaskMetrics {
  pendingGuests: number; // 未確定ゲスト数
  unansweredSurveys: number; // 未回答アンケート数
  unconfirmedAllergies: number; // アレルギー未確認数
  pendingSeating: number; // 配席確定待ち数
}

export interface DiffItem {
  id: string;
  type: 'guest_added' | 'guest_updated' | 'allergy_updated' | 'seating_changed' | 'survey_answered';
  guestName?: string;
  description: string;
  timestamp: string;
  isNew?: boolean;
}

export interface TableLayout {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
}

export interface SeatingPlan {
  weddingId: number;
  tables: TableLayout[];
  lastUpdated: string;
  lockedAt: string | null;
}
