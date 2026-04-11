'use client';

import { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { RemoveCircleFreeIcons, CheckmarkCircleFreeIcons, TickFreeIcons, CancelFreeIcons } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'info';

/** Default auto-dismiss delay when `onDismiss` is set (toast-style). Pass `0` to disable. */
export const NOTIFICATION_AUTO_HIDE_MS = 2500;

export type NotificationBannerProps = {
  message: string;
  type?: NotificationType;
  onDismiss?: () => void;
  children?: React.ReactNode;
  /**
   * `floating` — full reference layout (fixed top host + surface). Use alone.
   * `embedded` — surface only; parent supplies positioning (e.g. dashboard stack).
   */
  variant?: 'floating' | 'embedded';
  /**
   * Milliseconds before calling `onDismiss`. Defaults to {@link NOTIFICATION_AUTO_HIDE_MS} when `onDismiss` is provided.
   * Ignored when `children` is present. Pass `0` to keep the banner until dismissed manually.
   */
  autoHideMs?: number;
  className?: string;
};

const ICON_CLASS: Record<NotificationType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

const ICON = {
  success: CheckmarkCircleFreeIcons,
  error: RemoveCircleFreeIcons,
  info: TickFreeIcons,
} as const;

export function NotificationBanner({
  message,
  type = 'info',
  onDismiss,
  children,
  variant = 'embedded',
  autoHideMs,
  className,
}: NotificationBannerProps) {
  const Icon = ICON[type];

  const resolvedAutoHideMs =
    autoHideMs !== undefined ? autoHideMs : onDismiss ? NOTIFICATION_AUTO_HIDE_MS : 0;

  useEffect(() => {
    if (!onDismiss || resolvedAutoHideMs <= 0 || children) return;
    const id = window.setTimeout(() => onDismiss(), resolvedAutoHideMs);
    return () => window.clearTimeout(id);
  }, [message, type, onDismiss, resolvedAutoHideMs, children]);

  const surface = (
    <div className={cn('notification-banner-surface', className)}>
      <HugeiconsIcon icon={Icon} size={16} aria-hidden style={{ marginTop: 2, flexShrink: 0 }} className={ICON_CLASS[type]} />
      <div className="min-w-0 flex-1">
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </p>
        {children ? <div className="mt-3">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
          style={{ color: 'inherit' }}
          aria-label="Dismiss"
        >
          <HugeiconsIcon icon={CancelFreeIcons} size={16} aria-hidden />
        </button>
      ) : null}
    </div>
  );

  if (variant === 'floating') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
          {surface}
        </div>
      </div>
    );
  }

  return surface;
}
