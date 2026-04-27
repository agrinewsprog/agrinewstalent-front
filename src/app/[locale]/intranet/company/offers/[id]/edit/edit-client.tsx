'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { api } from '@/lib/api/client';
import { Offer } from '@/types';
import { OfferFormUI, OfferFormValues, formToApiBody } from '../../_components/OfferFormUI';
import { buildLocaleHref } from '@/lib/utils';

interface EditOfferClientProps {
  offer: Offer;
}

// Mapea el tipo Offer de la API a los valores del formulario
function mapOfferToFormValues(offer: Offer): Partial<OfferFormValues> {
  const raw = offer as unknown as Record<string, string>;
  const workMode = raw.workMode ?? 'ON_SITE';
  const contractType = raw.contractType ?? 'FULL_TIME';
  return {
    titulo: offer.title ?? '',
    pais: offer.location ?? 'España',
    modalidad: workMode,
    tipoContrato: contractType,
    jornada: contractType === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME',
    categoria: contractType === 'INTERNSHIP' ? 'INTERNSHIP' : 'EMPLOYMENT',
    descripcion: offer.description ?? '',
    requisitos: raw.requirements ?? '',
  };
}

export function EditOfferClient({ offer }: EditOfferClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('intranet');

  const handleSubmit = async (values: OfferFormValues) => {
    const body = formToApiBody(values);
    await api.put(`/offers/${offer.id}`, body);
    router.push(buildLocaleHref(locale, '/intranet/company/offers'));
  };

  return (
    <OfferFormUI
      title={`${t('company.offerFormUI.editTitle')} > ${offer.title}`}
      initialValues={mapOfferToFormValues(offer)}
      onSubmit={handleSubmit}
    />
  );
}
