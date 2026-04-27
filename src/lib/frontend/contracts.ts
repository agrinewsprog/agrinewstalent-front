type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null;
}

function toCanonicalId(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  if (!str || str === 'undefined' || str === 'null') return null;
  return str;
}

function stringOrNull(raw: unknown): string | null {
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
}

function pickFirstId(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const resolved = toCanonicalId(record[key]);
    if (resolved) return resolved;
  }
  return null;
}

function findNestedRecord(record: UnknownRecord | null, key: string): UnknownRecord | null {
  return asRecord(record?.[key]);
}

export function unwrapEntity<T = UnknownRecord>(
  payload: unknown,
  keys: string[] = ['data'],
): T | null {
  if (!payload || Array.isArray(payload)) return null;

  const root = asRecord(payload);
  if (!root) return null;

  for (const key of keys) {
    const value = root[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as T;
    }
  }

  return root as T;
}

export function unwrapCollection<T = UnknownRecord>(
  payload: unknown,
  keys: string[] = ['data'],
): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];

  const root = asRecord(payload);
  if (!root) return [];

  for (const key of keys) {
    const value = root[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

export function resolveJobOfferId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const direct = toCanonicalId(source);
    if (typeof source !== 'object' && direct) return direct;

    const record = asRecord(source);
    if (!record) continue;

    const nestedOffer = findNestedRecord(record, 'offer');
    const nestedJobOffer = findNestedRecord(record, 'jobOffer');

    const resolved =
      pickFirstId(record, ['jobOfferId', 'job_offer_id']) ??
      pickFirstId(nestedOffer, ['id', 'jobOfferId', 'job_offer_id']) ??
      pickFirstId(nestedJobOffer, ['id', 'jobOfferId', 'job_offer_id']) ??
      pickFirstId(record, ['offerId', 'offer_id']) ??
      pickFirstId(record, ['id']);

    if (resolved) return resolved;
  }

  return null;
}

export function resolveJobOfferCandidates(...sources: unknown[]): string[] {
  const ids = new Set<string>();

  for (const source of sources) {
    const direct = toCanonicalId(source);
    if (typeof source !== 'object' && direct) {
      ids.add(direct);
      continue;
    }

    const record = asRecord(source);
    if (!record) continue;

    const nestedOffer = findNestedRecord(record, 'offer');
    const nestedJobOffer = findNestedRecord(record, 'jobOffer');

    [
      pickFirstId(record, ['jobOfferId', 'job_offer_id']),
      pickFirstId(record, ['offerId', 'offer_id']),
      pickFirstId(record, ['id']),
      pickFirstId(nestedOffer, ['jobOfferId', 'job_offer_id', 'offerId', 'offer_id', 'id']),
      pickFirstId(nestedJobOffer, ['jobOfferId', 'job_offer_id', 'offerId', 'offer_id', 'id']),
    ].forEach((value) => {
      if (value) ids.add(value);
    });
  }

  return [...ids];
}

export function resolveProgramOfferId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const direct =
      pickFirstId(record, ['programOfferId', 'program_offer_id']) ??
      pickFirstId(findNestedRecord(record, 'programOffer'), ['id', 'programOfferId', 'program_offer_id']);

    if (direct) return direct;

    const looksLikeProgramOffer =
      record.programId != null ||
      record.program_id != null ||
      record.jobOfferId != null ||
      record.job_offer_id != null;

    if (looksLikeProgramOffer) {
      const fallback = pickFirstId(record, ['id']);
      if (fallback) return fallback;
    }
  }

  return null;
}

export function hasProgramOfferContext(...sources: unknown[]): boolean {
  return sources.some((source) => {
    const record = asRecord(source);
    if (!record) return false;

    if (resolveProgramOfferId(record, findNestedRecord(record, 'programOffer'))) return true;
    if (findNestedRecord(record, 'program')) return true;

    const programOffers = record.programOffers;
    return Array.isArray(programOffers) && programOffers.length > 0;
  });
}

export function resolveApplicationId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const direct = toCanonicalId(source);
    if (typeof source !== 'object' && direct) return direct;

    const record = asRecord(source);
    if (!record) continue;

    const resolved =
      pickFirstId(record, ['applicationId', 'application_id']) ??
      pickFirstId(findNestedRecord(record, 'application'), ['id', 'applicationId', 'application_id']) ??
      pickFirstId(record, ['id', '_id']);

    if (resolved) return resolved;
  }

  return null;
}

export function resolveApplicationSource(...sources: unknown[]): 'job' | 'program' | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const raw =
      stringOrNull(record.source) ??
      stringOrNull(record.type) ??
      stringOrNull(findNestedRecord(record, 'application')?.source);

    if (raw) {
      const normalized = raw.toLowerCase();
      if (normalized === 'program' || normalized === 'programapplication') return 'program';
      if (normalized === 'job' || normalized === 'jobapplication') return 'job';
    }

    if (resolveProgramOfferId(record, findNestedRecord(record, 'programOffer'))) return 'program';
  }

  return null;
}

