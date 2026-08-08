export type BaseLookupItem = {
  label: string;
  value: string;
  [key: string]: unknown;
};

export type BaseMenuItem = {
  label: string;
  slug: string;
  children?: BaseMenuItem[];
};

export type MenuItem = BaseMenuItem;

export type EventItem = {
  id: string;
  category: string;
  date: string;
  readingTime?: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  badge?: string;
};
