'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User } from '@/src/types';

// ─── Tipos locales ───────────────────────────────────────────────────────────
interface Education {
  id: string; degree: string; institution: string;
  startDate: string; endDate?: string; current: boolean;
}
interface Experience {
  id: string; position: string; company: string;
  startDate: string; endDate?: string; current: boolean;
}
interface Language { id: string; language: string; level: string; }
interface ProfileData {
  firstName?: string; lastName?: string;
  birthDate?: string; location?: string; avatar?: string; avatarUrl?: string;
  country?: string; phoneNumber?: string;
  bio?: string; skills?: string;
  linkedinUrl?: string; githubUrl?: string; resumeUrl?: string; careerField?: string;
  education: Education[]; experience: Experience[];
  cv?: { fileName: string; fileUrl: string };
  languages: Language[];
}
interface StudentProfileClientProps { user: User; profile: ProfileData; }

const LANGS = ['Español','Inglés','Portugués','Francés','Alemán','Italiano','Catalán','Chino','Árabe'];
const LEVELS = ['Nativo','A1','A2','B1','B2','C1','C2'];
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function fmt(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function save(path: string, body: unknown) {
  fetch(`${API}${path}`, { method: 'PUT', credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }).catch(() => {});
}

// ── Iconos inline ────────────────────────────────────────────────────────────
const IcoCal = () => (
  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>
);
const IcoPin = () => (
  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>
);
const IcoCam = () => (
  <svg className='w-3.5 h-3.5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'/></svg>
);
const IcoEdit = () => (
  <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'/></svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export function StudentProfileClient({ user, profile: init }: StudentProfileClientProps) {
  const t = useTranslations('intranet');
  const p = (k: string) => t(`student.profile.${k}`);
  const [education, setEducation] = useState<Education[]>(init.education ?? []);
  const [experience, setExperience] = useState<Experience[]>(init.experience ?? []);
  const [languages, setLanguages] = useState<Language[]>(init.languages ?? []);
  const [cv, setCv] = useState(init.cv);
  const [avatar, setAvatar] = useState<string | undefined>(
    init.avatarUrl ? `${API}${init.avatarUrl}` : (init.avatar ?? user.avatar ?? undefined)
  );

  // ── Info básica editable ──
  const [editInfo, setEditInfo] = useState(false);
  const [info, setInfo] = useState({
    firstName: init.firstName ?? '',
    lastName: init.lastName ?? '',
    birthDate: init.birthDate ?? '',
    location: init.location ?? '',
    country: init.country ?? '',
    phoneNumber: init.phoneNumber ?? '',
    bio: init.bio ?? '',
    skills: init.skills ?? '',
    linkedinUrl: init.linkedinUrl ?? '',
    githubUrl: init.githubUrl ?? '',
    resumeUrl: init.resumeUrl ?? '',
    careerField: init.careerField ?? '',
  });
  const saveInfo = () => {
    setEditInfo(false);
    save('/api/auth/me/profile', {
      firstName: info.firstName,
      lastName: info.lastName,
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
    });
  };

  // ── Estudios ──
  const EMPTY_EDU = { degree: '', institution: '', startDate: '', endDate: '', current: false };
  const [edu, setEdu] = useState(EMPTY_EDU);
  const [editEduId, setEditEduId] = useState<string | null>(null);
  const submitEdu = () => {
    if (!edu.degree.trim() || !edu.institution.trim() || !edu.startDate.trim()) return;
    let next: Education[];
    if (editEduId) {
      next = education.map(e => e.id === editEduId ? { ...edu, id: editEduId } : e);
      setEditEduId(null);
    } else {
      next = [...education, { ...edu, id: uid() }];
    }
    setEducation(next);
    setEdu(EMPTY_EDU);
    save('/api/student/profile/education', { education: next });
  };
  const editEdu = (e: Education) => { setEdu({ degree: e.degree, institution: e.institution, startDate: e.startDate, endDate: e.endDate ?? '', current: e.current }); setEditEduId(e.id); };
  const removeEdu = (id: string) => { const next = education.filter(e => e.id !== id); setEducation(next); save('/api/student/profile/education', { education: next }); };

  // ── Experiencia ──
  const EMPTY_EXP = { position: '', company: '', startDate: '', endDate: '', current: false };
  const [exp, setExp] = useState(EMPTY_EXP);
  const [editExpId, setEditExpId] = useState<string | null>(null);
  const submitExp = () => {
    if (!exp.position.trim() || !exp.company.trim() || !exp.startDate.trim()) return;
    let next: Experience[];
    if (editExpId) {
      next = experience.map(e => e.id === editExpId ? { ...exp, id: editExpId } : e);
      setEditExpId(null);
    } else {
      next = [...experience, { ...exp, id: uid() }];
    }
    setExperience(next);
    setExp(EMPTY_EXP);
    save('/api/student/profile/experience', { experience: next });
  };
  const editExp = (e: Experience) => { setExp({ position: e.position, company: e.company, startDate: e.startDate, endDate: e.endDate ?? '', current: e.current }); setEditExpId(e.id); };
  const removeExp = (id: string) => { const next = experience.filter(e => e.id !== id); setExperience(next); save('/api/student/profile/experience', { experience: next }); };

  // ── Idiomas ──
  const [lang, setLang] = useState({ language: '', level: 'B1' });
  const addLang = () => {
    if (!lang.language.trim() || languages.find(l => l.language === lang.language)) return;
    const next = [...languages, { ...lang, id: uid() }];
    setLanguages(next);
    setLang({ language: '', level: 'B1' });
    save('/api/student/profile/languages', { languages: next });
  };
  const removeLang = (id: string) => { const next = languages.filter(l => l.id !== id); setLanguages(next); save('/api/student/profile/languages', { languages: next }); };

  // ── CV ──
  const handleCVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData(); fd.append('cv', file);
      const res = await fetch(`${API}/api/student/profile/cv`, { method: 'POST', credentials: 'include', body: fd });
      const d = res.ok ? await res.json() : {};
      setCv({ fileName: d.fileName ?? file.name, fileUrl: d.fileUrl ? `${API}${d.fileUrl}` : '#' });
    } catch { setCv({ fileName: file.name, fileUrl: '#' }); }
  };
  const deleteCv = async () => {
    try { await fetch(`${API}/api/student/profile/cv`, { method: 'DELETE', credentials: 'include' }); } catch {}
    setCv(undefined);
  };

  // ── Avatar ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    // Mostrar preview local inmediatamente
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData(); fd.append('photo', file);
      const res = await fetch(`${API}/api/student/profile/photo`, { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        const d = await res.json();
        if (d.avatarUrl) setAvatar(`${API}${d.avatarUrl}`);
      }
    } catch {}
  };

  const iCls = 'flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400';
  const sCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400';
  const btnGreen = 'px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full font-medium transition-colors';
  const btnGhost = 'px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors';

  return (
    <div className='w-full pb-20'>

      {/* ── Banner + Avatar ── */}
      <div className='relative'>
        {/* Imagen banner */}
        <div className='w-full h-40 sm:h-52 overflow-hidden rounded-b-none'>
          <img
            src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'
            alt='banner'
            className='w-full h-full object-cover'
          />
        </div>

        {/* Avatar solapado — fuera del overflow-hidden */}
        <div className='absolute left-6 sm:left-10 -bottom-12'>
          <label htmlFor='avatar-up' className='cursor-pointer relative block w-24 h-24 sm:w-28 sm:h-28'>
            <div className='w-full h-full rounded-full border-4 border-white overflow-hidden bg-green-100 shadow-lg'>
              {avatar
                ? <img src={avatar} alt={info.firstName} className='w-full h-full object-cover' />
                : <div className='w-full h-full flex items-center justify-center bg-green-200 text-green-800 text-3xl font-bold'>{(info.firstName || user.email || 'U').charAt(0).toUpperCase()}</div>
              }
            </div>
            <div className='absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center'>
              <IcoCam />
            </div>
            <input id='avatar-up' type='file' accept='image/*' onChange={handleAvatarChange} className='hidden' />
          </label>
        </div>
      </div>

      {/* ── Cabecera editable ── */}
      <div className='px-6 sm:px-10 pt-16 pb-5 bg-white border-b border-gray-100'>
        {editInfo ? (
          <div className='space-y-3 max-w-lg'>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.firstName')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.firstName')} value={info.firstName} onChange={e => setInfo(pr => ({ ...pr, firstName: e.target.value }))} />
              </div>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.lastName')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.lastName')} value={info.lastName} onChange={e => setInfo(pr => ({ ...pr, lastName: e.target.value }))} />
              </div>
            </div>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.birthDate')}</label>
                <input type='date' className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  value={info.birthDate} onChange={e => setInfo(pr => ({ ...p, birthDate: e.target.value }))} />
              </div>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.phone')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.phone')} value={info.phoneNumber} onChange={e => setInfo(pr => ({ ...pr, phoneNumber: e.target.value }))} />
              </div>
            </div>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.city')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.city')} value={info.location} onChange={e => setInfo(pr => ({ ...pr, location: e.target.value }))} />
              </div>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.country')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.country')} value={info.country} onChange={e => setInfo(pr => ({ ...pr, country: e.target.value }))} />
              </div>
            </div>
            <div>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.careerField')}</label>
              <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                placeholder={p('placeholders.careerField')} value={info.careerField} onChange={e => setInfo(pr => ({ ...pr, careerField: e.target.value }))} />
            </div>
            <div>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.about')}</label>
              <textarea rows={3} className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none'
                placeholder={p('placeholders.about')} value={info.bio} onChange={e => setInfo(pr => ({ ...pr, bio: e.target.value }))} />
            </div>
            <div>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.skills')}</label>
              <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                placeholder={p('placeholders.skills')} value={info.skills} onChange={e => setInfo(pr => ({ ...pr, skills: e.target.value }))} />
            </div>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.linkedin')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.linkedin')} value={info.linkedinUrl} onChange={e => setInfo(pr => ({ ...pr, linkedinUrl: e.target.value }))} />
              </div>
              <div className='flex-1'>
                <label className='block text-xs text-gray-500 mb-1'>{p('labels.github')}</label>
                <input className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                  placeholder={p('placeholders.github')} value={info.githubUrl} onChange={e => setInfo(pr => ({ ...pr, githubUrl: e.target.value }))} />
              </div>
            </div>
            <div className='flex gap-2 pt-1'>
              <button onClick={saveInfo} className={btnGreen}>{p('saveBtn')}</button>
              <button onClick={() => setEditInfo(false)} className={btnGhost}>{p('cancelBtn')}</button>
            </div>
          </div>
        ) : (
          <div>
            <div className='flex items-start justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  {[info.firstName, info.lastName].filter(Boolean).join(' ') || user.name || <span className='text-gray-400 font-normal text-lg'>{p('addName')}</span>}
                </h1>
                <div className='flex flex-wrap items-center gap-4 mt-1.5 text-sm text-gray-500'>
                  {info.birthDate && <span className='flex items-center gap-1'><IcoCal />{fmt(info.birthDate)}</span>}
                  {(info.location || info.country) && (
                    <span className='flex items-center gap-1'><IcoPin />{[info.location, info.country].filter(Boolean).join(', ')}</span>
                  )}
                  {info.careerField && <span className='text-green-600 font-medium'>{info.careerField}</span>}
                  {info.phoneNumber && <span>📞 {info.phoneNumber}</span>}
                </div>
              </div>
              <button onClick={() => setEditInfo(true)} className='flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors mt-1'>
                <IcoEdit /> {p('editBtn')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Secciones ── */}
      <div className='bg-gray-50 px-6 sm:px-10 py-8 space-y-8'>

        {/* Sobre mí */}
        {(info.bio || info.careerField) && (
          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-gray-800 mb-3'>{p('sections.about')}</h2>
            {info.careerField && <p className='text-sm text-green-700 font-medium mb-2'>{info.careerField}</p>}
            {info.bio && <p className='text-sm text-gray-600 whitespace-pre-wrap'>{info.bio}</p>}
          </section>
        )}

        {/* Habilidades */}
        {info.skills && (
          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-gray-800 mb-3'>{p('sections.skills')}</h2>
            <div className='flex flex-wrap gap-2'>
              {info.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} className='bg-green-50 text-green-800 text-xs font-medium px-3 py-1 rounded-full border border-green-100'>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contacto y enlaces */}
        {(info.phoneNumber || info.linkedinUrl || info.githubUrl || info.resumeUrl) && (
          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-gray-800 mb-3'>{p('sections.contact')}</h2>
            <div className='space-y-2 text-sm text-gray-600'>
              {info.phoneNumber && (
                <p className='flex items-center gap-2'>📞 <span>{info.phoneNumber}</span></p>
              )}
              {info.linkedinUrl && (
                <p className='flex items-center gap-2'>
                  <svg className='w-4 h-4 text-blue-600' fill='currentColor' viewBox='0 0 24 24'><path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/></svg>
                  <a href={info.linkedinUrl} target='_blank' rel='noreferrer' className='text-blue-600 hover:underline truncate'>{info.linkedinUrl}</a>
                </p>
              )}
              {info.githubUrl && (
                <p className='flex items-center gap-2'>
                  <svg className='w-4 h-4 text-gray-700' fill='currentColor' viewBox='0 0 24 24'><path d='M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'/></svg>
                  <a href={info.githubUrl} target='_blank' rel='noreferrer' className='text-blue-600 hover:underline truncate'>{info.githubUrl}</a>
                </p>
              )}
              {info.resumeUrl && (
                <p className='flex items-center gap-2'>
                  📄 <a href={info.resumeUrl} target='_blank' rel='noreferrer' className='text-blue-600 hover:underline'>{p('cv.viewBtn')}</a>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Estudios */}
        <section className='bg-white rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>{p('sections.education')}</h2>
          <div className='space-y-3'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <input className={iCls} placeholder={p('placeholders.degree')}
                value={edu.degree} onChange={e => setEdu(pr => ({ ...p, degree: e.target.value }))} />
              <input className={`sm:w-56 ${iCls}`} placeholder={p('placeholders.institution')}
                value={edu.institution} onChange={e => setEdu(pr => ({ ...p, institution: e.target.value }))} />
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-400 mb-1'>{p('labels.startYear')}</label>
                <input type='date' className={`w-full ${iCls}`}
                  value={edu.startDate} onChange={e => setEdu(pr => ({ ...p, startDate: e.target.value }))} />
              </div>
              {!edu.current && (
                <div className='flex-1'>
                  <label className='block text-xs text-gray-400 mb-1'>{p('labels.endYear')}</label>
                  <input type='date' className={`w-full ${iCls}`}
                    value={edu.endDate} onChange={e => setEdu(pr => ({ ...p, endDate: e.target.value }))} />
                </div>
              )}
            </div>
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
                <input type='checkbox' checked={edu.current} onChange={e => setEdu(pr => ({ ...p, current: e.target.checked }))} className='accent-green-500' />
                {p('education.currentLabel')}
              </label>
              <div className='flex gap-2'>
                {editEduId && <button onClick={() => { setEdu(EMPTY_EDU); setEditEduId(null); }} className={btnGhost}>{p('cancelBtn')}</button>}
                <button onClick={submitEdu} className={btnGreen}>
                  {editEduId ? p('saveChanges') : p('education.addBtn')}
                </button>
              </div>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            {education.length === 0
              ? <p className='text-sm text-gray-400 italic text-center py-2'>{p('education.empty')}</p>
              : education.map(e => (
                <div key={e.id} className='flex items-start justify-between border border-gray-100 rounded-xl p-3'>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>{e.degree}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      🎓 {e.institution} &nbsp;·&nbsp; 📅 {fmt(e.startDate)} – {e.current ? p('present') : fmt(e.endDate)}
                    </p>
                  </div>
                  <div className='flex gap-2 ml-3 shrink-0'>
                    <button onClick={() => editEdu(e)} className='text-gray-400 hover:text-blue-500 transition-colors'><IcoEdit /></button>
                    <button onClick={() => removeEdu(e.id)} className='text-gray-300 hover:text-red-400 text-lg leading-none'>×</button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* Experiencia */}
        <section className='bg-white rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>{p('sections.experience')}</h2>
          <div className='space-y-3'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <input className={iCls} placeholder={p('placeholders.position')}
                value={exp.position} onChange={e => setExp(pr => ({ ...p, position: e.target.value }))} />
              <input className={iCls} placeholder={p('placeholders.company')}
                value={exp.company} onChange={e => setExp(pr => ({ ...p, company: e.target.value }))} />
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='flex-1'>
                <label className='block text-xs text-gray-400 mb-1'>{p('labels.startDate')}</label>
                <input type='date' className={`w-full ${iCls}`}
                  value={exp.startDate} onChange={e => setExp(pr => ({ ...p, startDate: e.target.value }))} />
              </div>
              {!exp.current && (
                <div className='flex-1'>
                  <label className='block text-xs text-gray-400 mb-1'>{p('labels.endDate')}</label>
                  <input type='date' className={`w-full ${iCls}`}
                    value={exp.endDate} onChange={e => setExp(pr => ({ ...p, endDate: e.target.value }))} />
                </div>
              )}
            </div>
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
                <input type='checkbox' checked={exp.current} onChange={e => setExp(pr => ({ ...p, current: e.target.checked }))} className='accent-green-500' />
                {p('experience.currentLabel')}
              </label>
              <div className='flex gap-2'>
                {editExpId && <button onClick={() => { setExp(EMPTY_EXP); setEditExpId(null); }} className={btnGhost}>{p('cancelBtn')}</button>}
                <button onClick={submitExp} className={btnGreen}>
                  {editExpId ? p('saveChanges') : p('experience.addBtn')}
                </button>
              </div>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            {experience.length === 0
              ? (
                <div className='text-center py-6 border border-dashed border-gray-200 rounded-xl'>
                  <p className='font-medium text-gray-600 text-sm'>{p('experience.emptyTitle')}</p>
                  <p className='text-xs text-gray-400 mt-1'>{p('experience.emptySubtitle')}</p>
                </div>
              )
              : experience.map(e => (
                <div key={e.id} className='flex items-start justify-between border border-gray-100 rounded-xl p-3'>
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>{e.position}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      🏢 {e.company} &nbsp;·&nbsp; 📅 {fmt(e.startDate)} – {e.current ? p('present') : fmt(e.endDate)}
                    </p>
                  </div>
                  <div className='flex gap-2 ml-3 shrink-0'>
                    <button onClick={() => editExp(e)} className='text-gray-400 hover:text-blue-500 transition-colors'><IcoEdit /></button>
                    <button onClick={() => removeExp(e.id)} className='text-gray-300 hover:text-red-400 text-lg leading-none'>×</button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* CV */}
        <section className='bg-white rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>{p('sections.cv')}</h2>
          <div className='flex flex-wrap items-center gap-3'>
            <label className={`cursor-pointer ${btnGreen}`}>
              {p('cv.upload')}
              <input type='file' accept='.pdf' onChange={handleCVChange} className='hidden' />
            </label>
            {cv ? (
              <span className='flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-full px-3 py-1.5'>
                <a href={cv.fileUrl} target='_blank' rel='noreferrer' className='underline underline-offset-2'>📄 {cv.fileName}</a>
                <button onClick={deleteCv} className='text-gray-400 hover:text-red-400 leading-none'>×</button>
              </span>
            ) : (
              <span className='text-sm text-gray-400 italic'>{p('cv.empty')}</span>
            )}
          </div>
        </section>

        {/* Idiomas */}
        <section className='bg-white rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-gray-800 mb-4'>{p('sections.languages')}</h2>
          <div className='flex flex-wrap gap-3 items-end'>
            <div>
              <label className='block text-xs text-gray-400 mb-1'>{p('labels.language')}</label>
              <select className={`w-44 ${sCls}`} value={lang.language} onChange={e => setLang(pr => ({ ...p, language: e.target.value }))}>
                <option value=''>{p('placeholders.selectLanguage')}</option>
                {LANGS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs text-gray-400 mb-1'>{p('labels.level')}</label>
              <select className={`w-28 ${sCls}`} value={lang.level} onChange={e => setLang(pr => ({ ...p, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={addLang} className={btnGreen}>{p('languages.addBtn')}</button>
          </div>
          {languages.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {languages.map(l => (
                <span key={l.id} className='flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm rounded-full px-3 py-1'>
                  {l.language} <span className='text-gray-400 text-xs'>{l.level}</span>
                  <button onClick={() => removeLang(l.id)} className='text-gray-400 hover:text-red-400 leading-none ml-0.5'>×</button>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Widget mensajes flotante ── */}
      <MessagesWidget />
    </div>
  );
}

function MessagesWidget() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('intranet');
  const p = (k: string) => t(`student.profile.${k}`);
  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2'>
      {open && (
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72'>
          <p className='font-semibold text-gray-700 text-sm mb-2 px-1'>{p('messages.title')}</p>
          <p className='text-sm text-gray-400 text-center py-6'>{p('messages.empty')}</p>
        </div>
      )}
      <button onClick={() => setOpen(prev => !prev)}
        className='flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'>
        <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'/></svg>
        {p('messages.title')}
        <svg className='w-3 h-3 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={open ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}/></svg>
      </button>
    </div>
  );
}