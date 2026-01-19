# プロジェクト構造と主要コード

## ディレクトリ構造

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx.example
│
├── (dashboard)/
│   └── dashboard/
│       ├── (auth)/
│       │   └── login/
│       │       └── page.tsx
│       ├── (main)/
│       │   ├── [venueId]/
│       │   │   ├── _components/
│       │   │   │   ├── DashboardHeader.tsx
│       │   │   │   ├── FeedbackFeed.tsx
│       │   │   │   └── VenueDashboardShell.tsx
│       │   │   ├── accounts/
│       │   │   │   └── page.tsx
│       │   │   ├── layout.tsx                    # Server Component
│       │   │   ├── notifications/
│       │   │   │   └── page.tsx
│       │   │   ├── page.tsx                      # Dashboard Home
│       │   │   ├── settings/
│       │   │   │   ├── _components/
│       │   │   │   │   └── ReviewSettings.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── venues/
│       │   │   │   └── page.tsx
│       │   │   └── weddings/
│       │   │       ├── _components/
│       │   │       │   ├── CreateWeddingDialog.tsx
│       │   │       │   ├── WeddingListClient.tsx
│       │   │       │   └── WeddingListTable.tsx
│       │   │       ├── [id]/
│       │   │       │   ├── _components/
│       │   │       │   │   ├── FeedbackTab.tsx
│       │   │       │   │   ├── WeddingDetailClient.tsx
│       │   │       │   │   └── WeddingSettingsForm.tsx
│       │   │       │   └── page.tsx              # Wedding Detail (Server Component)
│       │   │       └── page.tsx                  # Wedding List (Server Component)
│       │   ├── accounts/
│       │   │   └── page.tsx
│       │   ├── not-found.tsx                     # 404 Page
│       │   ├── notifications/
│       │   │   └── page.tsx
│       │   ├── page.tsx
│       │   ├── settings/
│       │   │   └── page.tsx
│       │   ├── venues/
│       │   │   └── page.tsx
│       │   └── weddings/
│       │       └── [id]/
│       │           └── page.tsx
│       └── layout.tsx
│
├── (guest)/
│   └── guest/
│       ├── (entry)/
│       │   └── page.tsx                          # Guest Entry
│       ├── (main)/
│       │   └── gallery/
│       │       └── page.tsx                      # Guest Gallery
│       ├── (onboarding)/
│       │   └── survey/
│       │       └── page.tsx                      # Guest Survey
│       └── layout.tsx
│
├── admin/
│   ├── ads/
│   │   └── page.tsx
│   ├── announcements/
│   │   ├── _components/
│   │   │   └── CreateAnnouncementDialog.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── team/
│   │   ├── _components/
│   │   │   └── InviteMemberDialog.tsx
│   │   └── page.tsx
│   └── venues/
│       ├── _components/
│       │   ├── CreateVenueDialog.tsx
│       │   └── ProxyLoginDialog.tsx
│       ├── [id]/
│       │   ├── _components/
│       │   │   └── AddAccountDialog.tsx
│       │   └── page.tsx
│       └── page.tsx                              # Venue List (Client Component)
│
├── couple/
│   ├── gallery/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── page.tsx                                  # Couple Home
│   └── tables/
│       └── page.tsx
│
├── globals.css
├── layout.tsx                                    # Root Layout
└── page.tsx                                      # Root Page

lib/
├── types/
│   ├── admin.ts                                  # Admin型定義
│   ├── notifications.ts                          # Notification型定義
│   ├── schema.ts                                 # 共通型定義 (Wedding, Guest, Photo, Table等)
│   └── venue.ts                                  # Venue型定義 (将来のRDB設計を見据えた構造)
│
└── services/
    ├── api.ts                                    # APIクライアント（モック）
    ├── mock/
    │   ├── guestService.ts                       # Guest関連のモックサービス
    │   ├── index.ts
    │   ├── photoService.ts                       # Photo関連のモックサービス
    │   ├── venueService.ts                       # Venue関連のモックサービス（固定カタログ）
    │   └── weddingService.ts                     # Wedding関連のモックサービス（固定カタログ）
    └── notificationService.ts                    # Notification関連のサービス

