import { NextRequest, NextResponse } from 'next/server';

const DEEPL_API_KEY = '2c211040-4971-47d7-aba8-4a6c86e37dc1:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLang } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // Make request to DeepL API (will auto-detect source language)
    const params: Record<string, string> = {
      text: text,
      target_lang: targetLang,
    };

    // Enable HTML tag handling if the text contains HTML
    if (text.includes('<') && text.includes('>')) {
      params.tag_handling = 'html';
    }

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error:', errorText);
      return NextResponse.json(
        { error: `Translation failed: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const translatedText = result.translations[0].text;

    return NextResponse.json({
      translatedText,
      detectedSourceLang: result.translations[0].detected_source_language,
    });
  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}

