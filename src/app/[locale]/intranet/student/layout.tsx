import { RoleGuard } from '@/components/intranet/role-guard';
import { getSession } from '@/lib/auth/session';
import { StudentLayoutClient } from './layout.client';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) return null;

  return (
    <RoleGuard allowedRoles={['student']}>
      <StudentLayoutClient user={user}>{children}</StudentLayoutClient>
    </RoleGuard>
  );
}
