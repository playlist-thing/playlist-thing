import { expect, test } from 'vitest';
import { validPlaylist } from '../examples';
import { PlaylistExportSchema } from './playlist';

test('valid stored playlist passes validation without id', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...storedPlaylist } = validPlaylist;
  expect(PlaylistExportSchema.safeParse(storedPlaylist).success).toBe(true);
});

test('valid stored playlist passes validation with id', () => {
  expect(PlaylistExportSchema.safeParse(validPlaylist).success).toBe(true);
});
