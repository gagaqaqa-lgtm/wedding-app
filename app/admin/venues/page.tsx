'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, MoreVertical, Edit, LogIn, Ban, Building2, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllVenues, createVenue } from '@/lib/services/mock/venueService';
import type { Venue, VenuePlan, VenueStatus } from '@/lib/types/schema';
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
import { ProxyLoginDialog } from './_components/ProxyLoginDialog';

// Venue型定義（schema.tsからインポート）

// ステータスバッジの色分け
const getStatusBadgeVariant = (status: VenueStatus): 'indigo' | 'destructive' | 'warning' => {
  switch (status) {
    case 'ACTIVE':
      return 'indigo';
    case 'SUSPENDED':
      return 'destructive';
    default:
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
    default:
      return 'その他';
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProxyLoginDialogOpen, setIsProxyLoginDialogOpen] = useState(false);
  const [selectedVenueForLogin, setSelectedVenueForLogin] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // データの読み込み
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getAllVenues();
        setVenues(data);
      } catch (error) {
        console.error('Failed to load venues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVenues();
  }, []);

  // 検索フィルタリング
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return venues;
    }
    const query = searchQuery.toLowerCase();
    return venues.filter(
      (venue) =>
        (venue.name?.toLowerCase() ?? '').includes(query) ||
        (venue.code?.toLowerCase() ?? '').includes(query) ||
        (venue.admin?.email?.toLowerCase() ?? '').includes(query) ||
        (venue.admin?.name?.toLowerCase() ?? '').includes(query)
    );
  }, [searchQuery, venues]);

  // 新規会場追加ハンドラー
  const handleCreateVenue = async (venueData: {
    name: string;
    code: string;
    plan: VenuePlan;
    status: VenueStatus;
    admin: {
      name: string;
      email: string;
    };
  }) => {
    try {
      const result = await createVenue({
        ...venueData,
        coverImageUrl: undefined,
        enableLineUnlock: false,
      });

      // キー重複回避のため、フロントエンド側で一時的にユニークIDを付与する
      const newVenue = {
        ...result,
        id: `venue-${Date.now()}`,
      };

      setVenues((prev) => [newVenue, ...prev]);
    } catch (error) {
      console.error('Failed to create venue:', error);
    }
  };

  // アクション処理
  const handleViewDetails = (venueId: string) => {
    router.push(`/admin/venues/${venueId}`);
  };

  const handleLoginAsVenue = (venueId: string) => {
    // 選択された会場情報を保存してモーダルを開く
    const venue = venues.find((v) => v.id === venueId);
    if (venue) {
      setSelectedVenueForLogin({ id: venue.id, name: venue.name });
      setIsProxyLoginDialogOpen(true);
    }
  };

  // 代理ログイン成功時の処理（共通コンポーネントからのコールバック）
  // 注: 実際の遷移処理は ProxyLoginDialog コンポーネント内で行われるため、
  // このコールバックは将来的な追加処理が必要な場合に備えて残しています
  const handleProxyLoginSuccess = (venueId: string) => {
    // 必要に応じて追加の処理をここに記述
  };

  const handleSuspend = (venueId: string) => {
    // TODO: API経由でアカウントを停止
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
                          <TableCell className="font-medium text-gray-900 font-sans antialiased">
                            {venue.name}
                          </TableCell>
                          <TableCell className="text-gray-600 font-mono text-sm whitespace-nowrap">{venue.code}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 whitespace-nowrap">{venue.admin.name}</div>
                              <div className="text-gray-500 text-xs whitespace-nowrap">{venue.admin.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary">{getPlanLabel(venue.plan)}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(venue.status)}>
                              {getStatusLabel(venue.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 whitespace-nowrap">
                            {formatDate(new Date(venue.lastActiveAt))}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(venue.id)}
                                className="font-sans antialiased"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                詳細・設定
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoginAsVenue(venue.id)}
                                className="gap-2 text-stone-600 hover:text-stone-900 border-stone-300 hover:bg-stone-50 font-sans antialiased"
                              >
                                <LogIn className="w-4 h-4" />
                                代理ログイン
                              </Button>
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

      {/* 代理ログイン確認ダイアログ */}
      {selectedVenueForLogin && (
        <ProxyLoginDialog
          open={isProxyLoginDialogOpen}
          onOpenChange={(open) => {
            setIsProxyLoginDialogOpen(open);
            if (!open) {
              setSelectedVenueForLogin(null);
            }
          }}
          venueId={selectedVenueForLogin.id}
          venueName={selectedVenueForLogin.name}
          onSuccess={handleProxyLoginSuccess}
        />
      )}
    </div>
  );
}
