'use client';

import { Notification } from '@/src/types';
import { formatDistanceToNow } from '@/src/lib/date-utils';
import clsx from 'clsx';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onNotificationClick,
}: NotificationsListProps) {
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
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
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No tienes notificaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={clsx(
            'p-4 border rounded-lg transition-colors cursor-pointer',
            notification.read
              ? 'bg-white border-gray-200 hover:bg-gray-50'
              : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {getTypeIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={clsx(
                    'text-sm font-medium',
                    notification.read ? 'text-gray-900' : 'text-blue-900'
                  )}
                >
                  {notification.title}
                </h3>
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
