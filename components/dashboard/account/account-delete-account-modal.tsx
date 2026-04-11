'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBanner } from '@/components/dashboard/ui/notification-banner';

const CONFIRM = 'delete';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export function AccountDeleteAccountModal({ open, onClose, onDeleted }: Props) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setInput('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting]);

  if (!open) return null;

  const canSubmit = input.trim() === CONFIRM && !submitting;

  const handleDelete = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: CONFIRM }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof data?.error === 'string'
            ? data.error
            : 'Could not delete your account.',
        );
        return;
      }
      onDeleted();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={submitting ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="delete-account-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          Delete account
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          This permanently deletes your account, connected stores, and saved API
          keys. This cannot be undone.
        </p>

        {error ? (
          <div className="mb-4">
            <NotificationBanner
              type="error"
              message={error}
              variant="embedded"
              onDismiss={() => setError(null)}
            />
          </div>
        ) : null}

        <label htmlFor="delete-account-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
          Type <span className="font-mono text-gray-900">{CONFIRM}</span> to confirm
        </label>
        <Input
          id="delete-account-confirm"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={CONFIRM}
          className="bg-white border-gray-300 mb-6"
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => void handleDelete()}
          >
            {submitting ? 'Deleting…' : 'Delete my account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
