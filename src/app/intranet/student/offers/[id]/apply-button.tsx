'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Button } from '@/src/components/ui/button';
import { Modal } from '@/src/components/ui/modal';
import { Textarea } from '@/src/components/ui/textarea';

interface ApplyButtonProps {
  offerId: string;
}

export function ApplyButton({ offerId }: ApplyButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/applications', {
        offerId,
        coverLetter: coverLetter.trim() || undefined,
      });

      setIsModalOpen(false);
      router.push('/intranet/student/applications');
    } catch (err) {
      setError('Error al enviar la aplicación. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="lg" onClick={() => setIsModalOpen(true)}>
        Aplicar a esta oferta
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Aplicar a la oferta"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Deseas incluir una carta de presentación? (Opcional)
          </p>

          <Textarea
            label="Carta de presentación"
            placeholder="Cuéntanos por qué eres el candidato ideal..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleApply} isLoading={isSubmitting}>
              Enviar aplicación
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
