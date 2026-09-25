import type { ImageMetadata } from 'astro';
// Descriptions checked against the existing photographs, not inferred from filenames.
export const pregnancyImageDescriptions: Record<string, string> = {
  'Inbal-17.jpg': 'אישה בהריון יושבת על סלע ליד הים בחולצה לבנה וג׳ינס',
  'Inbal-18.jpg': 'נעלי תינוק ורודות מונחות בידיים על בטן ההריון',
  'Inbal-24.jpg': 'חיוך באור שמש חם לצד סלעי החוף',
  'Inbal-4.jpg': 'צילום הריון בחולצה לבנה וג׳ינס מול הים',
  'Inbal-54.jpg': 'צללית של אישה בהריון מול השקיעה בים',
  'Inbal_Orig-4.jpg': 'אישה בהריון בשמלה לבנה בתנועה על סלעים ליד הים',
  'Osher&Ariel-16.jpg': 'זוג בחיבוק בצילומי הריון לצד קיר אבן וצמחייה',
  'Osher&Ariel-40.jpg': 'זוג יושב מחובק בבגדים כהים בצילום הריון',
  'Osher&Ariel-51.jpg': 'זוג עומד מול הים והשמש השוקעת בצילומי הריון',
  'Osher&Ariel-59.jpg': 'תמונת אולטרסאונד לצד בטן הריון באור השקיעה',
  'Osher&Ariel-63.jpg': 'זוג יושב על סלע מעל הים בשעת ערב',
  'Osher&Ariel-65.jpg': 'השתקפות זוג במראה המונחת בין צמחים',
  'Osher&Ariel-74.jpg': 'אישה מניחה ידיים על בטן ההריון לצד גזע עץ',
  'Osher&Ariel-75.jpg': 'דיוקן זוגי קרוב לצד עץ בצילומי הריון',
  'Zehava&Idan-15.jpg': 'רגע משחקי של זוג על סלעים ליד הים',
  'Zehava&Idan-23.jpg': 'זוג מחייך בצילומי הריון על החוף',
  'Zehava&Idan-58.jpg': 'זוג יושב מחובק על החול באור השקיעה',
  'Zehava&Idan-68.jpg': 'דיוקן זוגי עם חיוך עדין על רקע הים',
  'Zehava&Idan-9.jpg': 'זוג במשקפי שמש בצילומי הריון על החוף',
  'rotem&bar-15.jpg': 'אישה בהריון יושבת על ספסל בין העצים',
  'rotem&bar-29.jpg': 'דיוקן של אישה בהריון דרך מראה בטבע',
  'rotem&bar-3.jpg': 'זוג עומד מחובק בין עצים וצמחייה ירוקה',
  'rotem&bar-32.jpg': 'בני זוג מחזיקים יחד רצף תמונות אולטרסאונד',
  'rotem&bar-35.jpg': 'זוג יושב יחד על הדשא בין העצים',
  'rotem&bar-37.jpg': 'נעלי תינוק כחולות מוחזקות מול בטן ההריון',
  'rotem&bar-50.jpg': 'אישה בהריון בלבוש לבן וג׳ינס ליד עץ',
};

// Curated public selection: solo portraits, couples, nature, sea and a few details.
// The gallery folder contains only these selected photographs.
export const pregnancyGallerySelection = [
  'Inbal_Orig-4.jpg',
  'Osher&Ariel-51.jpg',
  'rotem&bar-3.jpg',
  'Inbal-17.jpg',
  'Zehava&Idan-23.jpg',
  'Osher&Ariel-74.jpg',
  'Inbal-24.jpg',
  'Osher&Ariel-16.jpg',
  'rotem&bar-15.jpg',
  'Zehava&Idan-15.jpg',
  'Inbal-18.jpg',
  'rotem&bar-29.jpg',
  'Osher&Ariel-40.jpg',
  'Inbal-4.jpg',
  'Zehava&Idan-58.jpg',
  'rotem&bar-35.jpg',
  'Inbal-54.jpg',
  'Osher&Ariel-75.jpg',
  'rotem&bar-37.jpg',
  'Zehava&Idan-9.jpg',
  'Osher&Ariel-65.jpg',
  'rotem&bar-32.jpg',
  'Zehava&Idan-68.jpg',
  'Osher&Ariel-63.jpg',
  'rotem&bar-50.jpg',
  'Osher&Ariel-59.jpg',
];

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/pregnancy_gallery/*.jpg', { eager: true });
export const pregnancyGalleryImages = pregnancyGallerySelection.map((filename) => {
  const image = files[`/src/assets/pregnancy_gallery/${filename}`]?.default;
  const alt = pregnancyImageDescriptions[filename];
  if (!image || !alt) throw new Error(`Missing pregnancy gallery image or description: ${filename}`);
  return { image, alt };
});
