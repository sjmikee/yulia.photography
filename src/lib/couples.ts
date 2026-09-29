import type { Price } from '~/types';
import type { PhotoshootPackage, PhotoshootJourney, PhotoshootService } from './photoshoots';
import { PRICES } from './pricing';

export const couplesLinks = {
  service: '/services/couples-photography',
  pricing: '/pricing/couples',
  gallery: '/gallery/couples',
};
export const couplesWhatsApp = (message = 'היי יוליה, נשמח לשמוע על צילומי זוגיות ולבדוק תאריך שמתאים לנו.') =>
  `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;

// Preserve published regular-couples prices, quantities, durations and premium inclusions.
export const couplesPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['זוגיות'][1],
    duration: '45 דקות',
    photos: 'לפחות 30–40',
    fit: 'סשן קצר וממוקד למזכרת משותפת',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['זוגיות'][2],
    duration: 'שעה וחצי',
    photos: 'לפחות 40–50',
    fit: 'יותר זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['זוגיות'][3],
    duration: 'כשעתיים',
    photos: 'לפחות 50–70',
    fit: 'אוסף רחב יותר עם מקום להחלפת לבוש',
    extra: 'עד שתי תלבושות והפסקות לפי הצורך',
  },
];
export const couplesPricingCards: Price[] = [...couplesPackages].reverse().map((p) => ({
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
    { description: 'גלריה דיגיטלית באיכות גבוהה להורדה' },
    ...(p.extra ? [{ description: p.extra }] : []),
  ],
  callToAction: {
    text: 'לבדיקת תאריך בוואטסאפ',
    href: couplesWhatsApp(`היי יוליה, נשמח לשמוע על צילומי זוגיות — ${p.title}, ולבדוק תאריך.`),
    target: '_blank',
    'data-lead-source': `couples-package-${p.id}`,
  },
}));
export const couplesJourney: PhotoshootJourney = {
  label: 'עוד על צילומי זוגיות',
  links: [
    { id: 'service', href: couplesLinks.service, label: 'איך נראה הסשן' },
    { id: 'pricing', href: couplesLinks.pricing, label: 'מחירון וחבילות' },
    { id: 'gallery', href: couplesLinks.gallery, label: 'גלריית הזוגיות' },
  ],
  contact: {
    title: 'איזה רגע תרצו לזכור יחד?',
    description:
      'כתבו לי אם יש תאריך או מקום שחשבתם עליו, או פשוט שאלה שמעסיקה אתכם. נחשוב יחד על הסשן שלכם — בלי צורך לבחור חבילה לפני שמדברים.',
    action: {
      text: 'לשאלות ובדיקת תאריך בוואטסאפ',
      href: couplesWhatsApp(),
      target: '_blank',
      icon: 'tabler:brand-whatsapp',
      'data-lead-source': 'couples-bottom-cta',
    },
    phone: { href: 'tel:+972525836940', label: 'מעדיפים לדבר? 052-5836940' },
  },
};
export const couplesService: PhotoshootService = {
  name: 'צילום זוגיות טבעי בחולון ובמרכז',
  serviceType: 'צילומי זוגיות',
  url: couplesLinks.service,
  areaServed: ['חולון', 'מרכז הארץ'],
  offers: couplesPackages.map((p) => ({
    name: p.title,
    price: p.price,
    description: `${p.photos} תמונות בעריכה מלאה, הכוונה וגלריה דיגיטלית להורדה. משך משוער: ${p.duration}. מקום הצילום ועלויות לוקיישן, אם נדרשות, בתיאום מראש.`,
    url: `${couplesLinks.pricing}#${p.id}`,
  })),
};
export const couplesFacts = [
  { label: 'מי מצלמת ואיפה?', value: 'יוליה קורנסקי · חולון ומרכז הארץ. בים, בטבע, בעיר או בסטודיו בתיאום.' },
  {
    label: 'כמה עולה סשן זוגי?',
    value: `חבילות ב־${couplesPackages.map((p) => p.price).join(', ')} ש״ח, כולל הכוונה ועריכה מלאה.`,
  },
  { label: 'צריך ניסיון מול המצלמה?', value: 'לא. נתחיל בהליכה, בשיחה ובפעולות פשוטות יחד, עם הכוונה לאורך הצילום.' },
  { label: 'מתי מקבלים תמונות?', value: 'עד 14 ימי עסקים מיום הצילום, בגלריה דיגיטלית באיכות גבוהה להורדה.' },
];
