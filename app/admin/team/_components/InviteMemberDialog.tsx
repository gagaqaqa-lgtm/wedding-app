'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, UserPlus } from 'lucide-react';
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
import { Select } from '@/components/ui/select';
import type { TeamMember, TeamMemberRole } from '../page';

// フォームスキーマ
const inviteMemberSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  role: z.enum(['OWNER', 'MEMBER']),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (member: Omit<TeamMember, 'id' | 'joinedAt' | 'status'> & { status: 'INVITED' }) => void;
}

export function InviteMemberDialog({ open, onOpenChange, onSuccess }: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    setIsSubmitting(true);
    try {
      // 新しいメンバーオブジェクトを作成
      const newMember: Omit<TeamMember, 'id' | 'joinedAt'> & { status: 'INVITED' } = {
        name: values.email.split('@')[0], // メールアドレスの@より前を名前として使用（仮）
        email: values.email,
        role: values.role as TeamMemberRole,
        status: 'INVITED',
      };

      // 親コンポーネントに通知
      onSuccess(newMember);

      // フォームをリセット
      form.reset();

      // トースト通知
      toast.success('招待メールを送信しました', {
        description: `${values.email} に招待メールを送信しました。`,
      });

      // モーダルを閉じる
      onOpenChange(false);
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: 'メンバーの招待に失敗しました。もう一度お試しください。',
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
            メンバー招待
          </DialogTitle>
          <DialogDescription className="font-sans antialiased">
            新しいチームメンバーを招待して、管理画面へのアクセス権限を付与します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans antialiased">
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
                      placeholder="例: member@guest-link.jp"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="font-sans antialiased">
                    招待メールを送信するメールアドレスを入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">ロール</FormLabel>
                  <FormControl>
                    <Select {...field} className="font-sans antialiased">
                      <option value="MEMBER">Member（一般権限）</option>
                      <option value="OWNER">Owner（管理者権限）</option>
                    </Select>
                  </FormControl>
                  <FormDescription className="font-sans antialiased">
                    Ownerは全機能にアクセスでき、Memberは閲覧権限のみです。
                  </FormDescription>
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : '招待を送信'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
