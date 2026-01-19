# プラン（STANDARD / LIGHT / PREMIUM）による条件分岐の実装

このファイルは、プランによる条件分岐がどのように実装されているかを確認するためのコード連結です。

---

## 1. lib/types/venue.ts (プランの型定義)

```typescript
/**
 * Venue型定義
 * 
 * 将来のRDB設計を見越した会場情報の型定義
 * 管理者情報は正規化の準備として admin オブジェクトにネスト
 */

/**
 * 契約プラン
 */
export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';

/**
 * 会場ステータス
 */
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

/**
 * 会場管理者情報
 * 
 * 将来のRDB設計では、別テーブル（users または admins）に正規化される予定
 */
export interface VenueAdmin {
  /** 管理者名 */
  name: string;
  
  /** 管理者メールアドレス（ログインIDとしても使用） */
  email: string;
}

/**
 * 会場情報
 * 
 * 結婚式場の基本情報と契約情報
 * 
 * 【RDB設計の想定】
 * - venues テーブル: id, name, code, plan, status, coverImageUrl, enableLineUnlock, ...
 * - venue_admins テーブル（将来）: venueId (FK), name, email, ...
 * 
 * 現時点では admin をフラットに持つが、将来的には外部キーで参照する
 */
export interface Venue {
  /** 会場ID（主キー） */
  id: string;
  
  /** 会場名 */
  name: string;
  
  /** 会場コード（URLに使用される識別子、ユニーク制約） */
  code: string;
  
  /** 契約プラン */
  plan: VenuePlan;
  
  /** 会場ステータス */
  status: VenueStatus;
  
  /** 管理者情報（ネストされたオブジェクト） */
  admin: VenueAdmin;
  
  /** 最終アクティブ日時（ISO 8601形式） */
  lastActiveAt: string;
  
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
  
  /** 会場カバー画像URL（ゲスト入口画面の背景に使われる） */
  coverImageUrl?: string;
  
  /** LINE連携による投稿制限解除機能の有効/無効 */
  enableLineUnlock?: boolean;
  
  /** Google MapsレビューURL（オプション） */
  googleMapsReviewUrl?: string;
  
  /** LINE公式アカウントURL（オプション） */
  lineOfficialAccountUrl?: string;
  
  /** 表示会場名（オプション、UI表示用） */
  displayVenueName?: string;
  
  /** 口コミ収集設定（新郎新婦向け、オプション） */
  coupleReviewUrl?: string;
  coupleReviewThreshold?: number;
  
  /** 口コミ収集設定（ゲスト向け、オプション） */
  guestReviewUrl?: string;
  guestReviewThreshold?: number;
}
```

---

## 2. lib/types/schema.ts (プランの再エクスポート)

```typescript
// ============================================================================
// 会場関連
// ============================================================================

/**
 * @deprecated 新しい型定義は @/lib/types/venue からインポートしてください
 * 後方互換性のため、ここから再エクスポートしています
 */
export type {
  VenuePlan,
  VenueStatus,
  Venue,
  VenueAdmin,
} from './venue';

// 後方互換性のため、既存の型名もエクスポート（新しい型定義と同じ）
export type { VenuePlan as VenuePlanType } from './venue';
export type { VenueStatus as VenueStatusType } from './venue';
```

---

## 3. app/(dashboard)/dashboard/(main)/[venueId]/page.tsx (ダッシュボード)

**注意**: このファイルにはプランによる条件分岐は実装されていません。会場情報は取得していますが、プランに基づく表示の出し分けは行われていません。

