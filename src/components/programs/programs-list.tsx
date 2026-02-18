'use client';

import { Program } from '@/src/types';
import { Card, CardBody } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';

interface ProgramsListProps {
  programs: Program[];
  role: 'student' | 'company' | 'university';
  onJoin?: (programId: string) => void;
  onApprove?: (programId: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  closed: 'Cerrado',
};

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'warning',
  active: 'success',
  closed: 'default',
};

export function ProgramsList({ programs, role, onJoin, onApprove }: ProgramsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {programs.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-600 py-8">
              No hay programas disponibles
            </p>
          </CardBody>
        </Card>
      ) : (
        programs.map((program) => (
          <Card key={program.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/intranet/${role}/programs/${program.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {program.name}
                    </Link>
                    <Badge variant={statusVariants[program.status]}>
                      {statusLabels[program.status]}
                    </Badge>
                  </div>
                  
                  {program.university && (
                    <p className="text-gray-600 mt-1">
                      {program.university.universityName}
                    </p>
                  )}

                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {program.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>
                      📅 Inicio: {new Date(program.startDate).toLocaleDateString('es-ES')}
                    </span>
                    <span>
                      📅 Fin: {new Date(program.endDate).toLocaleDateString('es-ES')}
                    </span>
                    {program.offersCount !== undefined && (
                      <span>💼 {program.offersCount} ofertas</span>
                    )}
                    {program.companiesCount !== undefined && (
                      <span>🏢 {program.companiesCount} empresas</span>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  {role === 'university' && (
                    <Link href={`/intranet/university/programs/${program.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </Link>
                  )}
                  
                  {role === 'company' && onJoin && program.status === 'active' && (
                    <Button size="sm" onClick={() => onJoin(program.id)}>
                      Solicitar participar
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