export function resolveApplicationKey(...sources: unknown[]): string | null {
  const applicationId = resolveApplicationId(...sources);
  if (!applicationId) return null;
  const source = resolveApplicationSource(...sources) ?? 'application';
  return `${source}:${applicationId}`;
}

export function resolveStudentId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const student = findNestedRecord(record, 'student');
    const user = findNestedRecord(record, 'user');
    const looksLikeStudent =
      student != null ||
      record.firstName != null ||
      record.lastName != null ||
      record.careerField != null ||
      record.resumeUrl != null ||
      record.avatarUrl != null;

    const resolved =
      pickFirstId(record, ['studentId', 'student_id']) ??
      pickFirstId(student, ['studentId', 'student_id', 'id']) ??
      pickFirstId(user, ['studentId', 'student_id']) ??
      (looksLikeStudent ? pickFirstId(record, ['id']) : null);

    if (resolved) return resolved;
  }

  return null;
}

export function resolveCandidateId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const candidate = findNestedRecord(record, 'candidate');
    const student = findNestedRecord(record, 'student');
    const user = findNestedRecord(record, 'user');
    const applicant = findNestedRecord(record, 'applicant');

    const resolved =
      pickFirstId(record, ['candidateId']) ??
      pickFirstId(candidate, ['id', 'candidateId', 'userId', 'user_id']) ??
      pickFirstId(student, ['candidateId', 'studentId', 'student_id', 'id', 'userId', 'user_id']) ??
      pickFirstId(applicant, ['id', 'userId', 'user_id']) ??
      pickFirstId(record, ['studentId', 'student_id', 'userId', 'user_id']) ??
      pickFirstId(user, ['id', 'userId', 'user_id']) ??
      pickFirstId(record, ['id']);

    if (resolved) return resolved;
  }

  return null;
}

export function resolveCompanyId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const company = findNestedRecord(record, 'company');
    const resolved =
      pickFirstId(record, ['companyId', 'company_id']) ??
      pickFirstId(company, ['companyId', 'company_id', 'id']) ??
      pickFirstId(record, ['id']);

    if (resolved) return resolved;
  }

  return null;
}

export function resolveProgramId(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const program = findNestedRecord(record, 'program');
    const resolved =
      pickFirstId(record, ['programId', 'program_id']) ??
      pickFirstId(program, ['id', 'programId', 'program_id']);

    if (resolved) return resolved;
  }

  return null;
}

export function normalizeApplicationStatus(raw: string | null | undefined): string {
  const upper = (raw ?? '').toUpperCase();
  if (upper === 'SUBMITTED' || upper === 'VIEWED') return 'PENDING';
  if (upper === 'INTERVIEW_REQUESTED') return 'INTERVIEW';
  return upper || 'PENDING';
}

export function resolveCompanyName(...sources: unknown[]): string {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const company = findNestedRecord(record, 'company');
    const offer = findNestedRecord(record, 'offer');
    const jobOffer = findNestedRecord(record, 'jobOffer');
    const offerCompany = findNestedRecord(offer, 'company');
    const jobOfferCompany = findNestedRecord(jobOffer, 'company');

    const value =
      stringOrNull(record.companyName) ??
      stringOrNull(record.company_name) ??
      stringOrNull(record.name) ??
      stringOrNull(company?.companyName) ??
      stringOrNull(company?.company_name) ??
      stringOrNull(company?.name) ??
      stringOrNull(offerCompany?.companyName) ??
      stringOrNull(offerCompany?.company_name) ??
      stringOrNull(offerCompany?.name) ??
      stringOrNull(jobOfferCompany?.companyName) ??
      stringOrNull(jobOfferCompany?.company_name) ??
      stringOrNull(jobOfferCompany?.name);

    if (value) return value;
  }

  return '';
}

export function resolveCompanyLogoUrl(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const company = findNestedRecord(record, 'company');
    const offer = findNestedRecord(record, 'offer');
    const jobOffer = findNestedRecord(record, 'jobOffer');
    const offerCompany = findNestedRecord(offer, 'company');
    const jobOfferCompany = findNestedRecord(jobOffer, 'company');

    const value =
      stringOrNull(record.logoUrl) ??
      stringOrNull(record.logo_url) ??
      stringOrNull(company?.logoUrl) ??
      stringOrNull(company?.logo_url) ??
      stringOrNull(offerCompany?.logoUrl) ??
      stringOrNull(offerCompany?.logo_url) ??
      stringOrNull(jobOfferCompany?.logoUrl) ??
      stringOrNull(jobOfferCompany?.logo_url);

    if (value) return value;
  }

  return null;
}

