'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  KeyRound,
  Wrench,
  Handshake,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Plus,
  Calendar,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api/client';
import { DashboardSummary } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

export default function DashboardPage() {
  const { user, activeOrg } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeOrg]);

  if (isLoading || !summary) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading operational pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Good morning, {user?.firstName || 'Operator'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Operational pulse for <strong className="text-on-surface">{activeOrg?.displayName}</strong>
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/bookings/new"
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-secondary-container" />
            <span>New Booking</span>
          </Link>
          <Link
            href="/partners/request"
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-surface-container text-on-surface text-xs font-bold hover:bg-surface-container transition-all"
          >
            <Handshake className="w-4 h-4 text-secondary" />
            <span>Source Partner Car</span>
          </Link>
        </div>
      </div>

      {/* Operational Pulse Cards (4 Primary Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/vehicles?status=AVAILABLE" className="group">
          <Card hoverEffect className="p-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">Available Fleet</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">{summary.availableVehicles}</span>
              <span className="text-xs text-on-surface-variant font-medium">/ {summary.totalVehicles} total</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">Ready for dispatch</p>
          </Card>
        </Link>

        <Link href="/bookings?status=ACTIVE" className="group">
          <Card hoverEffect className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">Active Rentals</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">{summary.activeRentals}</span>
              <span className="text-xs text-on-surface-variant font-medium">on the road</span>
            </div>
            <p className="text-[11px] text-blue-600 font-bold mt-1">Customer direct</p>
          </Card>
        </Link>

        <Link href="/partners" className="group">
          <Card hoverEffect className="p-4 border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">Partner Loans</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Handshake className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">{summary.partnerLoans}</span>
              <span className="text-xs text-on-surface-variant font-medium">B2B inter-fleet</span>
            </div>
            <p className="text-[11px] text-teal-600 font-bold mt-1">Wholesale agreements</p>
          </Card>
        </Link>

        <Link href="/maintenance" className="group">
          <Card hoverEffect className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">In Maintenance</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">{summary.inMaintenance}</span>
              <span className="text-xs text-on-surface-variant font-medium">in workshop</span>
            </div>
            <p className="text-[11px] text-amber-600 font-bold mt-1">Calendar blocked</p>
          </Card>
        </Link>
      </div>

      {/* Operational Alerts Bar */}
      {summary.alerts && summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.route}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="text-xs font-bold text-amber-900">{alert.title}</span>
              </div>
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Take Action →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Two Column Layout: Schedule & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <CardTitle>Today&apos;s Dispatch Schedule</CardTitle>
                </div>
                <Badge variant="outline" size="sm">
                  {summary.todaySchedule.length} Events
                </Badge>
              </div>
            </CardHeader>

            <div className="divide-y divide-surface-container">
              {summary.todaySchedule.length === 0 ? (
                <p className="py-6 text-center text-xs text-on-surface-variant">
                  No pickups or returns scheduled for today.
                </p>
              ) : (
                summary.todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-surface-container-low rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          item.type === 'PICKUP'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.type === 'PICKUP' ? 'OUT' : 'IN'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-on-surface">{item.customerName}</p>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {item.bookingNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          {item.vehicleName} • <span className="font-medium text-secondary">{item.hub}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-on-surface">{item.time}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <Link
                        href={`/bookings`}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Fleet Utilization Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Fleet Utilization & Efficiency</CardTitle>
                <span className="text-xs font-bold text-emerald-600">
                  {summary.fleetUtilizationPercent}% active
                </span>
              </div>
            </CardHeader>
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${summary.fleetUtilizationPercent}%` }}
                  title="Active Fleet"
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${(summary.inMaintenance / summary.totalVehicles) * 100}%` }}
                  title="Maintenance Block"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>On Rental ({summary.activeRentals + summary.partnerLoans})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Maintenance ({summary.inMaintenance})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high" />
                  <span>Available ({summary.availableVehicles})</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Financial Pulse & Escrow Trust */}
        <div className="space-y-6">
          <Card className="bg-primary text-white p-5 border-none shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-secondary-container" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-container-highest">
                  Operating Ledger MTD
                </h3>
              </div>
              <Link href="/finance" className="text-[11px] font-bold text-secondary-container hover:underline">
                View Ledger →
              </Link>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-medium text-surface-container">True Net Operating Profit</p>
              <p className="text-3xl font-extrabold tracking-tight text-white mt-1">
                {formatCurrency(summary.netProfit)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <p className="text-[10px] text-surface-container">Operating Revenue</p>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(summary.monthRevenue)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-surface-container">Operating Expenses</p>
                <p className="font-bold text-rose-300 mt-0.5">
                  {formatCurrency(summary.monthExpenses)}
                </p>
              </div>
            </div>
          </Card>

          {/* Escrow Deposit Liability Segregation Notice */}
          <Card className="border-secondary/30 bg-teal-50/40">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-100 text-secondary">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-secondary">Escrow Caution Deposit Trust</h4>
                <p className="text-xl font-extrabold text-on-surface mt-1">
                  {formatCurrency(summary.escrowDepositsHeld)}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Segregated from operating turnover. Unearned deposit liabilities are strictly excluded from net profit calculations.
                </p>
                <Link
                  href="/finance/deposits"
                  className="inline-block mt-2 text-xs font-bold text-secondary hover:underline"
                >
                  Manage Held Bonds →
                </Link>
              </div>
            </div>
          </Card>

          {/* Quick Shortcuts Card */}
          <Card>
            <CardTitle className="mb-3 text-xs uppercase tracking-wider text-on-surface-variant">
              Operational Portals
            </CardTitle>
            <div className="space-y-1.5">
              <Link
                href="/vehicles"
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-secondary" />
                  <span>Fleet Inventory & Rates</span>
                </div>
                <span className="text-on-surface-variant font-normal">→</span>
              </Link>
              <Link
                href="/partners"
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Handshake className="w-4 h-4 text-secondary" />
                  <span>B2B Partner Wholesale Network</span>
                </div>
                <span className="text-on-surface-variant font-normal">→</span>
              </Link>
              <Link
                href="/reports"
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span>Executive Revenue Analytics</span>
                </div>
                <span className="text-on-surface-variant font-normal">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
