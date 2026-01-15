/**
 * Photo Service (Mock)
 * 
 * 写真のアップロード・取得・削除を行うサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 */

import type { Photo } from '@/lib/types/schema';

/**
 * 写真をアップロード
 * 
 * BACKEND_TODO: Replace with Supabase Storage upload
 * API Endpoint: POST /api/photos
 * Storage: Supabase Storage (wedding-photos/:weddingId/:tableId/)
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
  // Mock: ファイルをアップロードした想定で、URLを生成
  const objectUrl = URL.createObjectURL(file);
  
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
 * BACKEND_TODO: Replace with batch upload API call
 * API Endpoint: POST /api/photos/batch
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
  // 並列でアップロード（実際の実装では、レート制限を考慮して順次処理にする場合もある）
  const photos = await Promise.all(
    files.map((file) => uploadPhoto(file, weddingId, tableId, uploaderId))
  );
  
  return photos;
}

/**
 * 卓に紐づく写真一覧を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/tables/:tableId/photos
 * 
 * @param tableId - 卓ID
 * @returns 写真の配列
 */
export async function getPhotosByTable(tableId: string): Promise<Photo[]> {
  // Mockデータ
  return [];
}

/**
 * 挙式に紐づく写真一覧を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId/photos
 * 
 * @param weddingId - 挙式ID
 * @returns 写真の配列
 */
export async function getPhotosByWedding(weddingId: string): Promise<Photo[]> {
  // Mockデータ
  return [];
}

/**
 * 写真を削除
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: DELETE /api/photos/:photoId
 * Storage: Supabase Storage (ファイルも削除)
 * 
 * @param photoId - 写真ID
 * @param userId - 削除を実行したユーザーID（権限チェック用）
 * @returns 削除成功時は true
 */
export async function deletePhoto(
  photoId: string,
  userId: string
): Promise<boolean> {
  return true;
}

/**
 * 写真をお気に入りに追加/削除
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: PATCH /api/photos/:photoId/favorite
 * 
 * @param photoId - 写真ID
 * @param isFavorite - お気に入りにするかどうか
 * @returns 更新後の写真情報
 */
export async function togglePhotoFavorite(
  photoId: string,
  isFavorite: boolean
): Promise<Photo> {
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
    isFavorite,
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
