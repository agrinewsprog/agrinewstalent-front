'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { routing } from '@/src/i18n/routing';

const localeLabels: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // pathname looks like: /en/intranet/company/dashboard
    // replace the first segment with the new locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/') || `/${newLocale}`;

    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={isPending}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            locale === loc
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          aria-label={`Switch to ${loc.toUpperCase()}`}
          aria-pressed={locale === loc}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
