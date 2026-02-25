import type { Metadata } from 'next';
import { Hero } from '@/src/components/marketing/Hero';
import { FeatureGrid } from '@/src/components/marketing/FeatureGrid';
import { CTASection } from '@/src/components/marketing/CTASection';
import { EventsSection } from '@/src/components/marketing/EventsSection';

export const metadata: Metadata = {
  title: 'AgriNews Talent - Plataforma de Empleo en el Sector Agricola',
  description:
    'Encuentra las mejores oportunidades de empleo en el sector agricola. Conecta con empresas lideres y desarrolla tu carrera profesional.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <CTASection />
      <EventsSection />
    </>
  );
}
