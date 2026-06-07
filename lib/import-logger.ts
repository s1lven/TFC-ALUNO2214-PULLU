import { createServiceClient } from '@/lib/supabase/admin';

type ImportType = 'product' | 'collection';
type ImportStatus = 'success' | 'error';

interface LogImportOptions {
  storeId: number;
  type: ImportType;
  status: ImportStatus;
  sourceUrl?: string | null;
  payload?: Record<string, unknown>;
  error?: string | null;
}

export function logImport(opts: LogImportOptions): void {
  const admin = createServiceClient();
  admin.from('import_logs').insert({
    store_id: opts.storeId,
    type: opts.type,
    status: opts.status,
    source_url: opts.sourceUrl ?? null,
    payload: opts.payload ?? null,
    error: opts.error ?? null,
  }).then(({ error }) => {
    if (error) console.error('[import-logger] failed to write log:', error.message);
  });
}
