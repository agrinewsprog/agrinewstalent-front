'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { useToast } from '@/src/hooks/use-toast';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: Application['status'];
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const t = useTranslations('intranet');
  const { success, error: showError } = useToast();
  const [status, setStatus] = useState<Application['status']>(currentStatus);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);

    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status,
        note: note.trim() || undefined,
      });

      success(t('company.applicationDetail.statusUpdated'));
      setNote('');
      router.refresh();
    } catch (err) {
      showError(t('company.applicationDetail.statusError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      showError(t('company.applicationDetail.noteRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/applications/${applicationId}/notes`, {
        note: note.trim(),
      });

      success(t('company.applicationDetail.noteAdded'));
      setNote('');
      router.refresh();
    } catch (err) {
      showError(t('company.applicationDetail.noteError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{t('company.applicationDetail.manageTitle')}</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Select
            label={t('company.applicationDetail.changeStatus')}
            value={status}
            onChange={(e) => setStatus(e.target.value as Application['status'])}
            options={[
              { value: 'pending', label: t('company.applicationDetail.statusLabels.pending') },
              { value: 'reviewing', label: t('company.applicationDetail.statusLabels.reviewing') },
              { value: 'interview', label: t('company.applicationDetail.statusLabels.interview') },
              { value: 'accepted', label: t('company.applicationDetail.statusLabels.accepted') },
              { value: 'rejected', label: t('company.applicationDetail.statusLabels.rejected') },
            ]}
          />

          <Textarea
            label={t('company.applicationDetail.addNoteLabel')}
            placeholder={t('company.applicationDetail.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleUpdateStatus}
              isLoading={isSubmitting}
              disabled={status === currentStatus && !note.trim()}
            >
              {status !== currentStatus ? t('company.applicationDetail.updateStatusBtn') : t('company.applicationDetail.addNoteOnly')}
            </Button>
            {note.trim() && status === currentStatus && (
              <Button
                variant="outline"
                onClick={handleAddNote}
                isLoading={isSubmitting}
              >
                {t('company.applicationDetail.addNoteBtn')}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
