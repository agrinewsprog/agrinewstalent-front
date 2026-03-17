'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';

interface PendingApproval {
  id: string;
  type: 'company' | 'offer';
  companyName?: string;
  offerTitle?: string;
  programName?: string;
  createdAt: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onApprove: (id: string, type: 'company' | 'offer') => Promise<void>;
  onReject: (id: string, type: 'company' | 'offer') => Promise<void>;
}

export function PendingApprovals({ approvals = [], onApprove, onReject }: PendingApprovalsProps) {
  const t = useTranslations('intranet');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (approval: PendingApproval) => {
    setProcessingId(approval.id);
    try {
      await onApprove(approval.id, approval.type);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (approval: PendingApproval) => {
    setProcessingId(approval.id);
    try {
      await onReject(approval.id, approval.type);
    } finally {
      setProcessingId(null);
    }
  };

  // Variable undefined: approvals
  if ((approvals ?? []).length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-600 py-8">
            {t('university.pendingApprovals.empty')}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {(approvals ?? []).map((approval) => (
        <Card key={approval.id}>
          <CardBody>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="warning">{t('university.pendingApprovals.pending')}</Badge>
                  <Badge variant={approval.type === 'company' ? 'info' : 'default'}>
                    {approval.type === 'company' ? t('university.pendingApprovals.typeCompany') : t('university.pendingApprovals.typeOffer')}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">
                  {approval.type === 'company' 
                    ? approval.companyName 
                    : approval.offerTitle}
                </h3>
                
                {approval.programName && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('university.pendingApprovals.program', { name: approval.programName })}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {t('university.pendingApprovals.requested', { date: new Date(approval.createdAt).toLocaleDateString() })}
                </p>
              </div>

              <div className="ml-6 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(approval)}
                  isLoading={processingId === approval.id}
                  disabled={processingId !== null}
                >
                  {t('university.pendingApprovals.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleReject(approval)}
                  isLoading={processingId === approval.id}
                  disabled={processingId !== null}
                >
                  {t('university.pendingApprovals.reject')}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
