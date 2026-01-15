'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import {
  ArrowLeft,
  LogIn,
  MoreVertical,
  Calendar,
  Users,
  HardDrive,
  DollarSign,
  Edit,
  Trash2,
  Ban,
  ChevronRight,
  Plus,
  UserCircle,
  Store,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddAccountDialog, type Account, type AccountRole } from './_components/AddAccountDialog';
import type { Venue, VenuePlan, VenueStatus } from '../page';

// 会場詳細データの拡張型
interface VenueDetail extends Venue {
  monthlyWeddings: number; // 今月の挙式数
  monthlyGuests: number; // 今月のゲスト数
  storageUsed: number; // GB（現在の使用量）
  monthlyAdRevenue: number; // 今月の広告収益（円）
}

// アクティビティログ型
interface ActivityLog {
  id: string;
  type: 'login' | 'wedding_created' | 'photo_uploaded' | 'guest_registered';
  description: string;
  timestamp: Date;
}

// モックデータ（IDに基づいて会場を取得）
const getVenueById = (id: string): VenueDetail | null => {
  const venues: Record<string, VenueDetail> = {
    'v_001': {
      id: 'v_001',
      name: 'グランドホテル東京',
      code: 'grand-hotel-tokyo',
      plan: 'PREMIUM',
      status: 'ACTIVE',
      lastActiveAt: new Date('2024-01-15T10:30:00'),
      adminName: '山田 太郎',
      adminEmail: 'admin@grandhotel-tokyo.jp',
      monthlyWeddings: 6,
      monthlyGuests: 450,
      storageUsed: 45.2,
      monthlyAdRevenue: 32000,
    },
    'v_002': {
      id: 'v_002',
      name: 'オーシャンビュー横浜',
      code: 'oceanview-yokohama',
      plan: 'PREMIUM',
      status: 'ACTIVE',
      lastActiveAt: new Date('2024-01-14T15:20:00'),
      adminName: '佐藤 花子',
      adminEmail: 'contact@oceanview-yokohama.jp',
      monthlyWeddings: 5,
      monthlyGuests: 380,
      storageUsed: 28.5,
      monthlyAdRevenue: 28000,
    },
    'v_003': {
      id: 'v_003',
      name: 'ガーデンウェディング大阪',
      code: 'garden-wedding-osaka',
      plan: 'STANDARD',
      status: 'ACTIVE',
      lastActiveAt: new Date('2024-01-13T09:15:00'),
      adminName: '鈴木 一郎',
      adminEmail: 'info@garden-wedding-osaka.jp',
      monthlyWeddings: 4,
      monthlyGuests: 320,
      storageUsed: 18.3,
      monthlyAdRevenue: 15000,
    },
  };

  return venues[id] || null;
};

// アクティビティログのモックデータ
const getActivityLogs = (venueId: string): ActivityLog[] => {
  return [
    {
      id: 'log_001',
      type: 'login',
      description: '管理者がログインしました',
      timestamp: new Date('2024-01-15T10:30:00'),
    },
    {
      id: 'log_002',
      type: 'wedding_created',
      description: '新しい挙式「山田様・佐藤様」を作成しました',
      timestamp: new Date('2024-01-14T14:20:00'),
    },
    {
      id: 'log_003',
      type: 'photo_uploaded',
      description: '写真を50枚アップロードしました',
      timestamp: new Date('2024-01-13T16:45:00'),
    },
    {
      id: 'log_004',
      type: 'guest_registered',
      description: 'ゲストを15名登録しました',
      timestamp: new Date('2024-01-12T11:10:00'),
    },
    {
      id: 'log_005',
      type: 'login',
      description: '管理者がログインしました',
      timestamp: new Date('2024-01-11T09:00:00'),
    },
  ];
};

// プランラベル取得
const getPlanLabel = (plan: VenuePlan): string => {
  switch (plan) {
    case 'LIGHT':
      return 'ライト';
    case 'STANDARD':
      return 'スタンダード';
    case 'PREMIUM':
      return 'プレミアム';
  }
};

