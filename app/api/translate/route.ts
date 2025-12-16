import { NextRequest, NextResponse } from 'next/server';

// DeepL API (commented out - now using OpenAI)
// const DEEPL_API_KEY = '2c211040-4971-47d7-aba8-4a6c86e37dc1:fx';
// const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const languageMap: Record<string, string> = {
  'EN-US': 'English',
  'ES': 'Spanish',
  'FR': 'French',
  'DE': 'German',
  'IT': 'Italian',
  'PT-PT': 'Portuguese',
  'NL': 'Dutch',
  'PL': 'Polish',
  'RU': 'Russian',
  'JA': 'Japanese',
  'ZH': 'Chinese',
  'KO': 'Korean',
  'SV': 'Swedish',
  'DA': 'Danish',
  'FI': 'Finnish',
  'NO': 'Norwegian',
  'CS': 'Czech',
  'EL': 'Greek',
  'HU': 'Hungarian',
  'RO': 'Romanian',
  'SK': 'Slovak',
  'BG': 'Bulgarian',
  'TR': 'Turkish',
  'ID': 'Indonesian',
  'UK': 'Ukrainian',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, targetLang, enhancementPrompt } = body;

    if (!productData || !targetLang) {
      return NextResponse.json(
        { error: 'Product data and target language are required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const targetLanguageName = languageMap[targetLang] || targetLang;

    // Build the system prompt
    let systemPrompt = `You are a professional e-commerce translator and copywriter. Your task is to translate product information to ${targetLanguageName}.

IMPORTANT RULES:
1. Preserve HTML tags exactly - only translate text content between tags
2. Maintain the JSON structure exactly as provided
3. Use context from the entire product to make accurate translations (e.g., "negro" in Spanish context)
4. Keep brand names, measurements, and technical terms appropriate for the target market
5. Return ONLY valid JSON, no additional text`;
    
    if (enhancementPrompt) {
      systemPrompt += `\n6. Apply this enhancement to the title and description: ${enhancementPrompt}`;
    }

    // Build the input JSON structure
    const inputData = {
      title: productData.title,
      description: productData.description,
      options: productData.options?.map((opt: { name: string; values: string[] }) => ({
        name: opt.name,
        values: opt.values
      }))
    };

    const userPrompt = `Translate this product data to ${targetLanguageName}. Return the exact same JSON structure with translated values:

${JSON.stringify(inputData, null, 2)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return NextResponse.json(
        { error: `Translation failed: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const translatedData = JSON.parse(result.choices[0].message.content);

    return NextResponse.json({
      translatedData,
      detectedSourceLang: 'auto',
    });

    /* DeepL implementation (commented out)
    const params: Record<string, string> = {
      text: text,
      target_lang: targetLang,
    };

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
    */
  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}