```typescript
"use client";

import { use, Suspense, useState, useEffect } from 'react';
import Link from "next/link";
import type { Notification } from "@/lib/data/notifications";
import { getVenueById } from "@/lib/services/mock/venueService";
import { useNotification } from "@/contexts/NotificationContext";
import { FeedbackFeed } from "./_components/FeedbackFeed";

// ... (アイコン定義など) ...

interface VenueDashboardPageProps {
  params: Promise<{ venueId: string }>;
}

export default function VenueDashboardPage({ params }: VenueDashboardPageProps) {
  const { venueId } = use(params);
  
  // 会場情報の取得（非同期）
  const [venueInfo, setVenueInfo] = useState<{ id: string; name: string } | null>(null);
  const [isLoadingVenue, setIsLoadingVenue] = useState(true);
  
  useEffect(() => {
    const loadVenueInfo = async () => {
      try {
        const venue = await getVenueById(venueId);
        if (venue) {
          setVenueInfo({ id: venue.id, name: venue.name });
          // 注意: プラン情報は取得しているが、表示には使用していない
        } else {
          setVenueInfo({ id: venueId, name: '不明な会場' });
        }
      } catch (error) {
        console.error('Failed to load venue info:', error);
        setVenueInfo({ id: venueId, name: '不明な会場' });
      } finally {
        setIsLoadingVenue(false);
      }
    };
    loadVenueInfo();
  }, [venueId]);

  // ... (メニューアイテム定義など) ...

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      {/* ... (UI実装) ... */}
    </div>
  );
}
```

---

## 4. app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingSettingsForm.tsx (挙式設定フォーム)

このファイルでは、プランによる機能制限が実装されています。

```typescript
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Edit, X } from "lucide-react";

/**
 * 挙式設定フォームの初期値型定義
 */
export interface WeddingSettings {
  /** ゲスト投稿の無制限モード（true: 無制限、false: 制限あり）デフォルト: true */
  unlimitedGuestUpload: boolean;
  
  /** ウェルカムメッセージ（全員向け） */
  welcomeMessage: string;
}

interface WeddingSettingsFormProps {
  /** 初期設定値 */
  initialSettings: WeddingSettings;
  
  /** プラン情報（LIGHTプランでは一部機能が制限される） */
  plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM';
  
  /** 挙式ID（API呼び出しに必要） */
  weddingId: string;
}

/**
 * 挙式設定フォームコンポーネント
 * 
 * インタラクティブな設定UIを提供し、バックエンドAPIにデータを保存します。
 */
export function WeddingSettingsForm({ initialSettings, plan = 'STANDARD', weddingId }: WeddingSettingsFormProps) {
  // 内部状態の管理
  const [settings, setSettings] = useState<WeddingSettings>(initialSettings);
  const [isMessageEditing, setIsMessageEditing] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [originalMessage, setOriginalMessage] = useState(initialSettings.welcomeMessage);
  const [isSaving, setIsSaving] = useState(false);
  
  // プラン判定: LIGHTプランかどうか
  const isLightPlan = plan === 'LIGHT';

  // 設定変更時のハンドラ（状態更新のみ）
  const handleUnlimitedGuestUploadChange = async (checked: boolean) => {
    setSettings(prev => ({ ...prev, unlimitedGuestUpload: checked }));
    
    try {
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: checked,
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: 'ゲスト投稿の無制限モードを更新しました。',
      });
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
      // エラー時は元の値に戻す
      setSettings(prev => ({ ...prev, unlimitedGuestUpload: !checked }));
    }
  };

  const handleWelcomeMessageChange = (value: string) => {
    setSettings(prev => ({ ...prev, welcomeMessage: value }));
  };

  // ... (編集モード関連のハンドラ) ...

  // 保存処理（API呼び出し）
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: settings.unlimitedGuestUpload,
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: '挙式設定が正常に更新されました。',
      });

      setIsMessageEditing(false);
      setOriginalMessage(settings.welcomeMessage);
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">基本設定</h2>
      
      <div className="space-y-6">
        {/* ゲスト投稿の無制限モード */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="unlimited-guest-upload" className="text-sm font-semibold text-gray-900">
                ゲスト投稿の無制限モード
              </Label>
              {/* プラン判定: LIGHTプランの場合、ロックアイコンを表示 */}
              {isLightPlan && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {/* プラン判定: LIGHTプランの場合、制限メッセージを表示 */}
              {isLightPlan 
                ? "Standardプラン以上で利用可能です。"
                : "ゲストが写真を無制限にアップロードできるようにします。新郎新婦様のアップロードは常に無制限です。"
              }
            </p>
          </div>
          <div className="ml-4">
            <Switch
              id="unlimited-guest-upload"
              checked={settings.unlimitedGuestUpload}
              onCheckedChange={handleUnlimitedGuestUploadChange}
              {/* プラン判定: LIGHTプランの場合、スイッチを無効化 */}
              disabled={isLightPlan}
            />
          </div>
        </div>

        {/* ウェルカムメッセージ */}
        {/* ... (ウェルカムメッセージの実装) ... */}
      </div>
    </div>
  );
}
```

