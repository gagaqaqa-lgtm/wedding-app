# Project Audit Report

## 1. File Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx.example
├── (dashboard)/
│   ├── dashboard/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   └── (main)/
│   │       ├── [venueId]/
│   │       │   ├── _components/
│   │       │   │   ├── DashboardHeader.tsx
│   │       │   │   └── FeedbackFeed.tsx
│   │       │   ├── accounts/
│   │       │   │   └── page.tsx
│   │       │   ├── layout.tsx
│   │       │   ├── notifications/
│   │       │   │   └── page.tsx
│   │       │   ├── page.tsx
│   │       │   ├── settings/
│   │       │   │   ├── _components/
│   │       │   │   │   └── ReviewSettings.tsx
│   │       │   │   └── page.tsx
│   │       │   ├── venues/
│   │       │   │   └── page.tsx
│   │       │   └── weddings/
│   │       │       ├── [id]/
│   │       │       │   ├── _components/
│   │       │       │   │   └── FeedbackTab.tsx
│   │       │       │   └── page.tsx
│   │       │       └── page.tsx
│   │       ├── accounts/
│   │       │   └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       ├── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       ├── venues/
│   │       │   └── page.tsx
│   │       └── weddings/
│   │           └── [id]/
│   │               └── page.tsx
│   └── layout.tsx
├── (guest)/
│   └── guest/
│       ├── (entry)/
│       │   └── page.tsx
│       ├── (main)/
│       │   └── gallery/
│       │       └── page.tsx
│       └── (onboarding)/
│           └── survey/
│               └── page.tsx
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
│       └── page.tsx
├── couple/
│   ├── gallery/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── page.tsx
│   └── tables/
│       └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

lib/
├── auth/
│   ├── permissions.ts
│   └── roles.ts
├── constants/
│   ├── external.ts
│   └── venues.ts
├── data/
│   └── notifications.ts
├── hooks/
│   └── useNotifications.ts
├── services/
│   ├── api.ts
│   ├── mock/
│   │   ├── guestService.ts
│   │   ├── index.ts
│   │   ├── photoService.ts
│   │   ├── venueService.ts
│   │   └── weddingService.ts
│   └── notificationService.ts
├── store/
│   ├── authStore.ts
│   ├── venueStore.ts
│   └── weddingStore.ts
├── swr/
│   └── fetcher.ts
├── types/
│   ├── admin.ts
│   ├── notifications.ts
│   └── schema.ts
└── utils/
    ├── cn.ts
    ├── dateFormatter.ts
    ├── diff.ts
    ├── notificationStyle.tsx
    ├── print.ts
    └── status.ts
```

## 2. Type Definitions

```typescript
/**
 * 共通型定義ファイル (Schema)
 * 
 * このファイルは、アプリケーション全体で使用されるデータモデルの型定義を集約しています。
 * 将来のバックエンド連携を見据え、データベース設計図（ER図）の基礎となる構造を定義します。
 */

// ============================================================================
// ユーザー関連
// ============================================================================

export type UserRole = 
  | 'SUPER_ADMIN'      // スーパーアドミン
  | 'VENUE_ADMIN'      // 会場管理者
  | 'PLANNER'          // プランナー
  | 'COUPLE'           // 新郎新婦
  | 'GUEST';           // ゲスト

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export type GuestStatus = 'pending' | 'confirmed' | 'locked';
export type SurveyStatus = 'not_answered' | 'answered' | 'approved';
export type AllergyStatus = 'none' | 'reported' | 'confirmed';

export interface Guest extends User {
  role: 'GUEST';
  weddingId: string;
  tableId: string | null;
  status: GuestStatus;
  surveyStatus: SurveyStatus;
  allergyStatus: AllergyStatus;
  allergies: string[];
  isNew?: boolean;
  hasChanged?: boolean;
}

export type AccountRole = 'VENUE_ADMIN' | 'PLANNER';

export interface Account extends User {
  role: AccountRole;
  venueId: string;
  accountRole: AccountRole;
  joinedAt: string;
}

export type TeamMemberRole = 'OWNER' | 'MEMBER';
export type TeamMemberStatus = 'ACTIVE' | 'INVITED';

export interface TeamMember extends User {
  role: 'SUPER_ADMIN';
  teamRole: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: string;
}

// ============================================================================
// 会場関連
// ============================================================================

