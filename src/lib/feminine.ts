import type { Locale } from '~/i18n/routes';
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

export const femininePackageFacts = [
  { minutes: 45, photosFrom: 20, photosTo: 25 },
  { minutes: 90, photosFrom: 25, photosTo: 35 },
  { minutes: 120, photosFrom: 35, photosTo: 45 },
] as const;

// Existing published package details; prices remain in the site's central price list.
export const femininePackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['נשיות'][1],
    duration: '45 דקות',
    photos: `לפחות ${femininePackageFacts[0].photosFrom}–${femininePackageFacts[0].photosTo}`,
    fit: 'מזכרת ממוקדת, בקצב נעים',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['נשיות'][2],
    duration: 'שעה וחצי',
    photos: `לפחות ${femininePackageFacts[1].photosFrom}–${femininePackageFacts[1].photosTo}`,
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['נשיות'][3],
    duration: 'כשעתיים',
    photos: `לפחות ${femininePackageFacts[2].photosFrom}–${femininePackageFacts[2].photosTo}`,
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

export const feminineFacts = [
  { label: 'מי מצלמת ואיפה?', value: 'יוליה קורנסקי · צילומי נשיות ובודואר בחולון ובמרכז הארץ.' },
  {
    label: 'כמה עולה הסשן?',
    value: `חבילות צילומי חוץ החל מ־${femininePackages[0].price} ש״ח. סטודיו בתוספת תשלום ובתיאום מראש.`,
  },
  { label: 'מה מקבלים?', value: 'הכוונה לפני הצילום ובמהלכו, תמונות בעריכה מלאה לפי החבילה וגלריה דיגיטלית להורדה.' },
  { label: 'מתי התמונות מגיעות?', value: 'עד 14 ימי עסקים מיום הצילום.' },
];

/** Localized presentation shares the existing numeric prices and package IDs. */
export function getFeminine(locale: Locale) {
  if (locale === 'he')
    return {
      packages: femininePackages,
      journey: feminineJourney,
      service: feminineService,
      whatsapp: feminineWhatsApp,
      cards: femininePricingCards,
      facts: feminineFacts,
    };
  const whatsapp = (
    message = 'Здравствуйте, Юлия! Хочу узнать о женской и будуарной съёмке и свободных датах. Хотелось бы съёмку в __, в стиле __.'
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
  const packages = femininePackages.map((p, index) => ({
    ...p,
    ...copy[index],
    photos: `не менее ${femininePackageFacts[index].photosFrom}–${femininePackageFacts[index].photosTo}`,
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
      ],
      callToAction: {
        text: `Узнать даты — ${p.title}`,
        href: whatsapp(
          `Здравствуйте, Юлия! Интересует женская и будуарная съёмка, пакет «${p.title}». Какие даты свободны?`
        ),
        target: '_blank',
      },
    }));
  const journey: PhotoshootJourney = {
    label: 'Подробнее о женской и будуарной съёмке',
    links: [
      { id: 'service', href: '/ru' + feminineLinks.service, label: 'Как проходит съёмка' },
      { id: 'pricing', href: '/ru' + feminineLinks.pricing, label: 'Цены и пакеты' },
      { id: 'gallery', href: '/ru' + feminineLinks.gallery, label: 'Галерея' },
    ],
    contact: {
      title: 'Запланируем время только для вас?',
      description:
        'Напишите, какой стиль вам понравился и где хотелось бы сниматься. Вместе выберем место, пакет и дату. Уметь позировать не нужно — я помогу.',
      action: { text: 'Давайте выберем дату', href: whatsapp(), target: '_blank', icon: 'tabler:brand-whatsapp' },
      phone: { href: feminineJourney.contact.phone.href, label: 'Удобнее позвонить? 052-5836940' },
    },
  };
  const service: PhotoshootService = {
    name: 'Женская и будуарная фотосессия в Холоне и центре Израиля',
    serviceType: 'Женская и будуарная фотосессия',
    url: '/ru' + feminineLinks.service,
    areaServed: ['Холон', 'Центр Израиля'],
    offers: packages.map((p) => ({
      name: p.title,
      price: p.price,
      description: `${p.photos} фотографий в полной обработке и онлайн-галерея. Съёмка на природе, примерная продолжительность: ${p.duration}. Студия — за дополнительную плату.`,
      url: `/ru${feminineLinks.pricing}#${p.id}`,
    })),
  };
  const facts = [
    {
      label: 'Кто фотографирует и где?',
      value: 'Юлия Коренская · женская и будуарная съёмка в Холоне и центре Израиля.',
    },
    {
      label: 'Сколько стоит съёмка?',
      value: `Пакеты съёмки на улице от ${packages[0].price} ₪. Студия — за дополнительную плату и по предварительной договорённости.`,
    },
    {
      label: 'Что вы получите?',
      value:
        'Подготовку и помощь во время съёмки, фотографии в полной обработке по выбранному пакету и онлайн-галерею для скачивания.',
    },
    { label: 'Когда будут готовы фотографии?', value: 'В течение 14 рабочих дней после съёмки.' },
  ];
  return { packages, cards, journey, service, whatsapp, facts };
}
