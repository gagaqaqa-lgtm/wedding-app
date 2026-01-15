"use client";

import React, { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import type { Wedding, TableLayout } from "@/lib/types/admin";
import { getVenueInfo } from "@/lib/constants/venues";

interface WeddingDetailPageProps {
  params: Promise<{ venueId: string; id: string }>;
}

// アイコン (インラインSVG)
const Icons = {
  ArrowLeft: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Save: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Plus: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Users: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Lock: ({ className }: { className?: string }) => <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Upload: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Image: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Groom: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bride: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// モックデータ: 挙式データ（実際はAPIから取得）
const getWeddingById = (id: number): Wedding | null => {
  const weddings: Wedding[] = [
    {
      id: 1,
      date: "2024-10-20",
      familyNames: "田中・佐藤 様",
      time: "18:00",
      hall: "グランドボールルーム",
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      plannerName: "鈴木 花子",
      guestCount: 80,
    },
    {
      id: 2,
      date: "2024-10-22",
      familyNames: "山田・伊藤 様",
      time: "17:30",
      hall: "スカイチャペル",
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      plannerName: "山田 太郎",
      guestCount: 60,
    },
    {
      id: 3,
      date: "2024-10-25",
      familyNames: "佐藤・高橋 様",
      time: "18:30",
      hall: "ガーデンテラス",
      isLocked: true,
      lockedAt: "2024-10-20T10:00:00Z",
      lockedBy: "admin",
      plannerName: "鈴木 花子",
      guestCount: 100,
    },
  ];
  return weddings.find(w => w.id === id) || null;
};

// 日付・時間をフォーマット
const formatDateTime = (dateString: string, timeString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${timeString}`;
};

// 新郎新婦名をフォーマット（&をアクセントカラーで装飾）
const formatFamilyNames = (familyNames: string): React.ReactNode => {
  const cleaned = familyNames.replace(' 様', '').replace('様', '');
  const parts = cleaned.split('・');
  
  if (parts.length === 2) {
    return (
      <span>
        <span className="text-gray-900">{parts[0]}</span>
        <span className="text-gray-400 font-light mx-2">&</span>
        <span className="text-gray-900">{parts[1]}</span>
        <span className="text-gray-500 ml-1">様</span>
      </span>
    );
  }
  return <span className="text-gray-900">{familyNames}</span>;
};

// 新郎新婦の名前からフルネームを生成
const formatFullName = (
  groomSei: string,
  groomMei: string,
  brideSei: string,
  brideMei: string
): React.ReactNode => {
  const groomFull = `${groomSei.trim()} ${groomMei.trim()}`.trim();
  const brideFull = `${brideSei.trim()} ${brideMei.trim()}`.trim();
  
  if (!groomFull && !brideFull) {
    return <span className="text-gray-500">名前を入力してください</span>;
  }
  
  if (groomFull && brideFull) {
    return (
      <span>
        <span className="text-gray-900">{groomFull}</span>
        <span className="text-gray-400 font-light mx-2">&</span>
        <span className="text-gray-900">{brideFull}</span>
        <span className="text-gray-500 ml-1">様</span>
      </span>
    );
  }
  
  if (groomFull) {
    return <span className="text-gray-900">{groomFull} 様</span>;
  }
  
  return <span className="text-gray-900">{brideFull} 様</span>;
};

// ステータスバッジ
const StatusBadge = ({ isLocked }: { isLocked: boolean }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      isLocked 
        ? "bg-purple-50 text-purple-700 border border-purple-200"
        : "bg-blue-50 text-blue-700 border border-blue-200"
    }`}>
      {isLocked && <Icons.Lock className="w-3 h-3" />}
      {isLocked ? "確定" : "準備中"}
    </span>
  );
};

type TabType = 'settings' | 'tables' | 'photos';

// 写真の型定義
interface Photo {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
}

