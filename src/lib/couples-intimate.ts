import type { Price } from '~/types';
import type { PhotoshootPackage, PhotoshootJourney, PhotoshootService } from './photoshoots';
import { PRICES } from './pricing';
export const intimateLinks = {
  service: '/services/intimate-couples-photography',
  pricing: '/pricing/couples-intimate',
  gallery: '/gallery/couples',
};
export const intimateWhatsApp = (
  message = 'היי יוליה, נשמח לשמוע על צילומי זוגיות אינטימיים ולבדוק אם הסשן מתאים לנו.'
) => `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;
// Preserve published package quantities, durations and prices.
export const intimatePackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['זוגיות-אינטימי'][1],
    duration: '45 דקות',
    photos: 'לפחות 15–20',
    fit: 'אוסף ממוקד של מבטים ורגעי קרבה',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['זוגיות-אינטימי'][2],
    duration: 'שעה וחצי',
    photos: 'לפחות 20–35',
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['זוגיות-אינטימי'][3],
    duration: 'כשעתיים',
    photos: 'לפחות 35–50',
    fit: 'אוסף רחב יותר ומקום לשינוי הלבוש',
    extra: 'עד שתי תלבושות והפסקות לפי הצורך',
  },
];
export const intimatePricingCards: Price[] = [...intimatePackages].reverse().map((p) => ({
  id: p.id,
  title: p.title,
  price: p.price,
  subtitle: p.fit,
  highlight: `${p.photos} תמונות בעריכה מוקפדת ומלאה`,
  hasRibbon: p.id === 'classic',
  ribbonTitle: 'מומלצת',
  items: [
    { description: `משך צילום משוער: ${p.duration}` },
    { description: 'הכוונה מלאה לפני הצילום וטיפים ללבוש' },
    { description: 'ליווי והכוונה לאורך הסשן, בקצב שלכם' },
    { description: 'גלריה דיגיטלית פרטית באיכות גבוהה להורדה' },
    ...(p.extra ? [{ description: p.extra }] : []),
  ],
  callToAction: {
    text: 'לבדיקת התאמה בוואטסאפ',
    href: intimateWhatsApp(`היי יוליה, נשמח לשמוע על צילומי זוגיות אינטימיים — ${p.title}, ולבדוק תאריך.`),
    target: '_blank',
    'data-lead-source': `intimate-package-${p.id}`,
  },
}));
export const intimateJourney: PhotoshootJourney = {
  label: 'עוד על צילומי זוגיות אינטימיים',
  links: [
    { id: 'service', href: intimateLinks.service, label: 'איך נראה הסשן' },
    { id: 'pricing', href: intimateLinks.pricing, label: 'מחירון וחבילות' },
    { id: 'gallery', href: intimateLinks.gallery, label: 'גלריית הזוגיות המשותפת' },
  ],
  contact: {
    title: 'אפשר להתחיל רק בשאלה',
    description:
      'לא צריך לבחור חבילה כדי לדבר. כתבו לי מה מסקרן אתכם ומה חשוב לכם לדעת, ונבדוק יחד אם הסשן מתאים לשניכם — בלי התחייבות.',
    action: {
      text: 'לשאלות ובדיקת תאריך בוואטסאפ',
      href: intimateWhatsApp(),
      target: '_blank',
      icon: 'tabler:brand-whatsapp',
      'data-lead-source': 'intimate-bottom-cta',
    },
    phone: { href: 'tel:+972525836940', label: 'מעדיפים לדבר? 052-5836940' },
  },
};
export const intimateService: PhotoshootService = {
  name: 'צילומי זוגיות אינטימיים וחושניים בחולון ובמרכז',
  serviceType: 'צילומי זוגיות אינטימיים',
  url: intimateLinks.service,
  areaServed: ['חולון', 'מרכז הארץ'],
  offers: intimatePackages.map((p) => ({
    name: p.title,
    price: p.price,
    description: `${p.photos} תמונות בעריכה מלאה, הכוונה וגלריה דיגיטלית פרטית. משך משוער: ${p.duration}. מקום הצילום ועלויות לוקיישן, אם נדרשות, בתיאום מראש.`,
    url: `${intimateLinks.pricing}#${p.id}`,
  })),
};
export const intimateFacts = [
  { label: 'מי מצלמת ואיפה?', value: 'יוליה קורנסקי · חולון ומרכז הארץ. לוקיישן בתיאום אישי.' },
  {
    label: 'כמה עולה הסשן?',
    value: `חבילות ב־${intimatePackages.map((p) => p.price).join(', ')} ש״ח, עם הכוונה ועריכה מלאה.`,
  },
  {
    label: 'צריך ניסיון מול המצלמה?',
    value: 'לא. ההכוונה כלולה בכל חבילה, והסגנון ורמת הקרבה נבחרים יחד איתכם.',
  },
  { label: 'מתי מקבלים תמונות?', value: 'עד 14 ימי עסקים מיום הצילום, בגלריה דיגיטלית פרטית להורדה.' },
];
