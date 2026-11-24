'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  DollarSign,
  ShieldCheck,
  Users,
  LogOut,
  Save,
  CheckCircle,
  Clock,
  Car,
  FileText,
  AlertTriangle,
  Globe,
  MapPin,
  Mail,
  Phone,
  Layers,
  UserPlus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api/client';
import { OrganizationDetailed, OrganizationMemberItem, OrgRole } from '@/types';

type SettingsTab = 'profile' | 'rates' | 'compliance' | 'subscription' | 'team' | 'hubs';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [org, setOrg] = useState<OrganizationDetailed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invite Member Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'STAFF' as OrgRole,
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  // Load Organization Data on Mount
  const loadOrganization = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getCurrentOrganization();
      setOrg(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  // Handle Form Change Helper
  const updateOrgField = (field: keyof OrganizationDetailed, value: any) => {
    if (!org) return;
    setOrg({ ...org, [field]: value });
  };

  const updateSettingsField = (field: string, value: any) => {
    if (!org) return;
    setOrg({
      ...org,
      settings: {
        ...(org.settings || {}),
        [field]: value,
      },
    });
  };

  // Save Organization and Settings
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!org) return;

    setSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const payload: Partial<OrganizationDetailed> = {
        displayName: org.displayName,
        legalName: org.legalName,
        email: org.email,
        phone: org.phone,
        address: org.address,
        timezone: org.timezone,
        currency: org.currency,
        businessRegNumber: org.businessRegNumber,
        taxId: org.taxId || org.taxNumber,
        description: org.description,
        acceptsOnlineBookings: org.acceptsOnlineBookings,
        marketplaceStatus: org.marketplaceStatus,
        settings: org.settings,
      };

      const updated = await api.updateOrganization(payload);
      setOrg(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  // Add Member Handler
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setErrorMessage(null);
    try {
      await api.addOrganizationMember(inviteForm);
      setIsInviteModalOpen(false);
      setInviteForm({ firstName: '', lastName: '', email: '', phone: '', role: 'STAFF' });
      await loadOrganization();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add team member');
    } finally {
      setInviteLoading(false);
    }
  };

  // Update Member Role Handler
  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      await api.updateOrganizationMemberRole(memberId, newRole);
      await loadOrganization();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update member role');
    }
  };

  // Remove Member Handler
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${memberName}?`)) return;
    try {
      await api.removeOrganizationMember(memberId);
      await loadOrganization();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove team member');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading && !org) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant">Loading organization details...</p>
      </div>
    );
  }

  const s = org?.settings || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-extrabold shadow-sm shrink-0">
            {org?.displayName?.[0] || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
                {org?.displayName || 'Organization Settings'}
              </h1>
              <span className="flex items-center gap-1 text-[10px] bg-secondary/15 text-secondary font-extrabold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified Depot
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {org?.legalName} • {org?.email} • {org?.phone}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[10px] font-bold">
                Tier: {org?.subscriptionPlan || 'STARTER'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-medium">
                Fleet: {org?._count?.vehicles ?? 0} / {org?.maxVehicles ?? 20} vehicles
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-medium">
                Staff: {org?._count?.members ?? org?.members?.length ?? 0} / {org?.maxMembers ?? 5} seats
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                {org?.marketplaceStatus || 'PUBLISHED'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            onClick={() => handleSaveAll()}
            isLoading={saving}
            className="shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </Button>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in-0 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Organization profile, rate policies, and compliance rules updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-2.5 animate-in fade-in-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {(errorMessage.toLowerCase().includes('token') ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('unauthorized') ||
            errorMessage.toLowerCase().includes('401')) && (
            <Link
              href="/login?redirect=/settings"
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm shrink-0"
            >
              Sign In Again
            </Link>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-surface-container pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profile & Legal</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rates'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Rates & Escrow</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'compliance'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Inspection & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'team'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({org?.members?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'subscription'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plan & Quotas</span>
        </button>

        <button
          onClick={() => setActiveTab('hubs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'hubs'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Depot Hubs</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & LEGAL */}
      {activeTab === 'profile' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-on-surface">Organization Profile & Corporate Identity</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Official company details, registration credentials, and primary depot contact endpoints
            </p>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Trade Brand Name</label>
                <input
                  type="text"
                  required
                  value={org?.displayName || ''}
                  onChange={(e) => updateOrgField('displayName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Registered Legal Entity Name</label>
                <input
                  type="text"
                  required
                  value={org?.legalName || ''}
                  onChange={(e) => updateOrgField('legalName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Business Registration Number (BRN)</label>
                <input
                  type="text"
                  placeholder="PV-89210"
                  value={org?.businessRegNumber || ''}
                  onChange={(e) => updateOrgField('businessRegNumber', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Tax ID / TIN Number</label>
                <input
                  type="text"
                  placeholder="TIN-401928374"
                  value={org?.taxId || org?.taxNumber || ''}
                  onChange={(e) => {
                    updateOrgField('taxId', e.target.value);
                    updateOrgField('taxNumber', e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Official Contact Email</label>
                <input
                  type="email"
                  required
                  value={org?.email || ''}
                  onChange={(e) => updateOrgField('email', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Support & Dispatch Phone</label>
                <input
                  type="tel"
                  required
                  value={org?.phone || ''}
                  onChange={(e) => updateOrgField('phone', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Headquarters Depot Address</label>
              <input
                type="text"
                value={org?.address || ''}
                onChange={(e) => updateOrgField('address', e.target.value)}
                placeholder="100 Galle Road, Colombo 03, Sri Lanka"
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Depot Currency</label>
                <select
                  value={org?.currency || 'LKR'}
                  onChange={(e) => {
                    updateOrgField('currency', e.target.value);
                    updateSettingsField('currency', e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="LKR">LKR - Sri Lankan Rupee (Rs)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Operational Timezone</label>
                <select
                  value={org?.timezone || 'UTC+5:30'}
                  onChange={(e) => {
                    updateOrgField('timezone', e.target.value);
                    updateSettingsField('timezone', e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="UTC+5:30">Asia/Colombo (UTC+05:30)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+08:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Marketplace Visibility</label>
                <select
                  value={org?.marketplaceStatus || 'PUBLISHED'}
                  onChange={(e) => updateOrgField('marketplaceStatus', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="PUBLISHED">Published (B2B Partner Network Active)</option>
                  <option value="PRIVATE">Private (Internal Fleet Only)</option>
                  <option value="UNLISTED">Unlisted (Direct Link Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Company Description & Depot Bio</label>
              <textarea
                rows={3}
                value={org?.description || ''}
                onChange={(e) => updateOrgField('description', e.target.value)}
                placeholder="Briefly describe your fleet specializations, executive chauffeur options, airport services, etc."
                className="w-full p-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-surface-container">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={org?.acceptsOnlineBookings ?? false}
                  onChange={(e) => updateOrgField('acceptsOnlineBookings', e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                />
                <span className="font-bold text-on-surface">Accept instant digital bookings from B2B partner network</span>
              </label>

              <Button type="submit" isLoading={saving}>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: RATES, MILEAGE & ESCROW */}
      {activeTab === 'rates' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-on-surface">Standard Rates, Mileage Quotas & Security Escrow</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Default billing rules applied when drafting customer rental agreements and calculating overages
            </p>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Daily Mileage Allocation (km/day)</label>
                <input
                  type="number"
                  value={s.defaultMileageLimitPerDay ?? 250}
                  onChange={(e) => updateSettingsField('defaultMileageLimitPerDay', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Default mileage included per rental day (e.g. 250 km)</span>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Excess Mileage Surcharge ({org?.currency || 'LKR'}/km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={s.defaultExtraMileageRate ?? 100}
                  onChange={(e) => updateSettingsField('defaultExtraMileageRate', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Rate charged per kilometer exceeding the daily cap</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Default Caution Deposit ({org?.currency || 'LKR'})
                </label>
                <input
                  type="number"
                  value={s.defaultDepositValue ?? 25000}
                  onChange={(e) => updateSettingsField('defaultDepositValue', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Security bond held in escrow until vehicle return check</span>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Deposit Assessment Type</label>
                <select
                  value={s.defaultDepositType || 'FIXED'}
                  onChange={(e) => updateSettingsField('defaultDepositType', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="FIXED">Fixed Amount (e.g. Rs. 25,000 / $300)</option>
                  <option value="PERCENTAGE">Percentage of Total Booking Value</option>
                </select>
                <span className="text-[10px] text-on-surface-variant">How security deposit is computed on booking creation</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Late Return Grace Period (minutes)</label>
                <input
                  type="number"
                  value={s.lateReturnGracePeriodMinutes ?? 60}
                  onChange={(e) => updateSettingsField('lateReturnGracePeriodMinutes', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Time allowed past drop-off time before late fee applies</span>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Late Return Hourly Rate ({org?.currency || 'LKR'}/hr)
                </label>
                <input
                  type="number"
                  value={s.defaultLateReturnRate ?? 1500}
                  onChange={(e) => updateSettingsField('defaultLateReturnRate', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Penalty charged for each hour delayed beyond grace period</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-container">
              <div>
                <label className="block font-bold text-on-surface mb-1">Statutory Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={s.defaultTaxRate ?? 0}
                  onChange={(e) => updateSettingsField('defaultTaxRate', Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">Government VAT/SSCL percentage applied on invoices</span>
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={s.taxInclusive ?? false}
                    onChange={(e) => updateSettingsField('taxInclusive', e.target.checked)}
                    className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Tax-Inclusive Rental Display</span>
                    <span className="text-[10px] text-on-surface-variant block">Vehicle daily rate already includes taxes</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={saving}>
                <Save className="w-4 h-4" />
                <span>Save Rate Policies</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: COMPLIANCE & INSPECTION RULES */}
      {activeTab === 'compliance' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-on-surface">Inspection Protocols & Risk Compliance</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Automated safeguards enforcing walk-around condition logs and preventing dispatch of non-compliant vehicles
            </p>
          </div>

          <form onSubmit={handleSaveAll} className="space-y-5 text-xs">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Inspection Mandates</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-2xl bg-surface border border-surface-container flex items-start gap-3 cursor-pointer hover:bg-surface-container/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={s.requireInspectionOnPickup ?? true}
                    onChange={(e) => updateSettingsField('requireInspectionOnPickup', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Mandatory Handover Inspection</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Requires vehicle photos, odometer confirmation, and fuel level log before key release.
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl bg-surface border border-surface-container flex items-start gap-3 cursor-pointer hover:bg-surface-container/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={s.requireInspectionOnReturn ?? true}
                    onChange={(e) => updateSettingsField('requireInspectionOnReturn', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Mandatory Drop-off Check</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Requires damage scan and return checklist before releasing customer deposit.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-surface-container">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Automated Dispatch Gates</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-2xl bg-surface border border-surface-container flex items-start gap-3 cursor-pointer hover:bg-surface-container/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={s.blockBookingsForExpiredInsurance ?? true}
                    onChange={(e) => updateSettingsField('blockBookingsForExpiredInsurance', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Block on Expired Insurance</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Prevents vehicle assignment and dispatches if insurance certificate has lapsed.
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl bg-surface border border-surface-container flex items-start gap-3 cursor-pointer hover:bg-surface-container/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={s.blockBookingsForExpiredRegistration ?? true}
                    onChange={(e) => updateSettingsField('blockBookingsForExpiredRegistration', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block">Block on Expired Revenue License</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Restricts vehicle dispatch if annual revenue registration is overdue.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Document Expiry Advance Alert Horizon (days)
                </label>
                <input
                  type="number"
                  value={s.documentExpiryAlertDays ?? 30}
                  onChange={(e) => updateSettingsField('documentExpiryAlertDays', Number(e.target.value))}
                  className="w-full sm:w-64 h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant block mt-1">
                  Triggers dashboard warnings this many days before insurance or registration expires
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-surface-container">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Standard Rental Agreement Terms</h3>
              <div>
                <textarea
                  rows={4}
                  value={s.defaultRentalAgreementText || ''}
                  onChange={(e) => updateSettingsField('defaultRentalAgreementText', e.target.value)}
                  placeholder="Paste your standard terms and conditions, fuel policies, and insurance deductible clauses..."
                  className="w-full p-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={saving}>
                <Save className="w-4 h-4" />
                <span>Save Compliance Rules</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 4: STAFF DIRECTORY */}
      {activeTab === 'team' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-on-surface">Team Directory & Role-Based Permissions</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Staff members authorized to operate this organization workspace
              </p>
            </div>

            <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </Button>
          </div>

          <div className="divide-y divide-surface-container">
            {org?.members && org.members.length > 0 ? (
              org.members.map((m) => (
                <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {m.user?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-on-surface">
                          {m.user?.firstName} {m.user?.lastName}
                        </p>
                        {m.userId === user?.id && (
                          <span className="text-[9px] bg-secondary/15 text-secondary px-1.5 py-0.2 rounded font-extrabold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{m.user?.email}</p>
                      {m.user?.phone && (
                        <p className="text-[10px] text-secondary font-mono mt-0.5">📱 {m.user.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={m.role}
                      disabled={m.role === 'OWNER' && user?.id !== m.userId}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as OrgRole)}
                      className="h-8 px-2.5 rounded-xl bg-surface border border-surface-container text-xs font-bold text-on-surface focus:outline-none focus:border-secondary"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="DISPATCHER">DISPATCHER</option>
                      <option value="INSPECTOR">INSPECTOR</option>
                      <option value="STAFF">STAFF</option>
                    </select>

                    {m.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(m.id, `${m.user?.firstName} ${m.user?.lastName}`)}
                        className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-rose-50 transition-colors"
                        title="Remove member access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-xs text-center text-on-surface-variant">No members found.</p>
            )}
          </div>
        </Card>
      )}

      {/* TAB 5: PLAN & QUOTAS */}
      {activeTab === 'subscription' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-on-surface">SaaS Subscription & Resource Quotas</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Current enterprise tenant tier and cloud resource limits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Subscription Tier</span>
              <p className="text-xl font-extrabold text-primary">{org?.subscriptionPlan || 'STARTER'}</p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                {org?.status || 'ACTIVE'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Billing Cadence</span>
              <p className="text-xl font-extrabold text-on-surface">{org?.billingCycle || 'MONTHLY'}</p>
              <p className="text-[10px] text-on-surface-variant">Renews automatically via Stripe Escrow</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-container space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Depot Currency</span>
              <p className="text-xl font-extrabold text-secondary">{org?.currency || 'LKR'}</p>
              <p className="text-[10px] text-on-surface-variant">System-wide settlement currency</p>
            </div>
          </div>

          {/* Quota Progress Meters */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface">Fleet Capacity Quota</span>
                <span className="text-secondary">
                  {org?._count?.vehicles ?? 0} / {org?.maxVehicles ?? 20} Vehicles Allocated
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((org?._count?.vehicles ?? 0) / (org?.maxVehicles ?? 20)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface">Staff Seat Allocation</span>
                <span className="text-secondary">
                  {org?._count?.members ?? org?.members?.length ?? 0} / {org?.maxMembers ?? 5} Seats Filled
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (((org?._count?.members ?? org?.members?.length ?? 0) / (org?.maxMembers ?? 5)) * 100)
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: DEPOT HUBS */}
      {activeTab === 'hubs' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-on-surface">Operational Depot Hubs & Branch Stations</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pickup, return, and maintenance yards managed by this organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {org?.branchLocations && org.branchLocations.length > 0 ? (
              org.branchLocations.map((hub) => (
                <div
                  key={hub.id}
                  className="p-4 rounded-2xl bg-surface border border-surface-container hover:border-secondary transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{hub.name}</p>
                        {hub.isPrimary && (
                          <span className="text-[9px] bg-secondary/15 text-secondary px-1.5 py-0.2 rounded font-extrabold">
                            Primary HQ Hub
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2">{hub.address}</p>
                  {hub.phone && <p className="text-[10px] text-secondary font-mono mt-1">📞 {hub.phone}</p>}
                </div>
              ))
            ) : (
              <div className="col-span-2 p-4 rounded-2xl bg-surface border border-surface-container">
                <p className="text-xs font-bold text-on-surface">{org?.displayName} Central Hub</p>
                <p className="text-[11px] text-on-surface-variant mt-1">{org?.address}</p>
                <p className="text-[10px] text-secondary font-mono mt-1">📞 {org?.phone}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-surface-container shadow-2xl relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-2">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Invite Team Member</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Grant staff access to manage vehicles, inspections, or partner orders
              </p>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@apexrentals.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Mobile Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="077 123 4567"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Assigned Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as OrgRole })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                >
                  <option value="STAFF">STAFF - Counter operations & bookings</option>
                  <option value="INSPECTOR">INSPECTOR - Digital condition logs & returns</option>
                  <option value="DISPATCHER">DISPATCHER - Fleet movements & transfers</option>
                  <option value="MANAGER">MANAGER - Rates, finances & partner orders</option>
                  <option value="ADMIN">ADMIN - Full administrative access</option>
                </select>
              </div>

              <Button type="submit" isLoading={inviteLoading} className="w-full h-11 font-bold mt-2">
                <span>Send Team Invitation</span>
                <UserPlus className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
