import type { Locale } from '~/i18n/routes';
import pregnancyRu from '~/i18n/pregnancy/gallery-images.ru.json';
import feminineRu from '~/i18n/feminine/gallery-images.ru.json';
import { feminineHomepageImages } from './feminine-gallery';
import type { ImageMetadata } from 'astro';
import { pregnancyImageDescriptions } from './pregnancy-gallery';

const files = import.meta.glob<{ default: ImageMetadata }>(
  ['/src/assets/couples_gallery/*.jpg', '/src/assets/pregnancy_index/*.jpg', '/src/assets/solo_index/*.jpg'],
  { eager: true }
);

const photo = (folder: string, filename: string, alt: string) => {
  const image = files[`/src/assets/${folder}/${filename}`]?.default;
  if (!image || !alt) throw new Error(`Missing homepage image or description: ${folder}/${filename}`);
  return { image, alt };
};

export const couplesHomepageImages = [
  'צילומי_זוגיות_זוג_ליד_דלת_יפה.jpg',
  'צילום_מקרוב_זוג_יפה_מתחבק_צלמת_זוגיות_מקצועית.jpg',
  'צילומי_זוגיות_בים.jpg',
  'צילומי_זוגיות_זוג_במדרגות.jpg',
].map((filename) => photo('couples_gallery', filename, filename.replace('.jpg', '').replaceAll('_', ' ')));

export const pregnancyHomepageImages = [
  ['1-Inbal-17.jpg', 'Inbal-17.jpg'],
  ['2-rotem&bar-15.jpg', 'rotem&bar-15.jpg'],
  ['Inbal_Orig-4.jpg', 'Inbal_Orig-4.jpg'],
  ['4-Zehava&Idan-15.jpg', 'Zehava&Idan-15.jpg'],
].map(([filename, descriptionKey]) => photo('pregnancy_index', filename, pregnancyImageDescriptions[descriptionKey]));

export const personalHomepageImages = [
  ['א_גבר_עומד_במעבר_ביפו_העתיקה_צילומים_אישיים.jpg', 'גבר עומד במעבר ביפו העתיקה'],
  ['ב_בחורה_עומדת_ליד_קיר_לבנים_עתיק_עם_אור_שמש_עליה_צילומי_אישיים.jpg', 'אישה ליד קיר לבנים באור שמש'],
  ['בחורה_יושבת_על_הריצפה_על_רקע_לבן_בסטודיו_צילומי_תדמית.jpg', 'אישה יושבת על רצפת הסטודיו על רקע לבן'],
  ['בחורה_עם_מששקפי_שמש_עומדת_מאחורי_חלון_עם_סורגים_צילומי_תדמית_.jpg', 'אישה במשקפי שמש מאחורי חלון עם סורגים'],
].map(([filename, alt]) => photo('solo_index', filename, alt));

/** Preserve the homepage selection while localizing its photo descriptions. */
export function getHomepageImages(locale: Locale) {
  const localize = (images: typeof couplesHomepageImages, descriptions: string[]) =>
    images.map((image, index) => ({ ...image, alt: locale === 'ru' ? descriptions[index] : image.alt }));
  return {
    couples: localize(couplesHomepageImages, [
      'Пара у красивой двери',
      'Крупный портрет обнимающейся пары',
      'Фотосессия пары у моря',
      'Пара на лестнице',
    ]),
    pregnancy: localize(
      pregnancyHomepageImages,
      ['Inbal-17.jpg', 'rotem&bar-15.jpg', 'Inbal_Orig-4.jpg', 'Zehava&Idan-15.jpg'].map(
        (key) => (pregnancyRu as Record<string, string>)[key]
      )
    ),
    personal: localize(personalHomepageImages, [
      'Мужчина в проходе в старом Яффо',
      'Женщина у кирпичной стены в солнечном свете',
      'Женщина сидит на полу студии на белом фоне',
      'Женщина в солнечных очках за окном с решёткой',
    ]),
    feminine: feminineHomepageImages.map((image) => ({
      ...image,
      alt: locale === 'ru' ? (feminineRu as Record<string, string>)[image.filename] : image.alt,
    })),
  };
}
