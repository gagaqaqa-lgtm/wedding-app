/**
 * Venue Service (Mock)
 * 
 * 会場情報を取得・更新するサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 */

import type { Venue } from '@/lib/types/schema';

/**
 * 会場情報を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/venues/:venueId
 * 
 * @param venueId - 会場ID
 * @returns 会場情報
 */
export async function getVenueInfo(venueId: string): Promise<Venue> {
  // Mockデータ
  return {
    id: venueId,
    name: '表参道テラス',
    code: 'omotesando-terrace',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    adminName: '管理者',
    adminEmail: 'admin@example.com',
    coverImageUrl: 'https://picsum.photos/800/600?random=venue',
    enableLineUnlock: false,
  };
}

/**
 * 会場設定を更新
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: PATCH /api/venues/:venueId
 * 
 * @param venueId - 会場ID
 * @param updates - 更新するフィールド
 * @returns 更新後の会場情報
 */
export async function updateVenueSettings(
  venueId: string,
  updates: Partial<Venue>
): Promise<Venue> {
  const current = await getVenueInfo(venueId);
  return {
    ...current,
    ...updates,
  };
}
