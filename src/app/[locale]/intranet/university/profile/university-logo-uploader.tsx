'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { getDisplayInitial } from '@/lib/frontend/contracts';
import { resolveMediaUrl } from '@/lib/frontend/business';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const IS_DEV = process.env.NODE_ENV === 'development';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Props {
  currentLogoUrl: string | null | undefined;
  universityName: string;
  onUploaded: (newLogoUrl: string) => void;
  editing: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UniversityLogoUploader({
  currentLogoUrl,
  universityName,
  onUploaded,
  editing,
}: Props) {
  const t = useTranslations('intranet');
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const logoLetter = getDisplayInitial(universityName, 'U');
  const displayUrl = preview ?? resolveMediaUrl(currentLogoUrl, API_BASE);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return t('university.profile.logo.invalidType');
      }
      if (file.size > MAX_SIZE_BYTES) {
        return t('university.profile.logo.tooLarge', { max: MAX_SIZE_MB });
      }
      return null;
    },
    [t],
  );

  const selectFile = useCallback(
    (file: File | null) => {
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setErrorMsg(error);
        setStatus('error');
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      setErrorMsg(null);
      setStatus('idle');
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [validateFile],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      selectFile(event.target.files?.[0] ?? null);
    },
    [selectFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      selectFile(event.dataTransfer.files?.[0] ?? null);
    },
    [selectFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);

      const response = await fetch(`${API_BASE}/api/universities/me/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = body?.message ?? body?.error ?? t('university.profile.logo.uploadError');
        throw new Error(typeof message === 'string' ? message : t('university.profile.logo.uploadError'));
      }

      const rawUrl =
        body?.data?.logoUrl ??
        body?.logoUrl ??
        body?.logo_url ??
        body?.url ??
        null;

      if (!rawUrl) {
        throw new Error(t('university.profile.logo.uploadError'));
      }

      const resolved = resolveMediaUrl(rawUrl, API_BASE) ?? rawUrl;
      const cacheBusted = `${resolved}${resolved.includes('?') ? '&' : '?'}t=${Date.now()}`;

      setStatus('success');
      setSelectedFile(null);
      setPreview(cacheBusted);
      onUploaded(rawUrl);

      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      if (IS_DEV) console.error('[UniversityLogoUploader] upload error', error);
      setStatus('error');
      setErrorMsg(error instanceof Error ? error.message : t('university.profile.logo.uploadError'));
    }
  }, [onUploaded, selectedFile, t]);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setStatus('idle');
    setErrorMsg(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  return (
    <div className="space-y-3">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {t('university.profile.logo.label')}
      </label>

      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50">
          {displayUrl ? (
            <img
              key={displayUrl}
              src={displayUrl}
              alt={universityName}
              className="h-full w-full object-cover"
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <PhotoIcon className="h-8 w-8" />
              <span className="mt-0.5 text-lg font-bold">{logoLetter}</span>
            </div>
          )}
        </div>

        {editing && (
          <div className="flex-1 space-y-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-center transition-colors hover:border-green-400 hover:bg-green-50/30"
            >
              <ArrowUpTrayIcon className="mx-auto mb-1 h-6 w-6 text-gray-400" />
              <p className="text-xs text-gray-500">{t('university.profile.logo.dragOrSelect')}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">
                {t('university.profile.logo.formats', { max: MAX_SIZE_MB })}
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFile && status !== 'success' && (
              <div className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-gray-600">
                  {selectedFile.name}{' '}
                  <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </span>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={status === 'uploading'}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {status === 'uploading' ? (
                    <>
                      <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                      {t('university.profile.logo.uploading')}
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                      {t('university.profile.logo.upload')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={status === 'uploading'}
                  className="p-1.5 text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                  title={t('university.profile.cancel')}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                <CheckIcon className="h-3.5 w-3.5" />
                {t('university.profile.logo.uploadSuccess')}
              </div>
            )}

            {status === 'error' && errorMsg && (
              <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <ExclamationCircleIcon className="h-3.5 w-3.5" />
                {errorMsg}
              </div>
            )}

            {currentLogoUrl && !selectedFile && status === 'idle' && (
              <p className="text-[10px] text-gray-400">{t('university.profile.logo.changeHint')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
