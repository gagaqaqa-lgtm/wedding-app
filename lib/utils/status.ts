// Smart Status（信号機カラー）ユーティリティ

export type WeddingStatus = 
  | 'draft'           // 下書き
  | 'preparing'       // 準備中
  | 'invited'         // 招待状発送済
  | 'confirmed'       // 席次確定済
  | 'completed'       // 完了
  | 'cancelled';      // キャンセル

export type VenueStatus = 
  | 'active'          // アクティブ
  | 'suspended'       // 一時停止
  | 'inactive';       // 無効

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // 絵文字
}

/**
 * 挙式ステータスの設定を取得
 */
export function getWeddingStatusConfig(status: WeddingStatus): StatusConfig {
  const configs: Record<WeddingStatus, StatusConfig> = {
    draft: {
      label: '下書き',
      color: 'text-stone-600',
      bgColor: 'bg-stone-50',
      borderColor: 'border-stone-300',
      icon: '📝',
    },
    preparing: {
      label: '準備中',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      icon: '🟡',
    },
    invited: {
      label: '招待状発送済',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      icon: '🔵',
    },
    confirmed: {
      label: '席次確定済',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      icon: '🟢',
    },
    completed: {
      label: '完了',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      icon: '✅',
    },
    cancelled: {
      label: 'キャンセル',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      icon: '🔴',
    },
  };

  return configs[status];
}

/**
 * 式場ステータスの設定を取得
 */
export function getVenueStatusConfig(status: VenueStatus): StatusConfig {
  const configs: Record<VenueStatus, StatusConfig> = {
    active: {
      label: 'アクティブ',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      icon: '🟢',
    },
    suspended: {
      label: '一時停止',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      icon: '🟡',
    },
    inactive: {
      label: '無効',
      color: 'text-stone-600',
      bgColor: 'bg-stone-50',
      borderColor: 'border-stone-300',
      icon: '⚪',
    },
  };

  return configs[status];
}
