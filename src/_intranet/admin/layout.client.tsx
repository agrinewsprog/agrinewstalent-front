'use client';

import { useTranslations } from 'next-intl';
import { Topbar } from '@/src/components/intranet/topbar';
import { User } from '@/src/types';

interface AdminLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const t = useTranslations('intranet.admin.nav');

  const adminNavigation = [
    { name: t('dashboard'), href: '/intranet/admin/dashboard', icon: null },
    { name: t('users'), href: '/intranet/admin/users', icon: null },
    { name: t('companies'), href: '/intranet/admin/companies', icon: null },
    { name: t('universities'), href: '/intranet/admin/universities', icon: null },
    { name: t('offers'), href: '/intranet/admin/offers', icon: null },
    { name: t('applications'), href: '/intranet/admin/applications', icon: null },
    { name: t('promotions'), href: '/intranet/admin/promotions', icon: null },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Topbar user={user} navigation={adminNavigation} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}