**実装されているプラン判定:**
- `isLightPlan = plan === 'LIGHT'` でLIGHTプランかどうかを判定
- LIGHTプランの場合:
  - ロックアイコンを表示
  - 説明文を「Standardプラン以上で利用可能です。」に変更
  - スイッチを `disabled={isLightPlan}` で無効化

---

## 5. app/(guest)/guest/(main)/gallery/page.tsx (ゲストギャラリーページ)

このファイルでは、プランによる広告表示の出し分けとLINE連携機能の制御が実装されています。

### 5.1. プラン情報の取得と状態管理

```typescript
// 会場・挙式データ
const [venueInfo, setVenueInfo] = useState<{ 
  name: string; 
  coverImage: string; 
  enableLineUnlock: boolean; 
  plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' 
} | null>(null);

// 会場・挙式データの読み込み
useEffect(() => {
  const loadData = async () => {
    try {
      const [venue, wedding] = await Promise.all([
        getVenueInfo(MOCK_VENUE_ID),
        getWeddingInfo(MOCK_WEDDING_ID),
      ]);
      if (venue) {
        setVenueInfo({
          name: venue.name,
          coverImage: venue.coverImageUrl || 'https://picsum.photos/800/600?random=venue',
          enableLineUnlock: venue.enableLineUnlock || false,
          plan: venue.plan || 'PREMIUM', // プラン情報を追加
        });
      } else {
        // フォールバック
        setVenueInfo({
          name: `Venue ${MOCK_VENUE_ID}`,
          coverImage: 'https://picsum.photos/800/600?random=venue',
          enableLineUnlock: false,
          plan: 'STANDARD',
        });
      }
    } catch (error) {
      console.error('Failed to load venue/wedding data:', error);
      // フォールバック
      setVenueInfo({
        name: '表参道テラス',
        coverImage: 'https://picsum.photos/800/600?random=venue',
        enableLineUnlock: false,
        plan: 'PREMIUM', // デフォルトはPREMIUM
      });
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);
```

### 5.2. ダウンロード機能でのプラン判定（広告モーダル表示）

```typescript
// 単一写真のダウンロード - プラン判定を行うゲートキーパー関数
const handleDownload = (url: string, alt: string) => {
  // 実行する処理を定義（クロージャで引数を保持）
  const action = () => executeSingleDownload(url, alt);

  // プラン判定: LIGHTプランのみ広告モーダルを表示
  if (venueInfo?.plan === 'LIGHT') {
    // LIGHTプラン: 広告モーダルを経由
    setPendingDownloadAction(() => action);
    setIsDownloadModalOpen(true);
  } else {
    // STANDARD/PREMIUMプラン: 広告なしで即実行
    action();
  }
};

// 選択した写真の一括ダウンロード - モーダル表示用ハンドラ
const handleBulkDownload = () => {
  if (selectedImageIds.length === 0) {
    toast.error('写真を選択してください', {
      duration: 2000,
    });
    return;
  }

  // プラン判定: LIGHTプランのみ広告モーダルを表示
  if (venueInfo?.plan === 'LIGHT') {
    // LIGHTプラン: 広告モーダルを経由
    setPendingDownloadAction(() => executeBulkDownload);
    setIsDownloadModalOpen(true);
  } else {
    // STANDARD/PREMIUMプラン: 広告なしで即実行
    executeBulkDownload();
  }
};

// 一括ダウンロード確認後の処理（確認ダイアログから呼ばれる）
const handleDownloadAllConfirm = () => {
  setShowDownloadAllConfirm(false);
  
  // プラン判定: LIGHTプランのみ広告モーダルを表示
  if (venueInfo?.plan === 'LIGHT') {
    // LIGHTプラン: 広告モーダルを経由
    setPendingDownloadAction(() => executeDownloadAll);
    setIsDownloadModalOpen(true);
  } else {
    // STANDARD/PREMIUMプラン: 広告なしで即実行
    executeDownloadAll();
  }
};
```

