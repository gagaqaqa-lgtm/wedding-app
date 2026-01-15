'use client';

import { useState } from 'react';
import { DollarSign, Eye, MousePointerClick, Building2, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// モックデータ: 月別収益推移（過去6ヶ月）
const MONTHLY_REVENUE_DATA = [
  { month: 'Aug', revenue: 980000 },
  { month: 'Sep', revenue: 1120000 },
  { month: 'Oct', revenue: 1050000 },
  { month: 'Nov', revenue: 1180000 },
  { month: 'Dec', revenue: 1340000 },
  { month: 'Jan', revenue: 1240000 },
];

// モックデータ: 会場別パフォーマンス
interface VenuePerformance {
  rank: number;
  venueName: string;
  impressions: number;
  revenue: number;
  status: 'active' | 'suspended';
}

const VENUE_PERFORMANCE_DATA: VenuePerformance[] = [
  { rank: 1, venueName: 'グランドホテル東京', impressions: 125000, revenue: 320000, status: 'active' },
  { rank: 2, venueName: 'オーシャンビュー横浜', impressions: 98000, revenue: 245000, status: 'active' },
  { rank: 3, venueName: 'ロイヤルパレス札幌', impressions: 87000, revenue: 198000, status: 'active' },
  { rank: 4, venueName: 'リゾートウェディング沖縄', impressions: 72000, revenue: 165000, status: 'active' },
  { rank: 5, venueName: 'モダンウェディング福岡', impressions: 68000, revenue: 152000, status: 'active' },
  { rank: 6, venueName: 'クラシックホール京都', impressions: 55000, revenue: 98000, status: 'active' },
  { rank: 7, venueName: 'ガーデンウェディング大阪', impressions: 42000, revenue: 75000, status: 'active' },
  { rank: 8, venueName: 'エレガントホール仙台', impressions: 38000, revenue: 68000, status: 'suspended' },
];

// KPIカードコンポーネント
interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  color: string;
}

