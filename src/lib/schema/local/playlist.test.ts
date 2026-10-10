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
