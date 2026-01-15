/**
 * 空状態コンポーネント
 * 
 * 通知が存在しない場合に表示する空状態コンポーネントです。
 * ユーザーに「通知がない」ことを明確に伝えます。
 */

import React from 'react';

/**
 * 空状態コンポーネント
 * 
 * 通知が0件の場合に表示されるメッセージです。
 */
export function NotificationEmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
      <p className="text-gray-500 text-lg mb-2">お知らせはありません</p>
      <p className="text-sm text-gray-400">
        新しいお知らせが届くと、ここに表示されます
      </p>
    </div>
  );
}
