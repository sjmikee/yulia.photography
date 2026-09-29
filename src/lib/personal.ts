import type { Price } from '~/types';
import type { PhotoshootPackage, PhotoshootJourney, PhotoshootService } from './photoshoots';
import { PRICES } from './pricing';

export const personalLinks = {
  service: '/services/personal-photography',
  pricing: '/pricing/personal',
  gallery: '/gallery/solo',
};
export const personalWhatsApp = (message = 'היי יוליה, אשמח לשמוע על צילומי בוק אישי ולבדוק תאריך שמתאים לי.') =>
  `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;

// Preserve published personal prices, quantities, durations and premium inclusions.
export const personalPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['בוק-אישי'][1],
    duration: '45 דקות',
    photos: 'לפחות 30–40',
    fit: 'סשן קצר וממוקד למזכרת אישית או לתמונות פרופיל',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['בוק-אישי'][2],
    duration: 'שעה וחצי',
    photos: 'לפחות 40–50',
    fit: 'יותר זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['בוק-אישי'][3],
    duration: 'כשעתיים',
    photos: 'לפחות 50–70',
    fit: 'אוסף רחב יותר עם מקום להחלפת לבוש',
    extra: 'עד שתי תלבושות והפסקות לפי הצורך',
  },
];
export const personalPricingCards: Price[] = [...personalPackages].reverse().map((p) => ({
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
    { description: 'ליווי והכוונה לאורך הסשן, בקצב שלך' },
    { description: 'גלריה דיגיטלית באיכות גבוהה להורדה' },
    ...(p.extra ? [{ description: p.extra }] : []),
  ],
  callToAction: {
    text: 'לבדיקת תאריך בוואטסאפ',
    href: personalWhatsApp(`היי יוליה, אשמח לשמוע על צילומי בוק אישי — ${p.title}, ולבדוק תאריך.`),
    target: '_blank',
    'data-lead-source': `personal-package-${p.id}`,
  },
}));
export const personalJourney: PhotoshootJourney = {
  label: 'עוד על צילומי בוק אישי',
  links: [
    { id: 'service', href: personalLinks.service, label: 'איך נראה הסשן' },
    { id: 'pricing', href: personalLinks.pricing, label: 'מחירון וחבילות' },
    { id: 'gallery', href: personalLinks.gallery, label: 'גלריית הבוק האישי' },
  ],
  contact: {
    title: 'התמונה הבאה שלך מתחילה בשיחה',
    description:
      'איזו תמונה היית רוצה שתהיה לך? אפשר לשלוח השראה מהגלריה או לספר למה התמונות מיועדות. יחד נהפוך את הרעיון לסשן עם אופי משלך.',
    action: {
      text: 'לשאלות ובדיקת תאריך בוואטסאפ',
      href: personalWhatsApp(),
      target: '_blank',
      icon: 'tabler:brand-whatsapp',
      'data-lead-source': 'personal-bottom-cta',
    },
    phone: { href: 'tel:+972525836940', label: 'מעדיפים לדבר? 052-5836940' },
  },
};
export const personalService: PhotoshootService = {
  name: 'צילום אישי ובוק אישי במרכז',
  serviceType: 'צילומי בוק אישי',
  url: personalLinks.service,
  areaServed: ['מרכז הארץ'],
  offers: personalPackages.map((p) => ({
    name: p.title,
    price: p.price,
    description: `${p.photos} תמונות בעריכה מלאה, הכוונה וגלריה דיגיטלית להורדה. משך משוער: ${p.duration}. מקום הצילום ועלויות לוקיישן, אם נדרשות, בתיאום מראש.`,
    url: `${personalLinks.pricing}#${p.id}`,
  })),
};
export const personalFacts = [
  { label: 'מי מצלמת ואיפה?', value: 'יוליה קורנסקי · מרכז הארץ. בים, בטבע, בעיר או בסטודיו בתיאום.' },
  {
    label: 'כמה עולה סשן אישי?',
    value: `חבילות ב־${personalPackages.map((p) => p.price).join(', ')} ש״ח, כולל הכוונה ועריכה מלאה.`,
  },
  { label: 'צריך ניסיון מול המצלמה?', value: 'לא. הסשן כולל הכוונה אישית, מההכנה ועד הצילום עצמו.' },
  { label: 'מתי מקבלים תמונות?', value: 'עד 14 ימי עסקים מיום הצילום, בגלריה דיגיטלית באיכות גבוהה להורדה.' },
];
