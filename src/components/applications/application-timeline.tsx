'use client';

import { ApplicationTimeline as TimelineType } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

interface ApplicationTimelineProps {
  timeline: TimelineType[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  reviewing: 'En revisión',
  interview: 'Entrevista',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  reviewing: 'bg-blue-400',
  interview: 'bg-purple-400',
  accepted: 'bg-green-400',
  rejected: 'bg-red-400',
};

export function ApplicationTimeline({ timeline }: ApplicationTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            No hay historial de cambios
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Historial de la aplicación</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    statusColors[item.status] || 'bg-gray-400'
                  }`}
                />
                {index < timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {statusLabels[item.status] || item.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {item.note && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
