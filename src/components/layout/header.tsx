'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  CheckCheck,
  LogOut,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { NotificationItem } from '@/types';

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, activeOrg, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (activeOrg) {
      api.getNotifications().then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
      }).catch(() => {
        setNotifications([]);
      });
    }
  }, [activeOrg]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
    } catch {}
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

      {/* Right side: Notifications + User Profile */}
      <div className="flex items-center gap-3">
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
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant text-xs">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
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
                  ))
                )}
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

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 py-1 pr-1.5 rounded-xl hover:bg-surface-container transition-colors border-l border-surface-container text-left"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {user?.role || (user?.accountType === 'PLATFORM_ADMIN' ? 'SUPER ADMIN' : 'OWNER')}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden xl:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-surface-container shadow-2xl p-2.5 z-40">
              <div className="p-2 border-b border-surface-container mb-1.5">
                <p className="text-xs font-bold text-on-surface">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-[11px] text-secondary font-mono mt-0.5">
                    {user.phone}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold">
                    {user?.accountType || 'BUSINESS_USER'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-semibold truncate max-w-[120px]">
                    {activeOrg?.displayName || 'Workspace'}
                  </span>
                </div>
              </div>

              {user?.accountType === 'PLATFORM_ADMIN' && (
                <Link
                  href="/super-admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>Super Admin Portal</span>
                </Link>
              )}

              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                <Settings className="w-4 h-4 text-on-surface-variant" />
                <span>Account Settings</span>
              </Link>

              <div className="border-t border-surface-container mt-1.5 pt-1.5">
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-error hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
