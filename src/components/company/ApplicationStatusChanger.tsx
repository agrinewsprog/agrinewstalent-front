'use client';

import { createPortal } from 'react-dom';
import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { normalizeApplicationStatus } from '@/lib/frontend/contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUSES = ['PENDING', 'INTERVIEW', 'HIRED', 'REJECTED'] as const;
export type AppStatus = (typeof STATUSES)[number];

function normalizeStatus(raw: string): string {
  return normalizeApplicationStatus(raw);
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  INTERVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  HIRED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  INTERVIEW: 'bg-purple-500',
  HIRED: 'bg-green-500',
  REJECTED: 'bg-red-500',
};

interface Props {
  applicationId: string;
  currentStatus: string;
  applicationSource?: 'job' | 'program' | null;
  onStatusChanged?: (applicationId: string, newStatus: string) => void;
  size?: 'sm' | 'md';
}

function useFloatingPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  const [pos, setPos] = useState<{ top: number; left: number; right: number } | null>(null);

  useEffect(() => {
    let frame: number | null = null;

    if (!isOpen || !triggerRef.current) {
      frame = window.requestAnimationFrame(() => setPos(null));
      return () => {
        if (frame !== null) window.cancelAnimationFrame(frame);
      };
    }

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    };

    frame = window.requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, triggerRef]);

  return pos;
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  if (typeof record.error === 'string') return record.error;
  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === 'string') return nested.message;
  }
  return null;
}

function extractPersistedStatus(body: unknown, fallbackStatus: string): string {
  if (!body || typeof body !== 'object') return fallbackStatus;
  const KNOWN = new Set(['PENDING', 'INTERVIEW', 'HIRED', 'REJECTED', 'SUBMITTED', 'VIEWED', 'INTERVIEW_REQUESTED']);
  const record = body as Record<string, unknown>;
  const data = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null;
  const application = record.application && typeof record.application === 'object'
    ? (record.application as Record<string, unknown>)
    : null;
  const dataApplication = data?.application && typeof data.application === 'object'
    ? (data.application as Record<string, unknown>)
    : null;

  const nestedStatus =
    (typeof data?.status === 'string' ? data.status : null) ??
    (typeof application?.status === 'string' ? application.status : null) ??
    (typeof dataApplication?.status === 'string' ? dataApplication.status : null);

  if (nestedStatus) return nestedStatus;

  if (typeof record.status === 'string' && KNOWN.has(record.status.toUpperCase())) {
    return record.status;
  }

  return fallbackStatus;
}

export function ApplicationStatusChanger({
  applicationId,
  currentStatus,
  applicationSource,
  onStatusChanged,
  size = 'sm',
}: Props) {
  const t = useTranslations('intranet');
  const router = useRouter();
  const [status, setStatus] = useState(() => normalizeStatus(currentStatus));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pos = useFloatingPosition(triggerRef, open || !!feedback);

  useEffect(() => {
    setStatus(normalizeStatus(currentStatus));
  }, [currentStatus]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const statusLabel = useCallback(
    (rawStatus: string): string => {
      const normalized = normalizeStatus(rawStatus);
      try {
        const result = t(`company.statusChanger.${normalized}` as Parameters<typeof t>[0]);
        if (typeof result === 'string' && result.includes('company.statusChanger.')) return normalized;
        return result;
      } catch {
        return normalized;
      }
    },
    [t],
  );

  const handleChange = async (newStatus: string) => {
    const canonicalStatus = normalizeStatus(newStatus);
    if (!(STATUSES as readonly string[]).includes(canonicalStatus)) {
      setFeedback({ type: 'error', msg: t('company.statusChanger.error') });
      setOpen(false);
      return;
    }

    if (canonicalStatus === status) {
      setOpen(false);
      return;
    }

    setLoading(true);
    setFeedback(null);
    setOpen(false);

    try {
      const response = await fetch(`${API_BASE}/api/companies/me/applications/${applicationId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: canonicalStatus,
          ...(applicationSource ? { type: applicationSource } : {}),
        }),
      });

      const body = await response.json().catch(() => null);
      const backendMessage = extractMessage(body) ?? t('company.statusChanger.error');

      if (!response.ok) {
        setFeedback({ type: 'error', msg: backendMessage });
        const recoveredStatus = extractPersistedStatus(body, status);
        setStatus(normalizeStatus(recoveredStatus));
        return;
      }

      const finalStatus = normalizeStatus(extractPersistedStatus(body, canonicalStatus));
      setStatus(finalStatus);
      setFeedback({ type: 'success', msg: t('company.statusChanger.updated') });
      onStatusChanged?.(applicationId, finalStatus);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('company.statusChanger.error');
      setFeedback({ type: 'error', msg: message });
    } finally {
      setLoading(false);
    }
  };

  const badgeColor = STATUS_COLORS[normalizeStatus(status)] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={loading}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border transition-all ${badgeColor} ${textSize} ${
          loading ? 'opacity-60 cursor-wait' : 'hover:shadow-sm cursor-pointer'
        }`}
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {statusLabel(status)}
      </button>

      {open && !loading && pos && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[180px]"
        >
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
            {t('company.statusChanger.changeStatus')}
          </p>
          {STATUSES.map((candidateStatus) => {
            const isActive = candidateStatus === status;
            const dotColor = STATUS_DOT[candidateStatus] ?? 'bg-gray-400';
            return (
              <button
                key={candidateStatus}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleChange(candidateStatus);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-gray-50 font-semibold text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                {statusLabel(candidateStatus)}
                {isActive && (
                  <svg className="w-4 h-4 ml-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body,
      )}

      {feedback && pos && createPortal(
        <div
          style={{ position: 'absolute', top: pos.top, right: pos.right, zIndex: 9999 }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg whitespace-nowrap ${
            feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {feedback.type === 'success' ? 'OK' : 'Error'} {feedback.msg}
        </div>,
        document.body,
      )}
    </>
  );
}
