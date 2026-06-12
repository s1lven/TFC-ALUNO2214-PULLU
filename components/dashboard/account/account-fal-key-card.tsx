'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type KeyStatus = { configured: boolean; lastFour: string | null }

type KeyMessage = { type: 'ok' | 'err'; text: string } | null

type Props = {
  keyStatus: KeyStatus | null
  keyLoading: boolean
  keyMessage: KeyMessage
  newKey: string
  onNewKeyChange: (v: string) => void
  saving: boolean
  removing: boolean
  onSave: () => void
  onRemove: () => void
}

export function AccountFalKeyCard({
  keyStatus,
  keyLoading,
  keyMessage,
  newKey,
  onNewKeyChange,
  saving,
  removing,
  onSave,
  onRemove,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">fal.ai API key</h2>
      <p className="text-sm text-gray-600 mb-4">
        AI image generation uses your fal.ai key. The full secret is never shown again after you save—only the last four characters.
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
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Saved key</p>
                <p className="text-xs text-gray-600 mb-2">
                  Only the last four characters are shown here, matching what you saved.
                </p>
                <code className="inline-block text-sm font-mono text-gray-900 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  ••••••••{keyStatus.lastFour ?? '????'}
                </code>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={removing}
                onClick={() => void onRemove()}
              >
                {removing ? 'Removing…' : 'Remove key'}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Replace key</p>
            <p className="text-xs text-gray-500 mb-3">
              Paste a new key and save. Your previous key will be overwritten.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-gray-700 block mb-1" htmlFor="account-fal-replace">
                  New API key
                </label>
                <Input
                  id="account-fal-replace"
                  type="password"
                  autoComplete="off"
                  placeholder="key_…"
                  value={newKey}
                  onChange={(e) => onNewKeyChange(e.target.value)}
                  className="bg-white"
                />
              </div>
              <Button
                type="button"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
                disabled={saving || !newKey.trim()}
                onClick={() => void onSave()}
              >
                {saving ? 'Saving…' : 'Update key'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Add your key below to use AI image generation.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-gray-700 block mb-1">fal.ai API key</label>
              <Input
                type="password"
                autoComplete="off"
                placeholder="key_…"
                value={newKey}
                onChange={(e) => onNewKeyChange(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button
              type="button"
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              disabled={saving || !newKey.trim()}
              onClick={() => void onSave()}
            >
              {saving ? 'Saving…' : 'Save key'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
