"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, X, Save, Image as ImageIcon } from "lucide-react";
import { getWeddingTables } from "@/lib/services/mock/weddingService";
import type { Table } from "@/lib/types/schema";

interface WeddingTablesTabProps {
  weddingId: string;
}

/**
 * 卓設定タブコンポーネント
 * 
 * 卓情報の閲覧と編集を提供します。編集モードは確認ダイアログで保護されています。
 */
export function WeddingTablesTab({ weddingId }: WeddingTablesTabProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [editingTables, setEditingTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 卓データの取得
  useEffect(() => {
    const loadTables = async () => {
      try {
        const data = await getWeddingTables(weddingId);
        setTables(data);
        setEditingTables(data);
      } catch (error) {
        console.error('Failed to load tables:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTables();
  }, [weddingId]);

  // 編集モード開始の確認
  const handleEditClick = () => {
    setShowEditConfirmDialog(true);
  };

  // 編集モード開始の確定
  const handleConfirmEdit = () => {
    setEditingTables(tables.map(t => ({ ...t }))); // コピーを作成
    setIsEditing(true);
    setShowEditConfirmDialog(false);
  };

  // 編集のキャンセル
  const handleCancelEdit = () => {
    setEditingTables(tables.map(t => ({ ...t }))); // 元のデータに戻す
    setIsEditing(false);
  };

  // 卓情報の更新（ローカル状態のみ）
  const handleTableUpdate = (tableId: string, updates: Partial<Table>) => {
    setEditingTables(prev =>
      prev.map(table =>
        table.id === tableId ? { ...table, ...updates } : table
      )
    );
  };

  // 保存処理（モック）
  const handleSave = () => {
    console.log('Mock save: tables =', editingTables);
    setTables(editingTables.map(t => ({ ...t })));
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">卓設定</h2>
        <div className="text-center py-12 text-gray-500">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  const displayTables = isEditing ? editingTables : tables;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">卓設定</h2>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="h-9"
          >
            <Edit className="w-4 h-4 mr-2" />
            編集
          </Button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-9"
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        )}
      </div>

      {displayTables.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <p className="text-gray-500">卓データがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTables.map((table) => (
            <div
              key={table.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* 卓名 */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">卓名</Label>
                  {isEditing ? (
                    <Input
                      value={table.name}
                      onChange={(e) => handleTableUpdate(table.id, { name: e.target.value })}
                      className="text-base font-semibold"
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-900">{table.name}</p>
                  )}
                </div>

                {/* メッセージ */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">メッセージ</Label>
                  {isEditing ? (
                    <Textarea
                      value={table.message || ''}
                      onChange={(e) => handleTableUpdate(table.id, { message: e.target.value })}
                      rows={4}
                      className="text-sm resize-none"
                      placeholder="卓へのメッセージを入力してください..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[60px]">
                      {table.message || <span className="text-gray-400">メッセージなし</span>}
                    </p>
                  )}
                </div>

                {/* 写真と完了状態 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {table.photoUrl && (
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>写真あり</span>
                      </div>
                    )}
                    <div className={`px-2 py-0.5 rounded-full ${
                      table.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {table.isCompleted ? '完了' : '未完了'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編集確認ダイアログ */}
      <Dialog open={showEditConfirmDialog} onOpenChange={setShowEditConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メッセージを編集しますか？</DialogTitle>
            <DialogDescription className="pt-2">
              卓情報は新郎新婦が構成する重要なデータです。プランナーによる変更は、新郎新婦の意図と食い違う可能性があります。本当に編集しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditConfirmDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmEdit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              編集する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
