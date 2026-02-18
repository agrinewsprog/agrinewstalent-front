import { Card, CardBody } from '@/src/components/ui/card';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export default async function CompanyOffers() {
  const offers = [];

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
      ) : null}
    </div>
  );
}
