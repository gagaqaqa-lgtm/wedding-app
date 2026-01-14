# PPAT Guest Link - プロトタイプ引き継ぎ資料

## 1. プロジェクト概要

結婚式場向け「ゲスト体験向上 × マーケティング」統合管理システムです。
Next.jsを用いて高忠実度のプロトタイプ（High-Fidelity Prototype）を実装しました。
本番開発（バックエンド連携）へのスムーズな移行を目的としています。

### 主な機能
- **管理画面（Venue Admin）**: 挙式管理、会場設定、卓レイアウト自動生成、写真管理
- **ゲスト画面（Guest）**: トップページ、メニュー、アンケート、写真ギャラリー（星評価・Google口コミ誘導ロジック含む）
- **スーパーアドミン画面（Super Admin）**: 会場一覧管理、全社統計

### 現在のステータス
- ✅ フロントエンドの実装はほぼ完了
- ✅ Vercelへのデプロイ済み
- ⚠️ データは現在モック（ダミーデータ）または `useState` で管理中
- ❌ バックエンドAPIは未実装

---

## 2. 技術スタック (Tech Stack)

### Core
- **Framework**: Next.js 15.1.0 (App Router)
- **Language**: TypeScript 5.5.0
- **Styling**: Tailwind CSS 3.4.4

### State Management
- **Zustand**: 5.0.9 (グローバル状態管理)
- **SWR**: 2.3.8 (データフェッチング・キャッシュ)

### UI Libraries
- **Framer Motion**: 12.25.0 (アニメーション)
- **Lucide React**: 0.562.0 (アイコン)
- **Radix UI**: 
  - @radix-ui/react-dialog: 1.1.15
  - @radix-ui/react-popover: 1.1.15
  - @radix-ui/react-separator: 1.1.8
  - @radix-ui/react-slot: 1.2.4

### Form Management
- **React Hook Form**: 7.70.0
- **Zod**: 4.3.5 (バリデーション)
- **@hookform/resolvers**: 5.2.2

### Data Table
- **TanStack Table**: 8.21.3 (データグリッド)

### Utilities
- **date-fns**: 4.1.0 (日付操作)
- **clsx**: 2.1.1 (クラス名結合)
- **tailwind-merge**: 3.4.0 (Tailwindクラスマージ)
- **class-variance-authority**: 0.7.1 (バリアント管理)
- **cmdk**: 1.1.1 (コマンドパレット)
- **sonner**: 2.0.7 (トースト通知)
- **react-to-print**: 3.2.0 (印刷機能)

### Development Tools
- **TypeScript**: 5.5.0
- **PostCSS**: 8.4.38
- **Autoprefixer**: 10.4.19

---

## 3. ディレクトリ構造

