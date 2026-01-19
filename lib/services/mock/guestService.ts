/**
 * Guest Service (Mock)
 * 
 * ゲスト情報の取得・更新、レビュー送信を行うサービス層
 * 
 * BACKEND_TODO: このファイル内のすべての関数を実際のAPI呼び出しに置き換える
 */

import type { Guest, Feedback } from '@/lib/types/schema';

/**
 * レビューを送信
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: POST /api/feedbacks
 * 
 * @param weddingId - 挙式ID
 * @param userId - ユーザーID
 * @param rating - 評価（1-5）
 * @param content - フィードバック内容（オプション）
 * @returns 作成されたフィードバック情報
 */
export async function submitReview(
  weddingId: string,
  userId: string,
  rating: number,
  content?: string
): Promise<Feedback> {
  return {
    id: `feedback-${Date.now()}`,
    content: content || '',
    rating,
    source: 'GUEST',
    weddingId,
    userId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * ギャラリーのロックを解除
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: POST /api/guests/:guestId/unlock-gallery
 * 
 * レビュー完了後にギャラリーへのアクセスを許可する
 * 
 * @param guestId - ゲストID
 * @returns 更新後のゲスト情報
 */
export async function unlockGallery(guestId: string): Promise<Guest> {
  // Mockデータ
  return {
    id: guestId,
    name: 'ゲスト',
    email: 'guest@example.com',
    role: 'GUEST',
    weddingId: 'wedding-1',
    tableId: null,
    status: 'confirmed',
    surveyStatus: 'answered',
    allergyStatus: 'none',
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * ゲスト情報を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/guests/:guestId
 * 
 * @param guestId - ゲストID
 * @returns ゲスト情報
 */
export async function getGuestInfo(guestId: string): Promise<Guest> {
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
  };
}

/**
 * 挙式に紐づくフィードバック一覧を取得
 * 
 * BACKEND_TODO: Replace with actual API call
 * API Endpoint: GET /api/weddings/:weddingId/feedbacks
 * 
 * @param weddingId - 挙式ID
 * @returns フィードバックの配列
 */
export async function getFeedbacks(weddingId: string): Promise<Feedback[]> {
  // Mockデータ
  return [
    {
      id: 'feedback-1',
      content: '素晴らしい式でした！',
      rating: 5,
      source: 'GUEST',
      weddingId,
      userId: 'guest-1',
      createdAt: new Date('2026-10-25T14:30:00').toISOString(),
    },
    {
      id: 'feedback-2',
      content: '料理の提供が遅く、ゲストの方が待たされてしまいました。',
      rating: 2,
      source: 'GUEST',
      weddingId,
      userId: 'guest-2',
      createdAt: new Date('2026-10-25T15:00:00').toISOString(),
    },
  ];
}