**実装されているプラン判定:**
- `venueInfo?.plan === 'LIGHT'` でLIGHTプランかどうかを判定
- LIGHTプランの場合:
  - ダウンロード時に広告モーダル（`DownloadWaitModal`）を表示
  - 広告表示後にダウンロード処理を実行
- STANDARD/PREMIUMプランの場合:
  - 広告なしで即座にダウンロード処理を実行

### 5.3. STANDARDプラン向けLINE連携CTAバナー

```typescript
{/* STANDARDプラン向けLINE連携CTAバナー（常時表示、LINE未連携の場合のみ） */}
{venueInfo?.plan === 'STANDARD' && venueInfo.enableLineUnlock && !isLineConnected && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mx-4 mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-green-900 font-bold text-sm font-serif mb-1">
          写真をたくさん撮りましたか？
        </p>
        <p className="text-green-700 text-xs font-serif">
          LINE連携で枚数制限なしで投稿できます
        </p>
      </div>
      <button
        onClick={() => {
          // LINE公式アカウントの友達追加URLを別タブで開く
          window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer');
          
          // 即座に制限を解除（無条件で連携済みにする）
          setIsLineConnected(true);
          
          // フィードバック: トースト通知を表示
          toast.success('無制限モードが解放されました！🎉', {
            description: 'これからは何枚でもアップロードできます✨',
            duration: 4000,
          });
        }}
        className="px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049a3f] text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
      >
        <MessageCircle className="w-4 h-4" />
        連携する
      </button>
    </div>
  </motion.div>
)}
```

**実装されているプラン判定:**
- `venueInfo?.plan === 'STANDARD'` でSTANDARDプランかどうかを判定
- STANDARDプラン かつ `enableLineUnlock === true` かつ LINE未連携の場合:
  - LINE連携CTAバナーを表示
  - バナーからLINE連携を行うと、投稿枚数制限が解除される

### 5.4. 開発用デバッグパネル（プラン切り替え機能）

```typescript
{/* 開発用デバッグパネル */}
{process.env.NODE_ENV === 'development' && (
  <div className="fixed top-32 right-4 z-[9999]">
    {!isDebugOpen ? (
      <button
        onClick={() => setIsDebugOpen(true)}
        className="bg-black/80 hover:bg-black/90 text-yellow-400 p-3 rounded-full shadow-xl border border-white/20 hover:scale-110 transition-all duration-200 active:scale-95"
        title="デバッグパネルを開く"
      >
        <span className="text-xl">🔧</span>
      </button>
    ) : (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="p-4 bg-black/90 backdrop-blur-md rounded-xl text-white text-xs border border-white/20 shadow-2xl w-64"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <h3 className="font-bold text-yellow-400 flex items-center gap-2">
            <span>🔧</span>
            <span>Debugger</span>
          </h3>
          <button
            onClick={() => setIsDebugOpen(false)}
            className="text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors active:scale-95"
            title="最小化"
          >
            ー
          </button>
        </div>

        <div className="space-y-3">
          {/* プラン切り替え */}
          <div>
            <p className="text-stone-400 mb-1.5">
              現在のプラン: <span className="text-white font-bold">{venueInfo?.plan || 'N/A'}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (venueInfo) {
                    setVenueInfo({ ...venueInfo, plan: 'LIGHT', enableLineUnlock: false });
                  }
                }}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
              >
                LIGHT
              </button>
              <button
                onClick={() => {
                  if (venueInfo) {
                    setVenueInfo({ ...venueInfo, plan: 'STANDARD', enableLineUnlock: true });
                  }
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium transition-colors active:scale-95"
              >
                STANDARD
              </button>
              <button
                onClick={() => {
                  if (venueInfo) {
                    setVenueInfo({ ...venueInfo, plan: 'PREMIUM', enableLineUnlock: false });
                  }
                }}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-xs font-medium transition-colors active:scale-95"
              >
                PREMIUM
              </button>
            </div>
          </div>

          {/* LINE連携状態切り替え */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-stone-400 mb-1.5">
              LINE連携: <span className="text-white font-bold">{isLineConnected ? 'ON' : 'OFF'}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsLineConnected(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors active:scale-95"
              >
                ON
              </button>
              <button
                onClick={() => setIsLineConnected(false)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs font-medium transition-colors active:scale-95"
              >
                OFF
              </button>
            </div>
          </div>

          {/* 投稿数リセット */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-stone-400 mb-1.5">
              投稿数: <span className="text-white font-bold">{uploadedCount}枚</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUploadedCount(0)}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs font-medium transition-colors active:scale-95"
              >
                0枚
              </button>
              <button
                onClick={() => setUploadedCount(5)}
                className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded text-xs font-medium transition-colors active:scale-95"
              >
                5枚(上限)
              </button>
            </div>
          </div>

          {/* 現在の状態表示（参考情報） */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-stone-400 text-[10px] leading-relaxed">
              LINE連携機能: {venueInfo?.enableLineUnlock ? '有効' : '無効'}
            </p>
          </div>
        </div>
      </motion.div>
    )}
  </div>
)}
```

