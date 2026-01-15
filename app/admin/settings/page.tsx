'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Lock, Settings, Server, AlertTriangle, DollarSign, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// マイアカウント設定スキーマ
const accountSchema = z.object({
  displayName: z.string().min(1, '表示名は必須です').max(50, '表示名は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

// システム通知先スキーマ
const notificationSchema = z.object({
  systemAlertEmail: z.string().email('有効なメールアドレスを入力してください'),
  billingAlertEmail: z.string().email('有効なメールアドレスを入力してください'),
});

// パスワード変更スキーマ
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード確認を入力してください'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type AccountFormValues = z.infer<typeof accountSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export default function SettingsPage() {
  // マイアカウント設定の状態
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      displayName: 'スーパー管理者',
      email: 'admin@guest-link.jp',
    },
  });

  // システム通知先設定の状態
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      systemAlertEmail: 'alerts@guest-link.jp',
      billingAlertEmail: 'billing@guest-link.jp',
    },
  });

  // パスワード変更ダイアログの状態
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // システム運用設定の状態
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    acceptNewVenues: true,
  });

  // 全設定の保存ハンドラー
  const handleSaveAll = async () => {
    try {
      const accountValues = accountForm.getValues();
      const notificationValues = notificationForm.getValues();
      
      // TODO: API呼び出し
      await new Promise((resolve) => setTimeout(resolve, 500)); // モック遅延
      
      toast.success('システム設定を更新しました', {
        description: 'すべての設定が正常に保存されました。',
      });
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: '設定の保存に失敗しました。',
      });
    }
  };

  // パスワード変更ハンドラー
  const onPasswordChangeSubmit = async (values: PasswordChangeFormValues) => {
    try {
      // TODO: API呼び出し
      await new Promise((resolve) => setTimeout(resolve, 500)); // モック遅延
      passwordForm.reset();
      setIsPasswordDialogOpen(false);
      toast.success('パスワードを変更しました', {
        description: 'パスワードが正常に更新されました。',
      });
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: 'パスワードの変更に失敗しました。',
      });
    }
  };

  // システム設定の変更ハンドラー
  const handleSystemSettingChange = (key: keyof typeof systemSettings, value: boolean) => {
    setSystemSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Settings className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">システム設定</h2>
                  <p className="text-gray-600">あなたのアカウント情報とシステム運用設定を管理します。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveAll}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8 space-y-6">
            {/* 1. マイアカウント */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  マイアカウント
                </CardTitle>
                <CardDescription className="font-sans antialiased">
                  ログイン中の管理者自身の情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form className="space-y-6">
                    {/* 表示名 */}
                    <FormField
                      control={accountForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans antialiased">表示名</FormLabel>
                          <FormControl>
                            <Input
                              icon={<User className="w-4 h-4" />}
                              placeholder="例: スーパー管理者"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="font-sans antialiased">
                            他のユーザーに表示される名前です
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* メールアドレス */}
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans antialiased">メールアドレス</FormLabel>
                          <FormControl>
                            <Input
                              icon={<Mail className="w-4 h-4" />}
                              type="email"
                              placeholder="例: admin@guest-link.jp"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="font-sans antialiased">
                            ログインと通知に使用されます
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* パスワード変更ボタン */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(true)}
                        className="font-sans antialiased"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        パスワードを変更する
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* 2. システム運用設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-600" />
                  システム運用設定
                </CardTitle>
                <CardDescription className="font-sans antialiased">
                  プラットフォーム全体の緊急制御を行うスイッチです
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* メンテナンスモード */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Server className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="maintenance-mode" className="text-base font-medium text-gray-900 cursor-pointer">
                          メンテナンスモード
                        </Label>
                        <p className="text-sm text-gray-500 mt-1 font-sans antialiased">
                          ONにすると、全ての会場・ゲスト画面がメンテナンス画面に切り替わります。
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => handleSystemSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  {/* 新規契約の受付 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="accept-new-venues" className="text-base font-medium text-gray-900 cursor-pointer">
                          新規契約の受付
                        </Label>
                        <p className="text-sm text-gray-500 mt-1 font-sans antialiased">
                          OFFにすると、新規の会場登録を一時的に停止します。
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="accept-new-venues"
                      checked={systemSettings.acceptNewVenues}
                      onCheckedChange={(checked) => handleSystemSettingChange('acceptNewVenues', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. システム通知先 */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  システム通知先
                </CardTitle>
                <CardDescription className="font-sans antialiased">
                  システムからの重要なお知らせを受け取る宛先です
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form className="space-y-6">
                    {/* アラート通知先メール */}
                    <FormField
                      control={notificationForm.control}
                      name="systemAlertEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans antialiased">アラート通知先メール</FormLabel>
                          <FormControl>
                            <Input
                              icon={<AlertTriangle className="w-4 h-4" />}
                              type="email"
                              placeholder="例: alerts@guest-link.jp"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="font-sans antialiased">
                            サーバーダウンや致命的なエラーが発生した際の通知先。
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 請求関連通知先 */}
                    <FormField
                      control={notificationForm.control}
                      name="billingAlertEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans antialiased">請求関連通知先</FormLabel>
                          <FormControl>
                            <Input
                              icon={<DollarSign className="w-4 h-4" />}
                              type="email"
                              placeholder="例: billing@guest-link.jp"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="font-sans antialiased">
                            会場からの支払いエラー等の通知先。
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* パスワード変更ダイアログ */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px] font-sans antialiased">
          <DialogHeader>
            <DialogTitle className="font-sans antialiased flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              パスワードを変更
            </DialogTitle>
            <DialogDescription className="font-sans antialiased">
              セキュリティのため、定期的なパスワード変更を推奨します。
            </DialogDescription>
          </DialogHeader>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-6 font-sans antialiased">
              {/* 現在のパスワード */}
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans antialiased">現在のパスワード</FormLabel>
                    <FormControl>
                      <Input
                        icon={<Lock className="w-4 h-4" />}
                        type="password"
                        placeholder="現在のパスワードを入力"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 新しいパスワード */}
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans antialiased">新しいパスワード</FormLabel>
                    <FormControl>
                      <Input
                        icon={<Lock className="w-4 h-4" />}
                        type="password"
                        placeholder="8文字以上で入力してください"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="font-sans antialiased">
                      8文字以上、英数字と記号を含むことを推奨します
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* パスワード確認 */}
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans antialiased">パスワード確認</FormLabel>
                    <FormControl>
                      <Input
                        icon={<Lock className="w-4 h-4" />}
                        type="password"
                        placeholder="新しいパスワードを再入力"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="font-sans antialiased">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                  className="font-sans antialiased"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                >
                  パスワードを変更
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
