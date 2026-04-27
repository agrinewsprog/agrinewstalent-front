import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Student } from '@/types';
import { StudentsList } from '@/components/university/students-list';
import { Card, CardBody } from '@/components/ui/card';
import { unwrapCollection } from '@/lib/frontend/contracts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ??
      cookieStore.get('accessToken')?.value ??
      cookieStore.get('token')?.value ??
      '';
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

function unwrapStudents(data: unknown): Student[] {
  return unwrapCollection<Student>(data, ['students', 'data']);
}

async function getStudents(headers: Record<string, string>): Promise<Student[]> {
  try {
    const res = await fetch(`${API}/api/universities/me/students`, {
      headers: { 'Content-Type': 'application/json', ...headers },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[university/students] HTTP', res.status);
      return [];
    }
    const json = await res.json();

    return unwrapStudents(json);
  } catch (error) {
    console.error('[university/students] fetch error:', error);
    return [];
  }
}

export default async function UniversityStudents() {
  const authHeaders = await getAuthHeaders();
  const [students, t] = await Promise.all([getStudents(authHeaders), getTranslations('intranet')]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('university.students.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('university.students.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              <p className="text-sm text-gray-600 mt-1">{t('university.students.totalStudents')}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {students.filter(s => s.graduationYear && parseInt(s.graduationYear) >= new Date().getFullYear()).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">{t('university.students.activeStudents')}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {new Set(students.map(s => s.degree).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600 mt-1">{t('university.students.degrees')}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <StudentsList students={students} />
    </div>
  );
}
