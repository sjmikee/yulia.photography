import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'סוגי צילומים',
      href: getPermalink('/services'),
      links: [
        {
          text: 'זוגיות',
          href: getPermalink('/services/couples-photography'),
        },
        {
          text: 'זוגיות אינטימי',
          href: getPermalink('/services/intimate-couples-photography'),
        },
        {
          text: 'בוק אישי',
          href: getPermalink('/services/personal-photography'),
        },
        {
          text: 'נשיות ובודואר',
          href: getPermalink('/services/feminine-photography'),
        },
        {
          text: 'הריון',
          href: getPermalink('/services/pregnancy-photography'),
        },
        {
          text: 'משפחה',
          href: getPermalink('/services/family-photography'),
        },
        {
          text: 'גיל שנה',
          href: getPermalink('/services/first-year-photography'),
        },
      ],
    },
    {
      text: 'גלריה',
      links: [
        {
          text: 'צילומי זוגיות',
          href: getPermalink('/gallery/couples'),
        },
        {
          text: 'צילומים אישיים',
          href: getPermalink('/gallery/solo'),
        },
        { text: 'צילומי נשיות', href: getPermalink('/gallery/feminine') },
        {
          text: 'צילומי הריון',
          href: getPermalink('/gallery/pregnancy'),
        },
      ],
    },
    {
      text: 'מחירון',
      href: getPermalink('/pricing'),
      links: [
        {
          text: 'זוגיות',
          href: getPermalink('/pricing/couples'),
        },
        {
          text: 'זוגיות אינטימי',
          href: getPermalink('/pricing/couples-intimate'),
        },
        {
          text: 'בוק אישי',
          href: getPermalink('/pricing/personal'),
        },
        {
          text: 'נשיות ובודואר',
          href: getPermalink('/pricing/feminine'),
        },
        {
          text: 'הריון',
          href: getPermalink('/pricing/pregnancy'),
        },
        {
          text: 'משפחה',
          href: getPermalink('/pricing/family'),
        },
        {
          text: 'גיל שנה',
          href: getPermalink('/pricing/first-year'),
        },
      ],
    },
    {
      text: 'טיפים',
      href: getPermalink('/articles'),
    },
    {
      text: 'קצת עלי',
      href: getPermalink('/about'),
    },
    {
      text: 'צור קשר',
      href: getPermalink('/contact'),
    },
  ],
  actions: [{ text: 'דברו איתי', href: 'tel:0525836940', target: '_blank', icon: 'tabler:phone' }],
};

export const footerData = {
  links: [
    {
      title: 'סוגי הצילומים',
      links: [
        {
          text: 'זוגיות',
          href: getPermalink('/services/couples-photography'),
        },
        {
          text: 'זוגיות אינטימי',
          href: getPermalink('/services/intimate-couples-photography'),
        },
        {
          text: 'בוק אישי',
          href: getPermalink('/services/personal-photography'),
        },
        {
          text: 'נשיות ובודואר',
          href: getPermalink('/services/feminine-photography'),
        },
        {
          text: 'הריון',
          href: getPermalink('/services/pregnancy-photography'),
        },
        {
          text: 'משפחה',
          href: getPermalink('/services/family-photography'),
        },
        {
          text: 'גיל שנה',
          href: getPermalink('/services/first-year-photography'),
        },
      ],
    },
    {
      title: 'גלריה',
      links: [
        { text: 'צילומי זוגיות', href: getPermalink('/gallery/couples') },
        { text: 'צילומים אישיים', href: getPermalink('/gallery/solo') },
        { text: 'צילומי נשיות', href: getPermalink('/gallery/feminine') },
        { text: 'צילומי הריון', href: getPermalink('/gallery/pregnancy') },
      ],
    },
    {
      title: 'מחירון',
      links: [
        { text: 'זוגיות', href: getPermalink('/pricing/couples') },
        { text: 'זוגיות אינטימי', href: getPermalink('/pricing/couples-intimate') },
        { text: 'בוק אישי', href: getPermalink('/pricing/personal') },
        { text: 'נשיות ובודואר', href: getPermalink('/pricing/feminine') },
        { text: 'הריון', href: getPermalink('/pricing/pregnancy') },
        { text: 'משפחה', href: getPermalink('/pricing/family') },
        { text: 'גיל שנה', href: getPermalink('/pricing/first-year') },
      ],
    },
    {
      links: [
        { text: 'טיפים', href: getPermalink('/articles') },
        { text: 'קצת עלי', href: getPermalink('/about') },
        { text: 'צור קשר', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'הצהרת נגישות', href: getPermalink('/terms') },
    { text: 'פרטיות', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/koren_yulia/' },
  ],
  footNote: `
    יוליה קורנסקי · כל הזכויות שמורות
  `,
};
