import { notFound } from 'next/navigation';
import { getWeddingById } from '@/lib/services/mock/weddingService';
import { WeddingDetailClient } from './_components/WeddingDetailClient';

interface WeddingDetailPageProps {
  params: Promise<{ venueId: string; id: string }>;
}

/**
 * 挙式詳細ページ（Server Component）
 * 
 * 会場IDと挙式IDを受け取り、サーバーサイドで挙式情報を取得してクライアントコンポーネントに渡す
 */
export default async function WeddingDetailPage({ params }: WeddingDetailPageProps) {
  // URLパラメータから会場IDと挙式IDを取得
  const { venueId, id: weddingId } = await params;
  
  // サーバーサイドで挙式情報を取得
  const wedding = await getWeddingById(weddingId);
  
  // バリデーション: データが存在しない、または会場IDが一致しない場合は404
  if (!wedding || wedding.venueId !== venueId) {
    notFound();
  }
  
  // クライアントコンポーネントに挙式データを渡す
  return (
    <WeddingDetailClient 
      wedding={wedding}
      venueId={venueId}
    />
  );
}
