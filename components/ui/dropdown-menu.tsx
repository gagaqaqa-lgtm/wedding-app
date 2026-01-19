'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

// DropdownMenuコンテキスト
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

// DropdownMenu Root
interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// DropdownMenuTrigger
interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, asChild, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
      throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      context.setOpen(!context.open);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ...props,
        ref,
        onClick: handleClick,
        'aria-expanded': context.open,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(className)}
        onClick={handleClick}
        aria-expanded={context.open}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// DropdownMenuContent
interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'start', sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLElement | null>(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // Trigger要素を探して位置を計算
    React.useEffect(() => {
      if (!context?.open) return;

      const findTrigger = () => {
        // aria-expanded="true"のbutton要素を探す（現在開いているメニューのトリガー）
        const buttons = document.querySelectorAll('button[aria-expanded="true"]');
        if (buttons.length > 0) {
          // 最後に開いたメニューのトリガーを使用
          triggerRef.current = buttons[buttons.length - 1] as HTMLElement;
        }
      };

      const updatePosition = () => {
        findTrigger();
        
        if (triggerRef.current && contentRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const contentRect = contentRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          let top = triggerRect.bottom + sideOffset;
          let left = triggerRect.left;

          // alignに応じて位置を調整
          if (align === 'end') {
            left = triggerRect.right - (contentRect.width || 200);
          } else if (align === 'center') {
            left = triggerRect.left + (triggerRect.width / 2) - ((contentRect.width || 200) / 2);
          }

          // ビューポートからはみ出さないように調整
          if (left + (contentRect.width || 200) > viewportWidth) {
            left = viewportWidth - (contentRect.width || 200) - 8;
          }
          if (left < 8) {
            left = 8;
          }

          // 下にはみ出す場合は上に表示
          if (top + (contentRect.height || 100) > viewportHeight) {
            top = triggerRect.top - (contentRect.height || 100) - sideOffset;
          }
          if (top < 8) {
            top = 8;
          }

          setPosition({ top, left });
        }
      };

      // 位置を更新（少し遅延させてDOMが完全にレンダリングされた後に実行）
      const timeoutId = setTimeout(updatePosition, 10);

      // スクロールやリサイズ時に位置を更新
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [context?.open, align, sideOffset]);

    React.useEffect(() => {
      if (!context?.open) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          context.setOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          context.setOpen(false);
        }
      };

      // 少し遅延させてイベントリスナーを追加（レンダリング後に）
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [context]);

    if (!context?.open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          'fixed z-[9999] min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md',
          className
        )}
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// DropdownMenuItem
interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      context?.setOpen(false);
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 disabled:pointer-events-none disabled:opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// DropdownMenuSeparator
const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('-mx-1 my-1 h-px bg-gray-100', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// DropdownMenuLabel
interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// DropdownMenuPortal - React Portalを使用してbody直下にレンダリング
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') return null;

  return createPortal(children, document.body);
};

// 未使用のコンポーネント（互換性のため）
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
