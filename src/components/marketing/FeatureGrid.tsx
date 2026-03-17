'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function FeatureGrid() {
  const t = useTranslations('public.features');

  const features = [
    {
      title: t('item1.title'),
      description: t('item1.description'),
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=700&q=80',
      alt: t('item1.alt'),
    },
    {
      title: t('item2.title'),
      description: t('item2.description'),
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80',
      alt: t('item2.alt'),
    },
    {
      title: t('item3.title'),
      description: t('item3.description'),
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=700&q=80',
      alt: t('item3.alt'),
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14">
          {t('title').split('agriNews Talent')[0]}
          <span className="text-green-600">agriNews Talent</span>
          {t('title').split('agriNews Talent')[1] ?? ''}
        </h2>

        {/* Filas alternantes */}
        <div className="space-y-16">
          {features.map((feature, index) => {
            const imageRight = index % 2 !== 0;
            return (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
              >
                {/* Imagen */}
                <div
                  className={`relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg ${
                    imageRight ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Texto */}
                <div className={imageRight ? 'lg:order-1' : 'lg:order-2'}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
