type DomainVerification = AutomaticDomainVerification | ManualDomainVerification;

interface AutomaticDomainVerification {
  tag: 'AutomaticDomainVerification';
  content: {
    authenticationCode: string;
    // milliseconds since unix epoch (i.e. Date.getTime())
    lastCheckAt: number;
    lastSuccessfulCheckAt: number;
  };
}

interface ManualDomainVerification {
  tag: 'ManualDomainVerification';
  content: {
    // milliseconds since unix epoch (i.e. Date.getTime())
    verifiedAt: number;
  };
}

interface Domain {
  domain: string;
  verification: null | DomainVerification;
}

export interface Station {
  // UUID
  id: string;

  name: string;
  slug: string;
  description: string;
  public: boolean;
  domains: Domain[];
  links: string[];

  // M:N relationship
  djIds: string[];
}
