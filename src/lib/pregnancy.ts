import type { Locale } from '~/i18n/routes';
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

// Shared quantities are independent of the language used to describe a package.
export const pregnancyPackageFacts = [
  { minutes: 45, photosFrom: 30, photosTo: 40 },
  { minutes: 90, photosFrom: 40, photosTo: 50 },
  { minutes: 120, photosFrom: 50, photosTo: 70 },
] as const;

// Existing published package details; prices remain in the site's central price list.
export const pregnancyPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['הריון'][1],
    duration: '45 דקות',
    photos: `לפחות ${pregnancyPackageFacts[0].photosFrom}–${pregnancyPackageFacts[0].photosTo}`,
    fit: 'מזכרת ממוקדת, בקצב נעים',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['הריון'][2],
    duration: 'שעה וחצי',
    photos: `לפחות ${pregnancyPackageFacts[1].photosFrom}–${pregnancyPackageFacts[1].photosTo}`,
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['הריון'][3],
    duration: 'כשעתיים',
    photos: `לפחות ${pregnancyPackageFacts[2].photosFrom}–${pregnancyPackageFacts[2].photosTo}`,
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

/** Localized presentation shares the existing numeric prices and package IDs. */
export function getPregnancy(locale: Locale) {
  if (locale === 'he')
    return {
      packages: pregnancyPackages,
      journey: pregnancyJourney,
      service: pregnancyService,
      whatsapp: pregnancyWhatsApp,
      cards: pregnancyPricingCards,
    };
  const whatsapp = (
    message = 'Здравствуйте, Юлия! Хочу узнать о съёмке беременности и свободных датах. Сейчас у меня __ недель, хотелось бы съёмку в __.'
  ) => `https://wa.me/972525836940?text=${encodeURIComponent(message)}`;
  const copy = [
    { title: 'Базовый', duration: '45 минут', fit: 'Небольшая коллекция памятных кадров в спокойном темпе', extra: '' },
    {
      title: 'Классический',
      duration: 'Полтора часа',
      fit: 'Время привыкнуть к камере и получить более разнообразные кадры',
      extra: '',
    },
    {
      title: 'Премиальный',
      duration: 'Около двух часов',
      fit: 'Больше времени для самовыражения и смены образа',
      extra: 'До двух образов и перерывы по необходимости',
    },
  ];
  const packages = pregnancyPackages.map((p, index) => ({
    ...p,
    ...copy[index],
    photos: `не менее ${pregnancyPackageFacts[index].photosFrom}–${pregnancyPackageFacts[index].photosTo}`,
  }));
  const cards: Price[] = [...packages]
    .sort((a, b) => b.price - a.price)
    .map((p) => ({
      id: p.id,
      title: p.title,
      highlight: `${p.photos} фотографий в полной обработке`,
      subtitle: p.fit,
      price: p.price,
      hasRibbon: p.id === 'classic',
      ribbonTitle: 'Выгодно',
      items: [
        { description: `Примерная продолжительность: ${p.duration}`, classes: { description: 'text-sm' } },
        { description: 'Подготовка к съёмке и рекомендации по одежде' },
        { description: 'Онлайн-галерея для скачивания в высоком качестве' },
        ...(p.extra ? [{ description: p.extra }] : []),
        { description: `Доплата за каждого ребёнка — ${pregnancyChildSupplement}\u00a0₪` },
      ],
      callToAction: {
        text: `Узнать даты — ${p.title}`,
        href: whatsapp(
          `Здравствуйте, Юлия! Интересует съёмка беременности, пакет «${p.title}». Какие даты свободны? Сейчас у меня __ недель.`
        ),
        target: '_blank',
      },
    }));
  const journey: PhotoshootJourney = {
    label: 'Подробнее о съёмке беременности',
    links: [
      { id: 'service', href: '/ru' + pregnancyLinks.service, label: 'Как проходит съёмка' },
      { id: 'pricing', href: '/ru' + pregnancyLinks.pricing, label: 'Цены и пакеты' },
      { id: 'gallery', href: '/ru' + pregnancyLinks.gallery, label: 'Галерея' },
    ],
    contact: {
      title: 'Запланируем время только для вас?',
      description:
        'Напишите, какой у вас срок беременности, кто придёт на съёмку и какой стиль понравился. Вместе выберем место, пакет и дату. Уметь позировать не нужно — я помогу.',
      action: { text: 'Давайте выберем дату', href: whatsapp(), target: '_blank', icon: 'tabler:brand-whatsapp' },
      phone: { href: pregnancyJourney.contact.phone.href, label: 'Удобнее позвонить? 052-5836940' },
    },
  };
  const service: PhotoshootService = {
    name: 'Фотосессия беременности на природе и у моря в Холоне и центре Израиля',
    serviceType: 'Фотосессия беременности',
    url: '/ru' + pregnancyLinks.service,
    areaServed: ['Холон', 'Центр Израиля'],
    offers: packages.map((p) => ({
      name: p.title,
      price: p.price,
      description: `${p.photos} фотографий в полной обработке и онлайн-галерея. Съёмка на природе, примерная продолжительность: ${p.duration}. Дети и студия — за дополнительную плату.`,
      url: `/ru${pregnancyLinks.pricing}#${p.id}`,
    })),
  };
  return { packages, cards, journey, service, whatsapp };
}
