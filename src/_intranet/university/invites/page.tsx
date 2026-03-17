'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/src/lib/api/client';
import { InviteCodeGenerator } from '@/src/components/university/invite-code-generator';
import { Card, CardBody } from '@/src/components/ui/card';

interface InviteHistory {
  id: string;
  code: string;
  createdAt: string;
  usedCount: number;
}

export default function UniversityInvites() {
  const t = useTranslations('intranet');
  const [inviteHistory, setInviteHistory] = useState<InviteHistory[]>([]);

  const handleGenerate = async () => {
    const response = await api.post<{ data: { code: string } }>('/invites/generate');
    const code = response.data.code;
    const link = `${window.location.origin}/register?invite=${code}`;
    
    // Actualizar historial
    setInviteHistory(prev => [
      { id: code, code, createdAt: new Date().toISOString(), usedCount: 0 },
      ...prev,
    ]);
    
    return { code, link };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('university.invites.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('university.invites.subtitle')}
        </p>
      </div>

      <InviteCodeGenerator onGenerate={handleGenerate} />

      {inviteHistory.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">{t('university.invites.historyTitle')}</h2>
            <div className="space-y-2">
              {inviteHistory.map((invite) => (
                <div 
                  key={invite.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">{invite.code}</p>
                    <p className="text-xs text-gray-500">
                      {t('university.invites.createdAt', { date: new Date(invite.createdAt).toLocaleString() })}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('university.invites.uses', { count: invite.usedCount })}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
