import { z } from 'zod';

export const DJSchema = z.object({
  id: z.uuid(),

  name: z.string(),
  slug: z.string(),
  description: z.string(),
  public: z.boolean(),
  links: z.array(z.string())
});

export type DJ = z.infer<typeof DJSchema>;
