import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@cotizaciones/ui';

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

/**
 * Dropdown ligero con cierre al click-outside y al Escape.
 * Sin dependencias — para casos simples donde no necesitamos Radix Popover.
 */
export function Dropdown({ trigger, children, className, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-card p-2 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}
