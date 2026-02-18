'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api/client';
import { Application } from '@/src/types';
import { ApplicationsList } from '@/src/components/applications/applications-list';
import { useToast } from '@/src/hooks/use-toast';

interface ApplicationsListCompanyProps {
  applications: Application[];
}

export function ApplicationsListCompany({ applications: initialApplications }: ApplicationsListCompanyProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [applications, setApplications] = useState(initialApplications);

  const handleStatusChange = async (applicationId: string, status: Application['status']) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      
      // Actualizar localmente
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      success('Estado actualizado correctamente');
      router.refresh();
    } catch (err) {
      showError('Error al actualizar el estado');
      console.error(err);
    }
  };

  return (
    <ApplicationsList
      applications={applications}
      showStudent={true}
      showOffer={true}
      onStatusChange={handleStatusChange}
    />
  );
}
