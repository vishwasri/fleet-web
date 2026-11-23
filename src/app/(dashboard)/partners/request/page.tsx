'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Handshake,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RequestPartnerVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'Luxury SUV',
    preferredModel: 'BMW X5 or Mercedes GLE',
    startDate: '2026-11-26T10:00',
    endDate: '2026-11-30T18:00',
    deliveryHub: 'Downtown Depot',
    targetMaxWholesaleDailyRate: 130,
    notes: 'Required for corporate VIP delegation. Black or deep navy preferred.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPartnerRequest({
        category: form.category,
        preferredModel: form.preferredModel,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        deliveryHub: form.deliveryHub,
        targetMaxWholesaleDailyRate: Number(form.targetMaxWholesaleDailyRate),
        notes: form.notes,
      });
      router.push('/partners');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-surface-container text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Source Partner Vehicle</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Broadcast sourcing requirements across verified regional fleet partners
          </p>
        </div>
      </div>

      <Card className="bg-teal-50/70 border-teal-200 p-4">
        <div className="flex items-start gap-2.5 text-xs text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <span>Customer privacy shield is automatically enforced. Partner operators cannot view your end-customer data.</span>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Vehicle Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="Luxury SUV">Luxury SUV</option>
                <option value="Executive Sedan">Executive Sedan</option>
                <option value="Electric Vehicle">Electric Vehicle</option>
                <option value="Passenger Van">Passenger Van</option>
                <option value="Economy Sedan">Economy Sedan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Target Max Wholesale Rate ($/day)</label>
              <input
                type="number"
                required
                value={form.targetMaxWholesaleDailyRate}
                onChange={(e) => setForm({ ...form, targetMaxWholesaleDailyRate: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Preferred Model / Trim</label>
            <input
              type="text"
              placeholder="e.g. BMW X5, Mercedes E-Class"
              value={form.preferredModel}
              onChange={(e) => setForm({ ...form, preferredModel: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Required Start Date</label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Required Return Date</label>
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Delivery Depot Location</label>
            <select
              value={form.deliveryHub}
              onChange={(e) => setForm({ ...form, deliveryHub: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            >
              <option value="Downtown Depot">Downtown Depot</option>
              <option value="Airport Terminal 2">Airport Terminal 2</option>
              <option value="West Suburban Hub">West Suburban Hub</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Operational Logistics Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              <CheckCircle className="w-4 h-4" />
              <span>Broadcast Request to Network</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
