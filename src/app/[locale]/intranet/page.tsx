import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

interface IntranetPageProps {
  params: Promise<{ locale: string }>;
}

const ROLE_TO_BASE: Record<string, string> = {
  student:    'student',
  company:    'company',
  university: 'university',
  admin:      'admin',
};

export default async function IntranetPage({ params }: IntranetPageProps) {
  const { locale } = await params;
  const user = await getSession();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const base = ROLE_TO_BASE[user.role ?? ''] ?? 'student';
  redirect(`/${locale}/intranet/${base}/dashboard`);
}
