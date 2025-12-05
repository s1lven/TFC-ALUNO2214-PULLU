'use client'

import { useState } from 'react'
import { Upload, Sparkles, Palette, Trash2 } from 'lucide-react'

// Custom slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 12px;
    background: #9333ea;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 12px;
    background: #9333ea;
    border-radius: 4px;
    cursor: pointer;
    border: none;
  }
`

export default function CreateShotPage() {
  const [productImages, setProductImages] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [numImages, setNumImages] = useState(1)
  const [removeMetadata, setRemoveMetadata] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setProductImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (productImages.length === 0) {
      alert('Please upload at least one product image first')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-shot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productImages,
          description,
          style: selectedStyle,
          aspectRatio,
          numImages,
          removeMetadata
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Generation completed:', result.data)
        // Set the generated images from the API response
        if (result.data && result.data.images && result.data.images.length > 0) {
          setGeneratedImages(result.data.images.map((img: any) => img.url))
        } else if (result.images && result.images.length > 0) {
          // Handle direct response format
          setGeneratedImages(result.images.map((img: any) => img.url))
        }
      } else {
        console.error('Generation failed:', result.message)
        alert(`Generation failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Error calling generate API:', error)
      alert('Failed to start generation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const aspectRatios = ['1:1', '9:16', '16:9', '4:3']
  const styles = ['Minimalist', 'Luxury', 'Streetwear', 'Vintage', 'Modern', 'Artistic']

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div className="flex h-full gap-6">
      {/* Left Panel - Controls */}
      <div className="w-80 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Create shot</h1>
          <p className="text-sm text-neutral-400">Add a product and describe your shot</p>
        </div>

        {/* Product Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">Prompt</label>
          <input
            type="file"
            id="product-upload"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="w-full min-h-32 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
            {productImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group w-full h-20 bg-neutral-700 rounded-lg flex items-center justify-center">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <label
              htmlFor="product-upload"
              className="flex flex-col items-center justify-center w-full h-20 bg-neutral-800 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-600 transition-colors"
            >
              <Upload className="w-5 h-5 text-neutral-500 mb-1" />
              <span className="text-xs text-neutral-400">
                {productImages.length > 0 ? 'Add more images' : 'Add product images'}
              </span>
            </label>
          </div>

          <input
            type="text"
            placeholder="Describe the shot (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-3 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">Style</label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 flex items-center justify-between"
            >
              <span>{selectedStyle || 'Choose style'}</span>
              <svg
                className={`w-4 h-4 text-neutral-400 transition-transform ${openDropdown === 'style' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'style' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-2 gap-1 p-1">
                  {styles.map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setSelectedStyle(style)
                        setOpenDropdown(null)
                      }}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="w-20 h-20 bg-neutral-700 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-neutral-400">IMG</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">Aspect ratio</label>
          <div className="flex gap-2">
            {aspectRatios.map((ratio) => {
              const getAspectRatioStyle = (ratio: string) => {
                switch (ratio) {
                  case '1:1':
                    return 'w-3 h-3' // Square
                  case '9:16':
                    return 'w-2 h-3' // Portrait
                  case '16:9':
                    return 'w-3 h-2' // Landscape
                  case '4:3':
                    return 'w-3 h-2' // Standard
                  default:
                    return 'w-3 h-2'
                }
              }

              return (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    aspectRatio === ratio
                      ? 'bg-neutral-700 text-white'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className={`border border-current rounded-[1px] ${getAspectRatioStyle(ratio)}`} />
                  {ratio}
                </button>
              )
            })}
          </div>
        </div>

        {/* Number of Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">Number of Images</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="4"
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((numImages - 1) / 3) * 100}%, #404040 ${((numImages - 1) / 3) * 100}%, #404040 100%)`
                }}
              />
            </div>
            <input
              type="number"
              min="1"
              max="4"
              value={numImages}
              onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
              className="w-12 h-8 bg-neutral-800 border border-neutral-700 rounded text-white text-sm text-center focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        {/* Remove Metadata Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-300">Remove metadata</span>
            <button
              type="button"
              onClick={() => setRemoveMetadata(!removeMetadata)}
              className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors focus:outline-none ${
                removeMetadata ? 'bg-purple-600' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-6 transform rounded-full bg-white transition-transform ${
                  removeMetadata ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${
            isGenerating 
              ? 'bg-neutral-600 cursor-not-allowed' 
              : 'bg-neutral-700 hover:bg-neutral-600'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate (10 credits)'}
        </button>
      </div>

      {/* Right Panel - Generated Images */}
      <div className="flex-1 flex flex-col">
        {generatedImages.length > 0 ? (
          <div className="h-full overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-2">Generated Images</h3>
              <p className="text-sm text-neutral-400">{generatedImages.length} image(s) generated</p>
            </div>
            <div className="space-y-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="inline-block relative group">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="max-w-full max-h-96 w-auto h-auto rounded-lg border border-neutral-800"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = imageUrl
                      link.download = `generated-image-${index + 1}.jpg`
                      link.click()
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-400 mb-2">No generations yet</h3>
              <p className="text-sm text-neutral-500">Upload an image and click generate to create your shots</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
