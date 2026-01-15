"use client";

import React, { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import type { Wedding, TableLayout } from "@/lib/types/admin";
import { getVenueInfo } from "@/lib/constants/venues";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FeedbackTab, type Feedback } from "./_components/FeedbackTab";

interface WeddingDetailPageProps {
  params: Promise<{ venueId: string; id: string }>;
}

// Mock: 会場ごとのデフォルト卓数設定
const VENUE_DEFAULT_SETTINGS = {
  defaultTableCount: 12, // 最初から12卓ある状態にする
  namingPattern: 'alphabet' as 'alphabet' | 'number' | 'matsu', // A, B, C...
};

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
  QrCode: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3"/><path d="M9 21h3"/><path d="M21 12v-3"/><path d="M12 9H9"/><path d="M12 21v-3"/><path d="M12 12h3"/><path d="M16 16h5"/><path d="M16 12h5"/><path d="M12 9v3"/></svg>,
  Download: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Folder: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>,
  Globe: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ChevronDown: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Groom: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bride: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Calendar: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Building2: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h12"/><path d="M6 6h12"/><path d="M6 18h12"/></svg>,
  Camera: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>,
  Edit: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Edit2: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  X: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  AlertTriangle: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  UserPlus: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  Infinity: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/></svg>,
  ArrowRight: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  Unlock: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Copy: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ExternalLink: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
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

