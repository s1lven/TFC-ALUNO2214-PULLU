import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, handle, body_html, vendor, images, options, variants, taxable, trackQuantity, collectionIds, storeId, status, published } = body;

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

    // Construct the product data for Shopify
    const productData: { product: { title: string; handle?: string; body_html?: string; vendor: string; product_type: string; status: string; published?: boolean; published_scope: string | null; images: Array<{ src: string; alt: string }>; options?: Array<{ name: string; values: string[] }>; variants?: Array<Record<string, unknown>> } } = {
      product: {
        title,
        handle,
        body_html,
        vendor: vendor || 'Imported',
        product_type: 'Fashion',
        status: status || 'active',
        published: published !== undefined ? published : true,
        published_scope: published ? 'web' : null,
        images: images.map((img: { src: string; alt?: string }) => ({
          src: img.src,
          alt: img.alt || title,
        })),
      },
    };

    // Add options if they exist
    if (options && options.length > 0) {
      productData.product.options = options.map((opt: { name: string; values: string[] }) => ({
        name: opt.name,
        values: opt.values,
      }));

      // Add variants with proper option mapping
      productData.product.variants = variants.map((variant: { price: string; compare_at_price?: string; sku?: string; barcode?: string; inventory_quantity?: number; [key: string]: unknown }) => {
        const variantData: Record<string, unknown> = {
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
      `https://${store.shopify_store_url}/admin/api/2024-01/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': store.shopify_token,
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
      
      console.log('Starting variant image mapping:', {
        originalImagesCount: images.length,
        createdImagesCount: createdImages.length,
        variantsCount: variants.length,
        createdVariantsCount: createdVariants.length,
      });
      
      // Build image ID mapping from original images to created images
      const imageMapping = new Map();
      images.forEach((originalImg: { id?: string; src?: string; [key: string]: unknown }, index: number) => {
        if (createdImages[index]) {
          console.log(`Mapping image: ${originalImg.id} -> ${createdImages[index].id}`);
          imageMapping.set(originalImg.id, createdImages[index].id);
        }
      });

      console.log('Image mapping built:', imageMapping.size, 'mappings');

      // Update variants that should have specific images
      for (let i = 0; i < variants.length; i++) {
        const originalVariant = variants[i];
        const createdVariant = createdVariants[i];
        
        console.log(`Checking variant ${i}:`, {
          hasImageId: !!originalVariant.image_id,
          imageId: originalVariant.image_id,
          hasMapping: originalVariant.image_id ? imageMapping.has(originalVariant.image_id) : false,
        });
        
        if (originalVariant.image_id && imageMapping.has(originalVariant.image_id)) {
          const newImageId = imageMapping.get(originalVariant.image_id);
          
          console.log(`Updating variant ${createdVariant.id} with image ${newImageId}`);
          
          try {
            await fetch(
              `https://${store.shopify_store_url}/admin/api/2024-01/variants/${createdVariant.id}.json`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': store.shopify_token,
                },
                body: JSON.stringify({
                  variant: {
                    id: createdVariant.id,
                    image_id: newImageId,
                  },
                }),
              }
            );
            console.log(`Successfully updated variant ${createdVariant.id} image`);
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to update variant ${createdVariant.id} image:`, error);
          }
        }
      }
    }

    // If collection IDs are provided, add the product to those collections
    if (collectionIds && collectionIds.length > 0 && result.product?.id) {
      for (const collectionId of collectionIds) {
        try {
          const collectResponse = await fetch(
            `https://${store.shopify_store_url}/admin/api/2024-01/collects.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': store.shopify_token,
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
            // Don't fail the whole request if adding to collection fails
          }
        } catch (collectError) {
          console.error(`Error adding product to collection ${collectionId}:`, collectError);
          // Don't fail the whole request if adding to collection fails
        }
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