```
app/
├── page.tsx                          # トップページ（ログイン画面）
├── layout.tsx                        # ルートレイアウト
├── globals.css                       # グローバルスタイル
│
├── admin/                            # スーパーアドミン画面
│   ├── layout.tsx                    # スーパーアドミン専用レイアウト
│   └── page.tsx                      # スーパーアドミンダッシュボード
│
├── dashboard/                        # 会場管理者用ダッシュボード
│   ├── layout.tsx                    # ダッシュボード共通レイアウト
│   ├── page.tsx                      # ダッシュボードトップ
│   │
│   ├── [venueId]/                    # 会場別ダッシュボード（動的ルート）
│   │   ├── layout.tsx                # 会場別レイアウト
│   │   ├── page.tsx                  # 会場ダッシュボードトップ
│   │   ├── weddings/                 # 挙式管理
│   │   │   ├── page.tsx              # 挙式一覧
│   │   │   └── [id]/
│   │   │       └── page.tsx          # 挙式詳細（卓設定・写真管理）
│   │   ├── venues/                   # 会場設定
│   │   │   └── page.tsx              # 会場一覧・QR生成
│   │   ├── accounts/                 # アカウント管理
│   │   │   └── page.tsx
│   │   ├── notifications/            # 通知管理
│   │   │   └── page.tsx
│   │   └── settings/                 # 設定
│   │       └── page.tsx
│   │
│   ├── weddings/                     # 挙式管理（グローバル）
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── venues/                       # 会場管理（グローバル）
│   │   └── page.tsx
│   ├── accounts/                      # アカウント管理
│   │   └── page.tsx
│   ├── notifications/                # 通知管理
│   │   └── page.tsx
│   └── settings/                     # 設定
│       └── page.tsx
│
├── guest/                            # ゲスト画面
│   ├── page.tsx                      # ゲストポータル（挙式選択・パスコード入力）
│   ├── gallery/                      # 写真ギャラリー
│   │   └── page.tsx                  # 写真閲覧・保存（星評価・LINE誘導ロジック含む）
│   └── survey/                      # アンケート
│       └── page.tsx                  # 星評価・Google口コミ誘導
│
├── gallery/                          # ギャラリー（リダイレクト用）
│   └── page.tsx                      # /guest/gallery へリダイレクト
│
└── venue/                            # 会場ログイン
    └── login/
        └── page.tsx                  # 会場ログインページ

components/                           # 再利用可能なコンポーネント
├── admin/                            # 管理画面用コンポーネント
│   ├── Common/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── Dashboard/
│   │   ├── DiffIndicator.tsx
│   │   ├── QuickActions.tsx
│   │   └── TaskCards.tsx
│   └── SuperAdmin/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── dashboard/                        # ダッシュボード用コンポーネント
│   └── VenueAdmin/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── guest/                            # ゲスト画面用コンポーネント
│   ├── Lightbox.tsx                  # ライトボックス（写真拡大表示）
│   └── OpeningModal.tsx              # オープニングモーダル
├── notifications/                     # 通知コンポーネント（リファクタリング済み）
│   ├── NotificationHeader.tsx
│   ├── NotificationCard.tsx
│   ├── NotificationList.tsx
│   └── EmptyState.tsx
├── common/                           # 共通コンポーネント
│   ├── Breadcrumbs.tsx
│   ├── CommandPalette.tsx
│   ├── SmartStatus.tsx
│   └── Toaster.tsx
└── ui/                               # UIプリミティブ（shadcn/uiベース）
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── table.tsx

lib/                                  # ユーティリティ・型定義
├── types/                            # TypeScript型定義
│   ├── admin.ts                      # 管理画面用型定義
│   └── notifications.ts              # 通知システム用型定義
├── services/                         # サービス層（Repository Pattern）
│   └── notificationService.ts        # 通知サービス（API抽象化）
├── hooks/                            # カスタムフック（ViewModel層）
│   └── useNotifications.ts           # 通知管理フック
├── store/                            # Zustandストア
│   ├── authStore.ts
│   ├── venueStore.ts
│   └── weddingStore.ts
├── utils/                            # ユーティリティ関数
│   ├── cn.ts                         # クラス名結合
│   ├── dateFormatter.ts               # 日付フォーマット
│   ├── diff.ts                       # 差分検出
│   ├── notificationStyle.ts          # 通知スタイル取得
│   ├── print.ts                      # 印刷ユーティリティ
│   └── status.ts                     # ステータス管理
├── constants/                        # 定数
│   ├── external.ts                   # 外部サービスURL（Google Maps, LINE）
│   └── venues.ts                     # 会場情報定数
├── data/                             # モックデータ
│   └── notifications.ts              # 通知モックデータ
├── auth/                             # 認証関連
│   ├── permissions.ts
│   └── roles.ts
└── swr/                              # SWR設定
    └── fetcher.ts
```

---

## 4. 実装済みの主要ロジック

### 1. 卓レイアウト生成

**実装箇所**: `app/dashboard/[venueId]/weddings/[id]/page.tsx`

**機能概要**:
- 挙式詳細ページの「卓設定」タブで、卓を一括作成する機能
- 3つの命名パターンに対応：
  - **アルファベット順**: A卓, B卓, ..., Z卓, AA卓, AB卓, ...
  - **数字順**: 1卓, 2卓, 3卓, ...
  - **松竹梅パターン**: 松卓, 竹卓, 梅卓, 蘭卓, ...

**主要コード**:
```typescript
// 276-303行目: generateTableName 関数
const generateTableName = (index: number, pattern: 'alphabet' | 'number' | 'matsu'): string => {
  if (pattern === 'alphabet') {
    // アルファベット順（A-Z, その後AA-ZZ...）
    const alphabetCount = 26;
    const firstLetter = String.fromCharCode(65 + (index % alphabetCount));
    if (index < alphabetCount) {
      return `${firstLetter}卓`;
    } else {
      const secondIndex = Math.floor(index / alphabetCount) - 1;
      const secondLetter = String.fromCharCode(65 + (secondIndex % alphabetCount));
      return `${firstLetter}${secondLetter}卓`;
    }
  } else if (pattern === 'number') {
    return `${index + 1}卓`;
  } else {
    // 松竹梅パターン（26種類の植物名を循環）
    const patterns = ['松', '竹', '梅', '蘭', '菊', ...];
    // ...
  }
};
```

**一括作成ロジック**:
- `handleBulkCreate` 関数（318-339行目）で、指定した数だけ卓を一括生成
- 現在は `useState` で管理（将来的にAPI連携が必要）

---

### 2. QRコード生成

**実装箇所**: `app/dashboard/[venueId]/venues/page.tsx`

