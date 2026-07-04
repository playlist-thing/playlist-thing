import type { DJ } from './dj.ts';
import type { Playlist, PlaylistItem, SongMetadata } from './playlist.ts';
import type { Show } from './show.ts';
import type { Station } from './station.ts';

export const validSongMetadata: SongMetadata = {
  artist: 'Kate Bush',
  title: 'Cloudbusting',
  album: 'Hounds of Love',
  released: '1985',
  label: 'EMI',
  attributes: {}
};

export const validSong: PlaylistItem = {
  id: 1,
  seconds: 240,
  internalNotes: 'Great track',
  publicNotes: '',
  tag: 'Song',
  content: validSongMetadata
};

export const validAirBreak: PlaylistItem = {
  id: 2,
  seconds: 90,
  internalNotes: '',
  publicNotes: '',
  tag: 'AirBreak'
};

export const validPlaylist: Playlist = {
  id: '416556a8-98b0-4ffc-9b5f-62cc591c37ad',
  name: 'Test Playlist',
  slug: 'test-playlist',
  description: 'A test playlist',
  public: true,
  broadcasts: [{ start: 1234567890, duration: 3600000 }],
  createdAt: 1234567890,
  lastModifiedAt: 1234567890,
  items: [validSong, validAirBreak],
  queue: [],
  showIds: ['c11e083e-773d-43fe-be2a-162310928c01'],
  djIds: ['6ceea514-1b68-41ee-b9ab-4f0a0e4089c8']
};

export const validShow: Show = {
  id: 'b441163b-1ab0-473c-a8d7-e91473a755e8',
  name: 'Test Show',
  slug: 'test-show',
  description: 'A test show',
  public: true,
  links: ['https://example.com'],
  stationIds: ['c2cb2819-6a7f-43ca-9ebe-8e38781bf079'],
  djIds: ['ca1d0b13-d870-4025-a77f-33e9960b20be', '9cf8e1cf-f63f-43f5-8e98-df3c940fc7f7']
};

export const validStation: Station = {
  id: '5574cf2f-56bc-4307-8de5-3320c7d8233a',
  name: 'Test Station',
  slug: 'test-station',
  description: 'A test station',
  public: true,
  domains: [
    {
      domain: 'example.com',
      verification: {
        tag: 'AutomaticDomainVerification',
        content: {
          authenticationCode: 'abc123',
          lastCheckAt: 1234567890,
          lastSuccessfulCheckAt: 1234567890
        }
      }
    }
  ],
  links: ['https://example.com'],
  djIds: ['aa175706-80af-42ba-bbc3-61c35d4054c0']
};

export const validDJ: DJ = {
  id: '5d883c03-bafb-4beb-aeef-881618723f43',
  name: 'Test DJ',
  slug: 'test-dj',
  description: 'A test DJ',
  public: true,
  links: ['https://example.com']
};
