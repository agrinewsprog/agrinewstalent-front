'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { User } from '@/types';
import { StudentUniversityLinkCard } from '@/components/university/StudentUniversityLinkCard';
import { getDisplayInitial, toAbsoluteAssetUrl, unwrapEntity } from '@/lib/frontend/contracts';
import { PageHeader, PageShell, SectionCard } from '@/components/ui/intranet-page';

interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Language {
  id: string;
  language: string;
  level: string;
}

interface LinkedUniversity {
  id?: string | number;
  universityId?: string | number;
  name?: string;
  universityName?: string;
  logoUrl?: string | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  description?: string | null;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  location?: string;
  avatar?: string;
  avatarUrl?: string;
  country?: string;
  phoneNumber?: string;
  bio?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  careerField?: string;
  education: Education[];
  experience: Experience[];
  cv?: { fileName: string; fileUrl: string };
  languages: Language[];
  university?: LinkedUniversity | null;
}

interface StudentProfileClientProps {
  user: User;
  profile: ProfileData;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const STUDENT_PROFILE_API = `${API}/api/students/profile`;
const LANGS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano', 'Catalán', 'Chino', 'Árabe'];
const LEVELS = ['Nativo', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fmt(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function mapProfile(init: ProfileData): ProfileData {
  return {
    ...init,
    education: init.education ?? [],
    experience: init.experience ?? [],
    languages: init.languages ?? [],
  };
}

function readErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const error = record.error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof record.message === 'string' && record.message.trim()) return record.message;
  return null;
}

export function StudentProfileClient({ user, profile: initialProfile }: StudentProfileClientProps) {
  const t = useTranslations('intranet');
  const p = (key: string) => t(`student.profile.${key}`);

  const [profile, setProfile] = useState<ProfileData>(() => mapProfile(initialProfile));
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editInfo, setEditInfo] = useState(false);

  const [info, setInfo] = useState({
    firstName: initialProfile.firstName ?? '',
    lastName: initialProfile.lastName ?? '',
    birthDate: initialProfile.birthDate ?? '',
    location: initialProfile.location ?? '',
    country: initialProfile.country ?? '',
    phoneNumber: initialProfile.phoneNumber ?? '',
    bio: initialProfile.bio ?? '',
    skills: initialProfile.skills ?? '',
    linkedinUrl: initialProfile.linkedinUrl ?? '',
    githubUrl: initialProfile.githubUrl ?? '',
    resumeUrl: initialProfile.resumeUrl ?? '',
    careerField: initialProfile.careerField ?? '',
  });

