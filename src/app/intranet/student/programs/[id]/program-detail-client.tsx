'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Offer, Company } from '@/src/types';
import { ProgramOffersList } from '@/src/components/programs/program-offers-list';
import { Card, CardBody } from '@/src/components/ui/card';
import { api } from '@/src/lib/api/client';
import { Modal } from '@/src/components/ui/modal';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';

interface StudentProgramDetailProps {
  programId: string;
  offers: Offer[];
  companies: Company[];
}

export function StudentProgramDetail({ 
  programId, 
  offers, 
  companies 
}: StudentProgramDetailProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'offers' | 'companies'>('offers');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (offerId: string) => {
    setSelectedOfferId(offerId);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedOfferId) return;

    setIsSubmitting(true);
    try {
      await api.post('/applications', {
        offerId: selectedOfferId,
        programId,
        coverLetter: coverLetter.trim() || undefined,
      });

      success('¡Aplicación enviada correctamente!');
      setApplyModalOpen(false);
      setCoverLetter('');
      router.push('/intranet/student/applications');
    } catch (err) {
      showError('Error al enviar la aplicación');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ofertas ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'companies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Empresas ({companies.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'offers' && (
        <ProgramOffersList 
          offers={offers} 
          role="student"
          onApply={handleApply}
        />
      )}

      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 gap-4">
          {companies.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-gray-600 py-8">
                  No hay empresas participantes
                </p>
              </CardBody>
            </Card>
          ) : (
            companies.map((company) => (
              <Card key={company.id}>
                <CardBody>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.companyName}
                  </h3>
                  {company.sector && (
                    <p className="text-sm text-gray-600 mt-1">{company.sector}</p>
                  )}
                  {company.description && (
                    <p className="text-sm text-gray-700 mt-2">{company.description}</p>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de aplicación */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
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

          <div className="flex gap-3">
            <Button onClick={handleSubmitApplication} isLoading={isSubmitting}>
              Enviar aplicación
            </Button>
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
