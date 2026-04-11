'use client';

import {
  NotificationBanner,
  NOTIFICATION_AUTO_HIDE_MS,
} from '@/components/dashboard/ui/notification-banner';

export type CollectionImportStatus = {
  type: 'success' | 'error';
  message: string;
  collectionId?: string;
} | null;

export type TranslationStatus = { type: 'success' | 'error'; message: string } | null;

export type ProductImportStatus = {
  type: 'success' | 'error';
  message: string;
  productId?: string;
  productHandle?: string;
  storeUrl?: string;
  adminUrl?: string;
} | null;

type Props = {
  collectionImportStatus: CollectionImportStatus;
  onDismissCollection: () => void;
  translationStatus: TranslationStatus;
  onDismissTranslation: () => void;
  importStatus: ProductImportStatus;
  onDismissImport: () => void;
  scrapeError: string | null;
  onDismissScrapeError: () => void;
  collectionScrapeError: string | null;
  onDismissCollectionScrapeError: () => void;
};

export function DashboardNotificationToasts({
  collectionImportStatus,
  onDismissCollection,
  translationStatus,
  onDismissTranslation,
  importStatus,
  onDismissImport,
  scrapeError,
  onDismissScrapeError,
  collectionScrapeError,
  onDismissCollectionScrapeError,
}: Props) {
  const hasAny =
    collectionImportStatus ||
    translationStatus ||
    importStatus ||
    scrapeError ||
    collectionScrapeError;

  if (!hasAny) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {scrapeError ? (
        <div className="pointer-events-auto">
          <NotificationBanner
            variant="embedded"
            type="error"
            message={scrapeError}
            onDismiss={onDismissScrapeError}
            autoHideMs={NOTIFICATION_AUTO_HIDE_MS}
          />
        </div>
      ) : null}

      {collectionScrapeError ? (
        <div className="pointer-events-auto">
          <NotificationBanner
            variant="embedded"
            type="error"
            message={collectionScrapeError}
            onDismiss={onDismissCollectionScrapeError}
            autoHideMs={NOTIFICATION_AUTO_HIDE_MS}
          />
        </div>
      ) : null}

      {collectionImportStatus ? (
        <div className="pointer-events-auto">
          <NotificationBanner
            variant="embedded"
            type={collectionImportStatus.type === 'success' ? 'success' : 'error'}
            message={collectionImportStatus.message}
            onDismiss={onDismissCollection}
            autoHideMs={NOTIFICATION_AUTO_HIDE_MS}
          />
        </div>
      ) : null}

      {translationStatus ? (
        <div className="pointer-events-auto">
          <NotificationBanner
            variant="embedded"
            type={translationStatus.type === 'success' ? 'success' : 'error'}
            message={translationStatus.message}
            onDismiss={onDismissTranslation}
            autoHideMs={NOTIFICATION_AUTO_HIDE_MS}
          />
        </div>
      ) : null}

      {importStatus ? (
        <div className="pointer-events-auto">
          <NotificationBanner
            variant="embedded"
            type={importStatus.type === 'success' ? 'success' : 'error'}
            message={importStatus.message}
            onDismiss={onDismissImport}
            autoHideMs={NOTIFICATION_AUTO_HIDE_MS}
          >
            {importStatus.type === 'success' && importStatus.storeUrl && importStatus.adminUrl ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={importStatus.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  View in Store
                  <span aria-hidden>↗</span>
                </a>
                <a
                  href={importStatus.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-current/30 bg-transparent px-3 py-1.5 text-xs font-medium text-inherit transition-colors hover:bg-white/10"
                >
                  Edit on Shopify
                  <span aria-hidden>↗</span>
                </a>
              </div>
            ) : null}
          </NotificationBanner>
        </div>
      ) : null}
    </div>
  );
}
