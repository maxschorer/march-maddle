export type DisplayType = 'text' | 'photo' | 'number' | 'money';

export type GridState = 'archived' | 'upcoming' | 'live';

export interface GridAttribute {
  key: string;
  closeFn: ((a: unknown, b: unknown) => boolean) | null;
  closeFnName: string | null;
  displayName: string;
  displayType: DisplayType;
  hasDirection: boolean;
}

export interface Grid {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  tagline: string;
  permalink: string;
  maxGuesses: number;
  attributes: GridAttribute[];
  category: string;
  active: boolean;
  state: GridState;
  audio_file: string | null;
}
