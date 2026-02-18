'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/src/types';

interface SidebarProps {
  user: User;
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

export function Sidebar({ user, navigation }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-200">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AgriNews Talent
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
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
