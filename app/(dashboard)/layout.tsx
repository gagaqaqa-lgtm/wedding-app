import { ReactNode } from 'react';

/**
 * ダッシュボード共通レイアウト
 * 
 * Route Group `(dashboard)` の共通レイアウトです。
 * 認証チェックや共通ヘッダーなどをここに実装できます。
 * 
 * 注意: `(auth)` 配下のログイン画面には適用されません（Route Groupsで分離）
 */
export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  // TODO: 認証チェック（将来実装）
  // const session = await getSession();
  // if (!session) redirect('/dashboard/login');
  
  return <>{children}</>;
}
