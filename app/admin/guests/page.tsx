'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { TaskCards } from '@/components/admin/Dashboard/TaskCards';
import { DiffIndicator } from '@/components/admin/Dashboard/DiffIndicator';
import { QuickActions } from '@/components/admin/Dashboard/QuickActions';
import type { Guest, TaskMetrics, DiffItem } from '@/lib/types/admin';
import { detectDiff } from '@/lib/utils/diff';
import { Search, Filter, Download, Edit, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// ダミーデータ（実際はSWRでAPIから取得）
const DUMMY_GUESTS: Guest[] = [
  {
    id: '1',
    name: '田中 太郎',
    tableId: 'A',
    weddingId: 1,
    surveyStatus: 'answered',
    allergyStatus: 'none',
    allergies: [],
    status: 'confirmed',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isNew: false,
    hasChanged: false,
  },
  {
    id: '2',
    name: '佐藤 花子',
    tableId: 'B',
    weddingId: 1,
    surveyStatus: 'not_answered',
    allergyStatus: 'reported',
    allergies: ['ナッツ', '乳製品'],
    status: 'pending',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isNew: true,
    hasChanged: true,
  },
  {
    id: '3',
    name: '鈴木 一郎',
    tableId: null,
    weddingId: 1,
    surveyStatus: 'answered',
    allergyStatus: 'none',
    allergies: [],
    status: 'pending',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isNew: true,
    hasChanged: false,
  },
  {
    id: '4',
    name: '山田 次郎',
    tableId: 'A',
    weddingId: 1,
    surveyStatus: 'answered',
    allergyStatus: 'confirmed',
    allergies: ['エビ', 'カニ'],
    status: 'confirmed',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isNew: false,
    hasChanged: false,
  },
];

// ステータスバッジコンポーネント
function StatusBadge({ status, label }: { status: string; label: string }) {
  const colorClasses = {
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    locked: 'bg-stone-100 text-stone-700 border-stone-200',
    answered: 'bg-blue-100 text-blue-700 border-blue-200',
    not_answered: 'bg-red-100 text-red-700 border-red-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    none: 'bg-stone-100 text-stone-400 border-stone-200',
    reported: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border font-sans ${colorClasses[status as keyof typeof colorClasses] || 'bg-stone-100 text-stone-700'}`}>
      {label}
    </span>
  );
}

export default function GuestsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [lastLoginAt] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_last_login');
      return stored ? new Date(stored) : null;
    }
    return null;
  });

  // テーブル列の定義
  const columns: ColumnDef<Guest>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '名前',
        cell: ({ row }) => {
          const guest = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-sans">{guest.name}</span>
              {guest.isNew && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  New
                </span>
              )}
              {guest.hasChanged && !guest.isNew && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Updated
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'tableId',
        header: 'テーブル',
        cell: ({ row }) => {
          const tableId = row.original.tableId;
          return (
            <span className="font-sans">
              {tableId ? `テーブル${tableId}` : <span className="text-stone-400">未割当</span>}
            </span>
          );
        },
      },
      {
        accessorKey: 'surveyStatus',
        header: '回答状況',
        cell: ({ row }) => {
          const status = row.original.surveyStatus;
          const labels = {
            not_answered: '未回答',
            answered: '回答済み',
            approved: '承認済み',
          };
          return <StatusBadge status={status} label={labels[status]} />;
        },
      },
      {
        accessorKey: 'allergyStatus',
        header: 'アレルギー',
        cell: ({ row }) => {
          const guest = row.original;
          if (guest.allergyStatus === 'none') {
            return <StatusBadge status="none" label="なし" />;
          }
          return (
            <div className="space-y-1">
              <StatusBadge 
                status={guest.allergyStatus} 
                label={guest.allergyStatus === 'reported' ? '要確認' : '確認済み'} 
              />
              {guest.allergies.length > 0 && (
                <p className="text-xs text-stone-600 font-sans">{guest.allergies.join(', ')}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: '状態',
        cell: ({ row }) => {
          const status = row.original.status;
          const labels = {
            pending: '未確定',
            confirmed: '確定',
            locked: 'ロック済み',
          };
          return <StatusBadge status={status} label={labels[status]} />;
        },
      },
      {
        id: 'actions',
        header: 'アクション',
        cell: ({ row }) => {
          const guest = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="編集"
              >
                <Edit className="w-4 h-4" />
              </button>
              {guest.status === 'pending' && (
                <button
                  className="p-2 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                  title="確定"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // テーブルインスタンス
  const table = useReactTable({
    data: DUMMY_GUESTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // クイックフィルタ
  const quickFilters = [
    { label: '未回答', filter: 'not_answered', column: 'surveyStatus' },
    { label: 'アレルギーあり', filter: 'reported', column: 'allergyStatus' },
    { label: '未割当', filter: null, column: 'tableId' },
  ];

  const handleQuickFilter = (filter: string | null, column: string) => {
    if (filter === null) {
      table.getColumn(column)?.setFilterValue(null);
    } else {
      table.getColumn(column)?.setFilterValue(filter);
    }
  };

  const diffItems: DiffItem[] = lastLoginAt ? detectDiff(DUMMY_GUESTS, lastLoginAt) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ページタイトル */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-2 font-shippori">
          ゲスト管理
        </h1>
        <p className="text-stone-600 font-sans">
          ゲスト情報の確認・編集・確定を行います
        </p>
      </div>

      {/* Diff Indicator */}
      {diffItems.length > 0 && (
        <DiffIndicator lastLoginAt={lastLoginAt} diffItems={diffItems} />
      )}

      {/* ツールバー */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* 検索 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="名前で検索..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AB9A83] focus:border-transparent font-sans"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-sans">
              <Filter className="w-4 h-4" />
              フィルタ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-sans">
              <Download className="w-4 h-4" />
              エクスポート
            </button>
          </div>
        </div>

        {/* クイックフィルタ */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap gap-2">
          {quickFilters.map((qf) => (
            <button
              key={qf.label}
              onClick={() => handleQuickFilter(qf.filter, qf.column)}
              className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-colors font-sans"
            >
              {qf.label}
            </button>
          ))}
          <button
            onClick={() => {
              setGlobalFilter('');
              table.resetColumnFilters();
            }}
            className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-800 font-sans"
          >
            リセット
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider font-sans cursor-pointer hover:bg-stone-100 transition-colors"
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-stone-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '⇅'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-stone-200">
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-stone-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm font-sans">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <div className="text-sm text-stone-600 font-sans">
            {table.getFilteredRowModel().rows.length}件中{' '}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            件を表示
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
            >
              前へ
            </button>
            <span className="text-sm text-stone-600 font-sans">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
