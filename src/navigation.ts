import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'גלריה',
      links: [
        {
          text: 'משפחה',
          href: getPermalink('/#features'),
        },
        {
          text: 'הנקה',
          href: getPermalink('/services'),
        },
        {
          text: 'הריון',
          href: getPermalink('/pricing'),
        },
        {
          text: 'גיל שנה',
          href: getPermalink('/about'),
        },
        {
          text: 'עירום',
          href: getPermalink('/contact'),
        },
      ],
    },
    {
      text: 'מחירון',
      href: getPermalink('/pricing'),
    },
    {
      text: 'טיפים חשובים',
      href: getPermalink('/blog'),
    },
    {
      text: 'מי אני',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: 'דברו איתי', href: 'https://github.com/onwidget/astrowind', target: '_blank', icon: 'tabler:phone' }],
};

export const footerData = {
  links: [],
  secondaryLinks: [
    { text: 'הצהרת נגישות', href: getPermalink('/terms') },
  ],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'TikTok', icon: 'tabler:brand-tiktok', href: '#' },
  ],
  footNote: `
    יוליה · כל הזכויות שמורות
  `,
};
