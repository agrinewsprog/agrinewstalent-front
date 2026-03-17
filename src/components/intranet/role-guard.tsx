import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getSession } from '@/src/lib/auth/session';
import { Role } from '@/src/types';

// Mismo mapa que el middleware — rol normalizado → segmento base
const ROLE_TO_BASE: Record<string, string> = {
  student:    'student',
  company:    'company',
  university: 'university',
  admin:      'admin',
};

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export async function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const [user, locale] = await Promise.all([
    getSession(),
    getLocale(),
  ]);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirigir al dashboard correcto del rol actual
    const base = ROLE_TO_BASE[user.role] ?? 'student';
    redirect(`/${locale}/intranet/${base}/dashboard`);
  }

  return <>{children}</>;
}
