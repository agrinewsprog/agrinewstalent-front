import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getOffer(id: string): Promise<Offer | null> {
  try {
    const response = await api.get<{ data: Offer }>(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
}

export default async function OfferDetail({
  params,
}: {
  params: { id: string };
}) {
  const offer = await getOffer(params.id);

  if (!offer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/intranet/student/offers"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Volver a ofertas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{offer.title}</h1>
              <p className="text-gray-600 mt-2">
                {offer.company?.companyName || 'Empresa confidencial'}
              </p>
            </div>
            <Badge>{offer.type}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-gray-600">
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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

            <div>
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {offer.description}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Button size="lg">Aplicar a esta oferta</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
