import { z } from 'zod';

export const ShowSchema = z.object({
  id: z.uuid(),

  name: z.string(),
  slug: z.string(),
  description: z.string(),
  public: z.boolean(),
  links: z.array(z.string()),

  // M:N relationship
  //
  // ususally just one station, except when this show is a collaboration between multiple stations
  stationIds: z.array(z.uuid()),

  // M:N relationship
  djIds: z.array(z.uuid())
});

export type Show = z.infer<typeof ShowSchema>;
