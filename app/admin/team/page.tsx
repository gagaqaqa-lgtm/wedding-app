'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, MoreVertical, UserPlus, Trash2, Shield, Mail, Users } from 'lucide-react';
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
import { InviteMemberDialog } from './_components/InviteMemberDialog';

// チームメンバー型定義
export type TeamMemberRole = 'OWNER' | 'MEMBER';
export type TeamMemberStatus = 'ACTIVE' | 'INVITED';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: Date;
  avatar?: string;
}

// 初期モックデータ（現在のユーザーを含む）
const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'tm_001',
    name: 'あなた',
    email: 'admin@guest-link.jp',
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date('2023-06-01T10:00:00'),
  },
  {
    id: 'tm_002',
    name: '山田 太郎',
    email: 'yamada@guest-link.jp',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: new Date('2023-08-15T14:30:00'),
  },
  {
    id: 'tm_003',
    name: '佐藤 花子',
    email: 'sato@guest-link.jp',
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: new Date('2023-09-20T09:15:00'),
  },
  {
    id: 'tm_004',
    name: '鈴木 一郎',
    email: 'suzuki@guest-link.jp',
    role: 'MEMBER',
    status: 'INVITED',
    joinedAt: new Date('2024-01-10T16:45:00'),
  },
];

// ロールバッジの色分け
const getRoleBadgeVariant = (role: TeamMemberRole): 'indigo' | 'secondary' => {
  return role === 'OWNER' ? 'indigo' : 'secondary';
};

// ロールラベル
const getRoleLabel = (role: TeamMemberRole): string => {
  return role === 'OWNER' ? 'Owner' : 'Member';
};

// ステータスバッジの色分け
const getStatusBadgeVariant = (status: TeamMemberStatus): 'indigo' | 'warning' => {
  return status === 'ACTIVE' ? 'indigo' : 'warning';
};

// ステータスラベル
const getStatusLabel = (status: TeamMemberStatus): string => {
  return status === 'ACTIVE' ? 'Active' : 'Invited';
};

// 日付フォーマット
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // 検索フィルタリング
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
  }, [searchQuery, members]);

  // メンバー招待ハンドラー
  const handleInviteMember = (newMember: Omit<TeamMember, 'id' | 'joinedAt' | 'status'> & { status: 'INVITED' }) => {
    const invitedMember: TeamMember = {
      ...newMember,
      id: `tm_${String(Date.now()).slice(-6)}`,
      joinedAt: new Date(),
    };
    setMembers((prev) => [...prev, invitedMember]);
  };

  // メンバー削除ハンドラー
  const handleDeleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // ロール変更ハンドラー
  const handleChangeRole = (memberId: string, newRole: TeamMemberRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
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
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">チーム管理</h2>
                  <p className="text-gray-600">管理画面にアクセスできる運営メンバーを管理します。</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 検索バー */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="名前またはメールで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* メンバー招待ボタン */}
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans antialiased"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  メンバー招待
                </Button>
              </div>
            </div>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans antialiased">メンバー一覧</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>検索結果が見つかりませんでした</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ユーザー</TableHead>
                        <TableHead>ロール</TableHead>
                        <TableHead>参加日</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
                                {member.avatar ? (
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <UserPlus className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 font-sans">{member.name}</p>
                                <p className="text-sm text-gray-500 font-sans">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {getRoleLabel(member.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 font-sans">
                            {formatDate(member.joinedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(member.status)}>
                              {getStatusLabel(member.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {member.id !== 'tm_001' && ( // 自分自身は削除できない
                              <div className="relative inline-block">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">メニューを開く</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleChangeRole(
                                          member.id,
                                          member.role === 'OWNER' ? 'MEMBER' : 'OWNER'
                                        )
                                      }
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      権限を{member.role === 'OWNER' ? 'Member' : 'Owner'}に変更
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteMember(member.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      メンバーを削除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
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

      {/* メンバー招待ダイアログ */}
      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={handleInviteMember}
      />
    </div>
  );
}
