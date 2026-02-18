'use client';

import { useState } from 'react';
import { Course, CourseEnrollment } from '@/src/types';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface CourseDetailClientProps {
  enrollment: CourseEnrollment;
  course: Course;
}

export function CourseDetailClient({ enrollment, course }: CourseDetailClientProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(enrollment.progress);
  const [status, setStatus] = useState(enrollment.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        setStatus('in-progress');
        setProgress(0);
        router.refresh();
      }
    } catch (error) {
      console.error('Error starting course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (response.ok) {
        setProgress(newProgress);
        if (newProgress === 100) {
          setStatus('completed');
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCourse = async () => {
    await handleUpdateProgress(100);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Completado
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            ⏳ En progreso ({progress}%)
          </span>
        );
      case 'not-started':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            ○ Sin iniciar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              {course.required && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  Obligatorio
                </span>
              )}
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Duración: {course.duration}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {status !== 'not-started' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Progreso del curso</h3>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-300',
                progress === 100 ? 'bg-green-600' : progress >= 50 ? 'bg-blue-600' : 'bg-gray-400'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Video Player */}
      {course.videoUrl && status !== 'not-started' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Contenido del curso</h3>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              src={course.videoUrl}
              controls
              className="w-full h-full"
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                const newProgress = Math.floor((video.currentTime / video.duration) * 100);
                if (newProgress > progress && newProgress % 10 === 0) {
                  handleUpdateProgress(newProgress);
                }
              }}
              onEnded={() => {
                if (progress < 100) {
                  handleCompleteCourse();
                }
              }}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      )}

      {/* Course Content Placeholder */}
      {!course.videoUrl && status !== 'not-started' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Contenido del curso</h3>
          <div className="prose max-w-none">
            <p className="text-gray-600">
              El contenido del curso se mostrará aquí. Por ahora, este es un placeholder.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {status === 'not-started' && (
          <button
            onClick={handleStartCourse}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Iniciando...' : 'Comenzar curso'}
          </button>
        )}

        {status === 'in-progress' && progress < 100 && (
          <button
            onClick={handleCompleteCourse}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Procesando...' : 'Marcar como completado'}
          </button>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Curso completado</span>
          </div>
        )}
      </div>
    </div>
  );
}
