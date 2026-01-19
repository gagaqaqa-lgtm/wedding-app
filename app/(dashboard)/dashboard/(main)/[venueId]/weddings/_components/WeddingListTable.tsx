"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Wedding } from "@/lib/types/schema";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";

interface WeddingListTableProps {
  /** 初期データ（サーバーから取得した挙式リスト） */
  initialWeddings: Wedding[];
  /** 会場ID */
  venueId: string;
  /** 会場プラン */
  plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM';
  /** フィルタリングされた挙式リスト（親コンポーネントから渡される） */
  filteredWeddings: Wedding[];
}

// アイコン (インラインSVG)
const Icons = {
  Lock: ({ className }: { className?: string }) => <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
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
 * 挙式一覧テーブルコンポーネント
 * 
 * サーバーから取得したデータを表示し、スイッチ操作などのインタラクティブなUIを提供
 * データの永続化は行わず、リロードで初期値に戻る仕様
 */
export function WeddingListTable({ 
  initialWeddings, 
  venueId, 
  plan = 'STANDARD',
  filteredWeddings 
}: WeddingListTableProps) {
  // 無制限モードの状態管理（各挙式ごと）
  const [unlimitedPhotosMap, setUnlimitedPhotosMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    initialWeddings.forEach((w, index) => {
      initialMap[w.id] = index % 2 === 1; // テスト用に交互に設定
    });
    return initialMap;
  });
  
  // 新しく追加された挙式の無制限モード状態を初期化
  useEffect(() => {
    filteredWeddings.forEach((wedding) => {
      if (!(wedding.id in unlimitedPhotosMap)) {
        setUnlimitedPhotosMap(prev => ({
          ...prev,
          [wedding.id]: false, // 新規追加はデフォルトOFF
        }));
      }
    });
  }, [filteredWeddings, unlimitedPhotosMap]);

  // URLコピー状態
  const [copiedCoupleLinkId, setCopiedCoupleLinkId] = useState<string | null>(null);

  const isLightPlan = plan === 'LIGHT';

  // 新郎新婦用URLをコピー
  const copyCoupleLink = async (weddingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  // 写真枚数無制限モードの切り替え
  const handleToggleUnlimitedPhotos = (weddingId: string, checked: boolean) => {
    if (isLightPlan) {
      return;
    }
    
    // 状態を更新（表示が即座に切り替わる）
    setUnlimitedPhotosMap(prev => ({
      ...prev,
      [weddingId]: checked,
    }));
    
    console.log('Mock save: unlimitedGuestUpload for wedding', weddingId, '=', checked);
  };

  if (filteredWeddings.length === 0) {
    return null; // 空の場合は親コンポーネントで処理
  }

  return (
    <div className="space-y-3">
      {filteredWeddings.map((wedding) => {
        const isUnlimitedActive = unlimitedPhotosMap[wedding.id] || false;
        return (
          <div
            key={wedding.id}
            className={`group flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-200 hover:-translate-y-[2px] ${
              isLightPlan ? 'opacity-90' : ''
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
              <Link
                href={`/dashboard/${venueId}/weddings/${wedding.id}`}
                className="text-lg font-bold text-gray-900 truncate hover:text-emerald-600 transition-colors"
              >
                {formatFamilyNames(wedding.familyNames)}
              </Link>
              <button
                onClick={(e) => copyCoupleLink(wedding.id, e)}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
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
              {isLightPlan ? (
                <Tooltip content="Standardプラン限定機能です。アップグレードが必要です。新郎新婦様のアップロードは常に無制限です。" side="top">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">ゲスト投稿の無制限モード</span>
                    <Icons.Lock className="w-4 h-4 text-gray-400" />
                    <Switch checked={false} disabled={true} />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip content="新郎新婦様のアップロードは常に無制限です" side="top">
                  <div className="flex items-center gap-2">
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
                    <Switch
                      checked={isUnlimitedActive}
                      onCheckedChange={(checked) => handleToggleUnlimitedPhotos(wedding.id, checked)}
                    />
                  </div>
                </Tooltip>
              )}
            </div>

            {/* 4. アクションボタン（右端） */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link
                href={`/dashboard/${venueId}/weddings/${wedding.id}`}
                className="p-2 text-gray-400 group-hover:text-emerald-600 transition-colors"
              >
                <Icons.ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
