'use client';

import { useState } from 'react';
import { Building2, Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { SmartStatus } from '@/components/common/SmartStatus';
import type { Venue } from '@/lib/store/venueStore';

// ダミーデータ（実際はAPIから取得）
const DUMMY_VENUES: Venue[] = [
  {
    id: '1',
    name: 'ABC式場',
    status: 'active',
    email: 'contact@abc-venue.com',
    phone: '03-1234-5678',
    address: '東京都渋谷区...',
    todayWeddings: 3,
    monthlyRevenue: 15000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'XYZ式場',
    status: 'suspended',
    email: 'contact@xyz-venue.com',
    phone: '03-9876-5432',
    address: '東京都新宿区...',
    todayWeddings: 0,
    monthlyRevenue: 8000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'DEF式場',
    status: 'active',
    email: 'contact@def-venue.com',
    phone: '03-5555-6666',
    address: '東京都港区...',
    todayWeddings: 5,
    monthlyRevenue: 25000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 統計カードコンポーネント
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
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
          <span className={`text-sm font-medium font-sans ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-sans">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-sans">{value}</p>
      </div>
    </motion.div>
  );
}

export default function SuperAdminDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // 統計データ
  const totalVenues = DUMMY_VENUES.length;
  const activeVenues = DUMMY_VENUES.filter(v => v.status === 'active').length;
  const totalTodayWeddings = DUMMY_VENUES.reduce((sum, v) => sum + v.todayWeddings, 0);
  const totalMonthlyRevenue = DUMMY_VENUES.reduce((sum, v) => sum + v.monthlyRevenue, 0);

  // フィルタリング
  const filteredVenues = selectedStatus
    ? DUMMY_VENUES.filter(v => v.status === selectedStatus)
    : DUMMY_VENUES;

  // ステータスフィルタ
  const statusFilters = [
    { label: '全', value: null },
    { label: 'アクティブ', value: 'active' },
    { label: '一時停止', value: 'suspended' },
    { label: '無効', value: 'inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ページタイトル */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-sans">
          Global Command Center
        </h1>
        <p className="text-gray-600 font-sans">
          全式場の状況を一括管理・監視します
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="登録式場数"
          value={totalVenues}
          change="+2 (今月)"
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          label="アクティブ式場"
          value={activeVenues}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          label="本日の挙式数"
          value={totalTodayWeddings}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          label="今月の売上"
          value={`¥${(totalMonthlyRevenue / 1000000).toFixed(1)}M`}
          change="+12.5%"
          color="bg-pink-500"
        />
      </div>

      {/* 式場一覧テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-sans">式場一覧</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans font-medium">
              + 式場追加
            </button>
          </div>

          {/* ステータスフィルタ */}
          <div className="flex gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value || 'all'}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg font-sans transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  式場名
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  本日の挙式
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  今月の売上
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVenues.map((venue) => (
                <motion.tr
                  key={venue.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/admin/venues/${venue.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-sans group-hover:text-blue-600">
                          {venue.name}
                        </p>
                        <p className="text-xs text-gray-500 font-sans">{venue.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <SmartStatus status={venue.status} type="venue" size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-sans">{venue.todayWeddings}件</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-sans">
                      ¥{(venue.monthlyRevenue / 1000000).toFixed(1)}M
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/admin/venues/${venue.id}`;
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-sans"
                      >
                        詳細
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
