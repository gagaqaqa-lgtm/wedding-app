'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onCheckedChange?.(e.target.checked);
      }
    };

    return (
      <label className={cn('relative inline-flex items-center cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out',
            checked ? 'bg-emerald-600' : 'bg-gray-200',
            disabled && 'cursor-not-allowed',
            className
          )}
        >
          <div
            className={cn(
              'absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out',
              checked && 'translate-x-5'
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
