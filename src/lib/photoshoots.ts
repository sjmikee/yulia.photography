import type { CallToAction } from '~/types';

export interface PhotoshootPackage {
  id: string;
  title: string;
  price: number;
  duration: string;
  photos: string;
  fit: string;
  extra: string;
}

export interface PhotoshootJourney {
  label: string;
  links: Array<{ id: string; href: string; label: string }>;
  contact: {
    title: string;
    description: string;
    action: CallToAction;
    phone: { href: string; label: string };
  };
}

export interface PhotoshootService {
  name: string;
  serviceType: string;
  url: string;
  areaServed: string[];
  offers: Array<{ name: string; price: number; description: string; url: string }>;
}
