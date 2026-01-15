# Handover Document: Wedding Photo App (Current Status)

> **最終更新**: 2026年1月（コードベース分析に基づく）  
> **対象読者**: 新規開発者、AIアシスタント、プロジェクト引き継ぎ担当者

---

## 📋 目次

1. [システム概要 & アーキテクチャ](#1-システム概要--アーキテクチャ)
2. [現在の実装機能（Code Analysis）](#2-現在の実装機能code-analysis)
3. [ディレクトリ・ファイル構成図](#3-ディレクトリファイル構成図)
4. [UI/デザインガイドライン（現状の実装に基づく）](#4-uideザインガイドライン現状の実装に基づく)
5. [データの扱い](#5-データの扱い)
6. [引き継ぎ事項 / NEXT STEP](#6-引き継ぎ事項--next-step)

---

## 1. システム概要 & アーキテクチャ

### 1.1 プロジェクトの目的

結婚式の写真共有・演出プラットフォーム。新郎新婦がゲスト向けに写真・メッセージを設定し、ゲストが写真をアップロード・閲覧できるシステム。

### 1.2 ターゲットデバイス

**モバイルファースト（スマートフォン特化）**
- ユーザーのほぼ100%がスマートフォン（iPhone SE〜Pro Max相当）でアクセス
- PC表示の考慮は最低限
- `dvh` (Dynamic Viewport Height) を使用してブラウザバーの影響を回避
- タップ領域は44px以上を確保

### 1.3 Next.js App Router構成

```
app/
├── couple/                    # 新郎新婦側機能
│   ├── layout.tsx            # 共通レイアウト（ヒーローセクション、フッターナビ）
│   ├── page.tsx              # ホーム画面（STEP 1, 2の進捗表示）
│   ├── tables/               # 卓設定専用ページ
│   │   └── page.tsx          # 卓一覧と詳細設定
│   ├── gallery/              # 写真ギャラリー
│   │   └── page.tsx          # 写真閲覧・ダウンロード
│   ├── login/                # ログイン
│   ├── photos/               # （存在するが未確認）
│   └── settings/             # 設定
│
├── (guest)/                  # ゲスト側機能
│   └── guest/
│       ├── (entry)/          # エントリーページ
│       ├── (main)/           # メイン機能
│       │   └── gallery/      # 写真ギャラリー・アップロード
│       └── (onboarding)/     # オンボーディング
│           └── survey/       # アンケート
│
├── (dashboard)/              # プランナー管理画面
│   └── dashboard/
│
├── admin/                    # スーパーアドミン
│
└── layout.tsx                # ルートレイアウト
```

### 1.4 ページの役割分担

#### `/couple` (Home)
- **役割**: 全体進捗の確認
- **機能**:
  - STEP 1: プロフィール・挨拶設定（全員へのメッセージと写真）
  - STEP 2: ゲスト・卓設定（`/couple/tables` へのナビゲーション）
  - 両方完了時の「準備完了」バッジ表示

#### `/couple/tables` (卓設定)
- **役割**: 卓ごとの詳細設定
- **機能**:
  - 進捗状況のプログレスバー表示（完了状況: X / Y 卓）
  - 卓カードのグリッド表示（3つの状態を視覚的に区別）
  - 各卓の写真・メッセージ設定（Sheet UI）
  - コンプライアンスチェックモーダル（写真アップロード前）

#### `/couple/gallery` (写真ギャラリー)
- **役割**: ゲストがアップロードした写真の閲覧・ダウンロード
- **機能**:
  - 挙式前: ロック画面表示（Pre-Wedding Lock Screen）
  - 挙式後: 写真グリッド表示、ダウンロード機能
  - レビューゲート経由のダウンロード（`CoupleReviewGateDrawer`）
  - 広告表示（`DownloadWaitModal`）

---

## 2. 現在の実装機能（Code Analysis）

### 2.1 コンプライアンス機能

#### ゲスト側 (`app/(guest)/guest/(main)/gallery/page.tsx`)

**実装状況**: ✅ 完全実装

- **状態管理**:
  - `showComplianceModal`: モーダルの表示/非表示
  - `selectedFiles`: 選択された待機中のファイル
  - `previewUrls`: プレビュー用のURL（`URL.createObjectURL`）
  - `hasAgreedToCompliance`: 同意チェックボックスの状態

- **UIコンポーネント**:
  - `<Dialog>` を使用した警告モーダル
  - 警告アイコン: 🔞 公序良俗、💔 不快な写真、🍺 迷惑行為
  - プレビュー画像のグリッド表示
  - 「マナーを守ります」のチェックボックス

- **フロー**:
  1. ファイル選択 → `handleFileSelect` が呼ばれる
  2. 制限チェック（5枚制限、LINE連携状況）
  3. コンプライアンスモーダルを表示
  4. 同意チェック後、「投稿する」ボタンで `handlePhotoUpload` 実行

#### 新郎新婦側 (`app/couple/tables/page.tsx`)

**実装状況**: ✅ 完全実装

- **状態管理**: ゲスト側と同様の構造
- **UI**: ゲスト側と同じデザイン（オレンジ色の警告枠）
- **文言調整**: 「ゲストに公開されます」という表現を使用
- **フロー**:
  1. ファイル選択 → `handleFileSelect` が呼ばれる
  2. コンプライアンスモーダルを表示
  3. 同意チェック後、「写真を追加する」ボタンで `handlePhotoUploadAfterCompliance` 実行
  4. ファイルを `currentPhotos` に追加（保存ボタンで確定）

### 2.2 UI/UXロジック

#### ヒーローセクション（`app/couple/layout.tsx`）

**実装状況**: ✅ 完全実装

- **背景画像**:
  - `MOCK_WEDDING.venueCoverImage` から読み込み
  - 式場のカバー写真として表示

- **視認性向上**:
  - 全体に `bg-black/20` を適用（写真を少し暗く）
  - 下からグラデーション: `bg-gradient-to-t from-black/80 via-black/40 to-transparent`
  - 文字にドロップシャドウを適用（`drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]` など）

- **高さ調整**:
  - スマホ: `min-h-[280px]`
  - PC: `md:min-h-[400px]`
  - パディング: `py-4 md:py-8`

- **カウントダウン表示**:
  - 挙式前: 「あと XX 日」と日付表示
  - 挙式後: 「Happy Wedding!」と祝福メッセージ

#### スマホ最適化

**実装状況**: ✅ 完全実装

- **dvh対応**:
  - `min-h-screen` → `min-h-dvh`
  - `h-[85vh]` → `h-[85dvh]`
  - `max-h-[90vh]` → `max-h-[90dvh]`

- **余白の圧縮**:
  - `py-6` → `py-4 md:py-6`
  - `space-y-6` → `space-y-3 md:space-y-6`
  - `mb-6` → `mb-4 md:mb-6`

- **日本語テキスト最適化**:
  - 見出しに `text-balance` を追加
  - フォントサイズ: `text-xl md:text-2xl`（レスポンシブ）

- **タップ領域**:
  - ボタン高さ: `h-12` (48px) または `h-14` (56px)
  - カード最小高さ: `min-h-[100px] md:min-h-[120px]`

### 2.3 ステータス管理（卓設定画面）

**実装状況**: ✅ 完全実装

#### 完了判定ロジック

```typescript
const completedTables = tables.filter(table => 
  table.isCompleted === true || table.isSkipped === true
).length;
```

- **完了の定義**: `isCompleted === true` または `isSkipped === true`

#### 3つの視覚パターン

1. **パターン1: 写真登録済み**
   - 背景: 設定した写真を表示
   - ステータスバッジ: 緑のチェックマーク（右上）
   - スタイル: `opacity-90`（未完了を目立たせるため）

2. **パターン2: 未登録**
   - 背景: 白背景、破線枠（`border-4 border-dashed border-emerald-300`）
   - アイコン: 大きな「＋」アイコン（中央）
   - ステータスバッジ: 「未設定」（オレンジ）
   - スタイル: `ring-2 ring-emerald-200`（目立たせる）

3. **パターン3: スキップ済み**
   - 背景: 薄いグレー（`bg-gray-100`）
   - アイコン: 「共通写真」アイコン（中央）
   - ステータスバッジ: 「共通」（グレー）

#### 進捗バー

- 表示: 「完了状況: X / Y 卓」
- プログレスバー: `framer-motion` でアニメーション
- 100%完了時: グラデーション（`from-emerald-500 to-teal-500`）

### 2.4 レビュー・口コミ機能

**実装状況**: ✅ 完全実装

#### `PostWeddingThankYouCard` (`components/PostWeddingThankYouCard.tsx`)

- **localStorage連携**:
  - キー: `wedding_app_has_reviewed_${coupleId}`
  - レビュー済みの場合、入力フォームを非表示

- **条件分岐ロジック**:
  - **高評価（4-5星）**: 外部サイト（Googleマップ）へ誘導
  - **低評価（1-3星）**: 内部フィードバック（Textarea）を表示

- **性善説UX**:
  - ボタンクリック = 完了とみなす
  - スキップボタンなし

#### `CoupleReviewGateDrawer` (`components/CoupleReviewGateDrawer.tsx`)

- ダウンロード前のレビューゲート
- レビュー完了後、`DownloadWaitModal` を表示

---

## 3. ディレクトリ・ファイル構成図

### 3.1 新郎新婦側 (`app/couple/`)

```
app/couple/
├── layout.tsx                 # 共通レイアウト
│   ├── HeroCountdown          # ヒーローセクション（カウントダウン）
│   ├── MOCK_WEDDING_DATE      # 挙式日（モック）
│   ├── MOCK_WEDDING           # 式場カバー写真（モック）
│   └── フッターナビゲーション # ホーム、卓設定、みんなの写真
│
├── page.tsx                   # ホーム画面
│   ├── STEP 1: プロフィール・挨拶設定
│   ├── STEP 2: ゲスト・卓設定（/couple/tables へ遷移）
│   ├── 進捗計算ロジック
│   └── Sheet: 全員への写真シート
│
├── tables/
│   └── page.tsx               # 卓設定ページ
│       ├── 進捗バー（完了状況: X / Y 卓）
│       ├── 卓カードグリッド（3パターン）
│       ├── Sheet: 卓詳細設定
│       └── Dialog: コンプライアンスチェックモーダル
│
└── gallery/
    └── page.tsx               # 写真ギャラリー
        ├── Pre-Wedding Lock Screen
        ├── 写真グリッド（Masonry）
        ├── CoupleReviewGateDrawer
        └── DownloadWaitModal
```

### 3.2 ゲスト側 (`app/(guest)/guest/`)

```
app/(guest)/guest/
├── (main)/
│   └── gallery/
│       └── page.tsx           # ゲストギャラリー
│           ├── OpeningModal   # オープニングモーダル
│           ├── タブUI（新郎新婦より / この卓のアルバム）
│           ├── 写真アップロード機能
│           ├── コンプライアンスチェックモーダル
│           ├── 投稿制限（5枚、LINE連携で無制限）
│           └── 写真削除機能
│
├── (entry)/
│   └── page.tsx               # エントリーページ
│
└── (onboarding)/
    └── survey/
        └── page.tsx           # アンケート
```

### 3.3 コンポーネント (`components/`)

```
components/
├── ui/                        # shadcn/ui コンポーネント
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── checkbox.tsx
│   └── ...
│
├── PostWeddingThankYouCard.tsx    # 挙式後のサンクスレター
├── CoupleReviewGateDrawer.tsx     # ダウンロード前のレビューゲート
├── DownloadWaitModal.tsx          # ダウンロード待機モーダル（広告表示）
├── AdCard.tsx                    # 広告カードコンポーネント
├── MasonryGallery.tsx             # Masonryレイアウトのギャラリー
└── guest/
    ├── Lightbox.tsx              # ライトボックス
    └── OpeningModal.tsx          # オープニングモーダル
```

---

## 4. UI/デザインガイドライン（現状の実装に基づく）

### 4.1 配色

#### メインカラー（Emerald系）
- `emerald-50`, `emerald-100`, `emerald-200`: 背景・ボーダー
- `emerald-400`, `emerald-500`, `emerald-600`: アクセント・ボタン
- `emerald-700`, `emerald-800`: テキスト

#### セカンダリカラー（Teal系）
- `teal-500`, `teal-600`: グラデーション（ボタン）

#### 警告色（Orange系）
- `orange-100`, `orange-200`: コンプライアンスモーダルの背景
- `orange-700`, `orange-800`: 警告テキスト

#### ニュートラル（Gray/Stone系）
- `gray-50`, `gray-100`: 背景
- `gray-200`, `gray-300`: ボーダー
- `gray-600`, `gray-700`, `gray-900`: テキスト
- `stone-50`, `stone-100`: ゲスト側の背景

### 4.2 フォント指定

```typescript
style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif' }}
```

- システムフォント優先
- 日本語対応（`Noto Sans JP`）

### 4.3 モーダル・シートの挙動

#### Sheet（下からスライド）
- `side="bottom"`
- `h-[85dvh]`（モバイル対応）
- `overflow-y-auto`

#### Dialog（中央表示）
- `max-h-[90dvh]`
- `overflow-y-auto`

### 4.4 アニメーション

- **framer-motion**: カウントダウン、カード表示、プログレスバー
- **transition**: `transition-all duration-200`
- **active**: `active:scale-95`（タップフィードバック）

### 4.5 レスポンシブ設計

- **モバイルファースト**: 基本スタイルはモバイル、`md:` でPC対応
- **ブレークポイント**: `md` (768px)
- **コンテナ**: `max-w-md mx-auto`（モバイル）、`max-w-4xl`（PC）

---

## 5. データの扱い

### 5.1 モックデータの場所

#### 新郎新婦側

**`app/couple/layout.tsx`**:
```typescript
const MOCK_WEDDING_DATE = new Date('2026-03-15');
const MOCK_WEDDING = {
  venueCoverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
};
```

**`app/couple/page.tsx`**:
```typescript
const MOCK_WEDDING = {
  weddingDate: new Date('2026-03-15'),
  tables: [
    { id: 'table-a', name: 'A', isCompleted: true },
    { id: 'table-b', name: 'B', isCompleted: true },
    { id: 'table-c', name: 'C', isCompleted: false },
  ],
};
```

**`app/couple/tables/page.tsx`**:
```typescript
const MOCK_WEDDING = {
  weddingDate: new Date('2026-03-15'),
  tables: [
    { id: 'table-a', name: 'A', message: '...', photoUrl: '...', photos: [], isSkipped: false, isCompleted: true },
    // ...
  ],
};
```

**`app/couple/gallery/page.tsx`**:
```typescript
const MOCK_WEDDING_DATE = new Date('2026-03-15');
const MOCK_PHOTOS = {
  all: [/* 写真オブジェクト */],
  byTable: { /* 卓ごとの写真 */ },
  tables: [/* 卓情報 */],
};
```

#### ゲスト側

**`app/(guest)/guest/(main)/gallery/page.tsx`**:
```typescript
const VENUE_INFO = {
  name: '表参道テラス',
  coverImage: 'https://picsum.photos/800/600?random=venue',
  date: '2026.01.20',
};
```

### 5.2 API連携の有無

**現状**: すべてモックデータを使用

- 実際のAPI呼び出しは未実装
- `setTimeout` でアップロード処理をシミュレート
- コメントに「実際のAPI呼び出しに置き換える」と記載

### 5.3 localStorage使用箇所

- **レビュー完了状態**: `wedding_app_has_reviewed_${coupleId}`
- **用途**: レビュー画面の重複表示を防止

---

## 6. 引き継ぎ事項 / NEXT STEP

### 6.1 TODOコメント（コード内に存在）

#### `app/couple/settings/page.tsx`
```typescript
// TODO: パスワード変更処理
```

#### `app/couple/gallery/page.tsx`
```typescript
const coupleId = 1; // TODO: 実際のcoupleIdに置き換え（ダッシュボードと同じ値を使用）
// ...
googleMapsUrl="https://www.google.com/maps/place/example" // TODO: 実際のGoogle Maps URLに置き換え
```

#### `app/(guest)/guest/(main)/gallery/page.tsx`
```typescript
const LINE_ID = '@あなたのLINE_ID'; // TODO: .envから取得するように変更
const LINE_ADD_FRIEND_URL = 'https://line.me/R/ti/p/@your_line_id'; // TODO: 本番環境ではここに実際のLINE公式アカウントのURLを設定する
```

### 6.2 次の開発者がまず着手すべきタスク

1. **API連携の実装**
   - モックデータを実際のAPI呼び出しに置き換える
   - エラーハンドリングの追加
   - ローディング状態の改善

2. **認証・認可の実装**
   - `coupleId` の実際の取得方法
   - セッション管理

3. **環境変数の設定**
   - LINE ID、Google Maps URL などの外部サービス連携情報を `.env` に移動

4. **データベース設計**
   - Prismaスキーマ（`schema.prisma`）の確認と更新
   - 実際のデータモデルとの整合性確認

5. **テストの追加**
   - ユニットテスト（特にビジネスロジック）
   - E2Eテスト（主要フロー）

### 6.3 注意事項

- **コードベースを正解として扱う**: このドキュメントは実際のコードに基づいて作成されています。会話の履歴ではなく、コードが Single Source of Truth です。
- **モバイルファースト**: PC表示は最低限の考慮で問題ありません。
- **デザインの一貫性**: Emerald系の配色と `text-balance` などの最適化を維持してください。

---

**このドキュメントは、実際のコードベース（2026年1月時点）に基づいて作成されました。**
