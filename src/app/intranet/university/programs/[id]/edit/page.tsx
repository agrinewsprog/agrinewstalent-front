import { api } from '@/src/lib/api/client';
import { Program } from '@/src/types';
import { notFound } from 'next/navigation';
import { EditProgramClient } from './edit-client';

async function getProgram(id: string): Promise<Program | null> {
  try {
    const response = await api.get<{ data: Program }>(`/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

export default async function EditProgramPage({
  params,
}: {
  params: { id: string };
}) {
  const program = await getProgram(params.id);

  if (!program) {
    notFound();
  }

  return <EditProgramClient program={program} />;
}
