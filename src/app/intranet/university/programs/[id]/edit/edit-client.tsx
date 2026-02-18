'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Program } from '@/src/types';
import { ProgramForm, ProgramFormData } from '@/src/components/programs/program-form';
import { useToast } from '@/src/hooks/use-toast';

interface EditProgramClientProps {
  program: Program;
}

export function EditProgramClient({ program }: EditProgramClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      await api.put(`/programs/${program.id}`, data);
      success('Programa actualizado correctamente');
      router.push('/intranet/university/programs');
    } catch (err) {
      showError('Error al actualizar el programa');
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Programa</h1>
        <p className="text-gray-600 mt-2">
          Modifica los detalles del programa
        </p>
      </div>

      <ProgramForm
        program={program}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
