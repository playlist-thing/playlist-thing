import { z } from 'zod';

import {
  AirBreakSchema,
  AirBreakWithBackgroundMusicSchema,
  PlaylistSchema,
  SongSchema
} from '../playlist';

export const PlaylistItemStorageSchema = z.discriminatedUnion('tag', [
  SongSchema.partial({ id: true }),
  AirBreakSchema.partial({ id: true }),
  AirBreakWithBackgroundMusicSchema.partial({ id: true })
]);

export type PlaylistItemStorage = z.infer<typeof PlaylistItemStorageSchema>;

export const PlaylistStorageSchema = z
  .object({
    ...PlaylistSchema.shape,

    items: z.array(PlaylistItemStorageSchema),
    queue: z.array(PlaylistItemStorageSchema)
  })
  .partial({ id: true });

export type PlaylistStorage = z.infer<typeof PlaylistStorageSchema>;