**機能概要**:
- 会場設定ページで、各会場のQRコードを生成・表示・ダウンロード
- 外部API（`https://api.qrserver.com/v1/create-qr-code/`）を使用

**主要コード**:
```typescript
// 184-196行目: QRコード生成ロジック
const getQrCodeUrl = (venueId: string) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
  return `${baseUrl}/venues/${venueId}`;
};

const getQrCodeImageUrl = (venueId: string) => {
  const url = getQrCodeUrl(venueId);
  // 高解像度のQRコードを生成（500x500px）
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
};

// 199-217行目: ダウンロード機能
const handleDownloadQr = async () => {
  const imageUrl = getQrCodeImageUrl(selectedVenueForQr.id);
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  // Blob URLを作成してダウンロード
  // ...
};
```

**現在の実装**:
- QRコードのURLは `/venues/${venueId}` 形式（将来的に変更が必要）
- 画像は外部APIから取得（本番環境では自社サーバーで生成することを推奨）

---

### 3. ゲスト評価分岐

**実装箇所**: `app/guest/survey/page.tsx`

**機能概要**:
- ゲストが星評価（1-5）を選択
- **高評価（4-5）**: Googleマップへの口コミ投稿誘導
- **低評価（1-3）**: 内部フィードバックフォームを表示
- 評価完了後、自動的にギャラリーページへ遷移

**主要コード**:
```typescript
// 20-47行目: 評価分岐ロジック
const isHighRating = rating >= 4;

const handleStarClick = (value: number) => {
  setRating(value);
  setTimeout(() => {
    setStep('action'); // アクションステップへ遷移
  }, 100);
};

// Googleマップへの誘導（星4以上の場合）
const handleMapClick = () => {
  window.open(GOOGLE_MAPS_URL, '_blank'); // 外部リンクで開く
  setTimeout(() => {
    navigateToGallery(); // ギャラリーへ遷移
  }, 300);
};

// フィードバック送信（星3以下の場合）
const handleFeedbackSubmit = () => {
  // 将来的にDBに保存する処理をここに追加
  setTimeout(() => {
    navigateToGallery();
  }, 300);
};
```

**外部サービス連携**:
- `GOOGLE_MAPS_URL`: `lib/constants/external.ts` で定義
- 環境変数 `NEXT_PUBLIC_GOOGLE_MAPS_URL` から取得可能

---

### 4. 写真ギャラリー（星評価・LINE誘導ロジック）

**実装箇所**: `app/guest/gallery/page.tsx`

**機能概要**:
- 写真の一覧表示（150枚のダミー写真）
- インフィード広告（12枚おきに挿入）
- ライトボックス（拡大表示、スワイプ対応）
- 保存完了時にLINE公式アカウントへの誘導モーダル表示
- 画像右クリック/長押しでLINE誘導モーダル表示

**主要ロジック**:
```typescript
// LINE URL生成関数（56-62行目）
const getLineUrl = () => {
  if (tableID) {
    const message = encodeURIComponent(`テーブル${tableID}の写真`);
    return `https://line.me/R/oaMessage/${LINE_ID}/?${message}`;
  }
  return `https://line.me/R/ti/p/${LINE_ID}`;
};
```

**外部サービス連携**:
- `LINE_ID`: `lib/constants/external.ts` で定義
- 環境変数 `NEXT_PUBLIC_LINE_ID` から取得可能

---

## 5. 今後の開発依頼事項 (To Do)

現在はフロントエンド主体のプロトタイプです。以下をバックエンドで実装する必要があります。

### 5.1 データベース設計・接続

**現状**:
- `schema.prisma` ファイルは存在するが空（未実装）
- データはすべてモックまたは `useState` で管理

**必要な実装**:
- Prismaスキーマの設計・実装
- データベース接続設定
- マイグレーション実行

**主要エンティティ（想定）**:
- `Venue` (会場)
- `Wedding` (挙式)
- `Table` (卓)
- `Guest` (ゲスト)
- `Notification` (通知)
- `Photo` (写真)
- `Survey` (アンケート)

---

### 5.2 認証機能 (Auth)

**現状**:
- 簡易認証のみ（`app/page.tsx` でハードコード）
- 会場別の認証・認可は未実装

**必要な実装**:
- NextAuth.js または Clerk の導入
- 会場ごとの認証・認可システム
- ロールベースアクセス制御（RBAC）
  - Super Admin
  - Venue Admin
  - Guest

**参考ファイル**:
- `lib/auth/roles.ts` - ロール定義（型定義のみ）
- `lib/auth/permissions.ts` - 権限定義（型定義のみ）

---

### 5.3 画像ストレージ連携

**現状**:
- 写真は Blob URL で管理（ページリロードで消失）
- ダミー画像は `https://picsum.photos` を使用

