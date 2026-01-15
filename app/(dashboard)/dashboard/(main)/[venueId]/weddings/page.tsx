"use client";

import React, { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import type { Wedding } from "@/lib/types/admin";
import { getVenueInfo } from "@/lib/constants/venues";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";

interface VenueWeddingsPageProps {
  params: Promise<{ venueId: string }>;
}

// モックデータ: 挙式一覧（プランナー名と人数を含む）
// 土日色分け確認用データ: 土曜=青、日曜=赤、平日=グレー
const DUMMY_WEDDINGS: Wedding[] = [
  {
    id: 1,
    date: "2025-11-22", // 土曜日 (Blue check)
    familyNames: "山田 太郎 & 鈴木 花子 様",
    time: "18:00",
    hall: "グランドボールルーム",
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    plannerName: "佐藤 花子",
    guestCount: 80,
    mode: "INTERACTIVE",
  },
  {
    id: 2,
    date: "2025-11-23", // 日曜日 (Red check)
    familyNames: "田中 健太 & 高橋 美咲 様",
    time: "17:30",
    hall: "ガーデンテラス",
    isLocked: true,
    lockedAt: "2025-11-20T10:00:00Z",
    lockedBy: "admin",
    plannerName: "鈴木 花子",
    guestCount: 60,
    mode: "SIMPLE",
  },
  {
    id: 3,
    date: "2025-12-10", // 水曜日 (Gray check)
    familyNames: "佐藤 次郎 & 伊藤 優子 様",
    time: "18:30",
    hall: "スカイチャペル",
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    plannerName: "田中 太郎",
    guestCount: 45,
    mode: "INTERACTIVE",
  },
  {
    id: 4,
    date: "2025-12-13", // 土曜日 (Blue check)
    familyNames: "中村 雄一 & 渡辺 みゆき 様",
    time: "17:00",
    hall: "グランドボールルーム",
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    plannerName: "山田 太郎",
    guestCount: 70,
    mode: "INTERACTIVE",
  },
  {
    id: 5,
    date: "2025-12-14", // 日曜日 (Red check)
    familyNames: "小林 大輔 & 加藤 あかり 様",
    time: "18:00",
    hall: "スカイチャペル",
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    plannerName: "鈴木 花子",
    guestCount: 50,
    mode: "SIMPLE",
  },
  {
    id: 6,
    date: "2025-12-17", // 水曜日 (Gray check)
    familyNames: "吉田 翔太 & 松本 ゆい 様",
    time: "19:00",
    hall: "ガーデンテラス",
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    plannerName: "山田 太郎",
    guestCount: 90,
    mode: "INTERACTIVE",
  },
];

// アイコン (インラインSVG)
const Icons = {
  Plus: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Lock: ({ className }: { className?: string }) => <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Users: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  MapPin: ({ className }: { className?: string }) => <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Heart: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>,
  Copy: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Calendar: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Camera: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>,
  Hash: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  ExternalLink: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

// 日付を読みやすい形式にフォーマット（例: 2024年10月20日）
const formatDateReadable = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

// 日付をYYYY/MM/DD形式にフォーマット（既存の互換性のため）
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 日付のスタイルと曜日を取得するヘルパー関数
const formatDateWithColor = (dateString: string): React.ReactNode => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0:Sun, 1:Mon, ..., 6:Sat
  const daysJP = ['日', '月', '火', '水', '木', '金', '土'];
  const formattedDate = formatDate(dateString);
  
  // デフォルト（平日）
  let colorClass = 'text-gray-800';
  
  if (day === 0) colorClass = 'text-red-600 font-bold'; // 日曜
  if (day === 6) colorClass = 'text-blue-600 font-bold'; // 土曜

  return (
    <span className={`text-xl ${colorClass}`}>
      {formattedDate} <span className="text-sm ml-1">({daysJP[day]})</span>
    </span>
  );
};

// 新郎新婦名をフォーマット（フルネーム表示、&をアクセントカラーで装飾）
const formatFamilyNames = (familyNames: string): React.ReactNode => {
  // 「様」を除去
  const cleaned = familyNames.replace(/ 様$/, '').replace(/様$/, '');
  
  // 「&」または「・」で分割
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

export default function VenueWeddingsPage({ params }: VenueWeddingsPageProps) {
  const { venueId } = use(params);
  const venueInfo = getVenueInfo(venueId);
  
  // 動作確認用: venueIdに応じて契約プランを動的に決定
  // venue-001 は LIGHT プラン、それ以外は STANDARD プラン
  const currentPlan: 'LIGHT' | 'STANDARD' = useMemo(() => {
    return venueId === 'venue-001' ? 'LIGHT' : 'STANDARD';
  }, [venueId]);
  
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>(DUMMY_WEDDINGS);
  // 各挙式の写真枚数無制限モードの状態を管理
  const [unlimitedPhotosMap, setUnlimitedPhotosMap] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false,
    4: true,
    5: false,
    6: false,
  });
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);
  
  // System IDを生成（例: WD-001）
  const getSystemId = (weddingId: number): string => {
    return `WD-${weddingId.toString().padStart(3, '0')}`;
  };
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("全て");
  const [selectedPlanner, setSelectedPlanner] = useState("全員");
  
  // 新規挙式フォームの状態
  const [newWedding, setNewWedding] = useState({
    groomName: "",
    brideName: "",
    date: "",
    time: "",
    mode: "INTERACTIVE" as "INTERACTIVE" | "SIMPLE",
  });

  // 新郎新婦用URLコピー状態
  const [copiedCoupleLinkId, setCopiedCoupleLinkId] = useState<number | null>(null);

  // ユニークな会場とプランナーのリストを生成
  const uniqueVenues = useMemo(() => {
    const venues = new Set(DUMMY_WEDDINGS.map(w => w.hall));
    return ["全て", ...Array.from(venues)];
  }, []);

  const uniquePlanners = useMemo(() => {
    const planners = new Set(DUMMY_WEDDINGS.map(w => w.plannerName));
    return ["全員", ...Array.from(planners)];
  }, []);

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

    // 会場でフィルタリング
    if (selectedVenue !== "全て") {
      filtered = filtered.filter((wedding) => wedding.hall === selectedVenue);
    }

    // プランナーでフィルタリング
    if (selectedPlanner !== "全員") {
      filtered = filtered.filter((wedding) => wedding.plannerName === selectedPlanner);
    }

    // 日付順にソート（昇順）
    return filtered.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [weddings, searchTerm, selectedVenue, selectedPlanner]);

  // 新郎新婦用URLをコピー
  const copyCoupleLink = async (weddingId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // カードのクリックイベントを防ぐ
    const url = `${window.location.origin}/couple/login?id=${weddingId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCoupleLinkId(weddingId);
      setTimeout(() => setCopiedCoupleLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('URLのコピーに失敗しました。');
    }
  };

  // 新規挙式登録モーダルを開く
  const handleOpenNewWeddingModal = () => {
    setNewWedding({ groomName: "", brideName: "", date: "", time: "", mode: "INTERACTIVE" });
    setIsNewWeddingModalOpen(true);
  };

  // 新規挙式登録モーダルを閉じる
  const handleCloseNewWeddingModal = () => {
    setIsNewWeddingModalOpen(false);
    setNewWedding({ groomName: "", brideName: "", date: "", time: "", mode: "INTERACTIVE" });
  };

  // 新規挙式を作成
  const handleCreateWedding = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!newWedding.groomName.trim() || !newWedding.brideName.trim() || !newWedding.date || !newWedding.time) {
      alert("すべての項目を入力してください。");
      return;
    }

    setIsCreating(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      const newId = Math.max(...weddings.map(w => w.id), 0) + 1;
      const newWeddingData: Wedding = {
        id: newId,
        date: newWedding.date,
        familyNames: `${newWedding.groomName}・${newWedding.brideName} 様`,
        time: newWedding.time,
        hall: "未定",
        isLocked: false,
        lockedAt: null,
        lockedBy: null,
        plannerName: "未設定",
        guestCount: 0,
        mode: newWedding.mode,
      };
      
      setWeddings([...weddings, newWeddingData]);
      setIsCreating(false);
      handleCloseNewWeddingModal();
      alert("挙式を登録しました！");
    }, 800);
  };

  // 挙式詳細画面へ遷移
  const handleGoToWeddingDetail = (weddingId: number) => {
    router.push(`/dashboard/${venueId}/weddings/${weddingId}`);
  };

  // 写真枚数無制限モードの切り替え
  const handleToggleUnlimitedPhotos = (weddingId: number, checked: boolean) => {
    if (currentPlan === 'LIGHT') {
      return; // Light Planの場合は何もしない
    }
    setUnlimitedPhotosMap(prev => ({
      ...prev,
      [weddingId]: checked,
    }));
    // TODO: API呼び出し
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
                <p className="text-sm text-gray-600 mt-1">会場: {venueInfo.name} ({venueId})</p>
              </div>
            </div>
            <button
              onClick={handleOpenNewWeddingModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md"
            >
              <Icons.Plus />
              新規挙式登録
            </button>
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
                {/* 会場で絞り込み */}
                <div className="relative w-full md:w-40">
                  <select
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="block w-full h-12 pl-4 pr-10 border border-gray-300 rounded-xl md:rounded-l-xl md:rounded-r-none bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ease-in-out"
                  >
                    {uniqueVenues.map((venue) => (
                      <option key={venue} value={venue}>
                        {venue === "全て" ? "全ての会場" : venue}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                {/* プランナーで絞り込み */}
                <div className="relative w-full md:w-40 mt-2 md:mt-0">
                  <Icons.User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={selectedPlanner}
                    onChange={(e) => setSelectedPlanner(e.target.value)}
                    className="block w-full h-12 pl-10 pr-10 border border-gray-300 rounded-xl md:rounded-r-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ease-in-out"
                  >
                    {uniquePlanners.map((planner) => (
                      <option key={planner} value={planner}>
                        {planner === "全員" ? "担当者: 全員" : planner}
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

          {/* 挙式リスト（インタラクティブなカード形式） */}
          {filteredWeddings.length > 0 ? (
            <div className="space-y-3">
              {filteredWeddings.map((wedding) => {
                const isUnlimitedActive = unlimitedPhotosMap[wedding.id] || false;
                return (
                  <div
                    key={wedding.id}
                    onClick={() => handleGoToWeddingDetail(wedding.id)}
                    className={`group flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-200 hover:-translate-y-[2px] ${
                      currentPlan === 'LIGHT' ? 'opacity-90' : ''
                    }`}
                  >
                    {/* 1. 日付 & ステータス */}
                    <div className="flex-shrink-0 w-32">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {formatDate(wedding.date)}
                      </div>
                      <StatusBadge isLocked={wedding.isLocked} />
                    </div>

                    {/* 2. 新郎新婦名（メイン）とURLコピーボタン */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {formatFamilyNames(wedding.familyNames)}
                      </h3>
                      <button
                        onClick={(e) => copyCoupleLink(wedding.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          copiedCoupleLinkId === wedding.id
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="新郎新婦用URLをコピー"
                      >
                        {copiedCoupleLinkId === wedding.id ? (
                          <Icons.Check className="w-4 h-4" />
                        ) : (
                          <Icons.Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* 3. 機能スイッチエリア */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      {currentPlan === 'LIGHT' ? (
                        <Tooltip content="Standardプラン限定機能です。アップグレードが必要です。新郎新婦様のアップロードは常に無制限です。" side="top">
                          <div 
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs font-medium text-gray-600">ゲスト投稿の無制限モード</span>
                            <Icons.Lock className="w-4 h-4 text-gray-400" />
                            <Switch checked={false} disabled={true} />
                          </div>
                        </Tooltip>
                      ) : (
                        <Tooltip content="新郎新婦様のアップロードは常に無制限です" side="top">
                          <div 
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`text-xs font-medium ${
                              isUnlimitedActive ? 'text-emerald-700' : 'text-gray-600'
                            }`}>
                              ゲスト投稿の無制限モード
                            </span>
                            <span className={`text-xs ${
                              isUnlimitedActive ? 'text-emerald-600' : 'text-gray-500'
                            }`}>
                              {isUnlimitedActive ? '無制限' : '制限中'}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={isUnlimitedActive}
                                onCheckedChange={(checked) => handleToggleUnlimitedPhotos(wedding.id, checked)}
                              />
                            </div>
                          </div>
                        </Tooltip>
                      )}
                    </div>

                    {/* 4. アクションボタン（右端） */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="p-2 text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <Icons.ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedVenue !== "全て" || selectedPlanner !== "全員"
                  ? "条件に一致する挙式がありません"
                  : "登録されている挙式がありません"}
              </p>
              {(searchTerm || selectedVenue !== "全て" || selectedPlanner !== "全員") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedVenue("全て");
                    setSelectedPlanner("全員");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                >
                  フィルターをリセット
                </button>
              )}
              {!(searchTerm || selectedVenue !== "全て" || selectedPlanner !== "全員") && (
                <button
                  onClick={handleOpenNewWeddingModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold"
                >
                  <Icons.Plus />
                  新規挙式を登録
                </button>
              )}
            </div>
          )}

          {/* 新規挙式登録モーダル */}
          {isNewWeddingModalOpen && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
              onClick={handleCloseNewWeddingModal}
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* モーダルヘッダー */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">新規挙式登録</h2>
                  <button
                    onClick={handleCloseNewWeddingModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icons.X />
                  </button>
                </div>

                {/* モーダルコンテンツ */}
                <form onSubmit={handleCreateWedding} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* 新郎名 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        新郎名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newWedding.groomName}
                        onChange={(e) => setNewWedding({ ...newWedding, groomName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        placeholder="例: 田中太郎"
                      />
                    </div>

                    {/* 新婦名 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        新婦名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newWedding.brideName}
                        onChange={(e) => setNewWedding({ ...newWedding, brideName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        placeholder="例: 鈴木花子"
                      />
                    </div>

                    {/* 挙式日 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        挙式日 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={newWedding.date}
                        onChange={(e) => setNewWedding({ ...newWedding, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* 挙式時間 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        挙式時間 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={newWedding.time}
                        onChange={(e) => setNewWedding({ ...newWedding, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* モード選択 */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        モード <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mode"
                            value="INTERACTIVE"
                            checked={newWedding.mode === "INTERACTIVE"}
                            onChange={(e) => setNewWedding({ ...newWedding, mode: e.target.value as "INTERACTIVE" | "SIMPLE" })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Interactive（テーブル共有あり）</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mode"
                            value="SIMPLE"
                            checked={newWedding.mode === "SIMPLE"}
                            onChange={(e) => setNewWedding({ ...newWedding, mode: e.target.value as "INTERACTIVE" | "SIMPLE" })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Simple（DLのみ）</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* モーダルフッター */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseNewWeddingModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                    >
                      {isCreating ? (
                        "登録中..."
                      ) : (
                        <>
                          <Icons.Check />
                          登録
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
