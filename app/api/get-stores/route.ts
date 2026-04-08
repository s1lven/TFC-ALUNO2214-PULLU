import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: stores, error: storesError } = await supabase
      .from('shopify_stores')
      .select(
        'id, user_id, shopify_store_url, store_name, store_alias, connection_status, shopify_client_id, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stores: stores || [],
    });
  } catch (error) {
    console.error('Error in get-stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

