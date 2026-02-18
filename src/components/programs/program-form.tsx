'use client';

import { useState } from 'react';
import { Program } from '@/src/types';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: ProgramFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface ProgramFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
}

export function ProgramForm({ program, onSubmit, onCancel }: ProgramFormProps) {
  const [formData, setFormData] = useState<ProgramFormData>({
    name: program?.name || '',
    description: program?.description || '',
    startDate: program?.startDate ? program.startDate.split('T')[0] : '',
    endDate: program?.endDate ? program.endDate.split('T')[0] : '',
    status: program?.status || 'draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProgramFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
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

  const updateField = <K extends keyof ProgramFormData>(
    field: K,
    value: ProgramFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {program ? 'Editar Programa' : 'Nuevo Programa'}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del programa *"
            placeholder="ej. Programa de Prácticas Agrícolas 2026"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />

          <Textarea
            label="Descripción *"
            placeholder="Describe el programa, objetivos, beneficios..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            rows={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Fecha de inicio *"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              error={errors.startDate}
            />

            <Input
              type="date"
              label="Fecha de fin *"
              value={formData.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              error={errors.endDate}
            />
          </div>

          <Select
            label="Estado *"
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value as Program['status'])}
            options={[
              { value: 'draft', label: 'Borrador' },
              { value: 'active', label: 'Activo' },
              { value: 'closed', label: 'Cerrado' },
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              {program ? 'Guardar cambios' : 'Crear programa'}
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