export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';

export interface Venue {
  id: string;
  name: string;
  code: string;
  plan: VenuePlan;
  status: VenueStatus;
  lastActiveAt: string;
  createdAt: string;
  adminName: string;
  adminEmail: string;
  coverImageUrl?: string;
  enableLineUnlock?: boolean;
  googleMapsReviewUrl?: string;
  lineOfficialAccountUrl?: string;
  displayVenueName?: string;
  coupleReviewUrl?: string;
  coupleReviewThreshold?: number;
  guestReviewUrl?: string;
  guestReviewThreshold?: number;
  reviewNotificationEmail?: string;
}

// ============================================================================
// 挙式関連
// ============================================================================

export type WeddingMode = 'INTERACTIVE' | 'SIMPLE';

export interface Wedding {
  id: string;
  date: string;
  time: string;
  hall: string;
  familyNames: string;
  groomSei?: string;
  groomMei?: string;
  brideSei?: string;
  brideMei?: string;
  isLocked: boolean;
  lockedAt: string | null;
  lockedBy: string | null;
  plannerName?: string;
  guestCount?: number;
  mode?: WeddingMode;
  welcomeImageUrl?: string;
  venueId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 卓関連
// ============================================================================

export interface Table {
  id: string;
  name: string;
  message: string;
  photoUrl: string | null;
  capacity?: number;
  isSkipped: boolean;
  isCompleted: boolean;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeatingPlan {
  weddingId: string;
  tables: Table[];
  lastUpdated: string;
  lockedAt: string | null;
}

// ============================================================================
// 写真関連
// ============================================================================

export type PhotoSource = 'couple' | 'guest' | 'table';
export type PhotoApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Photo {
  id: string;
  url: string;
  alt?: string;
  source: PhotoSource;
  weddingId: string;
  tableId: string | null;
  uploadedBy: string;
  approvalStatus?: PhotoApprovalStatus;
  isFavorite?: boolean;
  isMyPhoto?: boolean;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// フィードバック・レビュー関連
// ============================================================================

export type FeedbackSource = 'COUPLE' | 'GUEST';

export interface Feedback {
  id: string;
  content: string;
  rating: number;
  source: FeedbackSource;
  weddingId: string;
  userId: string;
  createdAt: string;
}

// ============================================================================
// 通知関連
// ============================================================================

export type NotificationType = 'system' | 'alert' | 'info' | 'success';
export type NotificationPriority = 'normal' | 'important';

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  readByUserIds: string[];
  type: NotificationType;
  priority?: NotificationPriority;
  isImportant?: boolean;
  venueId?: string;
  relatedResourceId?: string;
  actionUrl?: string;
}

// ============================================================================
// お知らせ関連
// ============================================================================

export type AnnouncementPriority = 'NORMAL' | 'HIGH';
export type AnnouncementStatus = 'SENT' | 'DRAFT';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  sentAt: string;
  createdAt: string;
}

// ============================================================================
// 広告関連
// ============================================================================

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  venueId?: string;
  startAt: string;
  endAt: string;
  impressions?: number;
  clicks?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 統計・メトリクス関連
// ============================================================================

export interface TaskMetrics {
  pendingGuests: number;
  unansweredSurveys: number;
  unconfirmedAllergies: number;
  pendingSeating: number;
}

export interface VenueStatistics {
  venueId: string;
  month: string;
  monthlyWeddings: number;
  monthlyGuests: number;
  storageUsed: number;
  monthlyAdRevenue: number;
}

// ============================================================================
// アクティビティログ関連
// ============================================================================

export type ActivityType = 
  | 'login'
  | 'wedding_created'
  | 'wedding_updated'
  | 'wedding_locked'
  | 'photo_uploaded'
  | 'guest_registered'
  | 'guest_updated'
  | 'table_updated'
  | 'settings_updated';

export interface ActivityLog {
  id: string;
  venueId: string;
  userId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  relatedResourceId?: string;
}
```

## 3. Service Interfaces

### venueService.ts

```typescript
/**
 * 会場情報を取得
 * @param venueId - 会場ID
 * @returns 会場情報（見つからない場合はデフォルト会場を返す）
 */
export async function getVenueInfo(venueId: string): Promise<Venue | undefined>

/**
 * 会場情報をIDで取得（詳細画面用）
 * @param venueId - 会場ID
 * @returns 会場情報（見つからない場合はデフォルト会場を返す）
 */
export async function getVenueById(venueId: string): Promise<Venue | null>

/**
 * 会場設定を更新
 * NOTE: モック実装では、実際には何も更新せず、更新後のデータを返すだけです。
 * @param venueId - 会場ID
 * @param updates - 更新するフィールド
 * @returns 更新後の会場情報（モック実装）
 */
export async function updateVenueSettings(
  venueId: string,
  updates: Partial<Venue>
): Promise<Venue>

/**
 * 全会場のリストを取得（Super Admin用）
 * @returns 会場の配列（固定の3つの会場のみ）
 */
export async function getAllVenues(): Promise<Venue[]>

/**
 * 会場を作成
 * NOTE: モック実装では、実際には何も保存せず、固定のID（venue-new）を返すだけです。
 * @param data - 会場作成データ
 * @returns 作成された会場情報（固定ID: venue-new）
 */
export async function createVenue(
  data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>
): Promise<Venue>
```

### weddingService.ts

```typescript
/**
 * 挙式情報を取得
 * @param weddingId - 挙式ID
 * @returns 挙式情報
 */
export async function getWeddingInfo(weddingId: string): Promise<Wedding & { message?: string }>

/**
 * ウェルカムメッセージ（画像）を更新
 * @param weddingId - 挙式ID
 * @param welcomeImageUrl - ウェルカム画像URL
 * @returns 更新後の挙式情報
 */
export async function updateWelcomeMessage(
  weddingId: string,
  welcomeImageUrl: string
): Promise<Wedding>

/**
 * 挙式に紐づく卓一覧を取得
 * @param weddingId - 挙式ID
 * @returns 卓の配列
 */
export async function getWeddingTables(weddingId: string): Promise<Table[]>

/**
 * 挙式日を取得（Date形式）
 * @param weddingId - 挙式ID
 * @returns 挙式日（Date形式）
 */
export async function getWeddingDate(weddingId: string): Promise<Date>

/**
 * 特定会場の挙式リストを取得（Planner用）
 * @param venueId - 会場ID
 * @returns 挙式の配列
 */
export async function getWeddingsByVenue(venueId: string): Promise<Wedding[]>

/**
 * 卓情報を取得
 * @param tableId - 卓ID
 * @returns 卓情報（名前とメッセージ）
 */
export async function getTableInfo(tableId: string): Promise<{ id: string; name: string; message: string }>

/**
 * 挙式を作成
 * @param data - 挙式作成データ
 * @returns 作成された挙式情報
 */
export async function createWedding(
  data: Omit<Wedding, 'id' | 'createdAt' | 'updatedAt' | 'isLocked' | 'lockedAt' | 'lockedBy'>
): Promise<Wedding>
```

## 4. Routing Implementation

### app/(dashboard)/dashboard/(main)/[venueId]/layout.tsx

```typescript
"use client";

import { ReactNode, use, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import { DashboardHeader } from "./_components/DashboardHeader";
import { getVenueById, getVenueInfo } from "@/lib/services/mock/venueService";

interface VenueDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ venueId: string }>;
}