**実装されている機能:**
- 開発環境でのみ表示されるデバッグパネル
- プランをLIGHT/STANDARD/PREMIUMに切り替え可能
- LINE連携状態の切り替え
- 投稿数のリセット

---

## まとめ

### プランによる条件分岐の実装箇所

1. **型定義** (`lib/types/venue.ts`)
   - `VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM'`
   - `Venue` インターフェースに `plan: VenuePlan` プロパティ

2. **ダッシュボード** (`app/(dashboard)/dashboard/(main)/[venueId]/page.tsx`)
   - **プラン判定なし**: 会場情報は取得しているが、プランによる表示の出し分けは実装されていない

3. **挙式設定フォーム** (`app/(dashboard)/dashboard/(main)/[venueId]/weddings/[id]/_components/WeddingSettingsForm.tsx`)
   - **LIGHTプラン判定**: `isLightPlan = plan === 'LIGHT'`
   - LIGHTプランの場合:
     - ロックアイコンを表示
     - 説明文を変更
     - スイッチを無効化

4. **ゲストギャラリーページ** (`app/(guest)/guest/(main)/gallery/page.tsx`)
   - **LIGHTプラン判定**: `venueInfo?.plan === 'LIGHT'`
     - ダウンロード時に広告モーダルを表示
   - **STANDARDプラン判定**: `venueInfo?.plan === 'STANDARD'`
     - LINE連携CTAバナーを表示（`enableLineUnlock === true` かつ LINE未連携の場合）

### プラン別の機能制限

| プラン | ゲスト投稿無制限モード | ダウンロード広告 | LINE連携機能 |
|--------|----------------------|-----------------|-------------|
| LIGHT | ❌ 無効（ロック） | ✅ 表示 | ❌ 無効 |
| STANDARD | ✅ 有効 | ❌ 非表示 | ✅ 有効（`enableLineUnlock`がtrueの場合） |
| PREMIUM | ✅ 有効 | ❌ 非表示 | ❌ 無効（`enableLineUnlock`がfalseの場合） |

### 実装パターン

1. **プラン判定の方法**
   - `plan === 'LIGHT'` でLIGHTプランかどうかを判定
   - `plan === 'STANDARD'` でSTANDARDプランかどうかを判定
   - `venueInfo?.plan` でオプショナルチェーンを使用

2. **条件分岐の実装**
   - 三項演算子: `{isLightPlan ? '制限メッセージ' : '通常メッセージ'}`
   - 論理AND演算子: `{venueInfo?.plan === 'STANDARD' && ... && <Component />}`
   - if文: `if (venueInfo?.plan === 'LIGHT') { ... } else { ... }`

3. **機能制限の実装**
   - `disabled={isLightPlan}` でUI要素を無効化
   - 条件付きレンダリングで表示/非表示を制御
   - 広告モーダルを経由して機能を制限
