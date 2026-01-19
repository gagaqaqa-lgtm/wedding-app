# QA診断用: 当日モード（?mode=today）時の表示制御コード

## 確認ポイント

1. **早期リターンによる完全な非表示**: `isWeddingDayOrAfter` が `true` の時、既存コンテンツ（カウントダウン、ヘッダー）を完全に非表示にして `PostWeddingThankYouCard` だけを表示するか
2. **オーバーレイ vs 早期リターン**: 既存コンテンツの上にカードを被せているだけなのか、それとも早期リターンで完全に置き換えているか
3. **`daysUntil` の計算ロジックと表示制御**: 計算方法と表示箇所の条件分岐

---

## 1. app/couple/page.tsx

### 重要な部分

```typescript
// 74行目: デモ用デバッグモードの取得
const mode = searchParams.get('mode'); // デモ用デバッグモード

// 83行目: 当日以降の判定（mode=today で強制的に当日モード）
const isWeddingDayOrAfter = mode === 'today' || daysUntil === 0 || daysUntil < 0;

// 209-220行目: 早期リターンによる完全な置き換え
if (isWeddingDayOrAfter) {
  return (
    <PostWeddingThankYouCard
      coupleId={coupleId}
      onReviewSubmit={async (rating, comment) => {
        // TODO: API経由でレビューを送信
        await new Promise(resolve => setTimeout(resolve, 1000));
      }}
      albumPath="/couple/gallery"
    />
  );
}

// 222行目以降: 通常のコンテンツ（isWeddingDayOrAfter が false の場合のみ表示）
return (
  <div className="min-h-dvh bg-gray-50 pb-24">
    {/* メインコンテンツ */}
    {/* ... */}
    {daysUntil > 0 && (
      <p className="text-base text-gray-700">
        あと <span className="font-bold text-emerald-600">{daysUntil}</span> 日
      </p>
    )}
    {/* ... */}
  </div>
);
```

### 診断結果

✅ **早期リターンによる完全な非表示**: `isWeddingDayOrAfter` が `true` の場合、209行目で早期リターンしているため、222行目以降の通常コンテンツ（カウントダウン、ヘッダー、STEP 1/2など）は一切レンダリングされません。

✅ **`daysUntil` の表示制御**: 243行目で `{daysUntil > 0 && (...)}` という条件付きレンダリングにより、`daysUntil` が0以下の場合はカウントダウン表示自体が非表示になります。

---

## 2. app/couple/tables/page.tsx

### 重要な部分

```typescript
// 188行目: デモ用デバッグモードの取得
const mode = searchParams.get('mode'); // デモ用デバッグモード

// 196行目: 当日以降の判定（mode=today で強制的に当日モード）
const isWeddingDayOrAfter = mode === 'today' || daysUntil === 0 || daysUntil < 0;

// 453-464行目: 早期リターンによる完全な置き換え
if (isWeddingDayOrAfter) {
  return (
    <PostWeddingThankYouCard
      coupleId={coupleId}
      onReviewSubmit={async (rating, comment) => {
        // TODO: API経由でレビューを送信
        await new Promise(resolve => setTimeout(resolve, 1000));
      }}
      albumPath="/couple/gallery"
    />
  );
}

// 466行目以降: 通常のコンテンツ（isWeddingDayOrAfter が false の場合のみ表示）
return (
  <div className="min-h-dvh bg-gray-50 pb-24">
    {/* メインコンテンツ */}
    {/* ... */}
  </div>
);
```

### 診断結果

✅ **早期リターンによる完全な非表示**: `isWeddingDayOrAfter` が `true` の場合、453行目で早期リターンしているため、466行目以降の通常コンテンツ（卓一覧、進捗状況など）は一切レンダリングされません。

---

## 3. components/PostWeddingThankYouCard.tsx

### 重要な部分

```typescript
// 173-454行目: コンポーネント全体の構造
return (
  <div className="relative min-h-screen w-full overflow-hidden">
    {/* 背景画像とブラーオーバーレイ */}
    <div className="absolute inset-0">
      <img src="..." alt="Wedding celebration" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/70 to-amber-50/80 backdrop-blur-sm" />
    </div>

    {/* メインコンテンツ */}
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
      <motion.div className="w-full max-w-2xl bg-[#FAF9F6] rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
        {/* コンテンツ */}
      </motion.div>
    </div>
  </div>
);
```

### 診断結果

✅ **フルスクリーン表示**: `min-h-screen` と `min-h-dvh` を使用しており、画面全体を占有する設計です。

✅ **独立したコンポーネント**: このコンポーネントは親コンポーネントから独立しており、早期リターンで呼び出されるため、既存コンテンツとは完全に分離されています。

---

## 4. daysUntil の計算ロジック

### app/couple/page.tsx と app/couple/tables/page.tsx 共通

```typescript
// カウントダウン計算関数（両ファイルで同じ）
function calculateDaysUntil(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0; // 負の値は0に変換
}
```

### 診断結果

✅ **計算ロジック**: 
- `Math.ceil` を使用しているため、当日の場合は `diffDays = 0` になります
- 負の値（過去の日付）は `0` に変換されます
- `daysUntil === 0` または `daysUntil < 0` の場合は `isWeddingDayOrAfter` が `true` になります

---

## 総合診断結果

### ✅ 表示制御の動作

1. **完全な早期リターン**: 両ファイル（`app/couple/page.tsx` と `app/couple/tables/page.tsx`）で、`isWeddingDayOrAfter` が `true` の場合、早期リターンにより `PostWeddingThankYouCard` のみが表示され、既存コンテンツは一切レンダリングされません。

2. **オーバーレイではない**: 既存コンテンツの上にカードを被せているのではなく、完全に置き換えています。

3. **`daysUntil` の表示制御**: `app/couple/page.tsx` の243行目で `{daysUntil > 0 && (...)}` という条件により、0以下の場合はカウントダウン表示自体が非表示になります。

### ⚠️ 潜在的な問題点

1. **`daysUntil` の初期値**: `useState(0)` で初期化されているため、データ読み込み前は `daysUntil = 0` となり、一時的に `isWeddingDayOrAfter` が `true` になる可能性があります。ただし、`useEffect` でデータ読み込み後に正しい値が設定されます。

2. **`mode === 'today'` の優先度**: `mode === 'today'` が最優先で評価されるため、`daysUntil` の値に関わらず強制的に当日モードになります。これは意図された動作（デバッグモード）です。

---

## 完全なコード（省略なし）

※ 各ファイルの完全なコードは、以下のファイルパスで確認できます：
- `app/couple/page.tsx` (773行)
- `app/couple/tables/page.tsx` (1008行)
- `components/PostWeddingThankYouCard.tsx` (457行)
