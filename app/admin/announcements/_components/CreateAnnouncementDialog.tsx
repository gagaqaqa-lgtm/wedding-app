'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Megaphone, AlertCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Announcement, AnnouncementPriority } from '../page';

// フォームスキーマ
const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(1000, '本文は1000文字以内で入力してください'),
  priority: z.enum(['NORMAL', 'HIGH'], {
    required_error: '重要度を選択してください',
  }),
});

type CreateAnnouncementFormValues = z.infer<typeof createAnnouncementSchema>;

interface CreateAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (announcement: Omit<Announcement, 'id' | 'sentAt' | 'status'> & { status: 'SENT' }) => void;
}

export function CreateAnnouncementDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAnnouncementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAnnouncementFormValues>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: '',
      body: '',
      priority: 'NORMAL',
    },
  });

  const onSubmit = async (values: CreateAnnouncementFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: API呼び出し
      await new Promise((resolve) => setTimeout(resolve, 500)); // モック遅延

      const newAnnouncement: Omit<Announcement, 'id' | 'sentAt' | 'status'> & { status: 'SENT' } = {
        title: values.title,
        body: values.body,
        priority: values.priority,
        status: 'SENT',
      };

      onSuccess(newAnnouncement);
      form.reset();
      toast.success('全会場へ配信しました', {
        description: 'お知らせが正常に配信されました。',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: 'お知らせの配信に失敗しました。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] font-sans antialiased">
        <DialogHeader>
          <DialogTitle className="font-sans antialiased flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            お知らせを作成
          </DialogTitle>
          <DialogDescription className="font-sans antialiased">
            契約中の全会場のダッシュボードにお知らせを表示します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans antialiased">
            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="例: システムメンテナンスのお知らせ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 本文 */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">本文</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="お知らせの内容を入力してください..."
                      rows={5}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="font-sans antialiased">
                    全会場のダッシュボードに表示される内容です。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 重要度 */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans antialiased">重要度</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="NORMAL" id="priority-normal" className="sr-only" />
                        <label
                          htmlFor="priority-normal"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === 'NORMAL'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-900">通常のお知らせ</span>
                          <span className="text-xs text-gray-500 mt-1">通常の情報共有</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem value="HIGH" id="priority-high" className="sr-only" />
                        <label
                          htmlFor="priority-high"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === 'HIGH'
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <AlertCircle className="w-5 h-5 text-red-600 mb-1" />
                          <span className="text-sm font-medium text-gray-900">重要（メンテナンス等）</span>
                          <span className="text-xs text-gray-500 mt-1">緊急の情報</span>
                        </label>
                      </div>
                    </RadioGroup>
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
                {isSubmitting ? '配信中...' : '配信する'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
