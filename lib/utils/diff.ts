// 差分検出ロジック
import type { Guest, DiffItem } from '../types/admin';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

/**
 * 前回ログイン時刻からの差分を検出
 */
export function detectDiff(
  currentGuests: Guest[],
  lastLoginAt: Date | null
): DiffItem[] {
  if (!lastLoginAt) return [];

  const diffs: DiffItem[] = [];
  const lastLoginTime = lastLoginAt.getTime();

  currentGuests.forEach((guest) => {
    const updatedAt = new Date(guest.updatedAt).getTime();
    const createdAt = new Date(guest.createdAt).getTime();

    // 新規追加
    if (createdAt > lastLoginTime) {
      diffs.push({
        id: `guest_added_${guest.id}`,
        type: 'guest_added',
        guestName: guest.name,
        description: `新規ゲスト追加: ${guest.name}`,
        timestamp: guest.createdAt,
        isNew: true,
      });
    }

    // 更新
    if (updatedAt > lastLoginTime && createdAt <= lastLoginTime) {
      diffs.push({
        id: `guest_updated_${guest.id}`,
        type: 'guest_updated',
        guestName: guest.name,
        description: `ゲスト情報更新: ${guest.name}`,
        timestamp: guest.updatedAt,
        isNew: true,
      });
    }

    // アレルギー更新
    if (guest.allergyStatus === 'reported' && updatedAt > lastLoginTime) {
      diffs.push({
        id: `allergy_updated_${guest.id}`,
        type: 'allergy_updated',
        guestName: guest.name,
        description: `アレルギー情報更新: ${guest.name} (${guest.allergies.join(', ')})`,
        timestamp: guest.updatedAt,
        isNew: true,
      });
    }

    // アンケート回答
    if (guest.surveyStatus === 'answered' && updatedAt > lastLoginTime) {
      diffs.push({
        id: `survey_answered_${guest.id}`,
        type: 'survey_answered',
        guestName: guest.name,
        description: `アンケート回答: ${guest.name}`,
        timestamp: guest.updatedAt,
        isNew: true,
      });
    }
  });

  // タイムスタンプでソート（新しい順）
  return diffs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * 相対時間を日本語でフォーマット
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
}
