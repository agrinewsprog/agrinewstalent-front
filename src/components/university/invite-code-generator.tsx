'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useToast } from '@/src/hooks/use-toast';

interface InviteCodeGeneratorProps {
  onGenerate: () => Promise<{ code: string; link: string }>;
}

export function InviteCodeGenerator({ onGenerate }: InviteCodeGeneratorProps) {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { success } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { code, link } = await onGenerate();
      setInviteCode(code);
      setInviteLink(link);
      success('Código de invitación generado');
    } catch (error) {
      console.error('Error generating invite:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    success('Código copiado al portapapeles');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    success('Enlace copiado al portapapeles');
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Generar código de invitación</h2>
        <p className="text-sm text-gray-600 mt-1">
          Crea un enlace único para que los estudiantes se registren en tu universidad
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Button onClick={handleGenerate} isLoading={isGenerating}>
            Generar nuevo código
          </Button>

          {inviteCode && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de invitación
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={handleCopyCode}>
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace de registro
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Comparte este enlace con tus estudiantes para que puedan registrarse
                  automáticamente bajo tu universidad.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
