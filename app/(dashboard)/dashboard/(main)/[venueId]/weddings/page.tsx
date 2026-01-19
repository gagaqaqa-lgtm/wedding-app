import { getWeddingsByVenueId } from '@/lib/services/mock/weddingService';
import { WeddingListClient } from './_components/WeddingListClient';

interface VenueWeddingsPageProps {
  params: Promise<{ venueId: string }>;
}

/**
 * 挙式一覧ページ（Server Component）
 * 
 * 会場IDを受け取り、サーバーサイドでその会場に紐づく挙式リストを取得してクライアントコンポーネントに渡す
 */
export default async function VenueWeddingsPage({ params }: VenueWeddingsPageProps) {
  // URLパラメータから会場IDを取得
  const { venueId } = await params;
  
  // サーバーサイドで該当会場の挙式リストを取得
  const weddings = await getWeddingsByVenueId(venueId);
  
  // クライアントコンポーネントに挙式データを渡す
  return (
    <WeddingListClient 
      weddings={weddings}
      venueId={venueId}
    />
  );
}
