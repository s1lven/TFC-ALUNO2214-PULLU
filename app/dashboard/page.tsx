'use client';

import { useState } from 'react';
import ProductImport from '@/components/dashboard/product-import';
import CollectionImport from '@/components/dashboard/collection-import';
import { DashboardAddStoreModal } from '@/components/dashboard/dashboard-add-store-modal';
import { DashboardCenterSpinner } from '@/components/dashboard/dashboard-center-spinner';
import { DashboardImportWorkspace } from '@/components/dashboard/dashboard-import-workspace';
import { DashboardNotificationToasts } from '@/components/dashboard/dashboard-notification-toasts';
import { DashboardOnboardingEmptyStore } from '@/components/dashboard/dashboard-onboarding-empty-store';
import { DashboardStoreSelector } from '@/components/dashboard/dashboard-store-selector';
import { useStores } from '@/lib/dashboard/use-stores';
import { useStoreConnect } from '@/lib/dashboard/use-store-connect';
import { useProductWorkspace } from '@/lib/dashboard/use-product-workspace';
import { useCollectionWorkspace } from '@/lib/dashboard/use-collection-workspace';

export default function DashboardPage() {
  const { stores, selectedStore, setSelectedStore, loadingStores, fetchStores, collections } = useStores();
  const storeConnect = useStoreConnect({ onConnected: fetchStores });
  const product = useProductWorkspace();
  const collection = useCollectionWorkspace();

  const [importMode, setImportMode] = useState<'product' | 'collection' | null>(null);

  const selectedStoreReady =
    !!selectedStore && selectedStore.connection_status !== 'pending_oauth';

  return (
    <div className="h-full overflow-hidden bg-surface">
      {loadingStores ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <DashboardCenterSpinner />
        </div>
      ) : (
        <>
          <DashboardNotificationToasts
            collectionImportStatus={collection.collectionImportStatus}
            onDismissCollection={() => collection.setCollectionImportStatus(null)}
            translationStatus={product.translationStatus}
            onDismissTranslation={() => product.setTranslationStatus(null)}
            importStatus={product.importStatus}
            onDismissImport={() => product.setImportStatus(null)}
            scrapeError={product.error}
            onDismissScrapeError={product.clearError}
            collectionScrapeError={collection.collectionError}
            onDismissCollectionScrapeError={collection.clearCollectionError}
          />

          {stores.length > 0 && !product.productData && !collection.collectionData && (
            <DashboardStoreSelector
              stores={stores}
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
              onAddStore={() => storeConnect.setShowAddStoreModal(true)}
            />
          )}

          <div className={`mx-auto ${product.productData || collection.collectionData ? 'h-full' : 'max-w-[1600px] p-8'}`}>
            {stores.length === 0 ? (
              <DashboardOnboardingEmptyStore
                newStoreSubdomain={storeConnect.newStoreSubdomain}
                onSubdomainChange={storeConnect.setNewStoreSubdomain}
                newStoreAlias={storeConnect.newStoreAlias}
                onAliasChange={storeConnect.setNewStoreAlias}
                newClientId={storeConnect.newClientId}
                onClientIdChange={storeConnect.setNewClientId}
                newClientSecret={storeConnect.newClientSecret}
                onClientSecretChange={storeConnect.setNewClientSecret}
                storeError={storeConnect.storeError}
                addingStore={storeConnect.addingStore}
                onConnect={storeConnect.startShopifyOAuth}
              />
            ) : (
              <>
                {!product.productData && !collection.collectionData && (
                  <DashboardImportWorkspace
                    importMode={importMode}
                    onImportModeChange={setImportMode}
                    selectedStoreReady={selectedStoreReady}
                    showPendingOAuthHint={!selectedStoreReady && !!selectedStore}
                    url={product.url}
                    onUrlChange={product.setUrl}
                    loading={product.loading}
                    onScrapeProduct={product.scrapeProduct}
                    collectionUrl={collection.collectionUrl}
                    onCollectionUrlChange={collection.setCollectionUrl}
                    loadingCollection={collection.loadingCollection}
                    onScrapeCollection={collection.scrapeCollection}
                  />
                )}

                {collection.collectionData && (
                  <CollectionImport
                    collectionData={collection.collectionData}
                    selectedStore={selectedStore}
                    importingCollection={collection.importingCollection}
                    setImportingCollection={collection.setImportingCollection}
                    setCollectionImportStatus={collection.setCollectionImportStatus}
                    setCollectionData={collection.setCollectionData}
                    setCollectionUrl={collection.setCollectionUrl}
                  />
                )}

                {product.productData && (
                  <ProductImport
                    productData={product.productData}
                    editableTitle={product.editableTitle}
                    setEditableTitle={product.setEditableTitle}
                    editableHandle={product.editableHandle}
                    setEditableHandle={product.setEditableHandle}
                    editablePrice={product.editablePrice}
                    setEditablePrice={product.setEditablePrice}
                    editableComparePrice={product.editableComparePrice}
                    setEditableComparePrice={product.setEditableComparePrice}
                    editableDescriptionHtml={product.editableDescriptionHtml}
                    setEditableDescriptionHtml={product.setEditableDescriptionHtml}
                    editableOptions={product.editableOptions}
                    setEditableOptions={product.setEditableOptions}
                    editableVariants={product.editableVariants}
                    setEditableVariants={product.setEditableVariants}
                    selectedStore={selectedStore}
                    collections={collections}
                    isTaxable={product.isTaxable}
                    setIsTaxable={product.setIsTaxable}
                    trackStock={product.trackStock}
                    setTrackStock={product.setTrackStock}
                    selectedCollections={product.selectedCollections}
                    setSelectedCollections={product.setSelectedCollections}
                    addingToStore={product.addingToStore}
                    setAddingToStore={product.setAddingToStore}
                    translating={product.translating}
                    setTranslating={product.setTranslating}
                    setImportStatus={product.setImportStatus}
                    setTranslationStatus={product.setTranslationStatus}
                    languageSearch={product.languageSearch}
                    setLanguageSearch={product.setLanguageSearch}
                    onBack={product.reset}
                  />
                )}
              </>
            )}
          </div>

          <DashboardAddStoreModal
            open={storeConnect.showAddStoreModal}
            newStoreSubdomain={storeConnect.newStoreSubdomain}
            onSubdomainChange={storeConnect.setNewStoreSubdomain}
            newStoreAlias={storeConnect.newStoreAlias}
            onAliasChange={storeConnect.setNewStoreAlias}
            newClientId={storeConnect.newClientId}
            onClientIdChange={storeConnect.setNewClientId}
            newClientSecret={storeConnect.newClientSecret}
            onClientSecretChange={storeConnect.setNewClientSecret}
            storeError={storeConnect.storeError}
            addingStore={storeConnect.addingStore}
            onConnect={storeConnect.startShopifyOAuth}
            onClose={() => {
              storeConnect.setShowAddStoreModal(false);
              storeConnect.resetForm();
            }}
          />
        </>
      )}
    </div>
  );
}
