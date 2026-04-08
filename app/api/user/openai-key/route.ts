import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

const MAX_KEY_LENGTH = 512;

function maskLastFour(secret: string): string {
  const t = secret.trim();
  if (t.length === 0) return '****';
  if (t.length <= 4) return '••••';
  return t.slice(-4);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data, error } = await admin
      .from('user_openai_credentials')
      .select('key_last_four')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('openai-key GET:', error);
      return NextResponse.json(
        { error: 'Could not load API key status' },
        { status: 500 },
      );
    }

    const configured = Boolean(data?.key_last_four);
    return NextResponse.json({
      configured,
      lastFour: configured ? data!.key_last_four : null,
    });
  } catch (e) {
    console.error('openai-key GET:', e);
    return NextResponse.json(
      { error: 'Server configuration error (service role or database).' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const apiKey =
      typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 },
      );
    }
    if (apiKey.length > MAX_KEY_LENGTH) {
      return NextResponse.json({ error: 'API key is too long' }, { status: 400 });
    }

    const lastFour = maskLastFour(apiKey);
    const admin = createServiceClient();
    const { error } = await admin.from('user_openai_credentials').upsert(
      {
        user_id: user.id,
        api_key: apiKey,
        key_last_four: lastFour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      console.error('openai-key POST:', error);
      return NextResponse.json(
        { error: 'Could not save API key' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, lastFour });
  } catch (e) {
    console.error('openai-key POST:', e);
    return NextResponse.json(
      { error: 'Server configuration error (service role or database).' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { error } = await admin
      .from('user_openai_credentials')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('openai-key DELETE:', error);
      return NextResponse.json(
        { error: 'Could not remove API key' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('openai-key DELETE:', e);
    return NextResponse.json(
      { error: 'Server configuration error (service role or database).' },
      { status: 500 },
    );
  }
}
