import serviceHe from './intimate/service.he.json';
import serviceRu from './intimate/service.ru.json';
import pricingHe from './intimate/pricing.he.json';
import pricingRu from './intimate/pricing.ru.json';
import type { Locale } from './routes';
const messages = {
  service: { he: serviceHe, ru: serviceRu },
  pricing: { he: pricingHe, ru: pricingRu },
};
export function intimateMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: intimate.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for intimate.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
