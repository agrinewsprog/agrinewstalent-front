'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  formatRelativeDate,
  getNotificationIcon,
  NormalizedNotification,
  unwrapNotifications,
} from '@/lib/frontend/business';
import { buildNotificationsHref } from '@/lib/utils';

interface NotificationsDropdownProps {
  role: 'student' | 'company' | 'university' | 'admin';
}

const IS_DEV =
  process.env.NEXT_PUBLIC_ENV === 'development' ||
  process.env.NODE_ENV === 'development';

export function NotificationsDropdown({ role }: NotificationsDropdownProps) {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    inFlightRef.current = (async () => {
      try {
        const response = await fetch('/api/notifications?limit=10', { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        const items = unwrapNotifications(data, locale, role);
        if (!mountedRef.current) return;

        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      } catch (error) {
        if (IS_DEV) console.error('[NotificationsDropdown] Error:', error);
      } finally {
        inFlightRef.current = null;
      }
    })();

    return inFlightRef.current;
  }, [locale, role]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchNotifications();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchNotifications();
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (id: string) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.read) return;

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      if (IS_DEV) console.error('[NotificationsDropdown] markAsRead error:', error);
    }
  };

  const viewAllHref = buildNotificationsHref(locale, role);
  const titleKey = `${role}.notifications.title` as Parameters<typeof t>[0];
  const fallbackTitle = t('student.notifications.title');
  const dropdownTitle = (() => {
    try {
      const value = t(titleKey);
      return typeof value === 'string' && !value.includes('.notifications.title') ? value : fallbackTitle;
    } catch {
      return fallbackTitle;
    }
  })();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            void fetchNotifications();
          }
        }}
        className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label={dropdownTitle}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {dropdownTitle}
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {t('student.notifications.unread', { count: unreadCount })}
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <span className="mb-2 block text-3xl">🔔</span>
                <p className="text-sm text-gray-500">
                  {t('student.notifications.empty')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.href) {
                        if (notification.href.startsWith('http://') || notification.href.startsWith('https://')) {
                          window.location.assign(notification.href);
                        } else {
                          router.push(notification.href);
                        }
                      }
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'cursor-pointer p-4 transition-colors hover:bg-gray-50',
                      !notification.read && 'bg-blue-50/60',
                    )}
                  >
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={clsx(
                              'text-sm font-medium leading-tight',
                              notification.read ? 'text-gray-800' : 'text-gray-900',
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          {notification.message}
                        </p>
                        <p className="mt-1.5 text-[11px] text-gray-400">
                          {formatRelativeDate(notification.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 p-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(viewAllHref);
              }}
              className="block w-full text-center text-xs font-medium text-green-600 transition-colors hover:text-green-700"
            >
              {t('student.notifications.viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