components/
├── admin/                                        # Admin画面用コンポーネント
│   ├── Common/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ...
├── guest/                                        # Guest画面用コンポーネント
│   ├── Lightbox.tsx
│   └── OpeningModal.tsx
├── notifications/                                # Notification関連コンポーネント
│   ├── EmptyState.tsx
│   ├── NotificationCard.tsx
│   ├── NotificationHeader.tsx
│   └── NotificationList.tsx
└── ui/                                           # Shadcn UIコンポーネント
    ├── badge.tsx
    ├── button.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── radio-group.tsx
    ├── select.tsx
    ├── switch.tsx
    ├── tabs.tsx
    ├── table.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

## 主要型定義

### `lib/types/venue.ts`

```typescript
/**
 * Venue型定義
 * 将来のRDB設計を見越した会場情報の型定義
 * 管理者情報は正規化の準備として admin オブジェクトにネスト
 */

export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

export interface VenueAdmin {
  name: string;
  email: string;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  plan: VenuePlan;
  status: VenueStatus;
  admin: VenueAdmin;  // ネストされた管理者情報
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  coverImageUrl?: string;
  enableLineUnlock?: boolean;
  // ...その他のオプションフィールド
}
```

### `lib/types/schema.ts` (主要部分)

```typescript
/**
 * 共通型定義ファイル (Schema)
 * 将来のバックエンド連携を見据え、データベース設計図の基礎となる構造を定義
 */

export type UserRole = 'SUPER_ADMIN' | 'VENUE_ADMIN' | 'PLANNER' | 'COUPLE' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface Guest extends User {
  role: 'GUEST';
  weddingId: string;
  tableId: string | null;
  status: GuestStatus;
  surveyStatus: SurveyStatus;
  allergyStatus: AllergyStatus;
  allergies: string[];
}

export interface Wedding {
  id: string;
  venueId?: string;
  date: string;
  time: string;
  hall: string;
  familyNames: string;
  isLocked: boolean;
  lockedAt: string | null;
  lockedBy: string | null;
  plannerName?: string;
  guestCount?: number;
  mode?: WeddingMode;
  welcomeImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  message: string;
  photoUrl: string | null;
  isSkipped: boolean;
  isCompleted: boolean;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  alt?: string;
  weddingId: string;
  tableId?: string;
  uploadedBy: string;
  uploadedAt: string;
  isApproved: boolean;
}
```

## サービス層 (Mock)

### `lib/services/mock/venueService.ts`

**固定カタログデータ:**
- `VENUE_CATALOG`: 2つの固定会場データ
  - `venue-standard`: STANDARDプラン、LINE連携有効
  - `venue-light`: LIGHTプラン、LINE連携無効

**主要関数:**
```typescript
export async function getVenueInfo(venueId: string): Promise<Venue | null>
export async function getAllVenues(): Promise<Venue[]>
export async function getVenueById(venueId: string): Promise<Venue | null>
export async function updateVenueSettings(venueId: string, updates: Partial<Venue>): Promise<Venue>
export async function createVenue(data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>): Promise<Venue>
```

### `lib/services/mock/weddingService.ts`

**固定カタログデータ:**
- `WEDDING_CATALOG`: 2つの固定挙式データ
  - `'1'`: venue-standardに紐づく、planning状態
  - `'2'`: venue-lightに紐づく、confirmed状態

**主要関数:**
```typescript
export async function getWeddingById(weddingId: string): Promise<Wedding | null>
export async function getWeddingsByVenueId(venueId: string): Promise<Wedding[]>
export async function getWeddingInfo(weddingId: string): Promise<Wedding & { message?: string }>  // @deprecated
export async function getWeddingsByVenue(venueId: string): Promise<Wedding[]>  // @deprecated
export async function getTableInfo(tableId: string): Promise<{ id: string; name: string; message: string }>
export async function getWeddingTables(weddingId: string): Promise<Table[]>
export async function getWeddingDate(weddingId: string): Promise<Date>
export async function createWedding(data: Omit<Wedding, 'id' | 'createdAt' | 'updatedAt' | ...>): Promise<Wedding>
```

