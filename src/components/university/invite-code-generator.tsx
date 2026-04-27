'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeGeneratorProps {
  onGenerate: () => Promise<{ code: string; link: string }>;
}

export function InviteCodeGenerator({ onGenerate }: InviteCodeGeneratorProps) {
  const t = useTranslations('intranet');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { code, link } = await onGenerate();
      setInviteCode(code);
      setInviteLink(link);
      success(t('university.invites.generated'));
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : t('common.errors.generic');
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    success(t('university.invites.codeCopied'));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    success(t('university.invites.linkCopied'));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{t('university.invites.generateTitle')}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('university.invites.generateSubtitle')}
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Button onClick={handleGenerate} isLoading={isGenerating}>
            {t('university.invites.generateBtn')}
          </Button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {inviteCode && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('university.invites.codeLabel')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={handleCopyCode}>
                    {t('university.invites.copy')}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('university.invites.linkLabel')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {t('university.invites.copy')}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ {t('university.invites.shareInfo')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
