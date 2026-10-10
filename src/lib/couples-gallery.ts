import type { Locale } from '~/i18n/routes';
import russianAlts from '~/i18n/couples/gallery-images.ru.json';
import type { ImageMetadata } from 'astro';
// Curated shared couples gallery. Add new photographs explicitly when ready for publication.
// Explicit selection and descriptions visually checked; do not auto-publish new folder contents.
const selection = [
  {
    filename: 'גבר_ואישה_מתחבקים_על_רקע_קיר_לבנים_צילומי_זוגיות.jpg',
    alt: 'זוג מתחבק ומחייך באור טבעי',
  },
  {
    filename: 'זוג_מתחבק_על_מדרגות_צילום_מלמטה_צילומי_זוגיות_במרכז.jpg',
    alt: 'זוג מתנשק בראש מדרגות במעבר אבן',
  },
  {
    filename: 'צילומי_זוגיות_בים.jpg',
    alt: 'זוג על רקע הים והחוף',
  },
  {
    filename: 'זוג_יושבים_ברכב_צילומי_זוגיות.jpg',
    alt: 'זוג מחייך בתוך רכב',
  },
  {
    filename: 'צילום_רחב_זוג_על_רקע_מבנה_בנמל_קיסריה_צלמת_מומלצת.jpg',
    alt: 'זוג תחת קשת אבן בנמל קיסריה',
  },
  {
    filename: 'גבר_בחולצה_לבנה_ובחורה_עם_חצאית_אדומה_צלמת_מומלצת_במרכז.jpg',
    alt: 'זוג מחייך לצד קיר אבן',
  },
  {
    filename: 'בחור_ובחורה_עומדים_ליד_חלון_בכיתה_צילומי_זוגיות.jpg',
    alt: 'זוג ליד חלון בכיתה באור טבעי',
  },
  {
    filename: 'זוג_בכיתה_עם_לוח_ירוק_צילומי_זוגיות.jpg',
    alt: 'זוג ליד שולחן ולוח ירוק בכיתה',
  },
  {
    filename: 'זוג_בסגנון_בית_ספר_צילומי_זוגיות.jpg',
    alt: 'זוג יושב ליד לוח בכיתה',
  },
  {
    filename: 'זוג_ברקע_לוח_ירוק_צילומי_זוגיות.jpg',
    alt: 'זוג עומד מול לוח ירוק',
  },
  {
    filename: 'זוג_ליד_קיר_צילומי_זוגיות.jpg',
    alt: 'זוג במסדרון פתוח באור רך',
  },
  {
    filename: 'זוג_מתחבק_ליד_קיר_לבנים_בנמל_קיסריה_צילומי_טראש.jpg',
    alt: 'זוג מתחבק ליד קיר אבן',
  },
  {
    filename: 'זוג_עומדים_אחד_ליד_השניה_אור_שמש_רך_צילומי_בוקר.jpg',
    alt: 'דיוקן זוגי על רקע קיר אבן',
  },
  {
    filename: 'זוג_עומדים_ליד_קיר_לבנים_בקיסריה_צלמת_זוגיות_מומלצת.jpg',
    alt: 'זוג ברגע קרוב ליד קיר אבן',
  },
  {
    filename: 'צילום_מקרוב_זוג_יפה_מתחבק_צלמת_זוגיות_מקצועית.jpg',
    alt: 'דיוקן קרוב של זוג מתחבק',
  },
  {
    filename: 'צילומי_זוגיות_בים_במרכז.jpg',
    alt: 'זוג מחובק מול הים',
  },
  {
    filename: 'צילומי_זוגיות_במרכז_בטבע.jpg',
    alt: 'זוג במדרגות אבן בשחור לבן',
  },
  {
    filename: 'צילומי_זוגיות_זוג_במדרגות.jpg',
    alt: 'זוג נשען על מעקה מדרגות',
  },
  {
    filename: 'צילומי_זוגיות_זוג_ליד_דלת_יפה.jpg',
    alt: 'זוג עומד בפתח דלת מקושתת',
  },
  {
    filename: 'צילומי_זוגיות_צילומי_טראש.jpg',
    alt: 'זוג מתחבק על רקע מבנה אבן',
  },
  {
    filename: 'קמפיין_צילומי_זוגיות_זוג_על_רקע_חול.jpg',
    alt: 'זוג בצילום מלמעלה על רקע חול',
  },
  {
    filename: 'בחור_עומד_ליד_קיר_לבנים_בקיסריה_אור_שמש_רך_צלם_זוגיות_מקצועי.jpg',
    alt: 'גבר בחולצה לבנה נשען על קיר אבן',
  },
  {
    filename: 'בחורה_בחצאית_אדומה_ליד_קיר_לבנים_צילומי_זוגיות_מקצועיים.jpg',
    alt: 'אישה בחצאית אדומה לצד קיר אבן',
  },
  {
    filename: 'בחורה_ליד_קיר_לבנים_אור_שמש_רך_צילומי_זוגיות_בטבע.jpg',
    alt: 'דיוקן אישה לצד קשת אבן',
  },
  {
    filename: 'בחורה_ליד_קיר_לבנים_בקיסריה_צלם_זוגיות_מומלץ.jpg',
    alt: 'אישה באור שמש לצד חלון אבן',
  },
];
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/couples_gallery/*.jpg', { eager: true });
export const couplesGalleryImages = selection.map(({ filename, alt }) => {
  const image = files[`/src/assets/couples_gallery/${filename}`]?.default;
  if (!image) throw new Error(`Missing couples gallery image: ${filename}`);
  return { image, alt, filename };
});
export const couplesFeaturedImages = couplesGalleryImages.slice(0, 3);
export const couplesHeroImage = couplesGalleryImages[0];

export function getCouplesGalleryImages(locale: Locale) {
  if (locale === 'he') return couplesGalleryImages;
  return couplesGalleryImages.map((image) => {
    const alt = (russianAlts as Record<string, string>)[image.filename];
    if (!alt) throw new Error(`Missing Russian couples image description: ${image.filename}`);
    return { ...image, alt };
  });
}
