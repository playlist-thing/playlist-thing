import { z } from 'zod';

const AutomaticDomainVerificationSchema = z.object({
  tag: z.literal('AutomaticDomainVerification'),
  content: z.object({
    authenticationCode: z.string(),
    // milliseconds since unix epoch (i.e. Date.getTime())
    lastCheckAt: z.number(),
    lastSuccessfulCheckAt: z.number()
  })
});

const ManualDomainVerificationSchema = z.object({
  tag: z.literal('ManualDomainVerification'),
  content: z.object({
    // milliseconds since unix epoch (i.e. Date.getTime())
    verifiedAt: z.number()
  })
});

const DomainVerificationSchema = z.discriminatedUnion('tag', [
  AutomaticDomainVerificationSchema,
  ManualDomainVerificationSchema
]);

const DomainSchema = z.object({
  domain: z.string(),
  verification: z.nullable(DomainVerificationSchema)
});

export const StationSchema = z.object({
  id: z.uuid(),

  name: z.string(),
  slug: z.string(),
  description: z.string(),
  public: z.boolean(),
  domains: z.array(DomainSchema),
  links: z.array(z.string()),

  // M:N relationship
  djIds: z.array(z.uuid())
});

export type Station = z.infer<typeof StationSchema>;
