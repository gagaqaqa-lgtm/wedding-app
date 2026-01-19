/**
 * Wedding Service (Mock)
 * 
 * 挙式情報を取得するサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 * 
 * NOTE: 固定カタログデータのみを参照する純粋関数の実装です。
 * データの保存、永続化、動的生成などの機能は一切ありません。
 */

import type { Wedding, Table } from '@/lib/types/schema';

/**
 * 固定カタログデータ
 * 
 * メモリ上の定数として定義された挙式データのカタログ
 * このデータのみがアプリケーション全体で参照される唯一のデータソース
 */
const WEDDING_CATALOG: Record<string, Wedding> = {
  '1': {
    id: '1',
    venueId: 'venue-standard',
    familyNames: '田中・佐藤 御両家',
    date: '2026-06-15',
    time: '18:00',
    hall: 'グランドボールルーム',
    guestCount: 80,
    isLocked: false, // status: "planning" → isLocked: false
    lockedAt: null,
    lockedBy: null,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  '2': {
    id: '2',
    venueId: 'venue-light',
    familyNames: '鈴木・高橋 御両家',
    date: '2026-07-20',
    time: '17:30',
    hall: 'ガーデンテラス',
    isLocked: true, // status: "confirmed" → isLocked: true
    lockedAt: '2026-07-15T10:00:00.000Z',
    lockedBy: 'admin',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-07-15T10:00:00.000Z',
  },
};

/**
 * 挙式情報をIDで取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式情報（見つからない場合は null）
 */
export async function getWeddingById(weddingId: string): Promise<Wedding | null> {
  // カタログから該当する挙式を検索
  const wedding = WEDDING_CATALOG[weddingId];
  
  // 見つからない場合は null を返す（エラー隠蔽しない）
  return wedding || null;
}

/**
 * 会場IDに紐づく挙式のリストを取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/venues/:venueId/weddings
 * 
 * @param venueId - 会場ID
 * @returns 挙式の配列（該当する挙式のみ）
 */
export async function getWeddingsByVenueId(venueId: string): Promise<Wedding[]> {
  // カタログから該当するvenueIdの挙式をフィルタリング
  return Object.values(WEDDING_CATALOG).filter(
    (wedding) => wedding.venueId === venueId
  );
}

/**
 * 挙式情報を取得（後方互換性のためのエイリアス）
 * 
 * @deprecated 新しいコードでは `getWeddingById` を使用してください
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式情報（見つからない場合はデフォルトデータを返す）
 */
export async function getWeddingInfo(weddingId: string): Promise<Wedding & { message?: string }> {
  const wedding = await getWeddingById(weddingId);
  
  // 後方互換性のため、見つからない場合もデフォルトデータを返す
  if (!wedding) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      id: weddingId,
      date: today.toISOString().split('T')[0],
      time: '18:00',
      hall: 'グランドボールルーム',
      familyNames: '山田・佐藤 様',
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      welcomeImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
      message: '本日はご多用の中、私たちの結婚式にご列席いただき、誠にありがとうございます。\n\n皆様と共に過ごすこの特別な時間を、心から楽しみにしていました。\n素敵な写真をたくさん撮って、思い出を共有してください。\n\nどうぞ、素敵な時間をお過ごしください。',
    };
  }
  
  return wedding;
}

/**
 * 特定会場の挙式リストを取得（後方互換性のためのエイリアス）
 * 
 * @deprecated 新しいコードでは `getWeddingsByVenueId` を使用してください
 * 
 * @param venueId - 会場ID
 * @returns 挙式の配列
 */
export async function getWeddingsByVenue(venueId: string): Promise<Wedding[]> {
  return getWeddingsByVenueId(venueId);
}

/**
 * ウェルカムメッセージ（画像）を更新
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: PATCH /api/weddings/:weddingId
 * Storage: Supabase Storage (wedding-welcome-images/)
 * 
 * NOTE: モック実装では、実際には何も更新せず、更新後のデータを返すだけです。
 * 
 * @param weddingId - 挙式ID
 * @param welcomeImageUrl - ウェルカム画像URL
 * @returns 更新後の挙式情報（モック実装）
 */
export async function updateWelcomeMessage(
  weddingId: string,
  welcomeImageUrl: string
): Promise<Wedding> {
  const current = await getWeddingById(weddingId);
  
  if (!current) {
    throw new Error(`Wedding with id ${weddingId} not found`);
  }
  
  // モック実装: 実際には保存せず、マージしたデータを返すだけ
  return {
    ...current,
    welcomeImageUrl,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 挙式に紐づく卓一覧を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId/tables
 * 
 * @param weddingId - 挙式ID
 * @returns 卓の配列（固定データ）
 */
export async function getWeddingTables(weddingId: string): Promise<Table[]> {
  // Mockデータ（固定の3テーブル）
  return [
    {
      id: 'table-a',
      name: 'A',
      message: '',
      photoUrl: null,
      isSkipped: false,
      isCompleted: false,
      weddingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'table-b',
      name: 'B',
      message: '',
      photoUrl: null,
      isSkipped: false,
      isCompleted: false,
      weddingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'table-c',
      name: 'C',
      message: '',
      photoUrl: null,
      isSkipped: false,
      isCompleted: false,
      weddingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * 挙式日を取得（Date形式）
 * 
 * BACKEND_TODO: Replace with actual API call
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式日（Date形式）
 */
export async function getWeddingDate(weddingId: string): Promise<Date> {
  const wedding = await getWeddingById(weddingId);
  
  if (!wedding) {
    throw new Error(`Wedding with id ${weddingId} not found`);
  }
  
  const date = new Date(wedding.date);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * 卓情報を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/tables/:tableId
 * 
 * @param tableId - 卓ID
 * @returns 卓情報（名前とメッセージ）
 */
export async function getTableInfo(tableId: string): Promise<{ id: string; name: string; message: string }> {
  // ダミー遅延（実装時を想定）
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 開発用ダミーデータ: どのtableIdでも必ずダミーメッセージを返す
  // テーブル名はtableIdから抽出（例: "table-a" → "Table A", "table-1" → "Table 1"）
  const tableLabel = tableId.replace(/^table-?/i, '').toUpperCase() || 'A';
  
  return {
    id: tableId,
    name: `Table ${tableLabel}`,
    message: `【開発用ダミーメッセージ】\n${tableLabel}番テーブルの皆様へ\n\n今日は遠くから来てくれて本当にありがとうございます！\n高校時代の思い出話で盛り上がってください。\nたくさん飲んで食べて楽しんでください。\n素敵な写真をたくさん撮って、思い出を共有してくださいね。\n\n新郎新婦より`,
  };
}

/**
 * 挙式を作成（モック実装）
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: POST /api/weddings
 * 
 * NOTE: モック実装では、実際には何も保存せず、固定のID（"1"）を返すだけです。
 * 新規作成の動作確認用のダミー実装です。
 * 
 * @param data - 挙式作成データ
 * @returns 作成された挙式情報（固定ID: "1"）
 */
export async function createWedding(
  data: Omit<Wedding, 'id' | 'createdAt' | 'updatedAt' | 'isLocked' | 'lockedAt' | 'lockedBy'>
): Promise<Wedding> {
  // モック実装: 実際には保存せず、固定のIDで成功したフリをする
  // 新規作成の場合は、常に "1" のデータを返す
  const newWedding: Wedding = {
    id: '1',
    ...data,
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return newWedding;
}
