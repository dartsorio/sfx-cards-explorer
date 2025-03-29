
export interface Tag {
  name: string;
  count?: number;
}

export interface Season {
  name: string;
  path: string;
  tags: string[];
}

export interface Category {
  name: string;
  path: string;
  seasons: Season[];
}

export interface Sound {
  id: string;
  title: string;
  season: string;
  category: string;
  tags: string[];
  path: string;
  thumbnailPath: string;
  description: string;
  source: string;
  wikiLink: string;
}

export interface TokuData {
  categories: Category[];
  sounds: Sound[];
}

export interface SoundFormData {
  title: string;
  category: string;
  season: string;
  tags: string[];
  description: string;
  source: string;
  wikiLink: string;
}

export interface FilterState {
  search: string;
  category: string;
  season: string;
  tags: string[];
}
