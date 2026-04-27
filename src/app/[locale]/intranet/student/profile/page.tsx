import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { StudentProfileClient } from './profile-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getStudentFullProfile(token: string) {
  try {
    const res = await fetch(`${API}/api/students/profile`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile ?? null;
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
        birthDate: fullProfile?.birthDate ?? fullProfile?.dateOfBirth ?? user.birthDate,
        location: fullProfile?.location ?? fullProfile?.city ?? user.location,
        country: user.country,
        phoneNumber: user.phoneNumber,
        bio: fullProfile?.bio ?? user.bio,
        skills: fullProfile?.skills ?? user.skills,
        linkedinUrl: fullProfile?.linkedinUrl ?? user.linkedinUrl,
        githubUrl: fullProfile?.githubUrl ?? user.githubUrl,
        resumeUrl: fullProfile?.resumeUrl ?? user.resumeUrl,
        careerField: fullProfile?.careerField ?? user.careerField,
        avatarUrl: fullProfile?.avatarUrl ?? fullProfile?.avatar ?? user.avatarUrl,
        cv: (fullProfile?.resumeUrl ?? user.resumeUrl)
          ? {
              fileName: fullProfile?.resumeFileName ?? 'Mi CV',
              fileUrl: `${API}${fullProfile?.resumeUrl ?? user.resumeUrl}`,
            }
          : undefined,
        education: fullProfile?.education ?? [],
        experience: fullProfile?.experience ?? [],
        languages: fullProfile?.languages ?? [],
        university: fullProfile?.university ?? null,
      }}
    />
  );
}
