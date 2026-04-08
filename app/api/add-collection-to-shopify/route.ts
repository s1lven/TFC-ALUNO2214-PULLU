import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';
import {
  matchCreatedVariantsToOriginals,
  resolveVariantSourceImageId,
} from '@/lib/shopify/variant-images';

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

    // Create product via REST API with retry/backoff on 429
    let shopifyResponse: Response | null = null;
    let createDelay = 1000;
    for (let attempt = 0; attempt < 5; attempt++) {
      shopifyResponse = await fetch(
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
      if (shopifyResponse.status === 429) {
        await new Promise((r) => setTimeout(r, createDelay));
        createDelay *= 2;
        continue;
      }
      break;
    }

    if (!shopifyResponse || !shopifyResponse.ok) {
      const errorText = await shopifyResponse?.text();
      console.error('Shopify API error:', errorText);
      return NextResponse.json(
        { success: false, error: `Shopify API error: ${errorText}` },
        { status: shopifyResponse?.status ?? 500 }
      );
    }

    const result = await shopifyResponse.json();
    const createdProduct = result.product;

    // Update variant images (Admin API requires PUT after create).
    // Strategy:
    //   1. Map originalImage[i].id → createdImage[i].id by index (Shopify preserves upload order).
    //   2. Use image.variant_ids from the scraped JSON to know which variants belong to which image.
    //   3. Fall back to featured_image.id on the variant if variant_ids is absent.
    const originalVariantsList = (variants ?? []) as Record<string, unknown>[];
    if (
      createdProduct?.id &&
      createdProduct?.variants &&
      createdProduct?.images &&
      product.images?.length &&
      originalVariantsList.length > 0
    ) {
      const createdImages = createdProduct.images as Array<{ id: number; src?: string }>;
      const createdVariants = createdProduct.variants as Record<string, unknown>[];
      const originalImages = product.images as Array<{
        id?: unknown;
        src?: string;
        variant_ids?: number[];
      }>;

      // Step 1: index-based image ID mapping (most reliable — no URL parsing needed)
      const indexImageMap = new Map<string, number>(); // originalImageId → newImageId
      for (let i = 0; i < originalImages.length; i++) {
        const orig = originalImages[i];
        const created = createdImages[i];
        if (orig?.id != null && created?.id != null) {
          indexImageMap.set(String(orig.id), Number(created.id));
        }
      }

      // Step 2: build originalVariantId → newImageId via image.variant_ids
      const variantToImageMap = new Map<string, number>();
      for (const img of originalImages) {
        if (!img.id || !img.variant_ids?.length) continue;
        const newImageId = indexImageMap.get(String(img.id));
        if (!newImageId) continue;
        for (const vid of img.variant_ids) {
          variantToImageMap.set(String(vid), newImageId);
        }
      }

      const pairedCreated = matchCreatedVariantsToOriginals(originalVariantsList, createdVariants);

      // Group variants by their target image so we do ONE PUT per image instead of
      // one PUT per variant — dramatically fewer API calls and no rate-limit issues.
      const imageToVariantsMap = new Map<number, number[]>(); // newImageId → [newVariantIds]

      for (let i = 0; i < originalVariantsList.length; i++) {
        const originalVariant = originalVariantsList[i];
        const createdVariant = pairedCreated[i];
        if (!createdVariant?.id) continue;

        // Primary: variant_ids from the images array
        let newImageId = variantToImageMap.get(String(originalVariant.id));

        // Fallback 1: featured_image.id on the variant
        if (!newImageId) {
          const sourceImageId = resolveVariantSourceImageId(originalVariant);
          if (sourceImageId) newImageId = indexImageMap.get(sourceImageId);
        }

        // Fallback 2: product-level images → use first image so every variant gets something
        if (!newImageId && createdImages.length > 0) {
          newImageId = Number(createdImages[0].id);
        }

        if (!newImageId) continue;

        const bucket = imageToVariantsMap.get(newImageId) ?? [];
        bucket.push(Number(createdVariant.id));
        imageToVariantsMap.set(newImageId, bucket);
      }

      // One PUT per image with retry/backoff on 429 (Shopify: 2 req/s)
      for (const [imgId, variantIds] of imageToVariantsMap) {
        let delay = 700;
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const putResponse = await fetch(
              `https://${shopifyStoreUrl}/admin/api/2024-01/products/${createdProduct.id}/images/${imgId}.json`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': shopifyToken,
                },
                body: JSON.stringify({ image: { id: imgId, variant_ids: variantIds } }),
              },
            );
            if (putResponse.status === 429) {
              await new Promise((r) => setTimeout(r, delay));
              delay *= 2;
              continue;
            }
            if (!putResponse.ok) {
              const errText = await putResponse.text();
              console.error(`Image ${imgId} variant assignment failed:`, errText);
            }
            break;
          } catch (error) {
            console.error(`Failed to assign variants to image ${imgId}:`, error);
            break;
          }
        }
        // Respect Shopify's 2 req/s limit between image updates
        await new Promise((r) => setTimeout(r, 600));
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

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) {
      return NextResponse.json({ error: STORE_NOT_CONNECTED_MESSAGE }, { status: 400 });
    }

    // Handle product-only import (for progress tracking)
    if (requestData.productOnly) {
      return await importSingleProduct(
        requestData.product, 
        requestData.collectionId, 
        store.shopify_store_url, 
        accessToken
      );
    }

    // Handle collection-only creation (for progress tracking)
    if (requestData.collectionOnly) {
      return await createCollectionOnly(
        requestData, 
        store.shopify_store_url, 
        accessToken
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
