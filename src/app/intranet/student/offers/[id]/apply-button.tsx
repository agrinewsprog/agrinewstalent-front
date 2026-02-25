'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api/client';
import { Button } from '@/src/components/ui/button';
import { Modal } from '@/src/components/ui/modal';
import { Textarea } from '@/src/components/ui/textarea';

interface ApplyButtonProps {
  offerId: string;
  alreadyApplied?: boolean;
}

export function ApplyButton({ offerId, alreadyApplied: initialApplied = false }: ApplyButtonProps) {
  const router = useRouter();
  const [applied, setApplied] = useState(initialApplied);
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

      setApplied(true);
      setIsModalOpen(false);
      router.push('/intranet/student/applications');
    } catch (err) {
      setError('Error al enviar la aplicación. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 font-medium rounded-xl text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ya has aplicado a esta oferta
        </span>
        <Link
          href="/intranet/student/applications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver mis ofertas →
        </Link>
      </div>
    );
  }

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
