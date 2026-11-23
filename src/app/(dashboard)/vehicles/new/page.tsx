'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ArrowLeft, ArrowRight, Check, ShieldCheck, Upload } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NewVehiclePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: 2024,
    category: 'Sedan',
    licensePlate: '',
    seatingCapacity: 5,
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    currentOdometer: 15000,
    fuelLevelPercent: 100,
    dailyRate: 90,
    securityDeposit: 350,
    wholesaleRate: 70,
    locationHub: 'Downtown Depot',
    primaryImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.createVehicle(form as any);
      router.push('/vehicles');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Add New Fleet Vehicle</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Step {step} of 3: {step === 1 ? 'Basic Details' : step === 2 ? 'Technical Specs & Depot' : 'Pricing & Deposits'}
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              step >= s ? 'bg-primary' : 'bg-surface-container'
            }`}
          />
        ))}
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: Basic Vehicle Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Vehicle Identification</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota, Tesla"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Camry, Model 3"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WP-CAB-9921"
                    value={form.licensePlate}
                    onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Manufacturing Year</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="Luxury Sedan">Luxury Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Electric">Electric</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Passenger Van</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  <span>Continue to Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Specs & Depot Hub */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Technical Specs & Operational Depot</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Transmission</label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Fuel Type</label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={form.currentOdometer}
                    onChange={(e) => setForm({ ...form, currentOdometer: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Operational Depot Hub</label>
                  <select
                    value={form.locationHub}
                    onChange={(e) => setForm({ ...form, locationHub: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  >
                    <option value="Downtown Depot">Downtown Depot</option>
                    <option value="Airport Terminal 2">Airport Terminal 2</option>
                    <option value="West Suburban Hub">West Suburban Hub</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  <span>Continue to Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Pricing & Escrow Bond Terms</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Daily Direct Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Caution Deposit ($)</label>
                  <input
                    type="number"
                    required
                    value={form.securityDeposit}
                    onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">B2B Wholesale Daily Rate ($)</label>
                <input
                  type="number"
                  value={form.wholesaleRate}
                  onChange={(e) => setForm({ ...form, wholesaleRate: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  <Check className="w-4 h-4" />
                  <span>Register Vehicle to Fleet</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
