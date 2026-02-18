import type { Metadata } from 'next';
import { Hero } from '@/src/components/marketing/Hero';
import { FeatureGrid } from '@/src/components/marketing/FeatureGrid';
import { CTASection } from '@/src/components/marketing/CTASection';
import { EventsSection } from '@/src/components/marketing/EventsSection';

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
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: 'Red de estudiantes y graduados',
      description:
        'Accede a una amplia red de estudiantes y recién graduados del sector agrícola, listos para incorporarse a tu empresa.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: 'Convenio con universidades',
      description:
        'Colaboramos directamente con las principales universidades del sector para garantizar talento cualificado y actualizado.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Presencia mundial',
      description:
        'Conectamos talento y empresas a nivel global, con presencia en múltiples países y continentes del sector agrícola.',
    },
  ];

  const ctaButtons = [
    {
      text: 'Publicar vacantes',
      href: '/empresas/publicar',
      variant: 'primary' as const,
    },
    {
      text: 'Ver mis vacantes',
      href: '/login',
      variant: 'secondary' as const,
    },
    {
      text: 'Ver candidatos',
      href: '/empresas/candidatos',
      variant: 'outline' as const,
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Webinar: Tendencias en Reclutamiento Agrícola 2026',
      date: '25 de febrero, 2026 - 16:00h',
      location: 'Online',
      type: 'webinar' as const,
    },
    {
      id: '2',
      title: 'Feria de Empleo del Sector Agrícola',
      date: '15 de marzo, 2026 - 10:00h',
      location: 'Madrid, España',
      type: 'presencial' as const,
    },
    {
      id: '3',
      title: 'Workshop: Estrategias de Selección de Talento',
      date: '20 de marzo, 2026 - 18:00h',
      location: 'Plataforma virtual',
      type: 'virtual' as const,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero
        title="Te ayudamos a encontrar candidatos formados y preparados para el sector agrícola"
        subtitle="Conectamos empresas con los mejores profesionales del sector a través de nuestra red de universidades y programas de formación especializados"
        primaryButtonText="Más información"
        primaryButtonHref="/empresas"
        secondaryButtonText="Publica vacantes"
        secondaryButtonHref="/empresas/publicar"
      />

      {/* Features Section */}
      <FeatureGrid
        title="¿Por qué elegir AgriNews Talent?"
        features={features}
      />

      {/* CTA Section */}
      <CTASection
        title="Da el primer paso en tu proceso de selección"
        subtitle="Empieza a publicar vacantes y accede a miles de candidatos cualificados del sector agrícola"
        buttons={ctaButtons}
        backgroundColor="gray"
      />

      {/* Events Section */}
      <EventsSection events={upcomingEvents} />
    </>
  );
}
