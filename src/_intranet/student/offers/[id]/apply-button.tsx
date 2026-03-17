'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { Button } from '@/src/components/ui/button';
import { Modal } from '@/src/components/ui/modal';
import { Textarea } from '@/src/components/ui/textarea';

interface ApplyButtonProps {
  offerId: string;
  alreadyApplied?: boolean;
}

export function ApplyButton({ offerId, alreadyApplied: initialApplied = false }: ApplyButtonProps) {
  const t = useTranslations('intranet');
  const router = useRouter();
  const [applied, setApplied] = useState(initialApplied);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/applications', {
        offerId,
        coverLetter: coverLetter.trim() || undefined,
      });

      setApplied(true);
      setIsModalOpen(false);
      router.push('/intranet/student/applications');
    } catch (err) {
      setError(t('student.offers.modal.error'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 font-medium rounded-xl text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('student.offers.alreadyAppliedMsg')}
        </span>
        <Link
          href="/intranet/student/applications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('student.offers.viewMyApplications')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setIsModalOpen(true)}>
        {t('student.offers.applyBtn')}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('student.offers.modal.title')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('student.offers.modal.optional')}
          </p>

          <Textarea
            label={t('student.offers.modal.coverLetterLabel')}
            placeholder={t('student.offers.modal.coverLetterPlaceholder')}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleApply} isLoading={isSubmitting}>
              {t('student.offers.modal.submitBtn')}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('student.offers.modal.cancelBtn')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
