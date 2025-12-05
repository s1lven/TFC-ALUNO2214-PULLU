import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to create collection only
async function createCollectionOnly(collectionData: any, shopifyStoreUrl: string, shopifyToken: string) {
  const collection = {
    title: collectionData.title,
    handle: collectionData.handle,
    body_html: collectionData.body_html || '',
    sort_order: collectionData.sort_order || 'manual',
    published: collectionData.published_at ? true : false,
  };

  console.log('Creating collection in Shopify:', collection.title);

  const response = await fetch(`https://${shopifyStoreUrl}/admin/api/2024-01/custom_collections.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyToken,
    },
    body: JSON.stringify({
      custom_collection: collection,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Shopify API error:', errorData);
    throw new Error(`Shopify API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return NextResponse.json({
    success: true,
    collection: result.custom_collection,
  });
}

// EXACT COPY OF SINGLE PRODUCT IMPORT LOGIC
async function importSingleProduct(product: any, collectionId: string, shopifyStoreUrl: string, shopifyToken: string) {
  try {
    const { title, handle, body_html, images, options, variants } = product;
    const taxable = false;
    const trackQuantity = false;

    // Construct the product data for Shopify
    const productData: any = {
      product: {
        title,
        handle,
        body_html,
        vendor: 'Imported',
        product_type: 'Fashion',
        status: 'active', // Publish product automatically
        published_scope: 'web', // Make it available on all sales channels
        images: images.map((img: any) => ({
          src: img.src,
          alt: img.alt || title,
        })),
      },
    };

    // Add options if they exist
    if (options && options.length > 0) {
      productData.product.options = options.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      }));

      // Add variants with proper option mapping
      productData.product.variants = variants.map((variant: any) => {
        const variantData: any = {
          price: variant.price,
          compare_at_price: variant.compare_at_price || null,
          sku: variant.sku || '',
          barcode: variant.barcode || '',
          inventory_quantity: variant.inventory_quantity || 0,
          inventory_policy: variant.inventory_policy || 'deny',
          weight: variant.grams || 0,
          weight_unit: 'g',
          taxable: variant.taxable || false,
          inventory_management: trackQuantity ? 'shopify' : null,
        };

        // Map option values to the variant
        if (options.length === 1 && variant.option1) {
          variantData.option1 = variant.option1;
        } else if (options.length === 2) {
          if (variant.option1) variantData.option1 = variant.option1;
          if (variant.option2) variantData.option2 = variant.option2;
        } else if (options.length === 3) {
          if (variant.option1) variantData.option1 = variant.option1;
          if (variant.option2) variantData.option2 = variant.option2;
          if (variant.option3) variantData.option3 = variant.option3;
        }

        return variantData;
      });
    } else {
      // If no options, just add a single variant
      productData.product.variants = [
        {
          price: variants?.[0]?.price || '0.00',
          compare_at_price: variants?.[0]?.compare_at_price || null,
          sku: variants?.[0]?.sku || '',
          barcode: variants?.[0]?.barcode || '',
          inventory_quantity: variants?.[0]?.inventory_quantity || 0,
          inventory_policy: variants?.[0]?.inventory_policy || 'deny',
          weight: variants?.[0]?.grams || 0,
          weight_unit: 'g',
          taxable: taxable || false,
          inventory_management: trackQuantity ? 'shopify' : null,
        },
      ];
    }

    // Make request to Shopify API
    const shopifyResponse = await fetch(
      `https://${shopifyStoreUrl}/admin/api/2024-01/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopifyToken,
        },
        body: JSON.stringify(productData),
      }
    );

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { error: `Shopify API error: ${errorText}` },
        { status: shopifyResponse.status }
      );
    }

    const result = await shopifyResponse.json();

    // Update variant images if needed (Shopify needs a second call after product creation)
    if (result.product?.id && result.product?.variants && result.product?.images) {
      const createdImages = result.product.images;
      const createdVariants = result.product.variants;
      
      // Build image ID mapping from original images to created images
      const imageMapping = new Map();
      images.forEach((originalImg: any, index: number) => {
        if (createdImages[index]) {
          imageMapping.set(originalImg.id, createdImages[index].id);
        }
      });

      // Update variants that should have specific images
      for (let i = 0; i < variants.length; i++) {
        const originalVariant = variants[i];
        const createdVariant = createdVariants[i];
        
        if (originalVariant.image_id && imageMapping.has(originalVariant.image_id)) {
          const newImageId = imageMapping.get(originalVariant.image_id);
          
          try {
            await fetch(
              `https://${shopifyStoreUrl}/admin/api/2024-01/variants/${createdVariant.id}.json`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': shopifyToken,
                },
                body: JSON.stringify({
                  variant: {
                    id: createdVariant.id,
                    image_id: newImageId,
                  },
                }),
              }
            );
          } catch (error) {
            console.error(`Failed to update variant ${createdVariant.id} image:`, error);
          }
        }
      }
    }

    // Add product to collection
    if (result.product?.id) {
      try {
        const collectResponse = await fetch(
          `https://${shopifyStoreUrl}/admin/api/2024-01/collects.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': shopifyToken,
            },
            body: JSON.stringify({
              collect: {
                product_id: result.product.id,
                collection_id: parseInt(collectionId),
              },
            }),
          }
        );

        if (!collectResponse.ok) {
          const errorText = await collectResponse.text();
          console.error(`Failed to add product to collection ${collectionId}:`, errorText);
        }
      } catch (collectError) {
        console.error(`Error adding product to collection ${collectionId}:`, collectError);
      }
    }

    return NextResponse.json({
      success: true,
      product: result.product,
    });
  } catch (error) {
    console.error('Error adding product to Shopify:', error);
    return NextResponse.json(
      { error: 'Failed to add product to Shopify store' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { storeId } = requestData;

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch store credentials
    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Handle product-only import (for progress tracking)
    if (requestData.productOnly) {
      return await importSingleProduct(
        requestData.product, 
        requestData.collectionId, 
        store.shopify_store_url, 
        store.shopify_token
      );
    }

    // Handle collection-only creation (for progress tracking)
    if (requestData.collectionOnly) {
      return await createCollectionOnly(
        requestData, 
        store.shopify_store_url, 
        store.shopify_token
      );
    }

    // Handle full collection import (legacy - not used anymore)
    return NextResponse.json({ error: 'Use batch import instead' }, { status: 400 });

  } catch (error) {
    console.error('Collection import error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to import collection: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
