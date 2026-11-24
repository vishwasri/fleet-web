'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Car,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { CreateCompanyInput, SubscriptionPlan } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    company: any;
    owner: { email: string; name: string };
  } | null>(null);

  const [formData, setFormData] = useState<CreateCompanyInput>({
    legalName: '',
    displayName: '',
    slug: '',
    organizationEmail: '',
    organizationPhone: '',
    address: '',
    timezone: 'UTC',
    currency: 'USD',
    subscriptionPlan: 'STARTER',
    maxVehicles: 25,
    maxMembers: 5,
    businessRegNumber: '',
    taxId: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: 'Admin2026!Secure',
  });

  const handleNameChange = (displayName: string) => {
    const slug = displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    setFormData((prev) => ({
      ...prev,
      displayName,
      slug: !prev.slug || prev.slug.startsWith(displayName.substring(0, 3).toLowerCase()) ? slug : prev.slug,
    }));
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    let maxV = 25;
    let maxM = 5;
    if (plan === 'FREE_TRIAL') {
      maxV = 10;
      maxM = 2;
    } else if (plan === 'STARTER') {
      maxV = 25;
      maxM = 5;
    } else if (plan === 'PRO') {
      maxV = 75;
      maxM = 15;
    } else if (plan === 'ENTERPRISE') {
      maxV = 250;
      maxM = 50;
    }

    setFormData((prev) => ({
      ...prev,
      subscriptionPlan: plan,
      maxVehicles: maxV,
      maxMembers: maxM,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.createCompany(formData);
      setCreatedResult(res);
    } catch (err: any) {
      console.error('Failed to create company:', err);
      setError(err?.message || 'Failed to register company. Please verify input data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/super-admin/companies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Companies Directory</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Onboard New Tenant Company
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Set up a new vehicle rental business, establish tenant isolation, and provision owner credentials
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Company Profile */}
        <Card className="p-6 bg-white border border-surface-container space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
            <Building2 className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-extrabold text-on-surface uppercase tracking-wider">
              1. Company Legal & Operational Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Display Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Ceylon Wheels Holidays"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Registered Legal Entity Name *
              </label>
              <input
                type="text"
                required
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="e.g. Ceylon Wheels Private Limited"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Subdomain Slug (Unique Tenant ID) *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ceylon-wheels"
                  className="w-full h-10 px-3.5 rounded-l-xl bg-surface text-xs font-mono text-secondary border border-r-0 border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
                />
                <span className="h-10 px-3 rounded-r-xl bg-surface-container border border-outline-variant text-[11px] text-on-surface-variant font-mono flex items-center">
                  .rent.verssaro.com
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Company Support Email *
              </label>
              <input
                type="email"
                required
                value={formData.organizationEmail}
                onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
                placeholder="info@ceylonwheels.com"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Company Contact Phone *
              </label>
              <input
                type="text"
                required
                value={formData.organizationPhone}
                onChange={(e) => setFormData({ ...formData, organizationPhone: e.target.value })}
                placeholder="+94 11 234 5678"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Base Operating Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Headquarters Timezone *
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="Asia/Colombo">Asia/Colombo (UTC+05:30)</option>
                <option value="America/Los_Angeles">America/Los Angeles (PST / UTC-08:00)</option>
                <option value="America/New_York">America/New York (EST / UTC-05:00)</option>
                <option value="Europe/London">Europe/London (GMT / UTC+00:00)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST / UTC+04:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Business Registration Number (Optional)
              </label>
              <input
                type="text"
                value={formData.businessRegNumber || ''}
                onChange={(e) => setFormData({ ...formData, businessRegNumber: e.target.value })}
                placeholder="e.g. PV-0091829"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Physical Depot Address
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 124 Galle Road, Colombo 03, Sri Lanka"
              className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </Card>

        {/* SECTION 2: Initial Owner Admin User */}
        <Card className="p-6 bg-white border border-surface-container space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
            <User className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-extrabold text-on-surface uppercase tracking-wider">
              2. Primary Company Owner & Administrator Credentials
            </h2>
          </div>

          <p className="text-xs text-on-surface-variant">
            This account will be assigned the highest <code className="text-secondary font-bold">OWNER</code> role
            for this tenant with full managerial privileges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.ownerFirstName}
                onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                placeholder="Kamal"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.ownerLastName}
                onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                placeholder="Perera"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Owner Login Email *
              </label>
              <input
                type="email"
                required
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="owner@ceylonwheels.com"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Owner Phone</label>
              <input
                type="text"
                value={formData.ownerPhone || ''}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface mb-1">
                Initial Account Password * (Min 8 Characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  minLength={8}
                  value={formData.ownerPassword}
                  onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                  placeholder="Admin2026!Secure"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface text-xs font-mono text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3: SaaS Subscription Plan & Quotas */}
        <Card className="p-6 bg-white border border-surface-container space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
            <Sparkles className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-extrabold text-on-surface uppercase tracking-wider">
              3. SaaS Subscription Tier & Fleet Quotas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'FREE_TRIAL',
                name: 'Free Trial',
                price: '$0',
                term: '14 Days',
                limit: '10 Vehicles',
                members: '2 Staff Members',
              },
              {
                id: 'STARTER',
                name: 'Starter Fleet',
                price: '$49',
                term: 'per month',
                limit: '25 Vehicles',
                members: '5 Staff Members',
              },
              {
                id: 'PRO',
                name: 'Professional Hub',
                price: '$149',
                term: 'per month',
                limit: '75 Vehicles',
                members: '15 Staff Members',
              },
              {
                id: 'ENTERPRISE',
                name: 'Enterprise Fleet',
                price: '$399',
                term: 'per month',
                limit: '250+ Vehicles',
                members: '50 Staff Members',
              },
            ].map((plan) => {
              const isSelected = formData.subscriptionPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id as SubscriptionPlan)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-secondary shadow-sm'
                      : 'bg-white border-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-on-surface">{plan.name}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      readOnly
                      className="accent-secondary"
                    />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-on-surface">{plan.price}</span>
                    <span className="text-[10px] text-on-surface-variant">{plan.term}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-on-surface-variant space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-secondary" />
                      <span>{plan.limit}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-on-surface-variant" />
                      <span>{plan.members}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Custom Max Vehicles Quota
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={formData.maxVehicles}
                onChange={(e) => setFormData({ ...formData, maxVehicles: parseInt(e.target.value) || 1 })}
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Custom Max Staff Members Quota
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 1 })}
                className="w-full h-10 px-3.5 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/super-admin/companies">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <ShieldCheck className="w-4 h-4 text-secondary-container" />
            <span>{isSubmitting ? 'Registering Company...' : 'Provision Tenant Account'}</span>
          </Button>
        </div>
      </form>

      {/* Post-Creation Success Modal */}
      {createdResult && (
        <Modal
          isOpen={true}
          onClose={() => router.push('/super-admin/companies')}
          title="Company Successfully Onboarded!"
          description={`Tenant organization ${createdResult.company.displayName} has been provisioned and is ready for operational login.`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-surface-container-low border border-surface-container p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Assigned Subdomain:</span>
                <span className="font-mono text-secondary font-bold">
                  {createdResult.company.slug}.rent.verssaro.com
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Subscription Tier:</span>
                <Badge variant="secondary" size="sm">
                  {createdResult.company.subscriptionPlan}
                </Badge>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Fleet Limit:</span>
                <span className="font-bold text-on-surface">
                  {createdResult.company.maxVehicles} Vehicles Allowed
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Owner Login Email:</span>
                <span className="font-mono text-on-surface font-bold">{createdResult.owner.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Initial Password:</span>
                <span className="font-mono text-secondary font-bold">{formData.ownerPassword}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push(`/super-admin/companies/${createdResult.company.id}`)}
              >
                Inspect Company Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/super-admin/companies')}
              >
                Companies Directory
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
