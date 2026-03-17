import type { Metadata } from 'next';
import EmpleoYPracticasPage, {
  generateEmpleoMetadata,
} from '@/src/features/public/empleo-y-practicas/EmpleoYPracticasPage';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generateEmpleoMetadata(locale);
}

export default EmpleoYPracticasPage;

