import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { MetaDataOpenGraph as OpenGraph } from '~/types';

const load = async function () {
  let images: Record<string, () => Promise<unknown>> | undefined = undefined;
  try {
    images = import.meta.glob('~/assets/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // continue regardless of error
  }
  return images;
};

let _images: Record<string, () => Promise<unknown>> | undefined = undefined;

/** */
export const fetchLocalImages = async () => {
  _images = _images || (await load());
  return _images;
};

/** */
export const findImage = async (
  imagePath?: string | ImageMetadata | null
): Promise<string | ImageMetadata | undefined | null> => {
  // Not string
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Absolute paths
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Relative paths or not "~/assets/"
  if (!imagePath.startsWith('~/assets/')) {
    return imagePath;
  }

  const images = await fetchLocalImages();
  const key = imagePath.replace('~/', '/src/');

  return images && typeof images[key] === 'function'
    ? ((await images[key]()) as { default: ImageMetadata })['default']
    : null;
};

/** Resolve sharing images once, retaining their translated descriptions and real dimensions. */
export const adaptOpenGraphImages = async (openGraph: OpenGraph = {}, astroSite?: URL): Promise<OpenGraph> => {
  const images = await Promise.all(
    (openGraph.images ?? []).map(async (image) => {
      const source = await findImage(image.url);
      if (!source) throw new Error(`Sharing image not found: ${image.url}`);

      // Public and remote files already have stable URLs; do not route them through /_image.
      if (typeof source === 'string') {
        return { ...image, url: new URL(source, astroSite).href };
      }

      // Keep the whole photograph visible, including vertical portraits.
      const width = Math.min(1200, source.width);
      const result = await getImage({
        src: source,
        width,
        format: 'jpg',
        quality: 85,
      });
      return {
        url: new URL(result.src, astroSite).href,
        width: Number(result.attributes.width),
        height: Number(result.attributes.height),
        alt: image.alt,
      };
    })
  );
  return { ...openGraph, images };
};
