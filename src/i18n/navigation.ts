import { headerData, footerData } from '~/navigation';
import { translatedPath, type Locale } from './routes';

// Translate the shared Hebrew navigation tree so order and grouping cannot drift.
const labels: Record<string, string> = {
  'סוגי צילומים': 'Съёмки',
  'סוגי הצילומים': 'Виды съёмки',
  גלריה: 'Галерея',
  מחירון: 'Цены',
  הריון: 'Беременность',
  'בוק אישי': 'Индивидуальная съёмка',
  זוגיות: 'Для пары',
  משפחה: 'Семейная съёмка',
  'נשיות ובודואר': 'Женская и будуарная съёмка',
  'זוגיות אינטימי': 'Интимная съёмка для пары',
  'גיל שנה': 'Первый день рождения',
  'צילומי הריון': 'Беременность',
  'צילומי זוגיות': 'Для пары',
  'צילומים אישיים': 'Индивидуальная съёмка',
  'צילומי נשיות': 'Женская и будуарная съёмка',
  טיפים: 'Советы',
  'קצת עלי': 'Обо мне',
  'צור קשר': 'Контакты',
  'דברו איתי': 'Позвонить',
  'הצהרת נגישות': 'Доступность',
  פרטיות: 'Конфиденциальность',
};

type NavigationItem = {
  text?: string;
  title?: string;
  href?: string;
  links?: NavigationItem[];
};
function localize<T extends NavigationItem>(item: T): T {
  const translate = (text: string) => {
    const value = labels[text];
    if (!value) throw new Error(`Missing Russian navigation label: ${text}`);
    return value;
  };
  return {
    ...item,
    ...(item.text ? { text: translate(item.text) } : {}),
    ...(item.title ? { title: translate(item.title) } : {}),
    ...(item.href ? { href: translatedPath(item.href, 'ru') ?? item.href } : {}),
    ...(item.links ? { links: item.links.map(localize) } : {}),
  };
}

export function navigation(locale: Locale) {
  if (locale === 'he') return { header: headerData, footer: footerData };
  return {
    header: {
      ...headerData,
      links: headerData.links.map(localize),
      actions: headerData.actions.map(localize),
    },
    footer: {
      ...footerData,
      links: footerData.links.map(localize),
      secondaryLinks: footerData.secondaryLinks.map(localize),
      footNote: 'Юлия Коренская · Все права защищены',
    },
  };
}
