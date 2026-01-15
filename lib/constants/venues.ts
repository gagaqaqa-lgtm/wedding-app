/**
 * 会場情報の定数
 * 実際の実装では、APIやデータベースから取得する想定
 */

export interface VenueInfo {
  id: string;
  name: string;
}

/**
 * 会場情報のマッピング
 * キーはvenueId、値は会場情報
 */
export const VENUE_INFO: Record<string, VenueInfo> = {
  'venue-001': { id: 'venue-001', name: '会場A' },
  'venue-002': { id: 'venue-002', name: '会場B' },
  'venue-003': { id: 'venue-003', name: '会場C' },
};

/**
 * デフォルトの会場名（会場IDが見つからない場合）
 */
export const DEFAULT_VENUE_NAME = '不明な会場';

/**
 * 会場情報を取得するヘルパー関数
 */
export function getVenueInfo(venueId: string): VenueInfo {
  return VENUE_INFO[venueId] || { id: venueId, name: DEFAULT_VENUE_NAME };
}

/**
 * 会場名を取得するヘルパー関数
 */
export function getVenueName(venueId: string): string {
  return getVenueInfo(venueId).name;
}
