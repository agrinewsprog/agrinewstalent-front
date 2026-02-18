'use client';

import { useState, useEffect } from 'react';
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CandidateCard, { type Candidate } from '@/src/components/company/CandidateCard';

export default function CompanyCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, filterEstado]);

  const fetchCandidates = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/company/candidates`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar los candidatos');
      }

      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los candidatos');

      // Mock data para desarrollo
      setCandidates([
        {
          id: '1',
          nombre: 'María',
          apellidos: 'García López',
          email: 'maria.garcia@example.com',
          foto: undefined,
          ubicacion: 'Madrid, España',
          fechaRegistro: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ultimaFormacion: 'Ingeniería Informática - Universidad Politécnica',
          ultimaExperiencia: 'Desarrolladora Junior en TechCorp',
          idiomas: ['Español (Nativo)', 'Inglés (C1)', 'Francés (B2)'],
          ofertaPostulada: 'Desarrollador Full Stack Junior',
          estado: 'Nuevo',
        },
        {
          id: '2',
          nombre: 'Carlos',
          apellidos: 'Martínez Sánchez',
          email: 'carlos.martinez@example.com',
          foto: undefined,
          ubicacion: 'Barcelona, España',
          fechaRegistro: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ultimaFormacion: 'Máster en Marketing Digital - ESADE',
          ultimaExperiencia: 'Marketing Specialist en Digital Agency',
          idiomas: ['Español (Nativo)', 'Inglés (B2)', 'Catalán (Nativo)'],
          ofertaPostulada: 'Prácticas en Marketing Digital',
          estado: 'Revisado',
        },
        {
          id: '3',
          nombre: 'Ana',
          apellidos: 'Rodríguez Torres',
          email: 'ana.rodriguez@example.com',
          foto: undefined,
          ubicacion: 'Valencia, España',
          fechaRegistro: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          ultimaFormacion: 'Ingeniería de Datos - Universidad de Valencia',
          ultimaExperiencia: 'Data Engineer en Analytics Corp',
          idiomas: ['Español (Nativo)', 'Inglés (C2)', 'Alemán (B1)'],
          ofertaPostulada: 'Ingeniero de Datos Senior',
          estado: 'Contactado',
        },
        {
          id: '4',
          nombre: 'Javier',
          apellidos: 'López Fernández',
          email: 'javier.lopez@example.com',
          foto: undefined,
          ubicacion: 'Sevilla, España',
          fechaRegistro: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          ultimaFormacion: 'Grado en Administración de Empresas',
          ultimaExperiencia: 'Becario en Empresa Consultora',
          idiomas: ['Español (Nativo)', 'Inglés (B1)'],
          ofertaPostulada: 'Desarrollador Full Stack Junior',
          estado: 'Descartado',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Filtro por estado
    if (filterEstado !== 'Todos') {
      filtered = filtered.filter((c) => c.estado === filterEstado);
    }

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.apellidos.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.ultimaFormacion?.toLowerCase().includes(term) ||
          c.ultimaExperiencia?.toLowerCase().includes(term)
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleViewCV = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCVModal(true);
  };

  const handleSendMessage = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleSendMessageSubmit = async () => {
    if (!messageText.trim() || !selectedCandidate) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/company/candidates/${selectedCandidate.id}/message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      alert('Mensaje enviado correctamente');
      setShowMessageModal(false);
      setMessageText('');
      setSelectedCandidate(null);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error al enviar el mensaje');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los candidatos que han aplicado a tus ofertas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Nuevos</p>
            <p className="text-3xl font-bold text-blue-600">
              {candidates.filter((c) => c.estado === 'Nuevo').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Revisados</p>
            <p className="text-3xl font-bold text-yellow-600">
              {candidates.filter((c) => c.estado === 'Revisado').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Contactados</p>
            <p className="text-3xl font-bold text-green-600">
              {candidates.filter((c) => c.estado === 'Contactado').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Descartados</p>
            <p className="text-3xl font-bold text-gray-500">
              {candidates.filter((c) => c.estado === 'Descartado').length}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, formación o experiencia..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <FunnelIcon className="h-5 w-5" />
            <span className="font-medium">Estado:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Nuevo', 'Revisado', 'Contactado', 'Descartado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilterEstado(estado)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterEstado === estado
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando <span className="font-semibold">{filteredCandidates.length}</span> de{' '}
        <span className="font-semibold">{candidates.length}</span> candidatos
      </div>

      {/* Lista de candidatos */}
      {error && !candidates.length ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCandidates}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No se encontraron candidatos con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onViewCV={handleViewCV}
              onSendMessage={handleSendMessage}
            />
          ))}
        </div>
      )}

      {/* Modal Ver CV */}
      {showCVModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Curriculum de {selectedCandidate.nombre} {selectedCandidate.apellidos}
              </h2>
              <button
                onClick={() => setShowCVModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">
                  Aquí se mostraría el CV del candidato en formato PDF o vista previa
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center transition-colors"
                >
                  Descargar CV
                </a>
                <button
                  onClick={() => setShowCVModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Mensaje */}
      {showMessageModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Enviar mensaje a {selectedCandidate.nombre}
              </h2>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Escribe tu mensaje al candidato..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessageSubmit}
                  disabled={!messageText.trim()}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
