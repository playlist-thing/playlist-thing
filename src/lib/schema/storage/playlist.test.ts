import { expect, test } from 'vitest';
import { validPlaylist } from '../examples';
import { PlaylistStorageSchema } from './playlist';

test('valid stored playlist passes validation without id', () => {
  const { id, ...storedPlaylist } = validPlaylist;
  expect(PlaylistStorageSchema.safeParse(storedPlaylist).success).toBe(true);
});

test('valid stored playlist passes validation with id', () => {
  expect(PlaylistStorageSchema.safeParse(validPlaylist).success).toBe(true);
});
