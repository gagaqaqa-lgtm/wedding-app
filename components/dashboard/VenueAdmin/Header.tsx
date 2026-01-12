'use client';

import { useState } from 'react';
import { Bell, Settings, LogOut, User, Calendar } from 'lucide-react';
import { CommandPalette } from '@/components/common/CommandPalette';
import { useWeddingStore } from '@/lib/store/weddingStore';

export function VenueAdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { selectedWedding } = useWeddingStore();

  // ダミーデータ（実際は認証情報から取得）
  const notificationCount = 5;
  const plannerName = '山田 太郎'; // TODO: 認証情報から取得

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* 左側: 現在の挙式名 + Command Palette */}
        <div className="flex-1 flex items-center gap-6">
          {selectedWedding && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 font-sans">
                {selectedWedding.name}
              </span>
            </div>
          )}
          {!selectedWedding && (
            <div className="text-sm text-gray-500 font-sans">
              挙式を選択してください
            </div>
          )}
          <CommandPalette />
        </div>

        {/* 右側: アクション */}
        <div className="flex items-center gap-4">
          {/* 通知ベル */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notificationCount}
              </span>
            )}
          </button>

          {/* ユーザーメニュー */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-sans">{plannerName}</span>
            </div>
            
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 通知ドロップダウン（簡易版） */}
      {showNotifications && (
        <div className="absolute right-6 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans">通知</h3>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-sans">通知機能は今後実装予定です</p>
          </div>
        </div>
      )}
    </header>
  );
}
