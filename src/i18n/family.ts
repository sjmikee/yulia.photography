import serviceHe from './family/service.he.json';
import serviceRu from './family/service.ru.json';
import pricingHe from './family/pricing.he.json';
import pricingRu from './family/pricing.ru.json';
import type { Locale } from './routes';
const messages = {
  service: { he: serviceHe, ru: serviceRu },
  pricing: { he: pricingHe, ru: pricingRu },
};
export function familyMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: family.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for family.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
