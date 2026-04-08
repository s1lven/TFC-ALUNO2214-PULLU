import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveOpenAiApiKeyForUser } from '@/lib/openai/user-api-key';

// DeepL API (commented out - now using OpenAI)
// const DEEPL_API_KEY = '2c211040-4971-47d7-aba8-4a6c86e37dc1:fx';
// const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const OPENAI_API_KEY = await resolveOpenAiApiKeyForUser(user.id);
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Add your OpenAI API key in Account settings to use translation.',
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { productData, targetLang, enhancementPrompt } = body;

    if (!productData || !targetLang) {
      return NextResponse.json(
        { error: 'Product data and target language are required' },
        { status: 400 }
      );
    }

    const targetLanguageName = languageMap[targetLang] || targetLang;

    // Build the system prompt
    let systemPrompt = `You are a professional e-commerce translator. Translate ALL text to ${targetLanguageName}.

RULES:
1. Preserve HTML tags exactly — only translate the text content between tags.
2. Return the EXACT same JSON structure (same keys, same nesting).
3. Translate EVERY text value without exception, including option names and option values:
   - Colors: Green→Verde, Red→Rojo, Blue→Azul, Black→Negro, White→Blanco, etc.
   - Sizes: Small→Pequeño, Large→Grande, Medium→Mediano, etc.
   - Materials: Cotton→Algodón, Leather→Cuero, etc.
   - Option names: Color→Color, Size→Talla/Tamaño, Material→Material, etc.
4. Keep numeric values, SKUs, and URLs unchanged.
5. Return ONLY valid JSON — no markdown, no code fences, no extra text.`;

    if (enhancementPrompt) {
      systemPrompt += `\n6. Also apply this enhancement to the title and description: ${enhancementPrompt}`;
    }

    // Build the input JSON structure
    const inputData = {
      title: productData.title,
      description: productData.description,
      options: productData.options?.map((opt: { name: string; values: string[] }) => ({
        name: opt.name,
        values: opt.values,
      })),
    };

    const userPrompt = `Translate ALL text values to ${targetLanguageName}. Return the exact same JSON structure:

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
    let translatedData = JSON.parse(result.choices[0].message.content);

    // GPT sometimes wraps in a single root key — unwrap to get the expected shape.
    const keys = Object.keys(translatedData);
    if (
      keys.length === 1 &&
      !('title' in translatedData) &&
      typeof translatedData[keys[0]] === 'object'
    ) {
      translatedData = translatedData[keys[0]];
    }

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

