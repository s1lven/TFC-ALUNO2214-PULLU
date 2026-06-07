'use client';

import React from 'react';
import { devLog } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/dashboard/rich-text-editor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HugeiconsIcon } from '@hugeicons/react';
import { DownloadFreeIcons, PlusSignFreeIcons, SparklesFreeIcons, DeleteFreeIcons, CancelFreeIcons, ArrowExpandDiagonal01FreeIcons } from '@hugeicons/core-free-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LANGUAGES } from '@/lib/dashboard/languages';

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
  setLanguageSearch,
  onBack
}: {
  productData: { options?: Array<{ name: string; values: string[] }>; variants?: Array<Record<string, unknown>>; [key: string]: unknown };
  editableTitle: string;
  setEditableTitle: React.Dispatch<React.SetStateAction<string>>;
  editableHandle: string;
  setEditableHandle: React.Dispatch<React.SetStateAction<string>>;
  editablePrice: string;
  setEditablePrice: React.Dispatch<React.SetStateAction<string>>;
  editableComparePrice: string;
  setEditableComparePrice: React.Dispatch<React.SetStateAction<string>>;
  editableDescriptionHtml: string;
  setEditableDescriptionHtml: React.Dispatch<React.SetStateAction<string>>;
  editableOptions: Array<{ name: string; values: string[] }>;
  setEditableOptions: React.Dispatch<React.SetStateAction<Array<{ name: string; values: string[] }>>>;
  editableVariants: Array<Record<string, unknown>>;
  setEditableVariants: React.Dispatch<React.SetStateAction<Array<Record<string, unknown>>>>;
  selectedStore: {
    id: number;
    user_id: string;
    shopify_store_url: string;
    shopify_token?: string | null;
    store_name?: string | null;
    store_alias?: string | null;
    connection_status?: string | null;
    created_at: string;
  } | null;
  collections: Array<{ id: string; title: string }>;
  isTaxable: boolean;
  setIsTaxable: React.Dispatch<React.SetStateAction<boolean>>;
  trackStock: boolean;
  setTrackStock: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCollections: string[];
  setSelectedCollections: React.Dispatch<React.SetStateAction<string[]>>;
  addingToStore: boolean;
  setAddingToStore: React.Dispatch<React.SetStateAction<boolean>>;
  translating: string | null;
  setTranslating: React.Dispatch<React.SetStateAction<string | null>>;
  setImportStatus: (status: { type: 'success' | 'error'; message: string; [key: string]: unknown } | null) => void;
  setTranslationStatus: (status: { type: 'success' | 'error'; message: string } | null) => void;
  languageSearch: string;
  setLanguageSearch: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
}) {
  const [discountPercentage, setDiscountPercentage] = React.useState('0');
  const [downloadingImages, setDownloadingImages] = React.useState(false);
  const [enhancementPrompt, setEnhancementPrompt] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [editableImages, setEditableImages] = React.useState<Array<{ src: string; [key: string]: unknown }>>([]);
  const [uploadingImages, setUploadingImages] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const didDragRef = React.useRef(false);
  const [isActive, setIsActive] = React.useState(true);
  const [isPublished, setIsPublished] = React.useState(true);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [lightboxEditName, setLightboxEditName] = React.useState('');
  const [lightboxEditAlt, setLightboxEditAlt] = React.useState('');
  const [showSkuPanel, setShowSkuPanel] = React.useState(false);

  const getImageFilename = (src: string): string => {
    try {
      const path = new URL(src).pathname;
      return path.split('/').pop()?.split('?')[0] || 'image';
    } catch {
      return src.split('/').pop()?.split('?')[0] || 'image';
    }
  };

  React.useEffect(() => {
    if (lightboxIndex !== null && editableImages[lightboxIndex]) {
      const img = editableImages[lightboxIndex];
      setLightboxEditName((img.name as string) || getImageFilename(img.src));
      setLightboxEditAlt((img.alt as string) || '');
    }
  }, [lightboxIndex]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && lightboxIndex !== null) setLightboxIndex(i => i !== null && i < editableImages.length - 1 ? i + 1 : i);
      if (e.key === 'ArrowLeft' && lightboxIndex !== null) setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, editableImages.length]);

  const saveLightboxImageInfo = () => {
    if (lightboxIndex === null) return;
    const updated = [...editableImages];
    updated[lightboxIndex] = { ...updated[lightboxIndex], name: lightboxEditName, alt: lightboxEditAlt };
    setEditableImages(updated);
  };

  const downloadLightboxImage = async () => {
    if (lightboxIndex === null) return;
    const img = editableImages[lightboxIndex];
    try {
      const blob = await convertImageToPNG(img.src);
      saveAs(blob, `${lightboxEditName || getImageFilename(img.src)}.png`);
    } catch {
      console.error('Failed to download image');
    }
  };
  const [editableVendor] = React.useState('');
  const [editableSeoTitle, setEditableSeoTitle] = React.useState('');
  const [editableSeoDescription, setEditableSeoDescription] = React.useState('');

  // Initialize editable images when productData changes
  React.useEffect(() => {
    if (productData?.images && Array.isArray(productData.images)) {
      setEditableImages(productData.images as Array<{ src: string; [key: string]: unknown }>);
    }
  }, [productData]);

  // Reset vendor to "Imported" when productData changes
  React.useEffect(() => {
    if (productData) {
      setEditableSeoTitle((productData.metafields_global_title_tag as string) || '');
      setEditableSeoDescription((productData.metafields_global_description_tag as string) || '');
    }
  }, [productData]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const newImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert to base64 data URL
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push({
          id: Date.now() + i, // Temporary ID
          src: base64,
          position: editableImages.length + i + 1,
          alt: file.name
        });
      }

      setEditableImages([...editableImages, ...newImages]);
    } catch (error) {
      console.error('Failed to upload images:', error);
    } finally {
      setUploadingImages(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Handle drag and drop for reordering
  const handleDragStart = (index: number) => {
    didDragRef.current = false;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...editableImages];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(index, 0, draggedImage);
    
    setEditableImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    didDragRef.current = true;
    setDraggedIndex(null);
    setTimeout(() => { didDragRef.current = false; }, 100);
  };

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
  
  // Convert image to PNG format
  const convertImageToPNG = async (imageUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to PNG'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };

  const downloadAllImages = async () => {
    if (!editableImages || editableImages.length === 0) return;

    setDownloadingImages(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('product-images');

      for (let i = 0; i < editableImages.length; i++) {
        const image = editableImages[i];
        try {
          // Convert image to PNG
          const pngBlob = await convertImageToPNG(image.src);
          const filename = `${editableHandle || 'product'}_${i + 1}.png`;
          folder?.file(filename, pngBlob);
        } catch (error) {
          console.error(`Failed to convert image ${i + 1}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${editableHandle || 'product'}_images.zip`);
    } catch (error) {
      console.error('Failed to create zip file:', error);
    } finally {
      setDownloadingImages(false);
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
      // Build a mapping of old option values to new option values
      const optionValueMap: Record<string, Record<string, string>> = {};
      
      // Compare original product options with edited options
      productData.options?.forEach((originalOption: { name: string; values: string[] }, optionIndex: number) => {
        const editedOption = editableOptions[optionIndex];
        if (editedOption) {
          const optionKey = `option${optionIndex + 1}`;
          optionValueMap[optionKey] = {};
          
          originalOption.values.forEach((originalValue: string, valueIndex: number) => {
            const newValue = editedOption.values[valueIndex];
            if (newValue) {
              optionValueMap[optionKey][originalValue] = newValue;
            }
          });
        }
      });
      
      const firstScrapedPrice = String(editableVariants[0]?.price ?? '');
      const allVariantPricesMatch =
        editableVariants.length <= 1 ||
        editableVariants.every((v) => String(v.price ?? '') === firstScrapedPrice);

      // Apply the mapping to update variant option values
      const updatedVariants = editableVariants.map((variant: Record<string, unknown>, index: number) => {
        const price =
          allVariantPricesMatch || index === 0
            ? String(editablePrice || variant.price || '')
            : String(variant.price ?? editablePrice ?? '');
        const compare_at_price =
          allVariantPricesMatch || index === 0
            ? String(editableComparePrice || variant.compare_at_price || '')
            : String(variant.compare_at_price ?? editableComparePrice ?? '');

        const newVariant: Record<string, unknown> = {
          ...variant,
          price,
          compare_at_price,
          taxable: isTaxable,
        };
        
        // Update option1, option2, option3 with new values if they were changed
        const typedVariant = variant as Record<string, unknown>;
        if (typedVariant.option1 && optionValueMap['option1'] && optionValueMap['option1'][typedVariant.option1 as string]) {
          newVariant.option1 = optionValueMap['option1'][typedVariant.option1 as string];
        }
        if (typedVariant.option2 && optionValueMap['option2'] && optionValueMap['option2'][typedVariant.option2 as string]) {
          newVariant.option2 = optionValueMap['option2'][typedVariant.option2 as string];
        }
        if (typedVariant.option3 && optionValueMap['option3'] && optionValueMap['option3'][typedVariant.option3 as string]) {
          newVariant.option3 = optionValueMap['option3'][typedVariant.option3 as string];
        }
        
        return newVariant;
      });

      const response = await fetch('/api/add-to-shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editableTitle,
          handle: editableHandle,
          body_html: editableDescriptionHtml,
          vendor: editableVendor,
          images: editableImages,
          options: editableOptions,
          variants: updatedVariants,
          taxable: isTaxable,
          trackQuantity: trackStock,
          collectionIds: selectedCollections,
          storeId: selectedStore.id,
          status: isActive ? 'active' : 'draft',
          published: isPublished,
          seoTitle: editableSeoTitle,
          seoDescription: editableSeoDescription,
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

  const translateAll = async (targetLang: string) => {
    setTranslating('all');
    try {
      // Prepare product data for translation
      const productData = {
        title: editableTitle,
        description: editableDescriptionHtml,
        options: editableOptions
      };

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productData, 
          targetLang,
          enhancementPrompt: enhancementPrompt || undefined
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          typeof data?.error === 'string' ? data.error : 'Translation failed';
        throw new Error(msg);
      }
      const translatedData = data.translatedData;

      // Update title
      if (translatedData.title) {
        setEditableTitle(translatedData.title);
      }

      // Update description
      if (translatedData.description) {
        setEditableDescriptionHtml(translatedData.description);
      }

      // Update options and variants
      if (translatedData.options && translatedData.options.length > 0) {
        const optionMappings: Array<Map<string, string>> = [];
        
        // Create mappings for old values to new values
        translatedData.options?.forEach((translatedOption: { name: string; values: string[] }, index: number) => {
          const originalOption = editableOptions[index];
          const valueMapping = new Map<string, string>();
          
          originalOption.values.forEach((originalValue: string, valueIndex: number) => {
            const translatedValue = translatedOption.values[valueIndex];
            valueMapping.set(originalValue, translatedValue);
          });
          
          optionMappings[index] = valueMapping;
        });

        // Update variants with new option values
        const updatedVariants = editableVariants.map((variant: Record<string, unknown>) => {
          const updatedVariant = { ...variant };
          
          const typedVariant = variant as Record<string, unknown>;
          if (typedVariant.option1 && optionMappings[0]) {
            updatedVariant.option1 = optionMappings[0].get(typedVariant.option1 as string) || (typedVariant.option1 as string);
          }
          if (typedVariant.option2 && optionMappings[1]) {
            updatedVariant.option2 = optionMappings[1].get(typedVariant.option2 as string) || (typedVariant.option2 as string);
          }
          if (typedVariant.option3 && optionMappings[2]) {
            updatedVariant.option3 = optionMappings[2].get(typedVariant.option3 as string) || (typedVariant.option3 as string);
          }
          
          return updatedVariant;
        });
        
        setEditableOptions(translatedData.options);
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

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const selectedCollectionNames = selectedCollections.length === 0 
    ? 'No collection' 
    : selectedCollections.length === 1
    ? collections.find((c: { id: string; title: string }) => c.id.toString() === selectedCollections[0])?.title || 'No collection'
    : `${selectedCollections.length} collections selected`;

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev: string[]) => 
      prev.includes(collectionId)
        ? prev.filter((id: string) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  return (
    <>
    {lightboxIndex !== null && editableImages[lightboxIndex] && (() => {
      const img = editableImages[lightboxIndex];
      const ext = getImageFilename(img.src).split('.').pop()?.toUpperCase() || 'IMG';
      const w = img.width as number | undefined;
      const h = img.height as number | undefined;
      const createdAt = img.created_at as string | undefined;
      const detailParts = [ext, w && h ? `${w} × ${h}` : null].filter(Boolean).join(' • ');
      return (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setLightboxIndex(null)}>
          {/* Image + adjacent arrows */}
          <div className="absolute inset-0 flex items-center justify-center p-8 pr-[308px]">
            <div className="relative inline-flex max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
              {lightboxIndex > 0 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+12px)] z-10 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg px-3 py-2.5 transition-colors"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              <img
                src={img.src}
                alt={lightboxEditAlt || 'Full size preview'}
                className="max-h-full max-w-full object-contain rounded-lg block"
              />
              {lightboxIndex < editableImages.length - 1 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+12px)] z-10 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg px-3 py-2.5 transition-colors"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Floating info panel */}
          <div className="absolute right-4 top-4 w-[280px] z-10 bg-[#232323] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <p className="text-xs text-white/40 font-medium">{lightboxIndex + 1} / {editableImages.length}</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={downloadLightboxImage}
                  className="bg-white/10 hover:bg-white/20 rounded-md p-1.5 transition-colors"
                  title="Download"
                >
                  <HugeiconsIcon icon={DownloadFreeIcons} size={14} className="text-white" />
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="bg-white/10 hover:bg-white/20 rounded-md p-1.5 transition-colors"
                  title="Close"
                >
                  <HugeiconsIcon icon={CancelFreeIcons} size={14} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Information</p>

              <div className="space-y-1">
                <label className="text-xs text-white/50">Name <span className="text-white/25">(local only)</span></label>
                <input
                  value={lightboxEditName}
                  onChange={(e) => {
                    setLightboxEditName(e.target.value);
                    const updated = [...editableImages];
                    updated[lightboxIndex] = { ...updated[lightboxIndex], name: e.target.value };
                    setEditableImages(updated);
                  }}
                  className="w-full bg-white/10 border border-white/15 rounded-md px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
                  placeholder="Image name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/50">Alt text</label>
                <input
                  value={lightboxEditAlt}
                  onChange={(e) => {
                    setLightboxEditAlt(e.target.value);
                    const updated = [...editableImages];
                    updated[lightboxIndex] = { ...updated[lightboxIndex], alt: e.target.value };
                    setEditableImages(updated);
                  }}
                  className="w-full bg-white/10 border border-white/15 rounded-md px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors"
                  placeholder="Describe this image"
                />
              </div>

              {(detailParts || createdAt) && (
                <div className="space-y-1">
                  <p className="text-xs text-white/50">Details</p>
                  {detailParts && <p className="text-xs text-white/70">{detailParts}</p>}
                  {createdAt && (
                    <p className="text-xs text-white/70">
                      Added {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="bg-white rounded-xl w-full max-w-6xl flex flex-col shadow-lg border border-gray-200" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {/* Header with Translation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to selection
          </button>
          <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => {
            setIsDropdownOpen(open);
            if (!open) {
              setLanguageSearch('');
              setEnhancementPrompt('');
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={translating === 'all'}
                size="sm"
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 h-8 px-3 text-xs font-medium"
              >
                <HugeiconsIcon icon={SparklesFreeIcons} size={16} className="mr-2" />
                {translating === 'all' ? 'Processing...' : 'AI Enhance & Translate'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200 w-80 p-0">
              {/* AI Prompt Section */}
              <div className="p-3 border-b border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  AI Enhancement Prompt (Optional)
                </label>
                <textarea
                  value={enhancementPrompt}
                  onChange={(e) => setEnhancementPrompt(e.target.value)}
                  placeholder="e.g., Make it more persuasive, add emoji, improve SEO..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-xs text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Leave empty to translate only
                </p>
              </div>

              {/* Language Selection */}
              <div className="p-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Language
                </label>
                <Input
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-900 h-8 text-xs mb-2"
                />
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 border border-gray-200 rounded-md">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        translateAll(lang.code);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 text-gray-900 hover:bg-purple-50 hover:text-purple-700 cursor-pointer text-sm transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <div className="p-6 space-y-6">
            
            {/* TOP SECTION: 2-Column Grid */}
            <div className="grid grid-cols-2 gap-6 items-start">
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

                {/* Handle + Page title side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Handle</label>
                    <Input
                      value={editableHandle}
                      onChange={(e) => setEditableHandle(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 h-10"
                      placeholder="product-handle"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700">Page title</label>
                      <span className={`text-xs ${editableSeoTitle.length > 70 ? 'text-red-500' : 'text-gray-400'}`}>{editableSeoTitle.length} / 70</span>
                    </div>
                    <Input
                      value={editableSeoTitle}
                      onChange={(e) => setEditableSeoTitle(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 h-10"
                      placeholder="Page title"
                    />
                  </div>
                </div>

                {/* Meta description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Meta description</label>
                    <span className={`text-xs ${editableSeoDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{editableSeoDescription.length} / 160</span>
                  </div>
                  <textarea
                    value={editableSeoDescription}
                    onChange={(e) => setEditableSeoDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                    placeholder="Meta description"
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
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product Images</label>
                    <p className="text-xs text-gray-500 mt-0.5">Drag to reorder</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Upload Button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      <div className="text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm">
                        {uploadingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-700 border-t-transparent"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon icon={PlusSignFreeIcons} size={14} />
                            <span>Upload</span>
                          </>
                        )}
                      </div>
                    </label>
                    
                    {/* Download Button */}
                    {editableImages && editableImages.length > 0 && (
                      <button 
                        onClick={downloadAllImages}
                        disabled={downloadingImages}
                        className="text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-700 border-t-transparent"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon icon={DownloadFreeIcons} size={14} />
                            Download All
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {editableImages && editableImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    {editableImages.map((image: { src: string; [key: string]: unknown }, index: number) => (
                      <div
                        key={image.id as string}
                        className={`aspect-square rounded-lg border-2 overflow-hidden relative group cursor-pointer ${
                          draggedIndex === index ? 'border-green-500 opacity-50' : 'border-gray-200'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { if (!didDragRef.current) setLightboxIndex(index); }}
                      >
                        <img
                          src={image.src}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto">
                            <button
                              onClick={async () => {
                                // Download single image as PNG
                                try {
                                  const pngBlob = await convertImageToPNG(image.src);
                                  const filename = `${editableHandle || 'product'}_${index + 1}.png`;
                                  saveAs(pngBlob, filename);
                                } catch (error) {
                                  console.error('Failed to download image:', error);
                                }
                              }}
                              className="bg-black/60 hover:bg-black/80 rounded-md p-1.5 transition-colors"
                              title="Download image"
                            >
                              <HugeiconsIcon icon={DownloadFreeIcons} size={14} className="text-white" />
                            </button>
                            <button
                              onClick={() => setLightboxIndex(index)}
                              className="bg-black/60 hover:bg-black/80 rounded-md p-1.5 transition-colors"
                              title="View image"
                            >
                              <HugeiconsIcon icon={ArrowExpandDiagonal01FreeIcons} size={14} className="text-white" />
                            </button>
                            <button
                              onClick={() => {
                                // Delete image from the list
                                setEditableImages(editableImages.filter((_, i) => i !== index));
                              }}
                              className="bg-black/60 hover:bg-black/80 rounded-md p-1.5 transition-colors"
                              title="Delete image"
                            >
                              <HugeiconsIcon icon={DeleteFreeIcons} size={14} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    No images available
                  </div>
                )}
              </div>
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
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowSkuPanel(!showSkuPanel)}
                    size="sm"
                    className={`border h-8 px-3 text-xs shadow-none transition-colors ${showSkuPanel ? 'bg-gray-300 text-gray-900 border-gray-400 hover:bg-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`}
                  >
                    SKUs / GTINs
                  </Button>
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
                    <HugeiconsIcon icon={PlusSignFreeIcons} size={14} className="mr-1" />
                    Add Variant
                  </Button>
                </div>
              </div>

              {/* Variant Options */}
              {editableOptions.length > 0 && (
                <div className="space-y-3 mb-4">
                  {editableOptions.map((option: { name: string; values: string[] }, optionIndex: number) => (
                    <div key={optionIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
                      <button
                        onClick={() => {
                          const newOptions = editableOptions.filter((_, i: number) => i !== optionIndex);
                          setEditableOptions(newOptions);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-md p-1.5 transition-all"
                        title="Delete this variant option"
                      >
                        <HugeiconsIcon icon={CancelFreeIcons} size={18} />
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
                                const newValues = newOptions[optionIndex].values.filter((_, i: number) => i !== valueIndex);
                                newOptions[optionIndex] = { ...newOptions[optionIndex], values: newValues };
                                setEditableOptions(newOptions);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <HugeiconsIcon icon={CancelFreeIcons} size={12} className="text-gray-500 hover:text-red-500" />
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
                          <HugeiconsIcon icon={PlusSignFreeIcons} size={12} />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SKU / GTIN panel */}
              {showSkuPanel && (
                <div className="border border-gray-200 rounded-lg overflow-hidden mt-1">
                  <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-100 border-b border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <span>Variant</span>
                    <span>SKU</span>
                    <span>GTIN / Barcode</span>
                  </div>
                  {editableVariants.map((variant, index) => {
                    const parts = [variant.option1, variant.option2, variant.option3].filter(Boolean) as string[];
                    const label = parts.length > 0 ? parts.join(' / ') : 'Default';
                    return (
                      <div key={index} className="grid grid-cols-[1fr_1fr_1fr] px-3 py-2 border-b border-gray-100 last:border-0 items-center gap-3">
                        <span className="text-xs text-gray-600 truncate">{label}</span>
                        <Input
                          value={(variant.sku as string) || ''}
                          onChange={(e) => {
                            const updated = [...editableVariants];
                            updated[index] = { ...updated[index], sku: e.target.value };
                            setEditableVariants(updated);
                          }}
                          className="h-7 text-xs bg-white border-gray-300"
                          placeholder="SKU-001"
                        />
                        <Input
                          value={(variant.barcode as string) || ''}
                          onChange={(e) => {
                            const updated = [...editableVariants];
                            updated[index] = { ...updated[index], barcode: e.target.value };
                            setEditableVariants(updated);
                          }}
                          className="h-7 text-xs bg-white border-gray-300"
                          placeholder="0000000000000"
                        />
                      </div>
                    );
                  })}
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
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Publish to Online Store on import</span>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      isPublished ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform ${
                        isPublished ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
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
                      {collections.map((collection) => (
                        <div
                          key={collection.id}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCollection(collection.id.toString());
                            devLog('Collection clicked:', collection.title, 'Selected:', selectedCollections);
                          }}
                          className="text-gray-900 cursor-pointer flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-gray-100 transition-colors text-sm"
                        >
                          <div
                            className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCollections.includes(collection.id.toString()) ? 'bg-brand border-brand' : 'bg-white border-gray-300'}`}
                          >
                            {selectedCollections.includes(collection.id.toString()) && (
                              <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span>{collection.title}</span>
                        </div>
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
    </>
  );
}
