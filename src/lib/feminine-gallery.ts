import type { ImageMetadata } from 'astro';

// All photographs in feminine_gallery, in curated display order; descriptions visually checked.
const selection = [
  { filename: 'Hela-45.jpg', alt: 'אישה בגופייה אפורה וג׳ינס מחייכת ליד דלת' },
  { filename: 'Hela-106.jpg', alt: 'אישה בלבוש לבן מול קיר גרפיטי צבעוני' },
  { filename: 'Hela-133.jpg', alt: 'דיוקן מחויך לצד שולחן פסיפס' },
  { filename: 'Hela-97.jpg', alt: 'אישה בחולצה ירקרקה ליד דלת עץ' },
  { filename: 'Hela-115.jpg', alt: 'אישה יושבת על מדרגות מתחת לעץ' },
  { filename: 'Hela-99.jpg', alt: 'דיוקן קרוב לצד דלת עץ כהה' },
  { filename: 'Hela-137.jpg', alt: 'אישה יושבת בחוץ לצד פנס עגול' },
  { filename: 'Hela-51.jpg', alt: 'דיוקן באור טבעי בגופייה אפורה' },
  { filename: 'Hela-73.jpg', alt: 'אישה מחייכת ונשענת קדימה בחלל מוצל' },
  { filename: 'feminine_pricing.jpg', alt: 'אישה בגופייה לבנה וחצאית פרחונית בחלל אבן' },

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
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/feminine_gallery/*.jpg', { eager: true });
export const feminineGalleryImages = selection.map(({ filename, alt }) => {
  const image = files[`/src/assets/feminine_gallery/${filename}`]?.default;
  if (!image || !alt) throw new Error(`Missing feminine gallery image or description: ${filename}`);
  return { image, alt, filename };
});

const selectedImage = (filename: string) => {
  const entry = feminineGalleryImages.find((image) => image.filename === filename);
  if (!entry) throw new Error(`Missing selected feminine image: ${filename}`);
  return entry;
};
export const feminineFeaturedImages = [
  selectedImage('Hela-45.jpg'),
  selectedImage('Hela-97.jpg'),
  selectedImage('feminine_pricing.jpg'),
];
export const feminineHeroImage = selectedImage('Hela-45.jpg');
export const feminineStudioImage = selectedImage('בחורה_בסטודיו_יושבת_על_כיסא_גבוה_עם_תאורה_אדומה_צילומי_תדמית.jpg');
export const feminineOutdoorImage = selectedImage('Hela-115.jpg');

export const feminineHomepageImages = [...feminineFeaturedImages, selectedImage('Hela-133.jpg')];
