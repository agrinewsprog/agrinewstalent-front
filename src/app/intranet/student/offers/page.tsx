import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';

// Ejemplo de llamada a API desde server component
async function getOffers(): Promise<Offer[]> {
  try {
    const response = await api.get<{ data: Offer[] }>('/offers');
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

export default async function StudentOffers() {
  const offers = await getOffers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ofertas de empleo</h1>
          <p className="text-gray-600 mt-2">
            Explora las últimas oportunidades disponibles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {offers.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600 py-8">
                No hay ofertas disponibles en este momento
              </p>
            </CardBody>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/intranet/student/offers/${offer.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {offer.title}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {offer.company?.companyName || 'Empresa confidencial'}
                    </p>
                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {offer.location}
                      </span>
                      {offer.salary && <span>💰 {offer.salary}</span>}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge>{offer.type}</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
