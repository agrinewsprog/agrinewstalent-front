'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { User } from '@/types';
import { buildPublicHomeHref } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) return raw;
  return `${API}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

interface SidebarProps {
  user: User;
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

export function Sidebar({ user, navigation }: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const avatarSrc = buildAvatarUrl(user.avatarUrl ?? user.avatar ?? null);

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-200">
        <Link href={buildPublicHomeHref(locale)}>
          <img src="/logo.png" alt="AgriNews Talent" className="h-10 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name ?? 'Avatar'}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-semibold text-sm">
                  {(user.firstName ?? user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Nombre + email */}
          <div className="flex-1 min-w-0">
            {(user.firstName ?? user.name) && (
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.firstName
                  ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
                  : user.name}
              </p>
            )}
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
