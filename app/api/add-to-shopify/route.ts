import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getShopifyAccessTokenForApi, STORE_NOT_CONNECTED_MESSAGE } from '@/lib/shopify/store-access';
import { jsonError, jsonOk } from '@/lib/api/http';
import { checkRateLimit } from '@/lib/rate-limit';
import { devLog } from '@/lib/logger';
import {
  buildScrapedToCreatedImageIdMap,
  matchCreatedVariantsToOriginals,
  resolveVariantSourceImageId,
} from '@/lib/shopify/variant-images';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, handle, body_html, vendor, images, options, variants, taxable, trackQuantity, collectionIds, storeId, status, published } = body;

    if (!storeId) return jsonError('Store ID is required', 400);

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return jsonError('Unauthorized', 401);
    if (!checkRateLimit(`add-to-shopify:${user.id}`, 60)) return jsonError('Too many requests. Please slow down.', 429);

    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('id, user_id, shopify_store_url, shopify_token, connection_status')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) return jsonError('Store not found', 404);

    const accessToken = getShopifyAccessTokenForApi(store);
    if (!accessToken) return jsonError(STORE_NOT_CONNECTED_MESSAGE, 400);

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
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(productData),
      }
    );

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      return jsonError(`Shopify API error: ${errorText}`, shopifyResponse.status);
    }

    const result = await shopifyResponse.json();

    // Update variant images (Admin API requires PUT after create)
    const originalVariantsList = (variants ?? []) as Record<string, unknown>[];
    if (
      result.product?.id &&
      result.product?.variants &&
      result.product?.images &&
      images?.length &&
      originalVariantsList.length > 0
    ) {
      const createdImages = result.product.images as Array<{ id: number; src?: string }>;
      const createdVariants = result.product.variants as Record<string, unknown>[];
      const imageMapping = buildScrapedToCreatedImageIdMap(images, createdImages);
      const pairedCreated = matchCreatedVariantsToOriginals(originalVariantsList, createdVariants);

      for (let i = 0; i < originalVariantsList.length; i++) {
        const originalVariant = originalVariantsList[i];
        const createdVariant = pairedCreated[i];
        if (!createdVariant?.id) continue;

        const sourceImageId = resolveVariantSourceImageId(originalVariant);
        if (!sourceImageId || !imageMapping.has(sourceImageId)) continue;

        const newImageId = imageMapping.get(sourceImageId)!;

        try {
          const putResponse = await fetch(
            `https://${store.shopify_store_url}/admin/api/2024-01/variants/${createdVariant.id}.json`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
              },
              body: JSON.stringify({
                variant: {
                  id: createdVariant.id,
                  image_id: newImageId,
                },
              }),
            },
          );

          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          devLog(
            'Variant image update failed:',
            error instanceof Error ? error.message : error,
          );
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
                'X-Shopify-Access-Token': accessToken,
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
            devLog(
              'Add product to collection failed:',
              collectResponse.status,
              errorText.slice(0, 200),
            );
          }
        } catch (collectError) {
          devLog(
            'Add product to collection request failed:',
            collectError instanceof Error ? collectError.message : collectError,
          );
        }
      }
    }

    return jsonOk({ product: result.product });
  } catch (error) {
    return jsonError('Failed to add product to Shopify store', 500);
  }
}

