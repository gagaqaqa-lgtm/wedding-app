// 権限チェックロジック
import type { UserRole } from './roles';

/**
 * ルートパスに基づいて必要なロールを返す
 */
export function getRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) {
    return 'super_admin';
  }
  if (pathname.startsWith('/dashboard')) {
    return 'venue_admin';
  }
  // 公開ページ（/guest, /guest/survey, /guest/gallery）は認証不要
  return null;
}

/**
 * ユーザーが指定されたパスにアクセス可能かチェック
 */
export function canAccess(userRole: UserRole | null, pathname: string): boolean {
  const requiredRole = getRequiredRole(pathname);
  
  // 認証不要のページ
  if (requiredRole === null) {
    return true;
  }
  
  // 未認証ユーザー
  if (!userRole) {
    return false;
  }
  
  // Super Adminは全ページにアクセス可能
  if (userRole === 'super_admin') {
    return true;
  }
  
  // Venue Adminは/dashboard/*のみアクセス可能
  if (userRole === 'venue_admin') {
    return requiredRole === 'venue_admin';
  }
  
  // Guestは公開ページのみ
  return requiredRole === null;
}
