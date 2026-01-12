"use client";

import React from "react";
import Link from "next/link";
import { INITIAL_NOTIFICATIONS } from "@/lib/data/notifications";
import type { Notification } from "@/lib/data/notifications";

// アイコン (インラインSVG)
const Icons = {
  Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Building: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Settings: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// 日付を相対時間に変換
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

  if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  }
};

// タイプに応じたアイコンと色を取得
const getNotificationStyle = (type: Notification['type'], isRead: boolean) => {
  switch (type) {
    case 'alert':
      return {
        icon: Icons.Alert,
        iconColor: isRead ? "text-orange-400" : "text-orange-500",
      };
    case 'info':
      return {
        icon: Icons.Info,
        iconColor: isRead ? "text-blue-400" : "text-blue-500",
      };
    case 'success':
      return {
        icon: Icons.Check,
        iconColor: isRead ? "text-green-400" : "text-green-500",
      };
    default:
      return {
        icon: Icons.Info,
        iconColor: isRead ? "text-gray-400" : "text-gray-500",
      };
  }
};

export default function DashboardPage() {
  const menuItems = [
    {
      title: "挙式管理",
      description: "挙式の一覧・登録・編集を行います",
      href: "/dashboard/weddings",
      icon: Icons.Calendar,
      color: "from-[#2BB996] to-[#25a082]",
    },
    {
      title: "会場設定",
      description: "披露宴会場の設定・管理を行います",
      href: "/dashboard/venues",
      icon: Icons.Building,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "システム設定",
      description: "アプリ連携・アカウント管理",
      href: "/dashboard/settings",
      icon: Icons.Settings,
      color: "from-gray-600 to-gray-700",
    },
  ];

  // 最新のお知らせ1件を取得（未読優先、日付順）
  const latestNotification = [...INITIAL_NOTIFICATIONS]
    .sort((a, b) => {
      // 未読を優先
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      // 日付が新しい順
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })[0];

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.Home className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">ダッシュボード</h1>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">

          {/* 最新のお知らせセクション（横長バナー形式） */}
          {latestNotification && (
            <div className="mb-12">
              <Link
                href="/dashboard/notifications"
                className={`group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out p-6 ${
                  !latestNotification.isRead 
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* 左側: NEWSバッジと日付 */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                      NEWS
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(latestNotification.date)}
                    </span>
                  </div>

                  {/* 中央: アイコンと本文 */}
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    {(() => {
                      const style = getNotificationStyle(latestNotification.type, latestNotification.isRead);
                      const Icon = style.icon;
                      return (
                        <div className={`flex-shrink-0 ${style.iconColor}`}>
                          <Icon />
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {latestNotification.isImportant && !latestNotification.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                            重要
                          </span>
                        )}
                        {!latestNotification.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                            未読
                          </span>
                        )}
                        <h3 className={`text-base leading-snug ${
                          !latestNotification.isRead 
                            ? 'font-bold text-gray-900' 
                            : 'font-medium text-gray-700'
                        }`}>
                          {latestNotification.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {latestNotification.content}
                      </p>
                    </div>
                  </div>

                  {/* 右側: 「すべて見る」リンク */}
                  <div className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-[#2BB996] group-hover:text-[#25a082] transition-colors">
                    <span>すべて見る</span>
                    <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* メニューカード */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">管理機能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden"
                  >
                    <div className="p-8">
                      {/* アイコン */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} text-white mb-6 group-hover:scale-110 transition-transform duration-200 ease-in-out`}>
                        <Icon />
                      </div>

                      {/* タイトル */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2BB996] transition-colors">
                        {item.title}
                      </h2>

                      {/* 説明 */}
                      <p className="text-gray-600 mb-6">
                        {item.description}
                      </p>

                      {/* 矢印 */}
                      <div className="flex items-center text-emerald-600 font-medium">
                        <span>詳細を見る</span>
                        <Icons.ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
