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

export const couplesPackageFacts = [
  { minutes: 45, photosFrom: 30, photosTo: 40 },
  { minutes: 90, photosFrom: 40, photosTo: 50 },
  { minutes: 120, photosFrom: 50, photosTo: 70 },
] as const;

// Preserve published regular-couples prices, quantities, durations and premium inclusions.
export const couplesPackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['זוגיות'][1],
    duration: '45 דקות',
    photos: `לפחות ${couplesPackageFacts[0].photosFrom}–${couplesPackageFacts[0].photosTo}`,
    fit: 'סשן קצר וממוקד למזכרת משותפת',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['זוגיות'][2],
    duration: 'שעה וחצי',
    photos: `לפחות ${couplesPackageFacts[1].photosFrom}–${couplesPackageFacts[1].photosTo}`,
    fit: 'יותר זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['זוגיות'][3],
    duration: 'כשעתיים',
    photos: `לפחות ${couplesPackageFacts[2].photosFrom}–${couplesPackageFacts[2].photosTo}`,
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

/** Localized presentation shares package IDs and prices with the Hebrew site. */
export function getCouples(locale: import('~/i18n/routes').Locale) {
  if (locale === 'he')
    return {
      packages: couplesPackages,
      cards: couplesPricingCards,
      journey: couplesJourney,
      service: couplesService,
      whatsapp: couplesWhatsApp,
      facts: couplesFacts,
    };
  const whatsapp = (message = 'Здравствуйте, Юлия! Хотим узнать о фотосессии для пары и свободных датах.') =>
    couplesWhatsApp(message);
  const copy = [
    { title: 'Базовый', duration: '45 минут', fit: 'Короткая съёмка на память о вас двоих', extra: '' },
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
  const packages = couplesPackages.map((p, index) => ({
    ...p,
    ...copy[index],
    photos: `не менее ${couplesPackageFacts[index].photosFrom}–${couplesPackageFacts[index].photosTo}`,
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
      href: whatsapp(`Здравствуйте, Юлия! Интересует фотосессия для пары, пакет «${p.title}». Какие даты свободны?`),
      target: '_blank',
      'data-lead-source': `couples-package-${p.id}`,
    },
  }));
  const journey: PhotoshootJourney = {
    label: 'Подробнее о фотосессии для пары',
    links: [
      { id: 'service', href: '/ru' + couplesLinks.service, label: 'Как проходит съёмка' },
      { id: 'pricing', href: '/ru' + couplesLinks.pricing, label: 'Цены и пакеты' },
      { id: 'gallery', href: '/ru' + couplesLinks.gallery, label: 'Галерея' },
    ],
    contact: {
      title: 'Какой момент вы хотите сохранить вместе?',
      description:
        'Напишите, если уже выбрали дату или место, или просто задайте вопрос. Вместе подумаем о вашей съёмке — выбирать пакет до разговора не обязательно.',
      action: {
        text: 'Задать вопрос и узнать даты в WhatsApp',
        href: whatsapp(),
        target: '_blank',
        icon: 'tabler:brand-whatsapp',
        'data-lead-source': 'couples-bottom-cta',
      },
      phone: { href: couplesJourney.contact.phone.href, label: 'Удобнее позвонить? 052-5836940' },
    },
  };
  const service: PhotoshootService = {
    name: 'Естественная фотосессия для пары в Холоне и центре Израиля',
    serviceType: 'Фотосессия для пары',
    url: '/ru' + couplesLinks.service,
    areaServed: ['Холон', 'Центр Израиля'],
    offers: packages.map((p) => ({
      name: p.title,
      price: p.price,
      description: `${p.photos} фотографий в полной обработке, помощь с позированием и онлайн-галерея для скачивания. Примерная продолжительность: ${p.duration}. Место съёмки и возможная оплата локации согласовываются заранее.`,
      url: `/ru${couplesLinks.pricing}#${p.id}`,
    })),
  };
  const facts = [
    {
      label: 'Кто фотографирует и где?',
      value: 'Юлия Коренская · Холон и центр Израиля. У моря, на природе, в городе или в студии по договорённости.',
    },
    {
      label: 'Сколько стоит съёмка для пары?',
      value: `Пакеты за ${packages.map((p) => p.price).join(', ')} ₪, включая помощь с позированием и полную обработку.`,
    },
    {
      label: 'Нужен опыт перед камерой?',
      value:
        'Нет. Начнём с прогулки, разговора и простых действий вдвоём. Я буду подсказывать на протяжении всей съёмки.',
    },
    {
      label: 'Когда будут готовы фотографии?',
      value: 'В течение 14 рабочих дней после съёмки, в онлайн-галерее для скачивания в высоком качестве.',
    },
  ];
  return { packages, cards, journey, service, whatsapp, facts };
}
