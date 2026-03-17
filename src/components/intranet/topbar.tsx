'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/src/components/ui/button';
import { LanguageSwitcher } from '@/src/components/ui/language-switcher';
import { User } from '@/src/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) return raw;
  return `${API}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

interface TopbarProps {
  user?: User;
  navigation?: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
  /** @deprecated locale is resolved internally via useLocale() */
  locale?: string;
}

export function Topbar({ user, navigation }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('intranet');
  const avatarSrc = user ? buildAvatarUrl(user.avatarUrl ?? user.avatar ?? null) : null;

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0 mr-6">
          <img src="/logo.png" alt="AgriNews Talent" className="h-9 w-auto" />
        </Link>

        {/* Navigation */}
        {navigation && navigation.length > 0 && (
          <nav className="flex items-center space-x-1 flex-1 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side: language switcher + user + logout */}
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <LanguageSwitcher />

          {user && (
            <div className="flex items-center gap-2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user.name ?? 'Avatar'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-semibold text-xs">
                    {(user.firstName ?? user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-700 font-medium hidden md:block">
                {user.firstName
                  ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
                  : (user.name ?? user.email)}
              </span>
            </div>
          )}

          <Button onClick={handleLogout} variant="outline" size="sm">
            {t('signOut')}
          </Button>
        </div>
      </div>
    </div>
  );
}
