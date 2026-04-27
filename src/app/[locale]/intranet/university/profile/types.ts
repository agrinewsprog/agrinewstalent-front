export interface UniversityProfile {
  id?: number;
  name: string;
  email: string;
  logoUrl?: string | null;
  location?: string | null;
  description?: string | null;
  careers?: string[];
  convenioTypes?: string[];
  verified?: boolean;
}
