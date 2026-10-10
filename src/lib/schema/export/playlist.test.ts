import { expect, test } from 'vitest';
import { validPlaylistLocal } from '../examples';
import { PlaylistExportSchema } from './playlist';

test('valid stored playlist passes validation without id', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...storedPlaylist } = validPlaylistLocal;
  expect(PlaylistExportSchema.safeParse(storedPlaylist).success).toBe(true);
});

test('valid stored playlist passes validation with id', () => {
  expect(PlaylistExportSchema.safeParse(validPlaylistLocal).success).toBe(true);
});
