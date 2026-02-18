import { CourseEnrollment } from '@/src/types';
import { CoursesList } from '@/src/components/courses/courses-list';
import { CourseStats } from '@/src/components/courses/course-stats';
import Link from 'next/link';

async function getEnrollments(): Promise<CourseEnrollment[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/enrollments`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrollments');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
}

export default async function StudentCoursesPage() {
  const enrollments = await getEnrollments();
  const requiredIncomplete = enrollments.filter(
    (e) => e.course?.required && e.status !== 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-600 mt-1">
            Completa los cursos obligatorios para acceder a la bolsa de empleos
          </p>
        </div>
      </div>

      {/* Warning if required courses not completed */}
      {requiredIncomplete.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">
                Cursos obligatorios pendientes
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Debes completar {requiredIncomplete.length} curso(s) obligatorio(s) para acceder a la bolsa de empleos.
              </p>
            </div>
          </div>
        </div>
      )}

      <CourseStats enrollments={enrollments} />

      <CoursesList enrollments={enrollments} role="student" />
    </div>
  );
}
