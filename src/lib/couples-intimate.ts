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
export const intimatePackageFacts = [
  { minutes: 45, photosFrom: 15, photosTo: 20 },
  { minutes: 90, photosFrom: 20, photosTo: 35 },
  { minutes: 120, photosFrom: 35, photosTo: 50 },
] as const;

// Preserve published package quantities, durations and prices.
export const intimatePackages: PhotoshootPackage[] = [
  {
    id: 'basic',
    title: 'חבילת בסיס',
    price: PRICES['זוגיות-אינטימי'][1],
    duration: '45 דקות',
    photos: `לפחות ${intimatePackageFacts[0].photosFrom}–${intimatePackageFacts[0].photosTo}`,
    fit: 'אוסף ממוקד של מבטים ורגעי קרבה',
    extra: '',
  },
  {
    id: 'classic',
    title: 'החבילה הקלאסית',
    price: PRICES['זוגיות-אינטימי'][2],
    duration: 'שעה וחצי',
    photos: `לפחות ${intimatePackageFacts[1].photosFrom}–${intimatePackageFacts[1].photosTo}`,
    fit: 'זמן להתרגל למצלמה ולגוון בתמונות',
    extra: '',
  },
  {
    id: 'premium',
    title: 'חבילת פרימיום',
    price: PRICES['זוגיות-אינטימי'][3],
    duration: 'כשעתיים',
    photos: `לפחות ${intimatePackageFacts[2].photosFrom}–${intimatePackageFacts[2].photosTo}`,
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

/** Localized presentation shares package IDs and prices with the Hebrew site. */
export function getIntimate(locale: import('~/i18n/routes').Locale) {
  if (locale === 'he')
    return {
      packages: intimatePackages,
      cards: intimatePricingCards,
      journey: intimateJourney,
      service: intimateService,
      whatsapp: intimateWhatsApp,
      facts: intimateFacts,
    };
  const whatsapp = (message = 'Здравствуйте, Юлия! Хотим узнать об интимной фотосессии для пары и свободных датах.') =>
    intimateWhatsApp(message);
  const copy = [
    { title: 'Базовый', duration: '45 минут', fit: 'Небольшая коллекция взглядов и моментов близости', extra: '' },
    {
      title: 'Классический',
      duration: 'Полтора часа',
      fit: 'Больше времени привыкнуть к камере и разнообразить кадры',
      extra: '',
    },
    {
      title: 'Премиальный',
      duration: 'Около двух часов',
      fit: 'Более широкая коллекция и время для смены образа',
      extra: 'До двух образов и перерывы по необходимости',
    },
  ];
  const packages = intimatePackages.map((p, index) => ({
    ...p,
    ...copy[index],
    photos: `не менее ${intimatePackageFacts[index].photosFrom}–${intimatePackageFacts[index].photosTo}`,
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
      { description: 'Приватная онлайн-галерея для скачивания в высоком качестве' },
      ...(p.extra ? [{ description: p.extra }] : []),
    ],
    callToAction: {
      text: 'Обсудить съёмку в WhatsApp',
      href: whatsapp(
        `Здравствуйте, Юлия! Интересует интимная фотосессия для пары, пакет «${p.title}». Какие даты свободны?`
      ),
      target: '_blank',
      'data-lead-source': `intimate-package-${p.id}`,
    },
  }));
  const journey: PhotoshootJourney = {
    label: 'Подробнее об интимной фотосессии для пары',
    links: [
      { id: 'service', href: '/ru' + intimateLinks.service, label: 'Как проходит съёмка' },
      { id: 'pricing', href: '/ru' + intimateLinks.pricing, label: 'Цены и пакеты' },
      { id: 'gallery', href: '/ru' + intimateLinks.gallery, label: 'Общая галерея парных съёмок' },
    ],
    contact: {
      title: 'Можно начать с вопроса',
      description:
        'Не нужно выбирать пакет, чтобы поговорить. Напишите, что вам интересно и что важно узнать. Вместе обсудим, подходит ли съёмка вам обоим, без обязательств.',
      action: {
        text: 'Задать вопрос и узнать даты в WhatsApp',
        href: whatsapp(),
        target: '_blank',
        icon: 'tabler:brand-whatsapp',
        'data-lead-source': 'intimate-bottom-cta',
      },
      phone: { href: intimateJourney.contact.phone.href, label: 'Удобнее позвонить? 052-5836940' },
    },
  };
  const service: PhotoshootService = {
    name: 'Интимная и чувственная фотосессия для пары в Холоне и центре Израиля',
    serviceType: 'Интимная фотосессия для пары',
    url: '/ru' + intimateLinks.service,
    areaServed: ['Холон', 'Центр Израиля'],
    offers: packages.map((p) => ({
      name: p.title,
      price: p.price,
      description: `${p.photos} фотографий в полной обработке, помощь с позированием и приватная онлайн-галерея для скачивания. Примерная продолжительность: ${p.duration}. Место съёмки и возможная оплата локации согласовываются заранее.`,
      url: `/ru${intimateLinks.pricing}#${p.id}`,
    })),
  };
  const facts = [
    {
      label: 'Кто фотографирует и где?',
      value: 'Юлия Коренская · Холон и центр Израиля. Место съёмки выбираем индивидуально.',
    },
    {
      label: 'Сколько стоит съёмка для пары?',
      value: `Пакеты за ${packages.map((p) => p.price).join(', ')} ₪, включая помощь с позированием и полную обработку.`,
    },
    {
      label: 'Нужен опыт перед камерой?',
      value: 'Нет. Подсказки входят в каждый пакет, а стиль и степень близости выбираем вместе с вами.',
    },
    {
      label: 'Когда будут готовы фотографии?',
      value: 'В течение 14 рабочих дней после съёмки, в приватной онлайн-галерее для скачивания в высоком качестве.',
    },
  ];
  return { packages, cards, journey, service, whatsapp, facts };
}
