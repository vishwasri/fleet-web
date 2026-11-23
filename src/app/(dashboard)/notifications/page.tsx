'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Handshake,
  Car,
  Wrench,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { NotificationItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const markAllRead = async () => {
    await api.markAllNotificationsAsRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Fleet Notifications</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Operational alerts, upcoming handovers, wholesale partner quotes, and compliance notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-surface-container rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'UNREAD' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Unread Only
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-on-surface">You are all caught up!</h3>
          <p className="text-xs text-on-surface-variant mt-1">No unread notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 border transition-all ${
                item.isRead
                  ? 'border-surface-container bg-white'
                  : 'border-secondary/40 bg-teal-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type.includes('PARTNER')
                        ? 'bg-teal-100 text-secondary'
                        : item.type.includes('PICKUP') || item.type.includes('RETURN')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.type.includes('PARTNER') ? (
                      <Handshake className="w-4 h-4" />
                    ) : item.type.includes('PICKUP') || item.type.includes('RETURN') ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <Wrench className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-on-surface">{item.title}</h3>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-outline mt-1 block">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.linkRoute && (
                    <Link
                      href={item.linkRoute}
                      onClick={() => markRead(item.id)}
                      className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
