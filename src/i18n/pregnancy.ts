import serviceHe from './pregnancy/service.he.json';
import serviceRu from './pregnancy/service.ru.json';
import pricingHe from './pregnancy/pricing.he.json';
import pricingRu from './pregnancy/pricing.ru.json';
import galleryHe from './pregnancy/gallery.he.json';
import galleryRu from './pregnancy/gallery.ru.json';
import type { Locale } from './routes';
const messages = {
  service: { he: serviceHe, ru: serviceRu },
  pricing: { he: pricingHe, ru: pricingRu },
  gallery: { he: galleryHe, ru: galleryRu },
};
export function pregnancyMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: pregnancy.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for pregnancy.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
