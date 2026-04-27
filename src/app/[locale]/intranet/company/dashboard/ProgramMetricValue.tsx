'use client';

import { useState, useEffect } from 'react';

interface Props {
  initialValue: number;
  metricKey: string;
}

/**
 * Renders a metric number that updates in real-time via custom events
 * dispatched by DashboardProgramApplications after a status change + refetch.
 */
export function ProgramMetricValue({ initialValue, metricKey }: Props) {
  const [value, setValue] = useState(initialValue);

  /* Sync from server props when router.refresh() completes */
  useEffect(() => { setValue(initialValue); }, [initialValue]);

  /* Listen for real-time updates from the program applications section */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail[metricKey] === 'number') {
        setValue(detail[metricKey]);
      }
    };
    window.addEventListener('dashboard:program-metrics-updated', handler);
    return () => window.removeEventListener('dashboard:program-metrics-updated', handler);
  }, [metricKey]);

  return <>{value}</>;
}
