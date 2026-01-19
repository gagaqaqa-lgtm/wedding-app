import Link from 'next/link';
import { Building2, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 会場が見つからない場合のエラーページ
 * 
 * layout.tsx で notFound() が実行された際に自動的に表示されます
 * 
 * NOTE: Next.jsの仕様上、layout.tsx 内で発生した notFound() は
 * 同階層の not-found.tsx ではキャッチできないため、親ディレクトリに配置しています
 */
export default function VenueNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="relative">
            <Building2 className="w-20 h-20 text-slate-300" />
            <AlertCircle className="w-10 h-10 text-amber-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
          </div>
        </div>

        {/* タイトル */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            会場が見つかりません
          </h1>
          <p className="text-slate-600 leading-relaxed">
            アクセスしようとした会場データは存在しないか、削除された可能性があります。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="default" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              トップページへ戻る
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/venues">
              会場一覧を確認
            </Link>
          </Button>
        </div>

        {/* 補足情報 */}
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            このエラーが続く場合は、管理者にお問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
}
