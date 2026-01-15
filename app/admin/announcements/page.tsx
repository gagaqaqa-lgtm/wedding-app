'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Megaphone, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateAnnouncementDialog } from './_components/CreateAnnouncementDialog';
import { toast } from 'sonner';

// Announcement型定義
export type AnnouncementPriority = 'NORMAL' | 'HIGH';
export type AnnouncementStatus = 'SENT' | 'DRAFT';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  sentAt: Date;
}

// 初期モックデータ（5件）
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_001',
    title: 'システムメンテナンスのお知らせ',
    body: '2024年1月20日（土）2:00〜4:00の間、システムメンテナンスを実施いたします。この間、サービスがご利用いただけません。',
    priority: 'HIGH',
    status: 'SENT',
    sentAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'ann_002',
    title: '新機能「ゲストアンケート」の追加',
    body: 'ゲストからのフィードバックを効率的に収集できる「ゲストアンケート」機能を追加しました。詳細はダッシュボードのヘルプをご確認ください。',
    priority: 'NORMAL',
    status: 'SENT',
    sentAt: new Date('2024-01-10T14:30:00'),
  },
  {
    id: 'ann_003',
    title: '料金プランの更新について',
    body: '2024年4月より、料金プランが更新されます。既存の会場様には移行期間を設けますので、詳細は別途ご連絡いたします。',
    priority: 'NORMAL',
    status: 'SENT',
    sentAt: new Date('2024-01-05T09:15:00'),
  },
  {
    id: 'ann_004',
    title: '年末年始の営業時間について',
    body: '2023年12月29日〜2024年1月3日は、サポート対応が休業となります。緊急のお問い合わせは、メールにて対応いたします。',
    priority: 'NORMAL',
    status: 'SENT',
    sentAt: new Date('2023-12-20T16:00:00'),
  },
  {
    id: 'ann_005',
    title: 'API連携機能のベータ版リリース',
    body: '外部システムとの連携を可能にするAPI連携機能のベータ版をリリースしました。ご希望の会場様には順次ご案内いたします。',
    priority: 'NORMAL',
    status: 'DRAFT',
    sentAt: new Date('2024-01-12T11:20:00'),
  },
];

// 重要度のラベル取得
const getPriorityLabel = (priority: AnnouncementPriority): string => {
  return priority === 'HIGH' ? '重要' : '通常';
};

// ステータスのラベル取得
const getStatusLabel = (status: AnnouncementStatus): string => {
  return status === 'SENT' ? '配信済み' : '下書き';
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 新規お知らせ作成ハンドラー
  const handleCreateAnnouncement = (
    newAnnouncement: Omit<Announcement, 'id' | 'sentAt' | 'status'> & { status: 'SENT' }
  ) => {
    const announcement: Announcement = {
      ...newAnnouncement,
      id: `ann_${String(Date.now()).slice(-6)}`,
      sentAt: new Date(),
    };
    setAnnouncements((prev) => [announcement, ...prev]);
  };

  // お知らせ削除ハンドラー
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    toast.success('お知らせを削除しました', {
      description: 'お知らせが正常に削除されました。',
    });
  };

  // お知らせ編集ハンドラー（モック）
  const handleEditAnnouncement = (id: string) => {
    toast.info('編集機能は今後実装予定です', {
      description: 'お知らせの編集機能は開発中です。',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Megaphone className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">お知らせ配信</h2>
                  <p className="text-gray-600">
                    全会場のダッシュボードへのお知らせを作成・配信します。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  お知らせを作成
                </Button>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased">配信履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans antialiased">タイトル</TableHead>
                      <TableHead className="font-sans antialiased">配信日</TableHead>
                      <TableHead className="font-sans antialiased">重要度</TableHead>
                      <TableHead className="font-sans antialiased">ステータス</TableHead>
                      <TableHead className="font-sans antialiased w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8 font-sans antialiased">
                          お知らせがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      announcements.map((announcement) => (
                        <TableRow key={announcement.id}>
                          <TableCell className="font-sans antialiased font-medium">
                            {announcement.title}
                          </TableCell>
                          <TableCell className="font-sans antialiased">
                            {format(announcement.sentAt, 'yyyy/MM/dd', { locale: ja })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={announcement.priority === 'HIGH' ? 'destructive' : 'default'}
                              className={
                                announcement.priority === 'HIGH'
                                  ? 'bg-red-100 text-red-700 border-red-300 font-sans antialiased'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 font-sans antialiased'
                              }
                            >
                              {getPriorityLabel(announcement.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={announcement.status === 'SENT' ? 'indigo' : 'default'}
                              className={
                                announcement.status === 'SENT'
                                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300 font-sans antialiased'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 font-sans antialiased'
                              }
                            >
                              {getStatusLabel(announcement.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="relative inline-block">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 font-sans antialiased"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="font-sans antialiased">
                                  <DropdownMenuItem
                                    onClick={() => handleEditAnnouncement(announcement.id)}
                                    className="font-sans antialiased"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    className="text-red-600 font-sans antialiased"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    削除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* お知らせ作成ダイアログ */}
      <CreateAnnouncementDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateAnnouncement}
      />
    </div>
  );
}
