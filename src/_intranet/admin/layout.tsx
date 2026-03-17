import { RoleGuard } from '@/src/components/intranet/role-guard';
import { getSession } from '@/src/lib/auth/session';
import { AdminLayoutClient } from './layout.client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    return null;
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
    </RoleGuard>
  );
}
