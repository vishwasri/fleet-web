'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Customer } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function CustomersCRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalIdNumber: '',
    drivingLicenseNumber: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getCustomers();
        setCustomers(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createCustomer(form);
    setCustomers([created, ...customers]);
    setIsModalOpen(false);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      nationalIdNumber: '',
      drivingLicenseNumber: '',
      address: '',
      notes: '',
    });
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nationalIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.drivingLicenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Customers CRM Directory</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Private client directory, identity KYC verification, rental agreements history, and balance due
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 text-secondary-container" />
          <span>Add New Customer</span>
        </Button>
      </div>

      {/* Strict Privacy Shield Banner */}
      <Card className="bg-teal-50/70 border-teal-200 p-4">
        <div className="flex items-start gap-2.5 text-xs text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <span>B2B Data Shielding Active: Customer identities in this directory are private to your organization and never exposed to partner fleets.</span>
        </div>
      </Card>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-surface-container flex items-center shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, NIC, or driving license..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading CRM directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5 border border-surface-container flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                      {c.fullName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-on-surface">{c.fullName}</h3>
                      <p className="text-[11px] text-on-surface-variant">{c.email}</p>
                    </div>
                  </div>
                  <Badge variant={c.isVerified ? 'success' : 'warning'} size="sm">
                    {c.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Phone:</span>
                    <span className="font-bold text-on-surface">{c.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">NIC / ID:</span>
                    <span className="font-mono font-bold text-on-surface">{c.nationalIdNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Driving License:</span>
                    <span className="font-mono font-bold text-on-surface">{c.drivingLicenseNumber}</span>
                  </div>
                  {c.balanceDue > 0 && (
                    <div className="flex items-center justify-between text-rose-600 font-bold pt-1">
                      <span>Outstanding Balance:</span>
                      <span>{formatCurrency(c.balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {c.totalRentalsCount} Completed Bookings
                </span>
                <span className="text-secondary font-bold">Client History →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Customer to CRM"
        description="Verify driver license and national identity details"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kasun Silva"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="customer@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Phone</label>
              <input
                type="tel"
                required
                placeholder="+1 415 555 0199"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">National ID / NIC</label>
              <input
                type="text"
                required
                placeholder="e.g. 917820192V"
                value={form.nationalIdNumber}
                onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Driving License Number</label>
              <input
                type="text"
                required
                placeholder="e.g. B82910291"
                value={form.drivingLicenseNumber}
                onChange={(e) => setForm({ ...form, drivingLicenseNumber: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Residential Address</label>
            <input
              type="text"
              placeholder="e.g. 100 Main St, San Francisco, CA"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Customer to CRM</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
