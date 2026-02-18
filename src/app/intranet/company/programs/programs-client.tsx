'use client';

import { useRouter } from 'next/navigation';
import { Program } from '@/src/types';
import { ProgramsList } from '@/src/components/programs/programs-list';
import { api } from '@/src/lib/api/client';
import { useToast } from '@/src/hooks/use-toast';

interface CompanyProgramsClientProps {
  programs: Program[];
}

export function CompanyProgramsClient({ programs }: CompanyProgramsClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleJoin = async (programId: string) => {
    try {
      await api.post(`/programs/${programId}/join`);
      success('Solicitud enviada correctamente');
      router.refresh();
    } catch (err: any) {
      if (err.message?.includes('already')) {
        showError('Ya has solicitado participar en este programa');
      } else {
        showError('Error al enviar la solicitud');
      }
      console.error(err);
    }
  };

  return <ProgramsList programs={programs} role="company" onJoin={handleJoin} />;
}
