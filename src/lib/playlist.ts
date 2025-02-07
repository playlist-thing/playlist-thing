interface BasePlaylistItem {
  id: number;
  seconds: number;
  notes: string;
}

export interface SongMetadata {
  artist: string;
  title: string;
  album: string;
  released: string;
  label: string;

  file: string;
  links: Record<string, string>;
}

interface Song extends BasePlaylistItem {
  tag: 'Song';
  content: SongMetadata;
}

interface AirBreak extends BasePlaylistItem {
  tag: 'AirBreak';
}

interface AirBreakWithBackgroundMusic extends BasePlaylistItem {
  tag: 'AirBreakWithBackgroundMusic';
  content: SongMetadata;
}

export type PlaylistItem = Song | AirBreak | AirBreakWithBackgroundMusic;

export const emptySongMetadata: SongMetadata = {
  artist: '',
  title: '',
  album: '',
  released: '',
  label: '',

  file: '',
  links: {}
};

export const emptySong: Song = {
  id: 0,
  seconds: 0,
  notes: '',

  tag: 'Song',
  content: emptySongMetadata
};

export const emptyAirBreak: AirBreak = {
  id: 0,
  seconds: 90,
  notes: '',

  tag: 'AirBreak'
};

interface Playlist {
  id: number;
  name: string;
}

interface Show {
  id: number;
  name: string;
  slug: string;
  description: string;
  links: string[];
}

interface Station {
  id: number;
  name: string;
  slug: string;
  description: string;
  links: string[];
}
