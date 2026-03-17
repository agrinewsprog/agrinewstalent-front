'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { Program } from '@/src/types';
import { ProgramForm, ProgramFormData } from '@/src/components/programs/program-form';
import { useToast } from '@/src/hooks/use-toast';

interface EditProgramClientProps {
  program: Program;
}

export function EditProgramClient({ program }: EditProgramClientProps) {
  const router = useRouter();
  const t = useTranslations('intranet');
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      await api.put(`/programs/${program.id}`, data);
      success(t('university.programs.updateSuccess'));
      router.push('/intranet/university/programs');
    } catch (err) {
      showError(t('university.programs.updateError'));
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('university.programs.editTitle')}</h1>
        <p className="text-gray-600 mt-2">
          {t('university.programs.editSubtitle')}
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