function KPICard({ icon: Icon, label, value, change, changeType, color }: KPICardProps) {
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
          <div className={`flex items-center gap-1 text-sm font-medium font-sans ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-sans">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-sans">{value}</p>
      </div>
    </motion.div>
  );
}

// シンプルな棒グラフコンポーネント（CSSベース）
function RevenueChart({ data }: { data: typeof MONTHLY_REVENUE_DATA }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-full flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-700 hover:to-indigo-500 transition-colors cursor-pointer group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ¥{item.revenue.toLocaleString()}
                  </div>
                </motion.div>
              </div>
              <span className="text-xs text-gray-600 font-sans font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 font-sans px-2">
        <span>0</span>
        <span>¥{maxRevenue.toLocaleString()}</span>
      </div>
    </div>
  );
}

// 収益バーコンポーネント（テーブル内用）
function RevenueBar({ value, maxValue }: { value: number; maxValue: number }) {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
        />
      </div>
      <span className="text-sm font-medium text-gray-900 font-sans min-w-[80px] text-right">
        ¥{value.toLocaleString()}
      </span>
    </div>
  );
}

export default function AdRevenuePage() {
  const [dateRange, setDateRange] = useState('last-6-months');

  // KPI計算
  const totalRevenue = MONTHLY_REVENUE_DATA[MONTHLY_REVENUE_DATA.length - 1].revenue;
  const previousMonthRevenue = MONTHLY_REVENUE_DATA[MONTHLY_REVENUE_DATA.length - 2].revenue;
  const revenueChange = ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  const revenueChangeType = revenueChange >= 0 ? 'increase' : 'decrease';

  const totalImpressions = VENUE_PERFORMANCE_DATA.reduce((sum, v) => sum + v.impressions, 0);
  const previousMonthImpressions = Math.floor(totalImpressions * 0.9); // 仮の前月データ
  const impressionsChange = ((totalImpressions - previousMonthImpressions) / previousMonthImpressions) * 100;
  const impressionsChangeType = impressionsChange >= 0 ? 'increase' : 'decrease';

  const totalClicks = Math.floor(totalImpressions * 0.018); // CTR 1.8%として計算
  const ctr = ((totalClicks / totalImpressions) * 100).toFixed(1);
  const previousCTR = 1.6; // 仮の前月CTR
  const ctrChange = ((parseFloat(ctr) - previousCTR) / previousCTR) * 100;
  const ctrChangeType = ctrChange >= 0 ? 'increase' : 'decrease';

  const activeAdSlots = VENUE_PERFORMANCE_DATA.filter((v) => v.status === 'active').length;
  const previousActiveSlots = activeAdSlots - 1; // 仮の前月データ
  const slotsChange = ((activeAdSlots - previousActiveSlots) / previousActiveSlots) * 100;
  const slotsChangeType = slotsChange >= 0 ? 'increase' : 'decrease';

  const maxRevenue = Math.max(...VENUE_PERFORMANCE_DATA.map((v) => v.revenue));

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">広告収益レポート</h2>
                  <p className="text-gray-600">プラットフォーム全体の広告収益と傾向を分析します。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="font-sans antialiased">
                  <Calendar className="w-4 h-4 mr-2" />
                  期間指定
                </Button>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="px-8 pb-8 space-y-6">
            {/* KPIサマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={DollarSign}
                label="総収益"
                value={`¥${(totalRevenue / 1000).toFixed(0)}K`}
                change={`${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`}
                changeType={revenueChangeType}
                color="bg-indigo-500"
              />
              <KPICard
                icon={Eye}
                label="総インプレッション"
                value={`${(totalImpressions / 1000).toFixed(0)}K pv`}
                change={`${impressionsChange >= 0 ? '+' : ''}${impressionsChange.toFixed(1)}%`}
                changeType={impressionsChangeType}
                color="bg-indigo-600"
              />
              <KPICard
                icon={MousePointerClick}
                label="クリック率 (CTR)"
                value={`${ctr}%`}
                change={`${ctrChange >= 0 ? '+' : ''}${ctrChange.toFixed(1)}%`}
                changeType={ctrChangeType}
                color="bg-indigo-700"
              />
              <KPICard
                icon={Building2}
                label="アクティブ広告枠"
                value={`${activeAdSlots} venues`}
                change={`${slotsChange >= 0 ? '+' : ''}${slotsChange.toFixed(0)}%`}
                changeType={slotsChangeType}
                color="bg-indigo-800"
              />
            </div>

            {/* グラフとランキング */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 収益推移グラフ */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-sans antialiased">月別収益推移（過去6ヶ月）</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={MONTHLY_REVENUE_DATA} />
                </CardContent>
              </Card>

              {/* 会場別パフォーマンスランキング */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans antialiased">会場別パフォーマンス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {VENUE_PERFORMANCE_DATA.slice(0, 5).map((venue) => (
                      <div key={venue.rank} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 font-sans">#{venue.rank}</span>
                            <span className="text-sm font-medium text-gray-900 font-sans">
                              {venue.venueName}
                            </span>
                          </div>
                          <Badge
                            variant={venue.status === 'active' ? 'indigo' : 'destructive'}
                            className="text-xs"
                          >
                            {venue.status === 'active' ? '稼働中' : '停止中'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 font-sans">
                          {venue.impressions.toLocaleString()} impressions
                        </div>
                        <RevenueBar value={venue.revenue} maxValue={maxRevenue} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 詳細テーブル */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased">会場別パフォーマンス詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">順位</TableHead>
                      <TableHead>会場名</TableHead>
                      <TableHead className="text-right">インプレッション数</TableHead>
                      <TableHead className="text-right">収益額</TableHead>
                      <TableHead>ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VENUE_PERFORMANCE_DATA.map((venue) => (
                      <TableRow key={venue.rank}>
                        <TableCell className="font-medium font-sans">#{venue.rank}</TableCell>
                        <TableCell className="font-medium font-sans">{venue.venueName}</TableCell>
                        <TableCell className="text-right font-sans">
                          {venue.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell className="w-48">
                          <RevenueBar value={venue.revenue} maxValue={maxRevenue} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={venue.status === 'active' ? 'indigo' : 'destructive'}
                            className="text-xs"
                          >
                            {venue.status === 'active' ? '稼働中' : '停止中'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
