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
export const pregnancyPackages = [
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
