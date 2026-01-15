'use client';

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

// アイコン (インラインSVG)
const Icons = {
  User: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Building: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12h12"/>
      <path d="M6 6h12"/>
      <path d="M6 18h12"/>
    </svg>
  ),
  LogOut: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

// Avatarコンポーネント（シンプルな実装）
interface AvatarProps {
  initials: string;
  className?: string;
}

function Avatar({ initials, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-sm",
        "w-8 h-8 flex-shrink-0",
        className
      )}
    >
      {initials}
    </div>
  );
}

interface UserNavProps {
  className?: string;
}

export function UserNav({ className }: UserNavProps) {
  // モックデータ（実際は認証情報から取得）
  const planner = {
    name: "山田 花子",
    email: "hanako@paplea.com",
    initials: "HY",
  };

  // イニシャルを取得（姓名の頭文字）
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = planner.initials || getInitials(planner.name);

  // ログアウト処理
  const handleLogout = () => {
    // TODO: ログアウト処理を実装
    alert("ログアウトしますか？");
    // window.location.href = "/dashboard/login";
  };

  // プロフィール設定
  const handleProfileSettings = () => {
    // TODO: プロフィール設定ページへ遷移
    alert("プロフィール設定（今後実装）");
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-white/20",
            className
          )}
        >
          <Avatar initials={initials} />
          <span className="hidden sm:inline text-sm font-medium text-white">
            {planner.name.split(/\s+/)[1] || planner.name.split(/\s+/)[0]}
          </span>
          <Icons.ChevronDown className="w-4 h-4 text-white/80 hidden sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-[60]">
        {/* ヘッダー */}
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-gray-900">{planner.name}</p>
            <p className="text-xs text-gray-500">{planner.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* メニュー項目 */}
        <DropdownMenuItem
          onClick={handleProfileSettings}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Icons.User className="w-4 h-4 text-gray-600" />
          <span>プロフィール設定</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ログアウト */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Icons.LogOut className="w-4 h-4" />
          <span>ログアウト</span>
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
