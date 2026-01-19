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
