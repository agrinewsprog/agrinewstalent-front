import { getSession } from '@/src/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { StudentProfileClient } from './profile-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getStudentFullProfile(token: string) {
  try {
    const res = await fetch(`${API}/api/student/profile`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile;
  } catch {
    return null;
  }
}

export default async function StudentProfilePage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? cookieStore.get('accessToken')?.value ?? '';
  const fullProfile = token ? await getStudentFullProfile(token) : null;

  return (
    <StudentProfileClient
      user={user}
      profile={{
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        birthDate: user.birthDate,
        location: user.location,
        country: user.country,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        skills: user.skills,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        resumeUrl: user.resumeUrl,
        careerField: user.careerField,
        avatarUrl: user.avatarUrl,
        cv: user.resumeUrl ? { fileName: 'Mi CV', fileUrl: `${API}${user.resumeUrl}` } : undefined,
        education: fullProfile?.education ?? [],
        experience: fullProfile?.experience ?? [],
        languages: fullProfile?.languages ?? [],
      }}
    />
  );
}