"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// 型定義
interface WeddingListItem {
  id: number;
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DD
  orderDeadline: string; // YYYY-MM-DD
  lastOrderUpdate: string | null; // YYYY-MM-DD or null
  status: string; // ステータステキスト
  createdAt: string; // YYYY-MM-DD
  plannerName: string; // 担当者名
  plannerRole: string; // 担当者の役職
}

// アイコン (インラインSVG)
const Icons = {
  Trash: ({ className }: { className?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"/></svg>,
};

// モックデータ
const INITIAL_WEDDINGS: WeddingListItem[] = [
  {
    id: 1,
    groomName: "松本 汐音",
    brideName: "松本 汐音",
    weddingDate: "2026-04-04",
    orderDeadline: "2026-03-04",
    lastOrderUpdate: null,
    status: "アカウント未発行",
    createdAt: "2025-12-07",
    plannerName: "松本",
    plannerRole: "支配人",
  },
  {
    id: 2,
    groomName: "田中 健太",
    brideName: "佐藤 花子",
    weddingDate: "2026-03-20",
    orderDeadline: "2026-02-20",
    lastOrderUpdate: "2026-02-15",
    status: "未注文",
    createdAt: "2025-11-20",
    plannerName: "鈴木",
    plannerRole: "プランナー",
  },
  {
    id: 3,
    groomName: "山田 太郎",
    brideName: "高橋 美咲",
    weddingDate: "2026-03-15",
    orderDeadline: "2026-02-15",
    lastOrderUpdate: "2026-02-10",
    status: "注文済み",
    createdAt: "2025-11-10",
    plannerName: "山田",
    plannerRole: "プランナー",
  },
  {
    id: 4,
    groomName: "中村 一郎",
    brideName: "渡辺 さくら",
    weddingDate: "2026-02-28",
    orderDeadline: "2026-01-28",
    lastOrderUpdate: null,
    status: "アカウント未発行",
    createdAt: "2025-10-28",
    plannerName: "中村",
    plannerRole: "支配人",
  },
];

// 日付を日本語形式にフォーマット（YYYY年MM月DD日）
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`;
};

export default function TablesPage() {
  const router = useRouter();
  const [weddings, setWeddings] = useState<WeddingListItem[]>(INITIAL_WEDDINGS);

  // 挙式を日付順にソート（降順：新しい順）
  const sortedWeddings = useMemo(() => {
    return [...weddings].sort((a, b) => {
      return new Date(b.weddingDate).getTime() - new Date(a.weddingDate).getTime();
    });
  }, [weddings]);

  // 詳細ボタンクリック
  const handleViewDetail = (weddingId: number) => {
    router.push(`/dashboard/weddings/${weddingId}`);
  };

  // 削除ボタンクリック
  const handleDelete = (weddingId: number, groomName: string, brideName: string) => {
    if (confirm(`${groomName}・${brideName} 様の挙式を削除しますか？`)) {
      setWeddings(prev => prev.filter(w => w.id !== weddingId));
    }
  };

  // ステータスのスタイルを取得
  const getStatusStyle = (status: string) => {
    if (status === "アカウント未発行") {
      return "text-gray-600";
    } else if (status === "未注文") {
      return "text-orange-600";
    } else if (status === "注文済み") {
      return "text-green-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-full mx-auto">
          {/* ページヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              挙式一覧
            </h1>
            <p className="text-sm text-gray-600">
              管理中の挙式一覧を表示します
            </p>
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      操作
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      新郎新婦名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      挙式日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      発注締切日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      注文最終更新日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      作成日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      担当者
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedWeddings.map((wedding) => (
                    <tr
                      key={wedding.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* 操作 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(wedding.id)}
                            className="px-3 py-1.5 bg-[#00896F] text-white rounded-md hover:bg-[#00705a] transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            詳細
                            <Icons.ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(wedding.id, wedding.groomName, wedding.brideName)}
                            className="px-3 py-1.5 bg-[#FF4D4D] text-white rounded-md hover:bg-[#e63939] transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Icons.Trash className="w-3 h-3" />
                            削除
                          </button>
                        </div>
                      </td>

                      {/* 新郎新婦名（2段構成） */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{wedding.groomName}</span>
                          <span className="text-sm text-gray-600">{wedding.brideName}</span>
                        </div>
                      </td>

                      {/* 挙式日 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatDate(wedding.weddingDate)}</span>
                      </td>

                      {/* 発注締切日 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatDate(wedding.orderDeadline)}</span>
                      </td>

                      {/* 注文最終更新日 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {wedding.lastOrderUpdate ? formatDate(wedding.lastOrderUpdate) : "-"}
                        </span>
                      </td>

                      {/* ステータス */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStatusStyle(wedding.status)}`}>
                          {wedding.status}
                        </span>
                      </td>

                      {/* 作成日 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatDate(wedding.createdAt)}</span>
                      </td>

                      {/* 担当者 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{wedding.plannerRole}</span>
                          <span className="text-sm text-gray-600">{wedding.plannerName}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
