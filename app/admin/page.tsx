'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Building2, TrendingUp, DollarSign, Activity, ArrowRight, Plus, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Venue型定義（会場管理画面と統一）
export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';

export interface Venue {
  id: string;
  name: string;
  code: string;
  plan: VenuePlan;
  status: VenueStatus;
  lastActiveAt: Date;
  adminName: string;
  adminEmail: string;
  createdAt: Date; // 登録日時を追加
}

// モックデータ（会場管理画面と同様の構造）
const MOCK_VENUES: Venue[] = [
  {
    id: 'v_001',
    name: 'グランドホテル東京',
    code: 'grand-hotel-tokyo',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T10:30:00'),
    adminName: '山田 太郎',
    adminEmail: 'admin@grandhotel-tokyo.jp',
    createdAt: new Date('2024-01-10T10:00:00'),
  },
  {
    id: 'v_002',
    name: 'オーシャンビュー横浜',
    code: 'oceanview-yokohama',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-14T15:20:00'),
    adminName: '佐藤 花子',
    adminEmail: 'contact@oceanview-yokohama.jp',
    createdAt: new Date('2024-01-08T14:00:00'),
  },
  {
    id: 'v_003',
    name: 'ガーデンウェディング大阪',
    code: 'garden-wedding-osaka',
    plan: 'STANDARD',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-13T09:15:00'),
    adminName: '鈴木 一郎',
    adminEmail: 'info@garden-wedding-osaka.jp',
    createdAt: new Date('2024-01-05T09:00:00'),
  },
  {
    id: 'v_004',
    name: 'パレスホテル名古屋',
    code: 'palace-nagoya',
    plan: 'PREMIUM',
    status: 'SUSPENDED',
    lastActiveAt: new Date('2024-01-05T14:00:00'),
    adminName: '田中 美咲',
    adminEmail: 'admin@palace-nagoya.jp',
    createdAt: new Date('2023-12-20T10:00:00'),
  },
  {
    id: 'v_005',
    name: 'リゾートウェディング沖縄',
    code: 'resort-okinawa',
    plan: 'PREMIUM',
    status: 'ONBOARDING',
    lastActiveAt: new Date('2024-01-10T11:45:00'),
    adminName: '伊藤 健',
    adminEmail: 'contact@resort-okinawa.jp',
    createdAt: new Date('2024-01-12T11:00:00'),
  },
  {
    id: 'v_006',
    name: 'クラシックホール京都',
    code: 'classic-kyoto',
    plan: 'STANDARD',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T16:30:00'),
    adminName: '高橋 由美',
    adminEmail: 'info@classic-kyoto.jp',
    createdAt: new Date('2023-12-15T10:00:00'),
  },
  {
    id: 'v_007',
    name: 'モダンウェディング福岡',
    code: 'modern-fukuoka',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-12T13:20:00'),
    adminName: '渡辺 雄一',
    adminEmail: 'admin@modern-fukuoka.jp',
    createdAt: new Date('2023-11-20T10:00:00'),
  },
  {
    id: 'v_008',
    name: 'エレガントホール仙台',
    code: 'elegant-sendai',
    plan: 'STANDARD',
    status: 'SUSPENDED',
    lastActiveAt: new Date('2023-12-28T10:00:00'),
    adminName: '中村 麻衣',
    adminEmail: 'contact@elegant-sendai.jp',
    createdAt: new Date('2023-10-15T10:00:00'),
  },
  {
    id: 'v_009',
    name: 'ロイヤルパレス札幌',
    code: 'royal-sapporo',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T08:00:00'),
    adminName: '小林 正',
    adminEmail: 'info@royal-sapporo.jp',
    createdAt: new Date('2024-01-14T08:00:00'),
  },
  {
    id: 'v_010',
    name: 'シーサイドウェディング神戸',
    code: 'seaside-kobe',
    plan: 'PREMIUM',
    status: 'ONBOARDING',
    lastActiveAt: new Date('2024-01-08T12:30:00'),
    adminName: '加藤 愛',
    adminEmail: 'admin@seaside-kobe.jp',
    createdAt: new Date('2024-01-11T12:00:00'),
  },
];

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
  // 統計データの計算
  const totalVenues = MOCK_VENUES.length;
  const activeVenues = MOCK_VENUES.filter((v) => v.status === 'ACTIVE').length;
  const activeRate = totalVenues > 0 ? ((activeVenues / totalVenues) * 100).toFixed(1) : '0.0';

  // 今月の新規契約数（1月に登録された会場）
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newVenuesThisMonth = MOCK_VENUES.filter((v) => {
    const createdDate = v.createdAt;
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;

  // 今月の推定収益（モック計算：各プランに基づく）
  const estimatedMonthlyRevenue = MOCK_VENUES.reduce((sum, v) => {
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
  const recentVenues = [...MOCK_VENUES]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

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
                            {format(venue.createdAt, 'yyyy/MM/dd', { locale: ja })}
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
