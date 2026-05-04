export type NavItem = {
  /**
   * When provided, this id is used to mark an item as active based on the
   * currently-visible section.
   */
  id?: string;
  label: string;
  href: string;
};

export type CollectionItem = {
  id: string;
  title: string;
  description?: string;
  tags?: readonly string[];
  image?: {
    src: string;
    alt: string;
  };
};

