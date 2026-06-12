export type ImageModel = {
  id: string;
  name: string;
  endpoint: string;
  requiresImage: boolean;
  usesImageArray: boolean;
  supportsNumImages: boolean;
  supportsAspectRatio: boolean;
  supportsResolution: boolean;
  supportsImageSize: boolean;
  supportsQuality: boolean;
  supportsStyle: boolean;
  styleOptions?: { value: string; label: string }[];
};

export const FAL_MODELS: ImageModel[] = [
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    endpoint: 'fal-ai/nano-banana-2/edit',
    requiresImage: true,
    usesImageArray: true,
    supportsNumImages: true,
    supportsAspectRatio: true,
    supportsResolution: true,
    supportsImageSize: false,
    supportsQuality: false,
    supportsStyle: false,
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    endpoint: 'fal-ai/nano-banana-pro/edit',
    requiresImage: true,
    usesImageArray: true,
    supportsNumImages: true,
    supportsAspectRatio: true,
    supportsResolution: true,
    supportsImageSize: false,
    supportsQuality: false,
    supportsStyle: false,
  },
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    endpoint: 'openai/gpt-image-2/edit',
    requiresImage: true,
    usesImageArray: true,
    supportsNumImages: true,
    supportsAspectRatio: false,
    supportsResolution: false,
    supportsImageSize: true,
    supportsQuality: true,
    supportsStyle: false,
  },
  {
    id: 'ideogram-v2-edit',
    name: 'Ideogram V2 Edit',
    endpoint: 'fal-ai/ideogram/v2/edit',
    requiresImage: true,
    usesImageArray: false,
    supportsNumImages: false,
    supportsAspectRatio: false,
    supportsResolution: false,
    supportsImageSize: false,
    supportsQuality: false,
    supportsStyle: true,
    styleOptions: [
      { value: 'auto', label: 'Auto' },
      { value: 'realistic', label: 'Realistic' },
      { value: 'design', label: 'Design' },
      { value: 'render_3D', label: '3D Render' },
      { value: 'anime', label: 'Anime' },
      { value: 'general', label: 'General' },
    ],
  },
];

export function getModelById(id: string): ImageModel | undefined {
  return FAL_MODELS.find((m) => m.id === id);
}

export const ASPECT_RATIOS = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
] as const;

export const IMAGE_SIZES = [
  { value: 'auto', label: 'Auto' },
  { value: 'square_hd', label: 'Square HD' },
  { value: 'landscape_4_3', label: 'Landscape 4:3' },
  { value: 'portrait_4_3', label: 'Portrait 3:4' },
  { value: 'landscape_16_9', label: 'Landscape 16:9' },
  { value: 'portrait_16_9', label: 'Portrait 9:16' },
] as const;

export const RESOLUTIONS = ['1K', '2K', '4K'] as const;
export const QUALITIES = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;
