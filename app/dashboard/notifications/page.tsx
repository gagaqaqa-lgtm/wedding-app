"use client";

import React, { useState } from "react";
import { INITIAL_NOTIFICATIONS, type Notification } from "@/lib/data/notifications";

// アイコン (インラインSVG)
const Icons = {
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Info: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  System: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Bell: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

// 日付を相対時間またはフォーマット済み文字列に変換
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
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
};

// タイプに応じたアイコンと色を取得
const getNotificationStyle = (type: Notification['type'], isRead: boolean) => {
  const baseClasses = isRead 
    ? "text-gray-400" 
    : "text-white";

  switch (type) {
    case 'alert':
      return {
        icon: Icons.Alert,
        iconBg: isRead ? "bg-orange-100" : "bg-orange-500",
        iconColor: isRead ? "text-orange-600" : baseClasses,
        accentColor: "border-l-orange-500",
        badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case 'info':
      return {
        icon: Icons.Info,
        iconBg: isRead ? "bg-blue-100" : "bg-blue-500",
        iconColor: isRead ? "text-blue-600" : baseClasses,
        accentColor: "border-l-blue-500",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case 'success':
      return {
        icon: Icons.Check,
        iconBg: isRead ? "bg-green-100" : "bg-green-500",
        iconColor: isRead ? "text-green-600" : baseClasses,
        accentColor: "border-l-green-500",
        badgeColor: "bg-green-100 text-green-700 border-green-200",
      };
    case 'system':
      return {
        icon: Icons.System,
        iconBg: isRead ? "bg-gray-100" : "bg-gray-600",
        iconColor: isRead ? "text-gray-600" : baseClasses,
        accentColor: "border-l-gray-500",
        badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return {
        icon: Icons.Info,
        iconBg: isRead ? "bg-gray-100" : "bg-gray-500",
        iconColor: isRead ? "text-gray-600" : baseClasses,
        accentColor: "border-l-gray-500",
        badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // 通知を既読にする
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  // 通知をクリック（既読にする）
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  // 未読件数を取得
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.Bell className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">お知らせ</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                  {unreadCount}件の未読
                </span>
              )}
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
          {/* 未読件数が0の場合のメッセージ */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <p className="text-gray-500 text-lg mb-2">お知らせはありません</p>
              <p className="text-sm text-gray-400">新しいお知らせが届くと、ここに表示されます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type, notification.isRead);
                const Icon = style.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      bg-white rounded-xl border shadow-sm
                      cursor-pointer transition-all duration-200
                      ${!notification.isRead 
                        ? `${style.accentColor} border-l-4 hover:shadow-md bg-blue-50/30` 
                        : 'hover:shadow-md hover:border-gray-300 border-gray-200'
                      }
                    `}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* アイコン */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                          <Icon />
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {notification.isImportant && !notification.isRead && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                                    重要
                                  </span>
                                )}
                                {!notification.isRead && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                                    未読
                                  </span>
                                )}
                              </div>
                              <h3 className={`text-base leading-relaxed ${
                                !notification.isRead 
                                  ? 'font-bold text-gray-900' 
                                  : 'font-medium text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                            </div>
                            <span className="flex-shrink-0 text-xs text-gray-500 font-medium whitespace-nowrap">
                              {formatDate(notification.date)}
                            </span>
                          </div>
                          
                          {/* 内容 */}
                          <p className={`text-sm leading-relaxed ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-700'
                          }`}>
                            {notification.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
