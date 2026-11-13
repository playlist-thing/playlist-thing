import { expect, test } from 'vitest';

import { playlistFingerprint } from './fingerprint';
import { validPlaylist, validPlaylistLocal, validSong, validSongMetadata } from './examples';

test('identical content produces the same fingerprint', async () => {
  const clone = structuredClone(validPlaylist);
  expect(await playlistFingerprint(validPlaylist)).toBe(await playlistFingerprint(clone));
});

test('local-only fields do not affect the fingerprint', async () => {
  expect(await playlistFingerprint(validPlaylist)).toBe(
    await playlistFingerprint(validPlaylistLocal)
  );
});

test('per-session item ids do not affect the fingerprint', async () => {
  const withFreshIds = {
    ...validPlaylist,
    items: validPlaylist.items.map((item, index) => ({ ...item, id: 900 + index }))
  };
  expect(await playlistFingerprint(validPlaylist)).toBe(await playlistFingerprint(withFreshIds));
});

test('object key order does not affect the fingerprint', async () => {
  const itemA = {
    ...validSong,
    content: { ...validSongMetadata, attributes: { artist: 'a', title: 'b' } }
  };
  const itemB = {
    ...validSong,
    content: { ...validSongMetadata, attributes: { title: 'b', artist: 'a' } }
  };

  const a = { ...validPlaylist, items: [itemA] };
  const b = { ...validPlaylist, items: [itemB] };

  expect(await playlistFingerprint(a)).toBe(await playlistFingerprint(b));
});

test('showIds order does not affect the fingerprint', async () => {
  const a = {
    ...validPlaylist,
    showIds: ['c11e083e-773d-43fe-be2a-162310928c01', 'b441163b-1ab0-473c-a8d7-e91473a755e8']
  };
  const b = { ...a, showIds: [...a.showIds].reverse() };

  expect(await playlistFingerprint(a)).toBe(await playlistFingerprint(b));
});

test('djIds order does not affect the fingerprint', async () => {
  const a = {
    ...validPlaylist,
    djIds: ['6ceea514-1b68-41ee-b9ab-4f0a0e4089c8', '5d883c03-bafb-4beb-aeef-881618723f43']
  };
  const b = { ...a, djIds: [...a.djIds].reverse() };

  expect(await playlistFingerprint(a)).toBe(await playlistFingerprint(b));
});

test('broadcast order does not affect the fingerprint', async () => {
  const broadcasts = [
    { start: 2000, stationId: null },
    { start: 1000, stationId: 'c2cb2819-6a7f-43ca-9ebe-8e38781bf079' }
  ];
  const a = { ...validPlaylist, broadcasts };
  const b = { ...a, broadcasts: [...broadcasts].reverse() };

  expect(await playlistFingerprint(a)).toBe(await playlistFingerprint(b));
});

test('changing a top-level field changes the fingerprint', async () => {
  const changed = { ...validPlaylist, name: 'Different Name' };
  expect(await playlistFingerprint(validPlaylist)).not.toBe(await playlistFingerprint(changed));
});

test('changing the public flag changes the fingerprint', async () => {
  const changed = { ...validPlaylist, public: !validPlaylist.public };
  expect(await playlistFingerprint(validPlaylist)).not.toBe(await playlistFingerprint(changed));
});

test('reordering items changes the fingerprint', async () => {
  const reordered = { ...validPlaylist, items: [...validPlaylist.items].reverse() };
  expect(await playlistFingerprint(validPlaylist)).not.toBe(await playlistFingerprint(reordered));
});

test('changing item content changes the fingerprint', async () => {
  const changed = {
    ...validPlaylist,
    items: [{ ...validSong, seconds: validSong.seconds + 1 }]
  };
  expect(await playlistFingerprint(validPlaylist)).not.toBe(await playlistFingerprint(changed));
});

test('changing the queue changes the fingerprint', async () => {
  const changed = { ...validPlaylist, queue: [validSong] };
  expect(await playlistFingerprint(validPlaylist)).not.toBe(await playlistFingerprint(changed));
});

test('fingerprint is a 64-character lowercase hex string', async () => {
  expect(await playlistFingerprint(validPlaylist)).toMatch(/^[0-9a-f]{64}$/);
});
