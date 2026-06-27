import { expect, test } from 'vitest';
import { PlaylistSchema, PlaylistItemSchema, SongMetadataSchema } from './playlist.ts';

const validSongMetadata = {
  artist: 'Kate Bush',
  title: 'Cloudbusting',
  album: 'Hounds of Love',
  released: '1985',
  label: 'EMI',
  attributes: {}
};

const validSong = {
  id: 1,
  seconds: 240,
  notes: 'Great track',
  tag: 'Song',
  content: validSongMetadata
};

const validAirBreak = {
  id: 2,
  seconds: 90,
  notes: '',
  tag: 'AirBreak'
};

const validPlaylist = {
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

test('valid song metadata passes validation', () => {
  expect(SongMetadataSchema.safeParse(validSongMetadata).success).toBe(true);
});

test('valid song playlist item passes validation', () => {
  expect(PlaylistItemSchema.safeParse(validSong).success).toBe(true);
});

test('valid airbreak playlist item passes validation', () => {
  expect(PlaylistItemSchema.safeParse(validAirBreak).success).toBe(true);
});

test('valid playlist passes validation', () => {
  expect(PlaylistSchema.safeParse(validPlaylist).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidPlaylist = { ...validPlaylist, id: 'not-a-uuid' };
  expect(PlaylistSchema.safeParse(invalidPlaylist).success).toBe(false);
});

test('invalid playlist item tag fails validation', () => {
  const invalidItem = {
    id: 1,
    seconds: 90,
    notes: '',
    tag: 'InvalidTag'
  };
  expect(PlaylistItemSchema.safeParse(invalidItem).success).toBe(false);
});

test('invalid showId UUID fails validation', () => {
  const invalidPlaylist = { ...validPlaylist, showIds: ['not-a-uuid'] };
  expect(PlaylistSchema.safeParse(invalidPlaylist).success).toBe(false);
});

test('invalid djIds UUID fails validation', () => {
  const invalidPlaylist = { ...validPlaylist, djIds: ['not-a-uuid'] };
  expect(PlaylistSchema.safeParse(invalidPlaylist).success).toBe(false);
});

test('missing required fields fail validation', () => {
  expect(PlaylistSchema.safeParse({}).success).toBe(false);
});
