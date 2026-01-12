// Smart Statusコンポーネント（信号機カラー）
'use client';

import { cn } from '@/lib/utils/cn';
import { getWeddingStatusConfig, getVenueStatusConfig, type WeddingStatus, type VenueStatus } from '@/lib/utils/status';

interface SmartStatusProps {
  status: WeddingStatus | VenueStatus;
  type?: 'wedding' | 'venue';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function SmartStatus({ 
  status, 
  type = 'wedding', 
  size = 'md',
  showIcon = true,
  className 
}: SmartStatusProps) {
  const config = type === 'wedding' 
    ? getWeddingStatusConfig(status as WeddingStatus)
    : getVenueStatusConfig(status as VenueStatus);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium font-sans',
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
