import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const { shopify_store_url, shopify_token } = await request.json();

    if (!shopify_store_url || !shopify_token) {
      return NextResponse.json(
        { error: 'Store URL and token are required' },
        { status: 400 }
      );
    }

    // Validate the store credentials and fetch shop info
    let shopName = shopify_store_url.replace('.myshopify.com', '');
    try {
      const testResponse = await fetch(
        `https://${shopify_store_url}/admin/api/2024-01/shop.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopify_token,
          },
        }
      );

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: 'Invalid store credentials. Please check your store URL and access token.' },
          { status: 400 }
        );
      }

      // Get the shop name from the response
      const shopData = await testResponse.json();
      if (shopData.shop && shopData.shop.name) {
        shopName = shopData.shop.name;
      }

      // Check if token has required permissions
      const scopesResponse = await fetch(
        `https://${shopify_store_url}/admin/oauth/access_scopes.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopify_token,
          },
        }
      );

      if (scopesResponse.ok) {
        const scopesData = await scopesResponse.json();
        const grantedScopes = scopesData.access_scopes?.map((scope: { handle: string }) => scope.handle) || [];
        
        // Required scopes for the app to function
        const requiredScopes = [
          'read_products',
          'write_products',
          'read_product_listings',
          'write_product_listings',
          'read_publications',
          'write_publications'
        ];

        // Check if all required scopes are present
        const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope));
        
        if (missingScopes.length > 0) {
          return NextResponse.json(
            { 
              error: `Missing required permissions: ${missingScopes.join(', ')}. Please update your app's API scopes in Shopify.`,
              missingScopes 
            },
            { status: 400 }
          );
        }
      } else {
        // If we can't check scopes, show a warning but don't block
        console.warn('Could not verify API scopes for store');
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to validate store credentials. Please check your store URL and access token.' },
        { status: 400 }
      );
    }

    // Insert the store into the database
    const { data: store, error: insertError } = await supabase
      .from('shopify_stores')
      .insert({
        user_id: user.id,
        shopify_store_url,
        shopify_token,
        store_name: shopName,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting store:', insertError);
      return NextResponse.json(
        { error: 'Failed to add store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store,
    });
  } catch (error) {
    console.error('Error in add-store:', error);
    return NextResponse.json(
      { error: 'Failed to add store' },
      { status: 500 }
    );
  }
}

