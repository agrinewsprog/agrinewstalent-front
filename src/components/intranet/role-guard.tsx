import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth/session';
import { Role } from '@/src/types';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export async function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirigir a su dashboard correspondiente
    redirect(`/intranet/${user.role}/dashboard`);
  }

  return <>{children}</>;
}
