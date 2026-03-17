'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { api } from '@/src/lib/api/client';
import { SavedOfferItem } from './page';

//  Notificación inline 
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
  return { notifs, success: (m: string) => show(m, 'success'), error: (m: string) => show(m, 'error') };
}

//  Helpers 
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Jornada completa',
  PART_TIME: 'Media jornada',
  INTERNSHIP: 'Prácticas',
  FREELANCE: 'Freelance',
  REMOTE: 'Remoto',
};

function relativeDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Math.ceil((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
  return `Hace ${Math.floor(diff / 30)} meses`;
}

function CompanyLogo({ logoUrl, name }: { logoUrl?: string | null; name?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name ?? 'Empresa'}
        className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}

//  Panel de detalle 
interface DetailPanelProps {
  item: SavedOfferItem;
  isApplied: boolean;
  isApplying: boolean;
  onClose: () => void;
  onApply: (offerId: number) => void;
  onUnsave: (offerId: number, itemId: number) => void;
  isRemoving: boolean;
}

function SavedOfferDetailPanel({
  item,
  isApplied,
  isApplying,
  onClose,
  onApply,
  onUnsave,
  isRemoving,
}: DetailPanelProps) {
  const offer = item.offer;
  const companyName = offer.company?.name;
  const logoUrl = offer.company?.logoUrl;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
      {/* Cabecera verde */}
      <div className="relative bg-gradient-to-br from-green-600 to-green-800 px-6 pt-6 pb-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-lg leading-none"
        >
          
        </button>
        <div className="flex items-center gap-3 mb-2">
          <CompanyLogo logoUrl={logoUrl} name={companyName} />
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{offer.title}</h2>
            {companyName && <p className="text-green-200 text-sm">{companyName}</p>}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-6 py-5 space-y-4">
        {/* Info chips */}
        <div className="flex flex-wrap gap-2">
          {offer.location && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {offer.location}
            </span>
          )}
          {offer.jobType && (
            <span className="text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">
              {JOB_TYPE_LABELS[offer.jobType] ?? offer.jobType}
            </span>
          )}
          {offer.salary && (
            <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1">
              {offer.salary}
            </span>
          )}
        </div>

        {/* Guardada el */}
        <p className="text-xs text-gray-400">
          Guardada {relativeDate(item.createdAt)}
        </p>

        {/* Descripción */}
        {offer.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Descripción
            </h4>
            <p className="text-sm text-gray-700 line-clamp-5">{offer.description}</p>
          </div>
        )}

        {/* Acciones */}
        <Link
          href={`/intranet/student/offers/${item.offerId}`}
          className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Ver oferta completa
        </Link>

        {isApplied ? (
          <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ya aplicado
          </div>
        ) : (
          <button
            onClick={() => onApply(item.offerId)}
            disabled={isApplying}
            className="block w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isApplying ? 'Enviando...' : 'Aplicar ahora'}
          </button>
        )}

        <button
          onClick={() => onUnsave(item.offerId, item.id)}
          disabled={isRemoving}
          className="block w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
        >
          {isRemoving ? 'Eliminando...' : 'Eliminar de guardadas'}
        </button>
      </div>
    </div>
  );
}

//  Principal 
interface Props {
  initialItems: SavedOfferItem[];
  initialAppliedIds: number[];
}

export function SavedOffersClient({ initialItems, initialAppliedIds }: Props) {
  const t = useTranslations('intranet');
  const { notifs, success, error: showError } = useNotif();
  const [items, setItems] = useState(initialItems);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set(initialAppliedIds));
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedOfferItem | null>(null);

  const handleUnsave = async (offerId: number, itemId: number) => {
    if (removingId !== null) return;
    setRemovingId(itemId);
    try {
      await api.delete(`/saved-offers/${offerId}`);
      setItems(p => p.filter(i => i.id !== itemId));
      if (selectedItem?.id === itemId) setSelectedItem(null);
      success('Oferta eliminada de guardadas');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'No se pudo eliminar la oferta guardada');
    } finally {
      setRemovingId(null);
    }
  };

  const handleApply = async (offerId: number) => {
    if (applyingId !== null) return;
    setApplyingId(offerId);
    try {
      await api.post('/applications', { offerId });
      setAppliedIds(p => new Set([...p, offerId]));
      success('¡Aplicación enviada correctamente!');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al aplicar');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <>
      {/* Notificaciones */}
      {notifs.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white ${
                n.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {n.type === 'success' ? ' ' : ' '}{n.msg}
            </div>
          ))}
        </div>
      )}

      {/* Layout dividido */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
        {/* Lista */}
        <div className="space-y-3 lg:col-span-2">
          {items.map(item => {
            const offer = item.offer;
            const isSelected = selectedItem?.id === item.id;
            const companyName = offer.company?.name;
            const logoUrl = offer.company?.logoUrl;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(isSelected ? null : item)}
                className={`bg-white rounded-2xl border transition-all shadow-sm p-4 cursor-pointer hover:shadow-md ${
                  isSelected ? 'border-green-500 shadow-md' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CompanyLogo logoUrl={logoUrl} name={companyName} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                        {offer.title}
                      </h3>
                      {appliedIds.has(item.offerId) && (
                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                          Aplicada
                        </span>
                      )}
                    </div>

                    {companyName && (
                      <p className="text-sm text-gray-500 mt-0.5">{companyName}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {offer.location && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {offer.location}
                        </span>
                      )}
                      {offer.jobType && (
                        <span className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5">
                          {JOB_TYPE_LABELS[offer.jobType] ?? offer.jobType}
                        </span>
                      )}
                      {offer.salary && (
                        <span className="text-xs text-green-600 font-medium">{offer.salary}</span>
                      )}
                      <span className="text-xs text-gray-400">{relativeDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de detalle */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <SavedOfferDetailPanel
              item={selectedItem}
              isApplied={appliedIds.has(selectedItem.offerId)}
              isApplying={applyingId === selectedItem.offerId}
              onClose={() => setSelectedItem(null)}
              onApply={handleApply}
              onUnsave={handleUnsave}
              isRemoving={removingId === selectedItem.id}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center sticky top-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">{t('student.savedOffers.selectOffer')}</h3>
              <p className="text-sm text-gray-400">{t('student.savedOffers.selectOfferSub')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
