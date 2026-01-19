"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Wedding } from "@/lib/types/schema";
import { getVenueInfo } from "@/lib/services/mock/venueService";
import { getPhotosByWedding } from '@/lib/services/mock/photoService';
import { getFeedbacks } from '@/lib/services/mock/guestService';
import { FeedbackTab, type Feedback } from "./FeedbackTab";
import { WeddingSettingsForm, type WeddingSettings } from "./WeddingSettingsForm";
import { WeddingTablesTab } from "./WeddingTablesTab";
import { ArrowLeft, Calendar, Building2, Users, Lock, Unlock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WeddingDetailClientProps {
  wedding: Wedding;
  venueId: string;
}

type TabType = 'settings' | 'tables' | 'photos' | 'feedback';

/**
 * 挙式詳細ページのクライアントコンポーネント
 * 
 * Server Componentから渡されたデータを表示し、インタラクティブなUIを提供
 */
export function WeddingDetailClient({ wedding, venueId }: WeddingDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [venueInfo, setVenueInfo] = useState<{ name: string; plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM' } | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // 会場情報の取得
  useEffect(() => {
    const loadVenueInfo = async () => {
      const venue = await getVenueInfo(venueId);
      if (venue) {
        setVenueInfo({ name: venue.name, plan: venue.plan });
      }
    };
    loadVenueInfo();
  }, [venueId]);

  // 写真データの読み込み
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photoData = await getPhotosByWedding(wedding.id);
        setPhotos(photoData);
      } catch (error) {
        console.error('Failed to load photos:', error);
      }
    };
    loadPhotos();
  }, [wedding.id]);

  // フィードバックデータの読み込み
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const feedbackData = await getFeedbacks(wedding.id);
        const convertedFeedbacks: Feedback[] = feedbackData.map(f => ({
          id: f.id,
          content: f.content,
          rating: f.rating,
          source: f.source,
          createdAt: f.createdAt,
        }));
        setFeedbacks(convertedFeedbacks);
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      }
    };
    loadFeedbacks();
  }, [wedding.id]);

  // 日付・時間をフォーマット
  const formatDateTime = (dateString: string, timeString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${timeString}`;
  };

  // 新郎新婦としてログイン（プレビュー）
  const handleProxyLogin = () => {
    window.open(`/couple?weddingId=${wedding.id}`, '_blank', 'noopener,noreferrer');
    toast.success('新郎新婦画面を開きました', {
      description: '別タブで表示を確認できます',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* ヘッダー情報カード */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border-none shadow-lg p-6">
            {/* 戻るボタンとアクションボタン */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href={`/dashboard/${venueId}/weddings`}
                className="inline-flex items-center gap-2 text-sm text-white hover:bg-white/20 rounded-md px-2 py-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                挙式一覧に戻る
              </Link>
              <Button
                onClick={handleProxyLogin}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                新郎新婦としてログイン
              </Button>
            </div>
            
            {/* 新郎新婦名 */}
            <div className="mb-6 pb-6 border-b border-white/20">
              <h1 className="text-3xl font-bold text-white leading-relaxed">
                {wedding.familyNames}
              </h1>
            </div>
            
            {/* メタ情報エリア */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* 挙式日時 */}
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">挙式日時</p>
                  <p className="text-sm font-semibold text-white">{formatDateTime(wedding.date, wedding.time)}</p>
                </div>
              </div>
              
              {/* 会場名 */}
              {wedding.hall && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-emerald-100 mb-0.5">会場名</p>
                    <p className="text-sm font-semibold text-white">{wedding.hall}</p>
                  </div>
                </div>
              )}
              
              {/* ゲスト数 */}
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-emerald-100 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ゲスト数</p>
                  <p className="text-sm font-semibold text-white">{wedding.guestCount || 0}名</p>
                </div>
              </div>
              
              {/* ステータス */}
              <div className="flex items-start gap-2">
                <div>
                  <p className="text-xs text-emerald-100 mb-0.5">ステータス</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 ${
                    wedding.isLocked ? "" : ""
                  }`}>
                    {wedding.isLocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        確定
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        準備中
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 会場情報 */}
            <div className="text-xs text-white/70 border-t border-white/20 pt-4">
              会場: {venueInfo?.name || venueId} ({venueId})
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex gap-2 border-b border-emerald-100">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'settings'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                基本情報
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'tables'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                卓設定
                {activeTab === 'tables' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'photos'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                写真
                {activeTab === 'photos' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ease-in-out relative ${
                  activeTab === 'feedback'
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                フィードバック
                {feedbacks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                    {feedbacks.length}
                  </span>
                )}
                {activeTab === 'feedback' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* 基本情報セクション */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">新郎新婦名</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.familyNames}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">挙式日時</p>
                      <p className="text-base font-semibold text-gray-900">{formatDateTime(wedding.date, wedding.time)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">会場</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.hall || '未設定'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">ゲスト数</p>
                      <p className="text-base font-semibold text-gray-900">{wedding.guestCount || 0}名</p>
                    </div>
                  </div>
                </div>

                {/* 設定フォームセクション */}
                <div className="border-t border-gray-200 pt-6">
                  <WeddingSettingsForm
                    initialSettings={{
                      unlimitedGuestUpload: true, // デフォルト: 無制限モードON
                      welcomeMessage: wedding.familyNames ? `${wedding.familyNames}の結婚式へようこそ！` : 'ようこそ！',
                    }}
                    plan={venueInfo?.plan}
                    weddingId={wedding.id}
                  />
                </div>
              </div>
            )}

            {activeTab === 'tables' && (
              <WeddingTablesTab weddingId={wedding.id} />
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">写真</h2>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={photo.url}
                          alt={photo.alt || '写真'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                    <p className="text-gray-500">写真はまだありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <FeedbackTab feedbacks={feedbacks} weddingId={Number(wedding.id)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
