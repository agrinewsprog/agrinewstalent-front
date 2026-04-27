import { getSession } from '@/lib/auth/session';
import { CompanyProfileClient } from './profile-client';

export default async function CompanyProfile() {
  const user = await getSession();

  return <CompanyProfileClient user={user} />;
}
