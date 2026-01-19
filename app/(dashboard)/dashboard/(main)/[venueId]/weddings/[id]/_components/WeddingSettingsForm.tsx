"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Edit, X } from "lucide-react";

/**
 * 挙式設定フォームの初期値型定義
 */
export interface WeddingSettings {
  /** ゲスト投稿の無制限モード（true: 無制限、false: 制限あり）デフォルト: true */
  unlimitedGuestUpload: boolean;
  
  /** ウェルカムメッセージ（全員向け） */
  welcomeMessage: string;
}

interface WeddingSettingsFormProps {
  /** 初期設定値 */
  initialSettings: WeddingSettings;
  
  /** プラン情報（LIGHTプランでは一部機能が制限される） */
  plan?: 'LIGHT' | 'STANDARD' | 'PREMIUM';
  
  /** 挙式ID（API呼び出しに必要） */
  weddingId: string;
}

/**
 * 挙式設定フォームコンポーネント
 * 
 * インタラクティブな設定UIを提供し、バックエンドAPIにデータを保存します。
 */
export function WeddingSettingsForm({ initialSettings, plan = 'STANDARD', weddingId }: WeddingSettingsFormProps) {
  // LIGHTプランの場合、unlimitedGuestUploadを強制的にfalseとして初期化
  const normalizedInitialSettings: WeddingSettings = {
    ...initialSettings,
    unlimitedGuestUpload: plan === 'LIGHT' ? false : initialSettings.unlimitedGuestUpload,
  };
  
  // 内部状態の管理
  const [settings, setSettings] = useState<WeddingSettings>(normalizedInitialSettings);
  const [isMessageEditing, setIsMessageEditing] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [originalMessage, setOriginalMessage] = useState(initialSettings.welcomeMessage);
  const [isSaving, setIsSaving] = useState(false);
  
  const isLightPlan = plan === 'LIGHT';

  // 設定変更時のハンドラ（即座に保存）
  const handleUnlimitedGuestUploadChange = async (checked: boolean) => {
    // LIGHTプランの場合、強制的にfalseとして扱う（無制限モードは利用不可）
    const actualValue = isLightPlan ? false : checked;
    
    setSettings(prev => ({ ...prev, unlimitedGuestUpload: actualValue }));
    
    try {
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: actualValue, // LIGHTプランでは常にfalseを送信
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: 'ゲスト投稿の無制限モードを更新しました。',
      });
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
      // エラー時は元の値に戻す
      setSettings(prev => ({ ...prev, unlimitedGuestUpload: isLightPlan ? false : !checked }));
    }
  };

  const handleWelcomeMessageChange = (value: string) => {
    setSettings(prev => ({ ...prev, welcomeMessage: value }));
  };

  // 編集モード開始の確認
  const handleEditClick = () => {
    setShowEditConfirmDialog(true);
  };

  // 編集モード開始の確定
  const handleConfirmEdit = () => {
    setOriginalMessage(settings.welcomeMessage);
    setIsMessageEditing(true);
    setShowEditConfirmDialog(false);
  };

  // 編集のキャンセル
  const handleCancelEdit = () => {
    setSettings(prev => ({ ...prev, welcomeMessage: originalMessage }));
    setIsMessageEditing(false);
  };

  // 保存処理（API呼び出し）
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // LIGHTプランの場合、unlimitedGuestUploadを強制的にfalseとして送信
      const unlimitedGuestUploadValue = isLightPlan ? false : settings.unlimitedGuestUpload;
      
      const response = await fetch(`/api/weddings/${weddingId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlimitedGuestUpload: unlimitedGuestUploadValue,
          welcomeMessage: settings.welcomeMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      toast.success('設定を保存しました', {
        description: '挙式設定が正常に更新されました。',
      });

      setIsMessageEditing(false);
      setOriginalMessage(settings.welcomeMessage);
    } catch (error) {
      console.error('Failed to save wedding settings:', error);
      toast.error('保存に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">基本設定</h2>
      
      <div className="space-y-6">
        {/* ゲスト投稿の無制限モード */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="unlimited-guest-upload" className="text-sm font-semibold text-gray-900">
                ゲスト投稿の無制限モード
              </Label>
              {isLightPlan && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isLightPlan 
                ? "Standardプラン以上で利用可能です（LINE連携）。"
                : "ゲストが写真を無制限にアップロードできるようにします。新郎新婦様のアップロードは常に無制限です。"
              }
            </p>
          </div>
          <div className="ml-4">
            <Switch
              id="unlimited-guest-upload"
              checked={isLightPlan ? false : settings.unlimitedGuestUpload}
              onCheckedChange={handleUnlimitedGuestUploadChange}
              disabled={isLightPlan}
            />
          </div>
        </div>

        {/* ウェルカムメッセージ */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="welcome-message" className="text-sm font-semibold text-gray-900">
              ウェルカムメッセージ
            </Label>
            {!isMessageEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="h-8 text-xs"
              >
                <Edit className="w-3 h-3 mr-1.5" />
                編集
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1.5" />
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            )}
          </div>
          <Textarea
            id="welcome-message"
            value={settings.welcomeMessage}
            onChange={(e) => handleWelcomeMessageChange(e.target.value)}
            disabled={!isMessageEditing}
            placeholder="ゲスト向けのウェルカムメッセージを入力してください..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2">
            このメッセージはゲスト向けギャラリーページの上部に表示されます。
          </p>
        </div>

        {/* 編集確認ダイアログ */}
        <Dialog open={showEditConfirmDialog} onOpenChange={setShowEditConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>メッセージを編集しますか？</DialogTitle>
              <DialogDescription className="pt-2">
                ウェルカムメッセージは本来、新郎新婦が作成するコンテンツです。プランナーが編集すると、新郎新婦が入力した内容が上書き・消失する可能性があります。本当に編集モードに切り替えますか？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditConfirmDialog(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConfirmEdit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                編集する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 設定プレビュー（開発用） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-mono text-gray-600 mb-2">設定プレビュー（開発用）:</p>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
