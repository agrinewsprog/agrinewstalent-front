import { CourseEnrollment, Course } from '@/src/types';
import { CourseDetailClient } from './course-detail-client';
import { notFound } from 'next/navigation';

async function getEnrollment(courseId: string): Promise<CourseEnrollment | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/enrollment`,
      {
        cache: 'no-store',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return null;
  }
}

async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`,
      {
        cache: 'no-store',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [enrollment, course] = await Promise.all([
    getEnrollment(params.id),
    getCourse(params.id),
  ]);

  if (!enrollment || !course) {
    notFound();
  }

  return <CourseDetailClient enrollment={enrollment} course={course} />;
}
