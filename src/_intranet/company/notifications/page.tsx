import { Notification } from '@/src/types';
import { NotificationsList } from '@/src/components/notifications/notifications-list';
import { getTranslations } from 'next-intl/server';

async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export default async function CompanyNotificationsPage() {
  const notifications = await getNotifications();
  const t = await getTranslations('intranet');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('company.notifications.title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('company.notifications.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <NotificationsList
          notifications={notifications}
          onMarkAsRead={async (id: string) => {
            'use server';
            // This will be handled client-side
          }}
        />
      </div>
    </div>
  );
}
