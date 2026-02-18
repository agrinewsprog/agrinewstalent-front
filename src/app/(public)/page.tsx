import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'AgriNews Talent - Plataforma de Empleo en el Sector Agrícola',
  description:
    'Encuentra las mejores oportunidades de empleo en el sector agrícola. Conecta con empresas líderes y desarrolla tu carrera profesional.',
  keywords: [
    'empleo agrícola',
    'trabajo agro',
    'oportunidades sector agrícola',
    'bolsa de trabajo agricultura',
  ],
  openGraph: {
    title: 'AgriNews Talent - Plataforma de Empleo Agrícola',
    description: 'Conectamos talento con empresas del sector agrícola',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Impulsa tu carrera en el sector agrícola
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Conectamos talento con las mejores empresas del agro
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Crear cuenta gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué AgriNews Talent?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Para Estudiantes</h3>
              <p className="text-gray-600">
                Encuentra prácticas y empleos en empresas líderes del sector
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Para Empresas</h3>
              <p className="text-gray-600">
                Accede a talento cualificado del sector agrícola
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Para Universidades</h3>
              <p className="text-gray-600">
                Gestiona programas de prácticas y bolsa de empleo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a nuestra comunidad y encuentra tu próxima oportunidad
          </p>
          <Link href="/register">
            <Button size="lg">Comenzar ahora</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
