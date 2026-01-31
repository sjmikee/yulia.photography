import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'סוגי צילומים',
      href: getPermalink('/services'),
      links: [
        {
          text: 'הריון',
          href: getPermalink('/services/pregnancy-photography'),
        },
      ],
    },
    {
      text: 'גלריה',
      links: [
        {
          text: 'משפחה וזוגיות',
          href: getPermalink('/gallery/family'),
        },
        {
          text: 'צילומים אישיים',
          href: getPermalink('/gallery/solo'),
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
          href: getPermalink('/pricing/couples_intimate'),
        },
        {
          text: 'נשיות',
          href: getPermalink('/pricing/feminine'),
        },
        {
          text: 'הריון',
          href: getPermalink('/pricing/pregnancy'),
        },
        {
          text: 'בוק אישי',
          href: getPermalink('/pricing/personal'),
        },
        {
          text: 'גיל שנה',
          href: getPermalink('/pricing/first_year'),
        },
      ],
    },
    {
      text: 'טיפים',
      href: getPermalink('/blog'),
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
          text: 'הריון',
          href: getPermalink('/services/pregnancy-photography'),
        },
      ],
    },
    {
      title: 'גלריה',
      links: [
        { text: 'משפחה וזוגיות', href: getPermalink('/gallery/family') },
        { text: 'צילומים אישיים', href: getPermalink('/gallery/solo') },
      ],
    },
    {
      title: 'מחירון',
      links: [
        { text: 'זוגיות', href: getPermalink('/pricing/couples') },
        { text: 'זוגיות אינטימי', href: getPermalink('/pricing/couples_intimate') },
        { text: 'נשיות', href: getPermalink('/pricing/feminine') },
        { text: 'הריון', href: getPermalink('/pricing/pregnancy') },
        { text: 'בוק אישי', href: getPermalink('/pricing/personal') },
        { text: 'גיל שנה', href: getPermalink('/pricing/first_year') },
      ],
    },
    {
      links: [
        { text: 'טיפים', href: getPermalink('/blog') },
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
