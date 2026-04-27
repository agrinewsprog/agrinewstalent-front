import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && String(value) !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function buildLocaleHref(locale: string, path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!path || path === '/') return `/${locale}`;
  return `/${locale}${normalizedPath}`;
}

export function normalizeLocaleHref(locale: string, href: string): string {
  if (!href) return `/${locale}`;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith(`/${locale}`)) return href;

  const normalized = href.startsWith('/') ? href : `/${href}`;
  const localePrefixMatch = normalized.match(/^\/(en|es|pt)(\/|$)/);
  if (localePrefixMatch) {
    return normalized.replace(/^\/(en|es|pt)/, `/${locale}`);
  }

  return `/${locale}${normalized}`;
}

export function buildPublicHomeHref(locale: string): string {
  return buildLocaleHref(locale);
}

export function buildPublicJobsHref(
  locale: string,
  params?: Record<string, string | number | null | undefined>,
): string {
  return `${buildLocaleHref(locale, '/empleo-y-practicas')}${buildQuery(params ?? {})}`;
}

export function buildPublicBlogHref(locale: string): string {
  return buildLocaleHref(locale, '/blog');
}

export function buildLoginHref(locale: string): string {
  return buildLocaleHref(locale, '/login');
}

export function buildRegisterHref(
  locale: string,
  tipo?: 'estudiante' | 'empresa' | 'universidad' | null,
): string {
  return `${buildLocaleHref(locale, '/registro')}${buildQuery({ tipo })}`;
}

export function buildIntranetHref(locale: string, role?: string | null): string {
  return role ? buildLocaleHref(locale, `/intranet/${role}`) : buildLocaleHref(locale, '/intranet');
}

export function buildNotificationsHref(locale: string, role: 'student' | 'company' | 'university' | 'admin'): string {
  return buildLocaleHref(locale, `/intranet/${role}/notifications`);
}

/**
 * Build the canonical href for a company offer detail page.
 * If programId + programOfferId are present → appends query string.
 */
export function buildCompanyOfferHref(
  locale: string,
  jobOfferId: string | number,
  programId?: string | number | null,
  programOfferId?: string | number | null,
): string {
  const base = `/${locale}/intranet/company/offers/${jobOfferId}`;
  return `${base}${buildQuery({ programId, programOfferId })}`;
}

export function buildCompanyOfferApplicationsHref(
  locale: string,
  jobOfferId: string | number,
  programId?: string | number | null,
  programOfferId?: string | number | null,
): string {
  const base = `/${locale}/intranet/company/offers/${jobOfferId}/applications`;
  return `${base}${buildQuery({ programId, programOfferId })}`;
}

export function buildCompanyApplicationHref(locale: string, applicationId: string | number): string {
  return `/${locale}/intranet/company/applications/${applicationId}`;
}

export function buildCompanyCandidatesHref(locale: string, candidateId: string | number): string {
  return `/${locale}/intranet/company/candidates/${candidateId}`;
}

export function buildCompanyCandidateProfileHref(
  locale: string,
  studentId?: string | number | null,
  applicationId?: string | number | null,
): string {
  if (studentId != null && String(studentId) !== '') {
    return buildCompanyCandidatesHref(locale, studentId);
  }
  if (applicationId != null && String(applicationId) !== '') {
    return buildCompanyApplicationHref(locale, applicationId);
  }
  return buildLocaleHref(locale, '/intranet/company/candidates');
}

export function buildCompanyOfferCandidatesHref(locale: string, jobOfferId: string | number): string {
  return `/${locale}/intranet/company/offers/${jobOfferId}/candidates`;
}

export function buildCompanyProgramsHref(locale: string, programId: string | number): string {
  return `/${locale}/intranet/company/programs/${programId}`;
}

export function buildCompanyProgramOfferEditHref(
  locale: string,
  programId: string | number,
  programOfferId: string | number,
): string {
  return `/${locale}/intranet/company/programs/${programId}/offers/${programOfferId}/edit`;
}

export function buildStudentOfferHref(locale: string, jobOfferId: string | number): string {
  return `/${locale}/intranet/student/offers/${jobOfferId}`;
}

export function buildStudentApplicationsHref(locale: string): string {
  return `/${locale}/intranet/student/applications`;
}

export function buildStudentProgramHref(locale: string, programId: string | number): string {
  return `/${locale}/intranet/student/programs/${programId}`;
}

export function buildStudentProgramOfferHref(
  locale: string,
  programId: string | number,
  programOfferId: string | number,
): string {
  return `/${locale}/intranet/student/programs/${programId}/offers/${programOfferId}`;
}

export function buildStudentProgramCompanyHref(
  locale: string,
  programId: string | number,
  companyId: string | number,
): string {
  return `/${locale}/intranet/student/programs/${programId}/companies/${companyId}`;
}

export function buildUniversityProgramHref(locale: string, programId: string | number): string {
  return `/${locale}/intranet/university/programs/${programId}`;
}

export function buildUniversityProgramOfferHref(
  locale: string,
  programId: string | number,
  programOfferId: string | number,
): string {
  return `/${locale}/intranet/university/programs/${programId}/offers/${programOfferId}`;
}

export function buildUniversityProgramCompanyHref(
  locale: string,
  programId: string | number,
  companyId: string | number,
): string {
  return `/${locale}/intranet/university/programs/${programId}/companies/${companyId}`;
}

export function buildUniversityStudentHref(locale: string, studentId: string | number): string {
  return `/${locale}/intranet/university/students/${studentId}`;
}
