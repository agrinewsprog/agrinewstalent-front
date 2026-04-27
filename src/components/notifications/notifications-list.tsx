'use client';

import { useTranslations, useLocale } from 'next-intl';
import clsx from 'clsx';
import { Notification } from '@/types';
import {
  formatRelativeDate,
  getNotificationIcon,
  NormalizedNotification,
  normalizeNotification,
  NotificationRole,
} from '@/lib/frontend/business';

interface NotificationsListProps {
  notifications: (Notification | NormalizedNotification | Record<string, unknown>)[];
  role?: NotificationRole;
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: (notification: NormalizedNotification) => void;
}

export function NotificationsList({
  notifications = [],
  role = 'student',
  onMarkAsRead,
  onNotificationClick,
}: NotificationsListProps) {
  const t = useTranslations('intranet');
  const locale = useLocale();

  const items = notifications
    .map((notification) => normalizeNotification(notification, locale, role))
    .filter((item): item is NormalizedNotification => Boolean(item));

  const handleNotificationClick = (notification: NormalizedNotification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
          {getNotificationIcon('system')}
        </div>
        <p className="text-lg font-medium text-gray-700">{t('student.notifications.empty')}</p>
        <p className="mt-1 text-sm text-gray-500">{t('common.notificationsSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={clsx(
            'cursor-pointer rounded-lg border p-4 transition-colors',
            notification.read
              ? 'border-gray-200 bg-white hover:bg-gray-50'
              : 'border-blue-200 bg-blue-50 hover:bg-blue-100',
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-2xl">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={clsx(
                    'text-sm font-medium',
                    notification.read ? 'text-gray-900' : 'text-blue-900',
                  )}
                >
                  {notification.title}
                </h3>
                {!notification.read && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {notification.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">{formatRelativeDate(notification.createdAt, locale)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
