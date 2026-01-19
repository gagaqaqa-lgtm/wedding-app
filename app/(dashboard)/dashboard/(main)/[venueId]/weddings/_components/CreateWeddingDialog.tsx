"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateWeddingDialogProps {
  /** ダイアログを開くトリガーボタンの子要素 */
  trigger: React.ReactNode;
  /** フォーム送信時のコールバック */
  onSubmit: (data: {
    groomName: string;
    brideName: string;
    date: string;
    time: string;
    guestCount: number;
  }) => void;
}

/**
 * 新規挙式登録ダイアログコンポーネント
 * 
 * 一覧画面上でモーダルとして表示され、ページ遷移なしで挙式を登録できる
 */
export function CreateWeddingDialog({ trigger, onSubmit }: CreateWeddingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    date: "",
    time: "18:00",
    guestCount: 0,
  });

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.groomName.trim() || !formData.brideName.trim() || !formData.date || !formData.time) {
      alert("すべての必須項目を入力してください。");
      return;
    }

    if (formData.guestCount < 0) {
      alert("ゲスト人数は0以上で入力してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      // 親コンポーネントのコールバックを実行
      onSubmit({
        groomName: formData.groomName.trim(),
        brideName: formData.brideName.trim(),
        date: formData.date,
        time: formData.time,
        guestCount: formData.guestCount,
      });

      // フォームをリセット
      setFormData({
        groomName: "",
        brideName: "",
        date: "",
        time: "18:00",
        guestCount: 0,
      });

      // ダイアログを閉じる
      setOpen(false);
    } catch (error) {
      console.error("Failed to create wedding:", error);
      alert("挙式の登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ダイアログを閉じる際にフォームをリセット
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 閉じる際にフォームをリセット
      setFormData({
        groomName: "",
        brideName: "",
        date: "",
        time: "18:00",
        guestCount: 0,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規挙式登録</DialogTitle>
          <DialogDescription>
            新しい挙式の情報を入力してください。登録後、一覧に追加されます。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* 新郎名 */}
            <div className="grid gap-2">
              <Label htmlFor="groom-name">
                新郎名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="groom-name"
                type="text"
                required
                value={formData.groomName}
                onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                placeholder="例: 田中太郎"
                disabled={isSubmitting}
              />
            </div>

            {/* 新婦名 */}
            <div className="grid gap-2">
              <Label htmlFor="bride-name">
                新婦名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bride-name"
                type="text"
                required
                value={formData.brideName}
                onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                placeholder="例: 鈴木花子"
                disabled={isSubmitting}
              />
            </div>

            {/* 挙式日 */}
            <div className="grid gap-2">
              <Label htmlFor="wedding-date">
                挙式日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="wedding-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* 挙式時間 */}
            <div className="grid gap-2">
              <Label htmlFor="wedding-time">
                挙式時間 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="wedding-time"
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* ゲスト人数 */}
            <div className="grid gap-2">
              <Label htmlFor="guest-count">
                ゲスト人数
              </Label>
              <Input
                id="guest-count"
                type="number"
                min="0"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) || 0 })}
                placeholder="例: 80"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