export function resolveAvatarUrl(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const student = findNestedRecord(record, 'student');
    const candidate = findNestedRecord(record, 'candidate');
    const user = findNestedRecord(record, 'user');

    const value =
      stringOrNull(record.avatarUrl) ??
      stringOrNull(record.avatar_url) ??
      stringOrNull(record.avatar) ??
      stringOrNull(student?.avatarUrl) ??
      stringOrNull(student?.avatar_url) ??
      stringOrNull(student?.avatar) ??
      stringOrNull(candidate?.avatarUrl) ??
      stringOrNull(candidate?.avatar_url) ??
      stringOrNull(candidate?.avatar) ??
      stringOrNull(user?.avatarUrl) ??
      stringOrNull(user?.avatar_url) ??
      stringOrNull(user?.avatar);

    if (value) return value;
  }

  return null;
}

export function resolveResumeUrl(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const student = findNestedRecord(record, 'student');
    const candidate = findNestedRecord(record, 'candidate');

    const value =
      stringOrNull(record.resumeUrl) ??
      stringOrNull(record.resume_url) ??
      stringOrNull(record.cvUrl) ??
      stringOrNull(record.cv_url) ??
      stringOrNull(student?.resumeUrl) ??
      stringOrNull(student?.resume_url) ??
      stringOrNull(student?.cvUrl) ??
      stringOrNull(student?.cv_url) ??
      stringOrNull(candidate?.resumeUrl) ??
      stringOrNull(candidate?.resume_url) ??
      stringOrNull(candidate?.cvUrl) ??
      stringOrNull(candidate?.cv_url);

    if (value) return value;
  }

  return null;
}

export function resolveCompanyLocation(...sources: unknown[]): string | null {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const company = findNestedRecord(record, 'company');
    const offer = findNestedRecord(record, 'offer');
    const offerCompany = findNestedRecord(offer, 'company');

    const city = stringOrNull(record.city) ?? stringOrNull(company?.city) ?? stringOrNull(offerCompany?.city);
    const country =
      stringOrNull(record.country) ??
      stringOrNull(company?.country) ??
      stringOrNull(offerCompany?.country);
    const location =
      stringOrNull(record.location) ??
      stringOrNull(company?.location) ??
      stringOrNull(offerCompany?.location);

    if (location) return location;
    if (city || country) return [city, country].filter(Boolean).join(', ');
  }

  return null;
}

export function resolveStudentDisplayName(...sources: unknown[]): string {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    const student = findNestedRecord(record, 'student');
    const user = findNestedRecord(record, 'user');
    const candidate = findNestedRecord(record, 'candidate');

    const firstName =
      stringOrNull(record.firstName) ??
      stringOrNull(record.first_name) ??
      stringOrNull(student?.firstName) ??
      stringOrNull(student?.first_name) ??
      stringOrNull(user?.firstName) ??
      stringOrNull(user?.first_name) ??
      stringOrNull(candidate?.firstName) ??
      stringOrNull(candidate?.first_name);
    const lastName =
      stringOrNull(record.lastName) ??
      stringOrNull(record.last_name) ??
      stringOrNull(student?.lastName) ??
      stringOrNull(student?.last_name) ??
      stringOrNull(user?.lastName) ??
      stringOrNull(user?.last_name) ??
      stringOrNull(candidate?.lastName) ??
      stringOrNull(candidate?.last_name);

    const fullName =
      stringOrNull(record.fullName) ??
      stringOrNull(record.full_name) ??
      stringOrNull(record.studentName) ??
      stringOrNull(record.student_name) ??
      stringOrNull(record.name) ??
      stringOrNull(student?.fullName) ??
      stringOrNull(student?.full_name) ??
      stringOrNull(student?.name) ??
      stringOrNull(user?.fullName) ??
      stringOrNull(user?.full_name) ??
      stringOrNull(user?.name) ??
      stringOrNull(candidate?.fullName) ??
      stringOrNull(candidate?.full_name) ??
      stringOrNull(candidate?.name);

    if (fullName) return fullName;
    if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ');

    const email =
      stringOrNull(record.email) ??
      stringOrNull(student?.email) ??
      stringOrNull(user?.email) ??
      stringOrNull(candidate?.email);
    if (email) return email;
  }

  return '';
}

