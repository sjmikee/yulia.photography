import { type Locale, translatedPath } from './routes';
const taxonomy: Record<string, string> = {
  tips: 'Советы',
  photo: 'Фотография',
  family: 'Семья',
  couples: 'Пары',
  single: 'Индивидуальная съёмка',
  portrait: 'Портрет',
};
export const blogLabels = {
  taxonomy: (slug: string) => {
    if (!taxonomy[slug]) throw new Error(`Missing Russian article topic: ${slug}`);
    return taxonomy[slug];
  },
};
export const blogLink = (path: string, locale: Locale) => translatedPath(path, locale) ?? path;
export const articleDate = (date: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
