import { getTranslations } from 'next-intl/server';
import { api } from '@/src/lib/api/client';
import { Student } from '@/src/types';
import { StudentsList } from '@/src/components/university/students-list';
import { Card, CardBody } from '@/src/components/ui/card';

async function getStudents(): Promise<Student[]> {
  try {
    const response = await api.get<{ data: Student[] }>('/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export default async function UniversityStudents() {
  const [students, t] = await Promise.all([getStudents(), getTranslations('intranet')]);

  return (
    <div className="space-y-6">
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
