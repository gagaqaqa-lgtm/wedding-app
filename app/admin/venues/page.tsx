'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, MoreVertical, Edit, LogIn, Ban, Building2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CreateVenueDialog } from './_components/CreateVenueDialog';

// Venue型定義
export type VenuePlan = 'LIGHT' | 'STANDARD' | 'PREMIUM';
export type VenueStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';

export interface Venue {
  id: string;
  name: string;
  code: string; // URLに使われる会場コード（例: hotel-kumamoto）
  plan: VenuePlan;
  status: VenueStatus;
  lastActiveAt: Date;
  // 初期管理者アカウント情報
  adminName: string;
  adminEmail: string;
}

// 初期モックデータ（10件）
const INITIAL_VENUES: Venue[] = [
  {
    id: 'v_001',
    name: 'グランドホテル東京',
    code: 'grand-hotel-tokyo',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T10:30:00'),
    adminName: '山田 太郎',
    adminEmail: 'admin@grandhotel-tokyo.jp',
  },
  {
    id: 'v_002',
    name: 'オーシャンビュー横浜',
    code: 'oceanview-yokohama',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-14T15:20:00'),
    adminName: '佐藤 花子',
    adminEmail: 'contact@oceanview-yokohama.jp',
  },
  {
    id: 'v_003',
    name: 'ガーデンウェディング大阪',
    code: 'garden-wedding-osaka',
    plan: 'STANDARD',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-13T09:15:00'),
    adminName: '鈴木 一郎',
    adminEmail: 'info@garden-wedding-osaka.jp',
  },
  {
    id: 'v_004',
    name: 'パレスホテル名古屋',
    code: 'palace-nagoya',
    plan: 'PREMIUM',
    status: 'SUSPENDED',
    lastActiveAt: new Date('2024-01-05T14:00:00'),
    adminName: '田中 美咲',
    adminEmail: 'admin@palace-nagoya.jp',
  },
  {
    id: 'v_005',
    name: 'リゾートウェディング沖縄',
    code: 'resort-okinawa',
    plan: 'PREMIUM',
    status: 'ONBOARDING',
    lastActiveAt: new Date('2024-01-10T11:45:00'),
    adminName: '伊藤 健',
    adminEmail: 'contact@resort-okinawa.jp',
  },
  {
    id: 'v_006',
    name: 'クラシックホール京都',
    code: 'classic-kyoto',
    plan: 'STANDARD',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T16:30:00'),
    adminName: '高橋 由美',
    adminEmail: 'info@classic-kyoto.jp',
  },
  {
    id: 'v_007',
    name: 'モダンウェディング福岡',
    code: 'modern-fukuoka',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-12T13:20:00'),
    adminName: '渡辺 雄一',
    adminEmail: 'admin@modern-fukuoka.jp',
  },
  {
    id: 'v_008',
    name: 'エレガントホール仙台',
    code: 'elegant-sendai',
    plan: 'STANDARD',
    status: 'SUSPENDED',
    lastActiveAt: new Date('2023-12-28T10:00:00'),
    adminName: '中村 麻衣',
    adminEmail: 'contact@elegant-sendai.jp',
  },
  {
    id: 'v_009',
    name: 'ロイヤルパレス札幌',
    code: 'royal-sapporo',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    lastActiveAt: new Date('2024-01-15T08:00:00'),
    adminName: '小林 正',
    adminEmail: 'info@royal-sapporo.jp',
  },
  {
    id: 'v_010',
    name: 'シーサイドウェディング神戸',
    code: 'seaside-kobe',
    plan: 'PREMIUM',
    status: 'ONBOARDING',
    lastActiveAt: new Date('2024-01-08T12:30:00'),
    adminName: '加藤 愛',
    adminEmail: 'admin@seaside-kobe.jp',
  },
];

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

// プランラベル
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

// 日付フォーマット
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}分前`;
    }
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export default function VenuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 検索フィルタリング
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return venues;
    }
    const query = searchQuery.toLowerCase();
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.code.toLowerCase().includes(query) ||
        venue.adminEmail.toLowerCase().includes(query) ||
        venue.adminName.toLowerCase().includes(query)
    );
  }, [searchQuery, venues]);

  // 新規会場追加ハンドラー
  const handleCreateVenue = (newVenue: Venue) => {
    setVenues((prev) => [newVenue, ...prev]);
  };

  // アクション処理
  const handleViewDetails = (venueId: string) => {
    router.push(`/admin/venues/${venueId}`);
  };

  const handleEdit = (venueId: string) => {
    // 詳細ページへ遷移（編集は詳細ページで行う）
    router.push(`/admin/venues/${venueId}`);
  };

  const handleLoginAsVenue = (venueId: string) => {
    console.log('代理ログイン:', venueId);
    // TODO: 代理ログイン処理を実装
    // window.location.href = `/dashboard/${venueId}`;
  };

  const handleSuspend = (venueId: string) => {
    console.log('アカウント停止:', venueId);
    // TODO: 停止確認モーダルを開く
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">会場管理</h2>
                  <p className="text-gray-600">契約中の結婚式場一覧とステータスを管理します。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* アクションボタンはCard内に配置 */}
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>会場一覧</CardTitle>
                  <div className="flex items-center gap-4">
                    {/* 検索バー */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="会場名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {/* 新規会場登録ボタン */}
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新規会場登録
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredVenues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>検索結果が見つかりませんでした</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>会場名</TableHead>
                        <TableHead>会場コード</TableHead>
                        <TableHead>管理者</TableHead>
                        <TableHead>プラン</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>最終ログイン</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVenues.map((venue) => (
                        <TableRow key={venue.id} className="hover:bg-indigo-50 transition-colors">
                          <TableCell className="font-medium">
                            <Link
                              href={`/admin/venues/${venue.id}`}
                              className="text-indigo-600 hover:text-indigo-700 hover:underline font-sans antialiased"
                            >
                              {venue.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-gray-600 font-mono text-sm">{venue.code}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{venue.adminName}</div>
                              <div className="text-gray-500 text-xs">{venue.adminEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getPlanLabel(venue.plan)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(venue.status)}>
                              {getStatusLabel(venue.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(venue.lastActiveAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="relative inline-block">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">メニューを開く</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="font-sans antialiased">
                                  <DropdownMenuItem onClick={() => handleViewDetails(venue.id)} className="font-sans antialiased">
                                    <Eye className="mr-2 h-4 w-4" />
                                    詳細を見る
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(venue.id)} className="font-sans antialiased">
                                    <Edit className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleLoginAsVenue(venue.id)} className="font-sans antialiased">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    代理ログイン
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleSuspend(venue.id)}
                                    className="text-red-600 focus:text-red-600 font-sans antialiased"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    アカウント停止
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 新規会場登録ダイアログ */}
      <CreateVenueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateVenue}
      />
    </div>
  );
}