// ステータスバッジの色分け
const getStatusBadgeVariant = (status: VenueStatus): 'indigo' | 'destructive' | 'warning' => {
  switch (status) {
    case 'ACTIVE':
      return 'indigo';
    case 'SUSPENDED':
      return 'destructive';
    case 'ONBOARDING':
      return 'warning';
  }
};

// ステータスラベル
const getStatusLabel = (status: VenueStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return '稼働中';
    case 'SUSPENDED':
      return '停止中';
    case 'ONBOARDING':
      return '導入中';
  }
};

// アクティビティタイプのラベル
const getActivityTypeLabel = (type: ActivityLog['type']): string => {
  switch (type) {
    case 'login':
      return 'ログイン';
    case 'wedding_created':
      return '挙式作成';
    case 'photo_uploaded':
      return '写真アップロード';
    case 'guest_registered':
      return 'ゲスト登録';
  }
};

// アカウントロールのラベル取得
const getRoleLabel = (role: AccountRole): string => {
  return role === 'VENUE_ADMIN' ? 'Venue Admin' : 'Planner';
};

// アカウントロールのバッジ色取得
const getRoleBadgeVariant = (role: AccountRole): 'indigo' | 'default' => {
  return role === 'VENUE_ADMIN' ? 'indigo' : 'default';
};

// 会場に紐づくアカウントのモックデータ
const getAccountsByVenueId = (venueId: string): Account[] => {
  const accountsByVenue: Record<string, Account[]> = {
    'v_001': [
      {
        id: 'acc_001',
        name: '山田 太郎',
        email: 'admin@grandhotel-tokyo.jp',
        role: 'VENUE_ADMIN',
        joinedAt: new Date('2023-01-01'),
      },
      {
        id: 'acc_002',
        name: '佐藤 美咲',
        email: 'planner1@grandhotel-tokyo.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-02-15'),
      },
      {
        id: 'acc_003',
        name: '鈴木 健太',
        email: 'planner2@grandhotel-tokyo.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-05-20'),
      },
      {
        id: 'acc_004',
        name: '高橋 由美',
        email: 'planner3@grandhotel-tokyo.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-08-10'),
      },
    ],
    'v_002': [
      {
        id: 'acc_005',
        name: '佐藤 花子',
        email: 'contact@oceanview-yokohama.jp',
        role: 'VENUE_ADMIN',
        joinedAt: new Date('2023-03-15'),
      },
      {
        id: 'acc_006',
        name: '伊藤 正',
        email: 'planner1@oceanview-yokohama.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-04-01'),
      },
      {
        id: 'acc_007',
        name: '渡辺 麻衣',
        email: 'planner2@oceanview-yokohama.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-06-15'),
      },
    ],
    'v_003': [
      {
        id: 'acc_008',
        name: '鈴木 一郎',
        email: 'info@garden-wedding-osaka.jp',
        role: 'VENUE_ADMIN',
        joinedAt: new Date('2023-06-01'),
      },
      {
        id: 'acc_009',
        name: '中村 愛',
        email: 'planner1@garden-wedding-osaka.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-07-10'),
      },
      {
        id: 'acc_010',
        name: '小林 雄一',
        email: 'planner2@garden-wedding-osaka.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-09-20'),
      },
      {
        id: 'acc_011',
        name: '加藤 美香',
        email: 'planner3@garden-wedding-osaka.jp',
        role: 'PLANNER',
        joinedAt: new Date('2023-11-05'),
      },
      {
        id: 'acc_012',
        name: '吉田 健',
        email: 'planner4@garden-wedding-osaka.jp',
        role: 'PLANNER',
        joinedAt: new Date('2024-01-08'),
      },
    ],
  };

  return accountsByVenue[venueId] || [];
};