export function toAbsoluteAssetUrl(raw: unknown, apiBase: string): string | null {
  const value = stringOrNull(raw);
  if (!value) return null;
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) return value;
  return `${apiBase}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function getDisplayInitial(...sources: unknown[]): string {
  for (const source of sources) {
    if (typeof source === 'string' && source.trim()) return source.trim().charAt(0).toUpperCase();
    const record = asRecord(source);
    if (!record) continue;
    const value =
      stringOrNull(record.companyName) ??
      stringOrNull(record.name) ??
      stringOrNull(record.title) ??
      stringOrNull(record.email);
    if (value) return value.charAt(0).toUpperCase();
  }
  return '?';
}

export interface NormalizedCompanyProfile {
  companyId: string;
  companyName: string;
  logoUrl: string | null;
  location: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  foundedYear: string | null;
  website: string | null;
  email: string | null;
  linkedinUrl: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  workModes: string[];
  vacancyTypes: string[];
  workingLanguages: string[];
  participatesInInternships: boolean;
  verified?: boolean;
  approvedOffersCount?: number;
}

function normalizeExternalUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const value = raw.trim();
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function toStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : [];
}

export function normalizeCompanyProfile(
  payload: unknown,
  fallbackCompanyId: string,
): NormalizedCompanyProfile | null {
  const root = unwrapEntity<UnknownRecord>(payload, ['company', 'programCompany', 'data']);
  if (!root) return null;

  const nestedCompany = findNestedRecord(root, 'company');
  const base = nestedCompany ?? root;

  const companyId = resolveCompanyId(root, nestedCompany) ?? fallbackCompanyId;

  return {
    companyId,
    companyName: String(
      base.companyName ??
      base.company_name ??
      base.name ??
      root.companyName ??
      root.company_name ??
      root.name ??
      '',
    ),
    logoUrl:
      stringOrNull(base.logoUrl) ??
      stringOrNull(base.logo_url) ??
      stringOrNull(root.logoUrl) ??
      stringOrNull(root.logo_url),
    location: stringOrNull(base.location) ?? stringOrNull(root.location),
    description:
      stringOrNull(base.descriptionLong) ??
      stringOrNull(base.description_long) ??
      stringOrNull(base.description) ??
      stringOrNull(root.descriptionLong) ??
      stringOrNull(root.description_long) ??
      stringOrNull(root.description),
    industry:
      stringOrNull(base.industry) ??
      stringOrNull(base.sector) ??
      stringOrNull(root.industry) ??
      stringOrNull(root.sector),
    companySize:
      stringOrNull(base.companySize) ??
      stringOrNull(base.company_size) ??
      stringOrNull(root.companySize) ??
      stringOrNull(root.company_size) ??
      stringOrNull(base.employeesCount) ??
      stringOrNull(root.employeesCount),
    foundedYear:
      toCanonicalId(base.foundedYear) ??
      toCanonicalId(base.founded_year) ??
      toCanonicalId(root.foundedYear) ??
      toCanonicalId(root.founded_year),
    website: normalizeExternalUrl(base.website) ?? normalizeExternalUrl(root.website),
    email: stringOrNull(base.email) ?? stringOrNull(root.email),
    linkedinUrl:
      normalizeExternalUrl(base.linkedinUrl) ??
      normalizeExternalUrl(base.linkedin_url) ??
      normalizeExternalUrl(root.linkedinUrl) ??
      normalizeExternalUrl(root.linkedin_url),
    contactPerson:
      stringOrNull(base.contactPerson) ??
      stringOrNull(base.contact_person) ??
      stringOrNull(root.contactPerson) ??
      stringOrNull(root.contact_person),
    contactEmail:
      stringOrNull(base.contactEmail) ??
      stringOrNull(base.contact_email) ??
      stringOrNull(root.contactEmail) ??
      stringOrNull(root.contact_email),
    contactPhone:
      stringOrNull(base.contactPhone) ??
      stringOrNull(base.contact_phone) ??
      stringOrNull(root.contactPhone) ??
      stringOrNull(root.contact_phone),
    workModes: toStringArray(base.workModes ?? base.work_modes ?? root.workModes ?? root.work_modes),
    vacancyTypes: toStringArray(base.vacancyTypes ?? base.vacancy_types ?? root.vacancyTypes ?? root.vacancy_types),
    workingLanguages: toStringArray(base.workingLanguages ?? base.working_languages ?? root.workingLanguages ?? root.working_languages),
    participatesInInternships: Boolean(
      base.participatesInInternships ??
      base.participates_in_internships ??
      root.participatesInInternships ??
      root.participates_in_internships,
    ),
    verified:
      typeof base.verified === 'boolean' ? base.verified
      : typeof root.verified === 'boolean' ? root.verified
      : undefined,
    approvedOffersCount:
      typeof base.approvedOffersCount === 'number' ? base.approvedOffersCount
      : typeof base.approved_offers_count === 'number' ? (base.approved_offers_count as number)
      : typeof root.approvedOffersCount === 'number' ? root.approvedOffersCount
      : typeof root.approved_offers_count === 'number' ? (root.approved_offers_count as number)
      : undefined,
  };
}
