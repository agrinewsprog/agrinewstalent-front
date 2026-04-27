'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LinkedUniversity {
  id: string | number;
  name: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  description?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function UniversityLinkSection() {
  const t = useTranslations('intranet.student.university');

  const [university, setUniversity] = useState<LinkedUniversity | null>(null);
  const [fetching, setFetching] = useState(true);

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUniversity = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API}/api/students/me/university`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const uni = data?.university ?? data;
        if (uni && (uni.name || uni.id)) {
          setUniversity({
            id: uni.id,
            name: uni.name ?? uni.universityName ?? '',
            logoUrl: uni.logoUrl ?? uni.logo,
            city: uni.city,
            country: uni.country,
            description: uni.description,
          });
        } else {
          setUniversity(null);
        }
      } else {
        setUniversity(null);
      }
    } catch {
      setUniversity(null);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversity();
  }, [fetchUniversity]);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API}/api/students/me/university/redeem-invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      if (res.ok) {
        setStatus('success');
        setCode('');
        await fetchUniversity();
      } else {
        const body = await res.json().catch(() => null);
        const msg =
          body?.message ??
          body?.error?.message ??
          (typeof body?.error === 'string' ? body.error : '') ??
          '';
        setErrorMsg(msg || t('invalidCode'));
        setStatus('error');
      }
    } catch {
      setErrorMsg(t('networkError'));
      setStatus('error');
    }
  };

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (fetching) {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-12 bg-gray-100 rounded-xl" />
      </section>
    );
  }

  /* ── University already linked ────────────────────────────── */
  if (university) {
    const location = [university.city, university.country].filter(Boolean).join(', ');
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {t('linkedTitle')}
        </h2>

        <div className="flex items-center gap-4">
          {university.logoUrl ? (
            <img
              src={university.logoUrl}
              alt={university.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
              {(university.name || '?')[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{university.name}</p>
            {location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
            )}
            {university.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{university.description}</p>
            )}
          </div>

          <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('linked')}
          </span>
        </div>
      </section>
    );
  }

  /* ── No university – redeem code form ─────────────────────── */
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {t('joinTitle')}
      </h2>
      <p className="text-sm text-gray-500 mb-4">{t('joinDescription')}</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder={t('codePlaceholder')}
          className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
          disabled={status === 'loading'}
        />
        <button
          onClick={handleRedeem}
          disabled={status === 'loading' || !code.trim()}
          className="shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {status === 'loading' ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            t('connectBtn')
          )}
        </button>
      </div>

      {/* Success feedback */}
      {status === 'success' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('successMsg')}
        </div>
      )}

      {/* Error feedback */}
      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}
    </section>
  );
}
