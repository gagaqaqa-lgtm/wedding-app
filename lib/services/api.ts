/**
 * API Service Layer
 * 
 * バックエンドAPIとの通信を行う関数群です。
 * 現在はMockデータを返しますが、将来的に実際のHTTPリクエストに置き換えます。
 * 
 * 【設計方針】
 * - すべての関数は async/await を使用
 * - 引数と戻り値は schema.ts の型定義に基づく
 * - エラーハンドリングは呼び出し側で行う
 * - JSDocで各関数の用途とデータの保存先・表示先を明記
 */

import type {
  Wedding,
  Table,
  Photo,
  Guest,
  Feedback,
  Venue,
  Account,
} from '@/lib/types/schema';

// ============================================================================
// 挙式関連 API
// ============================================================================

/**
 * 挙式情報を取得
 * 
 * 【データ保存先】データベース（weddings テーブル）
 * 【表示先】Couple側のホーム画面、プランナー管理画面
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式情報
 */
export async function getWedding(weddingId: string): Promise<Wedding> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/weddings/${weddingId}`);
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return {
    id: weddingId,
    date: '2026-03-15',
    time: '18:00',
    hall: 'グランドボールルーム',
    familyNames: '山田・佐藤 様',
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 挙式情報を更新
 * 
 * 【データ保存先】データベース（weddings テーブル）
 * 【表示先】Couple側のホーム画面、プランナー管理画面
 * 
 * @param weddingId - 挙式ID
 * @param updates - 更新するフィールド
 * @returns 更新後の挙式情報
 */
export async function updateWedding(
  weddingId: string,
  updates: Partial<Wedding>
): Promise<Wedding> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/weddings/${weddingId}`, {
  //   method: 'PATCH',
  //   body: JSON.stringify(updates),
  // });
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  const current = await getWedding(weddingId);
  return {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 挙式をロック（データ確定）
 * 
 * 【データ保存先】データベース（weddings テーブル）
 * 【表示先】プランナー管理画面（挙式詳細）
 * 
 * @param weddingId - 挙式ID
 * @param userId - ロックを実行したユーザーID
 * @returns 更新後の挙式情報
 */
export async function lockWedding(
  weddingId: string,
  userId: string
): Promise<Wedding> {
  // BACKEND_TODO: Replace with actual API call
  // API Endpoint: POST /api/weddings/:weddingId/lock
  
  return updateWedding(weddingId, {
    isLocked: true,
    lockedAt: new Date().toISOString(),
    lockedBy: userId,
  });
}

// ============================================================================
// 卓関連 API
// ============================================================================

/**
 * 挙式に紐づく卓一覧を取得
 * 
 * 【データ保存先】データベース（tables テーブル）
 * 【表示先】Couple側の卓設定画面、プランナー管理画面（挙式詳細）
 * 
 * @param weddingId - 挙式ID
 * @returns 卓の配列
 */
export async function getTables(weddingId: string): Promise<Table[]> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/weddings/${weddingId}/tables`);
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [
    {
      id: 'table-a',
      name: 'A',
      message: '',
      photoUrl: null,
      isSkipped: false,
      isCompleted: false,
      weddingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'table-b',
      name: 'B',
      message: '',
      photoUrl: null,
      isSkipped: false,
      isCompleted: false,
      weddingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * 卓情報を更新
 * 
 * 【データ保存先】データベース（tables テーブル）
 * 【表示先】Couple側の卓設定画面、Guest側のギャラリー（卓ごとのアルバム）
 * 
 * @param tableId - 卓ID
 * @param updates - 更新するフィールド
 * @returns 更新後の卓情報
 */
export async function updateTable(
  tableId: string,
  updates: Partial<Table>
): Promise<Table> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/tables/${tableId}`, {
  //   method: 'PATCH',
  //   body: JSON.stringify(updates),
  // });
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  // Mock: 現在の卓情報を取得（実際はAPIから取得）
  const mockTable: Table = {
    id: tableId,
    name: 'A',
    message: '',
    photoUrl: null,
    isSkipped: false,
    isCompleted: false,
    weddingId: 'wedding-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return {
    ...mockTable,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 卓のメッセージを更新
 * 
 * 【データ保存先】データベース（tables テーブル）
 * 【表示先】Guest側のギャラリー（卓ごとのアルバムタブ）
 * 
 * @param tableId - 卓ID
 * @param message - メッセージ
 * @returns 更新後の卓情報
 */
export async function updateTableMessage(
  tableId: string,
  message: string
): Promise<Table> {
  // BACKEND_TODO: Replace with actual API call
  return updateTable(tableId, { message });
}

/**
 * 卓の写真URLを更新
 * 
 * 【データ保存先】データベース（tables テーブル）、ストレージ（画像ファイル）
 * 【表示先】Couple側の卓設定画面（卓カードの背景）、Guest側のギャラリー（卓ごとのアルバム）
 * 
 * @param tableId - 卓ID
 * @param photoUrl - 写真URL（ストレージ上のパス）
 * @returns 更新後の卓情報
 */
export async function updateTablePhoto(
  tableId: string,
  photoUrl: string | null
): Promise<Table> {
  // BACKEND_TODO: Replace with actual API call
  return updateTable(tableId, { photoUrl });
}

/**
 * 卓をスキップ（共通写真を使用）
 * 
 * 【データ保存先】データベース（tables テーブル）
 * 【表示先】Couple側の卓設定画面（進捗バー、卓カードの状態）
 * 
 * @param tableId - 卓ID
 * @returns 更新後の卓情報
 */
export async function skipTable(tableId: string): Promise<Table> {
  // BACKEND_TODO: Replace with actual API call
  return updateTable(tableId, {
    isSkipped: true,
    message: '',
    photoUrl: null,
    isCompleted: true,
  });
}

// ============================================================================
// 写真関連 API
// ============================================================================

/**
 * 写真をアップロード
 * 
 * 【データ保存先】ストレージ（画像ファイル）、データベース（photos テーブル）
 * 【表示先】Guest側のギャラリー（リアルタイムに表示）、Couple側のギャラリー
 * 
 * @param file - アップロードするファイル
 * @param weddingId - 挙式ID
 * @param tableId - 卓ID（卓ごとの写真の場合、全員向けの場合は null）
 * @param uploaderId - アップロードしたユーザーID
 * @returns アップロードされた写真情報
 */
export async function uploadPhoto(
  file: File,
  weddingId: string,
  tableId: string | null,
  uploaderId: string
): Promise<Photo> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const formData = new FormData();
  // formData.append('file', file);
  // formData.append('weddingId', weddingId);
  // if (tableId) formData.append('tableId', tableId);
  // formData.append('uploaderId', uploaderId);
  // 
  // const response = await fetch('/api/photos', {
  //   method: 'POST',
  //   body: formData,
  // });
  // return response.json();
  
  // BACKEND_TODO: Replace with Supabase Storage upload
  
  // Mock: ファイルをアップロードした想定で、URLを生成
  const objectUrl = URL.createObjectURL(file);
  
  // Mockデータ
  return {
    id: `photo-${Date.now()}`,
    url: objectUrl,
    alt: file.name || 'アップロード写真',
    source: tableId ? 'table' : 'guest',
    weddingId,
    tableId,
    uploadedBy: uploaderId,
    approvalStatus: 'approved',
    isMyPhoto: true,
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 複数の写真を一括アップロード
 * 
 * 【データ保存先】ストレージ（画像ファイル）、データベース（photos テーブル）
 * 【表示先】Guest側のギャラリー（リアルタイムに表示）、Couple側のギャラリー
 * 
 * @param files - アップロードするファイルの配列
 * @param weddingId - 挙式ID
 * @param tableId - 卓ID（卓ごとの写真の場合、全員向けの場合は null）
 * @param uploaderId - アップロードしたユーザーID
 * @returns アップロードされた写真情報の配列
 */
export async function uploadPhotos(
  files: File[],
  weddingId: string,
  tableId: string | null,
  uploaderId: string
): Promise<Photo[]> {
  // BACKEND_TODO: Replace with batch upload API call
  
  // 並列でアップロード（実際の実装では、レート制限を考慮して順次処理にする場合もある）
  const photos = await Promise.all(
    files.map((file) => uploadPhoto(file, weddingId, tableId, uploaderId))
  );
  
  return photos;
}

/**
 * 写真を取得
 * 
 * 【データ取得元】データベース（photos テーブル）
 * 【表示先】Couple側のギャラリー、Guest側のギャラリー
 * 
 * @param photoId - 写真ID
 * @returns 写真情報
 */
export async function getPhoto(photoId: string): Promise<Photo> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return {
    id: photoId,
    url: 'https://picsum.photos/800/600',
    alt: '写真',
    source: 'guest',
    weddingId: 'wedding-1',
    tableId: null,
    uploadedBy: 'guest-1',
    approvalStatus: 'approved',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 挙式に紐づく写真一覧を取得
 * 
 * 【データ取得元】データベース（photos テーブル）
 * 【表示先】Couple側のギャラリー（「みんなの写真」タブ）
 * 
 * @param weddingId - 挙式ID
 * @returns 写真の配列
 */
export async function getPhotos(weddingId: string): Promise<Photo[]> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/weddings/${weddingId}/photos`);
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [];
}

/**
 * 卓に紐づく写真一覧を取得
 * 
 * 【データ取得元】データベース（photos テーブル）
 * 【表示先】Guest側のギャラリー（「この卓のアルバム」タブ）、Couple側のギャラリー（卓ごとのタブ）
 * 
 * @param tableId - 卓ID
 * @returns 写真の配列
 */
export async function getPhotosByTable(tableId: string): Promise<Photo[]> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/tables/${tableId}/photos`);
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [];
}

/**
 * 写真を削除
 * 
 * 【データ削除先】ストレージ（画像ファイル）、データベース（photos テーブル）
 * 【表示先】Guest側のギャラリー（リアルタイムに非表示）、Couple側のギャラリー
 * 
 * @param photoId - 写真ID
 * @param userId - 削除を実行したユーザーID（権限チェック用）
 * @returns 削除成功時は true
 */
export async function deletePhoto(
  photoId: string,
  userId: string
): Promise<boolean> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch(`/api/photos/${photoId}`, {
  //   method: 'DELETE',
  //   headers: { 'X-User-Id': userId },
  // });
  // return response.ok;
  
  // BACKEND_TODO: Replace with actual API call
  
  return true;
}

/**
 * 写真をお気に入りに追加/削除
 * 
 * 【データ保存先】データベース（photos テーブル）
 * 【表示先】Couple側のギャラリー（お気に入りマーク）
 * 
 * @param photoId - 写真ID
 * @param isFavorite - お気に入りにするかどうか
 * @returns 更新後の写真情報
 */
export async function togglePhotoFavorite(
  photoId: string,
  isFavorite: boolean
): Promise<Photo> {
  // BACKEND_TODO: Replace with actual API call
  
  const photo = await getPhoto(photoId);
  return {
    ...photo,
    isFavorite,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// ゲスト関連 API
// ============================================================================

/**
 * 挙式に紐づくゲスト一覧を取得
 * 
 * 【データ取得元】データベース（guests テーブル）
 * 【表示先】プランナー管理画面（挙式詳細、ゲスト管理）
 * 
 * @param weddingId - 挙式ID
 * @returns ゲストの配列
 */
export async function getGuests(weddingId: string): Promise<Guest[]> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [];
}

/**
 * ゲスト情報を更新
 * 
 * 【データ保存先】データベース（guests テーブル）
 * 【表示先】プランナー管理画面（挙式詳細、ゲスト管理）
 * 
 * @param guestId - ゲストID
 * @param updates - 更新するフィールド
 * @returns 更新後のゲスト情報
 */
export async function updateGuest(
  guestId: string,
  updates: Partial<Guest>
): Promise<Guest> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return {
    id: guestId,
    name: 'ゲスト',
    email: 'guest@example.com',
    role: 'GUEST',
    weddingId: 'wedding-1',
    tableId: null,
    status: 'pending',
    surveyStatus: 'not_answered',
    allergyStatus: 'none',
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...updates,
  };
}

// ============================================================================
// フィードバック関連 API
// ============================================================================

/**
 * フィードバックを作成
 * 
 * 【データ保存先】データベース（feedbacks テーブル）
 * 【表示先】プランナー管理画面（挙式詳細、フィードバックタブ）
 * 
 * @param feedback - フィードバック情報
 * @returns 作成されたフィードバック情報
 */
export async function createFeedback(
  feedback: Omit<Feedback, 'id' | 'createdAt'>
): Promise<Feedback> {
  // TODO: 実際のAPI呼び出しに置き換える
  // const response = await fetch('/api/feedbacks', {
  //   method: 'POST',
  //   body: JSON.stringify(feedback),
  // });
  // return response.json();
  
  // BACKEND_TODO: Replace with actual API call
  
  return {
    id: `feedback-${Date.now()}`,
    ...feedback,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 挙式に紐づくフィードバック一覧を取得
 * 
 * 【データ取得元】データベース（feedbacks テーブル）
 * 【表示先】プランナー管理画面（挙式詳細、フィードバックタブ）
 * 
 * @param weddingId - 挙式ID
 * @returns フィードバックの配列
 */
export async function getFeedbacks(weddingId: string): Promise<Feedback[]> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [];
}

// ============================================================================
// 会場関連 API
// ============================================================================

/**
 * 会場情報を取得
 * 
 * 【データ取得元】データベース（venues テーブル）
 * 【表示先】スーパーアドミン画面、プランナー管理画面
 * 
 * @param venueId - 会場ID
 * @returns 会場情報
 */
export async function getVenue(venueId: string): Promise<Venue> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return {
    id: venueId,
    name: '表参道テラス',
    code: 'omotesando-terrace',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    admin: {
      name: '管理者',
      email: 'admin@example.com',
    },
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enableLineUnlock: false,
  };
}

/**
 * 会場のアカウント一覧を取得
 * 
 * 【データ取得元】データベース（accounts テーブル）
 * 【表示先】スーパーアドミン画面（会場詳細、アカウントタブ）
 * 
 * @param venueId - 会場ID
 * @returns アカウントの配列
 */
export async function getVenueAccounts(venueId: string): Promise<Account[]> {
  // BACKEND_TODO: Replace with actual API call
  
  // Mockデータ
  return [];
}

// ============================================================================
// エクスポート
// ============================================================================

/**
 * API関数群をエクスポート
 */
export const api = {
  // 挙式関連
  getWedding,
  updateWedding,
  lockWedding,
  
  // 卓関連
  getTables,
  updateTable,
  updateTableMessage,
  updateTablePhoto,
  skipTable,
  
  // 写真関連
  uploadPhoto,
  uploadPhotos,
  getPhoto,
  getPhotos,
  getPhotosByTable,
  deletePhoto,
  togglePhotoFavorite,
  
  // ゲスト関連
  getGuests,
  updateGuest,
  
  // フィードバック関連
  createFeedback,
  getFeedbacks,
  
  // 会場関連
  getVenue,
  getVenueAccounts,
};
