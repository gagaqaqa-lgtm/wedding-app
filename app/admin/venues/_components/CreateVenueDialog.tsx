'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, Hash, User, Mail, Sparkles, Zap, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Venue, VenuePlan, VenueStatus } from '@/lib/types/schema';

// フォームスキーマ
const createVenueSchema = z.object({
  // 会場情報
  name: z.string().min(1, '会場名は必須です').max(100, '会場名は100文字以内で入力してください'),
  code: z
    .string()
    .min(1, '会場コードは必須です')
    .max(50, '会場コードは50文字以内で入力してください')
    .regex(/^[a-z0-9-]+$/, '会場コードは小文字の英数字とハイフンのみ使用できます'),
  plan: z.enum(['LIGHT', 'STANDARD', 'PREMIUM'], {
    required_error: 'プランを選択してください',
  }),
  // 初期管理者アカウント情報
  adminName: z.string().min(1, '管理者名は必須です').max(50, '管理者名は50文字以内で入力してください'),
  adminEmail: z.string().email('有効なメールアドレスを入力してください'),
});

type CreateVenueFormValues = z.infer<typeof createVenueSchema>;

interface CreateVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (venueData: {
    name: string;
    code: string;
    plan: VenuePlan;
    status: VenueStatus;
    adminName: string;
    adminEmail: string;
  }) => void;
}

export function CreateVenueDialog({ open, onOpenChange, onSuccess }: CreateVenueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateVenueFormValues>({
    resolver: zodResolver(createVenueSchema),
    defaultValues: {
      name: '',
      code: '',
      plan: 'STANDARD',
      adminName: '',
      adminEmail: '',
    },
  });

  const onSubmit = async (values: CreateVenueFormValues) => {
    setIsSubmitting(true);
    try {
      // 親コンポーネントに通知（Service層で会場を作成）
      onSuccess({
        name: values.name,
        code: values.code,
        plan: values.plan,
        status: 'ACTIVE', // 新規作成時はアクティブ
        admin: {
          name: values.adminName,
          email: values.adminEmail,
        },
      });

      // フォームをリセット
      form.reset();

      // トースト通知
      toast.success('会場を登録しました', {
        description: `${values.name} のアカウントを発行しました。初期パスワードは${values.adminEmail}に送信されました。`,
      });

      // モーダルを閉じる
      onOpenChange(false);
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: '会場の登録に失敗しました。もう一度お試しください。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const planOptions = [
    {
      value: 'LIGHT',
      label: 'ライト',
      description: '基本機能のみ',
      icon: Sparkles,
    },
    {
      value: 'STANDARD',
      label: 'スタンダード',
      description: '標準的な機能',
      icon: Zap,
    },
    {
      value: 'PREMIUM',
      label: 'プレミアム',
      description: '全機能利用可能',
      icon: Crown,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] font-sans antialiased">
        <DialogHeader>
          <DialogTitle className="font-sans antialiased text-2xl">新規会場の登録</DialogTitle>
          <DialogDescription className="font-sans antialiased">
            新しい結婚式場のアカウントを発行します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-sans antialiased">
            {/* セクションA: 会場情報 */}
            <div className="space-y-4 rounded-lg bg-slate-50 p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-gray-900">🏢 会場情報</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans antialiased">会場名</FormLabel>
                      <FormControl>
                        <Input
                          icon={<Building2 className="w-4 h-4" />}
                          placeholder="例: グランドホテル東京"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans antialiased">会場コード</FormLabel>
                      <FormControl>
                        <Input
                          icon={<Hash className="w-4 h-4" />}
                          placeholder="例: hotel-kumamoto"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* プラン選択（カード形式） */}
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans antialiased mb-3 block">契約プラン</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-3 gap-3"
                      >
                        {planOptions.map((plan) => {
                          const Icon = plan.icon;
                          const isSelected = field.value === plan.value;
                          return (
                            <label
                              key={plan.value}
                              htmlFor={`plan-${plan.value}`}
                              className={`
                                relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-2 ring-indigo-200'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <RadioGroupItem
                                id={`plan-${plan.value}`}
                                value={plan.value}
                                className="sr-only"
                              />
                              <Icon
                                className={`w-6 h-6 mb-2 transition-colors ${
                                  isSelected ? 'text-indigo-600' : 'text-gray-400'
                                }`}
                              />
                              <span
                                className={`text-sm font-semibold mb-1 transition-colors ${
                                  isSelected ? 'text-indigo-900' : 'text-gray-900'
                                }`}
                              >
                                {plan.label}
                              </span>
                              <span
                                className={`text-xs transition-colors ${
                                  isSelected ? 'text-indigo-700' : 'text-gray-500'
                                }`}
                              >
                                {plan.description}
                              </span>
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-in fade-in zoom-in duration-200"></div>
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="font-sans antialiased mt-2">
                      契約プランを選択してください。後から変更可能です。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* セクションB: 初期管理者アカウント */}
            <div className="space-y-4 rounded-lg bg-white p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-gray-900">👤 初期管理者</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans antialiased">管理者名</FormLabel>
                      <FormControl>
                        <Input icon={<User className="w-4 h-4" />} placeholder="例: 山田 太郎" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans antialiased">メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          icon={<Mail className="w-4 h-4" />}
                          type="email"
                          placeholder="例: admin@venue.jp"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-md bg-indigo-50 border border-indigo-200 p-4 mt-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900 font-sans antialiased mb-1">
                      初期パスワードについて
                    </p>
                    <p className="text-sm text-indigo-800 font-sans antialiased">
                      初期パスワードは自動生成され、上記のメールアドレスに送信されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="font-sans antialiased">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="font-sans antialiased"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                disabled={isSubmitting}
              >
                {isSubmitting ? '登録中...' : '登録する'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
