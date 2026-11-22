import { expect, test } from 'vitest';

import { validPlaylistLocal } from '../examples';
import { PlaylistLocalSchema } from './playlist';

test('valid local playlist passes validation', () => {
  expect(PlaylistLocalSchema.safeParse(validPlaylistLocal).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidPlaylist = { ...validPlaylistLocal, id: 'not-a-uuid' };
  expect(PlaylistLocalSchema.safeParse(invalidPlaylist).success).toBe(false);
});

test('readonly defaults to false', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { readonly, ...playlistWithoutReadonly } = validPlaylistLocal;
  expect(PlaylistLocalSchema.parse(playlistWithoutReadonly).readonly).toBe(false);
});
