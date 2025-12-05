'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CollectionImport({
  collectionData,
  selectedStore,
  importingCollection,
  setImportingCollection,
  setCollectionImportStatus,
  setCollectionData,
  setCollectionUrl
}: any) {

  const importCollectionToShopify = async () => {
    if (!collectionData || !selectedStore) return;
    
    setImportingCollection(true);
    
    try {
      const response = await fetch('/api/add-collection-to-shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: collectionData,
          products: collectionData.products || [],
          storeId: selectedStore.id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to import collection');
      }

      const collectionId = result.collection?.id;
      setCollectionImportStatus({
        type: 'success',
        message: `Collection imported with ${result.imported} products! ${result.failed > 0 ? `(${result.failed} failed)` : ''}`,
        collectionId: collectionId?.toString(),
      });
      setTimeout(() => setCollectionImportStatus(null), 8000);
      
      // Clear collection data after successful import
      setCollectionData(null);
      setCollectionUrl('');
    } catch (err) {
      setCollectionImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to import collection',
      });
      setTimeout(() => setCollectionImportStatus(null), 5000);
    } finally {
      setImportingCollection(false);
    }
  };

  return (
    <div className="mb-6">
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 text-2xl">{collectionData.title}</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {collectionData.productCount || 0} products • Ready to import
              </CardDescription>
            </div>
            <Button 
              onClick={importCollectionToShopify}
              disabled={importingCollection || !selectedStore}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/20 px-8 h-12 text-base"
            >
              {importingCollection ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Importing...
                </div>
              ) : (
                `Import All to Shopify`
              )}
            </Button>
          </div>
          {collectionData.body_html && (
            <div 
              className="text-gray-700 mt-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: collectionData.body_html }}
            />
          )}
        </CardHeader>
        <CardContent>
          {collectionData.products && collectionData.products.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold text-lg">Products in Collection</h3>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {collectionData.products.length} items
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {collectionData.products.map((product: any, index: number) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0].src} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Variant count badge */}
                      {product.variants && product.variants.length > 1 && (
                        <div className="absolute top-2 right-2 bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {product.variants.length} variants
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <h4 className="text-gray-900 text-sm font-medium line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {product.variants && product.variants[0] && (
                          <>
                            {product.variants[0].compare_at_price && 
                             parseFloat(product.variants[0].compare_at_price) > parseFloat(product.variants[0].price) && (
                              <span className="text-gray-500 text-xs line-through">
                                ${product.variants[0].compare_at_price}
                              </span>
                            )}
                            <span className="text-green-600 font-semibold text-sm">
                              ${product.variants[0].price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found in this collection</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

