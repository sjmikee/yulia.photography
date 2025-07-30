import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'גלריה',
      links: [
        {
          text: 'משפחה וזוגות',
          href: getPermalink('/gallery/family'),
        },
        {
          text: 'סולו',
          href: getPermalink('/gallery/solo'),
        },
      ],
    },
    {
      text: 'מחירון',
      href: getPermalink('/pricing'),
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
      title: 'גלריה',
      links: [
        { text: 'משפחה', href: '/gallery/family' },
        { text: 'סולו', href: '/gallery/solo' },
      ],
    },
    {
      links: [
        { text: 'מחירון', href: '/pricing' },
        { text: 'טיפים', href: '/blog' },
        { text: 'קצת עלי', href: '/about' },
        { text: 'צור קשר', href: '/contact' },
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
    יוליה קורן · כל הזכויות שמורות
  `,
};
