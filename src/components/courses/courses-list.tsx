'use client';

import { Course, CourseEnrollment } from '@/src/types';
import Link from 'next/link';
import clsx from 'clsx';

interface CoursesListProps {
  enrollments: CourseEnrollment[];
  role: 'student' | 'company' | 'university' | 'admin';
  showProgress?: boolean;
}

export function CoursesList({
  enrollments,
  role,
  showProgress = true,
}: CoursesListProps) {
  const getStatusBadge = (status: CourseEnrollment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Completado
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ⏳ En progreso
          </span>
        );
      case 'not-started':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ○ Sin iniciar
          </span>
        );
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    return 'bg-gray-400';
  };

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay cursos disponibles
        </h3>
        <p className="text-gray-600">
          Por el momento no tienes cursos asignados
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => {
        const course = enrollment.course;
        if (!course) return null;

        return (
          <Link
            key={enrollment.id}
            href={`/intranet/${role}/courses/${course.id}`}
            className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="p-6">
              {/* Course Image */}
              {course.imageUrl ? (
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 h-40 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
              )}

              {/* Course Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  {course.required && (
                    <span
                      className="flex-shrink-0 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium"
                      title="Obligatorio para acceder a la bolsa de empleo"
                    >
                      Obligatorio
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {course.duration}
                  </span>
                  {getStatusBadge(enrollment.status)}
                </div>

                {/* Progress Bar */}
                {showProgress && enrollment.status !== 'not-started' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium text-gray-900">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full transition-all duration-300',
                          getProgressColor(enrollment.progress)
                        )}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completion Date */}
                {enrollment.completedAt && (
                  <p className="text-xs text-gray-500">
                    Completado el{' '}
                    {new Date(enrollment.completedAt).toLocaleDateString(
                      'es-ES',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
