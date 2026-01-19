"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { Wedding } from "@/lib/types/schema";
import { getVenueInfo } from "@/lib/services/mock/venueService";
import { createWedding } from "@/lib/services/mock/weddingService";
import { WeddingListTable } from "./WeddingListTable";
import { CreateWeddingDialog } from "./CreateWeddingDialog";

interface WeddingListClientProps {
  weddings: Wedding[];
  venueId: string;
}

// アイコン (インラインSVG)
const Icons = {
  Plus: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Lock: ({ className }: { className?: string }) => <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Search: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Heart: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>,
  Copy: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
};

// 日付をYYYY/MM/DD形式にフォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 新郎新婦名をフォーマット（フルネーム表示、&をアクセントカラーで装飾）
const formatFamilyNames = (familyNames: string): React.ReactNode => {
  const cleaned = familyNames.replace(/ 様$/, '').replace(/様$/, '');
  const parts = cleaned.split(/\s*[&・]\s*/);
  
  if (parts.length === 2) {
    return (
      <>
        <span className="text-gray-900 font-bold">{parts[0].trim()}</span>
        <span className="text-gray-400 font-light mx-1.5">&</span>
        <span className="text-gray-900 font-bold">{parts[1].trim()}</span>
        <span className="text-gray-500 text-base ml-1">様</span>
      </>
    );
  }
  return <span className="text-gray-900 font-bold">{familyNames}</span>;
};

// ステータスバッジコンポーネント（ピル型）
const StatusBadge = ({ isLocked }: { isLocked: boolean }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      isLocked 
        ? "bg-gray-100 text-gray-700 border border-gray-200"
        : "bg-blue-50 text-blue-700 border border-blue-200"
    }`}>
      {isLocked && <Icons.Lock className="w-3 h-3" />}
      {isLocked ? "完了" : "準備中"}
    </span>
  );
};

/**
 * 挙式一覧のクライアントコンポーネント
 * 
 * Server Componentから渡されたデータを表示し、インタラクティブなUIを提供
 */
export function WeddingListClient({ weddings: initialWeddings, venueId }: WeddingListClientProps) {
  // Optimistic UI: 内部状態で挙式リストを管理
  const [weddings, setWeddings] = useState<Wedding[]>(initialWeddings);
  const [venueInfo, setVenueInfo] = useState<{ name: string; plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanner, setSelectedPlanner] = useState("全員");

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

  // ユニークなプランナーのリストを生成
  const uniquePlanners = useMemo(() => {
    const planners = new Set(weddings.map(w => w.plannerName).filter(Boolean));
    return ["全員", ...Array.from(planners)];
  }, [weddings]);

  // フィルタリングされた挙式リスト
  const filteredWeddings = useMemo(() => {
    let filtered = weddings;

    // 検索語でフィルタリング
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (wedding) =>
          wedding.familyNames.toLowerCase().includes(lowerCaseSearchTerm) ||
          wedding.date.includes(lowerCaseSearchTerm)
      );
    }

    // プランナーでフィルタリング
    if (selectedPlanner !== "全員") {
      filtered = filtered.filter((wedding) => wedding.plannerName === selectedPlanner);
    }

    // 日付順にソート（昇順）
    return filtered.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [weddings, searchTerm, selectedPlanner]);

  // 新規挙式登録のハンドラ（Optimistic UI）
  const handleCreateWedding = async (data: {
    groomName: string;
    brideName: string;
    date: string;
    time: string;
    guestCount: number;
  }) => {
    try {
      // Service層で挙式を作成（モック実装）
      const newWedding = await createWedding({
        date: data.date,
        time: data.time,
        hall: "未定",
        familyNames: `${data.groomName}・${data.brideName} 様`,
        plannerName: "未設定",
        guestCount: data.guestCount,
        venueId,
        mode: "INTERACTIVE",
      });

      // Optimistic UI: 即座にリストに追加（リロードで消える安全設計）
      setWeddings(prev => [...prev, newWedding]);

      console.log('Mock: Wedding created and added to list (will disappear on reload)');
    } catch (error) {
      console.error('Failed to create wedding:', error);
      throw error; // エラーを再スローしてダイアログ側で処理
    }
  };


  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.Heart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">挙式管理</h1>
                <p className="text-sm text-gray-600 mt-1">会場: {venueInfo?.name || venueId} ({venueId})</p>
              </div>
            </div>
            <CreateWeddingDialog
              trigger={
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md">
                  <Icons.Plus />
                  新規挙式登録
                </button>
              }
              onSubmit={handleCreateWedding}
            />
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            {/* フローティングコントロールバー */}
            <div className="bg-white shadow-sm rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-0">
                {/* 検索ボックス */}
                <div className="relative flex-1 w-full">
                  <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="新郎新婦名、日付で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl md:rounded-r-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ease-in-out"
                  />
                </div>

                {/* セパレーター */}
                <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

                {/* 絞り込みフィルター */}
                <div className="flex flex-col md:flex-row gap-0 w-full md:w-auto mt-2 md:mt-0">
                  {/* プランナーで絞り込み */}
                  <div className="relative w-full md:w-40">
                    <Icons.User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <select
                      value={selectedPlanner}
                      onChange={(e) => setSelectedPlanner(e.target.value)}
                      className="block w-full h-12 pl-10 pr-10 border border-gray-300 rounded-xl md:rounded-l-xl md:rounded-r-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ease-in-out"
                    >
                      {uniquePlanners.map((planner) => (
                        <option key={planner} value={planner}>
                          {planner}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 挙式リスト */}
            {filteredWeddings.length > 0 ? (
              <WeddingListTable
                initialWeddings={weddings}
                venueId={venueId}
                plan={venueInfo?.plan}
                filteredWeddings={filteredWeddings}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedPlanner !== "全員"
                    ? "条件に一致する挙式がありません"
                    : "登録されている挙式がありません"}
                </p>
                {(searchTerm || selectedPlanner !== "全員") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedPlanner("全員");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                  >
                    フィルターをリセット
                  </button>
                )}
                {!(searchTerm || selectedPlanner !== "全員") && (
                  <CreateWeddingDialog
                    trigger={
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold">
                        <Icons.Plus />
                        新規挙式を登録
                      </button>
                    }
                    onSubmit={handleCreateWedding}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
