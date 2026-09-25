import type { Price } from '~/types';
import type { PhotoshootPackage, PhotoshootJourney, PhotoshootService } from './photoshoots';
import { PRICES } from './pricing';

export const feminineLinks = {
  service: '/services/feminine-photography',
  pricing: '/pricing/feminine',
  gallery: '/gallery/feminine',
};
export const feminineWhatsApp = (
  message = 'היי יוליה, אשמח לבדוק תאריך לצילומי נשיות. מעדיפה צילומים ב__ בסגנון __.'
) => `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;

// Existing published package details; prices remain in the site's central price list.
export const femininePackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['נשיות'][1],
    duration: '45 דקות',
    photos: 'לפחות 20–25',
    fit: 'מזכרת ממוקדת, בקצב נעים',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['נשיות'][2],
    duration: 'שעה וחצי',
    photos: 'לפחות 25–35',
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['נשיות'][3],
    duration: 'כשעתיים',
    photos: 'לפחות 35–45',
    fit: 'יותר זמן לביטוי אישי ולשינוי הלבוש',
    extra: 'עד שתי תלבושות והפסקות לפי הצורך',
  },
];

export const femininePricingCards: Price[] = [...femininePackages]
  .sort((a, b) => b.price - a.price)
  .map((p) => ({
    id: p.id,
    title: p.title,
    highlight: `${p.photos} תמונות בעריכה מלאה`,
    subtitle: p.fit,
    price: p.price,
    hasRibbon: p.id === 'classic',
    ribbonTitle: 'הכי משתלם',
    items: [
      { description: `משך צילום משוער: ${p.duration}`, classes: { description: 'text-sm' } },
      { description: 'הכוונה לפני הצילום וטיפים ללבוש' },
      { description: 'גלריה דיגיטלית באיכות גבוהה להורדה' },
      ...(p.extra ? [{ description: p.extra }] : []),
    ],
    callToAction: {
      text: `לבדיקת תאריך — ${p.title}`,
      href: feminineWhatsApp(`היי יוליה, אשמח לפרטים ולבדיקת תאריך לצילומי נשיות — ${p.title}.`),
      target: '_blank',
    },
  }));
export const feminineJourney: PhotoshootJourney = {
  label: 'עוד על צילומי נשיות',
  links: [
    { id: 'service', href: feminineLinks.service, label: 'איך נראה הסשן' },
    { id: 'pricing', href: feminineLinks.pricing, label: 'מחירון וחבילות' },
    { id: 'gallery', href: feminineLinks.gallery, label: 'גלריית צילומי נשיות' },
  ],
  contact: {
    title: 'נתכנן רגע שהוא כולו שלך?',
    description:
      'כתבי לי איזה סגנון אהבת ואיפה תרצי להצטלם. נבחר יחד מקום, חבילה ותאריך. את לא צריכה לדעת להצטלם — בשביל זה אני כאן.',
    action: { text: 'בואי נבדוק תאריך', href: feminineWhatsApp(), target: '_blank', icon: 'tabler:brand-whatsapp' },
    phone: { href: 'tel:+972525836940', label: 'מעדיפה לדבר? 052-5836940' },
  },
};
export const feminineService: PhotoshootService = {
  name: 'צילומי נשיות ובודואר בחולון ובמרכז',
  serviceType: 'צילומי נשיות',
  url: feminineLinks.service,
  areaServed: ['חולון', 'מרכז הארץ'],
  offers: femininePackages.map((p) => ({
    name: p.title,
    price: p.price,
    description: `${p.photos} תמונות בעריכה מלאה וגלריה דיגיטלית בצילומי חוץ. משך צילום משוער: ${p.duration}. סטודיו בתוספת תשלום.`,
    url: `${feminineLinks.pricing}#${p.id}`,
  })),
};
