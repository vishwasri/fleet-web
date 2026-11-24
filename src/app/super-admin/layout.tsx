'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  PlusCircle,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/auth-guard';

const adminNav = [
  { name: 'SaaS Overview', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Tenant Companies', href: '/super-admin/companies', icon: Building2 },
  { name: 'Register Company', href: '/super-admin/companies/new', icon: PlusCircle },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <AuthGuard requiredAccountTypes={['PLATFORM_ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      {/* Desktop Super Admin Sidebar */}
      <aside className="w-64 h-full flex flex-col bg-white border-r border-surface-container select-none shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-container">
          <Link href="/super-admin" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-secondary-container" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-primary flex items-center gap-1.5">
                FleetLink
                <span className="text-[10px] bg-secondary/15 text-secondary px-1.5 py-0.5 rounded-md font-extrabold tracking-wide">
                  SAAS
                </span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-secondary">
                Super Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Platform Cluster Status */}
        <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-on-surface">Cluster Active</span>
          </div>
          <span className="text-[10px] font-mono text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded-full">
            v2.4-SaaS
          </span>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2">
          <Link
            href="/super-admin/companies/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-secondary-container" />
            <span>Onboard New Tenant</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Platform Governance
          </p>
          {adminNav.map((item) => {
            const isActive =
              item.href === '/super-admin'
                ? pathname === '/super-admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
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

          <div className="pt-4 border-t border-surface-container mt-4 space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Tenant Switcher
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-secondary" />
              <span>Back to Tenant Workspace</span>
            </Link>
          </div>
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
              SA
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-on-surface truncate">
                {user?.firstName || 'Super'} {user?.lastName || 'Admin'}
              </p>
              <p className="text-[10px] font-medium text-secondary truncate">Platform Super Admin</p>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-container px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-secondary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-on-surface">SaaS Multi-Tenant Operations Engine</p>
              <p className="text-[10px] text-on-surface-variant">
                Enterprise tenant isolation, license tiers & quota enforcement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/super-admin/companies/new">
              <Button size="sm">
                <PlusCircle className="w-3.5 h-3.5 text-secondary-container" />
                <span>Add Company</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-surface-container">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-sm">
                SA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-on-surface leading-tight">
                  {user?.firstName || 'Super'} {user?.lastName || 'Admin'}
                </p>
                <p className="text-[10px] text-secondary font-semibold">Super Admin</p>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-rose-50 border border-surface-container transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 p-4 lg:p-8 bg-surface">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  </AuthGuard>
  );
}
