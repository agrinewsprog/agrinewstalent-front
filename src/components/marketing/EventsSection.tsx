'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { buildPublicBlogHref } from '@/lib/utils';

const covers = [
  { src: 'https://picsum.photos/seed/evento1/300/400', alt: 'Evento 1' },
  { src: 'https://picsum.photos/seed/evento2/300/400', alt: 'Evento 2' },
  { src: 'https://picsum.photos/seed/evento3/300/400', alt: 'Evento 3' },
];

export function EventsSection() {
  const locale = useLocale();
  const t = useTranslations('public.events');

  return (
    <section className="relative bg-gray-900 overflow-hidden">
      {/* Tono verde semitransparente */}
      <div className="absolute inset-0 bg-green-900/60 mix-blend-multiply pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="text-white">
            <h2 className="text-6xl sm:text-7xl font-black italic mb-4 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-green-100 text-lg leading-relaxed mb-8">
              {t('subtitle')}
            </p>
            <Link
              href={buildPublicBlogHref(locale)}
              className="inline-flex items-center gap-2 px-7 py-3 bg-green-500 hover:bg-green-400 text-white rounded-full font-semibold transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('cta')}
            </Link>
          </div>

          {/* Portadas */}
          <div className="flex items-end gap-4 justify-center lg:justify-end">
            {covers.map((cover, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ${
                  i === 1 ? 'h-56 w-36' : 'h-44 w-28'
                }`}
                style={{ transform: i === 0 ? 'rotate(-4deg)' : i === 2 ? 'rotate(4deg)' : 'none' }}
              >
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


