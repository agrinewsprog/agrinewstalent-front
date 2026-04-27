import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { resolveStudentDisplayName, toAbsoluteAssetUrl, unwrapEntity } from '@/lib/frontend/contracts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface StudentDetail {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
  country?: string;
  degree?: string;
  graduationYear?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  cvUrl?: string;
  university?: { name?: string; universityName?: string };
  universityName?: string;
  createdAt?: string;
}

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

/* ------------------------------------------------------------------ */
/*  Fetch student                                                      */
/* ------------------------------------------------------------------ */
async function getStudent(
  studentId: string,
  headers: Record<string, string>,
): Promise<StudentDetail | null> {
  if (!studentId || studentId === 'undefined') {
    console.error('[university/student-detail] studentId is empty or undefined — aborting fetch');
    return null;
  }

  const endpoint = `${API}/api/universities/me/students/${studentId}`;

  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...headers },
      cache: 'no-store',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[university/student-detail] HTTP status:', res.status);
    }

    if (!res.ok) {
      const body = await res.text();
      console.error('[university/student-detail] HTTP', res.status, body);
      return null;
    }

    const json = await res.json();

    return (unwrapEntity<StudentDetail>(json, ['student', 'data']) ?? json) as StudentDetail;
  } catch (err) {
    console.error('[university/student-detail] fetch error:', err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function displayName(s: StudentDetail): string {
  return resolveStudentDisplayName(s);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function UniversityStudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; studentId: string }>;
}) {
  const { locale, studentId } = await params;
  const authHeaders = await getAuthHeaders();
  const [student, t] = await Promise.all([
    getStudent(studentId, authHeaders),
    getTranslations('intranet'),
  ]);

  const backHref = `/${locale}/intranet/university/students`;

  /* ── Not found ── */
  if (!student) {
    return (
      <div className="space-y-6">
        <Link href={backHref} className="text-sm text-blue-600 hover:underline">
          {t('university.studentProfile.backToStudents')}
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-gray-700">{t('university.studentProfile.notFound')}</p>
          <p className="text-sm text-gray-500 max-w-md text-center">
            {t('university.studentProfile.notFoundDesc')}
          </p>
        </div>
      </div>
    );
  }

  /* ── Data ── */
  const name = displayName(student);
  const locationStr = [student.location, student.country].filter(Boolean).join(', ');
  const uniName =
    student.universityName ??
    student.university?.universityName ??
    student.university?.name;
  const cvLink = student.cvUrl ?? student.resumeUrl;
  const avatarSrc = toAbsoluteAssetUrl(student.avatarUrl, API);
  const joinDate = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const skillsList = student.skills
    ? student.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href={backHref} className="inline-flex items-center text-sm text-blue-600 hover:underline">
        {t('university.studentProfile.backToStudents')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{t('university.studentProfile.title')}</h1>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-8">
          <div className="flex items-center gap-5">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-3xl font-bold border-4 border-white shadow">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              {student.degree && (
                <p className="text-sm text-gray-600 mt-0.5">📚 {student.degree}</p>
              )}
              {joinDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('university.studentProfile.joinedOn', { date: joinDate })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 py-6 space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {/* Email */}
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('university.studentProfile.email')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">
                  {student.email}
                </a>
              </dd>
            </div>

            {/* Phone */}
            {student.phoneNumber && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('university.studentProfile.phone')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student.phoneNumber}</dd>
              </div>
            )}

            {/* Location */}
            {locationStr && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('university.studentProfile.location')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{locationStr}</dd>
              </div>
            )}

            {/* University */}
            {uniName && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('university.studentProfile.university')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{uniName}</dd>
              </div>
            )}

            {/* Degree */}
            {student.degree && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('university.studentProfile.degree')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student.degree}</dd>
              </div>
            )}

            {/* Graduation year */}
            {student.graduationYear && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('university.studentProfile.graduationYear')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student.graduationYear}</dd>
              </div>
            )}
          </dl>

          {/* Bio */}
          {student.bio && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('university.studentProfile.bio')}
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{student.bio}</p>
            </div>
          )}

          {/* Skills */}
          {skillsList.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {t('university.studentProfile.skills')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(student.linkedinUrl || student.githubUrl) && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {t('university.studentProfile.links')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CV */}
          <div className="pt-2 border-t border-gray-100">
            {cvLink ? (
              <a
                href={cvLink.startsWith('http') ? cvLink : `${API}${cvLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('university.studentProfile.downloadCv')}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {t('university.studentProfile.noCv')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
