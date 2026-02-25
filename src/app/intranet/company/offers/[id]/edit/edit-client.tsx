'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../../_components/OfferFormUI';

interface EditOfferClientProps {
  offer: Offer;
}

// Mapea el tipo Offer de la API a los valores del formulario
function mapOfferToFormValues(offer: Offer): Partial<OfferFormValues> {
  const workModeMap: Record<string, string> = {
    remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial',
  };
  const contractMap: Record<string, string> = {
    'full-time': 'Indefinido', 'part-time': 'Temporal',
    internship: 'Prácticas', freelance: 'Freelance',
  };
  return {
    titulo: offer.title ?? '',
    pais: offer.location ?? 'España',
    modalidad: workModeMap[(offer as Record<string, string>).workMode ?? ''] ?? 'Presencial',
    tipoContrato: contractMap[offer.type] ?? 'Temporal',
    jornada: offer.type === 'part-time' ? 'Media jornada' : 'Jornada completa',
    categoria: offer.type === 'internship' ? 'Prácticas' : 'Empleo',
    descripcion: offer.description ?? '',
    requisitos: (offer as Record<string, string>).requirements ?? '',
  };
}

export function EditOfferClient({ offer }: EditOfferClientProps) {
  const router = useRouter();

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    await api.put(`/offers/${offer.id}`, body);
    router.push('/intranet/company/offers');
  };

  return (
    <OfferFormUI
      title={`Editar > ${offer.title}`}
      initialValues={mapOfferToFormValues(offer)}
      onSubmit={handleSubmit}
    />
  );
}
