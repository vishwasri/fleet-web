'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Car,
  User,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const statusTabs = [
  { label: 'All Agreements', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Overdue', value: 'OVERDUE' },
];

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getBookings();
        setBookings(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = activeTab === 'ALL' || b.status === activeTab;
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicle?.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Rental Bookings</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage customer reservations, departure handovers, payments, and returns
          </p>
        </div>

        <Link
          href="/bookings/new"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-secondary-container" />
          <span>New Direct Booking</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking #, customer, car..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Bookings List Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading rental agreements...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
          <CalendarDays className="w-12 h-12 text-outline mx-auto mb-2" />
          <h3 className="text-sm font-bold text-on-surface">No bookings found</h3>
          <p className="text-xs text-on-surface-variant mt-1">Adjust your filters or initiate a new direct booking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="group block"
            >
              <Card hoverEffect className="p-4 sm:p-5 border border-surface-container transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer & Vehicle Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary">
                      <Car className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary">
                          {b.bookingNumber}
                        </span>
                        <StatusBadge status={b.status} />
                        <Badge
                          variant={b.paymentStatus === 'PAID' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {b.paymentStatus}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-extrabold text-on-surface group-hover:text-secondary transition-colors mt-1">
                        {b.customer?.fullName || 'Customer'}
                      </h3>

                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Vehicle: <strong className="text-on-surface">{b.vehicle?.make} {b.vehicle?.model}</strong> (
                        <span className="font-mono">{b.vehicle?.licensePlate}</span>)
                      </p>
                    </div>
                  </div>

                  {/* Dates & Hub */}
                  <div className="grid grid-cols-2 gap-4 text-xs lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-surface-container">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">Schedule ({b.totalDays} days)</p>
                      <p className="font-bold text-on-surface mt-0.5">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </p>
                      <p className="text-[11px] text-secondary font-medium">Pickup: {b.pickupHub}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">Financial Summary</p>
                      <p className="text-sm font-extrabold text-on-surface mt-0.5">
                        {formatCurrency(b.grandTotal)}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {b.balanceDue > 0 ? (
                          <span className="text-rose-600 font-bold">Due: {formatCurrency(b.balanceDue)}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Fully Settled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
