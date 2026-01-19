'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, AlertTriangle, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProxyLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
  venueName: string;
  onSuccess: (venueId: string) => void;
}

/**
 * 代理ログイン確認ダイアログ
 * パスワード認証を行い、認証成功時にコールバックを実行
 */
export function ProxyLoginDialog({
  open,
  onOpenChange,
  venueId,
  venueName,
  onSuccess,
}: ProxyLoginDialogProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // モーダルが開かれたときに状態をリセット
  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
    }
  }, [open]);

  // パスワード変更時の処理
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError('');
  };

  // ログイン実行
  const handleExecuteLogin = () => {
    // サポート用パスワードの検証（モック環境: "support123"）
    const SUPPORT_PASSWORD = 'support123';

    if (!password.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    if (password !== SUPPORT_PASSWORD) {
      setError('パスワードが正しくありません');
      return;
    }

    // 認証成功: モーダルを閉じてダッシュボードへ遷移
    onOpenChange(false);
    setPassword('');
    setError('');

    // トースト通知
    toast.success(`${venueName}としてログインしました`, {
      description: 'サポートモードでダッシュボードを別タブで開きます。',
      duration: 3000,
    });

    // サポートモードでダッシュボード画面を別タブで開く
    window.open(`/dashboard/${venueId}?mode=support`, '_blank', 'noopener,noreferrer');

    // コールバックを実行（親コンポーネントでの追加処理が必要な場合）
    onSuccess(venueId);
  };

  // キャンセル処理
  const handleCancel = () => {
    onOpenChange(false);
    setPassword('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] font-sans antialiased">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LogIn className="w-5 h-5 text-indigo-600" />
            代理ログインの確認
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            以下の会場への代理ログインを行います。操作対象に間違いがないか確認してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 警告メッセージ */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">⚠️ 重要な確認事項</p>
                <p className="text-sm text-red-800 leading-relaxed">
                  現在、<span className="font-bold text-red-900">{venueName || '不明な会場'}</span> への代理ログインを試みています。
                </p>
                <p className="text-sm text-red-700 mt-2">
                  操作対象に間違いがないか、必ず確認してください。ログイン後は、すべての操作が即座に反映されます。
                </p>
              </div>
            </div>
          </div>

          {/* パスワード入力 */}
          <div className="space-y-2">
            <Label htmlFor="support-password" className="text-sm font-semibold text-gray-900">
              サポート用パスワード
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="support-password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    handleExecuteLogin();
                  }
                }}
                placeholder="パスワードを入力してください"
                className={`pl-10 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              ※ モック環境では「support123」がサポート用パスワードです
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="font-sans antialiased"
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleExecuteLogin}
            disabled={!password.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4 mr-2" />
            ログイン実行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
