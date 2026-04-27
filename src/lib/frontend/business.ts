import { Notification } from '@/types';
import {
  normalizeApplicationStatus,
  resolveApplicationId,
  resolveCompanyId,
  resolveJobOfferId,
  resolveProgramId,
  resolveProgramOfferId,
  toAbsoluteAssetUrl,
  unwrapCollection,
  unwrapEntity,
} from '@/lib/frontend/contracts';
import {
  buildCompanyApplicationHref,
  buildCompanyOfferHref,
  buildCompanyProgramsHref,
  buildStudentApplicationsHref,
  buildStudentOfferHref,
  buildStudentProgramCompanyHref,
  buildStudentProgramHref,
  buildStudentProgramOfferHref,
  buildUniversityProgramCompanyHref,
  buildUniversityProgramHref,
  buildUniversityProgramOfferHref,
  normalizeLocaleHref,
} from '@/lib/utils';

type UnknownRecord = Record<string, unknown>;

export type NotificationRole = 'student' | 'company' | 'university' | 'admin';

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function localeTag(locale: string): string {
  if (locale === 'pt') return 'pt-PT';
  if (locale === 'en') return 'en-GB';
  return 'es-ES';
}

function getNotificationScope(raw: UnknownRecord | null): UnknownRecord | null {
  if (!raw) return null;
  return (
    asRecord(raw.metadata) ??
    asRecord(raw.meta) ??
    asRecord(raw.payload) ??
    asRecord(raw.data) ??
    null
  );
}

export function resolveMediaUrl(raw: unknown, apiBase: string): string | null {
  return toAbsoluteAssetUrl(raw, apiBase);
}

export function formatRelativeDate(date: string | Date, locale: string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(target.getTime())) return '';

  const diffMs = target.getTime() - Date.now();
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' });

  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), 'second');

  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');

  const hours = Math.round(diffMs / 3600000);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.round(diffMs / 86400000);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');

  const weeks = Math.round(diffMs / 604800000);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, 'week');

  const months = Math.round(diffMs / 2592000000);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');

  const years = Math.round(diffMs / 31536000000);
  return rtf.format(years, 'year');
}

export function applicationStatusTranslationKey(
  namespace: 'company' | 'student',
  rawStatus: string | null | undefined,
): string {
  const status = normalizeApplicationStatus(rawStatus);
  return namespace === 'company'
    ? `company.statusChanger.${status}`
    : `student.applications.statusLabels.${status}`;
}

export function getNotificationIcon(type: Notification['type'] | string | undefined): string {
  switch (type) {
    case 'application':
      return '📄';
    case 'offer':
      return '💼';
    case 'program':
      return '🎓';
    case 'course':
      return '📚';
    case 'system':
      return '🔔';
    default:
      return '📌';
  }
}

export interface NormalizedNotification extends Notification {
  title: string;
  message: string;
  href: string | null;
}

export function resolveNotificationHref(
  raw: unknown,
  locale: string,
  role: NotificationRole = 'student',
  existingLink?: string | null,
): string | null {
  if (existingLink) {
    if (existingLink.startsWith('http://') || existingLink.startsWith('https://')) return existingLink;
    return normalizeLocaleHref(locale, existingLink);
  }

  const record = asRecord(raw);
  const scope = getNotificationScope(record);
  const programId = resolveProgramId(record, scope);
  const programOfferId = resolveProgramOfferId(record, scope, scope?.programOffer);
  const jobOfferId = resolveJobOfferId(record, scope, scope?.offer, scope?.jobOffer);
  const applicationId = resolveApplicationId(record, scope);
  const companyId = resolveCompanyId(record, scope, scope?.company);

  if (role === 'company') {
    if (jobOfferId) {
      return buildCompanyOfferHref(locale, jobOfferId, programId, programOfferId);
    }
    if (applicationId) {
      return buildCompanyApplicationHref(locale, applicationId);
    }
    if (programId) {
      return buildCompanyProgramsHref(locale, programId);
    }
    return null;
  }

  if (role === 'university') {
    if (programId && programOfferId) {
      return buildUniversityProgramOfferHref(locale, programId, programOfferId);
    }
    if (programId && companyId) {
      return buildUniversityProgramCompanyHref(locale, programId, companyId);
    }
    if (programId) {
      return buildUniversityProgramHref(locale, programId);
    }
    return null;
  }

  if (programId && programOfferId) {
    return buildStudentProgramOfferHref(locale, programId, programOfferId);
  }
  if (programId && companyId) {
    return buildStudentProgramCompanyHref(locale, programId, companyId);
  }
  if (jobOfferId) {
    return buildStudentOfferHref(locale, jobOfferId);
  }
  if (programId) {
    return buildStudentProgramHref(locale, programId);
  }
  if (applicationId) {
    return buildStudentApplicationsHref(locale);
  }

  return null;
}

