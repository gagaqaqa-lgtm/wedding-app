"use client";

import React, { useState } from "react";

// アカウントの型定義
interface Account {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  role: 'admin' | 'planner';
  createdAt: string;
}

// ダミーデータ
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: '1',
    lastName: '田中',
    firstName: '優子',
    email: 'tanaka@example.com',
    role: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    lastName: '鈴木',
    firstName: '花子',
    email: 'suzuki@example.com',
    role: 'planner',
    createdAt: '2024-03-20T00:00:00Z',
  },
  {
    id: '3',
    lastName: '山田',
    firstName: '太郎',
    email: 'yamada@example.com',
    role: 'planner',
    createdAt: '2024-05-10T00:00:00Z',
  },
];

// アイコン (インラインSVG)
const Icons = {
  UserGroup: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

// アバターコンポーネント（名前の頭文字を表示）
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  );
};

// 権限バッジコンポーネント
const RoleBadge = ({ role }: { role: 'admin' | 'planner' }) => {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
        管理者
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
      プランナー
    </span>
  );
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({
    lastName: '',
    firstName: '',
    email: '',
    role: 'planner' as 'admin' | 'planner',
    password: '',
  });

  // アカウント作成モーダルを開く
  const handleOpenCreateModal = () => {
    setNewAccount({
      lastName: '',
      firstName: '',
      email: '',
      role: 'planner',
      password: '',
    });
    setIsCreateModalOpen(true);
  };

  // アカウント作成モーダルを閉じる
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewAccount({
      lastName: '',
      firstName: '',
      email: '',
      role: 'planner',
      password: '',
    });
  };

  // アカウントを作成
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!newAccount.lastName.trim() || !newAccount.firstName.trim() || !newAccount.email.trim() || !newAccount.password.trim()) {
      alert('すべての項目を入力してください。');
      return;
    }

    setIsCreating(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      const newId = (accounts.length + 1).toString();
      const newAccountData: Account = {
        id: newId,
        lastName: newAccount.lastName,
        firstName: newAccount.firstName,
        email: newAccount.email,
        role: newAccount.role,
        createdAt: new Date().toISOString(),
      };
      
      setAccounts([...accounts, newAccountData]);
      setIsCreating(false);
      handleCloseCreateModal();
      alert('アカウントを作成しました！');
    }, 800);
  };

  // アカウントを削除
  const handleDeleteAccount = (id: string, name: string) => {
    if (!confirm(`「${name}」のアカウントを削除しますか？`)) {
      return;
    }
    
    // TODO: API呼び出し
    setAccounts(accounts.filter(account => account.id !== id));
    alert('アカウントを削除しました。');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen font-sans">
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* ページヘッダー */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Icons.UserGroup className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">アカウント管理</h1>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md"
            >
              <Icons.Plus />
              アカウント作成
            </button>
          </div>

          {/* コンテンツエリア */}
          <div className="p-8">
            {/* アカウントリスト */}
            {accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const fullName = `${account.lastName} ${account.firstName}`;
                  return (
                    <div
                      key={account.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out p-6"
                    >
                      <div className="flex items-center gap-6">
                        {/* アバター */}
                        <div className="flex-shrink-0">
                          <Avatar name={fullName} />
                        </div>

                        {/* 氏名とメール */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {fullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {account.email}
                          </p>
                        </div>

                        {/* 権限 */}
                        <div className="flex-shrink-0">
                          <RoleBadge role={account.role} />
                        </div>

                        {/* アクション */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => alert('編集機能は今後実装予定です')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                          >
                            <Icons.Edit className="w-4 h-4" />
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account.id, fullName)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all duration-200 ease-in-out font-medium text-sm"
                          >
                            <Icons.Trash className="w-4 h-4" />
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">
                  登録されているアカウントがありません
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold"
                >
                  <Icons.Plus />
                  アカウントを作成
                </button>
              </div>
            )}

            {/* アカウント作成モーダル */}
            {isCreateModalOpen && (
              <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
                onClick={handleCloseCreateModal}
              >
                <div
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* モーダルヘッダー */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">アカウント作成</h2>
                    <button
                      onClick={handleCloseCreateModal}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Icons.X />
                    </button>
                  </div>

                  {/* モーダルコンテンツ */}
                  <form onSubmit={handleCreateAccount} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      {/* 氏名（姓・名） */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            姓 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newAccount.lastName}
                            onChange={(e) => setNewAccount({ ...newAccount, lastName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            placeholder="例: 田中"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newAccount.firstName}
                            onChange={(e) => setNewAccount({ ...newAccount, firstName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            placeholder="例: 太郎"
                          />
                        </div>
                      </div>

                      {/* メールアドレス */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          メールアドレス <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={newAccount.email}
                          onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          placeholder="例: user@example.com"
                        />
                      </div>

                      {/* 権限選択 */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          権限 <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="role"
                              value="admin"
                              checked={newAccount.role === 'admin'}
                              onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as 'admin' | 'planner' })}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="font-bold text-gray-900">管理者</div>
                              <div className="text-sm text-gray-600">すべての機能にアクセスできます</div>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="role"
                              value="planner"
                              checked={newAccount.role === 'planner'}
                              onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as 'admin' | 'planner' })}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="font-bold text-gray-900">一般プランナー</div>
                              <div className="text-sm text-gray-600">基本的な機能にアクセスできます</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* 初期パスワード */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          初期パスワード <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={newAccount.password}
                          onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          placeholder="8文字以上"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ユーザーが最初にログインする際に使用するパスワードです
                        </p>
                      </div>
                    </div>

                    {/* モーダルフッター */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseCreateModal}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 ease-in-out font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                      >
                        {isCreating ? (
                          "作成中..."
                        ) : (
                          <>
                            <Icons.Check />
                            作成
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
