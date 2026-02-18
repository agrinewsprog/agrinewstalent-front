'use client';

import { Student } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { useState } from 'react';

interface StudentsListProps {
  students: Student[];
}

export function StudentsList({ students }: StudentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.degree?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, email o titulación..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="text-sm text-gray-600">
        Mostrando {filteredStudents.length} de {students.length} estudiantes
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600 py-8">
                No se encontraron estudiantes
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{student.email}</p>
                    {student.degree && (
                      <p className="text-sm text-gray-600 mt-2">
                        📚 {student.degree}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      {student.graduationYear && (
                        <span>🎓 Graduación: {student.graduationYear}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        Registrado: {new Date(student.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success">Activo</Badge>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
