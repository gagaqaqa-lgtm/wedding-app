/**
 * 外部サービスのURLや設定値
 */

/**
 * GoogleマップのURL（実際の会場のURLに置き換える）
 * 環境変数から取得することを推奨
 */
export const GOOGLE_MAPS_URL = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps';

/**
 * LINE公式アカウントID
 * 環境変数から取得することを推奨
 */
export const LINE_ID = process.env.NEXT_PUBLIC_LINE_ID || '@あなたのLINE_ID';
