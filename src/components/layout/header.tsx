'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Search,
  Building2,
  ChevronDown,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { mockNotifications } from '@/lib/data/mock-data';

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, activeOrg, organizations, switchOrganization } = useAuth();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-surface-container flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      {/* Left side: Hamburger button + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search license plate, booking #, customer..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-surface text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: Tenant Switcher + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Multi-Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-surface border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            <Building2 className="w-4 h-4 text-secondary" />
            <span className="hidden md:inline truncate max-w-[130px]">{activeOrg?.displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-surface-container shadow-xl p-2 z-40">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-3 py-1.5">
                Switch Tenant Organization
              </p>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setIsOrgDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left hover:bg-surface-container transition-colors"
                >
                  <div>
                    <p className="font-bold text-on-surface">{org.displayName}</p>
                    <p className="text-[11px] text-on-surface-variant">{org.legalName}</p>
                  </div>
                  {activeOrg?.id === org.id && <Check className="w-4 h-4 text-secondary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-surface-container shadow-2xl p-4 z-40">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-on-surface">Fleet Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-secondary hover:underline font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-surface-container max-h-72 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.linkRoute || '/notifications'}
                    onClick={() => setIsNotifOpen(false)}
                    className="block py-2.5 px-2 hover:bg-surface-container-low rounded-xl transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-on-surface">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                  </Link>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-surface-container mt-2">
                <Link
                  href="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-secondary font-bold hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-container">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-on-surface leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium">{user?.role || 'OWNER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
