'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Student } from '@/types';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { resolveStudentId } from '@/lib/frontend/contracts';
import { buildUniversityStudentHref } from '@/lib/utils';

interface StudentsListProps {
  students: Student[];
}

export function StudentsList({ students = [] }: StudentsListProps) {
  const t = useTranslations('intranet');
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState('');

  const displayName = (student: Student) =>
    student.name || [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email;

  const filteredStudents = (students ?? []).filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      displayName(student).toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search) ||
      student.degree?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('university.students.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="text-sm text-gray-600">
        {t('university.students.showing', {
          count: filteredStudents.length,
          total: (students ?? []).length,
        })}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardBody>
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  {students.length === 0 ? t('university.students.empty') : t('common.noResults')}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {students.length === 0
                    ? t('university.students.subtitle')
                    : t('university.students.searchPlaceholder')}
                </p>
                {searchTerm && students.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    {t('common.viewAll')}
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredStudents.map((student, idx) => {
            const studentId = resolveStudentId(student);
            const key = studentId || `${student.email ?? 'student'}-${student.createdAt ?? idx}`;

            return (
              <Card key={key}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {displayName(student)}
                      </h3>
                      <p className="mt-1 text-gray-600">{student.email}</p>
                      {student.degree && (
                        <p className="mt-2 text-sm text-gray-600">
                          {student.degree}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                        {student.graduationYear && (
                          <span>
                            {t('university.students.graduation', { year: student.graduationYear })}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {t('university.students.registered', {
                            date: new Date(student.createdAt).toLocaleDateString(),
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="success">{t('university.students.active')}</Badge>
                      {studentId ? (
                        <Link
                          href={buildUniversityStudentHref(locale, studentId)}
                          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        >
                          {t('university.students.viewStudent')}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">
                          {t('university.students.viewStudent')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
