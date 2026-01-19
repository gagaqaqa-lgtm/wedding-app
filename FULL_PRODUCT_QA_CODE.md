# プロダクト全画面 QA用 フルコード（最終整合性チェック）

## ファイル一覧

1. `app/admin/page.tsx` - Adminダッシュボード
2. `app/(dashboard)/dashboard/(main)/[venueId]/page.tsx` - Plannerダッシュボード
3. `app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/page.tsx` - 挙式詳細（Server）
4. `app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingDetailClient.tsx` - 挙式詳細（Client）
5. `app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingSettingsForm.tsx` - 設定フォーム
6. `app/couple/page.tsx` - 新郎新婦ホーム
7. `app/couple/tables/page.tsx` - 新郎新婦卓設定
8. `app/(guest)/guest/(entry)/page.tsx` - ゲスト入口
9. `app/(guest)/guest/(onboarding)/survey/page.tsx` - アンケート/レビュー
10. `app/(guest)/guest/(main)/gallery/page.tsx` - ギャラリー
11. `components/PostWeddingThankYouCard.tsx` - レビューカード
12. `components/DownloadWaitModal.tsx` - ダウンロード待機モーダル
13. `lib/types/venue.ts` - 型定義

---


## app/admin/page.tsx

```tsx
'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Building2, TrendingUp, DollarSign, Activity, ArrowRight, Plus, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllVenues } from '@/lib/services/mock/venueService';
import { useEffect, useState } from 'react';
import type { Venue } from '@/lib/types/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Venue型定義（schema.tsからインポート）
import type { Venue, VenuePlan, VenueStatus } from '@/lib/types/schema';

// メトリクスカードコンポーネント
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, change, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-medium font-sans antialiased ${change.startsWith('+') ? 'text-indigo-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-sans antialiased">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-sans antialiased">{value}</p>
      </div>
    </motion.div>
  );
}

// プランラベル取得
const getPlanLabel = (plan: VenuePlan): string => {
  switch (plan) {
    case 'LIGHT':
      return 'ライト';
    case 'STANDARD':
      return 'スタンダード';
    case 'PREMIUM':
      return 'プレミアム';
  }
};

// ステータスバッジの色分け
const getStatusBadgeVariant = (status: VenueStatus): 'indigo' | 'destructive' | 'warning' => {
  switch (status) {
    case 'ACTIVE':
      return 'indigo';
    case 'SUSPENDED':
      return 'destructive';
    case 'ONBOARDING':
      return 'warning';
  }
};

// ステータスラベル
const getStatusLabel = (status: VenueStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return '稼働中';
    case 'SUSPENDED':
      return '停止中';
    case 'ONBOARDING':
      return '導入中';
  }
};

export default function SuperAdminDashboardPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
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

  // 統計データの計算
  const totalVenues = venues.length;
  const activeVenues = venues.filter((v) => v.status === 'ACTIVE').length;
  const activeRate = totalVenues > 0 ? ((activeVenues / totalVenues) * 100).toFixed(1) : '0.0';

  // 今月の新規契約数（今月に登録された会場）
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newVenuesThisMonth = venues.filter((v) => {
    const createdDate = new Date(v.createdAt);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;

  // 今月の推定収益（モック計算：各プランに基づく）
  const estimatedMonthlyRevenue = venues.reduce((sum, v) => {
    let revenue = 0;
    switch (v.plan) {
      case 'LIGHT':
        revenue = 50000;
        break;
      case 'STANDARD':
        revenue = 100000;
        break;
      case 'PREMIUM':
        revenue = 200000;
        break;
    }
    return sum + revenue;
  }, 0);

  // 最近登録された会場（登録日時でソート、最新5件）
  const recentVenues = [...venues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
        <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">ダッシュボード</h2>
                  <p className="text-gray-600">システム全体の稼働状況と主要指標を確認します。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/venues">
                  <Button
                    variant="outline"
                    className="font-sans antialiased"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新規会場登録
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8 space-y-6">
            {/* メトリクスカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Building2}
                label="総契約会場数"
                value={`${totalVenues} Venues`}
                change={`+${newVenuesThisMonth} (今月)`}
                color="bg-indigo-500"
              />
              <MetricCard
                icon={TrendingUp}
                label="今月の新規契約"
                value={`+${newVenuesThisMonth} Venues`}
                color="bg-indigo-600"
              />
              <MetricCard
                icon={Activity}
                label="稼働率"
                value={`${activeRate}% Active`}
                color="bg-indigo-700"
              />
              <MetricCard
                icon={DollarSign}
                label="今月の推定収益"
                value={`¥${estimatedMonthlyRevenue.toLocaleString()}`}
                color="bg-indigo-800"
              />
            </div>

            {/* 最近登録された会場 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-sans antialiased">最近登録された会場</CardTitle>
                  <Link href="/admin/venues">
                    <Button variant="ghost" size="sm" className="font-sans antialiased">
                      すべての会場を見る
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans antialiased">会場名</TableHead>
                      <TableHead className="font-sans antialiased">プラン</TableHead>
                      <TableHead className="font-sans antialiased">登録日</TableHead>
                      <TableHead className="font-sans antialiased">ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8 font-sans antialiased">
                          会場がありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentVenues.map((venue) => (
                        <TableRow key={venue.id} className="hover:bg-indigo-50 transition-colors cursor-pointer">
                          <TableCell className="font-sans antialiased font-medium">
                            {venue.name}
                          </TableCell>
                          <TableCell className="font-sans antialiased">
                            {getPlanLabel(venue.plan)}
                          </TableCell>
                          <TableCell className="font-sans antialiased">
                            {format(new Date(venue.createdAt), 'yyyy/MM/dd', { locale: ja })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(venue.status)}
                              className="font-sans antialiased"
                            >
                              {getStatusLabel(venue.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## app/(dashboard)/dashboard/(main)/[venueId]/page.tsx

```tsx
"use client";

