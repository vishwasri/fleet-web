'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

export default function SettingsPage() {
  const router = useRouter();
  const { user, activeOrg, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'org' | 'pricing' | 'staff'>('org');

  const [orgForm, setOrgForm] = useState({
    displayName: activeOrg?.displayName || 'Apex Rentals Global',
    legalName: activeOrg?.legalName || 'Apex Vehicle Solutions LLC',
    email: activeOrg?.email || 'contact@apexrentals.com',
    phone: activeOrg?.phone || '+1 415 555 0199',
    address: activeOrg?.address || '100 Montgomery St, San Francisco, CA',
    taxNumber: activeOrg?.taxNumber || 'TAX-99210-CA',
    currency: '$',
  });

  const [pricingForm, setPricingForm] = useState({
    defaultIncludedKm: 250,
    excessKmFee: 0.5,
    lateReturnGraceHours: 2,
    defaultCautionDeposit: 400,
  });

  const [staff] = useState([
    { name: 'Alexander Pierce', email: 'owner@apexrentals.com', role: 'OWNER', active: true },
    { name: 'Sarah Connor', email: 'staff@apexrentals.com', role: 'MANAGER', active: true },
    { name: 'Michael Chang', email: 'michael@apexrentals.com', role: 'INSPECTOR', active: true },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">System & Organization Settings</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Depot profile, default commercial rates, escrow policies, and staff permissions
          </p>
        </div>

        <Button variant="danger" size="sm" onClick={handleLogout}>
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        <button
          onClick={() => setActiveSection('org')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'org'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Depot Organization Profile
        </button>
        <button
          onClick={() => setActiveSection('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'pricing'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Pricing & Escrow Defaults
        </button>
        <button
          onClick={() => setActiveSection('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'staff'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Team Roles & Permissions
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved and applied successfully across all depots.</span>
        </div>
      )}

      {/* SECTION 1: ORGANIZATION PROFILE */}
      {activeSection === 'org' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Trade Brand Name</label>
                <input
                  type="text"
                  required
                  value={orgForm.displayName}
                  onChange={(e) => setOrgForm({ ...orgForm, displayName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Registered Legal Entity</label>
                <input
                  type="text"
                  required
                  value={orgForm.legalName}
                  onChange={(e) => setOrgForm({ ...orgForm, legalName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Company Contact Email</label>
                <input
                  type="email"
                  required
                  value={orgForm.email}
                  onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Support Phone</label>
                <input
                  type="tel"
                  required
                  value={orgForm.phone}
                  onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Headquarters Depot Address</label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit">
                <Save className="w-4 h-4" />
                <span>Save Organization Profile</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SECTION 2: PRICING & ESCROW DEFAULTS */}
      {activeSection === 'pricing' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Default Included Mileage (km/day)</label>
                <input
                  type="number"
                  value={pricingForm.defaultIncludedKm}
                  onChange={(e) => setPricingForm({ ...pricingForm, defaultIncludedKm: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Excess Mileage Surcharge ($/km)</label>
                <input
                  type="number"
                  step="0.05"
                  value={pricingForm.excessKmFee}
                  onChange={(e) => setPricingForm({ ...pricingForm, excessKmFee: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-on-surface mb-1">Late Return Grace Period (hours)</label>
                <input
                  type="number"
                  value={pricingForm.lateReturnGraceHours}
                  onChange={(e) => setPricingForm({ ...pricingForm, lateReturnGraceHours: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Default Caution Deposit ($)</label>
                <input
                  type="number"
                  value={pricingForm.defaultCautionDeposit}
                  onChange={(e) => setPricingForm({ ...pricingForm, defaultCautionDeposit: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit">
                <Save className="w-4 h-4" />
                <span>Save Rate Policies</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SECTION 3: STAFF ROLES */}
      {activeSection === 'staff' && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Organization Team Directory</CardTitle>
              <Badge variant="outline" size="sm">Role-Based Access Control</Badge>
            </div>
          </CardHeader>

          <div className="divide-y divide-surface-container">
            {staff.map((s) => (
              <div key={s.email} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">{s.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.role === 'OWNER' ? 'default' : 'secondary'}>
                    {s.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
