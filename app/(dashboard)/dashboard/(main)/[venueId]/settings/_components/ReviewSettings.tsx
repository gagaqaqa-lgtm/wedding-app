'use client';

import React, { useState } from 'react';
import { Star, Heart, Users, ExternalLink, Link, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ReviewSettingsData {
  coupleReviewUrl: string;
  coupleReviewThreshold: number;
  guestReviewUrl: string;
  guestReviewThreshold: number;
  reviewNotificationEmail: string;
}

interface ReviewSettingsProps {
  settings: ReviewSettingsData;
  onUpdate: (settings: ReviewSettingsData) => void;
  isValidUrl: (url: string) => boolean;
  isValidEmail: (email: string) => boolean;
  onTestLink: (url: string) => void;
}

export function ReviewSettings({
  settings,
  onUpdate,
  isValidUrl,
  isValidEmail,
  onTestLink,
}: ReviewSettingsProps) {
  const updateField = (field: keyof ReviewSettingsData, value: string | number) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          口コミ収集設定
        </h2>
        <p className="text-sm text-gray-500">
          新郎新婦およびゲストからの口コミ収集ルールをカスタマイズします
        </p>
      </div>

      <div className="space-y-8">
        {/* 新郎新婦向け設定 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">新郎新婦向け設定</h3>
              <p className="text-xs text-gray-500">ゲスト撮影の写真をダウンロードする際の口コミ収集ルール</p>
            </div>
          </div>

          <div className="space-y-4 pl-4">
            {/* 口コミ投稿先URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                口コミ投稿先URL
              </label>
              <p className="text-xs text-gray-500 mb-3">
                高評価の場合に誘導する口コミサイトのURL（Googleマップ、みんなのウェディング等）
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={settings.coupleReviewUrl || ''}
                  onChange={(e) => updateField('coupleReviewUrl', e.target.value)}
                  className={cn(
                    'flex-1 h-12 px-4 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200',
                    settings.coupleReviewUrl && !isValidUrl(settings.coupleReviewUrl)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  )}
                  placeholder="例: https://g.page/r/..., https://www.mwed.jp/hall/..."
                />
                {settings.coupleReviewUrl && (
                  <button
                    type="button"
                    onClick={() => onTestLink(settings.coupleReviewUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 text-sm font-medium"
                  >
                    <Link className="w-4 h-4" />
                    確認
                  </button>
                )}
              </div>
              {settings.coupleReviewUrl && !isValidUrl(settings.coupleReviewUrl) && (
                <p className="mt-1 text-xs text-red-600">URL形式が正しくありません</p>
              )}
            </div>

            {/* 評価閾値 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                評価閾値（星の数）
              </label>
              <p className="text-xs text-gray-500 mb-3">
                この星数以上の場合、上記のURLへ誘導します（1〜5の範囲）
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateField('coupleReviewThreshold', rating)}
                      className={cn(
                        'transition-all duration-200 active:scale-95',
                        settings.coupleReviewThreshold >= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      )}
                    >
                      <Star className="w-8 h-8" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.coupleReviewThreshold}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1 && value <= 5) {
                        updateField('coupleReviewThreshold', value);
                      }
                    }}
                    className="w-20 h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center font-semibold"
                  />
                  <span className="text-sm text-gray-600">以上</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ゲスト向け設定 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">ゲスト向け設定</h3>
              <p className="text-xs text-gray-500">ゲストが写真を閲覧する際の口コミ収集ルール</p>
            </div>
          </div>

          <div className="space-y-4 pl-4">
            {/* 口コミ投稿先URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                口コミ投稿先URL
              </label>
              <p className="text-xs text-gray-500 mb-3">
                高評価の場合に誘導する口コミサイトのURL（Googleマップ、みんなのウェディング等）
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={settings.guestReviewUrl || ''}
                  onChange={(e) => updateField('guestReviewUrl', e.target.value)}
                  className={cn(
                    'flex-1 h-12 px-4 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200',
                    settings.guestReviewUrl && !isValidUrl(settings.guestReviewUrl)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  )}
                  placeholder="例: https://g.page/r/..., https://www.mwed.jp/hall/..."
                />
                {settings.guestReviewUrl && (
                  <button
                    type="button"
                    onClick={() => onTestLink(settings.guestReviewUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 text-sm font-medium"
                  >
                    <Link className="w-4 h-4" />
                    確認
                  </button>
                )}
              </div>
              {settings.guestReviewUrl && !isValidUrl(settings.guestReviewUrl) && (
                <p className="mt-1 text-xs text-red-600">URL形式が正しくありません</p>
              )}
            </div>

            {/* 評価閾値 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                評価閾値（星の数）
              </label>
              <p className="text-xs text-gray-500 mb-3">
                この星数以上の場合、上記のURLへ誘導します（1〜5の範囲）
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateField('guestReviewThreshold', rating)}
                      className={cn(
                        'transition-all duration-200 active:scale-95',
                        settings.guestReviewThreshold >= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      )}
                    >
                      <Star className="w-8 h-8" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.guestReviewThreshold}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1 && value <= 5) {
                        updateField('guestReviewThreshold', value);
                      }
                    }}
                    className="w-20 h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center font-semibold"
                  />
                  <span className="text-sm text-gray-600">以上</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 通知先設定 */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 pb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">フィードバック通知先</h3>
              <p className="text-xs text-gray-500">低評価（設定した星の数未満）のフィードバックを受け取るメールアドレス</p>
            </div>
          </div>

          <div className="pl-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                通知先メールアドレス
              </label>
              <p className="text-xs text-gray-500 mb-3">
                評価が閾値未満の場合、フィードバック内容をこのメールアドレスへ送信します
              </p>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0 mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <input
                    type="email"
                    value={settings.reviewNotificationEmail || ''}
                    onChange={(e) => updateField('reviewNotificationEmail', e.target.value)}
                    className={cn(
                      'w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200',
                      settings.reviewNotificationEmail && !isValidEmail(settings.reviewNotificationEmail)
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    )}
                    placeholder="例: feedback@venue.jp"
                  />
                  {settings.reviewNotificationEmail && !isValidEmail(settings.reviewNotificationEmail) && (
                    <p className="mt-1 text-xs text-red-600">メールアドレス形式が正しくありません</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
