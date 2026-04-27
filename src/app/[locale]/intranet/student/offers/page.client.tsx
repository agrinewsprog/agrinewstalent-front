'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api/client';
import { Offer } from '@/types';
import { OffersList } from '@/components/offers/offers-list';

interface OffersPageClientProps {
  initialOffers: Offer[];
  initialAppliedIds?: string[];
  initialSavedIds?: string[];
}

// ── Notificación inline simple ────────────────────────────────────────────────
type NotifType = 'success' | 'error';
interface Notif { id: number; msg: string; type: NotifType }

function useNotif() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  let counter = 0;

  const show = useCallback((msg: string, type: NotifType) => {
    const id = ++counter;
    setNotifs(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 4000);
  }, []);

  return {
    notifs,
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
  };
}

function NotifBar({ notifs }: { notifs: Notif[] }) {
  if (!notifs.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifs.map(n => (
        <div
          key={n.id}
          className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white transition-all ${
            n.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {n.type === 'success' ? '✓ ' : '✗ '}{n.msg}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function OffersPageClient({ initialOffers, initialAppliedIds = [], initialSavedIds = [] }: OffersPageClientProps) {
  const t = useTranslations('intranet');
  const { notifs, success, error: showError } = useNotif();
  const [savedOffers, setSavedOffers] = useState<string[]>(initialSavedIds);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set(initialAppliedIds));
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleApply = async (offerId: string) => {
    if (applyingId) return;
    setApplyingId(offerId);
    try {
      await api.post('/applications', { offerId });
      setAppliedIds(p => new Set([...p, offerId]));
      success(t('student.offers.notifications.appliedSuccess'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('student.offers.notifications.applyError');
      showError(msg);
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  const handleSave = async (offerId: string) => {
    if (savingId) return;
    setSavingId(offerId);
    try {
      if (savedOffers.includes(offerId)) {
        await api.delete(`/saved-offers/${offerId}`);
        setSavedOffers(p => p.filter(id => id !== offerId));
        success(t('student.offers.notifications.removedFromSaved'));
      } else {
        await api.post('/saved-offers', { offerId });
        setSavedOffers(p => [...p, offerId]);
        success(t('student.offers.notifications.savedSuccess'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('student.offers.notifications.saveError');
      showError(msg);
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <NotifBar notifs={notifs} />
      <OffersList
        offers={initialOffers}
        onApply={handleApply}
        onSave={handleSave}
        savedOffers={savedOffers}
        appliedOffers={[...appliedIds]}
      />
    </>
  );
}
