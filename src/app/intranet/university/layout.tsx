import { RoleGuard } from '@/src/components/intranet/role-guard';
import { getSession } from '@/src/lib/auth/session';
import { UniversityLayoutClient } from './layout.client';

export default async function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    return null;
  }

  return (
    <RoleGuard allowedRoles={['university']}>
      <UniversityLayoutClient user={user}>{children}</UniversityLayoutClient>
    </RoleGuard>
  );
}
