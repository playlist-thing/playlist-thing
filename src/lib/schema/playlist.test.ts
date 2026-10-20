import { expect, test } from 'vitest';
import {
  BroadcastSchema,
  PlaylistSchema,
  PlaylistItemSchema,
  SongMetadataSchema,
  currentlyBroadcasting,
  fileMatchesTitle
} from './playlist';
import type { PlaylistItem } from './playlist';
import { validAirBreak, validPlaylist, validSong, validSongMetadata } from './examples';

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

test('broadcast without duration passes validation', () => {
  expect(BroadcastSchema.safeParse({ start: 1234567890, stationId: null }).success).toBe(true);
});

test('broadcast with a stationId passes validation', () => {
  const stationId = 'c2cb2819-6a7f-43ca-9ebe-8e38781bf079';
  expect(BroadcastSchema.safeParse({ start: 1234567890, stationId }).success).toBe(true);
});

test('broadcast with a non-uuid stationId fails validation', () => {
  expect(BroadcastSchema.safeParse({ start: 1234567890, stationId: 'not-a-uuid' }).success).toBe(
    false
  );
});

test('playlist without broadcastDurationMs fails validation', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { broadcastDurationMs, ...withoutDuration } = validPlaylist;
  expect(PlaylistSchema.safeParse(withoutDuration).success).toBe(false);
});

test('currentlyBroadcasting is true during the broadcast window', () => {
  const broadcast = { start: 1000, stationId: null };
  expect(currentlyBroadcasting(broadcast, 500, 1000)).toBe(true);
  expect(currentlyBroadcasting(broadcast, 500, 1499)).toBe(true);
});

test('currentlyBroadcasting is false before and after the broadcast window', () => {
  const broadcast = { start: 1000, stationId: null };
  expect(currentlyBroadcasting(broadcast, 500, 999)).toBe(false);
  expect(currentlyBroadcasting(broadcast, 500, 1500)).toBe(false);
});

test('invalid playlist item tag fails validation', () => {
  const invalidItem = {
    id: 1,
    seconds: 90,
    internalNotes: '',
    publicNotes: '',
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

test('file containing the title matches', () => {
  const item = {
    ...validSong,
    content: { ...validSongMetadata, attributes: { file: '01 - Cloudbusting.mp3' } }
  };
  expect(fileMatchesTitle(item)).toBe(true);
});

test('file not containing the title does not match', () => {
  const item = {
    ...validSong,
    content: { ...validSongMetadata, attributes: { file: 'REC_0001.mp3' } }
  };
  expect(fileMatchesTitle(item)).toBe(false);
});

test('match is case-insensitive', () => {
  const item = {
    ...validSong,
    content: { ...validSongMetadata, attributes: { file: 'cloudbusting.mp3' } }
  };
  expect(fileMatchesTitle(item)).toBe(true);
});

test('missing file attribute matches', () => {
  expect(fileMatchesTitle(validSong)).toBe(true);
});

test('empty title matches', () => {
  const item = {
    ...validSong,
    content: { ...validSongMetadata, title: '', attributes: { file: 'REC_0001.mp3' } }
  };
  expect(fileMatchesTitle(item)).toBe(true);
});

test('air break without content matches', () => {
  expect(fileMatchesTitle(validAirBreak)).toBe(true);
});

test('air break with background music and non-matching file does not match', () => {
  const item: PlaylistItem = {
    ...validSong,
    tag: 'AirBreakWithBackgroundMusic',
    content: { ...validSongMetadata, attributes: { file: 'something-else.mp3' } }
  };
  expect(fileMatchesTitle(item)).toBe(false);
});
