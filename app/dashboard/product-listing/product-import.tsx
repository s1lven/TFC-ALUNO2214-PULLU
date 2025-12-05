'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/rich-text-editor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, X, Plus, Languages, Sparkles, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'EN-US', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT-PT', name: 'Portuguese' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polish' },
  { code: 'RU', name: 'Russian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'KO', name: 'Korean' },
  { code: 'SV', name: 'Swedish' },
  { code: 'DA', name: 'Danish' },
  { code: 'FI', name: 'Finnish' },
  { code: 'NO', name: 'Norwegian' },
  { code: 'CS', name: 'Czech' },
  { code: 'EL', name: 'Greek' },
  { code: 'HU', name: 'Hungarian' },
  { code: 'RO', name: 'Romanian' },
  { code: 'SK', name: 'Slovak' },
  { code: 'BG', name: 'Bulgarian' },
  { code: 'TR', name: 'Turkish' },
  { code: 'ID', name: 'Indonesian' },
  { code: 'UK', name: 'Ukrainian' },
];

export default function ProductImport({
  productData,
  editableTitle,
  setEditableTitle,
  editableHandle,
  setEditableHandle,
  editablePrice,
  setEditablePrice,
  editableComparePrice,
  setEditableComparePrice,
  editableDescriptionHtml,
  setEditableDescriptionHtml,
  editableOptions,
  setEditableOptions,
  editableVariants,
  setEditableVariants,
  selectedStore,
  collections,
  isTaxable,
  setIsTaxable,
  trackStock,
  setTrackStock,
  selectedCollections,
  setSelectedCollections,
  addingToStore,
  setAddingToStore,
  translating,
  setTranslating,
  setImportStatus,
  setTranslationStatus,
  languageSearch,
  setLanguageSearch
}: any) {
  const [discountPercentage, setDiscountPercentage] = React.useState('0');

  // Calculate discount when prices change
  React.useEffect(() => {
    const price = parseFloat(editablePrice) || 0;
    const comparePrice = parseFloat(editableComparePrice) || 0;
    
    if (price > 0 && comparePrice > price) {
      const discount = ((comparePrice - price) / comparePrice * 100).toFixed(0);
      setDiscountPercentage(discount);
    } else if (comparePrice === 0 || comparePrice <= price) {
      setDiscountPercentage('0');
    }
  }, [editablePrice, editableComparePrice]);

  // Update compare price when discount changes
  const handleDiscountChange = (discount: string) => {
    setDiscountPercentage(discount);
    const discountNum = parseFloat(discount) || 0;
    const price = parseFloat(editablePrice) || 0;
    
    if (price > 0 && discountNum > 0 && discountNum < 100) {
      const comparePrice = (price / (1 - discountNum / 100)).toFixed(2);
      setEditableComparePrice(comparePrice);
    } else if (discountNum === 0) {
      setEditableComparePrice('');
    }
  };
  
  const downloadAllImages = async () => {
    if (!productData || !productData.images) return;

    try {
      const zip = new JSZip();
      const folder = zip.folder('product-images');

      for (let i = 0; i < productData.images.length; i++) {
        const image = productData.images[i];
        try {
          const response = await fetch(image.src);
          const blob = await response.blob();
          const extension = image.src.split('.').pop()?.split('?')[0] || 'jpg';
          const filename = `${editableHandle || 'product'}_${i + 1}.${extension}`;
          folder?.file(filename, blob);
        } catch (error) {
          console.error(`Failed to fetch image ${i + 1}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${editableHandle || 'product'}_images.zip`);
    } catch (error) {
      console.error('Failed to create zip file:', error);
    }
  };

  const addProductToStore = async () => {
    if (!selectedStore) {
      setImportStatus({ type: 'error', message: 'Please select a store first' });
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    setAddingToStore(true);

    try {
      const updatedVariants = editableVariants.map((variant: any) => ({
        ...variant,
        price: editablePrice || variant.price,
        compare_at_price: editableComparePrice || variant.compare_at_price,
        taxable: isTaxable,
      }));

      const response = await fetch('/api/add-to-shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editableTitle,
          handle: editableHandle,
          body_html: editableDescriptionHtml,
          images: productData?.images || [],
          options: editableOptions,
          variants: updatedVariants,
          taxable: isTaxable,
          trackQuantity: trackStock,
          collectionIds: selectedCollections,
          storeId: selectedStore.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product to store');
      }

      const result = await response.json();
      const storeUrl = selectedStore.shopify_store_url.replace('.myshopify.com', '');
      const productId = result.product?.id;
      const productHandle = result.product?.handle || editableHandle;
      
      if (productId) {
        setImportStatus({
          type: 'success',
          message: 'Product added to store successfully!',
          productId: productId.toString(),
          productHandle,
          storeUrl: `https://${storeUrl}.myshopify.com/products/${productHandle}`,
          adminUrl: `https://admin.shopify.com/store/${storeUrl}/products/${productId}`
        });
      } else {
        setImportStatus({
          type: 'success',
          message: 'Product added to store successfully!'
        });
      }
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add product to store'
      });
      setTimeout(() => setImportStatus(null), 5000);
    } finally {
      setAddingToStore(false);
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  };

  const translateAll = async (targetLang: string) => {
    setTranslating('all');
    try {
      if (editableTitle) {
        const translatedTitle = await translateText(editableTitle, targetLang);
        setEditableTitle(translatedTitle);
      }

      if (editableDescriptionHtml) {
        const translatedDesc = await translateText(editableDescriptionHtml, targetLang);
        setEditableDescriptionHtml(translatedDesc);
      }

      if (editableOptions.length > 0) {
        const optionMappings: Array<Map<string, string>> = [];
        
        const translatedOptions = await Promise.all(
          editableOptions.map(async (option: any, optionIndex: number) => {
            const translatedName = option.name ? await translateText(option.name, targetLang) : option.name;
            const valueMapping = new Map<string, string>();
            const translatedValues = await Promise.all(
              option.values.map(async (value: string) => {
                const translated = await translateText(value, targetLang);
                valueMapping.set(value, translated);
                return translated;
              })
            );
            
            optionMappings[optionIndex] = valueMapping;
            
            return {
              ...option,
              name: translatedName,
              values: translatedValues,
            };
          })
        );
        
        const updatedVariants = editableVariants.map((variant: any) => {
          const updatedVariant = { ...variant };
          
          if (variant.option1 && optionMappings[0]) {
            updatedVariant.option1 = optionMappings[0].get(variant.option1) || variant.option1;
          }
          if (variant.option2 && optionMappings[1]) {
            updatedVariant.option2 = optionMappings[1].get(variant.option2) || variant.option2;
          }
          if (variant.option3 && optionMappings[2]) {
            updatedVariant.option3 = optionMappings[2].get(variant.option3) || variant.option3;
          }
          
          return updatedVariant;
        });
        
        setEditableOptions(translatedOptions);
        setEditableVariants(updatedVariants);
      }

      setTranslationStatus({ type: 'success', message: 'Translation completed successfully!' });
      setTimeout(() => setTranslationStatus(null), 3000);
    } catch (err) {
      setTranslationStatus({ 
        type: 'error', 
        message: 'Failed to translate: ' + (err instanceof Error ? err.message : 'Unknown error')
      });
      setTimeout(() => setTranslationStatus(null), 5000);
    } finally {
      setTranslating(null);
    }
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const selectedCollectionNames = selectedCollections.length === 0 
    ? 'No collection' 
    : selectedCollections.length === 1
    ? collections.find((c: any) => c.id.toString() === selectedCollections[0])?.title || 'No collection'
    : `${selectedCollections.length} collections selected`;

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev: string[]) => 
      prev.includes(collectionId)
        ? prev.filter((id: string) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-xl w-full h-[calc(100vh-120px)] flex flex-col shadow-lg border border-gray-200">
        {/* Header with Translation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit your Product before importing</h2>
          <DropdownMenu onOpenChange={(open) => !open && setLanguageSearch('')}>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={translating === 'all'}
                size="sm"
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 h-9 px-4 text-xs font-medium"
              >
                <Sparkles size={16} className="mr-2" />
                {translating === 'all' ? 'Translating...' : 'AI Copywrite and Translation'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 w-48 p-0">
              <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
                <Input
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-900 h-8 text-xs"
                />
              </div>
              <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {filteredLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => translateAll(lang.code)}
                    className="text-gray-900 hover:bg-purple-50 hover:text-purple-700 cursor-pointer text-sm focus:bg-purple-50 focus:text-purple-700"
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <div className="p-6 space-y-6">
            
            {/* TOP SECTION: 2-Column Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* LEFT COLUMN: Basic Info & Pricing */}
              <div className="space-y-5">
                {/* Product Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product title</label>
                  <Input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 h-10"
                    placeholder="Enter product title"
                  />
                </div>

                {/* Product Handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product handle</label>
                  <Input
                    value={editableHandle}
                    onChange={(e) => setEditableHandle(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 h-10"
                    placeholder="product-handle"
                  />
                </div>

                {/* Product Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor</label>
                  <Input
                    value={productData?.vendor || ''}
                    onChange={(e) => {
                      // This would need to be passed down as a prop if we want to make it editable
                    }}
                    className="bg-white border-gray-300 text-gray-900 h-10"
                    placeholder="Vendor name"
                  />
                </div>

                {/* Product Pricing */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Pricing</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                        <Input
                          value={editablePrice}
                          onChange={(e) => setEditablePrice(e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 h-10 pl-9 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          placeholder="49.95"
                          type="number"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Compare at price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                        <Input
                          value={editableComparePrice}
                          onChange={(e) => setEditableComparePrice(e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 h-10 pl-9 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          placeholder="99.95"
                          type="number"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Calculated discount</label>
                      <div className="relative">
                        <Input
                          value={discountPercentage}
                          onChange={(e) => handleDiscountChange(e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 h-10 pr-9 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          placeholder="0"
                          type="number"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Product Images */}
              {productData.images && productData.images.length > 0 && (
                <div className="border border-gray-200 rounded-lg pt-4 pl-4 pb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3 pr-4">
                    <label className="text-sm font-medium text-gray-700">Product Images</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {/* AI edit functionality */}}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={14} />
                        Edit with AI
                      </button>
                      <button 
                        onClick={downloadAllImages}
                        className="text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-3">
                    {productData.images.map((image: any, index: number) => (
                      <div key={image.id} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative group">
                        <img
                          src={image.src}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={async () => {
                                // Download single image
                                try {
                                  const response = await fetch(image.src);
                                  const blob = await response.blob();
                                  const extension = image.src.split('.').pop()?.split('?')[0] || 'jpg';
                                  const filename = `${editableHandle || 'product'}_${index + 1}.${extension}`;
                                  saveAs(blob, filename);
                                } catch (error) {
                                  console.error('Failed to download image:', error);
                                }
                              }}
                              className="bg-black/60 hover:bg-black/80 rounded-md p-1.5 transition-colors"
                              title="Download image"
                            >
                              <Download size={14} className="text-white" />
                            </button>
                            <button
                              onClick={() => {
                                // Delete image functionality
                                console.log('Delete image:', image.id);
                              }}
                              className="bg-black/60 hover:bg-black/80 rounded-md p-1.5 transition-colors"
                              title="Delete image"
                            >
                              <Trash2 size={14} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Product description</label>
              <RichTextEditor 
                content={editableDescriptionHtml}
                onChange={setEditableDescriptionHtml}
              />
            </div>

            {/* Product Variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Product variants ({editableVariants.length})</label>
                <Button
                  onClick={() => {
                    const newOption = {
                      name: `Option ${editableOptions.length + 1}`,
                      values: ['Value 1'],
                      position: editableOptions.length + 1
                    };
                    setEditableOptions([...editableOptions, newOption]);
                  }}
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 h-8 px-3 text-xs shadow-none"
                >
                  <Plus size={14} className="mr-1" />
                  Add Variant
                </Button>
              </div>

              {/* Variant Options */}
              {editableOptions.length > 0 && (
                <div className="space-y-3 mb-4">
                  {editableOptions.map((option: any, optionIndex: number) => (
                    <div key={optionIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
                      <button
                        onClick={() => {
                          const newOptions = editableOptions.filter((_: any, i: number) => i !== optionIndex);
                          setEditableOptions(newOptions);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-md p-1.5 transition-all"
                        title="Delete this variant option"
                      >
                        <X size={18} strokeWidth={2.5} />
                      </button>
                      <div className="pr-10 mb-2">
                        <Input
                          value={option.name || ''}
                          onChange={(e) => {
                            const newOptions = [...editableOptions];
                            newOptions[optionIndex] = { ...newOptions[optionIndex], name: e.target.value };
                            setEditableOptions(newOptions);
                          }}
                          className="w-full bg-white border-gray-300 text-gray-900 h-9 text-sm font-medium"
                          placeholder="Option name (e.g., Size, Color)"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {option.values?.map((value: string, valueIndex: number) => (
                          <div 
                            key={valueIndex}
                            className="group flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-2.5 py-1"
                          >
                            <input
                              value={value}
                              onChange={(e) => {
                                const newOptions = [...editableOptions];
                                const newValues = [...newOptions[optionIndex].values];
                                newValues[valueIndex] = e.target.value;
                                newOptions[optionIndex] = { ...newOptions[optionIndex], values: newValues };
                                setEditableOptions(newOptions);
                              }}
                              className="bg-transparent text-gray-900 text-xs outline-none border-none w-16"
                              placeholder="Value"
                            />
                            <button
                              onClick={() => {
                                const newOptions = [...editableOptions];
                                const newValues = newOptions[optionIndex].values.filter((_: any, i: number) => i !== valueIndex);
                                newOptions[optionIndex] = { ...newOptions[optionIndex], values: newValues };
                                setEditableOptions(newOptions);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} className="text-gray-500 hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...editableOptions];
                            const newValues = [...(newOptions[optionIndex].values || []), ''];
                            newOptions[optionIndex] = { ...newOptions[optionIndex], values: newValues };
                            setEditableOptions(newOptions);
                          }}
                          className="flex items-center gap-1 bg-white border border-dashed border-gray-300 rounded-md px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Settings</label>
              <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Set product as active</span>
                  <button
                    type="button"
                    className="relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none bg-green-500"
                  >
                    <span className="inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform translate-x-5" />
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Publish to Online Store on import</span>
                  <button
                    type="button"
                    className="relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none bg-green-500"
                  >
                    <span className="inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform translate-x-5" />
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Taxable</span>
                  <button
                    type="button"
                    onClick={() => setIsTaxable(!isTaxable)}
                    className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      isTaxable ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform ${
                        isTaxable ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Track Stock</span>
                  <button
                    type="button"
                    onClick={() => setTrackStock(!trackStock)}
                    className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      trackStock ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform ${
                        trackStock ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>

                {/* Collections */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Collections</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-white border border-gray-300 text-gray-900 rounded-md px-2.5 py-1 text-xs hover:border-gray-400 text-left flex items-center gap-1.5 min-w-[120px]">
                        <span className="truncate text-xs">{selectedCollectionNames}</span>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border-gray-200 max-h-[300px] overflow-y-auto w-full">
                      {collections.map((collection: any) => (
                        <DropdownMenuItem
                          key={collection.id}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCollection(collection.id.toString());
                          }}
                          className="text-gray-900 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                            selectedCollections.includes(collection.id.toString())
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedCollections.includes(collection.id.toString()) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span>{collection.title}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
          <Button 
            onClick={addProductToStore} 
            disabled={addingToStore || !editableTitle}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 h-10 font-medium shadow-lg shadow-green-600/20"
          >
            {addingToStore ? 'Importing...' : 'Import product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
