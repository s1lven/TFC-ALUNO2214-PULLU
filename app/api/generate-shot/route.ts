import { NextRequest } from 'next/server'
import { devLog } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api/http'
import { checkRateLimit } from '@/lib/rate-limit'
import { resolveFalApiKeyForUser } from '@/lib/fal/user-api-key'
import { getModelById } from '@/lib/fal/models'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return jsonError('Unauthorized', 401)
    if (!checkRateLimit(`generate-shot:${user.id}`, 15)) return jsonError('Too many requests. Please slow down.', 429)

    const body = await request.json()
    const { modelId, productImages, prompt, aspectRatio, resolution, imageSize, quality, style, numImages } = body

    if (!prompt?.trim()) return jsonError('A prompt is required', 400)

    const model = getModelById(modelId ?? 'nano-banana-2')
    if (!model) return jsonError('Unknown model', 400)

    if (model.requiresImage && (!productImages || productImages.length === 0)) {
      return jsonError('At least one product image is required', 400)
    }

    let falKey = await resolveFalApiKeyForUser(user.id)
    if (!falKey) falKey = process.env.FAL_API_KEY?.trim() ?? null
    if (!falKey) return jsonError('No fal.ai API key configured. Add your key in Account Settings.', 400)

    devLog('Generate Shot Request:', { modelId: model.id })

    const input = buildInput(model.id, prompt.trim(), productImages, {
      aspectRatio, resolution, imageSize, quality, style,
      numImages: Math.max(1, Math.min(4, parseInt(String(numImages)) || 1)),
    })

    const falResponse = await fetch(`https://fal.run/${model.endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${falKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!falResponse.ok) {
      const errorText = await falResponse.text()
      devLog('FAL API Error:', errorText)
      return jsonError('Failed to generate image. Check your fal.ai key and try again.', 500)
    }

    const falResult = await falResponse.json()
    devLog('FAL API Success:', falResult)

    const images = (falResult.images || [])
      .map((img: { url?: string }) => ({ url: img.url || '' }))
      .filter((img: { url: string }) => img.url)

    return jsonOk({ images, requestId: falResult.request_id || `req_${Date.now()}` })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to generate shot', 500)
  }
}

type Opts = {
  aspectRatio?: string
  resolution?: string
  imageSize?: string
  quality?: string
  style?: string
  numImages: number
}

function buildInput(
  modelId: string,
  prompt: string,
  images: string[] | undefined,
  opts: Opts,
): Record<string, unknown> {
  const { aspectRatio, resolution, imageSize, quality, style, numImages } = opts

  switch (modelId) {
    case 'nano-banana-2':
      return {
        prompt,
        image_urls: images,
        num_images: numImages,
        ...(aspectRatio && aspectRatio !== 'auto' ? { aspect_ratio: aspectRatio } : {}),
        ...(resolution ? { resolution } : {}),
        output_format: 'jpeg',
      }

    case 'nano-banana-pro':
      return {
        prompt,
        image_urls: images,
        num_images: numImages,
        ...(aspectRatio && aspectRatio !== 'auto' ? { aspect_ratio: aspectRatio } : {}),
        ...(resolution ? { resolution } : {}),
        output_format: 'jpeg',
      }

    case 'gpt-image-2':
      return {
        prompt,
        image_urls: images,
        num_images: numImages,
        ...(imageSize ? { image_size: imageSize } : {}),
        ...(quality ? { quality } : {}),
        output_format: 'jpeg',
      }

    case 'ideogram-v2-edit':
      return {
        prompt,
        image_url: images?.[0],
        ...(style && style !== 'auto' ? { style } : {}),
        expand_prompt: true,
      }

    default:
      return { prompt, image_urls: images }
  }
}