// ステータスバッジ（ヘッダー用 - ガラスモーフィズム風）
const StatusBadge = ({ isLocked }: { isLocked: boolean }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 ${
      isLocked ? "shadow-sm" : "shadow-sm"
    }`}>
      {isLocked && <Icons.Lock className="w-3 h-3" />}
      {isLocked ? "確定" : "準備中"}
    </span>
  );
};

type TabType = 'settings' | 'tables' | 'photos' | 'feedback';

// 写真の型定義
interface Photo {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  tableId?: string | null; // nullまたはundefinedなら全体公開、IDがあれば卓限定
}

export default function WeddingDetailPage({ params }: WeddingDetailPageProps) {
  const { venueId, id } = use(params);
  const venueInfo = getVenueInfo(venueId);
  const router = useRouter();
  const weddingId = Number(id);
  
  // 動作確認用: venueIdに応じて契約プランを動的に決定
  // venue-001 は LIGHT プラン、それ以外は STANDARD プラン
  const currentPlan: 'LIGHT' | 'STANDARD' = useMemo(() => {
    return venueId === 'venue-001' ? 'LIGHT' : 'STANDARD';
  }, [venueId]);
  
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [isSaving, setIsSaving] = useState(false);
  
  // 写真枚数無制限モードの状態
  const [unlimitedPhotos, setUnlimitedPhotos] = useState(false);
  
  // セクションごとの編集モード管理（null = 編集中ではない、'settings' = 基本情報を編集中、'tables' = 卓設定を編集中）
  const [editingSection, setEditingSection] = useState<'settings' | 'tables' | null>(null);
  
  // 新郎新婦用URLコピー状態
  const [coupleLinkCopied, setCoupleLinkCopied] = useState(false);
  
  // 挙式データを取得（実際はAPIから取得）
  const wedding = useMemo(() => getWeddingById(weddingId), [weddingId]);
  
  // この挙式専用のテーブルリスト（実際はAPIから取得）
  // 初期状態では会場のデフォルト設定に基づいて自動生成
  const [tables, setTables] = useState<TableLayout[]>([]);
  
  // 一括作成用の状態
  const [bulkCreateCount, setBulkCreateCount] = useState<number>(10);
  const [namingPattern, setNamingPattern] = useState<'alphabet' | 'number' | 'matsu'>(VENUE_DEFAULT_SETTINGS.namingPattern);

  // 写真管理の状態（tableIdプロパティを追加: null/undefinedなら全体公開、IDがあれば卓限定）
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=800&fit=crop',
      name: '前撮り写真 - カップル',
      uploadedAt: '2024-10-15T10:00:00Z',
      tableId: null, // 全体公開
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=800&fit=crop',
      name: '会場の風景 - エントランス',
      uploadedAt: '2024-10-15T10:05:00Z',
      tableId: null, // 全体公開
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=800&fit=crop',
      name: '前撮り写真 - ドレス',
      uploadedAt: '2024-10-15T10:10:00Z',
      tableId: null, // 全体公開
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
      name: '会場の風景 - メインホール',
      uploadedAt: '2024-10-15T10:15:00Z',
      tableId: null, // 全体公開
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  
  // QRコード表示用の状態
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableLayout | null>(null);

  // フィードバックの状態（モックデータ）
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 'feedback-1',
      content: 'スタッフの対応が少し冷たかったです。もう少し笑顔で接客していただけると良かったです。',
      rating: 3,
      source: 'COUPLE',
      createdAt: new Date('2026-10-25T14:30:00').toISOString(),
    },
    {
      id: 'feedback-2',
      content: '料理の提供が遅く、ゲストの方が待たされてしまいました。',
      rating: 2,
      source: 'GUEST',
      createdAt: new Date('2026-10-25T15:00:00').toISOString(),
    },
  ]);
  
  // 卓ごとの写真アルバム展開状態（旧実装、削除予定）
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  
  // 写真タブのスコープ選択（null = 全体公開、tableId = 卓限定）
  const [selectedPhotoScope, setSelectedPhotoScope] = useState<string | null>(null);
  
  // カスタムSelect UIの開閉状態
  const [isPhotoScopeDropdownOpen, setIsPhotoScopeDropdownOpen] = useState(false);
  
  // クリックアウトサイドで閉じる
  React.useEffect(() => {
    if (!isPhotoScopeDropdownOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.photo-scope-select')) {
        setIsPhotoScopeDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPhotoScopeDropdownOpen]);

  // 新郎新婦の名前の状態
  const [groomSei, setGroomSei] = useState("田中");
  const [groomMei, setGroomMei] = useState("健太");
  const [brideSei, setBrideSei] = useState("佐藤");
  const [brideMei, setBrideMei] = useState("花子");
  
  // メモの状態
  const [memo, setMemo] = useState("");
  
  // 挙式日時の状態
  const [weddingDateTime, setWeddingDateTime] = useState("");

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
      // 挙式日時の初期値を設定
      setWeddingDateTime(`${wedding.date}T${wedding.time}`);
    }
  }, [wedding]);
  
  // 未保存時の離脱ガード
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editingSection !== null) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editingSection]);

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

  // 命名パターンに基づいてテーブル名を生成（「卓」接尾辞なし）
  const generateTableName = (index: number, pattern: 'alphabet' | 'number' | 'matsu'): string => {
    if (pattern === 'alphabet') {
      // アルファベット順（A-Z, その後AA-ZZ...）
      const alphabetCount = 26;
      const firstLetter = String.fromCharCode(65 + (index % alphabetCount)); // A-Z
      if (index < alphabetCount) {
        return `${firstLetter}`;
      } else {
        const secondIndex = Math.floor(index / alphabetCount) - 1;
        const secondLetter = String.fromCharCode(65 + (secondIndex % alphabetCount));
        return `${firstLetter}${secondLetter}`;
      }
    } else if (pattern === 'number') {
      // 数字順
      return `${index + 1}`;
    } else {
      // 松竹梅パターン
      const patterns = ['松', '竹', '梅', '蘭', '菊', '桜', '楓', '桐', '桂', '杉', '柳', '柏', '椿', '菖蒲', '牡丹', '薔薇', '百合', '蓮', '向日葵', '桔梗', '撫子', '朝顔', '紫陽花', '彼岸花', '水仙', 'チューリップ'];
      const patternIndex = index % patterns.length;
      const repeatCount = Math.floor(index / patterns.length);
      if (repeatCount === 0) {
        return `${patterns[patternIndex]}`;
      } else {
        return `${patterns[patternIndex]}${repeatCount + 1}`;
      }
    }
  };

  // 会場デフォルト設定に基づいて初期卓を生成
  React.useEffect(() => {
    // 既に卓がある場合は初期化しない（APIから取得済みのデータを尊重）
    if (tables.length === 0 && wedding) {
      const initialTables: TableLayout[] = Array.from({ length: VENUE_DEFAULT_SETTINGS.defaultTableCount }, (_, i) => ({
        id: `table_default_${weddingId}_${i}`,
        name: generateTableName(i, VENUE_DEFAULT_SETTINGS.namingPattern),
        capacity: 6,
        guests: [],
      }));
      setTables(initialTables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding, weddingId]); // tablesは依存配列に含めない（無限ループ防止）

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

  // 卓を削除
  const handleDeleteTable = (tableId: string) => {
    if (confirm('この卓を削除しますか？')) {
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
  };

  // セクションごとの保存処理
  const handleSave = async (section: 'settings' | 'tables') => {
    setIsSaving(true);
    // TODO: API呼び出し
    setTimeout(() => {
      setIsSaving(false);
      alert('設定を保存しました！');
      setEditingSection(null); // 保存後は閲覧モードに戻る
    }, 800);
  };
  
  // 編集モードをキャンセル
  const handleCancelEdit = (section: 'settings' | 'tables') => {
    if (confirm('保存されていない変更があります。破棄して閲覧モードに戻りますか？')) {
      setEditingSection(null);
      // TODO: フォームの値を元に戻す（必要に応じて）
    }
  };
  
  // 一覧に戻る際の確認
  const handleGoBack = () => {
    if (editingSection !== null) {
      if (!window.confirm("保存されていない変更があります。保存せずに移動しますか？")) {
        return; // 移動キャンセル
      }
    }
    router.push(`/dashboard/${venueId}/weddings`);
  };
  
  // 新郎新婦用URLをコピー
  const copyCoupleLink = async () => {
    const url = `${window.location.origin}/couple/login?id=${weddingId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCoupleLinkCopied(true);
      setTimeout(() => setCoupleLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('URLのコピーに失敗しました。');
    }
  };
  
  // タブ切り替えのガード処理
  const handleTabChange = (newTab: TabType) => {
    if (editingSection !== null) {
      if (!window.confirm("保存されていない変更があります。保存せずにタブを切り替えますか？")) {
        return; // タブ切り替えキャンセル
      }
      // タブを切り替える場合は編集中のセクションをリセット
      setEditingSection(null);
    }
    setActiveTab(newTab);
  };

  // 写真アップロード処理（選択されたスコープに応じてtableIdを付与）
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      uploadedAt: new Date().toISOString(),
      tableId: selectedPhotoScope || null, // 選択されたスコープをtableIdとして付与
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

  // QRコード表示処理
  const handleShowQrCode = (table: TableLayout) => {
    setSelectedTableForQr(table);
    setQrDialogOpen(true);
  };

  // QRコード画像ダウンロード処理
  const handleDownloadQrCode = () => {
    if (!selectedTableForQr) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://guest-link.app/table/${venueId}/${weddingId}/${selectedTableForQr.id}`)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${selectedTableForQr.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 選択されたスコープに応じた写真をフィルタリング
  const filteredPhotos = useMemo(() => {
    if (selectedPhotoScope === null) {
      // 全体公開の場合
      return photos.filter(p => !p.tableId);
    } else {
      // 特定の卓を選択した場合
      return photos.filter(p => p.tableId === selectedPhotoScope);
    }
  }, [photos, selectedPhotoScope]);

  // 選択されたスコープの表示名
  const selectedScopeName = useMemo(() => {
    if (selectedPhotoScope === null) {
      return '全体公開';
    } else {
      const table = tables.find(t => t.id === selectedPhotoScope);
      return table ? table.name : '未選択';
    }
  }, [selectedPhotoScope, tables]);

  return (
    <>
      {/* QRコード表示ダイアログ */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>卓専用QRコード</DialogTitle>
            <DialogDescription>
              {selectedTableForQr?.name} のゲストアクセス用QRコード
            </DialogDescription>
          </DialogHeader>
          {selectedTableForQr && (
            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://guest-link.app/table/${venueId}/${weddingId}/${selectedTableForQr.id}`)}`}
                alt={`QR Code for ${selectedTableForQr.name}`}
                className="w-64 h-64 border border-gray-200 rounded-lg"
              />
              <p className="text-lg font-semibold text-gray-900">{selectedTableForQr.name}</p>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={handleDownloadQrCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              <Icons.Download className="w-4 h-4" />
              画像をダウンロード
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 全画面オーバーレイ（編集モード中のクリックガード） - サイドバーとヘッダーを覆う */}
      {editingSection !== null && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-all" />
      )}
      
      {/* 編集モード中の固定バー - 最前面に表示 */}
      {editingSection !== null && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm md:text-base">
              編集中：変更を保存するかキャンセルしてください
            </span>
          </div>
        </div>
      )}
      
      {/* メインコンテンツエリア - 編集モード時はz-50でオーバーレイより前面に */}
      <div className={`flex-1 flex flex-col min-h-screen font-sans ${editingSection !== null ? 'relative z-50' : ''}`}>
        <div className={`flex-1 overflow-auto bg-gray-50 ${editingSection !== null ? 'pt-14' : ''}`}>
          <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* ヘッダー情報カード - Hero Section（看板） */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border-none shadow-lg p-6">
            {/* 戻るボタン */}
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-sm text-white hover:bg-white/20 rounded-md px-2 py-1.5 mb-6 transition-colors"
            >
              <Icons.ArrowLeft />
              挙式一覧に戻る
            </button>
            
            {/* 新郎新婦名 - フルネームで結合表示 */}
            <div className="mb-6 pb-6 border-b border-white/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-white leading-relaxed">
                  {(() => {
                    const groomFull = `${groomSei.trim()} ${groomMei.trim()}`.trim();
                    const brideFull = `${brideSei.trim()} ${brideMei.trim()}`.trim();
                    
                    if (!groomFull && !brideFull) {
                      return <span className="text-white/80">名前を入力してください</span>;
                    }
                    
                    if (groomFull && brideFull) {
                      return (
                        <span>
                          <span className="text-white">{groomFull}</span>
                          <span className="text-white/70 font-light mx-2">/</span>
                          <span className="text-white">{brideFull}</span>
                          <span className="text-white/90 ml-1">様</span>
                        </span>
                      );
                    }
                    
                    if (groomFull) {
                      return <span className="text-white">{groomFull} 様</span>;
                    }
                    
                    return <span className="text-white">{brideFull} 様</span>;
                  })()}
                </h1>
                {/* アクションボタンエリア */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* 新郎新婦用URLコピーボタン */}
                  <button
                    onClick={copyCoupleLink}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap"
                  >
                    {coupleLinkCopied ? (
                      <>
                        <Icons.Check className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">コピー完了！</span>
                        <span className="text-sm font-medium sm:hidden">完了</span>
                      </>
                    ) : (
                      <>
                        <Icons.Copy className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">新郎新婦用URL</span>
                        <span className="text-sm font-medium sm:hidden">URL</span>
                      </>
                    )}
                  </button>
                  {/* 新郎新婦画面を開くボタン */}
                  <a
                    href={`/couple/login?id=${weddingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap text-sm font-medium"
                  >
                    <Icons.ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">新郎新婦画面を開く</span>
                    <span className="sm:hidden">画面確認</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* メタ情報エリア - 横一列（スマホ時はグリッド） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* 挙式日時 */}
              <div className="flex items-start gap-2">
                <Icons.Calendar className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">挙式日時</p>
                  <p className="text-sm font-semibold text-white">{formatDateTime(wedding.date, wedding.time)}</p>
                </div>
              </div>
              
              {/* 会場名 */}
              {wedding.hall && (
                <div className="flex items-start gap-2">
                  <Icons.Building2 className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-emerald-100 mb-0.5">会場名</p>
                    <p className="text-sm font-semibold text-white">{wedding.hall}</p>
                  </div>
                </div>
              )}
              
              {/* ゲスト数 */}
              <div className="flex items-start gap-2">
                <Icons.Users className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ゲスト数</p>
                  <p className="text-sm font-semibold text-white">{wedding.guestCount || 0}名</p>
                </div>
              </div>
              
              {/* ステータス */}
              <div className="flex items-start gap-2">
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ステータス</p>
                  <StatusBadge isLocked={wedding.isLocked} />
                </div>
              </div>
            </div>
            
            {/* 会場情報 */}
            <div className="text-xs text-white/70 border-t border-white/20 pt-4">
              会場: {venueInfo.name} ({venueId})
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            {/* タブナビゲーション */}
            <div className="flex gap-2 border-b border-emerald-100">
              <button
                onClick={() => handleTabChange('settings')}
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
                onClick={() => handleTabChange('tables')}
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
                onClick={() => handleTabChange('photos')}
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
                onClick={() => handleTabChange('feedback')}
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
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all duration-200 ${
            editingSection !== null 
              ? 'ring-2 ring-emerald-500/20' 
              : ''
          }`}>
            {/* 基本情報タブ */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* セクションヘッダー（編集ボタン付き） */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
                  {editingSection === 'settings' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelEdit('settings')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                      >
                        <Icons.X className="w-4 h-4" />
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleSave('settings')}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icons.Save className="w-4 h-4" />
                        {isSaving ? "保存中..." : "変更を保存"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSection('settings')}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-bold text-sm shadow-sm"
                    >
                      <Icons.Edit2 className="w-4 h-4" />
                      編集する
                    </button>
                  )}
                </div>

                {/* ゲストの投稿設定カード */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-4">
                    <Icons.Image className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">ゲストの投稿設定 (Guest Upload Settings)</h3>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    {currentPlan === 'LIGHT' ? (
                      /* ライトプラン表示 - シンプルに仕様を表示 */
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">制限あり (最大5枚/人)</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                            <Icons.Lock className="w-3 h-3" />
                            Light Plan
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          現在のプランでは、ゲスト1人あたり5枚までの制限となります。
                        </p>
                      </div>
                    ) : (
                      /* スタンダードプラン表示 - シンプルなスイッチ */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900">投稿枚数の無制限化 (LINE連携)</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {unlimitedPhotos ? (
                                <>無制限: ゲストは<strong>LINE友だち追加</strong>を行うことで、枚数無制限でアップロードできるようになります。</>
                              ) : (
                                <>制限あり: ゲスト1人につき5枚までアップロード可能です。（LINE友だち追加は不要）</>
                              )}
                            </p>
                          </div>
                          <Switch
                            checked={unlimitedPhotos}
                            onCheckedChange={(checked) => {
                              setUnlimitedPhotos(checked);
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          ※ 新郎新婦様および会場側による公式写真のアップロードには制限はありません。
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 基本情報フォーム - 統一デザインルール適用 */}
                <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all duration-200 ${
                  editingSection === 'settings' 
                    ? 'ring-2 ring-emerald-500/20' 
                    : ''
                }`}>
                  {editingSection === 'settings' ? (
                    /* 編集モード */
                    <div className="space-y-6">
                      {/* 新郎・新婦名入力エリア（2カラム） */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 新郎様情報 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            新郎様
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1.5">
                                姓
                              </label>
                              <input
                                type="text"
                                value={groomSei}
                                onChange={(e) => setGroomSei(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                                placeholder="例: 田中"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1.5">
                                名
                              </label>
                              <input
                                type="text"
                                value={groomMei}
                                onChange={(e) => setGroomMei(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                                placeholder="例: 健太"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 新婦様情報 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            新婦様
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1.5">
                                姓
                              </label>
                              <input
                                type="text"
                                value={brideSei}
                                onChange={(e) => setBrideSei(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                                placeholder="例: 佐藤"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1.5">
                                名
                              </label>
                              <input
                                type="text"
                                value={brideMei}
                                onChange={(e) => setBrideMei(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                                placeholder="例: 花子"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* その他の基本情報 */}
                      <div className="pt-6 border-t border-gray-200 space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            挙式日時
                          </label>
                          <input
                            type="datetime-local"
                            value={weddingDateTime}
                            onChange={(e) => setWeddingDateTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            会場
                          </label>
                          {/* Segmented Control (タブ形式) */}
                          <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1 flex-wrap">
                            {availableVenues.map((venue) => (
                              <button
                                key={venue.id}
                                type="button"
                                onClick={() => setSelectedVenueId(venue.id)}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors min-w-[120px] ${
                                  selectedVenueId === venue.id
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="font-semibold text-sm">{venue.name}</span>
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
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            メモ
                          </label>
                          <textarea
                            rows={4}
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                            placeholder="挙式に関するメモを入力してください"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 閲覧モード */
                    <div className="space-y-6">
                      {/* 新郎・新婦名表示 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">新郎様</p>
                          <p className="text-base font-semibold text-gray-900">
                            {groomSei && groomMei ? `${groomSei} ${groomMei}` : '未入力'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-2">新婦様</p>
                          <p className="text-base font-semibold text-gray-900">
                            {brideSei && brideMei ? `${brideSei} ${brideMei}` : '未入力'}
                          </p>
                        </div>
                      </div>

                      {/* その他の基本情報 */}
                      <div className="pt-6 border-t border-gray-200 space-y-5">
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">挙式日時</p>
                          <p className="text-base font-semibold text-gray-900">
                            {weddingDateTime ? new Date(weddingDateTime).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : formatDateTime(wedding.date, wedding.time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">会場</p>
                          {selectedVenueId ? (
                            <p className="text-base font-semibold text-gray-900">
                              {availableVenues.find(v => v.id === selectedVenueId)?.name || wedding.hall || '未選択'}
                              {availableVenues.find(v => v.id === selectedVenueId) && (
                                <span className="text-sm text-gray-500 font-normal ml-2">
                                  (最大{availableVenues.find(v => v.id === selectedVenueId)?.capacity}名)
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-base font-semibold text-gray-900">{wedding.hall || '未選択'}</p>
                          )}
                        </div>
                        {memo && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">メモ</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200">
                              {memo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 卓設定タブ */}
            {activeTab === 'tables' && (
              <div className="space-y-6">
                {/* セクションヘッダー（編集ボタン付き） */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">卓設定</h2>
                  {editingSection === 'tables' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelEdit('tables')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                      >
                        <Icons.X className="w-4 h-4" />
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleSave('tables')}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icons.Save className="w-4 h-4" />
                        {isSaving ? "保存中..." : "変更を保存"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSection('tables')}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-bold text-sm shadow-sm"
                    >
                      <Icons.Edit2 className="w-4 h-4" />
                      編集する
                    </button>
                  )}
                </div>

                {/* 説明カード - 統一デザインルール適用 */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <p className="text-sm text-emerald-800">
                    <strong>会場のデフォルト設定</strong>に基づいて、初期状態で <strong>{VENUE_DEFAULT_SETTINGS.defaultTableCount}卓</strong> が自動生成されています。
                    新郎新婦様がゲスト画面で設定した内容を確認し、必要に応じて編集してください。
                  </p>
                </div>

                {/* 一括追加エリア（編集モード時のみ表示） - 統一デザインルール適用 */}
                {editingSection === 'tables' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">追加の卓を作成する</h3>
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          追加作成数
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={bulkCreateCount}
                            onChange={(e) => setBulkCreateCount(Number(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-semibold text-gray-900 text-center text-sm"
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
                        追加作成
                      </button>
                    </div>
                  </div>
                )}

                {/* タイトルと1つ追加ボタン */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">卓一覧</h2>
                  {editingSection === 'tables' && (
                    <button
                      onClick={handleAddTable}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                    >
                      <Icons.Plus className="w-4 h-4" />
                      1つ追加
                    </button>
                  )}
                </div>

                {/* 卓リスト（コンパクトタイルグリッド） */}
                {tables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="relative bg-white rounded-lg border border-gray-200 shadow-sm h-24 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 ease-in-out"
                      >
                        {/* 削除ボタン（編集モード時のみ、右上角にバッジ） */}
                        {editingSection === 'tables' && (
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                            title="削除"
                          >
                            <Icons.X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* QRコードボタン（右下に小さく配置） */}
                        <button
                          onClick={() => handleShowQrCode(table)}
                          className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
                          title="QRコードを表示"
                        >
                          <Icons.QrCode className="w-3 h-3" />
                        </button>

                        {/* 卓名表示・入力エリア（中央に配置） */}
                        <div className="flex items-center justify-center px-3">
                          {editingSection === 'tables' ? (
                            <input
                              type="text"
                              value={table.name}
                              onChange={(e) => handleTableNameChange(table.id, e.target.value)}
                              className="w-full text-center text-lg font-bold text-gray-900 border-0 border-b-2 border-emerald-500 focus:border-emerald-600 focus:ring-0 outline-none bg-gray-50 focus:bg-white py-1 transition-colors"
                              placeholder="卓名"
                            />
                          ) : (
                            <div className="flex items-baseline justify-center">
                              <span className="text-xl font-bold text-gray-900">{table.name}</span>
                              <span className="text-xs text-gray-400 ml-1">卓</span>
                            </div>
                          )}
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
                {/* スコープ選択カスタムドロップダウン */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    表示・操作する対象を選択
                  </label>
                  <div className="relative photo-scope-select">
                    {/* トリガーボタン */}
                    <button
                      type="button"
                      onClick={() => setIsPhotoScopeDropdownOpen(!isPhotoScopeDropdownOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                        selectedPhotoScope === null
                          ? 'border-emerald-200 ring-2 ring-emerald-100'
                          : 'border-amber-200 ring-2 ring-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedPhotoScope === null ? (
                          <Icons.Globe className={`w-4 h-4 ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-amber-600'}`} />
                        ) : (
                          <Icons.Lock className={`w-4 h-4 ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-amber-600'}`} />
                        )}
                        <div className="text-left">
                          <div className={`font-bold text-sm ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {selectedPhotoScope === null ? '全体公開の写真' : tables.find(t => t.id === selectedPhotoScope)?.name || '未選択'}
                          </div>
                          {selectedPhotoScope === null && (
                            <div className="text-xs text-gray-500">（全てのゲストが閲覧可能）</div>
                          )}
                        </div>
                      </div>
                      <Icons.ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isPhotoScopeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* ドロップダウンメニュー */}
                    {isPhotoScopeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {/* 全体公開オプション */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhotoScope(null);
                            setIsPhotoScopeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors ${
                            selectedPhotoScope === null ? 'bg-emerald-50' : ''
                          }`}
                        >
                          <Icons.Globe className={`w-4 h-4 ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-gray-900'}`}>
                              全体公開の写真
                            </div>
                            <div className="text-xs text-gray-500">（全てのゲストが閲覧可能）</div>
                          </div>
                        </button>

                        {/* 区切り線 */}
                        {tables.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">卓別アルバム</div>
                          </div>
                        )}

                        {/* 卓別オプション */}
                        {tables.map((table) => (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => {
                              setSelectedPhotoScope(table.id);
                              setIsPhotoScopeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors ${
                              selectedPhotoScope === table.id ? 'bg-amber-50' : ''
                            }`}
                          >
                            <Icons.Lock className={`w-4 h-4 ${selectedPhotoScope === table.id ? 'text-amber-600' : 'text-gray-400'}`} />
                            <div className={`font-semibold text-sm ${selectedPhotoScope === table.id ? 'text-amber-600' : 'text-gray-900'}`}>
                              {table.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ドラッグ＆ドロップ・アップロードエリア */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out ${
                    isDragging
                      ? selectedPhotoScope === null 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-amber-500 bg-amber-50'
                      : selectedPhotoScope === null
                        ? 'border-gray-300 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/50'
                        : 'border-gray-300 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className={`mb-4 ${selectedPhotoScope === null ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <Icons.Upload />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">
                      {selectedPhotoScope === null 
                        ? `「全体公開」に写真を追加`
                        : `「${selectedScopeName}」だけの限定写真を追加`
                      }
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

                {/* 写真グリッド表示 */}
                {filteredPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                          selectedPhotoScope === null ? 'border-2 border-emerald-200' : ''
                        }`}
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
                    <p className="text-gray-500">
                      {selectedPhotoScope === null 
                        ? '全体公開の写真はまだありません'
                        : `${selectedScopeName}の写真はまだありません`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* フィードバックタブ */}
            {activeTab === 'feedback' && (
              <FeedbackTab feedbacks={feedbacks} weddingId={weddingId} />
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
