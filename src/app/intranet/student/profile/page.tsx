'use client';

import { useState, useEffect } from 'react';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import EducationForm, { type Education } from '@/src/components/profile/EducationForm';
import ExperienceForm, { type Experience } from '@/src/components/profile/ExperienceForm';
import CVUploader from '@/src/components/profile/CVUploader';
import LanguagesForm, { type Language } from '@/src/components/profile/LanguagesForm';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  education?: Education[];
  experience?: Experience[];
  cv?: {
    fileName?: string;
    fileUrl?: string;
    uploadedAt?: string;
  };
  languages?: Language[];
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/student/profile`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      
      // Mock data para desarrollo
      setProfile({
        id: '1',
        name: 'Juan Pérez García',
        email: 'juan.perez@example.com',
        photo: undefined,
        education: [],
        experience: [],
        languages: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${apiUrl}/student/profile/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la foto');
      }

      const data = await response.json();
      setProfile((prev) => (prev ? { ...prev, photo: data.photoUrl } : prev));
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error al subir la foto');
    }
  };

  const handleEducationSave = async (education: Education[]) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/student/profile/education`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ education }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la formación');
      }

      setProfile((prev) => (prev ? { ...prev, education } : prev));
      alert('Formación guardada correctamente');
    } catch (err) {
      console.error('Error saving education:', err);
      alert('Error al guardar la formación');
    }
  };

  const handleExperienceSave = async (experience: Experience[]) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/student/profile/experience`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experience }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la experiencia');
      }

      setProfile((prev) => (prev ? { ...prev, experience } : prev));
      alert('Experiencia guardada correctamente');
    } catch (err) {
      console.error('Error saving experience:', err);
      alert('Error al guardar la experiencia');
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch(`${apiUrl}/student/profile/cv`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el CV');
      }

      const data = await response.json();
      return {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
      };
    } catch (err) {
      console.error('Error uploading CV:', err);
      throw err;
    }
  };

  const handleCVDelete = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/student/profile/cv`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el CV');
      }

      setProfile((prev) => (prev ? { ...prev, cv: undefined } : prev));
    } catch (err) {
      console.error('Error deleting CV:', err);
      throw err;
    }
  };

  const handleLanguagesSave = async (languages: Language[]) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/student/profile/languages`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ languages }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los idiomas');
      }

      setProfile((prev) => (prev ? { ...prev, languages } : prev));
      alert('Idiomas guardados correctamente');
    } catch (err) {
      console.error('Error saving languages:', err);
      alert('Error al guardar los idiomas');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabecera del perfil */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center gap-6">
          {/* Foto de perfil */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100">
                  <UserCircleIcon className="w-20 h-20 text-green-600" />
                </div>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <CameraIcon className="h-5 w-5 text-gray-600" />
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Información básica */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <p className="text-green-100 mb-4">{profile.email}</p>
            <div className="flex gap-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm text-green-100">Formación</p>
                <p className="text-xl font-semibold">{profile.education?.length || 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm text-green-100">Experiencias</p>
                <p className="text-xl font-semibold">{profile.experience?.length || 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm text-green-100">Idiomas</p>
                <p className="text-xl font-semibold">{profile.languages?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones del perfil */}
      <div className="space-y-8">
        {/* Formación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <EducationForm
            initialEducation={profile.education}
            onSave={handleEducationSave}
          />
        </div>

        {/* Experiencia */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ExperienceForm
            initialExperience={profile.experience}
            onSave={handleExperienceSave}
          />
        </div>

        {/* CV */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <CVUploader
            initialCV={profile.cv}
            onUpload={handleCVUpload}
            onDelete={handleCVDelete}
          />
        </div>

        {/* Idiomas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LanguagesForm
            initialLanguages={profile.languages}
            onSave={handleLanguagesSave}
          />
        </div>
      </div>
    </div>
  );
}
