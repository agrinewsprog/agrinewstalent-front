'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  PlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  LinkIcon,
  KeyIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { UniversityInvite, CreateInvitePayload } from './types';

/* ------------------------------------------------------------------ */
/*  Error helpers                                                      */
/* ------------------------------------------------------------------ */
class ApiError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

type ApiErr = { message: string; details?: unknown };

function formatDetails(details: unknown): string[] {
  if (!details) return [];
  if (typeof details === 'string') return [details];
  if (Array.isArray(details)) return details.map(String);
  if (typeof details === 'object')
    return Object.entries(details as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`);
  return [String(details)];
}

function ApiErrorBox({ err }: { err: ApiErr }) {
  const t = useTranslations('intranet');
  const lines = formatDetails(err.details);
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
      <div className="flex items-start gap-2">
        <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="font-medium">{err.message}</p>
          {lines.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-red-700 mb-1">
                {t('university.common.errorDetails')}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-red-700/90">
                {lines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(
      locale === 'en' ? 'en-GB' : locale === 'pt' ? 'pt-PT' : 'es-ES',
      { day: '2-digit', month: 'short', year: 'numeric' },
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-800 ring-1 ring-green-200';
    case 'expired':   return 'bg-red-100 text-red-800 ring-1 ring-red-200';
    case 'exhausted': return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200';
    default:          return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
  }
}

/* ------------------------------------------------------------------ */
/*  Normalize one raw API item → UniversityInvite                      */
/* ------------------------------------------------------------------ */
function normalizeInvite(item: unknown): UniversityInvite {
  const r = item as Record<string, unknown>;
  const usedCount =
    typeof r.usedCount === 'number' ? r.usedCount :
    typeof r.used_count === 'number' ? r.used_count : 0;
  const maxUses =
    typeof r.maxUses === 'number' ? r.maxUses :
    typeof r.max_uses === 'number' ? r.max_uses : null;
  // Normalize status to lowercase — backend may send "ACTIVE", "EXPIRED", etc.
  let status = typeof r.status === 'string' ? r.status.toLowerCase() : '';

  // Fallback: derive from boolean flags (isActive / isExpired)
  if (!status) {
    const isActiveBool = r.isActive === true || r.is_active === true;
    const isExpiredBool = r.isExpired === true || r.is_expired === true;
    if (isExpiredBool) status = 'expired';
    else if (isActiveBool) status = 'active';
  }

  // Further refine: check expiration date and max uses
  const now = Date.now();
  const expDate = r.expiresAt ?? r.expires_at;
  if (status === 'active' || !status) {
    if (expDate && new Date(expDate as string).getTime() < now) status = 'expired';
    else if (maxUses !== null && usedCount >= (maxUses ?? 0)) status = 'exhausted';
    else status = 'active';
  }
  const code = typeof r.code === 'string' ? r.code : String(r.id ?? '');
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl =
    typeof r.inviteUrl === 'string' ? r.inviteUrl :
    typeof r.invite_url === 'string' ? r.invite_url :
    code ? `${siteUrl}/register?invite=${code}` : null;
  return {
    id: String(r.id ?? code),
    code,
    inviteUrl: inviteUrl ?? null,
    createdAt: String(r.createdAt ?? r.created_at ?? new Date().toISOString()),
    expiresAt: expDate ? String(expDate) : null,
    maxUses,
    usedCount,
    status,
  };
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      title={label}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {copied
        ? <><CheckIcon className="w-3.5 h-3.5" />{label}</>
        : <><ClipboardDocumentIcon className="w-3.5 h-3.5" />{label}</>
      }
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Create invite modal                                                */
/* ------------------------------------------------------------------ */
function CreateInviteModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: CreateInvitePayload) => Promise<void>;
}) {
  const t = useTranslations('intranet');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses]     = useState('');
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState<ApiErr | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onCreate({
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError({ message: err.message, details: err.details });
      } else {
        setError({
          message: err instanceof Error ? err.message : t('university.invites.createError'),
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('university.invites.modalTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarDaysIcon className="w-4 h-4 inline-block mr-1 text-gray-400" />
              {t('university.invites.expiresAtLabel')}
              <span className="ml-1 text-xs text-gray-400">
                ({t('university.invites.optional')})
              </span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('university.invites.expiresAtHelp')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <UserGroupIcon className="w-4 h-4 inline-block mr-1 text-gray-400" />
              {t('university.invites.maxUsesLabel')}
              <span className="ml-1 text-xs text-gray-400">
                ({t('university.invites.optional')})
              </span>
            </label>
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder={t('university.invites.maxUsesPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('university.invites.maxUsesHelp')}
            </p>
          </div>

          {error && <ApiErrorBox err={error} />}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('university.invites.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {busy ? t('university.invites.creating') : t('university.invites.createBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Invite card                                                        */
/* ------------------------------------------------------------------ */
function InviteCard({ invite, onDelete }: { invite: UniversityInvite; onDelete: (inv: UniversityInvite) => void }) {
  const t = useTranslations('intranet');
  const locale =
    typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'es';

  const isActive = invite.status === 'active';
  const isExpired = invite.status === 'expired';
  const isExhausted = invite.status === 'exhausted';

  const statusLabel = isActive
    ? t('university.invites.statusActive')
    : isExpired
      ? t('university.invites.statusExpired')
      : isExhausted
        ? t('university.invites.statusExhausted')
        : (invite.status ?? '');

  const inviteUrl = invite.inviteUrl ?? '';

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
        isActive
          ? 'border-green-200 hover:border-green-400'
          : 'border-gray-200 opacity-80'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <KeyIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-mono font-semibold text-gray-900 text-sm truncate">
            {invite.code}
          </span>
        </div>
        <span
          className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(invite.status ?? 'active')}`}
        >
          {statusLabel}
        </span>
      </div>

      {inviteUrl && (
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg px-3 py-2">
          <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-600 truncate flex-1">{inviteUrl}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CalendarDaysIcon className="w-3.5 h-3.5" />
          <span>
            {t('university.invites.createdAt')}:{' '}
            {formatDate(invite.createdAt, locale)}
          </span>
        </div>
        {invite.expiresAt ? (
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>
              {t('university.invites.expiresAt')}:{' '}
              {formatDate(invite.expiresAt, locale)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{t('university.invites.noExpiry')}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <UserGroupIcon className="w-3.5 h-3.5" />
          <span>
            {t('university.invites.usedCount')}: {invite.usedCount}
            {invite.maxUses ? ` / ${invite.maxUses}` : ''}
          </span>
        </div>
        {invite.maxUses ? (
          <div className="flex items-center gap-1">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>
              {t('university.invites.maxUses')}: {invite.maxUses}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <CopyButton value={invite.code} label={t('university.invites.copyCode')} />
        {inviteUrl && (
          <CopyButton value={inviteUrl} label={t('university.invites.copyUrl')} />
        )}
        <button
          onClick={() => onDelete(invite)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto"
          title={t('university.invites.deleteBtn')}
        >
          <TrashIcon className="w-3.5 h-3.5" />
          {t('university.invites.deleteBtn')}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete confirmation modal                                          */
/* ------------------------------------------------------------------ */
function DeleteConfirmModal({
  invite,
  onClose,
  onConfirm,
}: {
  invite: UniversityInvite;
  onClose: () => void;
  onConfirm: (invite: UniversityInvite) => Promise<void>;
}) {
  const t = useTranslations('intranet');
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm(invite);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrashIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('university.invites.deleteTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-600">
            {t('university.invites.deleteConfirm')}
          </p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <KeyIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-mono text-sm font-semibold text-gray-900 truncate">
              {invite.code}
            </span>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('university.invites.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {busy ? t('university.invites.deleting') : t('university.invites.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary bar                                                        */
/* ------------------------------------------------------------------ */
function SummaryBar({ invites }: { invites: UniversityInvite[] }) {
  const t = useTranslations('intranet');
  const total = invites.length;
  const active = invites.filter((i) => i.status === 'active').length;
  const expired = invites.filter(
    (i) => i.status === 'expired' || i.status === 'exhausted',
  ).length;
  const totalUses = invites.reduce((acc, i) => acc + (i.usedCount ?? 0), 0);

  const stats = [
    { label: t('university.invites.summaryTotal'), value: total, color: 'text-gray-900' },
    { label: t('university.invites.summaryActive'), value: active, color: 'text-green-700' },
    { label: t('university.invites.summaryInactive'), value: expired, color: 'text-red-600' },
    { label: t('university.invites.summaryUses'), value: totalUses, color: 'text-blue-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm"
        >
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations('intranet');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
        <EnvelopeIcon className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {t('university.invites.emptyTitle')}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">
        {t('university.invites.emptySubtitle')}
      </p>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        {t('university.invites.newInvite')}
      </button>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */
export default function UniversityInvitesPage() {
  const t = useTranslations('intranet');

  const [invites, setInvites]     = useState<UniversityInvite[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [banner, setBanner]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [filter, setFilter]       = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteTarget, setDeleteTarget] = useState<UniversityInvite | null>(null);

  /* ---------------------------------------------------------------- */
  /*  GET /api/universities/me/invites                                 */
  /* ---------------------------------------------------------------- */
  const loadInvites = useCallback(async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${API}/api/universities/me/invites`;

    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message ?? `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    // Backend may return { invites: [...] }, { data: [...] }, or a plain array
    const raw: unknown = data?.invites ?? data?.data ?? data;
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeInvite);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fetch on mount                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    loadInvites()
      .then((list) => {
        if (!cancelled) {
          setInvites(list);
          setLoadError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [loadInvites]);

  /* ---------------------------------------------------------------- */
  /*  POST + refetch                                                   */
  /* ---------------------------------------------------------------- */
  const handleCreate = useCallback(
    async (payload: CreateInvitePayload) => {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${API}/api/universities/me/invites`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const resBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new ApiError(
          resBody?.message ?? t('university.invites.createError'),
          resBody?.details ?? resBody?.errors,
        );
      }

      // Refetch from backend — single source of truth
      try {
        const freshList = await loadInvites();
        setInvites(freshList);
        setBanner({ type: 'success', msg: t('university.invites.createSuccess') });
      } catch {
        setBanner({ type: 'success', msg: t('university.invites.createSuccess') });
        setTimeout(() => {
          loadInvites()
            .then((l) => setInvites(l))
            .catch(() => {});
        }, 1500);
      }

      setTimeout(() => setBanner(null), 5000);
    },
    [t, loadInvites],
  );

  /* ---------------------------------------------------------------- */
  /*  DELETE + refetch                                                  */
  /* ---------------------------------------------------------------- */
  const handleDelete = useCallback(
    async (invite: UniversityInvite) => {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${API}/api/universities/me/invites/${invite.id}`;

      try {
        const res = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }

        // Refetch from backend — single source of truth
        const freshList = await loadInvites();
        setInvites(freshList);
        setBanner({ type: 'success', msg: t('university.invites.deleteSuccess') });
      } catch (err: unknown) {
        setBanner({
          type: 'error',
          msg: err instanceof Error ? err.message : t('university.invites.deleteError'),
        });
      } finally {
        setDeleteTarget(null);
        setTimeout(() => setBanner(null), 5000);
      }
    },
    [loadInvites, t],
  );

  /* ---------------------------------------------------------------- */
  /*  Retry handler                                                    */
  /* ---------------------------------------------------------------- */
  const handleRetry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    loadInvites()
      .then((list) => {
        setInvites(list);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, [loadInvites]);

  /* ---------------------------------------------------------------- */
  /*  Derived                                                          */
  /* ---------------------------------------------------------------- */
  const filtered =
    filter === 'all'
      ? invites
      : filter === 'active'
        ? invites.filter((i) => i.status === 'active')
        : invites.filter((i) => i.status !== 'active');

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      {showModal && (
        <CreateInviteModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          invite={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('university.invites.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {t('university.invites.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm transition-colors shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            {t('university.invites.newInvite')}
          </button>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
              banner.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {banner.type === 'success' ? (
              <CheckIcon className="w-5 h-5 shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
            )}
            {banner.msg}
            <button onClick={() => setBanner(null)} className="ml-auto">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowPathIcon className="w-8 h-8 text-green-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">
              {t('university.invites.loadingInvites')}
            </p>
          </div>
        )}

        {/* Load error */}
        {!loading && loadError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ExclamationCircleIcon className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('university.invites.loadError')}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-5">{loadError}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              {t('university.invites.retry')}
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadError && (
          <>
            {invites.length > 0 && <SummaryBar invites={invites} />}

            {invites.length > 0 && (
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {(['all', 'active', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t(
                      `university.invites.filter${f.charAt(0).toUpperCase() + f.slice(1)}` as Parameters<typeof t>[0],
                    )}
                  </button>
                ))}
              </div>
            )}

            {invites.length === 0 ? (
              <EmptyState onOpen={() => setShowModal(true)} />
            ) : filtered.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
                {t('university.invites.noResults')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} onDelete={setDeleteTarget} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
