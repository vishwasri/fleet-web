'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Car, Handshake, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Bookings', href: '/bookings', icon: CalendarDays },
    { label: 'Vehicles', href: '/vehicles', icon: Car },
    { label: 'Partners', href: '/partners', icon: Handshake },
    { label: 'More', href: '/settings', icon: MoreHorizontal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-container px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all',
              isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface font-medium'
            )}
          >
            <item.icon
              className={cn(
                'w-5 h-5 transition-transform',
                isActive ? 'scale-110 text-secondary' : 'text-on-surface-variant'
              )}
            />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
