'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Handshake,
  Users,
  Wallet,
  Wrench,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils/cn';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicles Fleet', href: '/vehicles', icon: Car },
  { name: 'Rental Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'B2B Partner Network', href: '/partners', icon: Handshake },
  { name: 'Customers CRM', href: '/customers', icon: Users },
  { name: 'Finance & Ledgers', href: '/finance', icon: Wallet },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Executive Reports', href: '/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings & Org', href: '/settings', icon: Settings },
];

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { user, activeOrg, logout } = useAuth();

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-surface-container select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-surface-container">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Car className="w-5 h-5 text-secondary-container" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-primary">FleetLink</span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-secondary">
              Enterprise B2B/B2C
            </span>
          </div>
        </Link>
      </div>

      {/* Active Organization Banner */}
      <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
        <div className="truncate">
          <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Active Depot</p>
          <p className="text-xs font-bold text-on-surface truncate">{activeOrg?.displayName}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
          <ShieldCheck className="w-3 h-3" />
          <span>Active</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4 pb-2">
        <Link
          href="/bookings/new"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-secondary-container" />
          <span>New Direct Booking</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-secondary-container' : 'text-on-surface-variant'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-surface-container flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-on-surface truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] font-medium text-secondary truncate">{user?.role || 'OWNER'}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          title="Sign Out"
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
