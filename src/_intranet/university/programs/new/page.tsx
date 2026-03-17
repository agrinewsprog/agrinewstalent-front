'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { ProgramForm, ProgramFormData } from '@/src/components/programs/program-form';
import { useToast } from '@/src/hooks/use-toast';

export default function NewProgramPage() {
  const router = useRouter();
  const t = useTranslations('intranet');
  const { success, error: showError } = useToast();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      await api.post('/programs', data);
      success(t('university.programs.createSuccess'));
      router.push('/intranet/university/programs');
    } catch (err) {
      showError(t('university.programs.createError'));
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('university.programs.newTitle')}</h1>
        <p className="text-gray-600 mt-2">
          {t('university.programs.newSubtitle')}
        </p>
      </div>

      <ProgramForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
