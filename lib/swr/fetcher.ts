// SWR fetcher関数

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('データの取得に失敗しました');
    throw error;
  }
  return res.json();
};

// API エンドポイント（ダミー実装、実際は環境変数から取得）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const adminApi = {
  // ダッシュボード用データ取得
  getDashboard: () => `${API_BASE_URL}/admin/dashboard`,
  
  // ゲスト一覧取得
  getGuests: (weddingId?: number) => 
    weddingId 
      ? `${API_BASE_URL}/admin/guests?weddingId=${weddingId}`
      : `${API_BASE_URL}/admin/guests`,
  
  // 配席情報取得
  getSeatingPlan: (weddingId: number) => 
    `${API_BASE_URL}/admin/seating/${weddingId}`,
  
  // アレルギー一覧取得
  getAllergies: (weddingId?: number) =>
    weddingId
      ? `${API_BASE_URL}/admin/allergies?weddingId=${weddingId}`
      : `${API_BASE_URL}/admin/allergies`,
};
