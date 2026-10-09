import { headerData, footerData } from '~/navigation';
import type { Locale } from './routes';
export function navigation(locale: Locale) {
  if (locale === 'he') return { header: headerData, footer: footerData };
  const pregnancyLinks = [
    { text: 'О съёмке', href: '/ru/services/pregnancy-photography' },
    { text: 'Цены', href: '/ru/pricing/pregnancy' },
    { text: 'Галерея', href: '/ru/gallery/pregnancy' },
  ];
  const couplesLinks = [
    { text: 'О съёмке', href: '/ru/services/couples-photography' },
    { text: 'Цены', href: '/ru/pricing/couples' },
    { text: 'Галерея', href: '/ru/gallery/couples' },
  ];
  const intimateLinks = [
    { text: 'О съёмке', href: '/ru/services/intimate-couples-photography' },
    { text: 'Цены', href: '/ru/pricing/couples-intimate' },
    { text: 'Общая галерея', href: '/ru/gallery/couples' },
  ];
  const personalLinks = [
    { text: 'О съёмке', href: '/ru/services/personal-photography' },
    { text: 'Цены', href: '/ru/pricing/personal' },
    { text: 'Галерея', href: '/ru/gallery/solo' },
  ];
  const feminineLinks = [
    { text: 'О съёмке', href: '/ru/services/feminine-photography' },
    { text: 'Цены', href: '/ru/pricing/feminine' },
    { text: 'Галерея', href: '/ru/gallery/feminine' },
  ];
  const familyLinks = [
    { text: 'О съёмке', href: '/ru/services/family-photography' },
    { text: 'Цены', href: '/ru/pricing/family' },
  ];
  const categories = [
    { text: 'Беременность', links: pregnancyLinks },
    { text: 'Для пары', links: couplesLinks },
    { text: 'Интимная съёмка для пары', links: intimateLinks },
    { text: 'Индивидуальная съёмка', links: personalLinks },
    { text: 'Женская и будуарная съёмка', links: feminineLinks },
    { text: 'Семейная съёмка', links: familyLinks },
  ];
  const links = ['Съёмки', 'Цены', 'Галереи'].map((text, index) => ({
    text,
    links: categories
      .filter((category) => category.links[index])
      .filter(
        (category, position) =>
          index !== 2 ||
          categories
            .filter((other) => other.links[index])
            .findIndex((other) => other.links[index]?.href === category.links[index].href) === position
      )
      .map((category) => ({ text: category.text, href: category.links[index].href })),
  }));
  return {
    header: { links, actions: [{ text: 'Позвонить', href: 'tel:+972525836940', icon: 'tabler:phone' }] },
    footer: {
      links: [
        { title: 'Фотосессия беременности', links: pregnancyLinks },
        { title: 'Фотосессия для пары', links: couplesLinks },
        { title: 'Интимная съёмка для пары', links: intimateLinks },
        { title: 'Индивидуальная съёмка', links: personalLinks },
        { title: 'Женская и будуарная съёмка', links: feminineLinks },
        { title: 'Семейная съёмка', links: familyLinks },
        {
          title: 'Другие разделы — на иврите',
          links: [
            { text: 'Главная', href: '/' },
            { text: 'Все виды съёмки', href: '/services' },
            { text: 'Обо мне', href: '/about' },
            { text: 'Контакты', href: '/contact' },
          ],
        },
      ],
      secondaryLinks: [
        { text: 'Доступность (на иврите)', href: '/terms' },
        { text: 'Конфиденциальность (на иврите)', href: '/privacy' },
      ],
      socialLinks: footerData.socialLinks,
      footNote: 'Юлия Коренская · Все права защищены',
    },
  };
}
