import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Extract the form data
    const {
      productImages,
      description,
      style,
      aspectRatio,
      numImages,
      removeMetadata
    } = body

    // Log the received data for debugging
    console.log('Generate Shot Request:', {
      imageCount: productImages?.length || 0,
      description,
      style,
      aspectRatio,
      numImages,
      removeMetadata
    })

    // Validate required fields
    if (!productImages || productImages.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one product image is required'
      }, { status: 400 })
    }

    // Hardcoded API key for now (replace with your actual key)
    const FAL_KEY = "4d636fee-a89a-4b45-8e43-2cb32649f691:8992a884808a68aeacf830248078d420"
    
    if (!FAL_KEY || FAL_KEY === "YOUR_FAL_API_KEY_HERE") {
      return NextResponse.json({
        success: false,
        message: 'FAL API key not configured'
      }, { status: 500 })
    }

    // Prepare the prompt
    let prompt = description || "Create a professional product shot"
    if (style) {
      prompt += ` in ${style.toLowerCase()} style`
    }

    // Map aspect ratio to fal.ai format
    const aspectRatioMap: { [key: string]: string } = {
      '1:1': '1:1',
      '9:16': '9:16', 
      '16:9': '16:9',
      '4:3': '4:3'
    }

    // Call fal.ai nano-banana API
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
      console.error('FAL API Error:', errorText)
      return NextResponse.json({
        success: false,
        message: 'Failed to generate images with AI service',
        error: errorText
      }, { status: 500 })
    }

    const falResult = await falResponse.json()
    
    console.log('FAL API Success:', falResult)

    // Return success response with generated images
    return NextResponse.json({
      success: true,
      message: 'Images generated successfully',
      data: {
        requestId: falResult.request_id || `req_${Date.now()}`,
        images: falResult.images || [],
        description: falResult.description || '',
        creditsUsed: 10
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Generate Shot API Error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to generate shot',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}