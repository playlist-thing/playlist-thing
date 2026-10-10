import { z } from 'zod';

import { PlaylistSchema } from '../playlist';

export const PlaylistLocalSchema = z.object({
  ...PlaylistSchema.shape,

  id: z.uuid(),

  createdAt: z.number(),
  lastModifiedAt: z.number()
});

export type PlaylistLocal = z.infer<typeof PlaylistLocalSchema>;
