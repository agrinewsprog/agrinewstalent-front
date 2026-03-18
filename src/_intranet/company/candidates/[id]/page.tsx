import { cookies } from 'next/headers';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  UserCircleIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { getLocale } from 'next-intl/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function safeFetch(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function buildAvatarUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) return raw;
  return `${API}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function buildFileUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${API}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
  VIEWED: 'bg-gray-100 text-gray-600 border-gray-200',
  INTERVIEW_REQUESTED: 'bg-purple-100 text-purple-700 border-purple-200',
  HIRED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-gray-100 text-gray-600',
  A2: 'bg-gray-100 text-gray-600',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-blue-100 text-blue-700',
  C1: 'bg-green-100 text-green-700',
  C2: 'bg-green-100 text-green-700',
  Nativo: 'bg-purple-100 text-purple-700',
  Native: 'bg-purple-100 text-purple-700',
};

function formatDate(d?: string | null) {
  if (!d) return '';
  const parts = d.split('-');
  const year = parts[0];
  const month = parts[1];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return month ? `${months[parseInt(month) - 1] ?? ''} ${year}` : year;
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string; locale?: string }> }) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  const t = await getTranslations('intranet');
  const locale = await getLocale();

  const cookieStore = await cookies();
  const token =
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    '';

  const data = await safeFetch(`${API}/api/applications/companies/me`, token);
  const applications: any[] = data?.applications ?? data?.data ?? [];

  const app = applications.find(
    (a) => a.student?.id === numId || a.student?.userId === numId
  );
  const allAppsFromStudent = applications.filter(
    (a) => a.student?.id === numId || a.student?.userId === numId
  );

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">{t('company.applicationDetail.candidateNotFound')}</p>
        <Link href={`/${locale}/intranet/company/candidates`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> {t('company.applicationDetail.backToCandidates')}
        </Link>
      </div>
    );
  }

  const student = app.student;
  const avatar = buildAvatarUrl(student?.avatarUrl);
  const cvUrl = buildFileUrl(student?.resumeUrl);
  const name = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || student?.user?.email || 'Candidato';
  const email = student?.user?.email ?? '';
  const location = [student?.city, student?.country].filter(Boolean).join(', ');
  const statusLabel = t(`company.applicationStatus.${app.status}` as any) || app.status;
  const statusColor = STATUS_COLOR[app.status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const education: any[] = student?.education ?? [];
  const experience: any[] = student?.experience ?? [];
  const languages: any[] = student?.languages ?? [];
  const skills: string[] = student?.skills
    ? student.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Link href={`/${locale}/intranet/company/candidates`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        {t('company.applicationDetail.backToCandidates')}
      </Link>

      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 shadow-lg flex items-center justify-center">
                <UserCircleIcon className="w-16 h-16 text-white/80" />
              </div>
            )}
          </div>
          <div className="flex-1 text-white">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold">{name}</h1>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                {statusLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-green-100 text-sm">
              {email && <span className="flex items-center gap-1.5"><EnvelopeIcon className="w-4 h-4" />{email}</span>}
              {location && <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" />{location}</span>}
              {student?.phoneNumber && <span className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" />{student.phoneNumber}</span>}
            </div>
            {student?.bio && <p className="mt-3 text-green-100 text-sm leading-relaxed line-clamp-3">{student.bio}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 bg-white text-green-700 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <EnvelopeIcon className="w-4 h-4" /> {t('company.applicationDetail.sendMessage')}
                </a>
              )}
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <DocumentArrowDownIcon className="w-4 h-4" /> {t('company.applicationDetail.downloadCV')}
                </a>
              )}
              {student?.linkedinUrl && (
                <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <GlobeAltIcon className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {allAppsFromStudent.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-amber-800">{t('company.applicationDetail.appliedToMany', { count: allAppsFromStudent.length })}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {allAppsFromStudent.map((a: any) => (
              <li key={a.id}><span className="text-xs bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">{a.offer?.title ?? 'Oferta'}</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3">{t('company.applicationDetail.skills')}</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <LanguageIcon className="w-4 h-4 text-green-600" /> {t('company.applicationDetail.languages')}
              </h2>
              <div className="space-y-2">
                {languages.map((lang: any) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{lang.language}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLOR[lang.level] ?? 'bg-gray-100 text-gray-600'}`}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">{t('company.applicationDetail.applicationSection')}</h2>
            <p className="text-sm text-gray-600 font-medium">{app.offer?.title ?? '-'}</p>
            {app.offer?.company?.companyName && <p className="text-xs text-gray-400 mt-0.5">{app.offer.company.companyName}</p>}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {experience.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-green-600" /> {t('company.applicationDetail.workExperience')}
              </h2>
              <div className="space-y-4">
                {experience.map((exp: any, i: number) => (
                  <div key={exp.id ?? i} className={i > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(exp.startDate)} - {exp.current ? t('company.applicationDetail.present') : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {education.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-green-600" /> {t('company.applicationDetail.education')}
              </h2>
              <div className="space-y-4">
                {education.map((edu: any, i: number) => (
                  <div key={edu.id ?? i} className={i > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(edu.startDate)} - {edu.current ? t('company.applicationDetail.present') : formatDate(edu.endDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {education.length === 0 && experience.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-gray-400 text-sm">{t('company.applicationDetail.profileIncomplete')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}