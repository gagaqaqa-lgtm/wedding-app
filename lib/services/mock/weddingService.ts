/**
 * Wedding Service (Mock)
 * 
 * 挙式情報を取得・更新するサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 */

import type { Wedding, Table } from '@/lib/types/schema';

/**
 * 挙式情報を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式情報
 */
export async function getWeddingInfo(weddingId: string): Promise<Wedding> {
  // Mockデータ
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    id: weddingId,
    date: today.toISOString().split('T')[0],
    time: '18:00',
    hall: 'グランドボールルーム',
    familyNames: '山田・佐藤 様',
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    welcomeImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  };
}

/**
 * ウェルカムメッセージ（画像）を更新
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: PATCH /api/weddings/:weddingId
 * Storage: Supabase Storage (wedding-welcome-images/)
 * 
 * @param weddingId - 挙式ID
 * @param welcomeImageUrl - ウェルカム画像URL
 * @returns 更新後の挙式情報
 */
export async function updateWelcomeMessage(
  weddingId: string,
  welcomeImageUrl: string
): Promise<Wedding> {
  const current = await getWeddingInfo(weddingId);
  return {
    ...current,
    welcomeImageUrl,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 挙式に紐づく卓一覧を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId/tables
 * 
 * @param weddingId - 挙式ID
 * @returns 卓の配列
 */
export async function getWeddingTables(weddingId: string): Promise<Table[]> {
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
    {
      id: 'table-c',
      name: 'C',
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
 * 挙式日を取得（Date形式）
 * 
 * BACKEND_TODO: Replace with actual API call
 * 
 * @param weddingId - 挙式ID
 * @returns 挙式日（Date形式）
 */
export async function getWeddingDate(weddingId: string): Promise<Date> {
  const wedding = await getWeddingInfo(weddingId);
  const date = new Date(wedding.date);
  date.setHours(0, 0, 0, 0);
  return date;
}
