'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, User, Mail } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// アカウント型定義
export type AccountRole = 'VENUE_ADMIN' | 'PLANNER';

export interface Account {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  joinedAt: Date;
}

// フォームスキーマ
const addAccountSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  role: z.enum(['VENUE_ADMIN', 'PLANNER']),
});

type AddAccountFormValues = z.infer<typeof addAccountSchema>;

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (account: Omit<Account, 'id' | 'joinedAt'>) => void;
}

export function AddAccountDialog({ open, onOpenChange, onSuccess }: AddAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'PLANNER',
    },
  });

  const onSubmit = async (values: AddAccountFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: API呼び出し
      await new Promise((resolve) => setTimeout(resolve, 500)); // モック遅延

      onSuccess({
        name: values.name,
        email: values.email,
        role: values.role,
      });

      form.reset();
      toast.success('アカウントを追加しました', {
        description: '新しいアカウントが正常に追加されました。',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: 'アカウントの追加に失敗しました。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] font-sans antialiased">
        <DialogHeader>
          <DialogTitle className="font-sans antialiased flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            アカウント追加
          </DialogTitle>
          <DialogDescription className="font-sans antialiased">
            この会場に新しいプランナーまたは管理者を追加します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans antialiased">
            {/* 名前 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">名前</FormLabel>
                  <FormControl>
                    <Input
                      icon={<User className="w-4 h-4" />}
                      placeholder="例: 田中 花子"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* メールアドレス */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      icon={<Mail className="w-4 h-4" />}
                      type="email"
                      placeholder="例: planner@venue.jp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 権限 */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">権限</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as AccountRole)}
                      className="font-sans antialiased"
                    >
                      <option value="PLANNER">Planner（一般）</option>
                      <option value="VENUE_ADMIN">Venue Admin（管理者）</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
              >
                {isSubmitting ? '追加中...' : '追加する'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
