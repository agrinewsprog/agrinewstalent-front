import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth/session';

export default async function IntranetPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Redirigir al dashboard según el rol
  redirect(`/intranet/${user.role}/dashboard`);
}
