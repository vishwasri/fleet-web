'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Car,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  KeyRound,
  Ban,
  PlayCircle,
  Edit,
  Phone,
  Mail,
  MapPin,
  Globe,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { SuperAdminCompany, OrganizationStatus, SubscriptionPlan, UpdateCompanyInput } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<SuperAdminCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUOTAS' | 'OWNER'>('OVERVIEW');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('NewPass2026!Secure');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateCompanyInput>({});

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperAdminCompanyById(companyId);
      if (data) {
        setCompany(data);
        setEditForm({
          displayName: data.displayName,
          legalName: data.legalName,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          address: data.address,
          currency: data.currency,
          timezone: data.timezone,
          status: data.status,
          subscriptionPlan: data.subscriptionPlan,
          maxVehicles: data.maxVehicles,
          maxMembers: data.maxMembers,
          businessRegNumber: data.businessRegNumber,
          taxId: data.taxId,
        });
      }
    } catch (err) {
      console.error('Failed to load company:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const handleToggleStatus = async () => {
    if (!company) return;
    const nextStatus: OrganizationStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.setCompanyStatus(company.id, nextStatus);
      setStatusMessage(`Company operational status updated to ${nextStatus}.`);
      loadCompany();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      await api.updateCompany(company.id, editForm);
      setStatusMessage('Company settings & quotas successfully updated.');
      setShowEditModal(false);
      loadCompany();
    } catch (err) {
      console.error('Failed to update company:', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      const res = await api.resetCompanyOwnerPassword(company.id, newPassword);
      setStatusMessage(`Password successfully reset for ${res.ownerEmail}. New Password: ${newPassword}`);
      setShowPasswordModal(false);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  if (isLoading && !company) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="py-20 text-center text-on-surface-variant space-y-3">
        <p className="text-sm font-bold text-on-surface">Company not found</p>
        <Link href="/super-admin/companies" className="inline-block text-xs text-secondary hover:underline">
          ← Return to Directory
        </Link>
      </div>
    );
  }

  const percent = company.usage?.vehicleCapacityPercent || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/super-admin/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Companies Directory</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Edit className="w-3.5 h-3.5 text-secondary" />
            <span>Edit Plan & Quotas</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Owner Credentials</span>
          </Button>

          <Button
            variant={company.status === 'ACTIVE' ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleToggleStatus}
          >
            {company.status === 'ACTIVE' ? (
              <>
                <Ban className="w-3.5 h-3.5 text-white" />
                <span>Suspend Tenant</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5 text-secondary-container" />
                <span>Activate Tenant</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Company Header Card */}
      <Card className="p-6 sm:p-8 bg-white border border-surface-container space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-container">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shrink-0">
              {company.displayName.substring(0, 2)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-on-surface">{company.displayName}</h1>
                {company.status === 'ACTIVE' && (
                  <Badge variant="success" size="sm">
                    Active Tenant
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
              </div>

              <p className="text-xs text-on-surface-variant">{company.legalName}</p>
              <p className="text-xs font-mono text-secondary flex items-center gap-1.5 pt-0.5">
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <span>https://{company.slug || 'depot'}.rent.verssaro.com</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Plan</p>
              <p className="text-sm font-extrabold text-secondary">{company.subscriptionPlan}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Total Bookings</p>
              <p className="text-sm font-extrabold text-on-surface">{company.usage?.bookingCount ?? 0}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-container text-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Base Currency</p>
              <p className="text-sm font-extrabold text-secondary">{company.currency}</p>
            </div>
          </div>
        </div>

        {/* Quota Telemetry Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <Car className="w-4 h-4 text-secondary" />
                <span>Vehicle Fleet Capacity Limit</span>
              </span>
              <span className="font-mono text-on-surface">
                {company.usage?.vehicleCount || 0} / {company.maxVehicles} vehicles ({percent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent > 85 ? 'bg-error' : percent > 60 ? 'bg-amber-500' : 'bg-secondary'
                }`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Attempting to create vehicles past this ceiling requires tier upgrade.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <Users className="w-4 h-4 text-secondary" />
                <span>Staff & Dispatcher Accounts</span>
              </span>
              <span className="font-mono text-on-surface">
                {company.usage?.memberCount || 1} / {company.maxMembers} seats
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(((company.usage?.memberCount || 1) / company.maxMembers) * 100),
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Active staff members with dispatch, inspection, or admin access.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        {[
          { id: 'OVERVIEW', label: 'Company Overview' },
          { id: 'QUOTAS', label: 'SaaS Plan & Limits' },
          { id: 'OWNER', label: 'Primary Owner Account' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border border-surface-container space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Operational Contact Profile
            </h3>
            <div className="space-y-3 text-xs divide-y divide-surface-container">
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-outline" />
                  <span>Support Email:</span>
                </span>
                <span className="text-on-surface font-mono">{company.email}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-outline" />
                  <span>Operating Phone:</span>
                </span>
                <span className="text-on-surface font-mono">{company.phone}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-outline" />
                  <span>Physical Address:</span>
                </span>
                <span className="text-on-surface text-right max-w-[220px]">
                  {company.address || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Timezone:</span>
                <span className="text-on-surface font-semibold">{company.timezone}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-surface-container space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Statutory & Tax Records
            </h3>
            <div className="space-y-3 text-xs divide-y divide-surface-container">
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Business Registration No:</span>
                <span className="text-on-surface font-mono">
                  {company.businessRegNumber || 'Pending Filing'}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Tax Identification (TIN):</span>
                <span className="text-on-surface font-mono">{company.taxId || 'Not registered'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Onboarding Date:</span>
                <span className="text-on-surface">{new Date(company.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Tenant UUID:</span>
                <span className="text-outline font-mono text-[10px] truncate max-w-[180px]">
                  {company.id}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Quotas */}
      {activeTab === 'QUOTAS' && (
        <Card className="p-6 bg-white border border-surface-container space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">SaaS Subscription & Resource Quotas</h3>
              <p className="text-xs text-on-surface-variant">
                Governed automatically by the FleetLink multi-tenant backend engine
              </p>
            </div>
            <Button size="sm" onClick={() => setShowEditModal(true)}>
              Modify Plan Limits
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">License Tier</p>
              <p className="text-xl font-extrabold text-secondary">{company.subscriptionPlan}</p>
              <p className="text-[11px] text-on-surface-variant">Billing: {company.billingCycle}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Max Fleet Allowance</p>
              <p className="text-xl font-extrabold text-on-surface">{company.maxVehicles} Vehicles</p>
              <p className="text-[11px] text-secondary font-bold">
                Currently using {company.usage?.vehicleCount || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Max Staff Seats</p>
              <p className="text-xl font-extrabold text-on-surface">{company.maxMembers} Accounts</p>
              <p className="text-[11px] text-on-surface-variant">
                Currently using {company.usage?.memberCount || 1}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: Owner */}
      {activeTab === 'OWNER' && (
        <Card className="p-6 bg-white border border-surface-container space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">Company Owner Administrator</h3>
              <p className="text-xs text-on-surface-variant">
                Primary managerial contact responsible for billing, fleet dispatch, and company settings
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset Password</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold">Owner Name</p>
              <p className="text-base font-extrabold text-on-surface">
                {company.owner?.firstName} {company.owner?.lastName}
              </p>
              <Badge variant="secondary" size="sm">
                ROLE: OWNER
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold">Sign-in Email</p>
              <p className="text-base font-mono font-bold text-on-surface">
                {company.owner?.email || company.email}
              </p>
              <p className="text-on-surface-variant text-[11px]">{company.phone}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Company Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Company Plan & Quotas"
        description={`Adjust subscription plan, vehicle limits, and statutory details for ${company.displayName}.`}
      >
        <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Display Name</label>
              <input
                type="text"
                value={editForm.displayName || ''}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Subdomain Slug</label>
              <input
                type="text"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface font-mono border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Subscription Tier</label>
              <select
                value={editForm.subscriptionPlan}
                onChange={(e) =>
                  setEditForm({ ...editForm, subscriptionPlan: e.target.value as SubscriptionPlan })
                }
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="FREE_TRIAL">Free Trial</option>
                <option value="STARTER">Starter ($49/mo)</option>
                <option value="PRO">Pro ($149/mo)</option>
                <option value="ENTERPRISE">Enterprise ($399/mo)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Tenant Status</label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value as OrganizationStatus })
                }
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING_SETUP">Pending Setup</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Max Vehicles Quota Limit</label>
              <input
                type="number"
                min={1}
                value={editForm.maxVehicles || 20}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxVehicles: parseInt(e.target.value) || 1 })
                }
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Max Staff Seats Quota</label>
              <input
                type="number"
                min={1}
                value={editForm.maxMembers || 5}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxMembers: parseInt(e.target.value) || 1 })
                }
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Reset Owner Password"
        description={`Provide a new login password for the company administrator account (${company.owner?.email || company.email}).`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">
              New Password (Min 8 Characters)
            </label>
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
            <Button type="button" variant="outline" size="sm" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Update Credentials
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
