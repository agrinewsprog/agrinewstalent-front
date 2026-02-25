'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ApiOffer = {
  id: number;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  salary?: string | null;
  workMode?: 'remote' | 'hybrid' | 'onsite' | null;
  contractType?: 'full-time' | 'part-time' | 'internship' | 'freelance' | null;
  status?: string;
  createdAt?: string;
  company?: { companyName?: string; city?: string; country?: string };
};

export type Offer = {
  id: string;
  titulo: string;
  categoria: 'Empleo' | 'Prácticas';
  jornada: 'Completa' | 'Parcial' | 'Flexible';
  modalidad: 'Presencial' | 'Remoto' | 'Híbrido';
  descripcion: string;
  requisitos: string;
  empresa: string;
  ubicacion: string;
  salario: string;
  fechaPublicacion: string;
  estado: 'Abierta' | 'Cerrada' | 'Borrador';
  idioma?: string;
  contrato?: string;
};

// ─── Mapeadores ───────────────────────────────────────────────────────────────

function apiOfferToOffer(a: ApiOffer): Offer {
  const workModeMap: Record<string, Offer['modalidad']> = {
    remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial',
  };
  const contractTypeToJornada: Record<string, Offer['jornada']> = {
    'full-time': 'Completa', 'part-time': 'Parcial',
    freelance: 'Flexible', internship: 'Completa',
  };
  const statusMap: Record<string, Offer['estado']> = {
    PUBLISHED: 'Abierta', CLOSED: 'Cerrada', DRAFT: 'Borrador',
  };
  return {
    id: String(a.id),
    titulo: a.title ?? '',
    categoria: a.contractType === 'internship' ? 'Prácticas' : 'Empleo',
    jornada: contractTypeToJornada[a.contractType ?? ''] ?? 'Completa',
    modalidad: workModeMap[a.workMode ?? ''] ?? 'Presencial',
    descripcion: a.description ?? '',
    requisitos: a.requirements ?? '',
    empresa: a.company?.companyName ?? '',
    ubicacion: a.location ?? '',
    salario: a.salary ?? '',
    fechaPublicacion: a.createdAt ?? new Date().toISOString(),
    estado: statusMap[a.status ?? ''] ?? 'Borrador',
    idioma: 'Español',
    contrato: a.contractType === 'internship' ? 'Prácticas' : 'Indefinido',
  };
}

