import { NextRequest } from 'next/server'
import { devLog } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/api/http'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return jsonError('Unauthorized', 401)
    if (!checkRateLimit(`generate-shot:${user.id}`, 15)) return jsonError('Too many requests. Please slow down.', 429)

    const body = await request.json()
    const { productImages, description, style, aspectRatio, numImages, removeMetadata } = body

    devLog('Generate Shot Request:', {
      imageCount: productImages?.length || 0,
      description,
      style,
      aspectRatio,
      numImages,
      removeMetadata
    })

    if (!productImages || productImages.length === 0) {
      return jsonError('At least one product image is required', 400)
    }

    const FAL_KEY = process.env.FAL_API_KEY?.trim()
    if (!FAL_KEY) return jsonError('FAL API key not configured', 500)

    let prompt = description || 'Create a professional product shot'
    if (style) prompt += ` in ${style.toLowerCase()} style`

    const aspectRatioMap: Record<string, string> = { '1:1': '1:1', '9:16': '9:16', '16:9': '16:9', '4:3': '4:3' }

    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_urls: productImages, // Base64 data URIs
        num_images: numImages || 1,
        output_format: "jpeg",
        aspect_ratio: aspectRatioMap[aspectRatio] || undefined
      })
    })

    if (!falResponse.ok) {
      const errorText = await falResponse.text()
      return jsonError('Failed to generate images with AI service', 500)
    }

    const falResult = await falResponse.json()
    devLog('FAL API Success:', falResult)

    return jsonOk({
      requestId: falResult.request_id || `req_${Date.now()}`,
      images: falResult.images || [],
      description: falResult.description || '',
      creditsUsed: 10,
    })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to generate shot', 500)
  }
}