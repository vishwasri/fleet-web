'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Car,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { PlatformMetrics, SuperAdminCompany } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [recentCompanies, setRecentCompanies] = useState<SuperAdminCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [m, c] = await Promise.all([
          api.getSuperAdminMetrics(),
          api.getSuperAdminCompanies({ limit: 5 }),
        ]);
        setMetrics(m);
        setRecentCompanies(c.items);
      } catch (err) {
        console.error('Failed to load Super Admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const overview = metrics?.overview;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            SaaS Platform Command Deck
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Register new vehicle rental enterprises, configure quota limits, and manage multi-tenant governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/super-admin/companies/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 text-secondary-container" />
              <span>Register New Company</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Multi-Tenant Governance Card */}
      <Card className="bg-teal-50/70 border-teal-200 p-4">
        <div className="flex items-start gap-2.5 text-xs text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <span>
            Multi-Tenant Cluster Operational: Strict database-level isolation and quota limits enforced
            across all registered rental companies.
          </span>
        </div>
      </Card>

      {/* Macro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <Card className="p-5 border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Registered Companies
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center">
                <Building2 className="w-4 h-4 text-secondary-container" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">
                {overview?.totalCompanies ?? '...'}
              </span>
              <span className="text-xs text-secondary font-bold">
                {overview?.activeCompanies ?? 0} Active
              </span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 pt-3 border-t border-surface-container">
            <span className="text-rose-600 font-bold">{overview?.suspendedCompanies ?? 0}</span>{' '}
            suspended or pending setup
          </p>
        </Card>

        {/* Estimated MRR */}
        <Card className="p-5 border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Estimated Monthly MRR
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-secondary border border-teal-200 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">
                {overview ? formatCurrency(overview.estimatedMRR, 'USD') : '...'}
              </span>
              <span className="text-xs text-secondary font-bold">Recurring</span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 pt-3 border-t border-surface-container">
            Aggregated across active subscription tiers
          </p>
        </Card>

        {/* Platform Fleet Size */}
        <Card className="p-5 border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Platform Fleet Size
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">
                {overview?.totalFleetVehicles ?? '...'}
              </span>
              <span className="text-xs text-blue-700 font-bold">Vehicles</span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 pt-3 border-t border-surface-container">
            <span className="text-secondary font-bold">{overview?.fleetRented ?? 0}</span> vehicles on active hire
          </p>
        </Card>

        {/* Processed Bookings */}
        <Card className="p-5 border border-surface-container flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Processed Bookings
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">
                {overview?.totalBookings ?? '...'}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">Rentals</span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 pt-3 border-t border-surface-container">
            Direct B2C & B2B partner network
          </p>
        </Card>
      </div>

      {/* Subscription Tier Distribution Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            plan: 'FREE_TRIAL',
            title: 'Free Trial',
            desc: '14-Day MVP evaluation',
            price: '$0',
            quota: 'Up to 10 vehicles',
            badgeVariant: 'outline' as const,
            count: metrics?.plansDistribution?.FREE_TRIAL ?? 0,
          },
          {
            plan: 'STARTER',
            title: 'Starter Fleet',
            desc: 'Single depot operations',
            price: '$49/mo',
            quota: 'Up to 25 vehicles',
            badgeVariant: 'secondary' as const,
            count: metrics?.plansDistribution?.STARTER ?? 0,
          },
          {
            plan: 'PRO',
            title: 'Professional Hub',
            desc: 'Multi-branch & Partner Network',
            price: '$149/mo',
            quota: 'Up to 75 vehicles',
            badgeVariant: 'info' as const,
            count: metrics?.plansDistribution?.PRO ?? 0,
          },
          {
            plan: 'ENTERPRISE',
            title: 'Enterprise Fleet',
            desc: 'Unlimited scale & white-label',
            price: '$399/mo',
            quota: 'Unlimited fleet size',
            badgeVariant: 'default' as const,
            count: metrics?.plansDistribution?.ENTERPRISE ?? 0,
          },
        ].map((item) => (
          <Card key={item.plan} className="p-5 border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={item.badgeVariant} size="sm">
                  {item.title}
                </Badge>
                <span className="text-xl font-extrabold text-on-surface">{item.count}</span>
              </div>
              <p className="text-xs font-semibold text-on-surface">{item.desc}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{item.quota}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">{item.price}</span>
              <span className="text-[10px] text-on-surface-variant font-medium">Monthly License</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Companies Table */}
      <Card className="p-6 border border-surface-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-on-surface">Registered Tenant Companies</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Active vehicle rental businesses operating on the FleetLink platform
            </p>
          </div>
          <Link
            href="/super-admin/companies"
            className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline transition-colors"
          >
            <span>View All Companies ({metrics?.overview?.totalCompanies ?? 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-wider border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Subdomain Slug</th>
                <th className="py-3 px-4">Primary Admin</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Fleet Capacity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant font-medium">
                    No companies registered yet. Click &quot;Register New Company&quot; above to add the first tenant.
                  </td>
                </tr>
              ) : (
                recentCompanies.map((company) => {
                const percent = company.usage?.vehicleCapacityPercent || 0;
                return (
                  <tr key={company.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {company.displayName.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-extrabold text-on-surface">{company.displayName}</p>
                          <p className="text-[10px] text-on-surface-variant truncate max-w-[180px]">
                            {company.legalName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-secondary font-semibold">
                      {company.slug ? `${company.slug}` : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-on-surface">
                          {company.owner?.firstName} {company.owner?.lastName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">{company.owner?.email || company.email}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" size="sm">
                        {company.subscriptionPlan}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant">
                          <span>{company.usage?.vehicleCount || 0} veh</span>
                          <span>max {company.maxVehicles}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 85
                                ? 'bg-error'
                                : percent > 60
                                ? 'bg-amber-500'
                                : 'bg-secondary'
                            }`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {company.status === 'ACTIVE' && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                      {company.status === 'PENDING_SETUP' && (
                        <Badge variant="warning" size="sm">
                          Pending Setup
                        </Badge>
                      )}
                      {company.status === 'SUSPENDED' && (
                        <Badge variant="error" size="sm">
                          Suspended
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/super-admin/companies/${company.id}`}>
                        <Button variant="outline" size="sm">
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3 text-on-surface-variant" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
