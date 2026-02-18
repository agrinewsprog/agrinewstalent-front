'use client';

import { useState, useEffect } from 'react';
import { Promotion } from '@/src/types';
import Link from 'next/link';
import clsx from 'clsx';

interface PromotionsBannerProps {
  promotions: Promotion[];
  autoRotate?: boolean;
  interval?: number; // milliseconds
}

export function PromotionsBanner({
  promotions,
  autoRotate = true,
  interval = 5000,
}: PromotionsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter active promotions within date range
  const activePromotions = promotions.filter((promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.status === 'active' && now >= start && now <= end;
  });

  useEffect(() => {
    if (!autoRotate || activePromotions.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePromotions.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, interval, activePromotions.length]);

  if (activePromotions.length === 0) {
    return null;
  }

  const currentPromotion = activePromotions[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? activePromotions.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePromotions.length);
  };

  const PromotionContent = () => (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      {currentPromotion.imageUrl && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={currentPromotion.imageUrl}
            alt={currentPromotion.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {currentPromotion.title}
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-4">
            {currentPromotion.description}
          </p>
          {currentPromotion.link && (
            <Link
              href={currentPromotion.link}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Ver más
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {activePromotions.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Anterior"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Siguiente"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {activePromotions.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activePromotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={clsx(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Ir a promoción ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return <PromotionContent />;
}
