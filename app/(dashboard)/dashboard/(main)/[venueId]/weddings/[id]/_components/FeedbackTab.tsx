'use client';

import React from 'react';
import { Star, Heart, Users, Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// フィードバックの型定義
export interface Feedback {
  id: string;
  content: string;
  rating: number;
  source: 'COUPLE' | 'GUEST';
  createdAt: string;
}

interface FeedbackTabProps {
  feedbacks: Feedback[];
  weddingId: number;
}

// 日付フォーマット関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export function FeedbackTab({ feedbacks, weddingId }: FeedbackTabProps) {
  // フィードバックを日付順（新しい順）でソート
  const sortedFeedbacks = [...feedbacks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // ソース別にフィルタリング
  const coupleFeedbacks = sortedFeedbacks.filter(f => f.source === 'COUPLE');
  const guestFeedbacks = sortedFeedbacks.filter(f => f.source === 'GUEST');

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">フィードバック</h2>
          <p className="text-sm text-gray-500 mt-1">
            新郎新婦およびゲストから送られた低評価時のご意見を確認できます
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <span>新郎新婦: {coupleFeedbacks.length}件</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>ゲスト: {guestFeedbacks.length}件</span>
          </div>
        </div>
      </div>

      {/* フィードバック一覧 */}
      {sortedFeedbacks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">フィードバックはまだありません</h3>
          <p className="text-sm text-gray-500">
            低評価（設定した星の数未満）のフィードバックが送られると、ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={cn(
                'bg-white rounded-xl border shadow-sm p-6 transition-all duration-200 hover:shadow-md',
                feedback.source === 'COUPLE'
                  ? 'border-pink-200'
                  : 'border-blue-200'
              )}
            >
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      feedback.source === 'COUPLE'
                        ? 'bg-pink-50'
                        : 'bg-blue-50'
                    )}
                  >
                    {feedback.source === 'COUPLE' ? (
                      <Heart className="w-5 h-5 text-pink-600" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {feedback.source === 'COUPLE' ? '新郎新婦' : 'ゲスト'}
                      </span>
                      <span className="text-xs text-gray-500">からのフィードバック</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 評価表示 */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={cn(
                        'w-4 h-4 transition-colors',
                        feedback.rating >= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* フィードバック内容 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
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
