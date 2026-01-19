/**
 * Venue Service (Mock)
 * 
 * 会場情報を取得するサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 * 
 * NOTE: 固定カタログデータのみを参照する純粋関数の実装です。
 * データの保存、永続化、動的生成などの機能は一切ありません。
 */

import type { Venue } from '@/lib/types/venue';

/**
 * 固定カタログデータ
 * 
 * メモリ上の定数として定義された会場データのカタログ
 * このデータのみがアプリケーション全体で参照される唯一のデータソース
 */
const VENUE_CATALOG: Record<string, Venue> = {
  'venue-standard': {
    id: 'venue-standard',
    name: '青山グランドホール',
    code: 'aoyama-grand',
    plan: 'STANDARD',
    status: 'ACTIVE',
    admin: {
      name: '山田 太郎',
      email: 'admin@aoyama-grand.jp',
    },
    lastActiveAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    coverImageUrl: 'https://picsum.photos/800/600?random=venue-standard',
    enableLineUnlock: true, // STANDARDプランはLINE連携有効
  },
  'venue-light': {
    id: 'venue-light',
    name: '博多スモールウェディング',
    code: 'hakata-small',
    plan: 'LIGHT',
    status: 'ACTIVE',
    admin: {
      name: '佐藤 花子',
      email: 'admin@hakata-small.jp',
    },
    lastActiveAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    coverImageUrl: 'https://picsum.photos/800/600?random=venue-light',
    enableLineUnlock: false, // LIGHTプランではLINE連携不可
  },
};

/**
 * 会場情報を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/venues/:venueId
 * 
 * @param venueId - 会場ID
 * @returns 会場情報（見つからない場合は null）
 */
export async function getVenueInfo(venueId: string): Promise<Venue | null> {
  // カタログから該当する会場を検索
  const venue = VENUE_CATALOG[venueId];
  
  // 見つからない場合は null を返す（エラー隠蔽しない）
  return venue || null;
}

/**
 * 全会場のリストを取得（Super Admin用）
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/venues
 * 
 * @returns 会場の配列（固定カタログデータのみ）
 */
export async function getAllVenues(): Promise<Venue[]> {
  // 固定カタログデータを配列として返す
  return Object.values(VENUE_CATALOG);
}

/**
 * 会場情報をIDで取得（詳細画面用）
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/venues/:venueId
 * 
 * @param venueId - 会場ID
 * @returns 会場情報（見つからない場合は null）
 */
export async function getVenueById(venueId: string): Promise<Venue | null> {
  return getVenueInfo(venueId);
}

/**
 * 会場設定を更新
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: PATCH /api/venues/:venueId
 * 
 * NOTE: モック実装では、実際には何も更新せず、更新後のデータを返すだけです。
 * 
 * @param venueId - 会場ID
 * @param updates - 更新するフィールド
 * @returns 更新後の会場情報（モック実装）
 */
export async function updateVenueSettings(
  venueId: string,
  updates: Partial<Venue>
): Promise<Venue> {
  // 現在の会場データを取得
  const current = await getVenueInfo(venueId);
  
  if (!current) {
    throw new Error(`Venue with id ${venueId} not found`);
  }
  
  // モック実装: 実際には保存せず、マージしたデータを返すだけ
  return {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 会場を作成（モック実装）
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: POST /api/venues
 * 
 * NOTE: モック実装では、実際には何も保存せず、固定のID（venue-standard）を返すだけです。
 * 新規作成の動作確認用のダミー実装です。
 * 
 * @param data - 会場作成データ
 * @returns 作成された会場情報（固定ID: venue-standard）
 */
export async function createVenue(
  data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>
): Promise<Venue> {
  // モック実装: 実際には保存せず、固定のIDで成功したフリをする
  // 新規作成の場合は、常に venue-standard のデータを返す
  const newVenue: Venue = {
    id: 'venue-standard',
    ...data,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return newVenue;
}