  const [educationDraft, setEducationDraft] = useState({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);

  const [experienceDraft, setExperienceDraft] = useState({
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);

  const [languageDraft, setLanguageDraft] = useState({ language: '', level: 'B1' });

  const avatarUrl =
    toAbsoluteAssetUrl(profile.avatarUrl ?? profile.avatar ?? user.avatarUrl ?? user.avatar, API) ?? null;

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch(STUDENT_PROFILE_API, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      const raw = unwrapEntity<Record<string, unknown>>(data, ['profile', 'data']) ?? {};
      const resumeUrl =
        typeof raw.resumeUrl === 'string' && raw.resumeUrl.trim()
          ? raw.resumeUrl
          : null;
      const nextProfile: ProfileData = {
        firstName: typeof raw.firstName === 'string' ? raw.firstName : info.firstName,
        lastName: typeof raw.lastName === 'string' ? raw.lastName : info.lastName,
        birthDate:
          typeof raw.birthDate === 'string'
            ? raw.birthDate
            : typeof raw.dateOfBirth === 'string'
              ? raw.dateOfBirth
              : info.birthDate,
        location:
          typeof raw.location === 'string'
            ? raw.location
            : typeof raw.city === 'string'
              ? raw.city
              : info.location,
        country: typeof raw.country === 'string' ? raw.country : info.country,
        phoneNumber: typeof raw.phoneNumber === 'string' ? raw.phoneNumber : info.phoneNumber,
        bio: typeof raw.bio === 'string' ? raw.bio : info.bio,
        skills: typeof raw.skills === 'string' ? raw.skills : info.skills,
        linkedinUrl: typeof raw.linkedinUrl === 'string' ? raw.linkedinUrl : info.linkedinUrl,
        githubUrl: typeof raw.githubUrl === 'string' ? raw.githubUrl : info.githubUrl,
        resumeUrl: resumeUrl ?? '',
        careerField: typeof raw.careerField === 'string' ? raw.careerField : info.careerField,
        avatarUrl:
          typeof raw.avatarUrl === 'string'
            ? raw.avatarUrl
            : typeof raw.avatar === 'string'
              ? raw.avatar
              : profile.avatarUrl,
        cv: resumeUrl
          ? {
              fileName: raw.resumeFileName && typeof raw.resumeFileName === 'string' ? raw.resumeFileName : 'CV',
              fileUrl: toAbsoluteAssetUrl(resumeUrl, API) ?? resumeUrl,
            }
          : undefined,
        education: Array.isArray(raw.education) ? (raw.education as Education[]) : profile.education,
        experience: Array.isArray(raw.experience) ? (raw.experience as Experience[]) : profile.experience,
        languages: Array.isArray(raw.languages) ? (raw.languages as Language[]) : profile.languages,
        university:
          raw.university && typeof raw.university === 'object'
            ? (raw.university as LinkedUniversity)
            : null,
      };
      setProfile(nextProfile);
      setInfo({
        firstName: nextProfile.firstName ?? '',
        lastName: nextProfile.lastName ?? '',
        birthDate: nextProfile.birthDate ?? '',
        location: nextProfile.location ?? '',
        country: nextProfile.country ?? '',
        phoneNumber: nextProfile.phoneNumber ?? '',
        bio: nextProfile.bio ?? '',
        skills: nextProfile.skills ?? '',
        linkedinUrl: nextProfile.linkedinUrl ?? '',
        githubUrl: nextProfile.githubUrl ?? '',
        resumeUrl: nextProfile.resumeUrl ?? '',
        careerField: nextProfile.careerField ?? '',
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[student/profile] refresh error', err);
    }
  }, [info, profile]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const saveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await fetch(`${API}/api/auth/me/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: info.firstName || undefined,
          lastName: info.lastName || undefined,
          birthDate: info.birthDate || undefined,
          location: info.location || undefined,
          country: info.country || undefined,
          phoneNumber: info.phoneNumber || undefined,
          bio: info.bio || undefined,
          skills: info.skills || undefined,
          linkedinUrl: info.linkedinUrl || undefined,
          githubUrl: info.githubUrl || undefined,
          resumeUrl: info.resumeUrl || undefined,
          careerField: info.careerField || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      }
      setEditInfo(false);
      await refreshProfile();
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[student/profile] save info error', err);
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    } finally {
      setSavingInfo(false);
    }
  };

  const saveCollection = async (path: string, key: string, value: unknown) => {
    const res = await fetch(`${STUDENT_PROFILE_API}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
    }
    await refreshProfile();
  };

  const submitEducation = async () => {
    if (!educationDraft.degree.trim() || !educationDraft.institution.trim() || !educationDraft.startDate.trim()) return;
    const next = editingEducationId
      ? profile.education.map((item) =>
          item.id === editingEducationId ? { ...educationDraft, id: editingEducationId } : item,
        )
      : [...profile.education, { ...educationDraft, id: uid() }];
    try {
      await saveCollection('/education', 'education', next);
      setEducationDraft({ degree: '', institution: '', startDate: '', endDate: '', current: false });
      setEditingEducationId(null);
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    }
  };

  const submitExperience = async () => {
    if (!experienceDraft.position.trim() || !experienceDraft.company.trim() || !experienceDraft.startDate.trim()) return;
    const next = editingExperienceId
      ? profile.experience.map((item) =>
          item.id === editingExperienceId ? { ...experienceDraft, id: editingExperienceId } : item,
        )
      : [...profile.experience, { ...experienceDraft, id: uid() }];
    try {
      await saveCollection('/experience', 'experience', next);
      setExperienceDraft({ position: '', company: '', startDate: '', endDate: '', current: false });
      setEditingExperienceId(null);
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    }
  };

  const addLanguage = async () => {
    if (!languageDraft.language.trim() || profile.languages.some((lang) => lang.language === languageDraft.language)) return;
    const next = [...profile.languages, { ...languageDraft, id: uid() }];
    try {
      await saveCollection('/languages', 'languages', next);
      setLanguageDraft({ language: '', level: 'B1' });
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    }
  };

  const removeLanguage = async (id: string) => {
    const next = profile.languages.filter((lang) => lang.id !== id);
    try {
      await saveCollection('/languages', 'languages', next);
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    }
  };

  const handleCvChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const res = await fetch(`${STUDENT_PROFILE_API}/cv`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      const fileUrl = body?.data?.fileUrl ?? body?.fileUrl ?? body?.resumeUrl ?? null;
      const fileName = body?.data?.fileName ?? body?.fileName ?? file.name;
      setProfile((prev) => ({
        ...prev,
        cv: fileUrl ? { fileName, fileUrl: toAbsoluteAssetUrl(fileUrl, API) ?? fileUrl } : prev.cv,
      }));
      await refreshProfile();
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[student/profile] cv upload error', err);
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    } finally {
      setUploadingCv(false);
      event.target.value = '';
    }
  };

  const deleteCv = async () => {
    try {
      const res = await fetch(`${STUDENT_PROFILE_API}/cv`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      }
      setProfile((prev) => ({ ...prev, cv: undefined }));
      await refreshProfile();
      setFeedback(t('common.feedback.deleted'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[student/profile] cv delete error', err);
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${STUDENT_PROFILE_API}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(readErrorMessage(body) ?? `HTTP ${res.status}`);
      const nextAvatar = body?.data?.avatarUrl ?? body?.avatarUrl ?? body?.photoUrl ?? null;
      if (nextAvatar) {
        setProfile((prev) => ({ ...prev, avatarUrl: toAbsoluteAssetUrl(nextAvatar, API) ?? nextAvatar }));
      }
      await refreshProfile();
      setFeedback(t('common.feedback.saved'));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[student/profile] avatar upload error', err);
      setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const profileName =
    [info.firstName, info.lastName].filter(Boolean).join(' ') || user.name || p('addName');

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400';
  const buttonCls = 'rounded-full bg-green-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600';
  const ghostCls = 'rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50';

  return (
    <PageShell className="max-w-5xl space-y-6 pb-16">
      <PageHeader
        title={profileName}
        subtitle={user.email}
        actions={
          !editInfo ? (
            <button onClick={() => setEditInfo(true)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700">
              {p('editBtn')}
            </button>
          ) : undefined
        }
      />

      <SectionCard className="overflow-hidden">
      <div className="h-40 overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 sm:h-52" />

      <div className="bg-white px-6 pb-5 pt-16 sm:px-10">
        <div className="relative -mt-28 mb-4 w-fit">
          <label className="relative block h-24 w-24 cursor-pointer rounded-full border-4 border-white bg-green-100 shadow-lg sm:h-28 sm:w-28">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profileName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-green-200 text-3xl font-bold text-green-800">
                {getDisplayInitial(profileName)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 rounded-full bg-white p-1.5 shadow">
              <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
          </label>
        </div>

        {feedback && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{feedback}</div>}

        {editInfo ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputCls} placeholder={p('placeholders.firstName')} value={info.firstName} onChange={(e) => setInfo((prev) => ({ ...prev, firstName: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.lastName')} value={info.lastName} onChange={(e) => setInfo((prev) => ({ ...prev, lastName: e.target.value }))} />
              <input type="date" className={inputCls} value={info.birthDate} onChange={(e) => setInfo((prev) => ({ ...prev, birthDate: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.phone')} value={info.phoneNumber} onChange={(e) => setInfo((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.city')} value={info.location} onChange={(e) => setInfo((prev) => ({ ...prev, location: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.country')} value={info.country} onChange={(e) => setInfo((prev) => ({ ...prev, country: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.careerField')} value={info.careerField} onChange={(e) => setInfo((prev) => ({ ...prev, careerField: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.skills')} value={info.skills} onChange={(e) => setInfo((prev) => ({ ...prev, skills: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.linkedin')} value={info.linkedinUrl} onChange={(e) => setInfo((prev) => ({ ...prev, linkedinUrl: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.github')} value={info.githubUrl} onChange={(e) => setInfo((prev) => ({ ...prev, githubUrl: e.target.value }))} />
            </div>
            <textarea className={`${inputCls} resize-none`} rows={4} placeholder={p('placeholders.about')} value={info.bio} onChange={(e) => setInfo((prev) => ({ ...prev, bio: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={saveInfo} disabled={savingInfo} className={buttonCls}>
                {savingInfo ? p('saveBtn') : p('saveBtn')}
              </button>
              <button onClick={() => setEditInfo(false)} className={ghostCls}>
                {p('cancelBtn')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profileName}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {info.birthDate && <span>{fmt(info.birthDate)}</span>}
                  {(info.location || info.country) && <span>{[info.location, info.country].filter(Boolean).join(', ')}</span>}
                  {info.careerField && <span className="font-medium text-green-600">{info.careerField}</span>}
                  {info.phoneNumber && <span>{info.phoneNumber}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </SectionCard>

      <div className="space-y-6">
        {(info.bio || info.careerField) && (
          <SectionCard className="p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-800">{p('sections.about')}</h2>
            {info.careerField && <p className="mb-2 text-sm font-medium text-green-700">{info.careerField}</p>}
            {info.bio && <p className="whitespace-pre-wrap text-sm text-gray-600">{info.bio}</p>}
          </SectionCard>
        )}

        {info.skills && (
          <SectionCard className="p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-800">{p('sections.skills')}</h2>
            <div className="flex flex-wrap gap-2">
              {info.skills.split(',').map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                  {skill}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {(info.phoneNumber || info.linkedinUrl || info.githubUrl || profile.cv) && (
          <SectionCard className="p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-800">{p('sections.contact')}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {info.phoneNumber && <p>{info.phoneNumber}</p>}
              {info.linkedinUrl && <a href={info.linkedinUrl} target="_blank" rel="noreferrer" className="block truncate text-blue-600 hover:underline">{info.linkedinUrl}</a>}
              {info.githubUrl && <a href={info.githubUrl} target="_blank" rel="noreferrer" className="block truncate text-blue-600 hover:underline">{info.githubUrl}</a>}
              {profile.cv && <a href={profile.cv.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{p('cv.viewBtn')}</a>}
            </div>
          </SectionCard>
        )}

        <SectionCard className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-800">{p('sections.education')}</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input className={inputCls} placeholder={p('placeholders.degree')} value={educationDraft.degree} onChange={(e) => setEducationDraft((prev) => ({ ...prev, degree: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.institution')} value={educationDraft.institution} onChange={(e) => setEducationDraft((prev) => ({ ...prev, institution: e.target.value }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" className={inputCls} value={educationDraft.startDate} onChange={(e) => setEducationDraft((prev) => ({ ...prev, startDate: e.target.value }))} />
              {!educationDraft.current && (
                <input type="date" className={inputCls} value={educationDraft.endDate} onChange={(e) => setEducationDraft((prev) => ({ ...prev, endDate: e.target.value }))} />
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={educationDraft.current} onChange={(e) => setEducationDraft((prev) => ({ ...prev, current: e.target.checked }))} className="accent-green-500" />
                {p('education.currentLabel')}
              </label>
              <div className="flex gap-2">
                {editingEducationId && <button onClick={() => { setEditingEducationId(null); setEducationDraft({ degree: '', institution: '', startDate: '', endDate: '', current: false }); }} className={ghostCls}>{p('cancelBtn')}</button>}
                <button onClick={submitEducation} className={buttonCls}>{editingEducationId ? p('saveChanges') : p('education.addBtn')}</button>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {profile.education.length === 0 ? (
              <p className="py-2 text-center text-sm italic text-gray-400">{p('education.empty')}</p>
            ) : (
              profile.education.map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-xl border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.degree}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.institution} · {fmt(item.startDate)} – {item.current ? p('present') : fmt(item.endDate)}</p>
                  </div>
                  <div className="ml-3 flex gap-2">
                    <button onClick={() => { setEditingEducationId(item.id); setEducationDraft({ degree: item.degree, institution: item.institution, startDate: item.startDate, endDate: item.endDate ?? '', current: item.current }); }} className="text-gray-400 hover:text-blue-500">{p('editBtn')}</button>
                    <button
                      onClick={async () => {
                        const next = profile.education.filter((entry) => entry.id !== item.id);
                        try {
                          await saveCollection('/education', 'education', next);
                          setFeedback(t('common.feedback.deleted'));
                        } catch (err) {
                          setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
                        }
                      }}
                      className="text-gray-300 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-800">{p('sections.experience')}</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input className={inputCls} placeholder={p('placeholders.position')} value={experienceDraft.position} onChange={(e) => setExperienceDraft((prev) => ({ ...prev, position: e.target.value }))} />
              <input className={inputCls} placeholder={p('placeholders.company')} value={experienceDraft.company} onChange={(e) => setExperienceDraft((prev) => ({ ...prev, company: e.target.value }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" className={inputCls} value={experienceDraft.startDate} onChange={(e) => setExperienceDraft((prev) => ({ ...prev, startDate: e.target.value }))} />
              {!experienceDraft.current && (
                <input type="date" className={inputCls} value={experienceDraft.endDate} onChange={(e) => setExperienceDraft((prev) => ({ ...prev, endDate: e.target.value }))} />
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={experienceDraft.current} onChange={(e) => setExperienceDraft((prev) => ({ ...prev, current: e.target.checked }))} className="accent-green-500" />
                {p('experience.currentLabel')}
              </label>
              <div className="flex gap-2">
                {editingExperienceId && <button onClick={() => { setEditingExperienceId(null); setExperienceDraft({ position: '', company: '', startDate: '', endDate: '', current: false }); }} className={ghostCls}>{p('cancelBtn')}</button>}
                <button onClick={submitExperience} className={buttonCls}>{editingExperienceId ? p('saveChanges') : p('experience.addBtn')}</button>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {profile.experience.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
                <p className="text-sm font-medium text-gray-600">{p('experience.emptyTitle')}</p>
                <p className="mt-1 text-xs text-gray-400">{p('experience.emptySubtitle')}</p>
              </div>
            ) : (
              profile.experience.map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-xl border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.position}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.company} · {fmt(item.startDate)} – {item.current ? p('present') : fmt(item.endDate)}</p>
                  </div>
                  <div className="ml-3 flex gap-2">
                    <button onClick={() => { setEditingExperienceId(item.id); setExperienceDraft({ position: item.position, company: item.company, startDate: item.startDate, endDate: item.endDate ?? '', current: item.current }); }} className="text-gray-400 hover:text-blue-500">{p('editBtn')}</button>
                    <button
                      onClick={async () => {
                        const next = profile.experience.filter((entry) => entry.id !== item.id);
                        try {
                          await saveCollection('/experience', 'experience', next);
                          setFeedback(t('common.feedback.deleted'));
                        } catch (err) {
                          setFeedback(err instanceof Error && err.message ? err.message : t('common.errors.generic'));
                        }
                      }}
                      className="text-gray-300 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-800">{p('sections.cv')}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className={buttonCls}>
              {uploadingCv ? p('saveBtn') : p('cv.upload')}
              <input type="file" accept=".pdf" className="hidden" onChange={handleCvChange} disabled={uploadingCv} />
            </label>
            {profile.cv ? (
              <span className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
                <a href={profile.cv.fileUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  {profile.cv.fileName}
                </a>
                <button onClick={deleteCv} className="leading-none text-gray-400 hover:text-red-400">×</button>
              </span>
            ) : (
              <span className="text-sm italic text-gray-400">{p('cv.empty')}</span>
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-800">{p('sections.languages')}</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">{p('labels.language')}</label>
              <select className={`${inputCls} w-44`} value={languageDraft.language} onChange={(e) => setLanguageDraft((prev) => ({ ...prev, language: e.target.value }))}>
                <option value="">{p('placeholders.selectLanguage')}</option>
                {LANGS.map((language) => <option key={language}>{language}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">{p('labels.level')}</label>
              <select className={`${inputCls} w-28`} value={languageDraft.level} onChange={(e) => setLanguageDraft((prev) => ({ ...prev, level: e.target.value }))}>
                {LEVELS.map((level) => <option key={level}>{level}</option>)}
              </select>
            </div>
            <button onClick={addLanguage} className={buttonCls}>{p('languages.addBtn')}</button>
          </div>
          {profile.languages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.languages.map((language) => (
                <span key={language.id} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {language.language} <span className="text-xs text-gray-400">{language.level}</span>
                  <button onClick={() => removeLanguage(language.id)} className="ml-0.5 leading-none text-gray-400 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div>
        <StudentUniversityLinkCard
          initialUniversity={
            profile.university && (profile.university.id ?? profile.university.universityId) && profile.university.name
              ? {
                  id: profile.university.id ?? profile.university.universityId ?? '',
                  universityId: profile.university.universityId,
                  name: profile.university.name,
                  logoUrl: profile.university.logoUrl ?? undefined,
                  city: profile.university.city ?? undefined,
                  country: profile.university.country ?? undefined,
                  location: profile.university.location ?? undefined,
                  description: profile.university.description ?? undefined,
                }
              : null
          }
        />
      </div>
    </PageShell>
  );
}
