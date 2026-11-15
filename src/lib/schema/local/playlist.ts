import { z } from 'zod';

import { PlaylistSchema } from '../playlist';

export const PlaylistLocalSchema = z.object({
  ...PlaylistSchema.shape,

  id: z.uuid(),

  createdAt: z.number(),
  lastModifiedAt: z.number(),

  syncEnabled: z.boolean().default(false),

  // null == never synced
  lastSyncFingerprint: z.string().nullable().default(null)
});

export type PlaylistLocal = z.infer<typeof PlaylistLocalSchema>;
