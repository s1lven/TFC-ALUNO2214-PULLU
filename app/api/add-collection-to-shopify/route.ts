import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to make GraphQL requests to Shopify
async function shopifyGraphQL(shopifyStoreUrl: string, shopifyToken: string, query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(`https://${shopifyStoreUrl}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed: ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

// Helper function to create collection only using GraphQL
async function createCollectionOnly(collectionData: { title: string; handle?: string; description?: string; [key: string]: unknown }, shopifyStoreUrl: string, shopifyToken: string) {
  console.log('Creating collection in Shopify:', collectionData.title);

  const mutation = `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
          handle
          legacyResourceId
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title: collectionData.title,
      handle: collectionData.handle,
      descriptionHtml: collectionData.body_html || ''
      // Don't include ruleSet - this makes it a manual collection
    }
  };

  const data = await shopifyGraphQL(shopifyStoreUrl, shopifyToken, mutation, variables);

  if (data.collectionCreate.userErrors.length > 0) {
    throw new Error(`Collection creation errors: ${JSON.stringify(data.collectionCreate.userErrors)}`);
  }

  const collection = data.collectionCreate.collection;
  return NextResponse.json({
    success: true,
    collection: {
      id: collection.legacyResourceId,
      title: collection.title,
      handle: collection.handle,
      gid: collection.id
    },
  });
}

// Helper function to import single product using REST API (simpler for products with variants)
async function importSingleProduct(product: { title: string; handle?: string; body_html?: string; images?: Array<{ src: string; alt?: string }>; options?: Array<{ name: string; values: string[] }>; variants?: Array<{ price: string; compare_at_price?: string; sku?: string; barcode?: string; inventory_quantity?: number; featured_image?: { id: string }; image_id?: string; [key: string]: unknown }>; [key: string]: unknown }, collectionGid: string, shopifyStoreUrl: string, shopifyToken: string) {
  try {
    const { title, handle, body_html, images, options, variants } = product;

    // Extract image IDs from variants (scraped data has featured_image.id, not image_id)
    const variantsWithImageIds = variants?.map((variant: { featured_image?: { id: string }; image_id?: string; [key: string]: unknown }) => ({
      ...variant,
      image_id: variant.featured_image?.id || variant.image_id || null
    }));

    // Use REST API for product creation (more reliable for variants)
    const productData: { product: { title: string; handle?: string; body_html?: string; vendor: string; product_type: string; status: string; published_scope: string; images: Array<{ src: string; alt: string }>; options?: Array<{ name: string; values: string[] }>; variants?: Array<Record<string, unknown>> } } = {
      product: {
        title,
        handle,
        body_html,
        vendor: 'Imported',
        product_type: 'Fashion',
        status: 'active',
        published_scope: 'web',
        images: images?.map((img: { src: string; alt?: string }) => ({
          src: img.src,
          alt: img.alt || title,
        })) || [],
      },
    };

    // Add options if they exist
    if (options && options.length > 0) {
      productData.product.options = options.map((opt: { name: string; values: string[] }) => ({
        name: opt.name,
        values: opt.values,
      }));

      // Add variants with proper option mapping
      productData.product.variants = variants?.map((variant: { price: string; compare_at_price?: string; sku?: string; barcode?: string; inventory_quantity?: number; [key: string]: unknown }) => {
        const variantData: Record<string, unknown> = {
          price: variant.price,
          compare_at_price: variant.compare_at_price || null,
          sku: variant.sku || '',
          barcode: variant.barcode || '',
          inventory_quantity: variant.inventory_quantity || 0,
          inventory_policy: 'continue',
          weight: variant.grams || 0,
          weight_unit: 'g',
          taxable: variant.taxable || false,
          inventory_management: null,
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
    }

    // Create product via REST API
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
        { success: false, error: `Shopify API error: ${errorText}` },
        { status: shopifyResponse.status }
      );
    }

    const result = await shopifyResponse.json();
    const createdProduct = result.product;

    // Update variant images if needed (Shopify needs a second call after product creation)
    if (createdProduct?.id && createdProduct?.variants && createdProduct?.images && product.images && variantsWithImageIds) {
      const createdImages = createdProduct.images;
      const createdVariants = createdProduct.variants;
      const originalImages = product.images;
      const originalVariants = variantsWithImageIds || []; // Use the processed variants with image_id
      
      console.log('Starting variant image mapping:', {
        originalImagesCount: originalImages?.length || 0,
        createdImagesCount: createdImages?.length || 0,
        variantsCount: originalVariants.length,
        createdVariantsCount: createdVariants?.length || 0,
      });

      // DEBUG: Log a sample original variant to see its structure
      if (originalVariants.length > 0) {
        const firstVariant = originalVariants[0] as { image_id?: string | null; featured_image?: { id: string }; [key: string]: unknown };
        console.log('Sample original variant with extracted image_id:', {
          image_id: firstVariant.image_id,
          featured_image_id: firstVariant.featured_image?.id
        });
      }
      
      // Build image ID mapping from original images to created images
      const imageMapping = new Map();
      originalImages.forEach((originalImg: { id?: string; src?: string; [key: string]: unknown }, index: number) => {
        if (createdImages[index]) {
          console.log(`Mapping image: ${originalImg.id} -> ${createdImages[index].id}`);
          imageMapping.set(originalImg.id, createdImages[index].id);
        }
      });

      console.log('Image mapping built:', imageMapping.size, 'mappings');

      // Update variants that should have specific images
      for (let i = 0; i < originalVariants.length; i++) {
        const originalVariant = originalVariants[i];
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
            console.log(`Successfully updated variant ${createdVariant.id} image`);
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to update variant ${createdVariant.id} image:`, error);
          }
        }
      }
    }

    // Add product to collection using GraphQL (more efficient)
    if (createdProduct && collectionGid) {
      try {
        const productGid = `gid://shopify/Product/${createdProduct.id}`;
        const addToCollectionMutation = `
          mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
            collectionAddProducts(id: $id, productIds: $productIds) {
              collection {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        await shopifyGraphQL(shopifyStoreUrl, shopifyToken, addToCollectionMutation, {
          id: collectionGid,
          productIds: [productGid]
        });
      } catch (error) {
        console.error('Error adding product to collection:', error);
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: createdProduct.id,
        title: createdProduct.title
      },
    });
  } catch (error) {
    console.error('Error adding product to Shopify:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add product' },
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
