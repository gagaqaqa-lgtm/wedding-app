"use client";

import React, { useState, use } from "react";
import { getVenueInfo } from "@/lib/constants/venues";

// 型定義
interface Venue {
  id: string;
  name: string;
  maxTables: number;
  maxCapacity: number;
}

// アイコン (インラインSVG)
const Icons = {
  Plus: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Building: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><path d="M3 12h18"/></svg>,
  X: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Users: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Table: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  QrCode: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3"/><path d="M9 21v-3"/><path d="M21 21v.01"/><path d="M12 7v3"/><path d="M7 12h3"/><path d="M12 12h.01"/></svg>,
  Download: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Copy: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
};


interface VenueVenuesPageProps {
  params: Promise<{ venueId: string }>;
}

// ダミーデータ
const INITIAL_VENUES: Venue[] = [
  {
    id: "v1",
    name: "メインバンケット",
    maxTables: 25,
    maxCapacity: 180,
  },
  {
    id: "v2",
    name: "スカイホール",
    maxTables: 12,
    maxCapacity: 80,
  },
  {
    id: "v3",
    name: "ガーデンテラス",
    maxTables: 8,
    maxCapacity: 50,
  },
];

export default function VenueVenuesPage({ params }: VenueVenuesPageProps) {
  const { venueId } = use(params);
  const venueInfo = getVenueInfo(venueId);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedVenueForQr, setSelectedVenueForQr] = useState<Venue | null>(null);
  const [copied, setCopied] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    maxTables: 10,
    maxCapacity: 60,
  });

  // モーダルを開く（新規）
  const handleOpenModal = () => {
    setEditingVenue(null);
    setFormData({
      name: "",
      maxTables: 10,
      maxCapacity: 60,
    });
    setIsModalOpen(true);
  };

  // モーダルを開く（編集）
  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      maxTables: venue.maxTables,
      maxCapacity: venue.maxCapacity,
    });
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
    setFormData({
      name: "",
      maxTables: 10,
      maxCapacity: 60,
    });
  };

  // 保存処理
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.name.trim()) {
      alert("会場名を入力してください。");
      return;
    }
    if (formData.maxTables < 1) {
      alert("最大卓数は1以上を指定してください。");
      return;
    }
    if (formData.maxCapacity < 1) {
      alert("最大収容人数は1以上を指定してください。");
      return;
    }

    setIsSaving(true);

    // TODO: API呼び出し
    setTimeout(() => {
      if (editingVenue) {
        // 編集
        setVenues(prev =>
          prev.map(v =>
            v.id === editingVenue.id
              ? {
                  ...v,
                  name: formData.name.trim(),
                  maxTables: formData.maxTables,
                  maxCapacity: formData.maxCapacity,
                }
              : v
          )
        );
        alert("会場情報を更新しました！");
      } else {
        // 新規作成
        const newVenue: Venue = {
          id: `v_${Date.now()}`,
          name: formData.name.trim(),
          maxTables: formData.maxTables,
          maxCapacity: formData.maxCapacity,
        };
        setVenues([...venues, newVenue]);
        alert("会場を登録しました！");
      }

      setIsSaving(false);
      handleCloseModal();
    }, 800);
  };

  // 削除処理
  const handleDelete = (venueId: string, venueName: string) => {
    if (confirm(`「${venueName}」を削除しますか？\nこの操作は取り消せません。`)) {
      setVenues(prev => prev.filter(v => v.id !== venueId));
      alert("会場を削除しました。");
    }
  };

  // QRコードモーダルを開く
  const handleOpenQrModal = (venue: Venue, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVenueForQr(venue);
    setIsQrModalOpen(true);
    setCopied(false);
  };

  // QRコードモーダルを閉じる
  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setSelectedVenueForQr(null);
    setCopied(false);
  };

  // QRコードのURLを生成
  const getQrCodeUrl = (venueId: string) => {
    // 実際のURLは後で変更可能
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    return `${baseUrl}/venues/${venueId}`;
  };

  // QRコード画像のURLを生成（高解像度）
  const getQrCodeImageUrl = (venueId: string) => {
    const url = getQrCodeUrl(venueId);
    // 高解像度のQRコードを生成（500x500px）
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
  };

  // 画像をダウンロード
  const handleDownloadQr = async () => {
    if (!selectedVenueForQr) return;

    try {
      const imageUrl = getQrCodeImageUrl(selectedVenueForQr.id);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedVenueForQr.name}_QRコード.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('ダウンロードに失敗しました。');
    }
  };

  // URLをクリップボードにコピー
  const handleCopyUrl = async () => {
    if (!selectedVenueForQr) return;

    const url = getQrCodeUrl(selectedVenueForQr.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('URLのコピーに失敗しました。');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.Building className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">会場設定</h1>
                <p className="text-sm text-gray-600 mt-1">会場: {venueInfo.name} ({venueId})</p>
              </div>
            </div>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md"
            >
              <Icons.Plus />
              新規会場登録
            </button>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            {/* 会場カードグリッド */}
          {venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => handleEditVenue(venue)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer p-6 flex flex-col"
                >
                  {/* アイコンエリア */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                    <Icons.Building />
                  </div>

                  {/* 会場名 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {venue.name}
                  </h3>

                  {/* スペック表示 */}
                  <div className="flex-1 space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                        <Icons.Table className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">最大卓数</span>
                        <div className="text-lg font-bold text-gray-900">
                          {venue.maxTables}卓
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
                        <Icons.Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">最大収容人数</span>
                        <div className="text-lg font-bold text-gray-900">
                          {venue.maxCapacity}名
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 操作ボタン */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 pt-4 border-t border-gray-100"
                  >
                    <button
                      onClick={(e) => handleOpenQrModal(venue, e)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                      title="QRコードを表示"
                    >
                      <Icons.QrCode className="w-4 h-4" />
                      QRコード
                    </button>
                    <button
                      onClick={() => handleEditVenue(venue)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                    >
                      <Icons.Edit className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id, venue.name)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                    >
                      <Icons.Trash className="w-4 h-4" />
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gray-100 text-gray-400 mx-auto mb-4">
                <Icons.Building />
              </div>
              <p className="text-gray-500 mb-6">登録されている会場がありません</p>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md"
              >
                <Icons.Plus />
                最初の会場を登録
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* 登録/編集モーダル */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVenue ? "会場情報を編集" : "新規会場登録"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 会場名 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    会場名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                    placeholder="例: グランドボールルーム"
                  />
                </div>

                {/* 最大卓数 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    最大卓数 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.maxTables}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxTables: Number(e.target.value),
                        })
                      }
                      className="w-32 h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                    />
                    <span className="text-sm text-gray-600">卓</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    この会場に配置可能なテーブル数の上限を設定します
                  </p>
                </div>

                {/* 最大収容人数 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    最大収容人数 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.maxCapacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxCapacity: Number(e.target.value),
                        })
                      }
                      className="w-32 h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out"
                    />
                    <span className="text-sm text-gray-600">名</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    この会場の最大収容人数を設定します
                  </p>
                </div>
              </div>

              {/* モーダルフッター */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                >
                  {isSaving ? (
                    "保存中..."
                  ) : (
                    <>
                      <Icons.Check />
                      {editingVenue ? "更新" : "登録"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QRコードモーダル */}
      {isQrModalOpen && selectedVenueForQr && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseQrModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedVenueForQr.name} のゲスト用QRコード
              </h2>
              <button
                onClick={handleCloseQrModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex flex-col items-center">
                {/* QRコード表示エリア（印刷プレビュー感） */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm mb-6">
                  <div className="flex flex-col items-center">
                    {/* QRコード */}
                    <div className="mb-6">
                      <img
                        src={getQrCodeImageUrl(selectedVenueForQr.id)}
                        alt={`${selectedVenueForQr.name}のQRコード`}
                        className="w-64 h-64"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                    
                    {/* 説明文 */}
                    <p className="text-sm text-gray-600 text-center max-w-md">
                      ゲストはこのQRコードを読み込んでログインします
                    </p>
                  </div>
                </div>

                {/* フッターアクション */}
                <div className="flex items-center gap-3 w-full max-w-md">
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-md"
                  >
                    <Icons.Download />
                    画像をダウンロード (PNG)
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Icons.Copy />
                    {copied ? 'コピーしました！' : 'URLをコピー'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
