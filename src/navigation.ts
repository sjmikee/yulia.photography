import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'גלריה',
      links: [
        {
          text: 'משפחה',
          href: getPermalink('/gallery/family'),
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
      text: 'בלוג',
      href: getPermalink('/blog'),
    },
    {
      text: 'מי אני',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: 'דברו איתי', href: 'tel:0521234567', target: '_blank', icon: 'tabler:phone' }],
};

export const footerData = {
  links: [
    {
      title: 'גלריה',
      links: [
        { text: 'משפחה', href: 'gallery/family' },
        { text: 'הנקה', href: '#' },
        { text: 'גיל שנה', href: '#' },
        { text: 'הריון', href: '#' },
        { text: 'עירום', href: '#' },
      ],
    },
    {
      links: [
        { text: 'מחירון', href: 'pricing' },
        { text: 'טיפים חשובים', href: 'blog' },
        { text: 'מי אני', href: 'about' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'הצהרת נגישות', href: getPermalink('/terms') },
    { text: 'פרטיות', href: getPermalink('/privacy') },
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