**必要な実装**:
- AWS S3 または Cloudinary への画像アップロード
- 画像の最適化・リサイズ機能
- CDN配信の設定

**実装箇所**:
- `app/dashboard/[venueId]/weddings/[id]/page.tsx` - 写真アップロード機能（372-421行目）

---

### 5.4 API実装

**現状**:
- すべてのデータ取得・更新がモック実装
- `lib/services/notificationService.ts` に将来の実装例がコメントで記載されている

**必要な実装**:

#### 4.1 通知API
- `GET /api/venues/[venueId]/notifications` - 通知一覧取得
- `POST /api/notifications/mark-as-read` - 既読状態更新

#### 4.2 挙式管理API
- `GET /api/venues/[venueId]/weddings` - 挙式一覧取得
- `GET /api/weddings/[id]` - 挙式詳細取得
- `POST /api/weddings` - 挙式作成
- `PUT /api/weddings/[id]` - 挙式更新
- `POST /api/weddings/[id]/tables` - 卓一括作成
- `PUT /api/tables/[id]` - 卓更新
- `DELETE /api/tables/[id]` - 卓削除

#### 4.3 会場管理API
- `GET /api/venues` - 会場一覧取得
- `POST /api/venues` - 会場作成
- `PUT /api/venues/[id]` - 会場更新
- `DELETE /api/venues/[id]` - 会場削除

#### 4.4 写真管理API
- `POST /api/weddings/[id]/photos` - 写真アップロード
- `GET /api/weddings/[id]/photos` - 写真一覧取得
- `DELETE /api/photos/[id]` - 写真削除

#### 4.5 アンケートAPI
- `POST /api/surveys` - アンケート送信
- `GET /api/surveys` - アンケート一覧取得（管理画面用）

**参考実装パターン**:
- `lib/services/notificationService.ts` - Repository Patternの実装例
- `lib/hooks/useNotifications.ts` - ViewModel層の実装例

---

### 5.5 環境変数の設定

**必要な環境変数**:
```env
# データベース
DATABASE_URL="postgresql://..."

# 認証
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# 外部サービス
NEXT_PUBLIC_GOOGLE_MAPS_URL="https://www.google.com/maps/place/..."
NEXT_PUBLIC_LINE_ID="@your_line_id"

# 画像ストレージ
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."
# または
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

**現在の設定箇所**:
- `lib/constants/external.ts` - 外部サービスURLの定義

---

### 5.6 エラーハンドリングの強化

**現状**:
- 一部のページでエラーハンドリングが実装済み（`app/dashboard/[venueId]/notifications/page.tsx` など）
- 全体としては不十分

**必要な実装**:
- エラーバウンダリーの実装
- グローバルエラーハンドリング
- ローディング状態の統一

---

### 5.7 テスト実装

**現状**:
- テストコードは未実装

**推奨**:
- 単体テスト（Jest + React Testing Library）
- E2Eテスト（Playwright または Cypress）
- 型安全性のテスト（TypeScriptの厳格モード）

---

## 6. リファクタリング済みファイル

以下のファイルは、プロダクション品質のコードにリファクタリング済みです。
設計パターンや実装方針の参考にしてください。

- `app/dashboard/[venueId]/notifications/page.tsx` - MVVM + Repository Pattern
- `lib/services/notificationService.ts` - Repository層の実装例
- `lib/hooks/useNotifications.ts` - ViewModel層の実装例
- `components/notifications/` - コンポーネント分割の実装例

詳細は `REFACTORING_NOTIFICATIONS.md` を参照してください。

---

## 7. 開発環境セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn

### セットアップ手順
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（ポート3003）
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

### 開発サーバー
- URL: `http://localhost:3003`
- ポート3003を使用（`package.json` の `dev` スクリプト参照）

---

## 8. デプロイ環境

- **ホスティング**: Vercel
- **ビルドコマンド**: `next build`
- **環境変数**: Vercelのダッシュボードで設定

---

## 9. 参考資料

### ドキュメントファイル
- `README.md` - プロジェクト概要
- `開発コンテキスト共有プロンプト.md` - 詳細な開発状況
- `REFACTORING_NOTIFICATIONS.md` - リファクタリング事例
- `ADMIN_DASHBOARD_IMPLEMENTATION.md` - 管理画面実装レポート
- `MULTI_TENANT_ARCHITECTURE.md` - マルチテナント設計
- `PLANNER_DASHBOARD_DESIGN.md` - プランナーダッシュボード設計

### 重要な設定ファイル
- `next.config.js` - Next.js設定（画像ドメイン設定含む）
- `tailwind.config.ts` - Tailwind CSS設定
- `tsconfig.json` - TypeScript設定

---

**Created by:** TAKAYUKI UENO  
**Last Updated:** 2024年1月
