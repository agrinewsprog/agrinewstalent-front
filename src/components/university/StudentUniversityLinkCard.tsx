'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Resolve a possibly-relative logo URL to an absolute one */
function resolveLogoUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const base = API.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export interface LinkedUniversity {
  id: string | number;
  universityId?: string | number;
  name: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  location?: string;
  description?: string;
}

type RedeemStatus = 'idle' | 'loading' | 'success' | 'error';

interface Props {
  /** Pre-fetched university (from server component). null = not linked. */
  initialUniversity?: LinkedUniversity | null;
  /** Called after a successful link so the parent can react (e.g. refetch programs). */
  onLinked?: (uni: LinkedUniversity) => void;
}

export function StudentUniversityLinkCard({ initialUniversity = null, onLinked }: Props) {
  const t = useTranslations('intranet');

  const [fetchedUniversity, setFetchedUniversity] = useState<LinkedUniversity | null>(initialUniversity ?? null);
  const [loading, setLoading] = useState(initialUniversity === undefined);
  const [code, setCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<RedeemStatus>('idle');
  const [redeemError, setRedeemError] = useState('');

  /* ── fetch university ── */
  const fetchUniversity = useCallback(async (): Promise<LinkedUniversity | null> => {
    try {
      const res = await fetch(`${API}/api/students/me/university`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const uni = data?.university ?? data;
      if (uni && (uni.name || uni.id)) {
        return {
          id: uni.id ?? uni.universityId,
          universityId: uni.universityId ?? uni.id,
          name: uni.name ?? uni.universityName ?? '',
          logoUrl: uni.logoUrl ?? uni.logo,
          city: uni.city,
          country: uni.country,
          location: uni.location,
          description: uni.description,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  /* Initial client-side fetch when no server data provided */
  useEffect(() => {
    if (initialUniversity !== undefined && initialUniversity !== null) return;
    let cancelled = false;
    (async () => {
      const uni = await fetchUniversity();
      if (!cancelled) {
        setFetchedUniversity(uni);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initialUniversity, fetchUniversity]);

  const university = initialUniversity !== undefined ? initialUniversity : fetchedUniversity;

  /* ── redeem invite ── */
  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setRedeemStatus('loading');
    setRedeemError('');

    const payload = { inviteCode: String(trimmed) };
    const url = `${API}/api/students/me/university/redeem-invite`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await res.json().catch(() => null);
        setRedeemStatus('success');
        setCode('');
        const uni = await fetchUniversity();
        setFetchedUniversity(uni);
        if (uni && onLinked) onLinked(uni);
      } else {
        const body = await res.json().catch(() => null);
        const msg =
          body?.error?.message ??
          body?.message ??
          (typeof body?.error === 'string' ? body.error : '') ??
          '';
        setRedeemError(msg || t('student.university.invalidCode'));
        setRedeemStatus('error');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[redeem-invite] network error:', err);
      }
      setRedeemError(t('student.university.networkError'));
      setRedeemStatus('error');
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-14 bg-gray-100 rounded-xl" />
      </section>
    );
  }

  /* ── University linked ── */
  if (university) {
    const uniLocation = [university.city, university.country].filter(Boolean).join(', ') || university.location || '';

    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-green-600" />
          {t('student.university.linkedTitle')}
        </h2>

        <div className="flex items-center gap-4">
          {resolveLogoUrl(university.logoUrl) ? (
            <img
              src={resolveLogoUrl(university.logoUrl)!}
              alt={university.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
              {(university.name || '?')[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{university.name}</p>
            {uniLocation && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {uniLocation}
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
            {t('student.university.linked')}
          </span>
        </div>
      </section>
    );
  }

  /* ── No university — invite code form ── */
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center">
          <AcademicCapIcon className="h-7 w-7 text-purple-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{t('student.university.noUniversity')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('student.university.joinDescription')}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (redeemStatus !== 'idle') setRedeemStatus('idle');
          }}
          placeholder={t('student.university.codePlaceholder')}
          className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
          disabled={redeemStatus === 'loading'}
        />
        <button
          onClick={handleRedeem}
          disabled={redeemStatus === 'loading' || !code.trim()}
          className="shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {redeemStatus === 'loading' ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            t('student.university.connectBtn')
          )}
        </button>
      </div>

      {redeemStatus === 'success' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('student.university.successMsg')}
        </div>
      )}

      {redeemStatus === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {redeemError}
        </div>
      )}
    </section>
  );
}
