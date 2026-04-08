'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type KeyStatus = { configured: boolean; lastFour: string | null };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [keyLoading, setKeyLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [keyMessage, setKeyMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const supabase = createClient();

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
      <div className="min-h-full p-8 flex items-center justify-center" style={{ backgroundColor: '#F1F5F2' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8" style={{ backgroundColor: '#F1F5F2' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h1>
          <p className="text-gray-600 text-sm">Manage your account information</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-1">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {user?.created_at ? (
                  <>
                    Member since{' '}
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </>
                ) : (
                  'Member'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">OpenAI API key</h2>
          <p className="text-sm text-gray-600 mb-4">
            AI translation and text enhancement use your key. The full secret is never shown again after you
            save—only the last four characters.
          </p>

          {keyMessage ? (
            <div
              className={`mb-4 text-sm rounded-lg px-3 py-2 ${
                keyMessage.type === 'ok'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {keyMessage.text}
            </div>
          ) : null}

          {keyLoading ? (
            <p className="text-sm text-gray-500">Loading key status…</p>
          ) : keyStatus?.configured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700">Active key:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  ••••••••{keyStatus.lastFour ?? '????'}
                </code>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={removing} onClick={() => void removeKey()}>
                  {removing ? 'Removing…' : 'Remove key'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                To replace the key, paste a new one below and save. Your previous key will be overwritten.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-gray-700 block mb-1">New key (optional)</label>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="sk-…"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <Button
                  type="button"
                  className="bg-neutral-900 text-white hover:bg-neutral-800"
                  disabled={saving || !newKey.trim()}
                  onClick={() => void saveKey()}
                >
                  {saving ? 'Saving…' : 'Update key'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add your key below to use AI translation and enhancement.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-gray-700 block mb-1">OpenAI API key</label>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="sk-…"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <Button
                  type="button"
                  className="bg-neutral-900 text-white hover:bg-neutral-800"
                  disabled={saving || !newKey.trim()}
                  onClick={() => void saveKey()}
                >
                  {saving ? 'Saving…' : 'Save key'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
