import serviceHe from './first-year/service.he.json';
import serviceRu from './first-year/service.ru.json';
import pricingHe from './first-year/pricing.he.json';
import pricingRu from './first-year/pricing.ru.json';
import type { Locale } from './routes';
const messages = {
  service: { he: serviceHe, ru: serviceRu },
  pricing: { he: pricingHe, ru: pricingRu },
};
export function firstYearMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: first-year.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for first-year.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
