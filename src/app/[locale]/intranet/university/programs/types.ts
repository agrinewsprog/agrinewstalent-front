export interface UniversityProgram {
  id: string | number;
  title: string;
  description?: string | null;
  rules?: string | null;
  requiresCourseId?: string | number | null;
  status: 'ACTIVE' | 'CLOSED' | string;
  companiesCount?: number;
  approvedCompaniesCount?: number;
  offersCount?: number;
  applicationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramCompany {
  id: string | number;
  companyId?: string | number;
  companyName?: string;
  name?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  logoUrl?: string | null;
  location?: string | null;
  verified?: boolean;
  approvedOffersCount?: number;
}

export interface ProgramCompanyDetail {
  id: string | number;
  companyName?: string;
  name?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  logoUrl?: string | null;
  location?: string | null;
  description?: string | null;
  verified?: boolean;  // undefined = don't show any badge
  approvedOffersCount?: number;
  website?: string | null;
  email?: string | null;
  industry?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  linkedinUrl?: string | null;
  descriptionLong?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  workModes?: string[];
  vacancyTypes?: string[];
  workingLanguages?: string[];
  participatesInInternships?: boolean;
}

export interface CompanyProgramSummary {
  id: string | number;
  title: string;
  status: string;
  offersCount?: number;
  approvedOffersCount?: number;
  pendingOffersCount?: number;
  rejectedOffersCount?: number;
}

export interface CompanyActivityEntry {
  id?: string | number;
  type: string;
  description?: string;
  date: string;
}

export interface CompanyProfileData {
  company: ProgramCompanyDetail;
  programs: CompanyProgramSummary[];
  activity: CompanyActivityEntry[];
  offers: CompanyOfferEntry[];
}

export interface CompanyOfferEntry {
  id: string | number;
  programOfferId?: string | number;
  jobOfferId?: string | number;
  title: string;
  programTitle?: string;
  programId?: string | number;
  status: string;
  location?: string | null;
  contractType?: string | null;
  workMode?: string | null;
  createdAt?: string;
}

export interface ProgramApplication {
  id: string | number;
  studentId?: string | number;
  studentName?: string;
  student?: { name?: string; fullName?: string; email?: string };
  offerId?: string | number;
  offerTitle?: string;
  offer?: { title?: string };
  companyName?: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
}

export interface CreateProgramPayload {
  title: string;
  description?: string;
  rules?: string;
  requiresCourseId?: number | null;
  status: string;
}

export interface ProgramOffer {
  id: string;
  programOfferId: string;
  title: string;
  description?: string;
  companyName?: string;
  companyId?: string;
  location?: string;
  contractType?: string;
  workMode?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