function offerToApiBody(offer: Offer) {
  const workModeMap: Record<string, 'remote' | 'hybrid' | 'onsite'> = {
    Remoto: 'remote', Híbrido: 'hybrid', Presencial: 'onsite',
  };
  return {
    title: offer.titulo,
    description: offer.descripcion,
    requirements: offer.requisitos || undefined,
    location: offer.ubicacion || undefined,
    salary: offer.salario || undefined,
    workMode: workModeMap[offer.modalidad] ?? 'onsite',
    contractType: offer.categoria === 'Prácticas' ? 'internship' as const
      : offer.jornada === 'Parcial' ? 'part-time' as const
      : offer.jornada === 'Flexible' ? 'freelance' as const
      : 'full-time' as const,
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OFFERS: Offer[] = [
  {
    id: '1', titulo: 'Estudiante de Veterinaría', categoria: 'Prácticas',
    jornada: 'Parcial', modalidad: 'Presencial',
    descripcion: 'En agriNews SL, empresa especializada en comunicación y soluciones para el sector agropecuario, buscamos incorporar a un/a Estudiante de Veterinaria para realizar prácticas especializadas y...',
    requisitos: '- Ser estudiante en activo de Grado en Veterinaria\n- Incorporación inmediata o próximamente\n- Disponibilidad de al menos 4h/día\n- Motivación por el sector agropecuario, vacuno, ovino, caprino, cerdo y avicultura, bienestar y nutrición...\n- Responsabilidad para revisar las prácticas de manejo, navegación de datos y seguir y apoyar las iniciativas del sector',
    empresa: 'agriNews SL', ubicacion: 'Lleida, España', salario: '',
    fechaPublicacion: new Date(Date.now() - 2 * 86400000).toISOString(),
    estado: 'Abierta', idioma: 'Español', contrato: 'Prácticas',
  },
  {
    id: '2', titulo: 'Nutricionista animal', categoria: 'Empleo',
    jornada: 'Completa', modalidad: 'Presencial',
    descripcion: 'Buscamos nutricionista con experiencia en formulación de raciones para ganado bovino.', requisitos: '- Grado en Veterinaria o Zootecnia\n- 2 años de experiencia\n- Inglés B2',
    empresa: 'agriNews SL', ubicacion: 'Madrid, España', salario: '',
    fechaPublicacion: new Date(Date.now() - 5 * 86400000).toISOString(),
    estado: 'Abierta', idioma: 'Español', contrato: 'Indefinido',
  },
  {
    id: '3', titulo: 'Veterinario/a periodicista/a', categoria: 'Empleo',
    jornada: 'Completa', modalidad: 'Híbrido',
    descripcion: 'Redactor especializado en salud animal y producción ganadera.', requisitos: '- Grado en Veterinaria\n- Experiencia divulgativa',
    empresa: 'agriNews SL', ubicacion: 'Barcelona, España', salario: '',
    fechaPublicacion: new Date(Date.now() - 8 * 86400000).toISOString(),
    estado: 'Abierta', idioma: 'Español', contrato: 'Indefinido',
  },
  {
    id: '4', titulo: 'Estudiante de Ingeniería agronómica', categoria: 'Prácticas',
    jornada: 'Parcial', modalidad: 'Presencial',
    descripcion: 'Prácticas en agronomía para estudiantes de último curso.', requisitos: '- Estudiante activo\n- Conocimiento de SIG\n- Carnet de conducir',
    empresa: 'agriNews SL', ubicacion: 'Lleida, España', salario: '',
    fechaPublicacion: new Date(Date.now() - 12 * 86400000).toISOString(),
    estado: 'Abierta', idioma: 'Español', contrato: 'Prácticas',
  },
  {
    id: '5', titulo: 'Estudiante de Veterinaría', categoria: 'Prácticas',
    jornada: 'Parcial', modalidad: 'Presencial',
    descripcion: 'Segunda convocatoria de prácticas para veterinaria.', requisitos: '- Mismo perfil que convocatoria anterior',
    empresa: 'agriNews SL', ubicacion: 'Castellón, España', salario: '',
    fechaPublicacion: new Date(Date.now() - 15 * 86400000).toISOString(),
    estado: 'Borrador', idioma: 'Español', contrato: 'Prácticas',
  },
];

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function TagPill({ label, variant = 'default' }: { label: string; variant?: 'green' | 'default' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
    }`}>
      {label}
    </span>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CompanyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [filterType, setFilterType] = useState<'Todo' | 'Empleo' | 'Prácticas'>('Todo');
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/offers`, { credentials: 'include' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const raw: ApiOffer[] = Array.isArray(data) ? data : (data.offers ?? []);
      const mapped = raw.map(apiOfferToOffer);
      setOffers(mapped);
      if (mapped.length) setSelectedOffer(mapped[0]);
    } catch {
      setOffers(MOCK_OFFERS);
      setSelectedOffer(MOCK_OFFERS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (offer: Offer, newEstado: Offer['estado']) => {
    const statusToApi: Record<string, string> = { Abierta: 'PUBLISHED', Cerrada: 'CLOSED', Borrador: 'DRAFT' };
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/offers/${offer.id}/status`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToApi[newEstado] }),
      });
    } catch { /* silencioso en desarrollo */ }
    setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, estado: newEstado } : o));
    if (selectedOffer?.id === offer.id) setSelectedOffer({ ...offer, estado: newEstado });
  };

  const filteredOffers = offers.filter((o) =>
    filterType === 'Todo' || o.categoria === filterType,
  );
  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / PER_PAGE));
  const pagedOffers = filteredOffers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Mis vacantes</h1>
        <div className="flex items-center gap-2">
          {(['Todo', 'Empleo', 'Prácticas'] as const).map((t) => (
            <button key={t} onClick={() => { setFilterType(t); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {t}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtrar
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── Left: list ── */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {pagedOffers.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No hay vacantes</div>
            ) : pagedOffers.map((offer) => (
              <button key={offer.id} onClick={() => setSelectedOffer(offer)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedOffer?.id === offer.id
                    ? 'border-green-400 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}>
                <div className="flex items-start gap-3">
                  {/* Mini logo */}
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{offer.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{offer.empresa}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <TagPill label={offer.categoria} variant="green" />
                      <TagPill label={offer.modalidad} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                      </svg>
                      {offer.ubicacion || 'Sin ubicación'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 pt-3 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md text-sm font-medium transition-colors ${
                    page === p ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {p}
                </button>
              ))}
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)}
                  className="w-7 h-7 rounded-md text-sm text-gray-600 hover:bg-gray-100">›</button>
              )}
            </div>
          )}
        </div>

        {/* ── Right: detail ── */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
          {!selectedOffer ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Selecciona una vacante
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Top: logo + title + edit btn */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-green-200 flex items-center justify-center shadow-sm flex-shrink-0">
                    <div className="text-center leading-none">
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                        <path d="M16 4C10 4 5 9 5 15c0 3.5 1.8 6.5 4.5 8.5l1.2-3.5C9 18.5 8 17 8 15c0-4.4 3.6-8 8-8s8 3.6 8 8c0 2-.8 3.8-2 5.1l1.2 3.4C25.2 21.5 27 18.5 27 15c0-6-5-11-11-11z" fill="#16a34a"/>
                        <circle cx="16" cy="15" r="3" fill="#16a34a"/>
                        <line x1="16" y1="18" x2="16" y2="28" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{selectedOffer.empresa || 'agriNews SL'}</p>
                    <h2 className="text-lg font-bold text-gray-900">{selectedOffer.titulo}</h2>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/intranet/company/offers/${selectedOffer.id}/edit`)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors"
                >
                  Editar vacante
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <TagPill label={selectedOffer.categoria} variant="green" />
                <TagPill label={selectedOffer.modalidad} />
                {selectedOffer.estado !== 'Abierta' && (
                  <TagPill label={selectedOffer.estado} />
                )}
              </div>

              {/* Condiciones */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Condiciones</p>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Contrato</p>
                    <p className="font-medium text-gray-800">{selectedOffer.contrato || selectedOffer.categoria}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Jornada</p>
                    <p className="font-medium text-gray-800">{selectedOffer.jornada === 'Completa' ? 'Media jornada' : selectedOffer.jornada}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Idioma</p>
                    <p className="font-medium text-gray-800">{selectedOffer.idioma || 'Español'}</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Descripción del puesto</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedOffer.descripcion || '—'}
                </p>
              </div>

              {/* Requisitos */}
              {selectedOffer.requisitos && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2">Requisitos</p>
                  <ul className="space-y-1.5">
                    {selectedOffer.requisitos.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {line.replace(/^[-•]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cambiar estado */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Estado:</span>
                {(['Abierta', 'Cerrada', 'Borrador'] as const).map((e) => (
                  <button key={e} onClick={() => handleStatusChange(selectedOffer, e)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selectedOffer.estado === e
                        ? e === 'Abierta' ? 'bg-green-600 text-white'
                          : e === 'Cerrada' ? 'bg-gray-600 text-white'
                          : 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
