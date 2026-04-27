'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { buildPublicBlogHref, buildRegisterHref } from '@/lib/utils';

export function Hero() {
  const locale = useLocale();
  const t = useTranslations('public.hero');

  return (
    <section className="bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              {t('headline')}
            </h1>
            <p className="text-green-100 text-base sm:text-lg mb-8 leading-relaxed">
              {t('subheadline')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={buildPublicBlogHref(locale)}
                className="px-7 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-green-700 transition-colors"
              >
                {t('ctaInfo')}
              </Link>
              <Link
                href={buildRegisterHref(locale, 'empresa')}
                className="px-7 py-3 bg-white text-green-700 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                {t('ctaPost')}
              </Link>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative h-72 lg:h-[380px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80"
              alt="Profesional empresaria"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