function VenueDashboardLayoutContent({ children, params }: VenueDashboardLayoutProps) {
  const { venueId: urlVenueId } = use(params);
  const pathname = usePathname();
  const { unreadCount } = useNotification();

  // 会場IDの取得: URLパラメータを最優先
  const getEffectiveVenueId = (): string => {
    if (urlVenueId) {
      return urlVenueId;
    }
    if (typeof window !== 'undefined') {
      const mockId = localStorage.getItem('mock_venue_id');
      if (mockId) {
        return mockId;
      }
    }
    return 'venue-1';
  };
  
  const effectiveVenueId = getEffectiveVenueId();
  const basePath = `/dashboard/${effectiveVenueId}`;

  // 会場情報の取得（プラン判定用）
  const [venuePlan, setVenuePlan] = useState<'LIGHT' | 'STANDARD' | 'PREMIUM'>('STANDARD');
  const [venueName, setVenueName] = useState<string>('読み込み中...');
  const [isLoadingVenue, setIsLoadingVenue] = useState(true);
  
  useEffect(() => {
    const loadVenueInfo = async () => {
      setIsLoadingVenue(true);
      try {
        console.log('Dashboard Layout Fetch - venueId:', effectiveVenueId);
        const venue = await getVenueInfo(effectiveVenueId);
        console.log('Dashboard Layout Fetch - result:', venue);
        
        const safeVenue = venue || {
          id: effectiveVenueId,
          name: '⚠️ データが見つかりません',
          plan: 'STANDARD' as const,
          code: '',
          status: 'ACTIVE' as const,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          adminName: '',
          adminEmail: '',
          coverImageUrl: '',
          enableLineUnlock: false,
        };
        
        console.log('Dashboard Layout Fetch - safeVenue:', safeVenue);
        setVenuePlan(safeVenue.plan);
        setVenueName(safeVenue.name || `Venue ${safeVenue.id}`);
      } catch (error) {
        console.error('Failed to load venue info:', error);
        setVenueName(`⚠️ データが見つかりません (ID: ${effectiveVenueId})`);
      } finally {
        setIsLoadingVenue(false);
      }
    };
    loadVenueInfo();
  }, [effectiveVenueId]);

  const isLightPlan = venuePlan === 'LIGHT';
  const planName = isLightPlan ? 'Light Plan' : venuePlan === 'PREMIUM' ? 'Premium Plan' : 'Standard Plan';

  const menuItems: MenuItem[] = [
    { label: "ホーム", href: basePath, icon: Icons.Home },
    { label: "お知らせ", href: `${basePath}/notifications`, icon: Icons.Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { label: "挙式管理", href: `${basePath}/weddings`, icon: Icons.Calendar },
    { label: "会場設定", href: `${basePath}/venues`, icon: Icons.Building },
    { label: "アカウント一覧", href: `${basePath}/accounts`, icon: Icons.UserGroup },
    { label: "設定", href: `${basePath}/settings`, icon: Icons.Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* サイドバー */}
      <div className="w-64 bg-gradient-to-b from-emerald-800 to-teal-900 border-r border-emerald-700/50 shadow-sm flex-shrink-0 flex flex-col">
        {/* ロゴエリア */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-emerald-700/50">
          <span className="text-2xl font-extrabold text-white tracking-wider">
            Guest Link
          </span>
        </div>

        {/* 契約プラン表示カード */}
        <div className="px-4 pt-4 pb-2">
          <div className={`rounded-lg p-3 ${
            isLightPlan 
              ? 'bg-emerald-900/40 border border-emerald-700/50' 
              : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-none shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold ${isLightPlan ? 'text-emerald-100' : 'text-white'}`}>
                現在のプラン
              </span>
              <span className={`text-xs font-bold ${isLightPlan ? 'text-emerald-100' : 'text-white'}`}>
                {planName}
              </span>
            </div>
          </div>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== basePath && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-sm"
                    : "text-emerald-100/90 hover:bg-emerald-700/40 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm">{item.label}</span>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader 
          venueId={effectiveVenueId}
          venueName={venueName}
        />
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VenueDashboardLayout({ children, params }: VenueDashboardLayoutProps) {
  return (
    <NotificationProvider>
      <VenueDashboardLayoutContent params={params}>
        {children}
      </VenueDashboardLayoutContent>
    </NotificationProvider>
  );
}
```

### app/(dashboard)/dashboard/(main)/[venueId]/page.tsx

```typescript
"use client";

import { use, Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import type { Notification } from "@/lib/data/notifications";
import { getVenueById } from "@/lib/services/mock/venueService";
import { useNotification } from "@/contexts/NotificationContext";
import { FeedbackFeed } from "./_components/FeedbackFeed";

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

  const { notifications, isReadByCurrentUser } = useNotification();

  // 最新のお知らせ1件を取得（未読優先、日付順）
  const latestNotification = [...notifications]
    .sort((a, b) => {
      const aIsRead = isReadByCurrentUser(a.id);
      const bIsRead = isReadByCurrentUser(b.id);
      if (aIsRead !== bIsRead) {
        return aIsRead ? 1 : -1;
      }
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
            {latestNotification && (
              <div className="mb-12">
                <Link
                  href={`/dashboard/${venueId}/notifications`}
                  className={`group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out p-6 ${
                    !isReadByCurrentUser(latestNotification.id)
                      ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* お知らせコンテンツ */}
                </Link>
              </div>
            )}

            {/* メニューカードとフィードバックウィジェット */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">管理機能</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
