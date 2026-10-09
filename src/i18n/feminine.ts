import serviceHe from './feminine/service.he.json';
import serviceRu from './feminine/service.ru.json';
import pricingHe from './feminine/pricing.he.json';
import pricingRu from './feminine/pricing.ru.json';
import galleryHe from './feminine/gallery.he.json';
import galleryRu from './feminine/gallery.ru.json';
import type { Locale } from './routes';
const messages = {
  service: { he: serviceHe, ru: serviceRu },
  pricing: { he: pricingHe, ru: pricingRu },
  gallery: { he: galleryHe, ru: galleryRu },
};
export function feminineMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: feminine.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for feminine.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
