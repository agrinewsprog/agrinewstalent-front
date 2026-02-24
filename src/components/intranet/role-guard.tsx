import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth/session';
import { Role } from '@/src/types';

// Mismo mapa que el middleware — rol normalizado → basePath
const ROLE_TO_BASE: Record<string, string> = {
  student:    '/intranet/student',
  company:    '/intranet/company',
  university: '/intranet/university',
  admin:      '/intranet/admin',
};

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
    // Redirigir al dashboard correcto del rol actual
    const basePath = ROLE_TO_BASE[user.role] ?? '/intranet';
    redirect(`${basePath}/dashboard`);
  }

  return <>{children}</>;
}
