import { z } from 'zod';

const BasePlaylistItemSchema = z.object({
  id: z.number(),
  seconds: z.number(),
  internalNotes: z.string(),
  publicNotes: z.string()
});

export const SongMetadataSchema = z.object({
  artist: z.string(),
  title: z.string(),
  album: z.string(),
  released: z.string(),
  label: z.string(),

  attributes: z.record(z.string(), z.string())
});

export type SongMetadata = z.infer<typeof SongMetadataSchema>;

const SongSchema = z.object({
  ...BasePlaylistItemSchema.shape,
  tag: z.literal('Song'),
  content: SongMetadataSchema
});

const AirBreakSchema = z.object({
  ...BasePlaylistItemSchema.shape,
  tag: z.literal('AirBreak')
});

const AirBreakWithBackgroundMusicSchema = z.object({
  ...BasePlaylistItemSchema.shape,
  tag: z.literal('AirBreakWithBackgroundMusic'),
  content: SongMetadataSchema
});

export const PlaylistItemSchema = z.discriminatedUnion('tag', [
  SongSchema,
  AirBreakSchema,
  AirBreakWithBackgroundMusicSchema
]);

export type PlaylistItem = z.infer<typeof PlaylistItemSchema>;

export const emptySongMetadata: SongMetadata = {
  artist: '',
  title: '',
  album: '',
  released: '',
  label: '',

  attributes: {}
};

export const emptySong: PlaylistItem = {
  id: 0,
  seconds: 0,
  internalNotes: '',
  publicNotes: '',

  tag: 'Song',
  content: emptySongMetadata
};

export const emptyAirBreak: PlaylistItem = {
  id: 0,
  seconds: 90,
  internalNotes: '',
  publicNotes: '',

  tag: 'AirBreak'
};

export const BroadcastSchema = z.object({
  // milliseconds since unix epoch (i.e. Date.getTime())
  start: z.number(),
  // milliseconds
  duration: z.number()
});

export type Broadcast = z.infer<typeof BroadcastSchema>;

export const PlaylistSchema = z.object({
  // not included in exports
  id: z.uuid(),

  name: z.string(),
  slug: z.string(),
  description: z.string(),
  public: z.boolean(),
  broadcasts: z.array(BroadcastSchema),
  createdAt: z.number(),
  lastModifiedAt: z.number(),

  items: z.array(PlaylistItemSchema),
  queue: z.array(PlaylistItemSchema),

  // M:N relationship
  //
  // usually just one show, except when this playlist is a collaboration between multiple shows
  showIds: z.array(z.uuid()),

  // M:N relationship
  djIds: z.array(z.uuid())
});

export type Playlist = z.infer<typeof PlaylistSchema>;
