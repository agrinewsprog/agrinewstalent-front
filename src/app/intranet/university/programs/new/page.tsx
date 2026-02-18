'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { ProgramForm, ProgramFormData } from '@/src/components/programs/program-form';
import { useToast } from '@/src/hooks/use-toast';

export default function NewProgramPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      await api.post('/programs', data);
      success('Programa creado correctamente');
      router.push('/intranet/university/programs');
    } catch (err) {
      showError('Error al crear el programa');
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Programa</h1>
        <p className="text-gray-600 mt-2">
          Crea un nuevo programa de empleo para tus estudiantes
        </p>
      </div>

      <ProgramForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
