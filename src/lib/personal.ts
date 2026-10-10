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

export const personalPackageFacts = [
  { minutes: 45, photosFrom: 30, photosTo: 40 },
  { minutes: 90, photosFrom: 40, photosTo: 50 },
  { minutes: 120, photosFrom: 50, photosTo: 70 },
] as const;

// Preserve published personal prices, quantities, durations and premium inclusions.
export const personalPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['בוק-אישי'][1],
    duration: '45 דקות',
    photos: `לפחות ${personalPackageFacts[0].photosFrom}–${personalPackageFacts[0].photosTo}`,
    fit: 'סשן קצר וממוקד למזכרת אישית או לתמונות פרופיל',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['בוק-אישי'][2],
    duration: 'שעה וחצי',
    photos: `לפחות ${personalPackageFacts[1].photosFrom}–${personalPackageFacts[1].photosTo}`,
    fit: 'יותר זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['בוק-אישי'][3],
    duration: 'כשעתיים',
    photos: `לפחות ${personalPackageFacts[2].photosFrom}–${personalPackageFacts[2].photosTo}`,
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

/** Localized presentation shares package IDs and prices with the Hebrew site. */
export function getPersonal(locale: import('~/i18n/routes').Locale) {
  if (locale === 'he')
    return {
      packages: personalPackages,
      cards: personalPricingCards,
      journey: personalJourney,
      service: personalService,
      whatsapp: personalWhatsApp,
      facts: personalFacts,
    };
  const whatsapp = (message = 'Здравствуйте, Юлия! Хочу узнать об индивидуальной фотосессии и свободных датах.') =>
    personalWhatsApp(message);
  const copy = [
    { title: 'Базовый', duration: '45 минут', fit: 'Короткая съёмка для себя или новых фото профиля', extra: '' },
    {
      title: 'Классический',
      duration: 'Полтора часа',
      fit: 'Больше времени привыкнуть к камере и разнообразить кадры',
      extra: '',
    },
    {
      title: 'Премиальный',
      duration: 'Около двух часов',
      fit: 'Большая коллекция кадров и время для смены образа',
      extra: 'До двух образов и перерывы по необходимости',
    },
  ];
  const packages = personalPackages.map((p, index) => ({
    ...p,
    ...copy[index],
    photos: `не менее ${personalPackageFacts[index].photosFrom}–${personalPackageFacts[index].photosTo}`,
  }));
  const cards: Price[] = [...packages].reverse().map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    subtitle: p.fit,
    highlight: `${p.photos} фотографий в полной тщательной обработке`,
    hasRibbon: p.id === 'classic',
    ribbonTitle: 'Рекомендую',
    items: [
      { description: `Примерная продолжительность: ${p.duration}` },
      { description: 'Подготовка к съёмке и рекомендации по одежде' },
      { description: 'Подсказки в течение всей съёмки, в вашем темпе' },
      { description: 'Онлайн-галерея для скачивания в высоком качестве' },
      ...(p.extra ? [{ description: p.extra }] : []),
    ],
    callToAction: {
      text: 'Узнать даты в WhatsApp',
      href: whatsapp(
        `Здравствуйте, Юлия! Интересует индивидуальная фотосессия, пакет «${p.title}». Какие даты свободны?`
      ),
      target: '_blank',
      'data-lead-source': `personal-package-${p.id}`,
    },
  }));
  const journey: PhotoshootJourney = {
    label: 'Подробнее об индивидуальной фотосессии',
    links: [
      { id: 'service', href: '/ru' + personalLinks.service, label: 'Как проходит съёмка' },
      { id: 'pricing', href: '/ru' + personalLinks.pricing, label: 'Цены и пакеты' },
      { id: 'gallery', href: '/ru' + personalLinks.gallery, label: 'Галерея' },
    ],
    contact: {
      title: 'Ваш новый портрет начинается с разговора',
      description:
        'Какие фотографии вам хотелось бы получить? Пришлите вдохновение из галереи или расскажите, для чего нужны снимки. Вместе превратим идею в съёмку с вашим характером.',
      action: {
        text: 'Задать вопрос и узнать даты в WhatsApp',
        href: whatsapp(),
        target: '_blank',
        icon: 'tabler:brand-whatsapp',
        'data-lead-source': 'personal-bottom-cta',
      },
      phone: { href: personalJourney.contact.phone.href, label: 'Удобнее позвонить? 052-5836940' },
    },
  };
  const service: PhotoshootService = {
    name: 'Индивидуальная фотосессия в центре Израиля',
    serviceType: 'Индивидуальная фотосессия',
    url: '/ru' + personalLinks.service,
    areaServed: ['Центр Израиля'],
    offers: packages.map((p) => ({
      name: p.title,
      price: p.price,
      description: `${p.photos} фотографий в полной обработке, помощь с позированием и онлайн-галерея для скачивания. Примерная продолжительность: ${p.duration}. Место съёмки и возможная оплата локации согласовываются заранее.`,
      url: `/ru${personalLinks.pricing}#${p.id}`,
    })),
  };
  const facts = [
    {
      label: 'Кто фотографирует и где?',
      value: 'Юлия Коренская · Центр Израиля. У моря, на природе, в городе или в студии по договорённости.',
    },
    {
      label: 'Сколько стоит индивидуальная съёмка?',
      value: `Пакеты за ${packages.map((p) => p.price).join(', ')} ₪, включая помощь с позированием и полную обработку.`,
    },
    {
      label: 'Нужен опыт перед камерой?',
      value: 'Нет. Индивидуальные подсказки входят в съёмку, от подготовки до работы перед камерой.',
    },
    {
      label: 'Когда будут готовы фотографии?',
      value: 'В течение 14 рабочих дней после съёмки, в онлайн-галерее для скачивания в высоком качестве.',
    },
  ];
  return { packages, cards, journey, service, whatsapp, facts };
}
