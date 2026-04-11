'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AccountOpenAiKeyCard, type KeyStatus } from '@/components/dashboard/account/account-openai-key-card';
import { AccountProfileCard } from '@/components/dashboard/account/account-profile-card';
import { AccountDeleteAccountModal } from '@/components/dashboard/account/account-delete-account-modal';
import { DashboardCenterSpinner } from '@/components/dashboard/dashboard-center-spinner';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [keyLoading, setKeyLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [keyMessage, setKeyMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const supabase = createClient();

  const handleAccountDeleted = useCallback(async () => {
    setDeleteModalOpen(false);
    const client = createClient();
    await client.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }, [router]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setKeyLoading(true);
      try {
        const res = await fetch('/api/user/openai-key');
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (!cancelled) {
            setKeyStatus(null);
            setKeyMessage({
              type: 'err',
              text:
                data?.error ||
                'Could not load key status. Add SUPABASE_SERVICE_ROLE_KEY and run the latest migration.',
            });
          }
          return;
        }
        if (!cancelled) {
          setKeyStatus({
            configured: Boolean(data.configured),
            lastFour: data.lastFour ?? null,
          });
          setKeyMessage(null);
        }
      } catch {
        if (!cancelled) {
          setKeyMessage({ type: 'err', text: 'Network error loading API key status.' });
        }
      } finally {
        if (!cancelled) setKeyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveKey = async () => {
    setKeyMessage(null);
    const trimmed = newKey.trim();
    if (!trimmed) {
      setKeyMessage({ type: 'err', text: 'Paste your OpenAI API key first.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setKeyMessage({
          type: 'err',
          text: data?.error || 'Could not save key.',
        });
        return;
      }
      setNewKey('');
      setKeyStatus({
        configured: true,
        lastFour: data.lastFour ?? null,
      });
      setKeyMessage({ type: 'ok', text: 'Key saved. Only the last characters below are shown from now on.' });
    } catch {
      setKeyMessage({ type: 'err', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const removeKey = async () => {
    setKeyMessage(null);
    setRemoving(true);
    try {
      const res = await fetch('/api/user/openai-key', { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setKeyMessage({
          type: 'err',
          text: data?.error || 'Could not remove key.',
        });
        return;
      }
      setKeyStatus({ configured: false, lastFour: null });
      setKeyMessage({ type: 'ok', text: 'API key removed from your account.' });
    } catch {
      setKeyMessage({ type: 'err', text: 'Network error while removing.' });
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center bg-surface">
        <DashboardCenterSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-full p-8 bg-surface">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h1>
          <p className="text-gray-600 text-sm">Manage your account information</p>
        </div>

        <AccountProfileCard user={user} />

        <AccountOpenAiKeyCard
          keyStatus={keyStatus}
          keyLoading={keyLoading}
          keyMessage={keyMessage}
          newKey={newKey}
          onNewKeyChange={setNewKey}
          saving={saving}
          removing={removing}
          onSave={saveKey}
          onRemove={removeKey}
        />

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Danger zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="text-sm font-medium text-red-700 border border-red-300 bg-white hover:bg-red-50 rounded-md px-4 py-2 transition-colors"
          >
            Delete account
          </button>
        </div>

        <AccountDeleteAccountModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={() => void handleAccountDeleted()}
        />
      </div>
    </div>
  );
}