interface VenueDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const venue = getVenueById(id);
  const activityLogs = getActivityLogs(id);

  // 会場情報の編集用状態
  const [venueName, setVenueName] = useState(venue?.name || '');
  const [venueEmail, setVenueEmail] = useState(venue?.adminEmail || '');

  // アカウントデータの初期化
  useEffect(() => {
    if (id) {
      setAccounts(getAccountsByVenueId(id));
    }
  }, [id]);

  if (!venue) {
    return (
      <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
        <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 font-sans antialiased">会場が見つかりません</p>
              <Link href="/admin/venues">
                <Button variant="outline" className="mt-4 w-full font-sans antialiased">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  会場一覧に戻る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleLoginAsVenue = () => {
    toast.success('会場管理者としてログインしました', {
      description: `${venue.name} のダッシュボードに遷移します。`,
    });
    // TODO: 実際のログイン処理
  };

  const handleSuspend = () => {
    toast.error('アカウントを停止しました', {
      description: 'この会場のアクセスが無効化されました。',
    });
  };

  const handleDelete = () => {
    if (confirm('本当にこの会場のデータを削除しますか？この操作は取り消せません。')) {
      toast.error('会場データを削除しました', {
        description: 'すべてのデータが完全に削除されました。',
      });
    }
  };

  // アカウント追加ハンドラー
  const handleAddAccount = (newAccount: Omit<Account, 'id' | 'joinedAt'>) => {
    const account: Account = {
      ...newAccount,
      id: `acc_${String(Date.now()).slice(-6)}`,
      joinedAt: new Date(),
    };
    setAccounts((prev) => [...prev, account]);
  };

  // アカウント削除ハンドラー
  const handleDeleteAccount = (accountId: string) => {
    if (confirm('このアカウントを削除しますか？')) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success('アカウントを削除しました', {
        description: 'アカウントが正常に削除されました。',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダーエリア */}
          <div className="px-8 py-5">
            {/* パンくずリスト */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 font-sans antialiased">
              <Link href="/admin/venues" className="hover:text-indigo-600 transition-colors">
                会場一覧
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{venue.name}</span>
            </div>

            {/* タイトルとアクション */}
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">会場詳細</h2>
                  <p className="text-gray-600">会場の詳細情報とアカウントを管理します。</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-gray-900 font-sans antialiased">{venue.name}</span>
                    <Badge
                      variant={getStatusBadgeVariant(venue.status)}
                      className="font-sans antialiased"
                    >
                      {getStatusLabel(venue.status)}
                    </Badge>
                    <span className="text-sm text-gray-500 font-sans antialiased">
                      最終ログイン: {format(venue.lastActiveAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleLoginAsVenue}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  代理ログイン
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 font-sans antialiased">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-sans antialiased">
                    <DropdownMenuItem className="font-sans antialiased">
                      <Edit className="w-4 h-4 mr-2" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSuspend}
                      className="text-red-600 font-sans antialiased"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      アカウント停止
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 font-sans antialiased"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 font-sans antialiased">
                <TabsTrigger value="overview" className="font-sans antialiased">
                  概要
                </TabsTrigger>
                <TabsTrigger value="accounts" className="font-sans antialiased">
                  アカウント管理
                </TabsTrigger>
                <TabsTrigger value="settings" className="font-sans antialiased">
                  設定
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: 概要 */}
              <TabsContent value="overview" className="space-y-6">
                {/* 重要指標 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-sans antialiased mb-1">今月の挙式数</p>
                          <p className="text-2xl font-bold text-gray-900 font-sans antialiased">
                            {venue.monthlyWeddings}
                          </p>
                          <p className="text-xs text-gray-500 font-sans antialiased mt-1">組</p>
                          <p className="text-xs text-gray-400 font-sans antialiased mt-1">
                            Target: {format(new Date(), 'MMM yyyy', { locale: ja })}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-sans antialiased mb-1">今月のゲスト数</p>
                          <p className="text-2xl font-bold text-gray-900 font-sans antialiased">
                            {venue.monthlyGuests.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 font-sans antialiased mt-1">人</p>
                          <p className="text-xs text-gray-400 font-sans antialiased mt-1">
                            Target: {format(new Date(), 'MMM yyyy', { locale: ja })}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-sans antialiased mb-1">ストレージ使用量</p>
                          <p className="text-2xl font-bold text-gray-900 font-sans antialiased">
                            {venue.storageUsed}
                          </p>
                          <p className="text-xs text-gray-500 font-sans antialiased mt-1">GB</p>
                          <p className="text-xs text-gray-400 font-sans antialiased mt-1">
                            現在の使用量
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <HardDrive className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-sans antialiased mb-1">今月の広告収益</p>
                          <p className="text-2xl font-bold text-gray-900 font-sans antialiased">
                            ¥{venue.monthlyAdRevenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 font-sans antialiased mt-1">
                            Target: {format(new Date(), 'MMM yyyy', { locale: ja })}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 最近のアクティビティ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans antialiased">最近のアクティビティ</CardTitle>
                    <CardDescription className="font-sans antialiased">
                      会場の操作ログを表示します
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 font-sans antialiased">
                                {getActivityTypeLabel(log.type)}
                              </span>
                              <Badge variant="default" className="text-xs font-sans antialiased">
                                {format(log.timestamp, 'yyyy/MM/dd HH:mm', { locale: ja })}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 font-sans antialiased">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: アカウント管理 */}
              <TabsContent value="accounts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-sans antialiased">アカウント一覧</CardTitle>
                        <CardDescription className="font-sans antialiased">
                          この会場に所属するプランナーと管理者を管理します
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setIsAddAccountDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        アカウント追加
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-sans antialiased">名前</TableHead>
                          <TableHead className="font-sans antialiased">メールアドレス</TableHead>
                          <TableHead className="font-sans antialiased">権限</TableHead>
                          <TableHead className="font-sans antialiased">作成日</TableHead>
                          <TableHead className="font-sans antialiased text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-8 font-sans antialiased">
                              アカウントがありません
                            </TableCell>
                          </TableRow>
                        ) : (
                          accounts.map((account) => (
                            <TableRow key={account.id} className="hover:bg-indigo-50 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 font-sans antialiased">
                                    {account.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-sans antialiased">{account.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={getRoleBadgeVariant(account.role)}
                                  className="font-sans antialiased"
                                >
                                  {getRoleLabel(account.role)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-sans antialiased">
                                {format(account.joinedAt, 'yyyy/MM/dd', { locale: ja })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAccount(account.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 font-sans antialiased"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: 設定・アカウント */}
              <TabsContent value="settings" className="space-y-6">
                {/* 会場情報編集 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans antialiased">会場情報</CardTitle>
                    <CardDescription className="font-sans antialiased">
                      会場の基本情報を編集できます
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="venue-name" className="font-sans antialiased">
                          会場名
                        </Label>
                        <Input
                          id="venue-name"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          className="mt-2 font-sans antialiased"
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue-email" className="font-sans antialiased">
                          メールアドレス
                        </Label>
                        <Input
                          id="venue-email"
                          type="email"
                          value={venueEmail}
                          onChange={(e) => setVenueEmail(e.target.value)}
                          className="mt-2 font-sans antialiased"
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue-code" className="font-sans antialiased">
                          会場コード
                        </Label>
                        <Input
                          id="venue-code"
                          value={venue.code}
                          disabled
                          className="mt-2 font-mono font-sans antialiased"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-sans antialiased">
                          会場コードは変更できません
                        </p>
                      </div>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased">
                        保存
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* アカウント停止 (Danger Zone) */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600 font-sans antialiased">危険な操作</CardTitle>
                    <CardDescription className="font-sans antialiased">
                      これらの操作は取り消せません。十分注意してください。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900 font-sans antialiased mb-1">
                              アカウントを停止
                            </p>
                            <p className="text-xs text-red-700 font-sans antialiased">
                              この会場のアクセスを一時的に無効化します。データは保持されます。
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleSuspend}
                            className="border-red-300 text-red-600 hover:bg-red-100 font-sans antialiased"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            停止する
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900 font-sans antialiased mb-1">
                              データを削除
                            </p>
                            <p className="text-xs text-red-700 font-sans antialiased">
                              この会場のすべてのデータを完全に削除します。この操作は取り消せません。
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="border-red-300 text-red-600 hover:bg-red-100 font-sans antialiased"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除する
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* アカウント追加ダイアログ */}
      <AddAccountDialog
        open={isAddAccountDialogOpen}
        onOpenChange={setIsAddAccountDialogOpen}
        onSuccess={handleAddAccount}
      />
    </div>
  );
}
