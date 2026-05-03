export interface Show {
  // UUID
  id: string;

  name: string;
  slug: string;
  description: string;
  public: boolean;
  links: string[];

  stationId: string | null;

  // M:N relationship
  djIds: string[];
}
