import { getTranslations } from 'next-intl/server';
import { CourseEnrollment } from '@/types';
import { CoursesList } from '@/components/courses/courses-list';
import { CourseStats } from '@/components/courses/course-stats';
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
  const [enrollments, t] = await Promise.all([
    getEnrollments(),
    getTranslations('intranet'),
  ]);
  const requiredIncomplete = enrollments.filter(
    (e) => e.course?.required && e.status !== 'completed'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('student.courses.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('student.courses.subtitle')}
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
                {t('student.courses.mandatoryPending')}
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                {t('student.courses.mandatoryPendingDesc', { count: requiredIncomplete.length })}
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
