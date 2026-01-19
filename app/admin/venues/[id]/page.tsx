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
  ShieldCheck,
  Copy,
  KeyRound,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
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
import { ProxyLoginDialog } from '../_components/ProxyLoginDialog';
import type { VenuePlan, VenueStatus } from '../page';
import type { Venue } from '@/lib/types/schema';
import { getVenueById, updateVenueSettings } from '@/lib/services/mock/venueService';

// 会場詳細データの拡張型
interface VenueDetail extends Venue {
  monthlyWeddings?: number; // 今月の挙式数
  monthlyGuests?: number; // 今月のゲスト数
  storageUsed?: number; // GB（現在の使用量）
  monthlyAdRevenue?: number; // 今月の広告収益（円）
}

// アクティビティログ型
interface ActivityLog {
  id: string;
  type: 'login' | 'wedding_created' | 'photo_uploaded' | 'guest_registered';
  description: string;
  timestamp: Date;
}

// デフォルトの統計データ（会場が見つからない場合や新規作成された場合）
const getDefaultStats = (): { monthlyWeddings: number; monthlyGuests: number; storageUsed: number; monthlyAdRevenue: number } => ({
  monthlyWeddings: 0,
  monthlyGuests: 0,
  storageUsed: 0,
  monthlyAdRevenue: 0,
});

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
  const [isProxyLoginDialogOpen, setIsProxyLoginDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  // 会場情報の読み込み
  useEffect(() => {
    const loadVenue = async () => {
      try {
        const venueData = await getVenueById(id);
        if (venueData) {
          // 統計データを追加（既存の会場にはデフォルト値を設定）
          const venueWithStats: VenueDetail = {
            ...venueData,
            ...getDefaultStats(),
          };
          setVenue(venueWithStats);
        } else {
          setVenue(null);
        }
      } catch (error) {
        console.error('Failed to load venue:', error);
        setVenue(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadVenue();
  }, [id]);

  const activityLogs = getActivityLogs(id);

  // 会場情報の編集用状態
  const [venueName, setVenueName] = useState(venue?.name || '');
  const [venueEmail, setVenueEmail] = useState(venue?.admin.email || '');
  const [venuePlan, setVenuePlan] = useState<VenuePlan>(venue?.plan || 'PREMIUM');
  const [enableLineUnlock, setEnableLineUnlock] = useState(venue?.enableLineUnlock || false);

  // 会場データが読み込まれたら編集用状態を更新
  useEffect(() => {
    if (venue) {
      setVenueName(venue.name);
      setVenueEmail(venue.admin.email);
      setVenuePlan(venue.plan);
      setEnableLineUnlock(venue.enableLineUnlock || false);
    }
  }, [venue]);

  // アカウントデータの初期化
  useEffect(() => {
    if (id) {
      setAccounts(getAccountsByVenueId(id));
    }
  }, [id]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen font-sans antialiased">
        <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 font-sans antialiased">読み込み中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 会場が見つからない場合
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

  // 代理ログインの確認モーダルを開く
  const handleLoginAsVenue = () => {
    setIsProxyLoginDialogOpen(true);
  };

  // 代理ログイン成功時の処理（共通コンポーネントからのコールバック）
  const handleProxyLoginSuccess = (venueId: string) => {
    if (!venue) return;

    toast.success(`${venue.name}としてログインしました`, {
      description: 'サポートモードでダッシュボードを別タブで開きます。',
      duration: 3000,
    });

    // サポートモードでダッシュボード画面を別タブで開く
    window.open(`/dashboard/${venueId}?mode=support`, '_blank', 'noopener,noreferrer');
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

  // サポートアカウント作成ハンドラー
  const handleCreateSupportAccount = () => {
    if (!venue) return;

    const supportEmail = `support+${venue.id}@paplea.com`;
    
    // 既存のサポートアカウントが存在するか確認
    const existingSupportAccount = accounts.find((acc) => acc.email === supportEmail);
    
    if (existingSupportAccount) {
      toast.error('サポートアカウントは既に存在します', {
        description: 'この会場には既にサポートアカウントが発行されています。',
      });
      return;
    }

    // 新しいサポートアカウントを作成
    const newSupportAccount: Account = {
      id: `acc_support_${Date.now()}`,
      name: "Paple'a Support",
      email: supportEmail,
      role: 'VENUE_ADMIN',
      joinedAt: new Date(),
    };

    const password = `${venue.id}123`;

    setAccounts((prev) => [...prev, newSupportAccount]);
    
    // 発行完了ダイアログを開く
    setCreatedCredentials({
      email: supportEmail,
      password: password,
    });
  };

  // コピー機能
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`, {
        description: 'クリップボードにコピーされました。',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('コピーに失敗しました', {
        description: 'もう一度お試しください。',
      });
    }
  };

  // パスワードリセットハンドラー
  const handleResetPassword = (accountId: string) => {
    if (confirm('パスワードを初期値にリセットしますか？')) {
      toast.success('パスワードをリセットしました');
    }
  };

  // サポートアカウントが既に存在するか確認
  const hasSupportAccount = accounts.some((acc) => acc.email.includes('@paplea.com'));

  // アカウント削除ハンドラー
  const handleDeleteAccount = (accountId: string) => {
    if (confirm('このアカウントを削除しますか？')) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success('アカウントを削除しました', {
        description: 'アカウントが正常に削除されました。',
      });
    }
  };

  // 会場設定更新ハンドラー
  const handleUpdateVenueSettings = async (updates: Partial<Venue>) => {
    if (!venue) return;
    
    try {
      const updatedVenue = await updateVenueSettings(venue.id, updates);
      setVenue((prev) => prev ? { ...prev, ...updatedVenue } : null);
      toast.success('設定を更新しました', {
        description: '会場の設定が正常に更新されました。',
      });
    } catch (error) {
      console.error('Failed to update venue settings:', error);
      toast.error('更新に失敗しました', {
        description: 'もう一度お試しください。',
      });
    }
  };

  // プラン変更ハンドラー
  const handlePlanChange = (newPlan: VenuePlan) => {
    setVenuePlan(newPlan);
    // プランに応じてLINE連携機能を自動設定
    const updates: Partial<Venue> = { plan: newPlan };
    if (newPlan === 'LIGHT') {
      // LIGHTプランは強制OFF
      updates.enableLineUnlock = false;
      setEnableLineUnlock(false);
    } else {
      // STANDARD/PREMIUMプランはデフォルトON（親切設計）
      updates.enableLineUnlock = true;
      setEnableLineUnlock(true);
    }
    handleUpdateVenueSettings(updates);
  };

  // LINE連携機能切り替えハンドラー
  const handleLineUnlockToggle = (checked: boolean) => {
    setEnableLineUnlock(checked);
    handleUpdateVenueSettings({ enableLineUnlock: checked });
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
                      最終ログイン: {format(new Date(venue.lastActiveAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
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
                            {venue.monthlyWeddings ?? 0}
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
                            {(venue.monthlyGuests ?? 0).toLocaleString()}
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
                            {venue.storageUsed ?? 0}
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
                            ¥{(venue.monthlyAdRevenue ?? 0).toLocaleString()}
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
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleCreateSupportAccount}
                          disabled={hasSupportAccount}
                          variant="outline"
                          className="font-sans antialiased"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          サポートアカウント発行
                        </Button>
                        <Button
                          onClick={() => setIsAddAccountDialogOpen(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          アカウント追加
                        </Button>
                      </div>
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
                          accounts.map((account, index) => {
                            const isSupportAccount = account.email.endsWith('@paplea.com');
                            return (
                            <TableRow key={`${account.id}-${index}`} className="hover:bg-indigo-50 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 font-sans antialiased">
                                      {account.name}
                                    </span>
                                    {isSupportAccount && (
                                      <Badge variant="outline" className="ml-2 border-indigo-200 text-indigo-700 bg-indigo-50 font-sans antialiased">
                                        SUPPORT
                                      </Badge>
                                    )}
                                  </div>
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
                                <div className="relative inline-block text-left">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger 
                                      asChild={false}
                                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors z-20 relative cursor-pointer"
                                      data-dropdown-trigger={`account-${account.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <MoreVertical className="h-4 w-4 text-gray-600" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-gray-200 z-50">
                                        <DropdownMenuItem 
                                          onClick={() => handleResetPassword(account.id)}
                                          className="cursor-pointer hover:bg-gray-100 py-2.5 px-3"
                                        >
                                          <KeyRound className="w-4 h-4 mr-2" />
                                          パスワードリセット
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteAccount(account.id)}
                                          className="text-red-600 cursor-pointer hover:bg-red-50 py-2.5 px-3"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          削除
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                            );
                          })
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

                {/* 契約・機能設定 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans antialiased">契約・機能設定</CardTitle>
                    <CardDescription className="font-sans antialiased">
                      会場の契約プランと機能を管理します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* プラン設定 */}
                    <div className="space-y-3">
                      <Label className="font-sans antialiased text-base font-semibold">契約プラン</Label>
                      <RadioGroup
                        value={venuePlan}
                        onValueChange={(val) => handlePlanChange(val as VenuePlan)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div className="flex items-start space-x-3 border border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value="LIGHT" id="plan-light" className="mt-1" />
                          <Label htmlFor="plan-light" className="cursor-pointer flex-1">
                            <div className="font-semibold text-gray-900 font-sans antialiased">LIGHT</div>
                            <div className="text-xs text-gray-500 font-sans antialiased mt-1">
                              広告あり / 費用安
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 border border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value="STANDARD" id="plan-standard" className="mt-1" />
                          <Label htmlFor="plan-standard" className="cursor-pointer flex-1">
                            <div className="font-semibold text-gray-900 font-sans antialiased">STANDARD</div>
                            <div className="text-xs text-gray-500 font-sans antialiased mt-1">
                              広告なし / LINE連携可
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 border border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value="PREMIUM" id="plan-premium" className="mt-1" />
                          <Label htmlFor="plan-premium" className="cursor-pointer flex-1">
                            <div className="font-semibold text-gray-900 font-sans antialiased">PREMIUM</div>
                            <div className="text-xs text-gray-500 font-sans antialiased mt-1">
                              全機能開放
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* LINE連携設定 */}
                    <div 
                      className={`flex items-center justify-between border border-gray-200 p-4 rounded-lg transition-opacity ${
                        venuePlan === 'LIGHT' ? 'opacity-60' : 'opacity-100'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label className="font-sans antialiased text-base font-semibold">LINE連携による制限解除</Label>
                        <p className="text-sm font-sans antialiased">
                          {venuePlan === 'LIGHT' ? (
                            <span className="text-amber-600 font-medium">
                              ※STANDARDプラン以上で利用可能です
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              ゲストがLINE友達追加することで、写真アップロード枚数制限を解除する機能を有効にします（STANDARD以上推奨）。
                            </span>
                          )}
                        </p>
                      </div>
                      <Switch
                        checked={enableLineUnlock}
                        onCheckedChange={handleLineUnlockToggle}
                        disabled={venuePlan === 'LIGHT'}
                        className="ml-4"
                      />
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

      {/* 代理ログイン確認ダイアログ */}
      {venue && (
        <ProxyLoginDialog
          open={isProxyLoginDialogOpen}
          onOpenChange={setIsProxyLoginDialogOpen}
          venueId={venue.id}
          venueName={venue.name}
          onSuccess={handleProxyLoginSuccess}
        />
      )}

      {/* サポートアカウント発行完了ダイアログ */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="font-sans antialiased">
          <DialogHeader>
            <DialogTitle>サポートアカウントを発行しました</DialogTitle>
            <DialogDescription>
              以下の認証情報をコピーして、安全な場所に保管してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="support-email" className="text-sm font-semibold">
                メールアドレス
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="support-email"
                  value={createdCredentials?.email || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => createdCredentials && handleCopyToClipboard(createdCredentials.email, 'メールアドレス')}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <Label htmlFor="support-password" className="text-sm font-semibold">
                初期パスワード
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="support-password"
                  type="text"
                  value={createdCredentials?.password || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => createdCredentials && handleCopyToClipboard(createdCredentials.password, 'パスワード')}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setCreatedCredentials(null)}
              className="font-sans antialiased"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
