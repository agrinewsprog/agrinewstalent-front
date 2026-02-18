'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import OfferForm, { type Offer } from '@/src/components/company/OfferForm';
import CompanyOffersList from '@/src/components/company/CompanyOffersList';

export default function CompanyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
  const [filterEstado, setFilterEstado] = useState<string>('Todas');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/company/offers`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar las ofertas');
      }

      const data = await response.json();
      setOffers(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las ofertas');

      // Mock data para desarrollo
      setOffers([
        {
          id: '1',
          titulo: 'Desarrollador Full Stack Junior',
          categoria: 'Empleo',
          jornada: 'Completa',
          modalidad: 'Híbrido',
          descripcion:
            'Buscamos un desarrollador Full Stack apasionado por la tecnología para unirse a nuestro equipo. Trabajarás en proyectos innovadores utilizando las últimas tecnologías del mercado.',
          requisitos:
            '- 1-2 años de experiencia en desarrollo web\n- Conocimientos en React y Node.js\n- Inglés nivel intermedio\n- Actitud proactiva y ganas de aprender',
          empresa: 'Tech Solutions',
          ubicacion: 'Madrid, España',
          fechaPublicacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'Abierta',
        },
        {
          id: '2',
          titulo: 'Prácticas en Marketing Digital',
          categoria: 'Prácticas',
          jornada: 'Parcial',
          modalidad: 'Presencial',
          descripcion:
            'Ofrecemos una oportunidad única para estudiantes que quieran aprender sobre marketing digital en un entorno dinámico y colaborativo.',
          requisitos:
            '- Estudiante de Marketing, Publicidad o similar\n- Conocimientos básicos de redes sociales\n- Creatividad y capacidad de trabajo en equipo',
          empresa: 'Marketing Pro',
          ubicacion: 'Barcelona, España',
          fechaPublicacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'Abierta',
        },
        {
          id: '3',
          titulo: 'Ingeniero de Datos Senior',
          categoria: 'Empleo',
          jornada: 'Completa',
          modalidad: 'Remoto',
          descripcion:
            'Únete a nuestro equipo de Data Engineering para diseñar e implementar soluciones de datos escalables y eficientes.',
          requisitos:
            '- +3 años experiencia en ingeniería de datos\n- Experto en SQL, Python, Spark\n- Experiencia con AWS o Azure\n- Inglés fluido',
          empresa: 'Data Corp',
          ubicacion: 'Remoto',
          fechaPublicacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'Cerrada',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOffer = async (offer: Offer) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const isEditing = !!offer.id;

      const response = await fetch(
        isEditing ? `${apiUrl}/company/offers/${offer.id}` : `${apiUrl}/company/offers`,
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offer),
        }
      );

      if (!response.ok) {
        throw new Error('Error al guardar la oferta');
      }

      const savedOffer = await response.json();

      if (isEditing) {
        setOffers((prev) =>
          prev.map((o) => (o.id === savedOffer.id ? savedOffer : o))
        );
      } else {
        setOffers((prev) => [savedOffer, ...prev]);
      }

      setShowForm(false);
      setEditingOffer(undefined);
      alert(isEditing ? 'Oferta actualizada correctamente' : 'Oferta publicada correctamente');
    } catch (err) {
      console.error('Error saving offer:', err);
      throw err;
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOffer(undefined);
  };

  const handleNewOffer = () => {
    setEditingOffer(undefined);
    setShowForm(true);
  };

  const filteredOffers = offers.filter((offer) => {
    if (filterEstado === 'Todas') return true;
    return offer.estado === filterEstado;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis vacantes</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus ofertas de empleo y prácticas publicadas
            </p>
          </div>
          <button
            onClick={handleNewOffer}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Publicar vacante
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total vacantes</p>
            <p className="text-3xl font-bold text-gray-900">{offers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Abiertas</p>
            <p className="text-3xl font-bold text-green-600">
              {offers.filter((o) => o.estado === 'Abierta').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Cerradas</p>
            <p className="text-3xl font-bold text-gray-600">
              {offers.filter((o) => o.estado === 'Cerrada').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Borradores</p>
            <p className="text-3xl font-bold text-yellow-600">
              {offers.filter((o) => o.estado === 'Borrador').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FunnelIcon className="h-5 w-5" />
          <span className="font-medium">Filtrar:</span>
        </div>
        <div className="flex gap-2">
          {['Todas', 'Abierta', 'Cerrada', 'Borrador'].map((estado) => (
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

      {/* Lista de ofertas */}
      {error && !offers.length ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOffers}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <CompanyOffersList offers={filteredOffers} onEdit={handleEditOffer} />
      )}

      {/* Modal de formulario */}
      {showForm && (
        <OfferForm
          initialOffer={editingOffer}
          onSave={handleSaveOffer}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
