'use client';

import { useState } from 'react';
import { Offer, Company } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { useToast } from '@/src/hooks/use-toast';

interface ProgramDetailClientProps {
  programId: string;
  initialOffers: Offer[];
  initialCompanies: Company[];
}

export function ProgramDetailClient({ 
  programId, 
  initialOffers, 
  initialCompanies 
}: ProgramDetailClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'offers' | 'companies'>('offers');

  const handleRemoveOffer = async (offerId: string) => {
    try {
      await api.delete(`/programs/${programId}/offers/${offerId}`);
      success('Oferta eliminada del programa');
      router.refresh();
    } catch (err) {
      showError('Error al eliminar la oferta');
      console.error(err);
    }
  };

  const handleRemoveCompany = async (companyId: string) => {
    try {
      await api.delete(`/programs/${programId}/companies/${companyId}`);
      success('Empresa eliminada del programa');
      router.refresh();
    } catch (err) {
      showError('Error al eliminar la empresa');
      console.error(err);
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
            Ofertas ({initialOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'companies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Empresas ({initialCompanies.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {initialOffers.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-gray-600 py-8">
                  No hay ofertas en este programa
                </p>
              </CardBody>
            </Card>
          ) : (
            initialOffers.map((offer) => (
              <Card key={offer.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {offer.company?.companyName}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        📍 {offer.location}
                      </p>
                    </div>
                    <div className="ml-6 flex items-center gap-2">
                      <Badge>
                        {offer.applicationsCount || 0} aplicaciones
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveOffer(offer.id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="space-y-4">
          {initialCompanies.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-gray-600 py-8">
                  No hay empresas en este programa
                </p>
              </CardBody>
            </Card>
          ) : (
            initialCompanies.map((company) => (
              <Card key={company.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {company.companyName}
                      </h3>
                      {company.sector && (
                        <p className="text-sm text-gray-600 mt-1">
                          {company.sector}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Participando desde {new Date(company.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveCompany(company.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
