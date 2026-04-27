'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import {
  buildLoginHref,
  buildPublicBlogHref,
  buildPublicHomeHref,
  buildPublicJobsHref,
  buildRegisterHref,
} from '@/lib/utils';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('common.nav');

  type NavLabelKey = 'employment' | 'companies' | 'universities' | 'blog';
  const menuItems = [
    { labelKey: 'employment', href: buildPublicJobsHref(locale) },
    { labelKey: 'companies', href: buildRegisterHref(locale, 'empresa') },
    { labelKey: 'universities', href: buildRegisterHref(locale, 'universidad') },
    { labelKey: 'blog', href: buildPublicBlogHref(locale) },
  ] satisfies Array<{ labelKey: NavLabelKey; href: string }>;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={buildPublicHomeHref(locale)} className="shrink-0">
            <img src="/logo.png" alt="AgriNews Talent" className="h-10 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-green-50 rounded-md"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={buildLoginHref(locale)}
              className="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold text-sm shadow-sm"
            >
              {t('signIn')}
            </Link>
          </div>

          {/* Mobile button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium text-sm"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-4">
              <LanguageSwitcher />
              <Link
                href={buildLoginHref(locale)}
                className="py-2.5 px-5 bg-green-600 text-white rounded-full font-semibold text-sm"
              >
                {t('signIn')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
