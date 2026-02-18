'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { useToast } from '@/src/hooks/use-toast';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: Application['status'];
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [status, setStatus] = useState<Application['status']>(currentStatus);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);

    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status,
        note: note.trim() || undefined,
      });

      success('Estado actualizado correctamente');
      setNote('');
      router.refresh();
    } catch (err) {
      showError('Error al actualizar el estado');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      showError('Escribe una nota antes de añadir');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/applications/${applicationId}/notes`, {
        note: note.trim(),
      });

      success('Nota añadida correctamente');
      setNote('');
      router.refresh();
    } catch (err) {
      showError('Error al añadir la nota');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Gestionar candidatura</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Select
            label="Cambiar estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as Application['status'])}
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'reviewing', label: 'En revisión' },
              { value: 'interview', label: 'Entrevista' },
              { value: 'accepted', label: 'Aceptada' },
              { value: 'rejected', label: 'Rechazada' },
            ]}
          />

          <Textarea
            label="Añadir nota (opcional)"
            placeholder="Ej: Candidato con buen perfil, programar entrevista..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleUpdateStatus}
              isLoading={isSubmitting}
              disabled={status === currentStatus && !note.trim()}
            >
              {status !== currentStatus ? 'Actualizar estado' : 'Añadir solo nota'}
            </Button>
            {note.trim() && status === currentStatus && (
              <Button
                variant="outline"
                onClick={handleAddNote}
                isLoading={isSubmitting}
              >
                Añadir nota
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
