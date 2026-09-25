import type { ImageMetadata } from 'astro';

// Curated from photographs already used on the feminine service page; visually checked.
const selection = [
  {
    filename: 'בחורה_בסטודיו_יושבת_על_כיסא_גבוה_עם_תאורה_אדומה_צילומי_תדמית.jpg',
    alt: 'אישה יושבת על כיסא גבוה בסטודיו בתאורה ורודה',
  },
  {
    filename: 'בחורה_יושבת_ביער_על_ספסל_עץ_אור_שמש_נכנס_בין_העצים_בוק_אישי.jpg',
    alt: 'אישה בחולצה משובצת יושבת על ספסל בין העצים',
  },
  {
    filename: 'בחורה_יושבת_על_הריצפה_על_רקע_לבן_בסטודיו_צילומי_תדמית.jpg',
    alt: 'אישה יושבת על רצפת הסטודיו על רקע בהיר',
  },
  {
    filename: 'בחורה_יושבת_על_הרצפה_בתוך_מבנה_נטוש_אור_שמש_נכנס_מהחלון_צילומי_תדמית.jpg',
    alt: 'אישה יושבת לצד חלונות באור שמש',
  },
  {
    filename: 'בחורה_ליד_מסגרת_עץ_שחור_לבן_פורטר_בוק_אישי_צילום_תדמית.jpg',
    alt: 'דיוקן בשחור לבן לצד מסגרת עץ',
  },
  {
    filename: 'בחורה_על_רקע_שיחים_בשחור_לבן_פורטר_בוק_אישי.jpg',
    alt: 'דיוקן מחויך בשחור לבן על רקע שיחים',
  },
];
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/solo_gallery/*.jpg', { eager: true });
export const feminineGalleryImages = selection.map(({ filename, alt }) => {
  const image = files[`/src/assets/solo_gallery/${filename}`]?.default;
  if (!image || !alt) throw new Error(`Missing feminine gallery image or description: ${filename}`);
  return { image, alt };
});
