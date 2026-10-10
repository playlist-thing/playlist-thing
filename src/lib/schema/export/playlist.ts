import { z } from 'zod';

import {
  AirBreakSchema,
  AirBreakWithBackgroundMusicSchema,
  PlaylistSchema,
  SongSchema
} from '../playlist';

export const PlaylistItemExportSchema = z.discriminatedUnion('tag', [
  SongSchema.partial({ id: true }),
  AirBreakSchema.partial({ id: true }),
  AirBreakWithBackgroundMusicSchema.partial({ id: true })
]);

export type PlaylistItemExport = z.infer<typeof PlaylistItemExportSchema>;

export const PlaylistExportSchema = z
  .object({
    ...PlaylistSchema.shape,

    items: z.array(PlaylistItemExportSchema),
    queue: z.array(PlaylistItemExportSchema)
  })
  .partial({ id: true });

export type PlaylistExport = z.infer<typeof PlaylistExportSchema>;
