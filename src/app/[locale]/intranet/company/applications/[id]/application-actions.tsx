'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApplicationStatusChanger } from '@/components/company/ApplicationStatusChanger';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Props {
  applicationId: string;
  currentStatus: string;
}

export function ApplicationActions({ applicationId, currentStatus }: Props) {
  const t = useTranslations('intranet');
  const router = useRouter();
  const [note, setNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleStatusChanged = () => {
    router.refresh();
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      setNoteFeedback({ type: 'error', msg: t('company.applicationDetail.noteRequired') });
      return;
    }
    setNoteLoading(true);
    setNoteFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/api/companies/me/applications/${applicationId}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNote('');
      setNoteFeedback({ type: 'success', msg: t('company.applicationDetail.noteAdded') });
      router.refresh();
    } catch {
      setNoteFeedback({ type: 'error', msg: t('company.applicationDetail.noteError') });
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-3">{t('company.applicationDetail.manageTitle')}</h2>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{t('company.applicationDetail.changeStatus')}:</span>
          <ApplicationStatusChanger
            applicationId={applicationId}
            currentStatus={currentStatus}
            onStatusChanged={handleStatusChanged}
            size="md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('company.applicationDetail.addNoteLabel')}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('company.applicationDetail.notePlaceholder')}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleAddNote}
            disabled={noteLoading}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {noteLoading && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {t('company.applicationDetail.addNoteBtn')}
          </button>
          {noteFeedback && (
            <span className={`text-sm font-medium ${noteFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {noteFeedback.type === 'success' ? '✓' : '✗'} {noteFeedback.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
