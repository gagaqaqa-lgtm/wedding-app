'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Star, Heart, Users, MessageSquareQuote, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// フィードバックの型定義（挙式情報を含む）
export interface FeedbackWithWedding {
  id: string;
  content: string;
  rating: number;
  source: 'COUPLE' | 'GUEST';
  createdAt: string;
  wedding: {
    id: string;
    familyNames: string;
    date: string;
  };
}

interface FeedbackFeedProps {
  venueId: string;
}

// 日付フォーマット関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 相対時間フォーマット
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

  if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return formatDate(dateString);
  }
};

// フィードバック取得関数（モック）
async function fetchFeedbacks(venueId: string): Promise<FeedbackWithWedding[]> {
  // TODO: 実際のAPI呼び出しに置き換え
  // const response = await fetch(`/api/venues/${venueId}/feedbacks`);
  // return response.json();

  // モックデータ
  return [
    {
      id: 'feedback-1',
      content: 'スタッフの対応が少し冷たかったです。もう少し笑顔で接客していただけると良かったです。',
      rating: 3,
      source: 'COUPLE',
      createdAt: new Date('2026-10-25T14:30:00').toISOString(),
      wedding: {
        id: '1',
        familyNames: '田中・佐藤 様',
        date: '2026-10-20',
      },
    },
    {
      id: 'feedback-2',
      content: '料理の提供が遅く、ゲストの方が待たされてしまいました。',
      rating: 2,
      source: 'GUEST',
      createdAt: new Date('2026-10-25T15:00:00').toISOString(),
      wedding: {
        id: '2',
        familyNames: '山田・伊藤 様',
        date: '2026-10-22',
      },
    },
    {
      id: 'feedback-3',
      content: '会場の雰囲気は素晴らしかったですが、音響設備の調整がもう少し必要だったかもしれません。',
      rating: 3,
      source: 'COUPLE',
      createdAt: new Date('2026-10-24T10:00:00').toISOString(),
      wedding: {
        id: '3',
        familyNames: '佐藤・高橋 様',
        date: '2026-10-25',
      },
    },
  ];
}

// スケルトンローディング
function FeedbackFeedSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// メインコンポーネント
function FeedbackFeedContent({ venueId }: FeedbackFeedProps) {
  const [feedbacks, setFeedbacks] = React.useState<FeedbackWithWedding[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFeedbacks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFeedbacks(venueId);
        setFeedbacks(data);
      } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedbacks();
  }, [venueId]);

  if (isLoading) {
    return <FeedbackFeedSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">最新のお客様の声</h2>
        </div>
        {feedbacks.length > 0 && (
          <Link
            href={`/dashboard/${venueId}/weddings`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
          >
            すべて見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* フィードバック一覧 */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">まだフィードバックはありません</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={cn(
                'border rounded-lg p-4 transition-all duration-200 hover:shadow-sm',
                feedback.source === 'COUPLE'
                  ? 'border-pink-200 bg-pink-50/30'
                  : 'border-blue-200 bg-blue-50/30'
              )}
            >
              {/* 上段: 挙式名と日付 */}
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/dashboard/${venueId}/weddings/${feedback.wedding.id}?tab=feedback`}
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                >
                  {feedback.wedding.familyNames}
                </Link>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatRelativeTime(feedback.createdAt)}</span>
                </div>
              </div>

              {/* 中段: 評価とバッジ */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={cn(
                        'w-3 h-3 transition-colors',
                        feedback.rating >= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    feedback.source === 'COUPLE'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {feedback.source === 'COUPLE' ? 'Couple' : 'Guest'}
                </span>
              </div>

              {/* 下段: フィードバック本文 */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {feedback.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FeedbackFeed({ venueId }: FeedbackFeedProps) {
  return (
    <Suspense fallback={<FeedbackFeedSkeleton />}>
      <FeedbackFeedContent venueId={venueId} />
    </Suspense>
  );
}