import { use, Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import type { Notification } from "@/lib/data/notifications";
import { getVenueById } from "@/lib/services/mock/venueService";
import { useNotification } from "@/contexts/NotificationContext";
import { FeedbackFeed } from "./_components/FeedbackFeed";

// アイコン (インラインSVG)
const Icons = {
  Calendar: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Building: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Bell: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Alert: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Info: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Home: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Settings: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
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

          {/* 最新のお知らせセクション（横長バナー形式） */}
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
                      const style = getNotificationStyle(latestNotification.type, notificationIsRead);
                      const Icon = style.icon;
                      return (
                        <div className={`flex-shrink-0 ${style.iconColor}`}>
                          <Icon />
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {latestNotification.isImportant && !notificationIsRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                            重要
                          </span>
                        )}
                        {!notificationIsRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                            未読
                          </span>
                        )}
                        <h3 className={`text-base leading-snug ${
                          !notificationIsRead 
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

---

## app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/page.tsx

```tsx
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

---

## lib/types/venue.ts

```tsx
/**
 * Venue型定義
 * 
 * 将来のRDB設計を見越した会場情報の型定義
 * 管理者情報は正規化の準備として admin オブジェクトにネスト
 */

/**
 * 契約プラン
 */
export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';

/**
 * 会場ステータス
 */
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

/**
 * 会場管理者情報
 * 
 * 将来のRDB設計では、別テーブル（users または admins）に正規化される予定
 */
export interface VenueAdmin {
  /** 管理者名 */
  name: string;
  
  /** 管理者メールアドレス（ログインIDとしても使用） */
  email: string;
}

/**
 * 会場情報
 * 
 * 結婚式場の基本情報と契約情報
 * 
 * 【RDB設計の想定】
 * - venues テーブル: id, name, code, plan, status, coverImageUrl, enableLineUnlock, ...
 * - venue_admins テーブル（将来）: venueId (FK), name, email, ...
 * 
 * 現時点では admin をフラットに持つが、将来的には外部キーで参照する
 */
export interface Venue {
  /** 会場ID（主キー） */
  id: string;
  
  /** 会場名 */
  name: string;
  
  /** 会場コード（URLに使用される識別子、ユニーク制約） */
  code: string;
  
  /** 契約プラン */
  plan: VenuePlan;
  
  /** 会場ステータス */
  status: VenueStatus;
  
  /** 管理者情報（ネストされたオブジェクト） */
  admin: VenueAdmin;
  
  /** 最終アクティブ日時（ISO 8601形式） */
  lastActiveAt: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
  
  /** 会場カバー画像URL（ゲスト入口画面の背景に使われる） */
  coverImageUrl?: string;
  
  /** LINE連携による投稿制限解除機能の有効/無効 */
  enableLineUnlock?: boolean;
  
  /** Google MapsレビューURL（オプション） */
  googleMapsReviewUrl?: string;
  
  /** LINE公式アカウントURL（オプション） */
  lineOfficialAccountUrl?: string;
  
  /** 表示会場名（オプション、UI表示用） */
  displayVenueName?: string;
  
  /** 口コミ収集設定（新郎新婦向け、オプション） */
  coupleReviewUrl?: string;
  coupleReviewThreshold?: number;
  
  /** 口コミ収集設定（ゲスト向け、オプション） */
  guestReviewUrl?: string;
  guestReviewThreshold?: number;
}
```

---

## app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingSettingsForm.tsx

```tsx
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Edit, X } from "lucide-react";

/**
 * 挙式設定フォームの初期値型定義
 */
export interface WeddingSettings {
  /** ゲスト投稿の無制限モード（true: 無制限、false: 制限あり）デフォルト: true */
  unlimitedGuestUpload: boolean;
  
  /** ウェルカムメッセージ（全員向け） */
  welcomeMessage: string;
}

interface WeddingSettingsFormProps {
  /** 初期設定値 */
  initialSettings: WeddingSettings;
  
  /** プラン情報（LIGHTプランでは一部機能が制限される） */
  plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM';
  
  /** 挙式ID（API呼び出しに必要） */
  weddingId: string;
}

/**
 * 挙式設定フォームコンポーネント
 * 
 * インタラクティブな設定UIを提供し、バックエンドAPIにデータを保存します。
 */
export function WeddingSettingsForm({ initialSettings, plan = 'STANDARD', weddingId }: WeddingSettingsFormProps) {
  // LIGHTプランの場合、unlimitedGuestUploadを強制的にfalseとして初期化
  const normalizedInitialSettings: WeddingSettings = {
    ...initialSettings,
    unlimitedGuestUpload: plan === 'LIGHT' ? false : initialSettings.unlimitedGuestUpload,
  };
  
  // 内部状態の管理
  const [settings, setSettings] = useState<WeddingSettings>(normalizedInitialSettings);
  const [isMessageEditing, setIsMessageEditing] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [originalMessage, setOriginalMessage] = useState(initialSettings.welcomeMessage);
  const [isSaving, setIsSaving] = useState(false);
  
  const isLightPlan = plan === 'LIGHT';

  // 設定変更時のハンドラ（即座に保存）
  const handleUnlimitedGuestUploadChange = async (checked: boolean) => {
    // LIGHTプランの場合、強制的にfalseとして扱う（無制限モードは利用不可）
    const actualValue = isLightPlan ? false : checked;
    
    setSettings(prev => ({ ...prev, unlimitedGuestUpload: actualValue }));
    
    try {
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: actualValue, // LIGHTプランでは常にfalseを送信
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: 'ゲスト投稿の無制限モードを更新しました。',
      });
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
      // エラー時は元の値に戻す
      setSettings(prev => ({ ...prev, unlimitedGuestUpload: isLightPlan ? false : !checked }));
    }
  };

  const handleWelcomeMessageChange = (value: string) => {
    setSettings(prev => ({ ...prev, welcomeMessage: value }));
  };

  // 編集モード開始の確認
  const handleEditClick = () => {
    setShowEditConfirmDialog(true);
  };

  // 編集モード開始の確定
  const handleConfirmEdit = () => {
    setOriginalMessage(settings.welcomeMessage);
    setIsMessageEditing(true);
    setShowEditConfirmDialog(false);
  };

  // 編集のキャンセル
  const handleCancelEdit = () => {
    setSettings(prev => ({ ...prev, welcomeMessage: originalMessage }));
    setIsMessageEditing(false);
  };

  // 保存処理（API呼び出し）
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // LIGHTプランの場合、unlimitedGuestUploadを強制的にfalseとして送信
      const unlimitedGuestUploadValue = isLightPlan ? false : settings.unlimitedGuestUpload;
      
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: unlimitedGuestUploadValue,
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: '挙式設定が正常に更新されました。',
      });

      setIsMessageEditing(false);
      setOriginalMessage(settings.welcomeMessage);
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">基本設定</h2>
      
      <div className="space-y-6">
        {/* ゲスト投稿の無制限モード */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="unlimited-guest-upload" className="text-sm font-semibold text-gray-900">
                ゲスト投稿の無制限モード
              </Label>
              {isLightPlan && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isLightPlan 
                ? "Standardプラン以上で利用可能です（LINE連携）。"
                : "ゲストが写真を無制限にアップロードできるようにします。新郎新婦様のアップロードは常に無制限です。"
              }
            </p>
          </div>
          <div className="ml-4">
            <Switch
              id="unlimited-guest-upload"
              checked={isLightPlan ? false : settings.unlimitedGuestUpload}
              onCheckedChange={handleUnlimitedGuestUploadChange}
              disabled={isLightPlan}
            />
          </div>
        </div>

        {/* ウェルカムメッセージ */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="welcome-message" className="text-sm font-semibold text-gray-900">
              ウェルカムメッセージ
            </Label>
            {!isMessageEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="h-8 text-xs"
              >
                <Edit className="w-3 h-3 mr-1.5" />
                編集
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1.5" />
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            )}
          </div>
          <Textarea
            id="welcome-message"
            value={settings.welcomeMessage}
            onChange={(e) => handleWelcomeMessageChange(e.target.value)}
            disabled={!isMessageEditing}
            placeholder="ゲスト向けのウェルカムメッセージを入力してください..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2">
            このメッセージはゲスト向けギャラリーページの上部に表示されます。
          </p>
        </div>

        {/* 編集確認ダイアログ */}
        <Dialog open={showEditConfirmDialog} onOpenChange={setShowEditConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>メッセージを編集しますか？</DialogTitle>
              <DialogDescription className="pt-2">
                ウェルカムメッセージは本来、新郎新婦が作成するコンテンツです。プランナーが編集すると、新郎新婦が入力した内容が上書き・消失する可能性があります。本当に編集モードに切り替えますか？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditConfirmDialog(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConfirmEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                編集する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 設定プレビュー（開発用） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-mono text-gray-600 mb-2">設定プレビュー（開発用）:</p>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

## app/couple/page.tsx

```tsx
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { Users, Grid, ArrowRight, CheckCircle2, AlertCircle, QrCode, Copy, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PostWeddingThankYouCard } from '@/components/PostWeddingThankYouCard';
import { getWeddingInfo, getWeddingTables, getWeddingDate } from '@/lib/services/mock/weddingService';
import { getVenueInfo } from '@/lib/services/mock/venueService';

// アイコン (インラインSVG)
const Icons = {
  MessageSquareText: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  ImagePlus: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Eye: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// カウントダウン計算
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 日付フォーマット関数
function formatWeddingDate(date: Date): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

function CoupleHomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weddingId = searchParams.get('weddingId') || '1';
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [weddingInfo, setWeddingInfo] = useState<{ familyNames?: string } | null>(null);
  const [venueInfo, setVenueInfo] = useState<{ name: string } | null>(null);
  const [tables, setTables] = useState<Array<{ id: string; name: string; isCompleted: boolean }>>([]);
  const [daysUntil, setDaysUntil] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [previewTableQR, setPreviewTableQR] = useState<string | null>(null);
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
        const [wedding, weddingTables, date, venue] = await Promise.all([
          getWeddingInfo(weddingId),
          getWeddingTables(weddingId),
          getWeddingDate(weddingId),
          getVenueInfo('venue-standard'), // TODO: 実際のvenueIdを取得
        ]);
        setWeddingInfo(wedding);
        setWeddingDate(date);
        setTables(weddingTables.map(t => ({ id: t.id, name: t.name, isCompleted: t.isCompleted })));
        setDaysUntil(calculateDaysUntil(date));
        if (venue) {
          setVenueInfo({ name: venue.name });
        }
      } catch (error) {
        console.error('Failed to load wedding data:', error);
      }
    };
    loadData();
  }, [weddingId]);

  // 進捗計算
  const sharedCompleted = sharedPhotos.length > 0 || sharedMessage.length > 0;
  const tableCompletedCount = tables.filter(table => table.isCompleted).length;
  
  // 2ステップ方式の完了判定
  const step1Completed = sharedCompleted;
  const step2Completed = tableCompletedCount > 0;
  const allStepsCompleted = step1Completed && step2Completed;

  // 日付の更新
  useEffect(() => {
    if (!weddingDate) return;
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil(weddingDate));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // 全員への写真のハンドラー
  const handleSharedClick = () => {
    setCurrentSharedPhotos(sharedPhotos);
    setCurrentSharedMessage(sharedMessage);
    setIsSharedSheetOpen(true);
  };

  const handleSharedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCurrentSharedPhotos(prev => [...prev, ...files]);
  };

  const handleRemoveSharedPhoto = (index: number) => {
    setCurrentSharedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveShared = async () => {
    setIsUploading(true);
    
    // モック: 保存処理
    setTimeout(() => {
      setSharedPhotos(currentSharedPhotos);
      setSharedMessage(currentSharedMessage);
      setIsUploading(false);
      setIsSharedSheetOpen(false);
    }, 1500);
  };

  const handlePreview = (type: 'shared') => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  // 卓ごとの招待URL生成（モック）
  const getTableInvitationUrl = (tableId: string, tableName: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/guest/gallery?weddingId=${weddingId}&table=${tableId}`;
  };

  // 卓ごとのURLをコピーする関数
  const handleCopyTableUrl = async (tableId: string, tableName: string) => {
    try {
      const url = getTableInvitationUrl(tableId, tableName);
      await navigator.clipboard.writeText(url);
      toast.success(`${tableName}のURLをコピーしました`, {
        description: '席札に印刷できます',
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('コピーに失敗しました');
    }
  };

  // QRプレビューを閉じる
  const handleCloseQRPreview = () => {
    setPreviewTableQR(null);
  };

  // 全卓分を一括ダウンロード（モック）
  const handleDownloadAllQRs = () => {
    toast.success('QRコード一括ダウンロードを開始しました', {
      description: '全卓分のQRコードを含むZIPファイルを準備中です',
      duration: 3000,
    });
  };

  const coupleId = 1;

  // 挙式後の場合は、サンクスレターカードを表示
  if (isWeddingDayOrAfter) {
    return (
      <PostWeddingThankYouCard
        coupleId={coupleId}
        onReviewSubmit={async (rating, comment) => {
          // TODO: API経由でレビューを送信
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
        {/* ヘッダー情報 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 md:mb-6"
        >
          {venueInfo && (
            <p className="text-sm text-gray-500 mb-2">
              {venueInfo.name}
            </p>
          )}
          {weddingDate && (
            <p className="text-lg font-bold text-gray-900 mb-2">
              {formatWeddingDate(weddingDate)}
            </p>
          )}
          {daysUntil > 0 && (
            <p className="text-base text-gray-700">
              あと <span className="font-bold text-emerald-600">{daysUntil}</span> 日
            </p>
          )}
        </motion.div>

        {/* ゲストへ招待を送るセクション */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-4 md:mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  席札用QRコード・URL
                </h3>
                <p className="text-xs text-gray-600">
                  各卓ごとのQRコードを確認できます。席札への印刷などにご利用ください。
                </p>
              </div>
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
                className="flex-shrink-0 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              >
                表示する
              </Button>
            </div>
          </div>
        </motion.div>

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
                {/* 完了時の右端アイコン */}
                {step1Completed && (
                  <div className="absolute top-5 right-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-5 pr-20">
                  <div className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
                    step1Completed 
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-200" 
                      : "bg-emerald-50"
                  )}>
                    {step1Completed ? (
                      <Users className="w-8 h-8 text-emerald-700" />
                    ) : (
                      <Users className="w-8 h-8 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-full",
                        step1Completed
                          ? "text-emerald-800 bg-emerald-200"
                          : "text-emerald-700 bg-emerald-100"
                      )}>
                        STEP 1
                      </span>
                      {step1Completed ? (
                        <span className="text-xs font-bold text-emerald-700 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-300">
                          準備OK
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          未対応
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance">
                      プロフィール・挨拶設定
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      ゲスト全員に表示されるメッセージと写真を登録します
                    </p>
                  </div>
                </div>
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
                {/* 完了時の右端アイコン */}
                {step2Completed && (
                  <div className="absolute top-5 right-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-5 pr-20">
                  <div className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
                    step2Completed 
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-200" 
                      : "bg-emerald-50"
                  )}>
                    {step2Completed ? (
                      <Grid className="w-8 h-8 text-emerald-700" />
                    ) : (
                      <Grid className="w-8 h-8 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-full",
                        step2Completed
                          ? "text-emerald-800 bg-emerald-200"
                          : "text-emerald-700 bg-emerald-100"
                      )}>
                        STEP 2
                      </span>
                      {step2Completed ? (
                        <span className="text-xs font-bold text-emerald-700 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-300">
                          準備OK
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          未対応
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 text-balance">
                      ゲスト・卓設定
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2 md:mb-3">
                      テーブルごとに異なる思い出の写真を設定できます
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-semibold text-emerald-700 transition-colors border border-emerald-200">
                      <span>卓一覧を確認する</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* 全員への写真シート（下からスライドアップ） */}
      <Sheet open={isSharedSheetOpen} onOpenChange={setIsSharedSheetOpen}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tight">
              全員へのウェルカムフォト
            </SheetTitle>
            <SheetDescription>
              会場の全員が見ることができる写真とメッセージを登録します
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* メッセージ入力 */}
            <div>
              <label htmlFor="shared-message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icons.MessageSquareText className="w-4 h-4 text-gray-600" />
                メッセージ（任意）
              </label>
              <textarea
                id="shared-message"
                value={currentSharedMessage}
                onChange={(e) => setCurrentSharedMessage(e.target.value)}
                placeholder="みなさん、本日はお越しいただきありがとうございます！"
                rows={4}
                className={cn(
                  "w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900 placeholder:text-gray-400",
                  "resize-none"
                )}
              />
            </div>

            {/* 写真選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                写真を追加
              </label>
              
              <button
                type="button"
                onClick={() => sharedFileInputRef.current?.click()}
                className={cn(
                  "w-full h-14 rounded-xl font-semibold text-emerald-600 text-base",
                  "border-2 border-emerald-300 bg-emerald-50",
                  "hover:bg-emerald-100 hover:border-emerald-400",
                  "active:scale-95 transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                )}
              >
                <Icons.ImagePlus className="w-5 h-5" />
                写真を追加
              </button>
              
              <input
                ref={sharedFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSharedFileSelect}
                className="hidden"
              />

              {/* 選択された写真のプレビュー */}
              {currentSharedPhotos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {currentSharedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSharedPhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* プレビューボタン */}
            <button
              onClick={() => handlePreview('shared')}
              disabled={currentSharedPhotos.length === 0 && currentSharedMessage.length === 0}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-emerald-600 text-base",
                "border-2 border-emerald-300 bg-emerald-50",
                "hover:bg-emerald-100 hover:border-emerald-400",
                "active:scale-95 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              <Icons.Eye className="w-5 h-5" />
              ゲストの画面で確認する
            </button>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveShared}
              disabled={isUploading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white text-base",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "active:scale-95 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </span>
              ) : (
                '保存する'
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>プレビュー</DialogTitle>
            <DialogDescription>
              実際のゲスト画面での表示を確認できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {previewType === 'shared' && (
              <div className="space-y-4">
                {currentSharedMessage && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentSharedMessage}</p>
                  </div>
                )}
                {currentSharedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {currentSharedPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 席札用QRコード・URLダイアログ */}
      <Dialog open={showShareDialog} onOpenChange={(open) => {
        setShowShareDialog(open);
        if (!open) {
          setPreviewTableQR(null); // ダイアログを閉じる際にプレビューも閉じる
        }
      }}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>席札用QRコード・URL</DialogTitle>
            <DialogDescription>
              各卓ごとのQRコードを確認できます。席札への印刷などにご利用ください。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {/* QRプレビュー表示（選択された卓がある場合） */}
            {previewTableQR ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {tables.find(t => t.id === previewTableQR)?.name || '卓'}のQRコード
                  </h4>
                  <Button
                    onClick={handleCloseQRPreview}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-500 hover:text-gray-700"
                  >
                    <Icons.X className="w-4 h-4 mr-1" />
                    閉じる
                  </Button>
                </div>
                <div className="flex justify-center py-4 bg-gray-50 rounded-lg">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 break-all">
                    {getTableInvitationUrl(previewTableQR, tables.find(t => t.id === previewTableQR)?.name || '')}
                  </div>
                  <Button
                    onClick={() => handleCopyTableUrl(previewTableQR, tables.find(t => t.id === previewTableQR)?.name || '卓')}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    コピー
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* 卓リスト */}
                {tables.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">卓データがありません</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tables.map((table) => (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900">
                            {table.name}卓
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => setPreviewTableQR(table.id)}
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          >
                            <QrCode className="w-4 h-4 mr-1.5" />
                            表示
                          </Button>
                          <Button
                            onClick={() => handleCopyTableUrl(table.id, table.name)}
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Copy className="w-4 h-4 mr-1.5" />
                            URLコピー
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 一括ダウンロードボタン */}
                {tables.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleDownloadAllQRs}
                      variant="outline"
                      className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      全卓分を一括ダウンロード（ZIP）
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CoupleHomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    }>
      <CoupleHomePageContent />
    </Suspense>
  );
}
```

---

## components/PostWeddingThankYouCard.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Heart, Mail, ExternalLink, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';

interface PostWeddingThankYouCardProps {
  onReviewSubmit?: (rating: number, comment: string) => Promise<void>;
  albumPath?: string;
  externalReviewUrl?: string; // 口コミサイトURL（汎用的な設計）
  ratingThreshold?: number; // デフォルト: 4
  coupleId?: string | number; // localStorage用のID
}

export function PostWeddingThankYouCard({
  onReviewSubmit,
  albumPath = '/couple/gallery',
  externalReviewUrl = 'https://www.google.com/maps/search/?api=1&query=wedding+venue',
  ratingThreshold = 4,
  coupleId = 'default',
}: PostWeddingThankYouCardProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'feedback'>('rating');
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // 紙吹雪エフェクト（初回ロード時のみ）
  useEffect(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    // スムーズにフィードバックステップへ遷移
    setTimeout(() => {
      setStep('feedback');
    }, 400);
  };

  // localStorageのキー生成
  const getReviewStorageKey = () => `wedding_app_has_reviewed_${coupleId}`;

  // マウント時にレビュー済みかどうかをチェック
  useEffect(() => {
    const checkReviewStatus = () => {
      try {
        const reviewStorageKey = getReviewStorageKey();
        const hasReviewedInStorage = localStorage.getItem(reviewStorageKey) === 'true';
        if (hasReviewedInStorage) {
          setHasAlreadyReviewed(true);
        }
      } catch (error) {
        console.error('Error reading review status from localStorage:', error);
      }
    };

    checkReviewStatus();
  }, [coupleId]);

  // レビュー完了をlocalStorageに保存
  const markReviewAsCompleted = () => {
    try {
      localStorage.setItem(getReviewStorageKey(), 'true');
      setHasAlreadyReviewed(true);
    } catch (error) {
      console.error('Error saving review status to localStorage:', error);
    }
  };

  // Case A: 高評価（4-5つ星）→ 外部口コミサイトへ投稿
  const handleHighRatingSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. 外部口コミサイトを別タブで開く（性善説UX: ボタンクリック = 完了とみなす）
      if (externalReviewUrl) {
        window.open(externalReviewUrl, '_blank', 'noopener,noreferrer');
      }

      // 2. レビュー完了をlocalStorageに保存
      markReviewAsCompleted();

      // 3. トーストを表示
      toast.success('ご協力ありがとうございます！', {
        description: 'アルバムを開きます',
        duration: 2000,
      });

      // 4. アルバムページへ遷移（同時または直後）
      setTimeout(() => {
        router.push(albumPath);
      }, 300);
    } catch (error) {
      console.error('Error opening external review site:', error);
      toast.error('エラーが発生しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  // Case B: 低評価（1-3つ星）→ 内部フィードバック送信
  const handleLowRatingSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('ご意見を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. フィードバック送信（Mock）
      if (onReviewSubmit) {
        await onReviewSubmit(selectedRating!, feedback);
      } else {
        // デフォルトのMock処理
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. レビュー完了をlocalStorageに保存
      markReviewAsCompleted();

      // 3. トーストを表示
      toast.success('貴重なご意見をありがとうございます', {
        description: 'アルバムを開きます',
        duration: 2000,
      });

      // 4. アルバムページへ遷移
      setTimeout(() => {
        router.push(albumPath);
      }, 500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('送信に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  const isHighRating = selectedRating !== null && selectedRating >= ratingThreshold;
  const isLowRating = selectedRating !== null && selectedRating < ratingThreshold;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 背景: ブラーのかかった幸せな雰囲気の画像 */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
          alt="Wedding celebration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* ブラーオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/70 to-amber-50/80 backdrop-blur-sm" />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'w-full max-w-2xl',
            'bg-[#FAF9F6] rounded-3xl shadow-2xl',
            'p-8 md:p-12',
            'border border-gray-200/50'
          )}
        >
          {/* 装飾: 上部のゴールドラインとSparkles */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-t-3xl" />
          <div className="absolute top-6 right-6 opacity-40">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>

          {/* コンテンツエリア */}
          <div className="relative space-y-8 md:space-y-10">
            {/* 完了モード: レビュー済みの場合 */}
            {hasAlreadyReviewed ? (
              <div className="text-center space-y-8 md:space-y-10">
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-[#D4AF37]/20">
                    <Heart className="w-12 h-12 md:w-14 md:h-14 text-[#D4AF37] fill-[#D4AF37]" />
                  </div>
                  <div className="space-y-4">
                    <h2 className={cn(
                      'text-2xl md:text-3xl font-serif font-bold',
                      'text-gray-900 tracking-wide',
                      'leading-loose'
                    )}>
                      感想をお寄せいただき、ありがとうございました！
                    </h2>
                    <p className={cn(
                      'text-base md:text-lg text-gray-700',
                      'font-serif leading-relaxed'
                    )}>
                      お二人の末永い幸せをお祈り申し上げます。
                    </p>
                  </div>
                </div>

                {/* アルバムを見るボタン */}
                <Button
                  onClick={() => router.push(albumPath)}
                  className={cn(
                    'w-full h-14 md:h-16',
                    'bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37]',
                    'hover:from-amber-500 hover:via-[#D4AF37] hover:to-amber-500',
                    'text-white font-semibold text-base md:text-lg',
                    'transition-all duration-200 active:scale-95',
                    'shadow-lg hover:shadow-xl',
                    'rounded-xl',
                    'font-serif'
                  )}
                >
                  アルバムを見る
                </Button>
              </div>
            ) : (
              <>
                {/* ヘッダー: お祝いの言葉 */}
                <div className="text-center space-y-6">
                  <h1 className={cn(
                    'text-2xl md:text-3xl font-serif font-bold',
                    'text-[#D4AF37] tracking-wide',
                    'leading-loose'
                  )}>
                    この度は誠におめでとうございます。
                  </h1>
              
              <div className={cn(
                'space-y-4 text-gray-700',
                'text-base md:text-lg leading-loose',
                'font-serif'
              )}>
                <p>
                  最高の1日を、お手伝いできたことに感謝して。
                </p>
                <p>
                  お二人の大切な門出に立ち会えたこと、スタッフ一同心より嬉しく思います。
                </p>
              </div>

              <div className={cn(
                'pt-4 border-t border-gray-200/50',
                'text-gray-600 text-sm md:text-base leading-relaxed',
                'font-serif'
              )}>
                <p>
                  より多くのカップルに幸せを届けるために、お二人の率直な感想をお聞かせいただけませんか？
                </p>
              </div>
            </div>

            {/* STEP 1: 星評価 */}
            {step === 'rating' && (
              <div className="flex flex-col items-center space-y-4 py-4">
                <label className="text-sm text-gray-600 font-medium">
                  評価をお願いします
                </label>
                <div className="flex items-center gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isSelected = selectedRating !== null && selectedRating >= rating;
                    return (
                      <button
                        key={rating}
                        onClick={() => handleRatingSelect(rating)}
                        className={cn(
                          'transition-all duration-300 ease-out',
                          'active:scale-95',
                          isSelected
                            ? 'text-[#D4AF37] fill-[#D4AF37] scale-110 drop-shadow-md'
                            : 'text-gray-300 fill-gray-300 hover:scale-105 hover:text-gray-400'
                        )}
                        aria-label={`${rating}つ星`}
                      >
                        <Star className="w-10 h-10 md:w-12 md:h-12" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: 評価による分岐フロー */}
            <AnimatePresence>
              {step === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="space-y-8 md:space-y-10"
                >
                  {/* Case A: 高評価 (4-5つ星) */}
                  {isHighRating && (
                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                        <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-[#D4AF37]/20">
                          <Heart className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                          <p className={cn(
                            "text-base md:text-lg text-gray-700 leading-relaxed",
                            "font-serif"
                          )}>
                            温かい評価をありがとうございます！よろしければ、Googleマップにもご投稿いただけると励みになります。
                          </p>
                        </div>
                      </div>

                      {/* Primary Action: Googleマップへ投稿してアルバムを見る */}
                      <Button
                        onClick={handleHighRatingSubmit}
                        disabled={isSubmitting}
                        className={cn(
                          'w-full h-14 md:h-16',
                          'bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37]',
                          'hover:from-amber-500 hover:via-[#D4AF37] hover:to-amber-500',
                          'text-white font-semibold text-base md:text-lg',
                          'transition-all duration-200 active:scale-95',
                          'shadow-lg hover:shadow-xl',
                          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                          'rounded-xl',
                          'font-serif'
                        )}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            開いています...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2 md:gap-3">
                            口コミサイトへ投稿してアルバムを見る
                            <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
                          </span>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Case B: 低評価 (1-3つ星) */}
                  {isLowRating && (
                    <div className="space-y-8 md:space-y-10">
                      <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                        <div className="p-5 bg-white/60 backdrop-blur-sm rounded-full shadow-md border border-emerald-200/50">
                          <Mail className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                          <p className={cn(
                            "text-base md:text-lg text-gray-700 leading-relaxed",
                            "font-serif"
                          )}>
                            ご期待に添えず申し訳ありません。改善のため、気になった点を具体的にお聞かせください。
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        {/* フィードバック入力エリア */}
                        <div className="space-y-3">
                          <label htmlFor="feedback" className="block text-sm text-gray-600 font-medium">
                            ご意見・ご感想
                          </label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="気になった点や、改善してほしい点について..."
                            rows={8}
                            required
                            className={cn(
                              'resize-none transition-all duration-200',
                              'focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
                              'border-gray-300 rounded-xl',
                              'text-base md:text-lg leading-relaxed',
                              'p-4 md:p-6',
                              'bg-white/80 backdrop-blur-sm',
                              'font-serif',
                              'placeholder:text-gray-400'
                            )}
                          />
                        </div>

                        {/* Primary Action: ご意見を送ってアルバムを見る */}
                        <Button
                          onClick={handleLowRatingSubmit}
                          disabled={isSubmitting || !feedback.trim()}
                          className={cn(
                            'w-full h-14 md:h-16',
                            'bg-gradient-to-r from-emerald-500 to-teal-600',
                            'hover:from-emerald-600 hover:to-teal-700',
                            'text-white font-semibold text-base md:text-lg',
                            'transition-all duration-200 active:scale-95',
                            'shadow-lg hover:shadow-xl',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                            'rounded-xl',
                            'font-serif'
                          )}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-3">
                              <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              送信中...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2 md:gap-3">
                              ご意見を送ってアルバムを見る
                              <Send className="w-5 h-5 md:w-6 md:h-6" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## components/DownloadWaitModal.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface DownloadWaitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadStart: () => void;
  /** 待機時間（秒）デフォルト: 5秒 */
  waitTime?: number;
  /** 広告画像URL */
  adImageUrl?: string;
  /** 広告の遷移先URL */
  adTargetUrl?: string;
  /** 広告のキャッチコピー */
  adCatchCopy?: string;
}

/**
 * ダウンロード準備中の待機時間を活用した広告モーダル
 * 3〜5秒間の待機中に広告を表示し、カウントダウン後にダウンロードを開始
 */
export function DownloadWaitModal({
  open,
  onOpenChange,
  onDownloadStart,
  waitTime = 5,
  adImageUrl = 'https://via.placeholder.com/600x400?text=New+Life+Advertisement',
  adTargetUrl = 'https://example.com/ad',
  adCatchCopy = '新生活にお得な情報',
}: DownloadWaitModalProps) {
  const [countdown, setCountdown] = useState(waitTime);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      // モーダルが閉じられたときにリセット
      setCountdown(waitTime);
      setProgress(0);
      return;
    }

    // カウントダウン開始
    setCountdown(waitTime);
    setProgress(0);

    // プログレスバーを滑らかに更新（100msごと）
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (waitTime * 10); // 100msごとに更新
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 100);

    // カウントダウン（1秒ごと）
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          clearInterval(progressInterval);
          // ダウンロード開始（状態更新を次のイベントループで実行）
          setTimeout(() => {
            onDownloadStart();
            onOpenChange(false);
          }, 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [open, waitTime, onDownloadStart, onOpenChange]);

  const handleAdClick = () => {
    if (adTargetUrl) {
      window.open(adTargetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    // 明示的に閉じる処理
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto z-[150]">
        {/* 明示的な閉じるボタン（右上） */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute top-4 right-4 z-50",
            "p-2 rounded-full",
            "bg-white/90 hover:bg-white",
            "text-gray-600 hover:text-gray-900",
            "transition-all duration-200",
            "shadow-md hover:shadow-lg",
            "active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          )}
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900 font-serif flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            写真を準備しています...
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600 mt-2 font-serif">
            ダウンロード準備中です。しばらくお待ちください。
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* 広告バナー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer group"
            onClick={handleAdClick}
          >
            {/* Sponsoredバッジ */}
            <div className="absolute top-3 right-3 z-10">
              <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                <span className="text-xs text-white font-medium tracking-wide">
                  Sponsored
                </span>
              </div>
            </div>

            {/* 広告画像 */}
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={adImageUrl}
                alt="広告"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* オーバーレイ（ホバー時） */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>

            {/* キャッチコピー */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base text-white font-semibold font-serif">
                  {adCatchCopy}
                </p>
                <ExternalLink className="w-5 h-5 text-white/80 flex-shrink-0" />
              </div>
            </div>
          </motion.div>

          {/* プログレスバー */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-serif">
                ダウンロード開始まであと
              </span>
              <span className="text-emerald-600 font-bold font-serif">
                {countdown}秒...
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* フッターメッセージ */}
          <p className="text-center text-sm text-gray-500 font-serif">
            準備が完了すると自動的にダウンロードが始まります
          </p>

          {/* 閉じるボタン（下部にも追加） */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className={cn(
                "w-full py-3 px-4 rounded-lg",
                "bg-gray-100 hover:bg-gray-200",
                "text-gray-700 font-semibold text-sm",
                "transition-all duration-200",
                "active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              キャンセル
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## app/(guest)/guest/(entry)/page.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_VENUE_NAME } from '@/lib/constants/venues';

// ダミーデータ（実際はURLパラメータやAPIから取得）
const VENUE_NAME = DEFAULT_VENUE_NAME;
const WEDDINGS = [
  { id: 1, groom: '田中家', bride: '佐藤家', time: '11:00', passcode: '1111' },
  { id: 2, groom: '鈴木家', bride: '高橋家', time: '15:30', passcode: '1111' },
];

type Step = 'entrance' | 'gate';
type Wedding = typeof WEDDINGS[0];

export default function GuestPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('entrance');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shake, setShake] = useState(false);

  // パスコード入力ハンドラ
  const handleNumberPress = (num: string) => {
    if (passcode.length < 4 && !isUnlocking && !isUnlocked) {
      setPasscode((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isUnlocking && !isUnlocked) {
      setPasscode((prev) => prev.slice(0, -1));
    }
  };

  // パスコード検証
  useEffect(() => {
    if (passcode.length === 4 && selectedWedding && !isUnlocking && !isUnlocked) {
      setIsUnlocking(true);
      
      // 認証処理のシミュレーション
      setTimeout(() => {
        if (passcode === selectedWedding.passcode) {
          // 認証成功: 鍵が開くアニメーション
          setIsUnlocked(true);
          setTimeout(() => {
            // アンケートページへ直接遷移（Review Gatingフロー）
            router.push('/guest/survey');
          }, 1500);
        } else {
          // 認証失敗: シェイクアニメーション
          setIsUnlocking(false);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPasscode('');
          }, 600);
        }
      }, 500);
    }
  }, [passcode, selectedWedding, isUnlocking, isUnlocked]);


  // Step 1: Venue Entrance
  if (step === 'entrance') {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden">
        {/* 背景画像 */}
        <div className="fixed inset-0 z-0">
          <img
            src="https://picsum.photos/1000/1500?random=venue"
            alt={VENUE_NAME}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-20 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6 sm:space-y-8 pt-safe pb-safe">
            {/* ウェルカムメッセージ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="font-shippori text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 drop-shadow-2xl px-2">
                Welcome to {VENUE_NAME}
              </h1>
              <p className="text-stone-200/90 text-sm sm:text-base md:text-lg font-sans leading-relaxed drop-shadow-lg px-2">
                本日はご参列いただき、誠にありがとうございます。
              </p>
            </motion.div>

            {/* 説明カード（グラスモーフィズム） */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <p className="text-white/90 text-sm sm:text-base md:text-lg font-sans leading-relaxed text-center mb-4">
                お二人の特別な一日の写真を、皆様と共有するデジタルアルバムをご用意しました。
              </p>
              <p className="text-white/80 text-xs sm:text-sm md:text-base font-sans leading-relaxed text-center">
                ご参列の挙式を選択し、卓上のQRカードに記載された<strong className="font-bold text-white">4桁のパスコード</strong>を入力してご入場ください。
              </p>
            </motion.div>

            {/* 挙式リスト */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="space-y-3 sm:space-y-4"
            >
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-shippori font-semibold text-center mb-4 drop-shadow-lg">
                TODAY'S WEDDINGS
              </h2>
              {WEDDINGS.map((wedding) => (
                <motion.button
                  key={wedding.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedWedding(wedding);
                    setStep('gate');
                  }}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white/70 text-xs sm:text-sm font-sans mb-1">{wedding.time}〜</p>
                      <h3 className="text-white text-base sm:text-lg md:text-xl font-shippori font-semibold break-keep">
                        {wedding.groom}・{wedding.bride} 御両家 挙式
                      </h3>
                    </div>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white/90 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Secret Gate
  if (step === 'gate' && selectedWedding) {
    return (
      <div className="h-[100dvh] relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* コンテンツ - Flexboxで1画面完結 */}
        <div className="relative z-10 h-full flex flex-col justify-between items-center px-4 pt-safe pb-safe overflow-hidden">
          <div className="w-full max-w-md flex flex-col flex-1 justify-between min-h-0">
            {/* 上部エリア: 戻るボタン */}
            <div className="flex-shrink-0 pt-safe-top">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setStep('entrance');
                  setPasscode('');
                }}
                className="text-white/70 hover:text-white text-xs sm:text-sm font-sans flex items-center gap-2 py-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                挙式一覧に戻る
              </motion.button>
            </div>

            {/* 中央エリア: 鍵アイコン、メッセージ、パスコード表示 - Flexboxで均等配置 */}
            <div className="flex-1 flex flex-col justify-center items-center min-h-0 gap-2 sm:gap-3 md:gap-4">
              {/* 鍵アイコン */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex-shrink-0"
              >
                <motion.div
                  animate={shake ? {
                    x: [0, -30, 30, -30, 30, -15, 15, -8, 8, 0],
                  } : isUnlocked ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: shake ? 0.5 : 0.6,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 max-w-[80px] max-h-[80px] text-white/80"
                >
                  {isUnlocked ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </motion.div>
              </motion.div>

              {/* メッセージ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className="text-center flex-shrink-0 px-2"
              >
                <h2 className="font-shippori text-white text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 leading-tight">
                  {selectedWedding.groom}・{selectedWedding.bride} 御両家 挙式
                </h2>
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-sans leading-relaxed">
                  卓上のQRカードに記載された4桁の番号を入力してください
                </p>
              </motion.div>

              {/* パスコード表示 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                className="flex justify-center gap-2 sm:gap-3 flex-shrink-0"
              >
                {Array.from({ length: 4 }).map((_, index) => {
                  const isFilled = index < passcode.length;
                  return (
                    <motion.div
                      key={index}
                      animate={{
                        scale: isFilled ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: 'easeOut',
                      }}
                      className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                        isUnlocked
                          ? 'bg-green-500 border-green-500'
                          : isFilled
                          ? 'bg-white border-white'
                          : 'bg-transparent border-2 border-white/40'
                      }`}
                    />
                  );
                })}
              </motion.div>

              {/* ロック解除中のメッセージ */}
              {isUnlocking && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/70 text-xs sm:text-sm text-center font-sans flex-shrink-0"
                >
                  ロック解除中...
                </motion.p>
              )}
            </div>

            {/* 下部エリア: テンキーパッド */}
            {!isUnlocking && !isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                className="flex-shrink-0 pb-safe-bottom"
              >
                <div className="max-w-xs mx-auto w-full">
                  {/* 数字キー 1-9 */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <motion.button
                        key={num}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleNumberPress(num.toString())}
                        disabled={passcode.length >= 4}
                        className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg sm:text-xl md:text-2xl font-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation hover:bg-white/20 active:bg-white/30"
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  {/* 下部行: 空、0、削除 */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div></div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleNumberPress('0')}
                      disabled={passcode.length >= 4}
                      className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg sm:text-xl md:text-2xl font-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation hover:bg-white/20 active:bg-white/30"
                    >
                      0
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleDelete}
                      disabled={passcode.length === 0}
                      className="w-full max-w-[80px] mx-auto aspect-square rounded-full bg-transparent text-white/70 text-xs sm:text-sm md:text-base font-normal flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation hover:text-white active:opacity-100"
                    >
                      削除
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Dashboard
  if (step === 'dashboard' && selectedWedding) {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden bg-stone-50">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-8 sm:mb-12 md:mb-16 pt-safe-top"
          >
            <h1 className="font-shippori text-stone-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Welcome to {selectedWedding.groom} & {selectedWedding.bride}'s Wedding
            </h1>
            <p className="text-stone-600 text-sm sm:text-base md:text-lg font-sans">
              本日はご参列いただき、誠にありがとうございます
            </p>
          </motion.div>

          {/* メニューカード */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8"
          >
            {/* Gallery カード */}
            <motion.div
              onClick={() => router.push('/guest/gallery')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block relative h-full bg-white/60 backdrop-blur-xl border-2 border-stone-200/50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-stone-200/80 via-stone-100/80 to-stone-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="mb-6 sm:mb-8 flex items-center justify-start">
                <motion.div
                  className="text-stone-800 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-shippori font-semibold text-stone-800 mb-3 sm:mb-4">
                📸 GALLERY
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-sans leading-relaxed mb-6">
                結婚式の写真を閲覧・保存できます
              </p>
              <div className="flex items-center gap-2 text-stone-700 font-sans">
                <span className="text-sm sm:text-base">詳細を見る</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>

            {/* Message カード */}
            <motion.div
              onClick={() => router.push('/guest/survey')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block relative h-full bg-white/60 backdrop-blur-xl border-2 border-stone-200/50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/80 via-amber-100/80 to-amber-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="mb-6 sm:mb-8 flex items-center justify-start">
                <motion.div
                  className="text-amber-900 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-shippori font-semibold text-amber-900 mb-3 sm:mb-4">
                ✉️ MESSAGE
              </h2>
              <p className="text-stone-600 text-base sm:text-lg font-sans leading-relaxed mb-6">
                ご感想をお聞かせください
              </p>
              <div className="flex items-center gap-2 text-stone-700 font-sans">
                <span className="text-sm sm:text-base">詳細を見る</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* ログアウトボタン */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            onClick={handleLogout}
            className="mt-8 sm:mt-12 text-stone-500 hover:text-stone-700 text-sm sm:text-base font-sans flex items-center gap-2 pb-safe-bottom transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ログアウト</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}
```

---

## app/(guest)/guest/(onboarding)/survey/page.tsx

```tsx
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Send, Sparkles, Heart, Lock, Unlock, Key, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
// @ts-ignore - canvas-confetti型定義
import confetti from 'canvas-confetti';

// ============================================================================
// レビュー設定（会場ごとに変更可能）
// 将来的にバックエンド（Venue設定）から取得する想定
// ============================================================================
const REVIEW_CONFIG = {
  /** レビュー投稿先URL（管理画面で登録されたURL） */
  url: 'https://maps.google.com/?q=表参道テラス', // TODO: 実際のレビュー投稿URLに置き換え
  /** 外部誘導する最低星数（この値以上なら外部誘導、未満なら内部フィードバック） */
  minRatingForExternal: 4, // 4以上なら外部、3以下なら内部
} as const;

// ============================================================================
// LocalStorage管理
// ============================================================================
const getReviewStorageKey = (guestId?: string) => {
  return `wedding_app_review_completed_${guestId || 'default'}`;
};

type Step = 'locked' | 'rating' | 'action' | 'unlocking' | 'redirecting';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table') || '';
  const guestId = searchParams.get('guestId') || undefined; // ゲストID（オプション）
  
  const [step, setStep] = useState<Step>('locked');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // 評価が高い場合（設定値以上）は外部誘導あり、低い場合（設定値未満）は内部フィードバックのみ
  const isHighRating = rating >= REVIEW_CONFIG.minRatingForExternal;

  // レビュー完了状態をLocalStorageに保存
  const markReviewCompleted = () => {
    try {
      const storageKey = getReviewStorageKey(guestId);
      localStorage.setItem(storageKey, 'true');
      // レビュー情報も保存（オプション）
      localStorage.setItem(`${storageKey}_data`, JSON.stringify({
        rating,
        feedbackText,
        completedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save review status:', error);
    }
  };

  // 紙吹雪エフェクトを発火
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // 左側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'], // emerald, teal, gold, coral, white
      });
      
      // 右側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#f1ce88', '#ff9980', '#ffffff'],
      });
    }, 250);
  };

  // ロック解除演出を表示（解除アクション実行後）
  const showUnlockAnimation = () => {
    setStep('unlocking');
    
    // レビュー完了状態を保存
    markReviewCompleted();
    
    // 紙吹雪エフェクトを発火
    triggerConfetti();
  };

  // 初期状態：ロックされた鍵アイコンを表示
  useEffect(() => {
    // 少し遅延してから分岐（ロック状態を一瞬表示して演出を維持）
    const timer = setTimeout(() => {
      // localStorageチェック
      const storageKey = getReviewStorageKey(guestId);
      const isCompleted = localStorage.getItem(storageKey) === 'true';

      if (isCompleted) {
        // 完了済みなら、評価をスキップして「解錠アニメーション」へ
        // ※紙吹雪も発火させてより良い体験を提供
        setStep('unlocking');
        triggerConfetti();
        // 注意: markReviewCompleted() は既に完了済みなので呼ばない
      } else {
        // 未完了なら、評価画面へ
        setStep('rating');
      }
    }, 1000); // 1秒間は必ずロック画面を見せる（演出）

    return () => clearTimeout(timer);
  }, [guestId]);

  const handleStarClick = (value: number) => {
    setRating(value);
    // 星をクリックした瞬間にアクションステップへ遷移
    setTimeout(() => {
      setStep('action');
    }, 300);
  };

  // 外部レビューサイトへの誘導（高評価の場合）
  const handleExternalReviewClick = () => {
    // 外部サイトを開く
    window.open(REVIEW_CONFIG.url, '_blank', 'noopener,noreferrer');
    
    toast.success('ありがとうございます！', {
      description: 'レビューサイトで口コミを投稿していただけると幸いです',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示（URLを開いた瞬間に解除）
    showUnlockAnimation();
  };

  // フィードバック送信（低評価の場合）
  const handleFeedbackSubmit = () => {
    // 将来的にDBに保存する処理をここに追加
    // TODO: API呼び出しでフィードバックを保存
    // TODO: API経由でフィードバックを送信
    
    toast.success('ご意見ありがとうございます', {
      description: '貴重なご意見をいただき、ありがとうございます',
      duration: 3000,
    });
    
    // 即座にロック解除演出を表示
    showUnlockAnimation();
  };

  // ギャラリーへ進むボタン（ロック解除後のみ表示）
  const handleGoToGallery = () => {
    setStep('redirecting');
    setTimeout(() => {
      router.push(`/guest/gallery${tableId ? `?table=${tableId}` : ''}`);
    }, 500);
  };

  return (
    <div className="min-h-dvh relative flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50">
      {/* 背景装飾: 優しいグラデーションのオーバーレイ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200/50 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 0: 初期状態 - ロックされた鍵アイコン */}
            {step === 'locked' && (
              <motion.div
                key="locked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg">
                    <Lock className="w-12 h-12 text-emerald-600" />
                  </div>
                </motion.div>
                <p className="text-base sm:text-lg text-gray-600 font-serif">
                  レビューを完了すると、ギャラリーが開きます
                </p>
              </motion.div>
            )}

            {/* Step 1: 評価 ('rating') */}
            {step === 'rating' && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* ヘッダー */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                    <h1 className="font-serif text-emerald-800 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                      Thank You!
                    </h1>
                    <Heart className="w-6 h-6 text-emerald-500" fill="currentColor" />
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed">
                    本日はお越しいただき、ありがとうございました
                    <br />
                    お時間のあるときに、ご感想をお聞かせください
                  </p>
                </motion.div>

                {/* 星評価 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex justify-center items-center gap-2 sm:gap-3 py-6"
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isActive = rating >= value || hoveredStar >= value;
                    return (
                      <motion.button
                        key={value}
                        onClick={() => handleStarClick(value)}
                        onMouseEnter={() => setHoveredStar(value)}
                        onMouseLeave={() => setHoveredStar(0)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "transition-all duration-200",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-full p-1"
                        )}
                        aria-label={`${value}つ星`}
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-all duration-200",
                            isActive
                              ? "text-emerald-500 fill-emerald-500"
                              : "text-gray-300 fill-gray-100"
                          )}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* ヒントテキスト */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-sm text-gray-500 font-serif"
                >
                  星をタップして評価してください
                </motion.p>
              </motion.div>
            )}

            {/* Step 2: アクション ('action') - ロック解除アクションを実行 */}
            {step === 'action' && (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6 sm:space-y-8"
              >
                {/* 高評価（設定値以上）の場合 - 外部レビューサイト誘導 */}
                {isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        素晴らしい評価をありがとうございます！
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        よろしければレビューサイトにも思い出を投稿していただけませんか？
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* ロック解除アクションボタン（高評価） */}
                      <motion.button
                        onClick={handleExternalReviewClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        )}
                      >
                        <ExternalLink className="w-6 h-6" />
                        <span>口コミを投稿してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}

                {/* 低評価（設定値未満）の場合 - フィードバック入力 */}
                {!isHighRating && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-emerald-600" />
                        </div>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 font-serif">
                        貴重なご意見ありがとうございます
                      </h2>
                      <p className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed px-2">
                        新郎新婦へのメッセージがあればご記入ください
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-4"
                    >
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="ご意見・ご感想をご記入ください（任意）"
                        rows={5}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-emerald-50/50 border-2 border-emerald-200",
                          "text-gray-800 font-serif text-sm sm:text-base",
                          "placeholder:text-gray-400",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                          "resize-none transition-all duration-200"
                        )}
                      />

                      {/* ロック解除アクションボタン（低評価） */}
                      <motion.button
                        onClick={handleFeedbackSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                          "hover:from-emerald-600 hover:to-teal-700",
                          "text-white font-serif text-lg sm:text-xl font-semibold",
                          "py-5 sm:py-6 px-8 rounded-2xl",
                          "shadow-lg hover:shadow-xl",
                          "transition-all duration-200",
                          "flex items-center justify-center gap-3",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Send className="w-5 h-5" />
                        <span>メッセージを送信してロック解除</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: ロック解除演出 ('unlocking') - ここで初めて「ギャラリーへ進む」ボタンを表示 */}
            {step === 'unlocking' && (
              <motion.div
                key="unlocking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-8"
              >
                {/* 鍵アイコン（ロック状態 → アンロック状態） */}
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0, 0] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Lock className="w-20 h-20 text-gray-400" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1], scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <div className="relative">
                        <Unlock className="w-20 h-20 text-emerald-500" />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Key className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* メッセージ */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 font-serif">
                    ギャラリーの鍵が開きました！
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 font-serif">
                    ありがとうございます。思い出の写真をご覧いただけます
                  </p>
                </motion.div>

                {/* パーティクルエフェクト（視覚的な演出） */}
                <motion.div
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 0.8],
                        y: [0, -20],
                      }}
                      transition={{
                        delay: 0.8 + i * 0.1,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className="w-3 h-3 rounded-full bg-emerald-400"
                    />
                  ))}
                </motion.div>

                {/* ギャラリーへ進むボタン（ロック解除後に初めて表示） */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="pt-4"
                >
                  <motion.button
                    onClick={handleGoToGallery}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full bg-gradient-to-r from-emerald-500 to-teal-600",
                      "hover:from-emerald-600 hover:to-teal-700",
                      "text-white font-serif text-lg sm:text-xl font-semibold",
                      "py-5 sm:py-6 px-8 rounded-2xl",
                      "shadow-lg hover:shadow-xl",
                      "transition-all duration-200",
                      "flex items-center justify-center gap-3",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>ギャラリーへ進む</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: リダイレクト ('redirecting') */}
            {step === 'redirecting' && (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-6"
              >
                <motion.div
                  className="flex justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-emerald-800 text-lg sm:text-xl font-semibold"
                >
                  ギャラリーへ移動します
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 font-serif"
                >
                  しばらくお待ちください...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-emerald-700 font-serif">読み込み中...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
```

---

## app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingDetailClient.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Wedding } from "@/lib/types/schema";
import { getVenueInfo } from "@/lib/services/mock/venueService";
import { getPhotosByWedding } from '@/lib/services/mock/photoService';
import { getFeedbacks } from '@/lib/services/mock/guestService';
import { FeedbackTab, type Feedback } from "./FeedbackTab";
import { WeddingSettingsForm, type WeddingSettings } from "./WeddingSettingsForm";
import { WeddingTablesTab } from "./WeddingTablesTab";
import { ArrowLeft, Calendar, Building2, Users, Lock, Unlock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WeddingDetailClientProps {
  wedding: Wedding;
  venueId: string;
}

type TabType = 'settings' | 'tables' | 'photos' | 'feedback';

/**
 * 挙式詳細ページのクライアントコンポーネント
 * 
 * Server Componentから渡されたデータを表示し、インタラクティブなUIを提供
 */
export function WeddingDetailClient({ wedding, venueId }: WeddingDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [venueInfo, setVenueInfo] = useState<{ name: string; plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' } | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // 会場情報の取得
  useEffect(() => {
    const loadVenueInfo = async () => {
      const venue = await getVenueInfo(venueId);
      if (venue) {
        setVenueInfo({ name: venue.name, plan: venue.plan });
      }
    };
    loadVenueInfo();
  }, [venueId]);

  // 写真データの読み込み
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photoData = await getPhotosByWedding(wedding.id);
        setPhotos(photoData);
      } catch (error) {
        console.error('Failed to load photos:', error);
      }
    };
    loadPhotos();
  }, [wedding.id]);

  // フィードバックデータの読み込み
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const feedbackData = await getFeedbacks(wedding.id);
        const convertedFeedbacks: Feedback[] = feedbackData.map(f => ({
          id: f.id,
          content: f.content,
          rating: f.rating,
          source: f.source,
          createdAt: f.createdAt,
        }));
        setFeedbacks(convertedFeedbacks);
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      }
    };
    loadFeedbacks();
  }, [wedding.id]);

  // 日付・時間をフォーマット
  const formatDateTime = (dateString: string, timeString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${timeString}`;
  };

  // 新郎新婦としてログイン（プレビュー）
  const handleProxyLogin = () => {
    window.open(`/couple?weddingId=${wedding.id}`, '_blank', 'noopener,noreferrer');
    toast.success('新郎新婦画面を開きました', {
      description: '別タブで表示を確認できます',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* ヘッダー情報カード */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border-none shadow-lg p-6">
            {/* 戻るボタンとアクションボタン */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href={`/dashboard/${venueId}/weddings`}
                className="inline-flex items-center gap-2 text-sm text-white hover:bg-white/20 rounded-md px-2 py-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                挙式一覧に戻る
              </Link>
              <Button
                onClick={handleProxyLogin}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                新郎新婦としてログイン
              </Button>
            </div>
            
            {/* 新郎新婦名 */}
            <div className="mb-6 pb-6 border-b border-white/20">
              <h1 className="text-3xl font-bold text-white leading-relaxed">
                {wedding.familyNames}
              </h1>
            </div>
            
            {/* メタ情報エリア */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* 挙式日時 */}
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">挙式日時</p>
                  <p className="text-sm font-semibold text-white">{formatDateTime(wedding.date, wedding.time)}</p>
                </div>
              </div>
              
              {/* 会場名 */}
              {wedding.hall && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-emerald-100 mb-0.5">会場名</p>
                    <p className="text-sm font-semibold text-white">{wedding.hall}</p>
                  </div>
                </div>
              )}
              
              {/* ゲスト数 */}
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ゲスト数</p>
                  <p className="text-sm font-semibold text-white">{wedding.guestCount || 0}名</p>
                </div>
              </div>
              
              {/* ステータス */}
              <div className="flex items-start gap-2">
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ステータス</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 ${
                    wedding.isLocked ? "" : ""
                  }`}>
                    {wedding.isLocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        確定
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        準備中
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 会場情報 */}
            <div className="text-xs text-white/70 border-t border-white/20 pt-4">
              会場: {venueInfo?.name || venueId} ({venueId})
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex gap-2 border-b border-emerald-100">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'settings'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                基本情報
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'tables'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                卓設定
                {activeTab === 'tables' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'photos'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                写真
                {activeTab === 'photos' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'feedback'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                フィードバック
                {feedbacks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                    {feedbacks.length}
                  </span>
                )}
                {activeTab === 'feedback' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* 基本情報セクション */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">新郎新婦名</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.familyNames}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">挙式日時</p>
                      <p className="text-base font-semibold text-gray-900">{formatDateTime(wedding.date, wedding.time)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">会場</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.hall || '未設定'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">ゲスト数</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.guestCount || 0}名</p>
                    </div>
                  </div>
                </div>

                {/* 設定フォームセクション */}
                <div className="border-t border-gray-200 pt-6">
                  <WeddingSettingsForm
                    initialSettings={{
                      unlimitedGuestUpload: true, // デフォルト: 無制限モードON
                      welcomeMessage: wedding.familyNames ? `${wedding.familyNames}の結婚式へようこそ！` : 'ようこそ！',
                    }}
                    plan={venueInfo?.plan}
                    weddingId={wedding.id}
                  />
                </div>
              </div>
            )}

            {activeTab === 'tables' && (
              <WeddingTablesTab weddingId={wedding.id} />
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">写真</h2>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={photo.url}
                          alt={photo.alt || '写真'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                    <p className="text-gray-500">写真はまだありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <FeedbackTab feedbacks={feedbacks} weddingId={Number(wedding.id)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## app/couple/tables/page.tsx

```tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { PostWeddingThankYouCard } from '@/components/PostWeddingThankYouCard';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/services/api';
import type { Table } from '@/lib/types/schema';
import { getWeddingDate } from '@/lib/services/mock/weddingService';

// アイコン (インラインSVG)
const Icons = {
  ImagePlus: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  MessageSquareText: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  PenLine: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Circle: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  Eye: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ImageOff: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M10.5 10.5L7 7l-3 3v8a2 2 0 0 0 2 2h12l-3-3"/>
      <path d="M14 14l-4-4-4 4"/>
      <path d="M17 17l-3-3 3-3"/>
      <path d="M21 15V7a2 2 0 0 0-2-2H9l4 4h8z"/>
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Images: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
};

// モックデータ（挙式日のみ）
const MOCK_WEDDING_ID = '1'; // TODO: 認証情報から取得

// モックデータ（初期データ、APIから取得する想定）
const INITIAL_TABLES: Table[] = [
  // 1. 写真あり・完了状態 (A卓)
  {
    id: 'table-a',
    name: 'A',
    message: 'みんな久しぶり！今日は楽しんでいってね！',
    photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop',
    isSkipped: false,
    isCompleted: true,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 2. 写真なし・完了状態 (B卓 - スキップ済み)
  {
    id: 'table-b',
    name: 'B卓 (親族)',
    message: '',
    photoUrl: null,
    isSkipped: true,
    isCompleted: true,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 3. 未完了状態 (C卓)
  {
    id: 'table-c',
    name: 'C卓',
    message: '',
    photoUrl: null,
    isSkipped: false,
    isCompleted: false,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 4. 写真あり・完了状態 (D卓)
  {
    id: 'table-d',
    name: 'D',
    message: 'いつもありがとう！',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1949&auto=format&fit=crop',
    isSkipped: false,
    isCompleted: true,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 5. 写真なし・完了状態 (E卓 - スキップ済み)
  {
    id: 'table-e',
    name: 'E',
    message: '',
    photoUrl: null,
    isSkipped: true,
    isCompleted: true,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 6. 未完了状態 (F卓)
  {
    id: 'table-f',
    name: 'F',
    message: '',
    photoUrl: null,
    isSkipped: false,
    isCompleted: false,
    weddingId: MOCK_WEDDING_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// カウントダウン計算
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export default function CoupleTablesPage() {
  const router = useRouter();
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [daysUntil, setDaysUntil] = useState(0);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [isLoading, setIsLoading] = useState(false);
  
  // 式前/式後の判定（当日以降は式後とみなす）
  const isWeddingDayOrAfter = daysUntil === 0 || daysUntil < 0;
  
  // 挙式日の読み込み
  useEffect(() => {
    const loadWeddingDate = async () => {
      try {
        const date = await getWeddingDate(MOCK_WEDDING_ID);
        setWeddingDate(date);
        setDaysUntil(calculateDaysUntil(date));
      } catch (error) {
        console.error('Failed to load wedding date:', error);
        // フォールバック: 今日の日付を使用
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setWeddingDate(today);
        setDaysUntil(calculateDaysUntil(today));
      }
    };
    loadWeddingDate();
  }, []);
  
  // 卓ごとの設定の状態
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isTableSheetOpen, setIsTableSheetOpen] = useState(false);
  const [currentTableName, setCurrentTableName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState<File | null>(null); // アップロード前の一時的なファイル（1枚のみ）
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null); // アップロード済みの写真URL
  
  // 共通の状態
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'table' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // コンプライアンスチェック関連
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 1枚のみ
  const [hasAgreedToCompliance, setHasAgreedToCompliance] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // プレビューURLのクリーンアップ（モーダルが閉じられたとき）
  useEffect(() => {
    if (!showComplianceModal && previewUrl) {
      // モーダルが閉じられたときにプレビューURLをクリーンアップ
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComplianceModal]);

  // 初期データの取得（実際の実装ではAPIから取得）
  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true);
      try {
        // TODO: 実際のweddingIdを取得（認証情報から）
        const fetchedTables = await api.getTables(MOCK_WEDDING_ID);
        setTables(fetchedTables);
      } catch (error) {
        console.error('Failed to load tables:', error);
        toast.error('卓情報の取得に失敗しました', {
          description: 'もう一度お試しください',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // 初期データはINITIAL_TABLESを使用（開発用）
    // 本番環境では loadTables() を呼び出す
    // loadTables();
  }, []);

  // 日付の更新
  useEffect(() => {
    if (!weddingDate) return;
    const interval = setInterval(() => {
      setDaysUntil(calculateDaysUntil(weddingDate));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // 卓ごとの設定のハンドラー
  const handleTableClick = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(tableId);
      setCurrentTableName(table.name);
      setCurrentMessage(table.message);
      setCurrentPhotoUrl(table.photoUrl);
      setCurrentPhoto(null); // 編集時は空にリセット
      setIsTableSheetOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 最初の1枚のみを選択（単一選択）
    const file = files[0];
    setSelectedFile(file);
    
    // プレビューURLを生成（既存のURLがあればクリーンアップ）
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    setShowComplianceModal(true);
    setHasAgreedToCompliance(false); // リセット
    // ファイル入力のリセット（モーダル内で確認後、アップロード実行）
    e.target.value = '';
  };
  
  // コンプライアンスチェック後の写真設定処理（既存を置換）
  const handlePhotoUploadAfterCompliance = async () => {
    if (!selectedFile) return;

    if (!hasAgreedToCompliance) {
      toast.error('投稿前に約束に同意してください', {
        description: 'マナーチェックボックスにチェックを入れてください',
        duration: 3000,
      });
      return;
    }

    // ファイルをcurrentPhotoに設定（既存を置換）
    setCurrentPhoto(selectedFile);
    
    // コンプライアンスチェックモーダルを閉じる
    setShowComplianceModal(false);
    setSelectedFile(null);
    setHasAgreedToCompliance(false);
    
    toast.success('写真を設定しました', {
      description: '保存ボタンを押して設定を保存してください',
      duration: 3000,
    });
  };

  const handleRemovePhoto = () => {
    // 既存のプレビューURLがあればクリーンアップ
    if (currentPhoto && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCurrentPhoto(null);
    setPreviewUrl(null);
  };

  const handleSaveTable = async () => {
    if (!selectedTable) return;
    
    setIsUploading(true);
    
    try {
      // 写真が選択されている場合、アップロード処理
      let photoUrl = currentPhotoUrl;
      
      if (currentPhoto) {
        // TODO: 実際のuserIdを取得（認証情報から）
        const userId = 'couple-1';
        
        // 選択された写真をアップロード（卓用の写真は1枚）
        const uploadedPhoto = await api.uploadPhoto(
          currentPhoto,
          MOCK_WEDDING_ID,
          selectedTable,
          userId
        );
        photoUrl = uploadedPhoto.url;
      }
      
      // 卓情報を更新
      const updatedTable = await api.updateTable(selectedTable, {
        name: currentTableName,
        message: currentMessage,
        photoUrl: photoUrl,
        isSkipped: false,
        isCompleted: true, // メッセージまたは写真が設定されたら完了
      });
      
      // ローカル状態を更新
      setTables(prev => prev.map(table => 
        table.id === selectedTable ? updatedTable : table
      ));
      
      setIsUploading(false);
      setIsTableSheetOpen(false);
      setCurrentPhoto(null); // リセット
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      toast.success('設定を保存しました', {
        description: 'ゲストに公開されます',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to save table:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
      });
      setIsUploading(false);
    }
  };

  const handleSkipTable = async () => {
    if (!selectedTable) return;
    
    setIsUploading(true);
    
    try {
      // 卓をスキップ
      const updatedTable = await api.skipTable(selectedTable);
      
      // ローカル状態を更新
      setTables(prev => prev.map(table => 
        table.id === selectedTable ? updatedTable : table
      ));
      
      setIsUploading(false);
      setIsTableSheetOpen(false);
      
      toast.success('共通写真を使用する設定にしました', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to skip table:', error);
      toast.error('設定の更新に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
      });
      setIsUploading(false);
    }
  };

  const handlePreview = (type: 'table') => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  // 進捗計算（APIから取得したデータに基づく）
  const completedTables = tables.filter(table => 
    table.isCompleted === true || table.isSkipped === true
  ).length;
  const totalTables = tables.length;
  const progressPercentage = totalTables > 0 ? (completedTables / totalTables) * 100 : 0;

  const coupleId = 1;

  // 挙式後の場合は、サンクスレターカードを表示
  if (isWeddingDayOrAfter) {
    return (
      <PostWeddingThankYouCard
        coupleId={coupleId}
        onReviewSubmit={async (rating, comment) => {
          // TODO: API経由でレビューを送信
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
        {/* 戻るボタン */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-2"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/couple')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            戻る
          </Button>
        </motion.div>

        {/* ヘッダー */}
        <section>
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 tracking-tight text-balance">
              卓ごとのサプライズ 📸
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              ゲストが席に着いた瞬間、懐かしい写真でお出迎え！あの頃の思い出や、みんなにしか通じない「内輪ネタ」を仕込んで、乾杯前から盛り上げちゃおう🎉
            </p>
          </div>
        </section>

        {/* 卓一覧: 詳細グリッド */}
        <section>
          {/* 進捗状況 */}
          <div className="mb-4 md:mb-6 bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-sm font-semibold text-gray-700">完了状況</span>
              <span className="text-base md:text-lg font-bold text-emerald-600">
                {completedTables} / {totalTables} 卓
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  "h-full rounded-full",
                  progressPercentage === 100 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                )}
              />
            </div>
          </div>

          <div className="mb-3 md:mb-4">
            <p className="text-sm text-gray-600 leading-relaxed mb-3 md:mb-4">
              編集したいテーブルをタップしてね 👇
            </p>
          </div>

          {/* アルバムカバー風グリッド */}
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => {
              // 状態判定: 優先順位で判定
              const hasPhotoUrl = table.photoUrl !== null && table.photoUrl !== undefined && table.photoUrl !== '';
              const isSkipped = table.isSkipped === true;
              const isCompleted = table.isCompleted === true || isSkipped || hasPhotoUrl;
              
              // パターン1: 写真あり・完了 (Done) ✨
              const pattern1 = hasPhotoUrl && isCompleted;
              // パターン2: 未登録 (ToDo) 🎨
              const pattern2 = !hasPhotoUrl && !isSkipped && !isCompleted;
              // パターン3: 登録しない/スキップ (Skipped) ⏭️
              const pattern3 = !hasPhotoUrl && isSkipped && isCompleted;

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden transition-all duration-200 active:scale-95",
                    "shadow-sm hover:shadow-md",
                    // パターン2: 未登録の場合は太めの破線枠（目立たせる）
                    pattern2 && "bg-white border-4 border-dashed border-emerald-400 ring-2 ring-emerald-200",
                    // パターン3: スキップ済みの場合は薄いグレー背景
                    pattern3 && "bg-gray-100",
                    // パターン1: 完了済みは少し薄く（未完了を目立たせるため）
                    pattern1 && "opacity-90"
                  )}
                >
                  {/* パターン1: 写真あり・完了 - 背景に写真を表示 */}
                  {pattern1 && table.photoUrl && (
                    <>
                      <img
                        src={table.photoUrl}
                        alt={`${table.name}卓の写真`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </>
                  )}

                  {/* パターン2: 未登録 - 白背景、中央に大きな＋アイコン */}
                  {pattern2 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icons.Plus className="w-20 h-20 text-emerald-500" />
                    </div>
                  )}

                  {/* パターン3: スキップ済み - 薄いグレー背景、中央に共通写真アイコン */}
                  {pattern3 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Icons.Images className="w-16 h-16 text-gray-400 mb-2" />
                    </div>
                  )}

                  {/* ステータスバッジ: 右上 */}
                  <div className="absolute top-3 right-3 z-10">
                    {pattern1 ? (
                      // パターン1: 緑のチェックマーク
                      <div className="bg-emerald-500 rounded-full p-1.5 drop-shadow-lg flex items-center justify-center">
                        <Icons.Check className="w-4 h-4 text-white" />
                      </div>
                    ) : pattern3 ? (
                      // パターン3: 「共通写真」バッジ
                      <div className="bg-gray-200 rounded-full px-2.5 py-1 drop-shadow-sm">
                        <span className="text-xs font-medium text-gray-600">共通</span>
                      </div>
                    ) : (
                      // パターン2: 「未設定」バッジ
                      <div className="bg-orange-100 rounded-full px-2.5 py-1 drop-shadow-sm">
                        <span className="text-xs font-medium text-orange-700">未設定</span>
                      </div>
                    )}
                  </div>

                  {/* 卓名ラベル: 左下に統一（全パターン共通） */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-200/50">
                      <span className="text-lg font-bold text-gray-900">
                        {table.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 卓詳細シート（下からスライドアップ） */}
      <Sheet open={isTableSheetOpen} onOpenChange={setIsTableSheetOpen}>
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">卓詳細設定</SheetTitle>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentTableName}
                onChange={(e) => setCurrentTableName(e.target.value)}
                className="text-2xl font-bold tracking-tight bg-transparent border-none outline-none text-gray-900 w-auto"
                placeholder="卓名"
              />
              <Icons.PenLine className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            <SheetDescription>
              写真とメッセージを登録しましょう
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* メッセージ入力 */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icons.MessageSquareText className="w-4 h-4 text-gray-600" />
                メッセージ
              </label>
              <textarea
                id="message"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="久しぶり！楽しんでね"
                rows={4}
                className={cn(
                  "w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900 placeholder:text-gray-400",
                  "resize-none"
                )}
              />
            </div>

            {/* 写真選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                思い出の写真を追加
              </label>
              
              {/* ネイティブファイルピッカーボタン */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-14 rounded-xl font-semibold text-emerald-600 text-base",
                  "border-2 border-emerald-300 bg-emerald-50",
                  "hover:bg-emerald-100 hover:border-emerald-400",
                  "active:scale-95 transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                )}
              >
                <Icons.ImagePlus className="w-5 h-5" />
                {currentPhoto || currentPhotoUrl ? '写真を変更' : '写真を設定'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* 選択された写真のプレビュー（1枚表示） */}
              {(currentPhotoUrl || currentPhoto || previewUrl) && (
                <div className="mt-4">
                  <div className="relative group">
                    <div className="aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100 shadow-md">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="選択中の写真"
                          className="w-full h-full object-cover"
                        />
                      ) : currentPhoto ? (
                        <img
                          src={URL.createObjectURL(currentPhoto)}
                          alt="選択中の写真"
                          className="w-full h-full object-cover"
                        />
                      ) : currentPhotoUrl ? (
                        <img
                          src={currentPhotoUrl}
                          alt="既存の写真"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <button
                      onClick={() => {
                        if (currentPhoto || previewUrl) {
                          handleRemovePhoto();
                        } else {
                          setCurrentPhotoUrl(null);
                        }
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity active:scale-95 shadow-lg"
                    >
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* プレビューボタン */}
            <button
              onClick={() => handlePreview('table')}
              disabled={(currentPhotoUrl === null && !currentPhoto && !previewUrl) && currentMessage.length === 0}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-emerald-600 text-base",
                "border-2 border-emerald-300 bg-emerald-50",
                "hover:bg-emerald-100 hover:border-emerald-400",
                "active:scale-95 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              <Icons.Eye className="w-5 h-5" />
              ゲストの画面で確認する
            </button>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveTable}
              disabled={isUploading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white text-base",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "active:scale-95 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </span>
              ) : (
                '保存する'
              )}
            </button>

            {/* スキップボタン */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSkipTable}
                disabled={isUploading}
                className={cn(
                  "w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                この卓は個別の写真を登録しない（完了にする）
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ※その場合は、STEP 1で設定した「全員への写真」が自動的に表示されます。
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* プレビューモーダル */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">ゲストの画面プレビュー</DialogTitle>
            <DialogDescription>
              実際のゲスト画面での表示を確認できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {/* スマホモックアップ枠 */}
            <div className="relative mx-auto w-[320px] h-[600px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                {/* モックアップのコンテンツ */}
                <div className="h-full overflow-y-auto p-4">
                  {currentMessage && (
                    <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentMessage}</p>
                    </div>
                  )}
                  {(currentPhotoUrl || currentPhoto || previewUrl) ? (
                    <div className="rounded-lg overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="選択中の写真"
                          className="w-full h-auto"
                        />
                      ) : currentPhoto ? (
                        <img
                          src={URL.createObjectURL(currentPhoto)}
                          alt="選択中の写真"
                          className="w-full h-auto"
                        />
                      ) : currentPhotoUrl ? (
                        <img
                          src={currentPhotoUrl}
                          alt="既存の写真"
                          className="w-full h-auto"
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                      写真がありません
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* コンプライアンスチェックモーダル */}
      <Dialog 
        open={showComplianceModal} 
        onOpenChange={(open) => {
          setShowComplianceModal(open);
          if (!open) {
            // モーダルを閉じる際にクリーンアップ
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            setSelectedFile(null);
            setPreviewUrl(null);
            setHasAgreedToCompliance(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif flex items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              写真を登録する前に
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              この写真は<strong>ゲストに公開</strong>されます。<br />
              以下の写真は絶対に登録しないでください。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* 警告エリア */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔞</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">公序良俗に反する写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">性的・暴力的な内容を含む写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💔</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">ゲストが不快になる写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">関係者を不快にさせる写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🍺</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">泥酔や迷惑行為の写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">他のゲストや会場に迷惑をかける様子の写真</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿者責任の明示 */}
            <p className="text-xs text-stone-500 text-center font-serif">
              ※登録された写真は、<strong>ゲスト全員に公開</strong>されます。
            </p>

            {/* 写真プレビュー（1枚表示） */}
            {selectedFile && previewUrl && (
              <div className="flex justify-center p-3 bg-stone-50 rounded-lg">
                <div className="relative aspect-square w-full max-w-xs rounded-lg overflow-hidden border border-stone-200">
                  <img
                    src={previewUrl}
                    alt="プレビュー"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                    {selectedFile.name}
                  </div>
                </div>
              </div>
            )}

            {/* 同意チェックボックス */}
            <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <Checkbox
                id="compliance-check"
                checked={hasAgreedToCompliance}
                onCheckedChange={(checked) => setHasAgreedToCompliance(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="compliance-check"
                className="flex-1 text-sm text-stone-700 font-serif cursor-pointer leading-relaxed"
              >
                マナーを守り、適切な写真を登録することを約束します
              </label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
            <button
              onClick={() => {
                setShowComplianceModal(false);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setSelectedFile(null);
                setPreviewUrl(null);
                setHasAgreedToCompliance(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handlePhotoUploadAfterCompliance}
              disabled={!hasAgreedToCompliance || isUploading || !selectedFile}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>設定中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>写真を設定する</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## app/(guest)/guest/(main)/gallery/page.tsx

```tsx
'use client';

import { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Heart, Users, Camera, MessageCircle, Infinity as InfinityIcon, Trash2, ShieldAlert, Download, X, Mail, ArrowLeft } from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadWaitModal } from '@/components/DownloadWaitModal';
import { api } from '@/lib/services/api';
import type { Photo } from '@/lib/types/schema';
import { getVenueInfo } from '@/lib/services/mock/venueService';
import { getWeddingInfo, getTableInfo } from '@/lib/services/mock/weddingService';

// LINE ID（環境変数または定数で管理する想定）
const LINE_ID = '@あなたのLINE_ID'; // TODO: .envから取得するように変更

// LINE公式アカウントの友達追加URL（ソフトゲート用）
// TODO: 本番環境ではここに実際のLINE公式アカウントのURLを設定する
const LINE_ADD_FRIEND_URL = 'https://line.me/R/ti/p/@your_line_id';

const MOCK_VENUE_ID = 'venue-1'; // TODO: URLパラメータまたは認証情報から取得
const MOCK_WEDDING_ID = 'wedding-1'; // TODO: URLパラメータまたは認証情報から取得

// コンフェッティの色
const CONFETTI_COLORS = [
  '#f1ce88', // シャンパンゴールド
  '#ff9980', // コーラルピンク
  '#ffffff', // 白
  '#fefbf3', // クリーム
  '#ffd6cc', // ライトコーラル
];

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableID = searchParams.get('table');
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [showOpeningModal, setShowOpeningModal] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<{ id: string; url: string; alt: string } | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('couple');
  // 投稿枚数制限関連
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isLineConnected, setIsLineConnected] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  // 削除確認ダイアログ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 一括ダウンロード確認ダイアログ
  const [showDownloadAllConfirm, setShowDownloadAllConfirm] = useState(false);
  // ダウンロード待機モーダル
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [pendingDownloadAction, setPendingDownloadAction] = useState<(() => void | Promise<void>) | null>(null);
  // デバッグパネル
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  // コンプライアンスチェック関連
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [hasAgreedToCompliance, setHasAgreedToCompliance] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // 会場・挙式データ
  const [venueInfo, setVenueInfo] = useState<{ name: string; coverImage: string; enableLineUnlock: boolean; plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' } | null>(null);
  const [weddingWelcomeImage, setWeddingWelcomeImage] = useState<string | null>(null);
  const [weddingInfo, setWeddingInfo] = useState<{ message?: string } | null>(null);
  const [tableInfo, setTableInfo] = useState<{ id: string; name: string; message: string } | null>(null);
  // 初期ローディング状態（全てのデータが読み込まれるまでtrue）
  const [isLoading, setIsLoading] = useState(true);

  // 会場・挙式データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [venue, wedding] = await Promise.all([
          getVenueInfo(MOCK_VENUE_ID),
          getWeddingInfo(MOCK_WEDDING_ID),
        ]);
        // venueがundefinedの場合のフォールバック
        if (venue) {
          setVenueInfo({
            name: venue.name,
            coverImage: venue.coverImageUrl || 'https://picsum.photos/800/600?random=venue',
            enableLineUnlock: venue.enableLineUnlock || false,
            plan: venue.plan || 'PREMIUM', // プラン情報を追加
          });
        } else {
          // データが見つからない場合のフォールバック
          setVenueInfo({
            name: `Venue ${MOCK_VENUE_ID}`,
            coverImage: 'https://picsum.photos/800/600?random=venue',
            enableLineUnlock: false,
            plan: 'STANDARD',
          });
        }
        setWeddingWelcomeImage(wedding.welcomeImageUrl || null);
        setWeddingInfo({ message: wedding.message });
      } catch (error) {
        console.error('Failed to load venue/wedding data:', error);
        // フォールバック
        setVenueInfo({
          name: '表参道テラス',
          coverImage: 'https://picsum.photos/800/600?random=venue',
          enableLineUnlock: false,
          plan: 'PREMIUM', // デフォルトはPREMIUM
        });
      } finally {
        // データ読み込み完了（エラーでも完了として扱う）
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 卓情報の読み込み
  useEffect(() => {
    const loadTableInfo = async () => {
      if (tableID) {
        try {
          const info = await getTableInfo(tableID);
          setTableInfo(info);
        } catch (error) {
          console.error('Failed to load table info:', error);
        }
      }
    };
    loadTableInfo();
  }, [tableID]);

  // プレビューURLのクリーンアップ（モーダルが閉じられたとき）
  useEffect(() => {
    if (!showComplianceModal && previewUrls.length > 0) {
      // モーダルが閉じられたときにプレビューURLをクリーンアップ
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComplianceModal]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetHeight;
        setIsScrolled(window.scrollY > heroBottom - 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // LINE URL生成関数
  const getLineUrl = () => {
    if (tableID) {
      const message = encodeURIComponent(`テーブル${tableID}の写真`);
      return `https://line.me/R/oaMessage/${LINE_ID}/?${message}`;
    }
    return `https://line.me/R/ti/p/${LINE_ID}`;
  };

  // 画像読み込みハンドラ
  const handleImageLoad = (photoId: string) => {
    setImageLoading((prev) => ({ ...prev, [photoId]: false }));
  };

  const handleImageStartLoad = (photoId: string) => {
    setImageLoading((prev) => ({ ...prev, [photoId]: true }));
  };

  useEffect(() => {
    if (!showOpeningModal) return;

    // スクロールロック
    document.body.style.overflow = 'hidden';

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowOpeningModal(false);
          document.body.style.overflow = 'unset';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = 'unset';
    };
  }, [showOpeningModal]);

  // Skipボタンでモーダルを閉じる処理
  const handleSkipOpening = () => {
    setShowOpeningModal(false);
    setTimeLeft(0);
    document.body.style.overflow = 'unset';
  };

  // ライトボックス表示時のスクロールロック
  useEffect(() => {
    if (viewingImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingImage]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
    // 選択モードの場合はリセット
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedImageIds([]);
    }
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleSelectModeToggle = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // キャンセル時は選択をリセット
      setSelectedImageIds([]);
    }
  };

  const handleImageToggle = (photo: { id: string; url: string; alt: string }) => {
    if (!isSelectMode) {
      // 通常モード：拡大表示
      setViewingImage({ id: photo.id, url: photo.url, alt: photo.alt });
      return;
    }

    // 選択モード：トグル
    setSelectedImageIds((prev) => {
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id);
      } else {
        return [...prev, photo.id];
      }
    });
  };

  // 画像の右クリック/長押し時のLINE誘導
  const handleImageContextMenu = (e: React.MouseEvent, photo: { id: string; url: string; alt: string }) => {
    e.preventDefault();
    setShowLineModal(true);
  };

  const handleCloseLightbox = () => {
    setViewingImage(null);
    x.set(0);
    y.set(0);
  };

  const handleNextImage = () => {
    if (!viewingImage) return;
    const photos = getCurrentPhotos();
    const currentIndex = photos.findIndex((p) => String(p.id) === String(viewingImage.id));
    const nextIndex = (currentIndex + 1) % photos.length;
    const nextPhoto = photos[nextIndex];
    setViewingImage({ id: String(nextPhoto.id), url: nextPhoto.url, alt: nextPhoto.alt });
    x.set(0);
    y.set(0);
  };

  const handlePrevImage = () => {
    if (!viewingImage) return;
    const photos = getCurrentPhotos();
    const currentIndex = photos.findIndex((p) => String(p.id) === String(viewingImage.id));
    const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    const prevPhoto = photos[prevIndex];
    setViewingImage({ id: String(prevPhoto.id), url: prevPhoto.url, alt: prevPhoto.alt });
    x.set(0);
    y.set(0);
  };

  // 単一写真のダウンロード機能（Web Share API優先、フォールバックはBlobダウンロード）- 実際の実行処理
  const executeSingleDownload = async (url: string, alt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${alt || 'wedding-photo'}-${Date.now()}.jpg`, { type: blob.type });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          toast.success('写真を保存しました', {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
          });
          return;
        } catch (shareError: unknown) {
          // ユーザーが共有をキャンセルした場合など、AbortError以外は通常のダウンロードにフォールバック
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            return; // ユーザーがキャンセルした場合は何もしない
          }
          // その他のエラーは通常のダウンロードにフォールバック
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success('写真をダウンロードしました', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
      });
    }
  };

  // 単一写真のダウンロード - プラン判定を行うゲートキーパー関数
  const handleDownload = (url: string, alt: string) => {
    // 実行する処理を定義（クロージャで引数を保持）
    const action = () => executeSingleDownload(url, alt);

    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => action);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      action();
    }
  };

  // 選択した写真の一括ダウンロード機能（ZIP化） - 実際の実行処理
  const executeBulkDownload = async () => {
    if (selectedImageIds.length === 0) {
      toast.error('写真を選択してください', {
        duration: 2000,
      });
      return;
    }

    try {
      toast.loading(`${selectedImageIds.length}枚の写真をダウンロード中...`, {
        id: 'bulk-download',
      });

      const zip = new JSZip();
      const photos = getCurrentPhotos();
      const selectedPhotos = photos.filter((p) => selectedImageIds.includes(String(p.id)));

      // 各写真をZIPに追加
      await Promise.all(
        selectedPhotos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const fileName = `${photo.alt || `photo-${index + 1}`}.jpg`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to fetch photo ${photo.id}:`, error);
          }
        })
      );

      // ZIPファイルを生成
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFile = new File([zipBlob], `wedding-photos-${Date.now()}.zip`, { type: 'application/zip' });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [zipFile] })) {
        try {
          await navigator.share({ files: [zipFile] });
          toast.success(`${selectedImageIds.length}枚の写真を保存しました`, {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
            id: 'bulk-download',
          });
          setIsSelectMode(false);
          setSelectedImageIds([]);
          return;
        } catch (shareError: unknown) {
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            toast.dismiss('bulk-download');
            return;
          }
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(zipBlob);
      link.href = objectUrl;
      link.download = zipFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`${selectedImageIds.length}枚の写真をダウンロードしました`, {
        duration: 3000,
        id: 'bulk-download',
      });

      // 選択モードを解除
      setIsSelectMode(false);
      setSelectedImageIds([]);
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
        id: 'bulk-download',
      });
    }
  };

  // 選択した写真の一括ダウンロード - モーダル表示用ハンドラ
  const handleBulkDownload = () => {
    if (selectedImageIds.length === 0) {
      toast.error('写真を選択してください', {
        duration: 2000,
      });
      return;
    }

    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => executeBulkDownload);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      executeBulkDownload();
    }
  };

  // 全写真の一括ダウンロード機能（ZIP化） - 実際の実行処理
  const executeDownloadAll = async () => {
    const photos = getCurrentPhotos();
    
    if (photos.length === 0) {
      toast.error('ダウンロードする写真がありません', {
        duration: 2000,
      });
      return;
    }
    
    try {
      toast.loading(`ZIPファイルを作成中... (${photos.length}枚)`, {
        id: 'download-all',
      });

      const zip = new JSZip();

      // 各写真をZIPに追加
      await Promise.all(
        photos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            // ファイル名を整理（特殊文字を削除）
            const sanitizedAlt = (photo.alt || `photo-${index + 1}`).replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
            const fileName = `${sanitizedAlt || `photo-${index + 1}`}.jpg`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to fetch photo ${photo.id}:`, error);
          }
        })
      );

      // ZIPファイルを生成
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = activeTab === 'couple' 
        ? `お二人の写真-${Date.now()}.zip`
        : `この卓の写真-${Date.now()}.zip`;
      const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' });

      // Web Share APIを優先（モバイル端末の場合）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [zipFile] })) {
        try {
          await navigator.share({ files: [zipFile] });
          toast.success(`${photos.length}枚の写真を保存しました`, {
            description: 'OSの共有メニューから保存してください',
            duration: 3000,
            id: 'download-all',
          });
          return;
        } catch (shareError: unknown) {
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            toast.dismiss('download-all');
            return;
          }
        }
      }

      // Blobダウンロード（PCまたはWeb Share APIが使えない場合）
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(zipBlob);
      link.href = objectUrl;
      link.download = zipFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`${photos.length}枚の写真をダウンロードしました`, {
        duration: 3000,
        id: 'download-all',
      });
    } catch (error) {
      console.error('Download all failed:', error);
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
        duration: 3000,
        id: 'download-all',
      });
    }
  };

  // 全写真の一括ダウンロード - モーダル表示用ハンドラ
  const handleDownloadAll = async () => {
    const photos = getCurrentPhotos();
    
    if (photos.length === 0) {
      toast.error('ダウンロードする写真がありません', {
        duration: 2000,
      });
      return;
    }

    // 確認ダイアログを表示
    setShowDownloadAllConfirm(true);
  };

  // 一括ダウンロード確認後の処理（確認ダイアログから呼ばれる）
  const handleDownloadAllConfirm = () => {
    setShowDownloadAllConfirm(false);
    
    // プラン判定: PREMIUM以外（LIGHT, STANDARD）では広告モーダルを表示
    if (venueInfo?.plan !== 'PREMIUM') {
      // LIGHT/STANDARDプラン: 広告モーダルを経由
      setPendingDownloadAction(() => executeDownloadAll);
      setIsDownloadModalOpen(true);
    } else {
      // PREMIUMプラン: 広告なしで即実行
      executeDownloadAll();
    }
  };

  // 新郎新婦が登録した写真（STEP 1, STEP 2）
  const [couplePhotos] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      url: `https://picsum.photos/400/300?random=couple${i + 1}`,
      alt: `新郎新婦からの写真 ${i + 1}`,
      source: 'couple' as const,
    }))
  );

  // この卓のゲストがアップロードした写真（APIから取得）
  const [tablePhotos, setTablePhotos] = useState<Photo[]>([]);
  
  // 初期データの読み込み（実際の実装ではAPIから取得）
  useEffect(() => {
    const loadPhotos = async () => {
      if (tableID) {
        try {
          // TODO: 実際のweddingIdを取得（認証情報から）
          const weddingId = 'wedding-1';
          const photos = await api.getPhotosByTable(tableID);
          setTablePhotos(photos);
        } catch (error) {
          console.error('Failed to load photos:', error);
        }
      }
    };
    
    // 開発用: モックデータを設定
    // 本番環境では loadPhotos() を呼び出す
    // loadPhotos();
    
    // モックデータ（開発用）
    setTablePhotos([
      {
        id: '1001',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        alt: '楽しそうな飲み会の様子 1',
        source: 'table',
        weddingId: 'wedding-1',
        tableId: tableID || null,
        uploadedBy: 'guest-1',
        isMyPhoto: true,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '1002',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        alt: '美味しそうな料理の写真 1',
        source: 'table',
        weddingId: 'wedding-1',
        tableId: tableID || null,
        uploadedBy: 'guest-2',
        isMyPhoto: false,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, [tableID]);

  // 現在のタブに応じた写真リストを取得
  // ゲスト側のUI用の型（Photo型を変換）
  type PhotoType = { id: string; url: string; alt: string; isMyPhoto?: boolean };
  const getCurrentPhotos = (): PhotoType[] => {
    if (activeTab === 'couple') {
      // 新郎新婦からの写真（モックデータ）
      return couplePhotos.map(p => ({ id: String(p.id), url: p.url, alt: p.alt }));
    } else {
      // この卓の写真（APIから取得）
      return tablePhotos.map(p => ({
        id: p.id,
        url: p.url,
        alt: p.alt || '写真',
        isMyPhoto: p.isMyPhoto,
      }));
    }
  };
  const currentPhotos = getCurrentPhotos();
  
  // 削除処理
  const handleDeletePhoto = async () => {
    if (!viewingImage) return;
    
    // 現在のタブに応じて削除
    if (activeTab === 'table') {
      try {
        // TODO: 実際のuserIdを取得（認証情報から）
        const userId = 'guest-1';
        
        // API経由で削除
        await api.deletePhoto(viewingImage.id, userId);
        
        // ローカル状態を更新
        const deletedPhoto = tablePhotos.find((p) => p.id === viewingImage.id);
        setTablePhotos((prev) => prev.filter((p) => p.id !== viewingImage.id));
        
        // 自分の写真を削除した場合、投稿数を減らす
        if (deletedPhoto?.isMyPhoto) {
          setUploadedCount((prev) => Math.max(0, prev - 1));
        }
        
        // ライトボックスを閉じる
        handleCloseLightbox();
        
        // 削除確認ダイアログを閉じる
        setShowDeleteConfirm(false);
        
        // フィードバック: トースト通知
        toast.success('写真を削除しました', {
          description: '削除された写真は復元できません',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to delete photo:', error);
        toast.error('削除に失敗しました', {
          description: 'もう一度お試しください',
          duration: 3000,
        });
      }
    } else {
      // 新郎新婦からの写真は削除不可
      handleCloseLightbox();
      setShowDeleteConfirm(false);
    }
  };

  // パーティクルエフェクト（紙吹雪）をトリガー
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // ゴールド、ホワイト、エメラルド系の色
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#f1ce88', '#10b981', '#ffffff', '#fefbf3', '#34d399'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#f1ce88', '#10b981', '#ffffff', '#fefbf3', '#34d399'],
      });
    }, 250);
  };

  // ファイル選択時の処理（コンプライアンスチェックモーダルを表示）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 制限チェック: uploadedCount >= 5 かつ LINE未連携の場合、アップロードをブロック
    const UPLOAD_LIMIT = 5;
    const fileCount = files.length;
    const newUploadedCount = uploadedCount + fileCount;

    // 既に上限に達している場合、または新規アップロードで上限を超える場合
    if ((uploadedCount >= UPLOAD_LIMIT || newUploadedCount > UPLOAD_LIMIT) && !isLineConnected) {
      // 会場設定による分岐
      if (venueInfo?.enableLineUnlock) {
        // パターンA: LINE連携機能が有効な場合、制限解除モーダルを表示
        setShowLimitModal(true);
      } else {
        // パターンB: LINE連携機能が無効な場合、エラートーストを表示
        toast.error('申し訳ありません。投稿枚数の上限（5枚）に達しました。', {
          duration: 4000,
        });
      }
      // ファイル入力のリセット
      event.target.value = '';
      return;
    }

    // ファイルをステートに保存してコンプライアンスチェックモーダルを表示
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    
    // プレビューURLを生成
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setShowComplianceModal(true);
    setHasAgreedToCompliance(false); // リセット
    // ファイル入力のリセット（モーダル内で確認後、アップロード実行）
    event.target.value = '';
  };

  // 写真アップロード処理（実際のアップロード実行）
  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (!hasAgreedToCompliance) {
      toast.error('投稿前に約束に同意してください', {
        description: 'マナーチェックボックスにチェックを入れてください',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // TODO: 実際のweddingIdとuserIdを取得（認証情報から）
      const weddingId = 'wedding-1';
      const userId = 'guest-1';
      
      // API経由で写真をアップロード
      const uploadedPhotos = await api.uploadPhotos(
        selectedFiles,
        weddingId,
        tableID || null,
        userId
      );

      // ローカル状態を更新
      setTablePhotos((prev) => [...prev, ...uploadedPhotos]);
      
      // 投稿数を更新
      setUploadedCount((prev) => prev + selectedFiles.length);
      
      // 新しい写真のIDを記録（アニメーション用）
      const newIds = uploadedPhotos.map((p) => p.id);
      setNewPhotoIds(new Set(newIds));

      // リッチなトースト通知を表示
      toast.success('素敵な写真をありがとうございます！', {
        description: '新郎新婦もきっと喜びます✨ ギャラリーに追加されました。',
        duration: 4000,
        icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
        className: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200',
        style: {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
        },
      });

      // パーティクルエフェクトをトリガー
      triggerConfetti();

      // 新しい写真のIDを3秒後にクリア（アニメーション終了後）
      setTimeout(() => {
        setNewPhotoIds(new Set());
      }, 3000);

      // コンプライアンスチェックモーダルを閉じる
      setShowComplianceModal(false);
      setSelectedFiles([]);
      setHasAgreedToCompliance(false);
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error('アップロードに失敗しました', {
        description: 'もう一度お試しください。',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // インフィード広告を含む写真リストを生成（12枚おきに広告を挿入）
  const itemsWithAds: Array<{ type: 'photo'; data: PhotoType } | { type: 'ad'; index: number }> = useMemo(() => {
    const photos = getCurrentPhotos();
    const items: Array<{ type: 'photo'; data: PhotoType } | { type: 'ad'; index: number }> = [];
    const shouldShowAds = venueInfo?.plan !== 'PREMIUM'; // PREMIUM以外では広告を表示
    photos.forEach((photo, index) => {
      items.push({ type: 'photo', data: photo });
      // 12枚おきに広告を挿入（最初と最後は除く、かつPREMIUM以外の場合のみ）
      if (shouldShowAds && (index + 1) % 12 === 0 && index < photos.length - 1) {
        items.push({ type: 'ad', index: Math.floor((index + 1) / 12) });
      }
    });
    return items;
  }, [activeTab, couplePhotos, tablePhotos, venueInfo?.plan]);

  // コンフェッティ生成
  const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 4,
  }));

  // ローディング中はスピナーのみ表示
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-stone-200 border-t-emerald-600 rounded-full"
            />
            <p className="text-stone-600 font-serif text-lg">読み込み中...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-dvh relative overflow-hidden"
    >
      {/* 背景アニメーション - 光のボケ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-champagne-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-coral-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 60, -80, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-champagne-300/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* コンフェッティエフェクト */}
      {!showOpeningModal && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: particle.left,
                top: '-10px',
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, Math.random() * 200 - 100],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
      {/* オープニングモーダル - 華やかなデザイン */}
      {showOpeningModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4"
          style={{ 
            height: '100dvh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          }}
        >
          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-champagne-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-coral-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="text-center space-y-6 md:space-y-8 w-full max-w-md relative z-10">
            {/* SPONSORED - エレガントなデザイン */}
            <div className="mb-4 md:mb-6">
              <p className="font-serif text-stone-300/80 text-sm font-semibold tracking-[0.3em] uppercase">
                SPONSORED
              </p>
            </div>

            {/* メインメッセージ */}
            <div className="mb-6 md:mb-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-stone-100 text-2xl sm:text-3xl font-light tracking-wide leading-relaxed px-4 mb-6 break-keep text-balance text-center"
              >
                お二人の特別な一日の写真を<br />ご覧いただけます
              </motion.p>
            </div>

            {/* 広告枠（グラスモーフィズム） */}
            <div className="mb-6 md:mb-8 flex justify-center">
              <div className="w-full max-w-[300px] h-[200px] sm:h-[250px] bg-white/10 backdrop-blur-xl border border-stone-400/20 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl">
                {/* ダミー広告 */}
                <div className="absolute inset-0">
                  <img
                    src="https://picsum.photos/300/250?random=999"
                    alt="Advertisement"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
                <div className="relative z-10 bg-stone-900/50 backdrop-blur-md px-6 py-4 rounded-xl border border-stone-400/20">
                  <p className="text-stone-100 text-sm sm:text-base font-serif">広告バナーが入ります</p>
                </div>
              </div>
            </div>

            {/* プログレスバー - くすみカラー */}
            <div className="w-full max-w-sm mx-auto px-4 mb-6">
              <div className="w-full bg-stone-800/30 backdrop-blur-sm rounded-full h-2 overflow-hidden shadow-inner border border-stone-400/20">
                <motion.div
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 h-2 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${((3 - timeLeft) / 3) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* カウントダウン - エレガント */}
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">あと</p>
              <p className="font-serif text-amber-300 text-6xl sm:text-7xl font-light drop-shadow-lg">
                {timeLeft}
              </p>
              <p className="font-serif text-stone-300/70 text-lg sm:text-xl">秒</p>
            </div>

            {/* Skipボタン */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              onClick={handleSkipOpening}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Skip
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ライトボックス - 拡大表示（スワイプ対応） */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            {/* 閉じるボタン */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 削除ボタン（自分の写真の場合のみ表示） */}
            {(() => {
              const photos = getCurrentPhotos();
              const currentPhoto = photos.find((p) => p.id === viewingImage.id);
              if (currentPhoto?.isMyPhoto && activeTab === 'table') {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="absolute bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md flex items-center justify-center text-white active:bg-red-700 transition-all duration-200 border border-red-300/30 shadow-lg hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                );
              }
              return null;
            })()}

            {/* 前の画像ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 次の画像ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:bg-black/80 transition-all duration-200 border border-white/10 shadow-lg hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* 画像表示（ドラッグ可能 - スワイプ対応） */}
            <motion.div
              drag
              dragConstraints={{ left: -300, right: 300, top: -100, bottom: 200 }}
              dragElastic={0.5}
              onDragEnd={(event, info) => {
                const horizontalThreshold = 50;
                const verticalThreshold = 100;
                const horizontalVelocityThreshold = 300;
                const verticalVelocityThreshold = 500;

                // 下方向スワイプ（閉じる）を優先
                if (info.offset.y > verticalThreshold || info.velocity.y > verticalVelocityThreshold) {
                  handleCloseLightbox();
                  return;
                }

                // 左右スワイプ（前後の画像へ移動）
                if (Math.abs(info.offset.x) > horizontalThreshold || Math.abs(info.velocity.x) > horizontalVelocityThreshold) {
                  if (info.offset.x > 0 || info.velocity.x > 0) {
                    handlePrevImage();
                  } else {
                    handleNextImage();
                  }
                }

                // 元の位置に戻す
                x.set(0);
                y.set(0);
              }}
              style={{ x, y }}
              className="relative max-w-full max-h-full w-full h-full flex items-center justify-center p-4 touch-none cursor-grab active:cursor-grabbing"
              onClick={(e) => {
                // 小さなドラッグの場合はクリックとして扱わない
                if (Math.abs(x.get()) < 10 && Math.abs(y.get()) < 10) {
                  e.stopPropagation();
                }
              }}
            >
              <motion.img
                key={viewingImage.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                src={viewingImage.url}
                alt={viewingImage.alt}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>

            {/* ダウンロードボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(viewingImage.url, viewingImage.alt);
              }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center gap-2 text-stone-800 active:scale-95 transition-all duration-200 border border-stone-200/50 shadow-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              <span>保存</span>
            </button>

            {/* 画像インデックス表示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm border border-white/10 shadow-lg"
            >
              {(() => {
                const photos = getCurrentPhotos();
                const currentIndex = photos.findIndex((p) => p.id === viewingImage.id);
                return currentIndex >= 0 ? `${currentIndex + 1} / ${photos.length}` : '';
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINE誘導モーダル（画像右クリック/長押し時） */}
      <AnimatePresence>
        {showLineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center p-4"
            onClick={() => setShowLineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center border border-stone-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLineModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">📸</span>
                </div>
                <h2 className="font-serif text-stone-800 text-xl sm:text-2xl font-semibold mb-2">
                  高画質な写真をLINEで受け取る
                </h2>
                <p className="font-serif text-stone-600 text-sm leading-relaxed">
                  この写真の高画質版を、公式LINEよりお届けします
                </p>
              </div>

              <a
                href={getLineUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl py-4 px-4 shadow-lg shadow-green-200 transition-all font-serif font-semibold"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                  </svg>
                  <span>LINEで受け取る</span>
                </div>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 保存完了＆LINE誘導モーダル（訴求強化版） */}
      {showSaveModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={handleCloseSaveModal}
        >
          <div 
            className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-8 shadow-2xl relative animate-[slideUp_0.3s_ease-out] text-center border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button 
              onClick={handleCloseSaveModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 active:opacity-50 transition-opacity"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* アイコン & タイトル */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-champagne-200 to-champagne-300 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <span className="text-4xl">📸</span>
              <motion.span
                className="absolute text-2xl -mr-10 -mt-10"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✨
              </motion.span>
            </div>
            
            <h2 className="font-semibold text-2xl sm:text-3xl text-stone-800 mb-4 font-serif">
              保存完了しました
            </h2>
            
            {/* 注意喚起エリア */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/50 rounded-xl p-5 sm:p-6 mb-6 text-left backdrop-blur-sm">
              <p className="font-semibold text-rose-800 text-base sm:text-lg mb-3 flex items-center gap-2 font-serif">
                <span>📸</span>
                <span>高画質な写真をLINEで受け取れます</span>
              </p>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-serif">
                {tableID ? (
                  <>プロカメラマンが撮影した<strong className="font-semibold">【テーブル{tableID}での記念写真】</strong>を、公式LINEより高画質版でお届けします。</>
                ) : (
                  <>プロカメラマンが撮影した<strong className="font-semibold">【こちらのテーブルの記念写真】</strong>を、公式LINEより高画質版でお届けします。</>
                )}
              </p>
            </div>

            {/* LINEボタン */}
            <div className="relative mb-6">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-coral-500 to-coral-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-pulse whitespace-nowrap border border-white/20">
                受け取り予約
              </div>
              <a
                href={getLineUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl py-5 px-4 shadow-lg shadow-green-200 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-center gap-3 leading-tight flex-nowrap">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                  </svg>
                  <span className="font-bold text-base sm:text-lg whitespace-nowrap">LINEで受け取る</span>
                </div>
              </a>
            </div>
            
            {/* 閉じるリンク */}
            <button
              onClick={handleCloseSaveModal}
              className="text-stone-400 text-xs hover:text-stone-600 font-medium underline decoration-stone-300 underline-offset-4 active:opacity-50 transition-opacity"
            >
              追加の写真は受け取らずに閉じる
            </button>
          </div>
        </div>
      )}

      {/* コンプライアンスチェックモーダル */}
      <Dialog 
        open={showComplianceModal} 
        onOpenChange={(open) => {
          setShowComplianceModal(open);
          if (!open) {
            // モーダルを閉じる際にクリーンアップ
            setSelectedFiles([]);
            setHasAgreedToCompliance(false);
            // プレビューURLのクリーンアップはuseEffectで処理
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif flex items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              写真アップロードの前に
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              すべての写真は<strong>新郎新婦と会場スタッフが確認</strong>します。<br />
              以下の写真は絶対に投稿しないでください。
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* 警告エリア */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔞</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">公序良俗に反する写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">性的・暴力的な内容を含む写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💔</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">新郎新婦や他のゲストが不快になる写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">元交際相手など、関係者を不快にさせる写真</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🍺</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm font-serif">泥酔や迷惑行為の写真</p>
                    <p className="text-xs text-orange-700 mt-1 font-serif">他のゲストや会場に迷惑をかける様子の写真</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿者責任の明示 */}
            <p className="text-xs text-stone-500 text-center font-serif">
              ※投稿された写真は、<strong>あなたの名前（LINE名/ゲスト名）と共に</strong>記録されます。
            </p>

            {/* 写真プレビュー */}
            {selectedFiles.length > 0 && previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-stone-50 rounded-lg">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={previewUrls[index]}
                      alt={`プレビュー ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 同意チェックボックス */}
            <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <Checkbox
                id="compliance-check"
                checked={hasAgreedToCompliance}
                onCheckedChange={(checked) => setHasAgreedToCompliance(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="compliance-check"
                className="flex-1 text-sm text-stone-700 font-serif cursor-pointer leading-relaxed"
              >
                マナーを守り、祝福の写真を投稿することを約束します
              </label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
            <button
              onClick={() => {
                setShowComplianceModal(false);
                setSelectedFiles([]);
                setHasAgreedToCompliance(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handlePhotoUpload}
              disabled={!hasAgreedToCompliance || isUploading}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>アップロード中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>投稿する</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
              写真を削除しますか？
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handleDeletePhoto}
              className="w-full sm:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              <Trash2 className="w-4 h-4" />
              削除する
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 一括ダウンロード確認ダイアログ */}
      <Dialog open={showDownloadAllConfirm} onOpenChange={setShowDownloadAllConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
              一括ダウンロード
            </DialogTitle>
            <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
              {(() => {
                const photos = getCurrentPhotos();
                const tabName = activeTab === 'couple' ? 'お二人の写真' : 'この卓の写真';
                return `表示中の${photos.length}枚の写真を一括ダウンロードしますか？`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <button
              onClick={() => setShowDownloadAllConfirm(false)}
              className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
            >
              キャンセル
            </button>
            <button
              onClick={handleDownloadAllConfirm}
              className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
            >
              <Download className="w-4 h-4" />
              ダウンロードする
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 制限解除モーダル（LINE連携機能が有効な場合のみ表示） */}
      {venueInfo?.enableLineUnlock && (
        <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-stone-800 font-serif">
                写真の投稿上限（5枚）に達しました
              </DialogTitle>
              <DialogDescription className="text-center text-base text-stone-600 mt-2 font-serif">
                もっと写真をアップロードするには、LINEで友達追加をして無制限モードを解放してください✨
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors font-serif"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // LINE公式アカウントの友達追加URLを別タブで開く（ソフトゲート）
                  window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                  
                  // 即座に制限を解除（無条件で連携済みにする）
                  setIsLineConnected(true);
                  setShowLimitModal(false);
                  
                  // フィードバック: トースト通知を表示
                  toast.success('無制限モードが解放されました！🎉', {
                    description: 'これからは何枚でもアップロードできます✨',
                    duration: 4000,
                  });
                }}
                className="w-full sm:w-auto px-6 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-serif"
              >
                <MessageCircle className="w-5 h-5" />
                LINE友達追加で無制限にする
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 戻るボタン */}
      {!showOpeningModal && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.back()}
          className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 active:scale-95 shadow-lg"
          aria-label="戻る"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* メインコンテンツ */}
      {!showOpeningModal && (
        <>
          {/* ヒーローセクション */}
          <section
            ref={heroRef}
            className="relative w-full h-[50dvh] md:h-[60vh] min-h-[300px] md:min-h-[400px] overflow-hidden"
          >
            {/* 背景画像 */}
            <div className="absolute inset-0">
              <img
                src={venueInfo?.coverImage || 'https://picsum.photos/800/600?random=venue'}
                alt={venueInfo?.name || '会場'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent" />
            </div>

            {/* タイトル */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center max-w-2xl"
              >
                <h1 className="font-serif text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
                  Wedding Photo Gallery
                </h1>
                <p className="font-serif text-amber-200 text-xl md:text-2xl font-light tracking-wider drop-shadow-lg mb-6">
                  お二人の思い出
                </p>
                
                {/* 全員へのメッセージ */}
                {weddingInfo?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                    className="mt-6 px-4"
                  >
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
                      <p className="font-serif text-white text-sm md:text-base leading-relaxed whitespace-pre-wrap drop-shadow-lg max-w-2xl mx-auto text-center">
                        {weddingInfo.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* 装飾要素 */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
          </section>

          {/* タブ構造（TabsListとTabsContentを同じTabsコンポーネント内に配置） */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* タブ切り替えエリア（Stickyヘッダー - 上部固定） */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
              <div className="max-w-md mx-auto px-4 py-3">
                <TabsList className="grid w-full grid-cols-2 bg-stone-100/80 backdrop-blur-sm rounded-xl p-1">
                  <TabsTrigger 
                    value="couple" 
                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    お二人の写真
                  </TabsTrigger>
                  <TabsTrigger 
                    value="table"
                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    この卓の写真
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* メインコンテンツエリア（スクロール可能、上下のバーに隠れないようpadding調整） */}
            <div className="container mx-auto px-4 py-4 pb-32 pt-4 relative z-10 max-w-4xl">
              {/* タブ1: お二人の写真 */}
              <TabsContent value="couple" className="mt-0">
                {couplePhotos.length === 0 ? (
                  <div className="text-center py-12 md:py-16 px-4">
                    <Heart className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-600 text-lg font-serif">まだ写真が届いていません。お楽しみに！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {itemsWithAds.map((item, index) => {
                      if (item.type === 'photo') {
                        const isSelected = selectedImageIds.includes(String(item.data.id));
                        return (
                          <motion.div
                            key={`photo-${item.data.id}`}
                            initial={newPhotoIds.has(String(item.data.id)) ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={newPhotoIds.has(String(item.data.id)) 
                              ? { 
                                  type: 'spring', 
                                  stiffness: 200, 
                                  damping: 20,
                                  delay: 0.1 
                                }
                              : { delay: index * 0.02 }
                            }
                            onClick={() => handleImageToggle({ id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                            className={`aspect-square bg-stone-200 overflow-hidden relative transition-all duration-200 rounded-sm ${
                              isSelectMode
                                ? 'active:opacity-80 cursor-pointer hover:scale-105'
                                : 'active:opacity-80 cursor-pointer hover:scale-105'
                            } shadow-md hover:shadow-xl`}
                          >
                            {(imageLoading[String(item.data.id)] === undefined || imageLoading[String(item.data.id)] === true) && (
                              <motion.div 
                                initial={{ opacity: 1 }}
                                animate={{ opacity: imageLoading[String(item.data.id)] === false ? 0 : 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse flex items-center justify-center z-10"
                              >
                                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </motion.div>
                            )}
                            <img
                              src={item.data.url}
                              alt={item.data.alt}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoading[String(item.data.id)] === false ? 'opacity-100' : 'opacity-0'
                              }`}
                              onLoad={() => handleImageLoad(String(item.data.id))}
                              onLoadStart={() => handleImageStartLoad(String(item.data.id))}
                              onContextMenu={(e) => handleImageContextMenu(e, { id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                              loading="lazy"
                            />

                            {/* チェックマーク（選択モード時のみ表示） */}
                            {isSelectMode && (
                              <div
                                className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg ${
                                  isSelected
                                    ? 'bg-champagne-500 border-champagne-600 scale-110'
                                    : 'bg-white/80 border-white/90 backdrop-blur-md'
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      } else {
                        // インフィード広告
                        return (
                          <motion.div
                            key={`ad-${item.index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="aspect-square bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md overflow-hidden relative flex flex-col items-center justify-center border border-white/30 rounded-sm shadow-lg"
                          >
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-champagne-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest shadow-md">
                                PR
                              </span>
                            </div>
                            <div className="text-center p-4 mt-4 relative z-0">
                              <div className="w-full h-24 bg-white/20 backdrop-blur-sm rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/20">
                                <img
                                  src={`https://picsum.photos/300/300?random=${900 + item.index}`}
                                  alt="Advertisement"
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </div>
                              <p className="text-xs text-stone-700 font-medium">広告</p>
                            </div>
                          </motion.div>
                        );
                      }
                    })}
                  </div>
                )}
              </TabsContent>

              {/* タブ2: この卓の写真 */}
              <TabsContent value="table" className="mt-0">
                {/* 卓メッセージカード */}
                {tableInfo?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 p-6 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-xl text-center shadow-md"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-serif text-base font-semibold text-stone-800">
                        新郎新婦から、{tableInfo.name}の皆様へ
                      </h3>
                    </div>
                    <p className="font-serif text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {tableInfo.message}
                    </p>
                  </motion.div>
                )}

                {/* 投稿枚数進捗表示 */}
                <div className="mb-4 px-4">
                  {isLineConnected ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm font-serif">
                      <InfinityIcon className="w-5 h-5" />
                      <span>✨ 無制限モード適用中</span>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                      uploadedCount >= 5 
                        ? 'bg-red-50 border-2 border-red-200' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <span className={`font-semibold text-sm font-serif ${
                        uploadedCount >= 5 
                          ? 'text-red-700' 
                          : 'text-orange-700'
                      }`}>
                        {uploadedCount >= 5 
                          ? '上限に達しました' 
                          : `残り投稿可能数: ${Math.max(0, 5 - uploadedCount)}枚`
                        }
                      </span>
                      {uploadedCount >= 5 && venueInfo?.enableLineUnlock && (
                        <span className="text-xs text-red-600 font-serif font-bold">⚠️ LINEで無制限化</span>
                      )}
                      {uploadedCount >= 5 && !venueInfo?.enableLineUnlock && (
                        <span className="text-xs text-red-600 font-serif font-bold">⚠️ 上限到達</span>
                      )}
                    </div>
                  )}
                </div>

                {/* LINE連携CTAバナー（STANDARD/PREMIUMプラン向け、LINE未連携の場合のみ） */}
                {venueInfo?.plan !== 'LIGHT' && venueInfo.enableLineUnlock && !isLineConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mx-4 mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-green-900 font-bold text-sm font-serif mb-1">
                          写真をたくさん撮りましたか？
                        </p>
                        <p className="text-green-700 text-xs font-serif">
                          LINE連携で枚数制限なしで投稿できます
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // LINE公式アカウントの友達追加URLを別タブで開く
                          window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                          
                          // 即座に制限を解除（無条件で連携済みにする）
                          setIsLineConnected(true);
                          
                          // フィードバック: トースト通知を表示
                          toast.success('無制限モードが解放されました！🎉', {
                            description: 'これからは何枚でもアップロードできます✨',
                            duration: 4000,
                          });
                        }}
                        className="px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a3f] text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4" />
                        連携する
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 写真グリッド または エンプティステート */}
                {tablePhotos.length === 0 ? (
                  <div className="text-center py-12 md:py-16 px-4">
                    <Camera className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-600 text-lg font-serif mb-2">まだ写真がありません。</p>
                    <p className="text-stone-500 text-base font-serif">最初の1枚を投稿しましょう！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {itemsWithAds.map((item, index) => {
                  if (item.type === 'photo') {
                    const isSelected = selectedImageIds.includes(String(item.data.id));
                    return (
                      <motion.div
                        key={`photo-${item.data.id}`}
                        initial={newPhotoIds.has(String(item.data.id)) ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={newPhotoIds.has(String(item.data.id)) 
                          ? { 
                              type: 'spring', 
                              stiffness: 200, 
                              damping: 20,
                              delay: 0.1 
                            }
                          : { delay: index * 0.02 }
                        }
                        onClick={() => handleImageToggle({ id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                        className={`aspect-square bg-stone-200 overflow-hidden relative transition-all duration-200 rounded-sm ${
                          isSelectMode
                            ? 'active:opacity-80 cursor-pointer hover:scale-105'
                            : 'active:opacity-80 cursor-pointer hover:scale-105'
                        } shadow-md hover:shadow-xl`}
                      >
                        {(imageLoading[String(item.data.id)] === undefined || imageLoading[String(item.data.id)] === true) && (
                          <motion.div 
                            initial={{ opacity: 1 }}
                            animate={{ opacity: imageLoading[String(item.data.id)] === false ? 0 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse flex items-center justify-center z-10"
                          >
                            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </motion.div>
                        )}
                        <img
                          src={item.data.url}
                          alt={item.data.alt}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoading[String(item.data.id)] === false ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(String(item.data.id))}
                          onLoadStart={() => handleImageStartLoad(String(item.data.id))}
                          onContextMenu={(e) => handleImageContextMenu(e, { id: String(item.data.id), url: item.data.url, alt: item.data.alt })}
                          loading="lazy"
                        />

                        {/* チェックマーク（選択モード時のみ表示） */}
                        {isSelectMode && (
                          <div
                            className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg ${
                              isSelected
                                ? 'bg-champagne-500 border-champagne-600 scale-110'
                                : 'bg-white/80 border-white/90 backdrop-blur-md'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  } else {
                    // インフィード広告
                    return (
                      <motion.div
                        key={`ad-${item.index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="aspect-square bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md overflow-hidden relative flex flex-col items-center justify-center border border-white/30 rounded-sm shadow-lg"
                      >
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-champagne-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest shadow-md">
                            PR
                          </span>
                        </div>
                        <div className="text-center p-4 mt-4 relative z-0">
                          <div className="w-full h-24 bg-white/20 backdrop-blur-sm rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/20">
                            <img
                              src={`https://picsum.photos/300/300?random=${900 + item.index}`}
                              alt="Advertisement"
                              className="w-full h-full object-cover opacity-80"
                            />
                          </div>
                          <p className="text-xs text-stone-700 font-medium">広告</p>
                        </div>
                      </motion.div>
                    );
                  }
                })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* 固定フッター - ダウンロードアクション（両方のタブで表示） */}
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg pb-[env(safe-area-inset-bottom)] z-50">
            <div className="px-4 py-3 max-w-md mx-auto">
              {isSelectMode ? (
                /* 選択モード時: 選択枚数とダウンロードボタン */
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedImageIds([]);
                    }}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>キャンセル</span>
                  </button>
                  <button
                    onClick={handleBulkDownload}
                    disabled={selectedImageIds.length === 0}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>{selectedImageIds.length}枚を保存</span>
                  </button>
                </div>
              ) : (
                /* 通常時: 一括保存と選択して保存の2ボタン */
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-3 bg-white border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 font-semibold rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>一括保存</span>
                  </button>
                  <button
                    onClick={handleSelectModeToggle}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>選択して保存</span>
                  </button>
                </div>
              )}
            </div>
          </footer>

          {/* アップロード用フッター（「この卓の写真」タブのみ、ダウンロードフッターの上に表示） */}
          {activeTab === 'table' && !isSelectMode && (
            <footer className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/50 shadow-lg pb-0 z-40">
              <div className="px-4 py-3 max-w-md mx-auto">
                {/* 投稿上限到達時: LINE連携ボタンに変化（会場設定で有効な場合のみ） */}
                {uploadedCount >= 5 && !isLineConnected && venueInfo?.enableLineUnlock ? (
                  <motion.button
                    type="button"
                    onClick={() => {
                      // LINE公式アカウントの友達追加URLを別タブで開く（ソフトゲート）
                      window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
                      
                      // 即座に制限を解除（無条件で連携済みにする）
                      setIsLineConnected(true);
                      
                      // フィードバック: トースト通知を表示
                      toast.success('無制限モードが解放されました！🎉', {
                        description: 'これからは何枚でもアップロードできます✨',
                        duration: 4000,
                      });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 font-shippori text-lg py-4 px-6 rounded-xl shadow-md bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a3f] text-white hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">LINE連携で無制限にする</span>
                  </motion.button>
                ) : uploadedCount >= 5 && !isLineConnected && !venueInfo?.enableLineUnlock ? (
                  /* 上限到達時（LINE連携機能無効）: 無効化されたアップロードボタン */
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-300 text-gray-600 rounded-xl py-4 px-6 font-semibold cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    <span className="font-semibold">投稿上限に達しました（5枚）</span>
                  </button>
                ) : (
                  /* 通常時: アップロードボタン */
                  <label className="block w-full">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <motion.button
                      type="button"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isUploading}
                      className="w-full active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 text-lg py-4 px-6 rounded-xl shadow-md bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-semibold">アップロード中...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span className="font-semibold">写真をアップロード</span>
                        </>
                      )}
                    </motion.button>
                  </label>
                )}
              </div>
            </footer>
          )}

          {/* ダウンロード待機モーダル（広告表示付き） */}
          <DownloadWaitModal
            open={isDownloadModalOpen}
            onOpenChange={(open) => {
              setIsDownloadModalOpen(open);
              if (!open) {
                // モーダルが閉じられた場合はキャンセル
                setPendingDownloadAction(null);
              }
            }}
            onDownloadStart={() => {
              // カウントダウン終了時にダウンロード処理を実行
              if (pendingDownloadAction) {
                pendingDownloadAction();
              }
              // モーダルの閉じる処理は DownloadWaitModal 側で行われるため、ここでは実行しない
              setPendingDownloadAction(null);
            }}
            waitTime={5}
            adImageUrl="https://via.placeholder.com/600x400?text=Wedding+Ad"
            adTargetUrl="https://example.com/ad"
            adCatchCopy="新生活応援キャンペーン実施中！"
          />

          {/* 開発用デバッグパネル */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-32 right-4 z-[9999]">
              {!isDebugOpen ? (
                <button
                  onClick={() => setIsDebugOpen(true)}
                  className="bg-black/80 hover:bg-black/90 text-yellow-400 p-3 rounded-full shadow-xl border border-white/20 hover:scale-110 transition-all duration-200 active:scale-95"
                  title="デバッグパネルを開く"
                >
                  <span className="text-xl">🔧</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-black/90 backdrop-blur-md rounded-xl text-white text-xs border border-white/20 shadow-2xl w-64"
                >
                  {/* ヘッダー */}
                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                    <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                      <span>🔧</span>
                      <span>Debugger</span>
                    </h3>
                    <button
                      onClick={() => setIsDebugOpen(false)}
                      className="text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors active:scale-95"
                      title="最小化"
                    >
                      ー
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* プラン切り替え */}
                    <div>
                      <p className="text-stone-400 mb-1.5">
                        現在のプラン: <span className="text-white font-bold">{venueInfo?.plan || 'N/A'}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'LIGHT', enableLineUnlock: false });
                            }
                          }}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          LIGHT
                        </button>
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'STANDARD', enableLineUnlock: true });
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          STANDARD
                        </button>
                        <button
                          onClick={() => {
                            if (venueInfo) {
                              setVenueInfo({ ...venueInfo, plan: 'PREMIUM', enableLineUnlock: false });
                            }
                          }}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          PREMIUM
                        </button>
                      </div>
                    </div>

                    {/* LINE連携状態切り替え */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 mb-1.5">
                        LINE連携: <span className="text-white font-bold">{isLineConnected ? 'ON' : 'OFF'}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLineConnected(true)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          ON
                        </button>
                        <button
                          onClick={() => setIsLineConnected(false)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          OFF
                        </button>
                      </div>
                    </div>

                    {/* 投稿数リセット */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 mb-1.5">
                        投稿数: <span className="text-white font-bold">{uploadedCount}枚</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUploadedCount(0)}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          0枚
                        </button>
                        <button
                          onClick={() => setUploadedCount(5)}
                          className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded text-xs font-medium transition-colors active:scale-95"
                        >
                          5枚(上限)
                        </button>
                      </div>
                    </div>

                    {/* 現在の状態表示（参考情報） */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-stone-400 text-[10px] leading-relaxed">
                        LINE連携機能: {venueInfo?.enableLineUnlock ? '有効' : '無効'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 font-sans">読み込み中...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
```

---

## 注意事項

- プラン仕様の変更を反映:
  - LIGHT: 広告あり / LINE連携不可
  - STANDARD: 広告あり / LINE連携可
  - PREMIUM: 広告なし / LINE連携可
- `gallery/page.tsx` は2380行の大きなファイルです。
- `survey/page.tsx` は既読ユーザー向けの自動ロック解除機能が実装されています。
- `WeddingSettingsForm.tsx` はLIGHTプラン時に無制限モードを強制的にfalseとして扱います。
