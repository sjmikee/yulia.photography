import type { ImageMetadata } from 'astro';
// 25 visually curated portraits: varied people, settings and moods, with fewer repeated poses.
const selection = [
  {
    filename: 'גבר_צוחק_בחולצת_פסים_עומד_ברחוב_ביפו_העתיקה_בוק_אישי.jpg',
    alt: 'גבר מחייך בחולצת פסים ברחוב',
  },
  {
    filename: 'א_אישה_בחוף_הים_בשקיעה.jpg',
    alt: 'אישה בחוף סלעי בשקיעה',
  },
  {
    filename: 'סטודיו_גבר_יושב_על_כיסא_גבוה_עושה_פקצוף_מצחיק_צילומי_תדמית.jpg',
    alt: 'גבר יושב על כיסא גבוה בסטודיו',
  },
  {
    filename: 'צילומים_אישיים_בחורה_מקרוב.jpg',
    alt: 'דיוקן קרוב של אישה עם עניבה',
  },
  {
    filename: 'א_פנים_של_גבר_שעומד_בין_עלים_של_שיח_בוק_אישי.jpg',
    alt: 'דיוקן גבר בין עלים ירוקים',
  },
  {
    filename: 'אור_שמש_נופל_על_בחורה_שעומדת_בתוך_מבנה_האור_עובר_דרך_תריסים_צילום_תדמית.jpg',
    alt: 'אישה באור וצל מתריסים',
  },
  {
    filename: 'בחור_במשקפיים_צילומים_אישיים.jpg',
    alt: 'גבר בחולצה לבנה ומשקפיים',
  },
  {
    filename: 'בחורה_יושבת_בכיתה_צילום_אישי.jpg',
    alt: 'אישה יושבת על שולחן בכיתה',
  },
  {
    filename: 'בחור_בערב_יושב_על_כיסא_בוק_אישי.jpg',
    alt: 'גבר יושב על כיסא באור ערב',
  },
  {
    filename: 'בחורה_עם_מששקפי_שמש_עומדת_מאחורי_חלון_עם_סורגים_צילומי_תדמית.jpg',
    alt: 'אישה במשקפי שמש לצד חלון',
  },
  {
    filename: 'גבר_במעבר_מואר_באור_שמש_ביפו_העתיקה_בוק_אישי.jpg',
    alt: 'גבר במשקפי שמש בסמטת אבן',
  },
  {
    filename: 'פורטרט_הפוך_בחורה_בתוך_הים.jpg',
    alt: 'דיוקן אישה בתוך מי הים',
  },
  {
    filename: 'בחור_בלי_חולצה_יושב_על_הריצפה_צילומי_סולו.jpg',
    alt: 'דיוקן גבר נשען על מעקה בטון',
  },
  {
    filename: 'בחורה_עומדת_במדרגות_צילומים_אישיים.jpg',
    alt: 'אישה על גרם מדרגות',
  },
  {
    filename: 'בחור_עומד ליד_קיר_עץ_צילומים_אישיים.jpg',
    alt: 'גבר נשען על קיר עץ',
  },
  {
    filename: 'שדה_של_פרחים_צהובים_ובחורה_יושבת_בחולצה_אדומה_בוק_אישי.jpg',
    alt: 'אישה בחולצה אדומה בחוץ',
  },
  {
    filename: 'צילומי_פורטרט_בחור_יושב_בכיתה.jpg',
    alt: 'גבר יושב בכיתה ומביט אל האור',
  },
  {
    filename: 'בחורה_עם_משקםי_שמש_מציצה_מתוך_צמיג_ישן_של_מכונית_בוק.jpg',
    alt: 'אישה במשקפי שמש מציצה דרך צמיג',
  },
  {
    filename: 'בחור_בשקיעה_יושב_על_בלוק_קש_צילומים_אישיים.jpg',
    alt: 'גבר יושב על קש בשקיעה',
  },
  {
    filename: 'בחורה_ליד_קיר_בוק.jpg',
    alt: 'אישה בחולצה לבנה ועניבה ליד חלון',
  },
  {
    filename: 'חצי_פנים_של_גבר_וחצי_קיר_אבן_יפו_העתיקה_בוק_אישי.jpg',
    alt: 'דיוקן גבר לצד קיר אבן',
  },
  {
    filename: 'קיר_לבנים_צהובות_עם_מנורה_ישנה_למעלה_בחורה_עומדת_מתחת_בוק_אישי.jpg',
    alt: 'אישה תחת פנס על קיר אבן',
  },
  {
    filename: 'בחור_על_כיסא_צילומי_בוק.jpg',
    alt: 'גבר ליד כיסא בכיתה',
  },
  {
    filename: 'תחורה_עומדת_ליד_מסגרת_עץ_ישנה_ספוט_אור_עליה_בוק_אישי.jpg',
    alt: 'אישה עומדת ליד מסגרת עץ במבנה',
  },
  {
    filename: 'שחור_לבן_גבר_מסתכל_למרחק_צילומי_תדמית.jpg',
    alt: 'דיוקן גבר בשחור לבן',
  },
];
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/solo_gallery/*.jpg', { eager: true });
export const personalGalleryImages = selection.map(({ filename, alt }) => {
  const image = files[`/src/assets/solo_gallery/${filename}`]?.default;
  if (!image) throw new Error(`Missing personal gallery image: ${filename}`);
  return { image, alt, filename };
});
export const personalFeaturedImages = personalGalleryImages.slice(0, 3);
export const personalHeroImage = personalGalleryImages[0];
