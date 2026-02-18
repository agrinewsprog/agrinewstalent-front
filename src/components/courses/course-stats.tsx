'use client';

import { CourseEnrollment } from '@/src/types';

interface CourseStatsProps {
  enrollments: CourseEnrollment[];
}

export function CourseStats({ enrollments }: CourseStatsProps) {
  const stats = {
    total: enrollments.length,
    completed: enrollments.filter((e) => e.status === 'completed').length,
    inProgress: enrollments.filter((e) => e.status === 'in-progress').length,
    notStarted: enrollments.filter((e) => e.status === 'not-started').length,
    required: enrollments.filter((e) => e.course?.required).length,
    requiredCompleted: enrollments.filter(
      (e) => e.course?.required && e.status === 'completed'
    ).length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Cursos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="text-3xl">📚</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Completados</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-500">{completionRate}% del total</p>
          </div>
          <div className="text-3xl">✅</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">En Progreso</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="text-3xl">⏳</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Obligatorios</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.requiredCompleted}/{stats.required}
            </p>
            <p className="text-xs text-gray-500">completados</p>
          </div>
          <div className="text-3xl">⚠️</div>
        </div>
      </div>
    </div>
  );
}
