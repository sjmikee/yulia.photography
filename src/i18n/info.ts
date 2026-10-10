import aboutHe from './info/about.he.json';
import aboutRu from './info/about.ru.json';
import contactHe from './info/contact.he.json';
import contactRu from './info/contact.ru.json';
import type { Locale } from './routes';
const messages = {
  about: { he: aboutHe, ru: aboutRu },
  contact: { he: contactHe, ru: contactRu },
};
export function infoMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: info.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for info.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
