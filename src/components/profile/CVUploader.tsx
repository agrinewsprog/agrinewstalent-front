'use client';

import { useState, useRef } from 'react';
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface CVUploaderProps {
  initialCV?: {
    fileName?: string;
    fileUrl?: string;
    uploadedAt?: string;
  };
  onUpload: (file: File) => Promise<{ fileName: string; fileUrl: string }>;
  onDelete?: () => Promise<void>;
}

export default function CVUploader({ initialCV, onUpload, onDelete }: CVUploaderProps) {
  const [currentCV, setCurrentCV] = useState(initialCV);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      return 'Solo se permiten archivos PDF';
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'El archivo no debe superar los 5MB';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError('');

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const result = await onUpload(file);
      setCurrentCV({
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        uploadedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('¿Estás seguro de que quieres eliminar tu CV?')) {
      setIsDeleting(true);
      try {
        await onDelete();
        setCurrentCV(undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar el archivo');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DocumentTextIcon className="h-7 w-7 text-green-600" />
          Curriculum Vitae (CV)
        </h2>
      </div>

      {/* Archivo actual */}
      {currentCV && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 rounded-lg p-3">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{currentCV.fileName}</h3>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                {currentCV.uploadedAt && (
                  <p className="text-sm text-gray-600">
                    Subido el {formatDate(currentCV.uploadedAt)}
                  </p>
                )}
                <div className="mt-3 flex gap-3">
                  <a
                    href={currentCV.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Ver CV
                  </a>
                  <a
                    href={currentCV.fileUrl}
                    download
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Descargar
                  </a>
                </div>
              </div>
            </div>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar CV"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Zona de subida */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <DocumentArrowUpIcon className="h-8 w-8 text-green-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {currentCV ? 'Actualizar CV' : 'Subir tu CV'}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Arrastra y suelta tu archivo aquí, o{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            selecciona un archivo
          </button>
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Solo PDF</span>
          </div>
          <span>•</span>
          <span>Máximo 5MB</span>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-600 h-2 rounded-full animate-pulse w-2/3"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Subiendo archivo...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
            <XCircleIcon className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Recomendaciones:</strong> Asegúrate de que tu CV esté actualizado y contenga
          toda tu información relevante. Un CV completo aumenta tus posibilidades de ser
          seleccionado por las empresas.
        </p>
      </div>
    </div>
  );
}