function getNotificationText(
  raw: UnknownRecord | null,
  locale: string,
): { title: string; message: string } {
  const scope = getNotificationScope(raw);
  const status = normalizeApplicationStatus(
    asString(raw?.status) ??
      asString(scope?.status) ??
      asString(scope?.applicationStatus),
  );
  const offerTitle =
    asString(raw?.offerTitle) ??
    asString(scope?.offerTitle) ??
    asString(asRecord(scope?.offer)?.title) ??
    asString(asRecord(scope?.jobOffer)?.title);
  const programTitle =
    asString(raw?.programTitle) ??
    asString(scope?.programTitle) ??
    asString(asRecord(scope?.program)?.title);

  const title =
    asString(raw?.title) ??
    (raw?.type === 'application'
      ? locale === 'en'
        ? 'Application status updated'
        : locale === 'pt'
          ? 'Estado da candidatura atualizado'
          : 'Estado de la candidatura actualizado'
      : null) ??
    (locale === 'en' ? 'Notification' : locale === 'pt' ? 'Notificação' : 'Notificación');

  const message =
    asString(raw?.message) ??
    (raw?.type === 'application'
      ? [
          locale === 'en'
            ? 'Your application is now'
            : locale === 'pt'
              ? 'A sua candidatura está agora em'
              : 'Tu candidatura ahora está en',
          status,
          offerTitle ? `- ${offerTitle}` : null,
          programTitle ? `- ${programTitle}` : null,
        ]
          .filter(Boolean)
          .join(' ')
      : null) ??
    (locale === 'en'
      ? 'Open the notification to see more details.'
      : locale === 'pt'
        ? 'Abre a notificação para ver mais detalhes.'
        : 'Abre la notificación para ver más detalles.');

  return { title, message };
}

export function normalizeNotification(
  raw: unknown,
  locale: string,
  role: NotificationRole = 'student',
): NormalizedNotification | null {
  const record = asRecord(raw);
  if (!record) return null;

  const base = unwrapEntity<UnknownRecord>(record, ['notification', 'data']) ?? record;
  const id = asString(base.id);
  if (!id) return null;

  const { title, message } = getNotificationText(base, locale);

  return {
    id,
    userId: asString(base.userId) ?? '',
    title,
    message,
    type: (asString(base.type) as Notification['type']) ?? 'system',
    read: Boolean(base.read),
    link: asString(base.link) ?? undefined,
    createdAt: asString(base.createdAt) ?? new Date().toISOString(),
    href: resolveNotificationHref(base, locale, role, asString(base.link)),
  };
}

export function unwrapNotifications(
  payload: unknown,
  locale: string,
  role: NotificationRole = 'student',
): NormalizedNotification[] {
  return unwrapCollection<unknown>(payload, ['data', 'notifications'])
    .map((item) => normalizeNotification(item, locale, role))
    .filter((item): item is NormalizedNotification => Boolean(item));
}
