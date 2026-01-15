"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { INITIAL_NOTIFICATIONS, type Notification } from "@/lib/data/notifications";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  currentUserId: string;
  isReadByCurrentUser: (notificationId: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string; // 現在のユーザーID（モック用、実際は認証情報から取得）
}

export function NotificationProvider({ children, userId = 'current-planner' }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const currentUserId = userId;

  // 指定した通知が現在のユーザーによって既読かどうかを判定
  const isReadByCurrentUser = useMemo(() => {
    return (notificationId: string): boolean => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification ? notification.readByUserIds.includes(currentUserId) : false;
    };
  }, [notifications, currentUserId]);

  // 未読件数を計算（現在のユーザーに対して）
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.readByUserIds.includes(currentUserId)).length;
  }, [notifications, currentUserId]);

  // 指定したIDの通知を現在のユーザーで既読にする
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => {
        if (n.id === id && !n.readByUserIds.includes(currentUserId)) {
          return { ...n, readByUserIds: [...n.readByUserIds, currentUserId] };
        }
        return n;
      })
    );
  };

  // 全ての通知を現在のユーザーで既読にする
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => {
        if (!n.readByUserIds.includes(currentUserId)) {
          return { ...n, readByUserIds: [...n.readByUserIds, currentUserId] };
        }
        return n;
      })
    );
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    currentUserId,
    isReadByCurrentUser,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// カスタムフック
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
