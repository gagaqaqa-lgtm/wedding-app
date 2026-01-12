// Command Palette (Cmd+K) コンポーネント
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Users, Settings, Calendar, Grid3x3, AlertTriangle, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  group: string;
}

const commands: CommandItem[] = [
  // 挙式関連
  { id: 'weddings', label: '挙式一覧', icon: Calendar, href: '/dashboard', group: '挙式' },
  { id: 'weddings-new', label: '挙式を追加', icon: FileText, href: '/dashboard/weddings/new', group: '挙式' },
  
  // ゲスト管理
  { id: 'guests', label: 'ゲスト管理', icon: Users, href: '/dashboard/weddings/1/guests', group: '管理' },
  
  // 配席管理
  { id: 'seating', label: '配席管理', icon: Grid3x3, href: '/dashboard/weddings/1/seating', group: '管理' },
  
  // アレルギー管理
  { id: 'allergies', label: 'アレルギー管理', icon: AlertTriangle, href: '/dashboard/weddings/1/allergies', group: '管理' },
  
  // 印刷
  { id: 'print', label: '印刷プレビュー', icon: Printer, href: '/dashboard/weddings/1/print', group: 'その他' },
  
  // 設定
  { id: 'settings', label: '設定', icon: Settings, href: '/dashboard/settings', group: 'その他' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Cmd+K で開く
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // ESCで閉じる
  useEffect(() => {
    if (!open) return;

    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const handleSelect = useCallback((item: CommandItem) => {
    if (item.href) {
      router.push(item.href);
    }
    if (item.action) {
      item.action();
    }
    setOpen(false);
    setSearch('');
  }, [router]);

  // 検索フィルタ
  const filteredCommands = search
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  // グループ化
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) {
      acc[cmd.group] = [];
    }
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-sans text-sm text-gray-600"
      >
        <Search className="w-4 h-4" />
        <span>検索 (Cmd+K)</span>
      </button>

      {/* モーダル */}
      <AnimatePresence>
        {open && (
          <>
            {/* オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            
            {/* コマンドパレット */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden"
            >
              <Command className="p-2" shouldFilter={false}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="検索... (例: 挙式、ゲスト、配席)"
                    className="flex-1 outline-none text-sm font-sans placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
                
                <Command.List className="max-h-96 overflow-y-auto p-2">
                  {Object.entries(groupedCommands).map(([group, items]) => (
                    <div key={group}>
                      <Command.Group heading={group}>
                        {items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Command.Item
                              key={item.id}
                              value={item.id}
                              onSelect={() => handleSelect(item)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors font-sans text-sm"
                            >
                              <Icon className="w-4 h-4 text-gray-500" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500">{item.description}</div>
                                )}
                              </div>
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    </div>
                  ))}
                  
                  {filteredCommands.length === 0 && (
                    <div className="px-3 py-8 text-center text-sm text-gray-500 font-sans">
                      検索結果が見つかりませんでした
                    </div>
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
