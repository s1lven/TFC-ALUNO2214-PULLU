'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelFreeIcons, SparklesFreeIcons } from '@hugeicons/core-free-icons';
import {
  FAL_MODELS, type ImageModel,
  ASPECT_RATIOS, IMAGE_SIZES, RESOLUTIONS, QUALITIES,
} from '@/lib/fal/models';
import { NotificationBanner } from '@/components/dashboard/ui/notification-banner';

type ProductImage = { src: string; [key: string]: unknown };
type GeneratedImage = { url: string };

type Props = {
  productImages: ProductImage[];
  onImagesAdded: (images: Array<{ id: number; src: string; position: number; alt: string }>) => void;
  currentImageCount: number;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export default function ImageGenerator({ productImages, onImagesAdded, currentImageCount, onClose, onSuccess }: Props) {
  const [selectedModelId, setSelectedModelId] = React.useState<string>('nano-banana-2');
  const [prompt, setPrompt] = React.useState('');
  const [aspectRatio, setAspectRatio] = React.useState('auto');
  const [resolution, setResolution] = React.useState('1K');
  const [imageSize, setImageSize] = React.useState('auto');
  const [quality, setQuality] = React.useState('high');
  const [style, setStyle] = React.useState('auto');
  const [numImages, setNumImages] = React.useState(1);
  const [selectedImageIndices, setSelectedImageIndices] = React.useState<number[]>(
    productImages.length > 0 ? [0] : [],
  );
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const model = FAL_MODELS.find((m) => m.id === selectedModelId) as ImageModel;

  const toggleImage = (index: number) => {
    if (!model.usesImageArray) {
      setSelectedImageIndices([index]);
    } else {
      setSelectedImageIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    }
  };

  const canGenerate = prompt.trim().length > 0 && (!model.requiresImage || selectedImageIndices.length > 0);

  const generate = async () => {
    if (!canGenerate) return;
    setError(null);
    setGenerating(true);

    try {
      const selectedImages = selectedImageIndices.map((i) => productImages[i]?.src).filter(Boolean);

      const res = await fetch('/api/generate-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModelId,
          prompt: prompt.trim(),
          productImages: selectedImages,
          aspectRatio: model.supportsAspectRatio ? aspectRatio : undefined,
          resolution: model.supportsResolution ? resolution : undefined,
          imageSize: model.supportsImageSize ? imageSize : undefined,
          quality: model.supportsQuality ? quality : undefined,
          style: model.supportsStyle ? style : undefined,
          numImages: model.supportsNumImages ? numImages : 1,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || 'Generation failed. Please try again.');
        return;
      }

      const imgs: GeneratedImage[] = data.images || [];
      if (imgs.length > 0) {
        onImagesAdded(
          imgs.map((img, i) => ({
            id: Date.now() + i,
            src: img.url,
            position: currentImageCount + i + 1,
            alt: 'AI Generated',
          })),
        );
        onSuccess(`${imgs.length} AI image${imgs.length > 1 ? 's' : ''} added to your product!`);
        onClose();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesFreeIcons} size={18} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-gray-900">AI Image Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 rounded-md p-1 transition-colors">
            <HugeiconsIcon icon={CancelFreeIcons} size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

          {/* Model dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => {
                setSelectedModelId(e.target.value);
                setError(null);
                const next = FAL_MODELS.find((m) => m.id === e.target.value);
                if (next && !next.usesImageArray && productImages.length > 0) setSelectedImageIndices([0]);
              }}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2.5 outline-none "
            >
              {FAL_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Source image selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              {model.usesImageArray ? 'Source images' : 'Source image'}
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              {model.usesImageArray
                ? 'Select one or more product images to edit'
                : 'Select the product image to edit'}
            </p>
            {productImages.length === 0 ? (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                No product images yet. Add images to the product first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleImage(i)}
                    className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndices.includes(i)
                        ? 'border-brand ring-1 ring-brand'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.src} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedImageIndices.includes(i) && (
                      <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPlaceholder(model.id)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none outline-none  placeholder:text-gray-400"
            />
          </div>

          {/* ── Model-specific options ── */}

          {/* Aspect ratio — Nano Banana 2 & Pro */}
          {model.supportsAspectRatio && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Aspect ratio</label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      aspectRatio === r.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image size — GPT Image 2 */}
          {model.supportsImageSize && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Image size</label>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setImageSize(s.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      imageSize === s.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Num images — Nano Banana + GPT Image 2 */}
          {model.supportsNumImages && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Images to generate</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumImages(n)}
                    className={`w-9 h-9 text-xs rounded-md border font-medium transition-colors ${
                      numImages === n
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resolution — Nano Banana 2 & Pro */}
          {model.supportsResolution && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Resolution</label>
              <div className="flex gap-1.5">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={`px-4 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      resolution === r
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {resolution === '4K' && (
                <p className="text-[11px] text-amber-600 mt-1.5">4K is billed at 2× cost</p>
              )}
            </div>
          )}

          {/* Quality — GPT Image 2 */}
          {model.supportsQuality && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Quality</label>
              <div className="flex flex-wrap gap-1.5">
                {QUALITIES.map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => setQuality(q.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      quality === q.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Style — Ideogram */}
          {model.supportsStyle && model.styleOptions && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Style</label>
              <div className="flex flex-wrap gap-1.5">
                {model.styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStyle(opt.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      style === opt.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <NotificationBanner type="error" message={error} onDismiss={() => setError(null)} autoHideMs={0} />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 shrink-0">
          <Button
            onClick={generate}
            disabled={generating || !canGenerate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm font-medium disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={SparklesFreeIcons} size={16} />
                Generate
              </span>
            )}
          </Button>
          {model.requiresImage && selectedImageIndices.length === 0 && (
            <p className="text-xs text-center text-gray-400 mt-2">Select a source image above to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(modelId: string): string {
  switch (modelId) {
    case 'nano-banana-2':
      return 'e.g. Place this product on a marble table with soft studio lighting';
    case 'nano-banana-pro':
      return 'e.g. Same product on a tropical beach at golden hour, luxury lifestyle shot';
    case 'gpt-image-2':
      return 'e.g. Transform background to a minimalist white studio, keep product exactly as is';
    case 'ideogram-v2-edit':
      return 'e.g. Reimagine as a high-end 3D render with dramatic product lighting';
    default:
      return 'Describe the edit you want to apply to this product image…';
  }
}
