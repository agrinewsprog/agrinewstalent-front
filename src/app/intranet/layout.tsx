import { getSession } from '@/src/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
