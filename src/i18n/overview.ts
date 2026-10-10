import servicesHe from './overview/services.he.json';
import servicesRu from './overview/services.ru.json';
import pricingHe from './overview/pricing.he.json';
import pricingRu from './overview/pricing.ru.json';
import type { Locale } from './routes';
const messages = {
  services: { he: servicesHe, ru: servicesRu },
  pricing: { he: pricingHe, ru: pricingRu },
};
export function overviewMessages<Page extends keyof typeof messages>(page: Page, locale: Locale) {
  return (key: keyof (typeof messages)[Page]['he'], ...values: (string | number)[]) => {
    const dictionary = messages[page][locale] as Record<string, string>;
    const message = dictionary[String(key)];
    if (message === undefined) throw new Error(`Missing ${locale} translation: overview.${page}.${String(key)}`);
    return message.replace(/\{(\d+)\}/g, (_, index) => {
      if (values[Number(index)] === undefined) throw new Error(`Missing value for overview.${page}.${String(key)}`);
      return String(values[Number(index)]);
    });
  };
}
