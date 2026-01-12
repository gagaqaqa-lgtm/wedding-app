# プロジェクト構成図

```
guest-link/
├── app/                          # Next.js App Router
│   ├── admin/                    # Super Admin（プラットフォーム運営者）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── dashboard/                # Venue Admin（会場管理者）
│   │   ├── [venueId]/            # 動的ルート（会場ID別ダッシュボード）
│   │   │   └── page.tsx
│   │   ├── accounts/             # アカウント管理
│   │   │   └── page.tsx
│   │   ├── notifications/        # お知らせ
│   │   │   └── page.tsx
│   │   ├── settings/             # 設定
│   │   │   └── page.tsx
│   │   ├── venues/               # 会場管理
│   │   │   └── page.tsx
│   │   ├── weddings/             # 挙式管理
│   │   │   ├── [id]/             # 動的ルート（挙式ID別詳細）
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # ダッシュボード共通レイアウト
│   │   └── page.tsx              # ダッシュボードトップ（リダイレクト）
│   │
│   ├── guest/                    # ゲスト向けページ
│   │   ├── gallery/              # Webアルバム
│   │   │   └── page.tsx
│   │   ├── survey/              # アンケート・口コミ誘導
│   │   │   └── page.tsx
│   │   └── page.tsx             # ゲストポータル（Entrance → Gate → Dashboard）
│   │
│   ├── venue/                    # 会場ログイン
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── gallery/                  # 旧ギャラリー（リダイレクト用）
│   │   └── page.tsx
│   │
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # トップページ（管理者ログイン）
│   └── globals.css               # グローバルスタイル
│
├── components/                   # Reactコンポーネント
│   ├── admin/                    # 管理画面用コンポーネント
│   │   ├── Common/               # 共通コンポーネント
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Dashboard/            # ダッシュボード用
│   │   │   ├── DiffIndicator.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── TaskCards.tsx
│   │   └── SuperAdmin/           # Super Admin専用
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── common/                   # 共通コンポーネント
│   │   ├── Breadcrumbs.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── SmartStatus.tsx
│   │   └── Toaster.tsx
│   │
│   ├── dashboard/                # ダッシュボード用コンポーネント
│   │   └── VenueAdmin/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   │
│   └── ui/                       # UI基本コンポーネント
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── table.tsx
│
├── lib/                          # ライブラリ・ユーティリティ
│   ├── auth/                     # 認証関連
│   │   ├── permissions.ts        # 権限管理
│   │   └── roles.ts              # ロール定義
│   │
│   ├── data/                     # データ・モック
│   │   └── notifications.ts      # お知らせデータ
│   │
│   ├── store/                    # Zustandストア
│   │   ├── authStore.ts          # 認証状態管理
│   │   ├── venueStore.ts         # 会場状態管理
│   │   └── weddingStore.ts       # 挙式状態管理
│   │
│   ├── swr/                      # SWR設定
│   │   └── fetcher.ts            # データフェッチャー
│   │
│   ├── types/                    # TypeScript型定義
│   │   └── admin.ts              # 管理画面用型
│   │
│   └── utils/                    # ユーティリティ関数
│       ├── cn.ts                 # className結合
│       ├── diff.ts               # 差分計算
│       ├── print.ts              # 印刷関連
│       └── status.ts             # ステータス管理
│
├── 設定ファイル
│   ├── next.config.js            # Next.js設定
│   ├── package.json              # 依存関係
│   ├── tsconfig.json             # TypeScript設定
│   ├── tailwind.config.ts        # Tailwind CSS設定
│   ├── postcss.config.js         # PostCSS設定
│   └── schema.prisma             # Prismaスキーマ
│
└── ドキュメント
    ├── README.md
    ├── ADMIN_DASHBOARD_IMPLEMENTATION.md
    ├── MULTI_TENANT_ARCHITECTURE.md
    ├── MULTI_TENANT_IMPLEMENTATION.md
    ├── PLANNER_DASHBOARD_DESIGN.md
    └── VENUE_ADMIN_IMPLEMENTATION.md
```

## 主要なルーティング構造

### 公開ページ（認証不要）
- `/` - 管理者ログイン
- `/venue/login` - 会場ログイン
- `/guest` - ゲストポータル（Entrance → Gate → Survey）
- `/guest/gallery` - Webアルバム
- `/guest/survey` - アンケート

### Super Admin（`/admin/*`）
- `/admin` - ダッシュボード

### Venue Admin（`/dashboard/*`）
- `/dashboard/[venueId]` - 会場別ダッシュボード
- `/dashboard/[venueId]/weddings` - 挙式一覧
- `/dashboard/[venueId]/weddings/[id]` - 挙式詳細
- `/dashboard/[venueId]/venues` - 会場設定
- `/dashboard/[venueId]/accounts` - アカウント一覧
- `/dashboard/[venueId]/settings` - 設定
- `/dashboard/[venueId]/notifications` - お知らせ（未実装）

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Icons**: Lucide React（一部はSVG直接埋め込み）
- **Notifications**: Sonner
- **Database**: Prisma（スキーマ定義済み）

## アーキテクチャ

マルチテナント（複数会場対応）アーキテクチャを採用：
1. **Super Admin**: プラットフォーム運営者（全会場管理）
2. **Venue Admin**: 会場管理者（自会場のみ管理）
3. **Guest**: 結婚式参列者（写真閲覧・アンケート）
