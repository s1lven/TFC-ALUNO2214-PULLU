'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AccountOpenAiKeyCard, type KeyStatus } from '@/components/dashboard/account/account-openai-key-card';
import { AccountFalKeyCard } from '@/components/dashboard/account/account-fal-key-card';
import { AccountProfileCard } from '@/components/dashboard/account/account-profile-card';
import { AccountDeleteAccountModal } from '@/components/dashboard/account/account-delete-account-modal';
import { DashboardCenterSpinner } from '@/components/dashboard/dashboard-center-spinner';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // OpenAI key state
  const [openaiKeyStatus, setOpenaiKeyStatus] = useState<KeyStatus | null>(null);
  const [openaiKeyLoading, setOpenaiKeyLoading] = useState(true);
  const [openaiNewKey, setOpenaiNewKey] = useState('');
  const [openaiSaving, setOpenaiSaving] = useState(false);
  const [openaiRemoving, setOpenaiRemoving] = useState(false);
  const [openaiKeyMessage, setOpenaiKeyMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // fal.ai key state
  const [falKeyStatus, setFalKeyStatus] = useState<KeyStatus | null>(null);
  const [falKeyLoading, setFalKeyLoading] = useState(true);
  const [falNewKey, setFalNewKey] = useState('');
  const [falSaving, setFalSaving] = useState(false);
  const [falRemoving, setFalRemoving] = useState(false);
  const [falKeyMessage, setFalKeyMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOpenaiKeyLoading(true);
      try {
        const res = await fetch('/api/user/openai-key');
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (!cancelled) {
            setOpenaiKeyStatus(null);
            setOpenaiKeyMessage({ type: 'err', text: data?.error || 'Could not load key status.' });
          }
          return;
        }
        if (!cancelled) {
          setOpenaiKeyStatus({ configured: Boolean(data.configured), lastFour: data.lastFour ?? null });
          setOpenaiKeyMessage(null);
        }
      } catch {
        if (!cancelled) setOpenaiKeyMessage({ type: 'err', text: 'Network error loading API key status.' });
      } finally {
        if (!cancelled) setOpenaiKeyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFalKeyLoading(true);
      try {
        const res = await fetch('/api/user/fal-key');
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (!cancelled) {
            setFalKeyStatus(null);
            setFalKeyMessage({ type: 'err', text: data?.error || 'Could not load key status.' });
          }
          return;
        }
        if (!cancelled) {
          setFalKeyStatus({ configured: Boolean(data.configured), lastFour: data.lastFour ?? null });
          setFalKeyMessage(null);
        }
      } catch {
        if (!cancelled) setFalKeyMessage({ type: 'err', text: 'Network error loading API key status.' });
      } finally {
        if (!cancelled) setFalKeyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveOpenaiKey = async () => {
    setOpenaiKeyMessage(null);
    const trimmed = openaiNewKey.trim();
    if (!trimmed) { setOpenaiKeyMessage({ type: 'err', text: 'Paste your OpenAI API key first.' }); return; }
    setOpenaiSaving(true);
    try {
      const res = await fetch('/api/user/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setOpenaiKeyMessage({ type: 'err', text: data?.error || 'Could not save key.' }); return; }
      setOpenaiNewKey('');
      setOpenaiKeyStatus({ configured: true, lastFour: data.lastFour ?? null });
      setOpenaiKeyMessage({ type: 'ok', text: 'Key saved. Only the last characters below are shown from now on.' });
    } catch {
      setOpenaiKeyMessage({ type: 'err', text: 'Network error while saving.' });
    } finally {
      setOpenaiSaving(false);
    }
  };

  const removeOpenaiKey = async () => {
    setOpenaiKeyMessage(null);
    setOpenaiRemoving(true);
    try {
      const res = await fetch('/api/user/openai-key', { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setOpenaiKeyMessage({ type: 'err', text: data?.error || 'Could not remove key.' }); return; }
      setOpenaiKeyStatus({ configured: false, lastFour: null });
      setOpenaiKeyMessage({ type: 'ok', text: 'API key removed from your account.' });
    } catch {
      setOpenaiKeyMessage({ type: 'err', text: 'Network error while removing.' });
    } finally {
      setOpenaiRemoving(false);
    }
  };

  const saveFalKey = async () => {
    setFalKeyMessage(null);
    const trimmed = falNewKey.trim();
    if (!trimmed) { setFalKeyMessage({ type: 'err', text: 'Paste your fal.ai API key first.' }); return; }
    setFalSaving(true);
    try {
      const res = await fetch('/api/user/fal-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setFalKeyMessage({ type: 'err', text: data?.error || 'Could not save key.' }); return; }
      setFalNewKey('');
      setFalKeyStatus({ configured: true, lastFour: data.lastFour ?? null });
      setFalKeyMessage({ type: 'ok', text: 'Key saved. Only the last characters below are shown from now on.' });
    } catch {
      setFalKeyMessage({ type: 'err', text: 'Network error while saving.' });
    } finally {
      setFalSaving(false);
    }
  };

  const removeFalKey = async () => {
    setFalKeyMessage(null);
    setFalRemoving(true);
    try {
      const res = await fetch('/api/user/fal-key', { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setFalKeyMessage({ type: 'err', text: data?.error || 'Could not remove key.' }); return; }
      setFalKeyStatus({ configured: false, lastFour: null });
      setFalKeyMessage({ type: 'ok', text: 'fal.ai API key removed from your account.' });
    } catch {
      setFalKeyMessage({ type: 'err', text: 'Network error while removing.' });
    } finally {
      setFalRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <DashboardCenterSpinner />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-surface">
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
          keyStatus={openaiKeyStatus}
          keyLoading={openaiKeyLoading}
          keyMessage={openaiKeyMessage}
          newKey={openaiNewKey}
          onNewKeyChange={setOpenaiNewKey}
          saving={openaiSaving}
          removing={openaiRemoving}
          onSave={saveOpenaiKey}
          onRemove={removeOpenaiKey}
        />

        <AccountFalKeyCard
          keyStatus={falKeyStatus}
          keyLoading={falKeyLoading}
          keyMessage={falKeyMessage}
          newKey={falNewKey}
          onNewKeyChange={setFalNewKey}
          saving={falSaving}
          removing={falRemoving}
          onSave={saveFalKey}
          onRemove={removeFalKey}
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
