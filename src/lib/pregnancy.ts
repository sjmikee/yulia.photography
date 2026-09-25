import type { Price } from '~/types';
import type { PhotoshootPackage, PhotoshootJourney, PhotoshootService } from './photoshoots';
import { PRICES } from './pricing';

export const pregnancyLinks = {
  service: '/services/pregnancy-photography',
  pricing: '/pricing/pregnancy',
  gallery: '/gallery/pregnancy',
};
export const pregnancyWhatsApp = (
  message = 'היי יוליה, אשמח לבדוק תאריך לצילומי הריון. אני בשבוע __ ומעדיפה צילומים ב__.'
) => `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;

// Existing published package details; prices remain in the site's central price list.
export const pregnancyPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['הריון'][1],
    duration: '45 דקות',
    photos: 'לפחות 30–40',
    fit: 'מזכרת ממוקדת, בקצב נעים',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['הריון'][2],
    duration: 'שעה וחצי',
    photos: 'לפחות 40–50',
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['הריון'][3],
    duration: 'כשעתיים',
    photos: 'לפחות 50–70',
    fit: 'יותר זמן לביטוי אישי ולשינוי הלבוש',
    extra: 'עד שתי תלבושות והפסקות לפי הצורך',
  },
];
export const pregnancyChildSupplement = 100;

export const pregnancyPricingCards: Price[] = [...pregnancyPackages]
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
      { description: `כל ילד בתוספת ${pregnancyChildSupplement} ש״ח` },
    ],
    callToAction: {
      text: `לבדיקת תאריך — ${p.title}`,
      href: pregnancyWhatsApp(`היי יוליה, אשמח לפרטים ולבדיקת תאריך לצילומי הריון — ${p.title}. אני בשבוע __.`),
      target: '_blank',
    },
  }));
export const pregnancyJourney: PhotoshootJourney = {
  label: 'עוד על צילומי הריון',
  links: [
    { id: 'service', href: pregnancyLinks.service, label: 'איך נראה הסשן' },
    { id: 'pricing', href: pregnancyLinks.pricing, label: 'מחירון וחבילות' },
    { id: 'gallery', href: pregnancyLinks.gallery, label: 'גלריית צילומי הריון' },
  ],
  contact: {
    title: 'נתכנן רגע שהוא כולו שלך?',
    description:
      'כתבי לי באיזה שבוע את, מי מצטרף ואיזה סגנון אהבת. נבחר יחד מקום, חבילה ותאריך. את לא צריכה לדעת להצטלם — בשביל זה אני כאן.',
    action: { text: 'בואי נבדוק תאריך', href: pregnancyWhatsApp(), target: '_blank', icon: 'tabler:brand-whatsapp' },
    phone: { href: 'tel:+972525836940', label: 'מעדיפה לדבר? 052-5836940' },
  },
};
export const pregnancyService: PhotoshootService = {
  name: 'צילומי הריון בטבע ובים בחולון ובמרכז',
  serviceType: 'צילומי הריון',
  url: pregnancyLinks.service,
  areaServed: ['חולון', 'מרכז הארץ'],
  offers: pregnancyPackages.map((p) => ({
    name: p.title,
    price: p.price,
    description: `${p.photos} תמונות בעריכה מלאה וגלריה דיגיטלית בצילומי חוץ. משך צילום משוער: ${p.duration}. ילדים וסטודיו בתוספת תשלום.`,
    url: `${pregnancyLinks.pricing}#${p.id}`,
  })),
};
