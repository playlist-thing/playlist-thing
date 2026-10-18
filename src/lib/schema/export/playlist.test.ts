import { expect, test } from 'vitest';
import { validPlaylist, validPlaylistLocal } from '../examples';
import { PlaylistExportSchema } from './playlist';

test('valid exported playlist passes validation', () => {
  expect(PlaylistExportSchema.safeParse(validPlaylist).success).toBe(true);
});

test('stored playlist with id and timestamps passes validation', () => {
  expect(PlaylistExportSchema.safeParse(validPlaylistLocal).success).toBe(true);
});