## 主要ページのコード

### 1. `app/admin/venues/page.tsx` (会場管理一覧)

```typescript
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Settings, LogIn, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllVenues, createVenue } from '@/lib/services/mock/venueService';
import type { Venue, VenuePlan, VenueStatus } from '@/lib/types/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateVenueDialog } from './_components/CreateVenueDialog';
import { ProxyLoginDialog } from './_components/ProxyLoginDialog';

// ステータスバッジの色分け
const getStatusBadgeVariant = (status: VenueStatus): 'indigo' | 'destructive' | 'warning' => {
  switch (status) {
    case 'ACTIVE': return 'indigo';
    case 'SUSPENDED': return 'destructive';
    case 'ONBOARDING': return 'warning';
  }
};

// ステータスラベル
const getStatusLabel = (status: VenueStatus): string => {
  switch (status) {
    case 'ACTIVE': return '稼働中';
    case 'SUSPENDED': return '停止中';
    case 'ONBOARDING': return '導入中';
  }
};

// プランラベル
const getPlanLabel = (plan: VenuePlan): string => {
  switch (plan) {
    case 'LIGHT': return 'ライト';
    case 'STANDARD': return 'スタンダード';
    case 'PREMIUM': return 'プレミアム';
  }
};

// 日付フォーマット
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}分前`;
    }
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export default function VenuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProxyLoginDialogOpen, setIsProxyLoginDialogOpen] = useState(false);
  const [selectedVenueForLogin, setSelectedVenueForLogin] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // データの読み込み
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getAllVenues();
        setVenues(data);
      } catch (error) {
        console.error('Failed to load venues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVenues();
  }, []);

  // 検索フィルタリング
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return venues;
    }
    const query = searchQuery.toLowerCase();
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.code.toLowerCase().includes(query) ||
        venue.admin.email.toLowerCase().includes(query) ||
        venue.admin.name.toLowerCase().includes(query)
    );
  }, [searchQuery, venues]);

  // 新規会場追加ハンドラー
  const handleCreateVenue = async (venueData: {
    name: string;
    code: string;
    plan: VenuePlan;
    status: VenueStatus;
    admin: { name: string; email: string };
  }) => {
    try {
      const newVenue = await createVenue({
        ...venueData,
        coverImageUrl: undefined,
        enableLineUnlock: false,
      });
      setVenues((prev) => [newVenue, ...prev]);
    } catch (error) {
      console.error('Failed to create venue:', error);
    }
  };

  // アクション処理
  const handleViewDetails = (venueId: string) => {
    router.push(`/admin/venues/${venueId}`);
  };

  const handleLoginAsVenue = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    if (venue) {
      setSelectedVenueForLogin({ id: venue.id, name: venue.name });
      setIsProxyLoginDialogOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">会場管理</h2>
                  <p className="text-gray-600">契約中の結婚式場一覧とステータスを管理します。</p>
                </div>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>会場一覧</CardTitle>
                  <div className="flex items-center gap-4">
                    {/* 検索バー */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="会場名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {/* 新規会場登録ボタン */}
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新規会場登録
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredVenues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>検索結果が見つかりませんでした</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>会場名</TableHead>
                        <TableHead>会場コード</TableHead>
                        <TableHead>管理者</TableHead>
                        <TableHead>プラン</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>最終ログイン</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue) => (
                        <TableRow key={venue.id} className="hover:bg-indigo-50 transition-colors">
                          <TableCell className="font-medium text-gray-900 font-sans antialiased">
                            {venue.name}
                          </TableCell>
                          <TableCell className="text-gray-600 font-mono text-sm">{venue.code}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{venue.admin.name}</div>
                              <div className="text-gray-500 text-xs">{venue.admin.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getPlanLabel(venue.plan)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(venue.status)}>
                              {getStatusLabel(venue.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(new Date(venue.lastActiveAt))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(venue.id)}
                                className="font-sans antialiased"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                詳細・設定
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoginAsVenue(venue.id)}
                                className="gap-2 text-stone-600 hover:text-stone-900 border-stone-300 hover:bg-stone-50 font-sans antialiased"
                              >
                                <LogIn className="w-4 h-4" />
                                代理ログイン
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 新規会場登録ダイアログ */}
      <CreateVenueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateVenue}
      />

      {/* 代理ログイン確認ダイアログ */}
      {selectedVenueForLogin && (
        <ProxyLoginDialog
          open={isProxyLoginDialogOpen}
          onOpenChange={(open) => {
            setIsProxyLoginDialogOpen(open);
            if (!open) {
              setSelectedVenueForLogin(null);
            }
          }}
          venueId={selectedVenueForLogin.id}
          venueName={selectedVenueForLogin.name}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
```

### 2. `app/(dashboard)/dashboard/(main)/[venueId]/page.tsx` (会場ダッシュボード)

```typescript
"use client";

import { use, Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import type { Notification } from "@/lib/data/notifications";
import { getVenueById } from "@/lib/services/mock/venueService";
import { useNotification } from "@/contexts/NotificationContext";
import { FeedbackFeed } from "./_components/FeedbackFeed";

// アイコン定義（省略）
const Icons = { /* ... */ };

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

interface VenueDashboardPageProps {
  params: Promise<{ venueId: string }>;
}

export default function VenueDashboardPage({ params }: VenueDashboardPageProps) {
  const { venueId } = use(params);
  
  // 会場情報の取得（非同期）
  const [venueInfo, setVenueInfo] = useState<{ id: string; name: string } | null>(null);
  const [isLoadingVenue, setIsLoadingVenue] = useState(true);
  
  useEffect(() => {
    const loadVenueInfo = async () => {
      try {
        const venue = await getVenueById(venueId);
        if (venue) {
          setVenueInfo({ id: venue.id, name: venue.name });
        } else {
          setVenueInfo({ id: venueId, name: '不明な会場' });
        }
      } catch (error) {
        console.error('Failed to load venue info:', error);
        setVenueInfo({ id: venueId, name: '不明な会場' });
      } finally {
        setIsLoadingVenue(false);
      }
    };
    loadVenueInfo();
  }, [venueId]);

  const menuItems = [
    {
      title: "挙式管理",
      description: "挙式の一覧・登録・編集を行います",
      href: `/dashboard/${venueId}/weddings`,
      icon: Icons.Calendar,
      color: "from-[#2BB996] to-[#25a082]",
    },
    {
      title: "会場設定",
      description: "披露宴会場の設定・管理を行います",
      href: `/dashboard/${venueId}/venues`,
      icon: Icons.Building,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "システム設定",
      description: "アプリ連携・アカウント管理",
      href: `/dashboard/${venueId}/settings`,
      icon: Icons.Settings,
      color: "from-gray-600 to-gray-700",
    },
  ];

  // Contextから通知データを取得
  const { notifications, isReadByCurrentUser } = useNotification();

  // 最新のお知らせ1件を取得（未読優先、日付順）
  const latestNotification = [...notifications]
    .sort((a, b) => {
      const aIsRead = isReadByCurrentUser(a.id);
      const bIsRead = isReadByCurrentUser(b.id);
      // 未読を優先
      if (aIsRead !== bIsRead) {
        return aIsRead ? 1 : -1;
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
              <div>
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">ダッシュボード</h1>
                {isLoadingVenue ? (
                  <p className="text-sm text-gray-600 mt-1">読み込み中...</p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    会場: {venueInfo?.name || '不明な会場'} ({venueId})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            {/* 最新のお知らせセクション */}
            {latestNotification && (() => {
              const notificationIsRead = isReadByCurrentUser(latestNotification.id);
              return (
                <div className="mb-12">
                  <Link
                    href={`/dashboard/${venueId}/notifications`}
                    className={`group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out p-6 ${
                      !notificationIsRead 
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 通知表示UI（省略） */}
                  </Link>
                </div>
              );
            })()}

            {/* メニューカードとフィードバックウィジェット */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">管理機能</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* メニューカード */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden"
                      >
                        <div className="p-8">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} text-white mb-6 group-hover:scale-110 transition-transform duration-200 ease-in-out`}>
                            <Icon />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2BB996] transition-colors">
                            {item.title}
                          </h2>
                          <p className="text-gray-600 mb-6">
                            {item.description}
                          </p>
                          <div className="flex items-center text-emerald-600 font-medium">
                            <span>詳細を見る</span>
                            <Icons.ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* フィードバックウィジェット */}
                <div className="lg:col-span-1">
                  <FeedbackFeed venueId={venueId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. `app/couple/page.tsx` (新郎新婦ホーム)

```typescript
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { Users, Grid, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PostWeddingThankYouCard } from '@/components/PostWeddingThankYouCard';
import { getWeddingInfo, getWeddingTables, getWeddingDate } from '@/lib/services/mock/weddingService';

const MOCK_WEDDING_ID = 'wedding-1'; // TODO: 認証情報から取得

export default function CoupleHomePage() {
  const router = useRouter();
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [tables, setTables] = useState<Array<{ id: string; name: string; isCompleted: boolean }>>([]);
  const [daysUntil, setDaysUntil] = useState(0);
  const isWeddingDayOrAfter = daysUntil === 0 || daysUntil < 0;
  
  // 全員への写真の状態
  const [sharedPhotos, setSharedPhotos] = useState<File[]>([]);
  const [sharedMessage, setSharedMessage] = useState('');
  const [isSharedSheetOpen, setIsSharedSheetOpen] = useState(false);
  const [currentSharedPhotos, setCurrentSharedPhotos] = useState<File[]>([]);
  const [currentSharedMessage, setCurrentSharedMessage] = useState('');
  
  // 共通の状態
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'shared' | null>(null);
  const sharedFileInputRef = useRef<HTMLInputElement>(null);

  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wedding, weddingTables, date] = await Promise.all([
          getWeddingInfo(MOCK_WEDDING_ID),
          getWeddingTables(MOCK_WEDDING_ID),
          getWeddingDate(MOCK_WEDDING_ID),
        ]);
        setWeddingDate(date);
        setTables(weddingTables.map(t => ({ id: t.id, name: t.name, isCompleted: t.isCompleted })));
        setDaysUntil(calculateDaysUntil(date));
      } catch (error) {
        console.error('Failed to load wedding data:', error);
      }
    };
    loadData();
  }, []);

  // 進捗計算
  const sharedCompleted = sharedPhotos.length > 0 || sharedMessage.length > 0;
  const tableCompletedCount = tables.filter(table => table.isCompleted).length;
  
  // 2ステップ方式の完了判定
  const step1Completed = sharedCompleted;
  const step2Completed = tableCompletedCount > 0;
  const allStepsCompleted = step1Completed && step2Completed;

  // 挙式後の場合は、サンクスレターカードを表示
  if (isWeddingDayOrAfter) {
    return (
      <PostWeddingThankYouCard
        coupleId={1}
        onReviewSubmit={async (rating, comment) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }}
        albumPath="/couple/gallery"
      />
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-24">
      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto px-4 py-4 md:py-6 space-y-3 md:space-y-6">
        {/* ゲストおもてなし準備: ステップガイド */}
        <section>
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2 tracking-tight text-balance">
              ゲストおもてなし準備
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              ゲストの皆様に喜んでいただけるよう、準備を進めましょう
            </p>
          </div>

          {/* All Set 状態の表示 */}
          {allStepsCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 md:mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 md:p-5 border-2 border-emerald-300 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-emerald-800 mb-1">
                    準備完了！
                  </p>
                  <p className="text-sm text-emerald-700">
                    あとは当日を楽しむだけです
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-3 md:space-y-4">
            {/* STEP 1: プロフィール・挨拶設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={handleSharedClick}
                className={cn(
                  "w-full rounded-xl p-4 md:p-6 border-2 shadow-sm transition-all duration-200",
                  "active:scale-[0.98] text-left relative overflow-hidden min-h-[100px] md:min-h-[120px]",
                  step1Completed
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-md"
                    : "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                )}
              >
                {/* STEP 1 UI（省略） */}
              </button>
            </motion.div>

            {/* STEP 2: ゲスト・卓設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => router.push('/couple/tables')}
                className={cn(
                  "w-full rounded-xl p-4 md:p-6 border-2 shadow-sm transition-all duration-200",
                  "active:scale-[0.98] text-left relative overflow-hidden min-h-[100px] md:min-h-[120px]",
                  step2Completed
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-md"
                    : "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                )}
              >
                {/* STEP 2 UI（省略） */}
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 全員への写真シート（下からスライドアップ） */}
      <Sheet open={isSharedSheetOpen} onOpenChange={setIsSharedSheetOpen}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          {/* フォームUI（省略） */}
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### 4. `app/(dashboard)/dashboard/(main)/[venueId]/weddings/page.tsx` (挙式一覧)

```typescript
import { getWeddingsByVenueId } from '@/lib/services/mock/weddingService';
import { WeddingListClient } from './_components/WeddingListClient';

interface VenueWeddingsPageProps {
  params: Promise<{ venueId: string }>;
}

/**
 * 挙式一覧ページ（Server Component）
 * 会場IDを受け取り、サーバーサイドでその会場に紐づく挙式リストを取得してクライアントコンポーネントに渡す
 */
export default async function VenueWeddingsPage({ params }: VenueWeddingsPageProps) {
  const { venueId } = await params;
  const weddings = await getWeddingsByVenueId(venueId);
  
  return (
    <WeddingListClient 
      weddings={weddings}
      venueId={venueId}
    />
  );
}
```

### 5. `app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/page.tsx` (挙式詳細)

```typescript
import { notFound } from 'next/navigation';
import { getWeddingById } from '@/lib/services/mock/weddingService';
import { WeddingDetailClient } from './_components/WeddingDetailClient';

interface WeddingDetailPageProps {
  params: Promise<{ venueId: string; id: string }>;
}

/**
 * 挙式詳細ページ（Server Component）
 * 
 * 会場IDと挙式IDを受け取り、サーバーサイドで挙式情報を取得してクライアントコンポーネントに渡す
 */
export default async function WeddingDetailPage({ params }: WeddingDetailPageProps) {
  // URLパラメータから会場IDと挙式IDを取得
  const { venueId, id: weddingId } = await params;
  
  // サーバーサイドで挙式情報を取得
  const wedding = await getWeddingById(weddingId);
  
  // バリデーション: データが存在しない、または会場IDが一致しない場合は404
  if (!wedding || wedding.venueId !== venueId) {
    notFound();
  }
  
  // クライアントコンポーネントに挙式データを渡す
  return (
    <WeddingDetailClient 
      wedding={wedding}
      venueId={venueId}
    />
  );
}
```

### 6. `app/(guest)/guest/(main)/gallery/page.tsx` (ゲストギャラリー)

```typescript
'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Mail } from 'lucide-react';
import JSZip from 'jszip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getVenueInfo } from '@/lib/services/mock/venueService';
import { getWeddingInfo, getTableInfo } from '@/lib/services/mock/weddingService';

const MOCK_VENUE_ID = 'venue-1';
const MOCK_WEDDING_ID = 'wedding-1';

function GalleryContent() {
  const searchParams = useSearchParams();
  const tableID = searchParams.get('table');
  const heroRef = useRef<HTMLDivElement>(null);
  
  // 状態管理
  const [activeTab, setActiveTab] = useState('couple');
  const [venueInfo, setVenueInfo] = useState<{ 
    name: string; 
    coverImage: string; 
    enableLineUnlock: boolean; 
    plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' 
  } | null>(null);
  const [weddingInfo, setWeddingInfo] = useState<{ message?: string } | null>(null);
  const [tableInfo, setTableInfo] = useState<{ id: string; name: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 会場・挙式データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [venue, wedding] = await Promise.all([
          getVenueInfo(MOCK_VENUE_ID),
          getWeddingInfo(MOCK_WEDDING_ID),
        ]);
        if (venue) {
          setVenueInfo({
            name: venue.name,
            coverImage: venue.coverImageUrl || 'https://picsum.photos/800/600?random=venue',
            enableLineUnlock: venue.enableLineUnlock || false,
            plan: venue.plan || 'PREMIUM',
          });
        }
        if (wedding) {
          setWeddingInfo({ message: (wedding as any).message });
        }
        if (tableID) {
          const table = await getTableInfo(tableID);
          setTableInfo(table);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [tableID]);

  // 初期ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-stone-50"
    >
      {/* ヒーローセクション */}
      <section ref={heroRef} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${venueInfo?.coverImage || ''})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 py-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
          >
            Wedding Photo Gallery
          </motion.h1>
          
          {/* 全員へのメッセージ */}
          {weddingInfo?.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mt-6"
            >
              <p className="text-white text-lg md:text-xl font-serif drop-shadow-md whitespace-pre-wrap">
                {weddingInfo.message}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* タブナビゲーション（Sticky） */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'couple' | 'table')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="couple">お二人の写真</TabsTrigger>
              <TabsTrigger value="table">この卓の写真</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="pb-24">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'couple' | 'table')}>
          <TabsContent value="couple" className="mt-0">
            {/* 写真グリッド表示 */}
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            {/* 卓メッセージカード */}
            {tableInfo && (
              <div className="max-w-md mx-auto px-4 pt-6 mb-6">
                <div className="bg-white/80 backdrop-blur-sm border border-stone-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-amber-500" />
                    <h3 className="font-serif text-lg font-semibold text-stone-800">
                      新郎新婦から、{tableInfo.name}の皆様へ
                    </h3>
                  </div>
                  <p className="font-serif text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {tableInfo.message}
                  </p>
                </div>
              </div>
            )}
            {/* 写真グリッド表示 */}
          </TabsContent>
        </Tabs>
      </div>

      {/* 固定フッター（ダウンロードアクション） */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700">
              一括保存
            </button>
            <button className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
              選択して保存
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
```

## アーキテクチャの特徴

### Server/Client Component 分離

- **Server Components**: データ取得を担当
  - `app/(dashboard)/dashboard/(main)/[venueId]/layout.tsx`
  - `app/(dashboard)/dashboard/(main)/[venueId]/weddings/page.tsx`
  - `app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/page.tsx`

- **Client Components**: インタラクティブなUIを担当
  - `VenueDashboardShell.tsx`
  - `WeddingListClient.tsx`
  - `WeddingListTable.tsx`
  - `WeddingDetailClient.tsx`
  - `WeddingSettingsForm.tsx`

### データフロー

1. **Server Component** で `getVenueInfo()`, `getWeddingsByVenueId()`, `getWeddingById()` などを実行
2. 取得したデータを **Client Component** に Props として渡す
3. Client Component 内で `useState` で状態管理（Optimistic UI対応）
4. データの永続化は行わず、リロードで初期値に戻る（安全設計）

### 固定カタログデータ戦略

- `VENUE_CATALOG`: 2つの固定会場（venue-standard, venue-light）
- `WEDDING_CATALOG`: 2つの固定挙式（'1', '2'）
- 動的生成や `localStorage` 依存を排除
- バックエンド実装時の差し替えが容易な設計

### 型定義の階層

- `lib/types/venue.ts`: Venue型（将来のRDB設計を見据えた構造）
- `lib/types/schema.ts`: 共通型定義（Wedding, Guest, Photo, Table等）
- 管理者情報は `admin` オブジェクトにネスト（正規化の準備）
