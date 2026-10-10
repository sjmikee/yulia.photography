import homeHe from './home/home.he.json';
import homeRu from './home/home.ru.json';
import reviewsHe from './home/reviews.he.json';
import reviewsRu from './home/reviews.ru.json';
import type { Locale } from './routes';
const messages = {
  home: { he: homeHe, ru: homeRu },
  reviews: { he: reviewsHe, ru: reviewsRu },
};
export function homeMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: home.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for home.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
