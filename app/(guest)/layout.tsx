import { ReactNode } from 'react';

/**
 * ゲスト画面共通レイアウト
 * 
 * Route Group `(guest)` の共通レイアウトです。
 * ゲスト用のシンプルなレイアウトを提供します（認証不要）。
 */
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* シンプルなレイアウト（認証不要） */}
      {children}
    </div>
  );
}
