'use client';

import { useState } from 'react';
import { Offer } from '@/src/types';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

interface OfferFormProps {
  offer?: Offer;
  onSubmit: (data: OfferFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface OfferFormData {
  title: string;
  description: string;
  location: string;
  type: Offer['type'];
  salary?: string;
  status: Offer['status'];
}

export function OfferForm({ offer, onSubmit, onCancel }: OfferFormProps) {
  const [formData, setFormData] = useState<OfferFormData>({
    title: offer?.title || '',
    description: offer?.description || '',
    location: offer?.location || '',
    type: offer?.type || 'full-time',
    salary: offer?.salary || '',
    status: offer?.status || 'draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OfferFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof OfferFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof OfferFormData>(
    field: K,
    value: OfferFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {offer ? 'Editar Oferta' : 'Nueva Oferta'}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título de la oferta *"
            placeholder="ej. Ingeniero Agrónomo Junior"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
          />

          <Textarea
            label="Descripción *"
            placeholder="Describe la oferta, responsabilidades, requisitos..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            rows={6}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ubicación *"
              placeholder="ej. Madrid, España"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              error={errors.location}
            />

            <Input
              label="Salario (opcional)"
              placeholder="ej. 25.000 - 30.000 €/año"
              value={formData.salary}
              onChange={(e) => updateField('salary', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de contrato *"
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value as Offer['type'])}
              options={[
                { value: 'full-time', label: 'Tiempo completo' },
                { value: 'part-time', label: 'Medio tiempo' },
                { value: 'internship', label: 'Prácticas' },
                { value: 'freelance', label: 'Freelance' },
              ]}
            />

            <Select
              label="Estado *"
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as Offer['status'])}
              options={[
                { value: 'draft', label: 'Borrador' },
                { value: 'published', label: 'Publicada' },
                { value: 'closed', label: 'Cerrada' },
              ]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              {offer ? 'Guardar cambios' : 'Publicar oferta'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
