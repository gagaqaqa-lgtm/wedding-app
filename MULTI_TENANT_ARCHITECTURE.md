# マルチテナントアーキテクチャ設計書

## システム構造（3階層）

```
1. Super Admin (弊社/プラットフォーム運営)
   └── /admin/*

2. Venue Admin (結婚式場のプランナー)
   └── /dashboard/*

3. End User (新郎新婦・ゲスト)
   └── /, /menu, /survey, /gallery
```

## ディレクトリ構造

```
app/
├── (public)/              # 公開ページ（認証不要）
│   ├── page.tsx           # ゲスト向けログイン画面
│   ├── menu/
│   ├── survey/
│   └── gallery/
│
├── admin/                 # Super Admin（弊社用）
│   ├── layout.tsx         # Super Admin専用レイアウト
│   ├── page.tsx           # Global Command Center（式場一覧・ヒートマップ）
│   ├── venues/            # 式場管理
│   │   ├── page.tsx       # 式場一覧
│   │   ├── [id]/page.tsx  # 式場詳細・編集
│   │   └── new/page.tsx   # 式場追加（ウィザードUI）
│   ├── analytics/         # 全社統計
│   │   └── page.tsx
│   └── settings/          # プラットフォーム設定
│       └── page.tsx
│
├── dashboard/             # Venue Admin（プランナー用）
│   ├── layout.tsx         # Venue Admin専用レイアウト（パンくずリスト付き）
│   ├── page.tsx           # 担当挙式一覧
│   ├── weddings/          # 挙式管理
│   │   ├── page.tsx       # 挙式一覧
│   │   ├── [id]/          # 挙式詳細
│   │   │   ├── page.tsx   # 挙式ダッシュボード
│   │   │   ├── guests/    # ゲスト管理
│   │   │   ├── seating/   # 配席管理
│   │   │   ├── allergies/ # アレルギー管理
│   │   │   └── print/     # 印刷プレビュー
│   │   └── new/page.tsx   # 挙式追加
│   └── tasks/             # タスク管理（全挙式横断）
│       └── page.tsx
│
└── api/
    ├── auth/              # 認証API
    │   ├── login/route.ts
    │   └── logout/route.ts
    └── middleware.ts      # 権限チェックミドルウェア

middleware.ts              # Next.js Middleware（ルートガード）

lib/
├── store/                 # Zustandストア
│   ├── authStore.ts       # 認証状態管理
│   ├── venueStore.ts      # 選択中の式場管理（Super Admin用）
│   └── weddingStore.ts    # 選択中の挙式管理（Venue Admin用）
│
├── auth/                  # 認証ロジック
│   ├── roles.ts           # ロール定義
│   └── permissions.ts     # 権限チェック
│
└── utils/
    ├── cn.ts              # clsx + tailwind-merge
    └── status.ts          # Smart Status（信号機カラー）
```

## 権限分離ロジック

### ロール定義

```typescript
type UserRole = 'super_admin' | 'venue_admin' | 'guest';

interface User {
  id: string;
  email: string;
  role: UserRole;
  venueId?: string;      // Venue Adminの場合
  organizationId?: string; // Venue Adminの場合
}
```

### ミドルウェアによる権限チェック

- `/admin/*` → `super_admin` のみアクセス可能
- `/dashboard/*` → `venue_admin` のみアクセス可能
- `/`, `/menu`, `/survey`, `/gallery` → `guest` または未認証

## デザインシステム

### カラーパレット

```css
/* ホワイトベース + アクセントカラー */
--bg-primary: #FFFFFF;
--bg-secondary: #F8F9FA;
--text-primary: #1F2937;
--text-secondary: #6B7280;

/* サムシングブルー */
--accent-blue: #3B82F6;
--accent-blue-light: #DBEAFE;

/* 幸福なピンク */
--accent-pink: #EC4899;
--accent-pink-light: #FCE7F3;

/* Smart Status（信号機カラー） */
--status-green: #10B981;   /* 完了・確定済 */
--status-yellow: #F59E0B;  /* 進行中・準備中 */
--status-red: #EF4444;     /* 未対応・要確認 */
--status-blue: #3B82F6;    /* 情報・通知 */
```

### フォント

- 主要フォント: `Noto Sans JP`（サンセリフ体、可読性重視）
- 装飾用: `Inter` または `Noto Sans JP` の軽量ウェイト

## UIコンポーネント設計

### Super Admin画面（Global Command Center）

```
┌─────────────────────────────────────────────────────┐
│ [Logo] Super Admin          [通知] [ユーザー] [ログアウト]│
├──────┬──────────────────────────────────────────────┤
│      │ [ヒートマップ表示]                             │
│      │ • 全式場のアクティブ状況を可視化              │
│  S   │ • 今日の挙式数、売上統計                      │
│  I   │                                              │
│  D   │ [式場一覧テーブル]                            │
│  E   │ ┌──────────────────────────────────────────┐ │
│  B   │ │ 式場名 │ ステータス │ 今日の挙式 │ 売上 │ │
│  A   │ │────────┼──────────┼──────────┼──────│ │
│  R   │ │ ABC式場│ アクティブ │     3    │ ¥XXX │ │
│      │ │ XYZ式場│ 一時停止   │     0    │ ¥XXX │ │
│      │ └──────────────────────────────────────────┘ │
│      │                                              │
│      │ [クイックアクション]                          │
│      │ [+ 式場追加] [統計レポート] [設定]            │
└──────┴──────────────────────────────────────────────┘
```

### Venue Admin画面（担当挙式一覧）

```
┌─────────────────────────────────────────────────────┐
│ [Logo] THE GRAND GARDEN    [Cmd+K] [通知] [ログアウト]│
├──────┬──────────────────────────────────────────────┤
│      │ [パンくず] Home > 挙式一覧                     │
│      │                                              │
│  S   │ [Smart Status Filter]                        │
│  I   │ [全] [準備中🟡] [招待状発送済🔵] [席次確定済🟢]│
│  D   │                                              │
│  E   │ [挙式一覧テーブル]                            │
│  B   │ ┌──────────────────────────────────────────┐ │
│  A   │ │ 挙式名 │ 日付 │ ステータス │ タスク │ アクション│ │
│  R   │ │────────┼──────┼──────────┼──────┼─────────│ │
│      │ │ 田中家 │10/20 │ 準備中🟡  │  5件 │ [開く]   │ │
│      │ │ 佐藤家 │11/05 │ 確定済🟢  │  0件 │ [開く]   │ │
│      │ └──────────────────────────────────────────┘ │
│      │                                              │
│      │ [クイックアクション]                          │
│      │ [+ 挙式追加] [タスク一覧] [設定]              │
└──────┴──────────────────────────────────────────────┘
```

## Command Palette (Cmd+K) 仕様

### 機能
- 挙式名検索
- ページ移動
- クイックアクション実行

### UI
- モーダル表示
- 検索窓 + 結果リスト
- キーボードナビゲーション（↑↓ Enter）

## Smart Status（信号機カラー）仕様

### ステータス定義

```typescript
type WeddingStatus = 
  | 'draft'           // 下書き（グレー）
  | 'preparing'       // 準備中（黄色🟡）
  | 'invited'         // 招待状発送済（青色🔵）
  | 'confirmed'       // 席次確定済（緑色🟢）
  | 'completed'       // 完了（緑色🟢）
  | 'cancelled';      // キャンセル（赤色🔴）

type VenueStatus = 
  | 'active'          // アクティブ（緑色🟢）
  | 'suspended'       // 一時停止（黄色🟡）
  | 'inactive';       // 無効（グレー）
```
