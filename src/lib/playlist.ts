interface BasePlaylistItem {
  id: number;
  seconds: number;
  notes: string;
}

interface SongMetadata {
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

type PlaylistItem = Song | AirBreak | AirBreakWithBackgroundMusic;

const emptySongMetadata: SongMetadata = {
  artist: '',
  title: '',
  album: '',
  released: '',
  label: '',

  attributes: {}
};

const emptySong: Song = {
  id: 0,
  seconds: 0,
  notes: '',

  tag: 'Song',
  content: emptySongMetadata
};

const emptyAirBreak: AirBreak = {
  id: 0,
  seconds: 90,
  notes: '',

  tag: 'AirBreak'
};

interface Playlist {
  // UUID
  //
  // not included in exports
  id: string;

  name: string;
  slug: string;
  description: string;
  items: PlaylistItem[];
  // if null, playlist is not visible to public
  //
  // if non-null, the playlist is public. However, only the items up
  // to this index (exclusive) will be shown to the public
  //
  // for fully public, use length
  publicUntilIndex: number | null;
  // milliseconds since unix epoch (i.e. Date.getTime())
  broadcastStart: number | null;
  createdAt: number;
  lastModifiedAt: number;

  // not included in exports
  showId: string | null;

  // M:N relationship
  djIds: string[];
}

interface Show {
  // UUID
  id: string;

  name: string;
  slug: string;
  description: string;
  links: string[];

  stationId: string | null;

  // M:N relationship
  djIds: string[];
}

interface DJ {
  // UUID
  id: string;

  name: string;
  slug: string;
  description: string;
  links: string[];
}

type DomainVerification = AutomaticDomainVerification | ManualDomainVerification;

interface AutomaticDomainVerification {
  tag: 'AutomaticDomainVerification';
  content: {
    authenticationCode: string;
    // milliseconds since unix epoch (i.e. Date.getTime())
    lastCheckAt: number;
    lastSuccessfulCheckAt: number;
  };
}

interface ManualDomainVerification {
  tag: 'ManualDomainVerification';
  content: {
    // milliseconds since unix epoch (i.e. Date.getTime())
    verifiedAt: number;
  };
}

interface Domain {
  domain: string;
  verification: null | DomainVerification;
}

interface Station {
  // UUID
  id: string;

  name: string;
  slug: string;
  description: string;
  domains: Domain[];
  links: string[];

  // M:N relationship
  djIds: string[];
}

export { emptySong, emptyAirBreak, emptySongMetadata };
export type { SongMetadata, PlaylistItem, Playlist, Show, Station, DJ };
