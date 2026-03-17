import { RoleGuard } from '@/src/components/intranet/role-guard';
import { getSession } from '@/src/lib/auth/session';
import { CompanyLayoutClient } from './layout.client';

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    return null;
  }

  return (
    <RoleGuard allowedRoles={['company']}>
      <CompanyLayoutClient user={user}>{children}</CompanyLayoutClient>
    </RoleGuard>
  );
}
