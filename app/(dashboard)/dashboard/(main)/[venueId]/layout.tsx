import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getVenueInfo } from "@/lib/services/mock/venueService";
import { VenueDashboardShell } from "./_components/VenueDashboardShell";

interface VenueDashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ venueId: string }>;
}

/**
 * 会場ダッシュボードレイアウト（Server Component）
 * 
 * 会場IDを受け取り、サーバーサイドで会場情報を取得してクライアントコンポーネントに渡す
 */
export default async function VenueDashboardLayout({ 
  children, 
  params 
}: VenueDashboardLayoutProps) {
  // URLパラメータから会場IDを取得
  const { venueId } = await params;
  
  // サーバーサイドで会場情報を取得
  const venue = await getVenueInfo(venueId);
  
  // 会場が見つからない場合は404ページを表示
  if (!venue) {
    notFound();
  }
  
  // クライアントコンポーネントに会場データを渡す
  return (
    <VenueDashboardShell venue={venue}>
      {children}
    </VenueDashboardShell>
  );
}
