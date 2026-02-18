'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { type Candidate } from '@/src/components/company/CandidateCard';

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface Language {
  id?: string;
  language: string;
  level: string;
}

interface CandidateDetail extends Candidate {
  education?: Education[];
  experience?: Experience[];
  languages?: Language[];
  cv?: {
    fileName?: string;
    fileUrl?: string;
    uploadedAt?: string;
  };
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCandidate(params.id as string);
    }
  }, [params.id]);

  const fetchCandidate = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/company/candidates/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar el candidato');
      }

      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el candidato');

      // Mock data para desarrollo
      setCandidate({
        id: id,
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
        education: [
          {
            id: '1',
            institution: 'Universidad Politécnica de Madrid',
            degree: 'Grado en Ingeniería Informática',
            fieldOfStudy: 'Desarrollo de Software',
            startDate: '2018-09',
            endDate: '2022-06',
            current: false,
            description: 'Especialización en desarrollo web y aplicaciones móviles',
          },
        ],
        experience: [
          {
            id: '1',
            company: 'TechCorp Solutions',
            position: 'Desarrolladora Junior',
            location: 'Madrid, España',
            startDate: '2022-07',
            endDate: '2024-12',
            current: false,
            description:
              'Desarrollo de aplicaciones web con React y Node.js. Participación en proyectos ágiles con equipos internacionales.',
          },
        ],
        languages: [
          { id: '1', language: 'Español', level: 'Nativo' },
          { id: '2', language: 'Inglés', level: 'C1' },
          { id: '3', language: 'Francés', level: 'B2' },
        ],
        cv: {
          fileName: 'CV_Maria_Garcia.pdf',
          fileUrl: '#',
          uploadedAt: new Date().toISOString(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !candidate) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/company/candidates/${candidate.id}/message`, {
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
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error al enviar el mensaje');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (estado?: string) => {
    const badges = {
      Nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
      Revisado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Contactado: 'bg-green-100 text-green-800 border-green-200',
      Descartado: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[estado as keyof typeof badges] || badges.Nuevo;
  };

  const getLevelColor = (level: string) => {
    if (['A1', 'A2'].includes(level)) return 'bg-gray-100 text-gray-700';
    if (['B1', 'B2'].includes(level)) return 'bg-blue-100 text-blue-700';
    if (['C1', 'C2'].includes(level)) return 'bg-green-100 text-green-700';
    if (level === 'Nativo') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando candidato...</p>
        </div>
      </div>
    );
  }

  if (error && !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/intranet/company/candidates')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Volver a candidatos
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botón volver */}
      <button
        onClick={() => router.push('/intranet/company/candidates')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Volver a candidatos
      </button>

      {/* Cabecera del candidato */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {candidate.foto ? (
              <img
                src={candidate.foto}
                alt={`${candidate.nombre} ${candidate.apellidos}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <UserCircleIcon className="w-20 h-20 text-green-600" />
              </div>
            )}
          </div>

          {/* Información */}
          <div className="flex-1 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {candidate.nombre} {candidate.apellidos}
                </h1>
                <div className="flex items-center gap-4 text-green-100">
                  <span className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5" />
                    {candidate.email}
                  </span>
                  {candidate.ubicacion && (
                    <span className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      {candidate.ubicacion}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getEstadoBadge(
                  candidate.estado
                )}`}
              >
                {candidate.estado || 'Nuevo'}
              </span>
            </div>

            {/* Oferta postulada */}
            {candidate.ofertaPostulada && (
              <div className="bg-white/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-green-100 mb-1">Postulado a:</p>
                <p className="font-semibold">{candidate.ofertaPostulada}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              {candidate.cv && (
                <a
                  href={candidate.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 font-medium transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  Ver curriculum
                </a>
              )}
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 border-2 border-white text-white rounded-lg hover:bg-white/30 font-medium transition-colors"
              >
                <EnvelopeIcon className="h-5 w-5" />
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formación */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Formación académica</h2>
            </div>
            {candidate.education && candidate.education.length > 0 ? (
              <div className="space-y-4">
                {candidate.education.map((edu, index) => (
                  <div key={edu.id || index} className="border-l-4 border-green-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700 font-medium">{edu.institution}</p>
                    <p className="text-gray-600 text-sm mb-2">{edu.fieldOfStudy}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formatDate(edu.startDate)} -{' '}
                        {edu.current ? 'Actualidad' : formatDate(edu.endDate || '')}
                      </span>
                    </div>
                    {edu.description && <p className="text-gray-600 text-sm">{edu.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay información de formación</p>
            )}
          </div>

          {/* Experiencia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Experiencia profesional</h2>
            </div>
            {candidate.experience && candidate.experience.length > 0 ? (
              <div className="space-y-4">
                {candidate.experience.map((exp, index) => (
                  <div key={exp.id || index} className="border-l-4 border-green-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                    <p className="text-gray-600 text-sm mb-2">{exp.location}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formatDate(exp.startDate)} -{' '}
                        {exp.current ? 'Actualidad' : formatDate(exp.endDate || '')}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 text-sm whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay información de experiencia</p>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Idiomas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <LanguageIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Idiomas</h2>
            </div>
            {candidate.languages && candidate.languages.length > 0 ? (
              <div className="space-y-3">
                {candidate.languages.map((lang, index) => (
                  <div key={lang.id || index} className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{lang.language}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(
                        lang.level
                      )}`}
                    >
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay información de idiomas</p>
            )}
          </div>

          {/* CV */}
          {candidate.cv && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Curriculum Vitae</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">{candidate.cv.fileName}</p>
                <p className="text-xs text-gray-500">
                  Subido el {new Date(candidate.cv.uploadedAt || '').toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={candidate.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center transition-colors"
                >
                  Ver CV
                </a>
                <a
                  href={candidate.cv.fileUrl}
                  download
                  className="w-full px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-medium text-center transition-colors"
                >
                  Descargar CV
                </a>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información adicional</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Fecha de registro</p>
                <p className="text-gray-900 font-medium">
                  {new Date(candidate.fechaRegistro || '').toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Enviar Mensaje */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Enviar mensaje a {candidate.nombre}</h2>
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
                  onClick={handleSendMessage}
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
