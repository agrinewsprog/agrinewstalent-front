import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Hero } from '@/src/components/marketing/Hero';
import { FeatureGrid } from '@/src/components/marketing/FeatureGrid';
import { CTASection } from '@/src/components/marketing/CTASection';
import { EventsSection } from '@/src/components/marketing/EventsSection';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

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
