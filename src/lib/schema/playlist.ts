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

  attributes: Record<string, string>;
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

  attributes: {}
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

export interface Broadcast {
  // milliseconds since unix epoch (i.e. Date.getTime())
  start: number;
  // milliseconds
  duration: number;
}

export interface Playlist {
  // UUID
  //
  // not included in exports
  id: string;

  name: string;
  slug: string;
  description: string;
  public: boolean;
  broadcast: Broadcast | null;
  createdAt: number;
  lastModifiedAt: number;

  items: PlaylistItem[];
  queue: PlaylistItem[];

  // not included in exports
  showId: string | null;

  // M:N relationship
  djIds: string[];
}