export default function WeddingDetailPage({ params }: WeddingDetailPageProps) {
  const { venueId, id } = use(params);
  const venueInfo = getVenueInfo(venueId);
  const router = useRouter();
  const weddingId = Number(id);
  
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [isSaving, setIsSaving] = useState(false);
  
  // 挙式データを取得（実際はAPIから取得）
  const wedding = useMemo(() => getWeddingById(weddingId), [weddingId]);
  
  // この挙式専用のテーブルリスト（実際はAPIから取得）
  const [tables, setTables] = useState<TableLayout[]>([]);
  
  // 一括作成用の状態
  const [bulkCreateCount, setBulkCreateCount] = useState<number>(10);
  const [namingPattern, setNamingPattern] = useState<'alphabet' | 'number' | 'matsu'>('alphabet');

  // 写真管理の状態
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=800&fit=crop',
      name: '前撮り写真 - カップル',
      uploadedAt: '2024-10-15T10:00:00Z',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=800&fit=crop',
      name: '会場の風景 - エントランス',
      uploadedAt: '2024-10-15T10:05:00Z',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=800&fit=crop',
      name: '前撮り写真 - ドレス',
      uploadedAt: '2024-10-15T10:10:00Z',
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
      name: '会場の風景 - メインホール',
      uploadedAt: '2024-10-15T10:15:00Z',
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=1000&fit=crop',
      name: '前撮り写真 - ブーケ',
      uploadedAt: '2024-10-15T10:20:00Z',
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=800&fit=crop',
      name: '会場の風景 - ガーデン',
      uploadedAt: '2024-10-15T10:25:00Z',
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // 新郎新婦の名前の状態
  const [groomSei, setGroomSei] = useState("田中");
  const [groomMei, setGroomMei] = useState("健太");
  const [brideSei, setBrideSei] = useState("佐藤");
  const [brideMei, setBrideMei] = useState("花子");

  // 利用可能な会場リスト（ダミーデータ）
  // 将来的には `/venues` から取得する想定
  const availableVenues = [
    { id: 'v1', name: 'グランドボールルーム', capacity: 120 },
    { id: 'v2', name: 'ガーデンテラス', capacity: 80 },
    { id: 'v3', name: 'スカイラウンジ', capacity: 40 },
  ];

  // 選択された会場の状態
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(() => {
    if (!wedding?.hall) return null;
    // 既存の会場名と一致する会場を探す
    const matchedVenue = availableVenues.find(v => v.name === wedding.hall);
    return matchedVenue?.id || null;
  });

  // 既存のデータから初期値を設定
  React.useEffect(() => {
    if (wedding) {
      const cleaned = wedding.familyNames.replace(' 様', '').replace('様', '');
      const parts = cleaned.split(/\s*[&・]\s*/);
      if (parts.length === 2) {
        const groomParts = parts[0].trim().split(/\s+/);
        const brideParts = parts[1].trim().split(/\s+/);
        if (groomParts.length >= 2) {
          setGroomSei(groomParts[0]);
          setGroomMei(groomParts.slice(1).join(' '));
        }
        if (brideParts.length >= 2) {
          setBrideSei(brideParts[0]);
          setBrideMei(brideParts.slice(1).join(' '));
        }
      }
    }
  }, [wedding]);

  // 挙式が見つからない場合
  if (!wedding) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">挙式が見つかりません</p>
              <button
                onClick={() => router.push(`/dashboard/${venueId}/weddings`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2BB996] text-white rounded-lg hover:bg-[#25a082] transition-colors font-bold"
              >
                <Icons.ArrowLeft />
                挙式一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 命名パターンに基づいてテーブル名を生成
  const generateTableName = (index: number, pattern: 'alphabet' | 'number' | 'matsu'): string => {
    if (pattern === 'alphabet') {
      // アルファベット順（A-Z, その後AA-ZZ...）
      const alphabetCount = 26;
      const firstLetter = String.fromCharCode(65 + (index % alphabetCount)); // A-Z
      if (index < alphabetCount) {
        return `${firstLetter}卓`;
      } else {
        const secondIndex = Math.floor(index / alphabetCount) - 1;
        const secondLetter = String.fromCharCode(65 + (secondIndex % alphabetCount));
        return `${firstLetter}${secondLetter}卓`;
      }
    } else if (pattern === 'number') {
      // 数字順
      return `${index + 1}卓`;
    } else {
      // 松竹梅パターン
      const patterns = ['松', '竹', '梅', '蘭', '菊', '桜', '楓', '桐', '桂', '杉', '柳', '柏', '椿', '菖蒲', '牡丹', '薔薇', '百合', '蓮', '向日葵', '桔梗', '撫子', '朝顔', '紫陽花', '彼岸花', '水仙', 'チューリップ'];
      const patternIndex = index % patterns.length;
      const repeatCount = Math.floor(index / patterns.length);
      if (repeatCount === 0) {
        return `${patterns[patternIndex]}卓`;
      } else {
        return `${patterns[patternIndex]}${repeatCount + 1}卓`;
      }
    }
  };

  // 卓を1つ追加
  const handleAddTable = () => {
    const nextIndex = tables.length;
    const newTable: TableLayout = {
      id: `table_${Date.now()}`,
      name: generateTableName(nextIndex, 'alphabet'), // デフォルトはアルファベット順
      capacity: 6,
      guests: [],
    };
    setTables([...tables, newTable]);
  };

  // 卓を一括作成
  const handleBulkCreate = () => {
    if (bulkCreateCount < 1) {
      alert('作成する数は1以上を指定してください。');
      return;
    }
    if (bulkCreateCount > 100) {
      alert('一度に作成できる数は100個までです。');
      return;
    }

    const startIndex = tables.length;
    const newTables: TableLayout[] = Array.from({ length: bulkCreateCount }, (_, i) => ({
      id: `table_${Date.now()}_${i}`,
      name: generateTableName(startIndex + i, namingPattern),
      capacity: 6,
      guests: [],
    }));

    setTables([...tables, ...newTables]);
    // 成功メッセージ
    alert(`${bulkCreateCount}個の卓を作成しました！`);
  };

  // 卓名を変更
  const handleTableNameChange = (tableId: string, newName: string) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, name: newName } : t
    ));
  };

  // 卓の最大人数を変更
  const handleTableCapacityChange = (tableId: string, newCapacity: number) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, capacity: newCapacity } : t
    ));
  };

  // 卓を削除
  const handleDeleteTable = (tableId: string) => {
    if (confirm('この卓を削除しますか？')) {
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
  };

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    // TODO: API呼び出し
    setTimeout(() => {
      setIsSaving(false);
      alert('設定を保存しました！');
    }, 800);
  };

  // 写真アップロード処理
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      uploadedAt: new Date().toISOString(),
    }));

    setPhotos(prev => [...newPhotos, ...prev]);
  };

  // ドラッグ＆ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // ファイル選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    // 同じファイルを再度選択できるようにリセット
    e.target.value = '';
  };

  // 写真削除処理
  const handleDeletePhoto = (photoId: string) => {
    if (confirm('この写真を削除しますか？')) {
      setPhotos(prev => {
        const photo = prev.find(p => p.id === photoId);
        if (photo && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
        return prev.filter(p => p.id !== photoId);
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダーエリア */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {/* 戻るボタン */}
                  <button
                    onClick={() => router.push(`/dashboard/${venueId}/weddings`)}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                  >
                    <Icons.ArrowLeft />
                    挙式一覧に戻る
                  </button>
                  
                  {/* 会場情報表示 */}
                  <p className="text-sm text-gray-500 mb-2">会場: {venueInfo.name} ({venueId})</p>
                  
                  {/* 新郎新婦名（動的に更新） */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-relaxed">
                    {formatFullName(groomSei, groomMei, brideSei, brideMei)}
                  </h1>
                  
                  {/* 挙式日・時間・ステータス */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {formatDateTime(wedding.date, wedding.time)}
                    </span>
                    {wedding.hall && (
                      <span className="text-sm text-gray-500">
                        {wedding.hall}
                      </span>
                    )}
                    <StatusBadge isLocked={wedding.isLocked} />
                  </div>
                </div>
                
                {/* 保存ボタン */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                >
                  <Icons.Save />
                  {isSaving ? "保存中..." : "保存"}
                </button>
              </div>

              {/* タブナビゲーション */}
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                    activeTab === 'settings'
                      ? "text-emerald-600"
                      : "text-gray-600 hover:text-gray-900"
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
                      : "text-gray-600 hover:text-gray-900"
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
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  写真
                  {activeTab === 'photos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="p-8">
            {/* 基本情報タブ */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">基本情報</h2>
                <div className="space-y-8">
                  {/* 新郎・新婦名入力エリア（2カラム） */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 新郎エリア */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Icons.Groom className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">新郎 (Groom)</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            姓 (Sei)
                          </label>
                          <input
                            type="text"
                            value={groomSei}
                            onChange={(e) => setGroomSei(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                            placeholder="田中"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            名 (Mei)
                          </label>
                          <input
                            type="text"
                            value={groomMei}
                            onChange={(e) => setGroomMei(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                            placeholder="健太"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 新婦エリア */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                          <Icons.Bride className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">新婦 (Bride)</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            姓 (Sei)
                          </label>
                          <input
                            type="text"
                            value={brideSei}
                            onChange={(e) => setBrideSei(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                            placeholder="佐藤"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            名 (Mei)
                          </label>
                          <input
                            type="text"
                            value={brideMei}
                            onChange={(e) => setBrideMei(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                            placeholder="花子"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* その他の基本情報 */}
                  <div className="pt-6 border-t border-gray-200 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        挙式日時
                      </label>
                      <input
                        type="datetime-local"
                        defaultValue={`${wedding.date}T${wedding.time}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        会場
                      </label>
                      {/* Segmented Control (タブ形式) */}
                      <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
                        {availableVenues.map((venue) => (
                          <button
                            key={venue.id}
                            type="button"
                            onClick={() => setSelectedVenueId(venue.id)}
                            className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-medium text-sm transition-all duration-200 ease-in-out min-w-[120px] ${
                              selectedVenueId === venue.id
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-bold text-sm md:text-base">{venue.name}</span>
                              <span className={`text-xs ${
                                selectedVenueId === venue.id
                                  ? 'text-emerald-600'
                                  : 'text-gray-500'
                              }`}>
                                最大{venue.capacity}名
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedVenueId && (
                        <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                          選択中: <span className="font-medium">{availableVenues.find(v => v.id === selectedVenueId)?.name}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        メモ
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        placeholder="挙式に関するメモを入力してください"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 卓設定タブ */}
            {activeTab === 'tables' && (
              <div className="space-y-6">
                {/* 一括作成エリア */}
                <div className="bg-white rounded-xl border-2 border-emerald-200 shadow-sm p-6 mb-6">
                  <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        一括作成
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={bulkCreateCount}
                          onChange={(e) => setBulkCreateCount(Number(e.target.value))}
                          className="w-24 h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-gray-900 text-center transition-all duration-200 ease-in-out"
                        />
                        <span className="text-sm text-gray-600 font-medium">個</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        命名パターン
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="namingPattern"
                            value="alphabet"
                            checked={namingPattern === 'alphabet'}
                            onChange={() => setNamingPattern('alphabet')}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">A,B,C...</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="namingPattern"
                            value="number"
                            checked={namingPattern === 'number'}
                            onChange={() => setNamingPattern('number')}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">1,2,3...</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="namingPattern"
                            value="matsu"
                            checked={namingPattern === 'matsu'}
                            onChange={() => setNamingPattern('matsu')}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">松,竹,梅...</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleBulkCreate}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <Icons.Plus />
                      作成
                    </button>
                  </div>
                </div>

                {/* タイトルと1つ追加ボタン */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">卓一覧</h2>
                  <button
                    onClick={handleAddTable}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    1つ追加
                  </button>
                </div>

                {/* 卓リスト（グリッド表示） */}
                {tables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out p-6"
                      >
                        {/* ヘッダー（削除ボタン） */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            ID: {table.id.split('_')[1]?.slice(0, 6) || 'N/A'}
                          </span>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Icons.Trash />
                          </button>
                        </div>

                        {/* 卓名入力 */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-emerald-600 mb-2">
                            卓名
                          </label>
                          <input
                            type="text"
                            value={table.name}
                            onChange={(e) => handleTableNameChange(table.id, e.target.value)}
                            className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-gray-900 transition-all duration-200 ease-in-out"
                            placeholder="例: A卓、松の間"
                          />
                        </div>

                        {/* 最大人数入力 */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <Icons.Users className="w-4 h-4" />
                            最大人数
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={table.capacity}
                            onChange={(e) => handleTableCapacityChange(table.id, Number(e.target.value))}
                            className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-gray-900 transition-all duration-200 ease-in-out"
                          />
                        </div>

                        {/* 現在のゲスト数 */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>現在のゲスト数</span>
                            <span className="font-bold text-gray-700">{table.guests.length}名</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                    <p className="text-gray-500 mb-6">まだ卓が登録されていません</p>
                    <button
                      onClick={handleAddTable}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-md"
                    >
                      <Icons.Plus />
                      最初の卓を追加
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 写真タブ */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                {/* ドラッグ＆ドロップ・アップロードエリア */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 text-gray-400">
                      <Icons.Upload />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">
                      ここに写真をドラッグ＆ドロップ、またはクリックして選択
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      複数枚の写真を同時にアップロードできます
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold cursor-pointer shadow-sm hover:shadow-md">
                      <Icons.Image />
                      写真を選択
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* フォトギャラリー・グリッド */}
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        {/* ホバー時のオーバーレイと削除ボタン */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center">
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 transform scale-90 group-hover:scale-100"
                            title="削除"
                          >
                            <Icons.Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gray-100 text-gray-400 mx-auto mb-4">
                      <Icons.Image />
                    </div>
                    <p className="text-gray-500">まだ写真がアップロードされていません</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
