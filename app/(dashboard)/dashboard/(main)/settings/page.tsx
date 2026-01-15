"use client";

import React, { useState, useEffect, useMemo } from "react";

// 設定データの型定義
interface SettingsData {
  googleMapsReviewUrl: string;
  lineOfficialAccountUrl: string;
  displayVenueName: string;
}

// アイコン (インラインSVG)
const Icons = {
  Save: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ExternalLink: ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  MapPin: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Line: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><line x1="17" y1="21" x2="17" y2="13"/><line x1="7" y1="21" x2="7" y2="13"/></svg>,
  Building: ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><path d="M3 12h18"/></svg>,
  Cog: ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// 初期設定データ（実際はAPIから取得）
const INITIAL_SETTINGS: SettingsData = {
  googleMapsReviewUrl: "",
  lineOfficialAccountUrl: "",
  displayVenueName: "",
};

// URL形式のバリデーション
const isValidUrl = (urlString: string): boolean => {
  if (!urlString.trim()) return true; // 空文字は有効（未入力状態）
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default function SettingsPage() {
  // 設定データの状態管理
  const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // 初期データの読み込み（実際はAPIから取得）
  useEffect(() => {
    // TODO: APIから設定を取得
    const loadSettings = async () => {
      // モックデータ
      const mockSettings: SettingsData = {
        googleMapsReviewUrl: "",
        lineOfficialAccountUrl: "",
        displayVenueName: "",
      };
      setSettings(mockSettings);
      setOriginalSettings(mockSettings);
    };
    loadSettings();
  }, []);

  // 設定が変更されているかチェック
  const hasChanges = useMemo(() => {
    return (
      settings.googleMapsReviewUrl !== originalSettings.googleMapsReviewUrl ||
      settings.lineOfficialAccountUrl !== originalSettings.lineOfficialAccountUrl ||
      settings.displayVenueName !== originalSettings.displayVenueName
    );
  }, [settings, originalSettings]);

  // バリデーション
  const isValid = useMemo(() => {
    const googleMapsValid = isValidUrl(settings.googleMapsReviewUrl);
    const lineUrlValid = isValidUrl(settings.lineOfficialAccountUrl);
    return googleMapsValid && lineUrlValid;
  }, [settings]);

  // 設定を更新
  const updateSetting = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // リンクを確認（新しいタブで開く）
  const handleTestLink = (url: string) => {
    if (!url.trim()) {
      alert("URLが入力されていません。");
      return;
    }
    if (!isValidUrl(url)) {
      alert("無効なURL形式です。");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 保存処理
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      alert("URL形式が正しくありません。入力内容を確認してください。");
      return;
    }

    setIsSaving(true);

    // TODO: API呼び出し
    setTimeout(() => {
      setOriginalSettings({ ...settings });
      setIsSaving(false);
      alert("設定を保存しました！");
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.Cog className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">システム設定</h1>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">

          <form onSubmit={handleSave}>
            {/* A. 集客・マーケティング連携 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  集客・マーケティング連携
                </h2>
                <p className="text-sm text-gray-500">
                  ゲストアプリの「ロック解除」や「LINE誘導」の飛び先を設定します
                </p>
              </div>

              <div className="space-y-6">
                {/* Googleマップ 口コミURL */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Googleマップ 口コミ投稿用URL
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    ゲストがアンケート画面で「ロック解除」する際に遷移するURLです。自社会場のレビュー投稿画面のリンクを入力してください。
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 flex-shrink-0 mt-1">
                      <Icons.MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={settings.googleMapsReviewUrl}
                          onChange={(e) =>
                            updateSetting("googleMapsReviewUrl", e.target.value)
                          }
                          className={`flex-1 h-12 px-4 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out ${
                            !isValidUrl(settings.googleMapsReviewUrl)
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleTestLink(settings.googleMapsReviewUrl)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out text-sm font-medium whitespace-nowrap"
                        >
                          <Icons.ExternalLink className="w-4 h-4" />
                          リンクを確認
                        </button>
                      </div>
                      {!isValidUrl(settings.googleMapsReviewUrl) && (
                        <p className="mt-1 text-xs text-red-600">
                          URL形式が正しくありません
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* LINE公式アカウント URL */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    LINE友だち追加リンク
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    メニュー画面や保存完了時に表示される「LINEで受け取る」ボタンの遷移先です。
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#06C755] text-white flex-shrink-0 mt-1">
                      <Icons.Line className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={settings.lineOfficialAccountUrl}
                          onChange={(e) =>
                            updateSetting("lineOfficialAccountUrl", e.target.value)
                          }
                          className={`flex-1 h-12 px-4 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 ease-in-out ${
                            !isValidUrl(settings.lineOfficialAccountUrl)
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="https://line.me/R/ti/p/@..."
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleTestLink(settings.lineOfficialAccountUrl)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out text-sm font-medium whitespace-nowrap"
                        >
                          <Icons.ExternalLink className="w-4 h-4" />
                          リンクを確認
                        </button>
                      </div>
                      {!isValidUrl(settings.lineOfficialAccountUrl) && (
                        <p className="mt-1 text-xs text-red-600">
                          URL形式が正しくありません
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B. アプリ表示設定 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  アプリ表示設定
                </h2>
                <p className="text-sm text-gray-500">
                  ゲストアプリ内に表示される会場情報を設定します
                </p>
              </div>

              <div className="space-y-6">
                {/* 表示会場名 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    アプリ内表示名称
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    ゲストアプリのヘッダーやタイトルに表示される会場名です。
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 mt-1">
                      <Icons.Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.displayVenueName}
                        onChange={(e) =>
                          updateSetting("displayVenueName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        placeholder="例: Casamigos Wedding"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex items-center justify-end gap-4">
              {hasChanges && (
                <span className="text-sm text-gray-500">
                  未保存の変更があります
                </span>
              )}
              <button
                type="submit"
                disabled={!hasChanges || !isValid || isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 disabled:hover:shadow-sm"
              >
                {isSaving ? (
                  "保存中..."
                ) : (
                  <>
                    <Icons.Check />
                    変更を保存
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
