import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

interface IntranetLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function IntranetLayout({ children, params }: IntranetLayoutProps) {
  const { locale } = await params;
  const user = await getSession();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
