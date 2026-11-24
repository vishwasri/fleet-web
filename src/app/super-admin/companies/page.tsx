'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  KeyRound,
  Ban,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { SuperAdminCompany, OrganizationStatus, SubscriptionPlan } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<SuperAdminCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Quick Action Modal states
  const [activeModalCompany, setActiveModalCompany] = useState<SuperAdminCompany | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('TempPass2026!Secure');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSuperAdminCompanies({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as OrganizationStatus) : undefined,
        plan: planFilter !== 'ALL' ? (planFilter as SubscriptionPlan) : undefined,
      });
      setCompanies(res.items);
    } catch (err) {
      console.error('Failed to query companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, planFilter]);

  const handleToggleStatus = async (company: SuperAdminCompany) => {
    const nextStatus: OrganizationStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.setCompanyStatus(company.id, nextStatus);
      setActionSuccess(`Company "${company.displayName}" status set to ${nextStatus}.`);
      fetchCompanies();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCompany) return;
    try {
      const res = await api.resetCompanyOwnerPassword(activeModalCompany.id, newPassword);
      setActionSuccess(`Credentials updated for owner (${res.ownerEmail}). New password: ${newPassword}`);
      setIsPasswordModalOpen(false);
      setActiveModalCompany(null);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Tenant Companies Directory
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Browse, inspect, configure quotas, or govern company operational status
          </p>
        </div>

        <Link href="/super-admin/companies/new">
          <Button size="sm">
            <Plus className="w-4 h-4 text-secondary-container" />
            <span>Register Company</span>
          </Button>
        </Link>
      </div>

      {/* Governance Banner */}
      <Card className="bg-teal-50/70 border-teal-200 p-4">
        <div className="flex items-start gap-2.5 text-xs text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <span>
            Enterprise Governance: All tenant data, ledger records, and customer PII are strictly segmented
            by Organization UUID.
          </span>
        </div>
      </Card>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-surface-container flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, slug, or owner..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-on-surface-variant text-[11px] font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant text-xs focus:border-secondary focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_SETUP">Pending Setup</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-on-surface-variant text-[11px] font-bold uppercase">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant text-xs focus:border-secondary focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="FREE_TRIAL">Free Trial</option>
              <option value="STARTER">Starter ($49/mo)</option>
              <option value="PRO">Pro ($149/mo)</option>
              <option value="ENTERPRISE">Enterprise ($399/mo)</option>
            </select>
          </div>

          <button
            onClick={() => fetchCompanies()}
            title="Refresh list"
            className="h-10 px-3 rounded-xl bg-surface hover:bg-surface-container-high border border-surface-container text-on-surface-variant transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Companies Table */}
      <Card className="p-0 border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-wider border-b border-surface-container">
              <tr>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Subdomain Slug</th>
                <th className="py-3.5 px-4">Primary Admin</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Fleet Usage</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    No companies found matching current filters.
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const percent = company.usage?.vehicleCapacityPercent || 0;
                  return (
                    <tr key={company.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {company.displayName.substring(0, 2)}
                          </div>
                          <div>
                            <Link
                              href={`/super-admin/companies/${company.id}`}
                              className="font-extrabold text-on-surface hover:text-secondary transition-colors"
                            >
                              {company.displayName}
                            </Link>
                            <p className="text-[10px] text-on-surface-variant">{company.legalName}</p>
                            <p className="text-[10px] text-outline">
                              {company.currency} • {company.timezone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-secondary font-semibold">
                        {company.slug ? `${company.slug}` : 'no-subdomain'}
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-on-surface">
                            {company.owner?.firstName} {company.owner?.lastName}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            {company.owner?.email || company.email}
                          </p>
                          <p className="text-[10px] text-outline">{company.phone}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Badge variant="secondary" size="sm">
                            {company.subscriptionPlan}
                          </Badge>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            Max {company.maxMembers} Staff
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="w-32 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-on-surface">
                            <span>{company.usage?.vehicleCount || 0} veh</span>
                            <span className="text-on-surface-variant">{percent}% cap</span>
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
                          <p className="text-[9px] text-outline">Limit: {company.maxVehicles} vehicles</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {company.status === 'ACTIVE' && (
                          <Badge variant="success" size="sm">
                            Active
                          </Badge>
                        )}
                        {company.status === 'PENDING_SETUP' && (
                          <Badge variant="warning" size="sm">
                            Pending
                          </Badge>
                        )}
                        {company.status === 'SUSPENDED' && (
                          <Badge variant="error" size="sm">
                            Suspended
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/super-admin/companies/${company.id}`}>
                            <Button variant="outline" size="sm">
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3 text-on-surface-variant" />
                            </Button>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveModalCompany(company);
                              setIsPasswordModalOpen(true);
                            }}
                            title="Reset Owner Password"
                            className="p-1.5 rounded-lg border border-surface-container bg-surface hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(company)}
                            title={company.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              company.status === 'ACTIVE'
                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {company.status === 'ACTIVE' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <PlayCircle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reset Owner Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen && !!activeModalCompany}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setActiveModalCompany(null);
        }}
        title="Reset Owner Password"
        description={`Set a temporary password for company owner ${activeModalCompany?.owner?.email || activeModalCompany?.email}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">New Password (Min 8 Characters)</label>
            <input
              type="text"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface font-mono border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setActiveModalCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Confirm & Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
