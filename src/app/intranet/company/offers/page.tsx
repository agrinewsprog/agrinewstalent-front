import { Card, CardBody } from '@/src/components/ui/card';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { Badge } from '@/src/components/ui/badge';

async function getMyOffers(): Promise<Offer[]> {
  try {
    const response = await api.get<{ data: Offer[] }>('/offers/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

const offerTypeLabels = {
  'full-time': 'Tiempo completo',
  'part-time': 'Medio tiempo',
  'internship': 'Prácticas',
  'freelance': 'Freelance',
};

const statusLabels = {
  draft: 'Borrador',
  published: 'Publicada',
  closed: 'Cerrada',
};

const statusVariants: Record<Offer['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'warning',
  published: 'success',
  closed: 'default',
};

export default async function CompanyOffers() {
  const offers = await getMyOffers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Ofertas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus ofertas de empleo
          </p>
        </div>
        <Link href="/intranet/company/offers/new">
          <Button>+ Nueva oferta</Button>
        </Link>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes ofertas publicadas
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza a publicar ofertas para atraer talento
              </p>
              <Link href="/intranet/company/offers/new">
                <Button>Crear primera oferta</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/intranet/company/offers/${offer.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {offer.title}
                      </Link>
                      <Badge variant={statusVariants[offer.status]}>
                        {statusLabels[offer.status]}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span>📍 {offer.location}</span>
                      <span>📝 {offerTypeLabels[offer.type]}</span>
                      {offer.salary && <span>💰 {offer.salary}</span>}
                      <span className="text-xs text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex gap-2">
                    <Link href={`/intranet/company/offers/${offer.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
