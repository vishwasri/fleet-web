'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Car,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Customer, Vehicle } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

function CreateDirectBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVehId = searchParams.get('vehicleId');

  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehId || '');
  const [startDate, setStartDate] = useState('2026-11-25T09:00');
  const [endDate, setEndDate] = useState('2026-11-28T18:00');
  const [pickupHub, setPickupHub] = useState('Downtown Depot');
  const [returnHub, setReturnHub] = useState('Airport Terminal 2');
  const [advancePaid, setAdvancePaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [isAvailabilityChecking, setIsAvailabilityChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [custs, vehs] = await Promise.all([api.getCustomers(), api.getVehicles()]);
      setCustomers(custs);
      setVehicles(vehs);
      if (custs.length > 0) setSelectedCustomerId(custs[0].id);
      if (vehs.length > 0 && !preselectedVehId) setSelectedVehicleId(vehs[0].id);
    }
    load();
  }, [preselectedVehId]);

  // Backend Availability Check Guard
  useEffect(() => {
    if (!selectedVehicleId || !startDate || !endDate) return;
    let active = true;
    async function check() {
      setIsAvailabilityChecking(true);
      try {
        const available = await api.checkVehicleAvailability(selectedVehicleId, startDate, endDate);
        if (active) setIsAvailable(available);
      } finally {
        if (active) setIsAvailabilityChecking(false);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [selectedVehicleId, startDate, endDate]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Calculate rental duration in days
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const diffDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));

  const dailyRate = selectedVehicle?.dailyRate || 100;
  const rentalSubtotal = dailyRate * diffDays;
  const securityDeposit = selectedVehicle?.securityDeposit || 400;
  const grandTotal = rentalSubtotal + securityDeposit;
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const created = await api.createBooking({
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        pickupHub,
        returnHub,
        totalDays: diffDays,
        dailyRate,
        rentalSubtotal,
        securityDeposit,
        grandTotal,
        amountPaid: advancePaid,
        balanceDue,
        notes,
      });
      router.push(`/bookings/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-surface-container text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Create Direct Booking</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            5-Step Wizard: Customer → Vehicle Selection → Schedule → Pricing → Confirmation
          </p>
        </div>
      </div>

      {/* Steps Visual Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              step >= s ? 'bg-primary' : 'bg-surface-container'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: CUSTOMER SELECTION */}
      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-on-surface">Step 1: Select Verified Customer</h2>
          <p className="text-xs text-on-surface-variant">
            Choose from your private customer CRM directory. End-customer identity remains shielded from B2B partner channels.
          </p>

          <div className="space-y-2 mt-4">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedCustomerId === c.id
                    ? 'border-secondary bg-teal-50/60 ring-2 ring-secondary/20'
                    : 'border-surface-container bg-surface hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-on-surface">{c.fullName}</p>
                    {c.isVerified && <Badge variant="success" size="sm">Verified KYC</Badge>}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {c.email} • {c.phone} • DL: {c.drivingLicenseNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-on-surface">{c.totalRentalsCount} Rentals</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setStep(2)}>
              <span>Select Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: VEHICLE SELECTION WITH AVAILABILITY ENGINE */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Step 2: Select Fleet Vehicle</h2>
              <p className="text-xs text-on-surface-variant">
                Inventory is verified by the backend availability engine before commitment.
              </p>
            </div>
            {isAvailabilityChecking ? (
              <Badge variant="warning">Checking Availability...</Badge>
            ) : isAvailable === true ? (
              <Badge variant="success">Vehicle Available</Badge>
            ) : (
              <Badge variant="error">Date Conflict Detected</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedVehicleId === v.id
                    ? 'border-secondary bg-teal-50/60 ring-2 ring-secondary/20'
                    : 'border-surface-container bg-surface hover:bg-surface-container'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0">
                  <img src={v.primaryImageUrl} alt={v.model} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">{v.make} {v.model}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">{v.licensePlate} • {v.category}</p>
                  <p className="text-xs font-extrabold text-secondary mt-0.5">{formatCurrency(v.dailyRate)} / day</p>
                </div>
              </div>
            ))}
          </div>

          {isAvailable === false && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>This vehicle has an overlapping booking or maintenance block for the selected dates.</span>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={() => setStep(3)} disabled={isAvailable === false}>
              <span>Set Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: SCHEDULE & HUBS */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-on-surface">Step 3: Schedule & Depot Hubs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Pickup Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Return Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Pickup Depot Location</label>
              <select
                value={pickupHub}
                onChange={(e) => setPickupHub(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="Downtown Depot">Downtown Depot</option>
                <option value="Airport Terminal 2">Airport Terminal 2</option>
                <option value="West Suburban Hub">West Suburban Hub</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Return Depot Location</label>
              <select
                value={returnHub}
                onChange={(e) => setReturnHub(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              >
                <option value="Downtown Depot">Downtown Depot</option>
                <option value="Airport Terminal 2">Airport Terminal 2</option>
                <option value="West Suburban Hub">West Suburban Hub</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">Calculated Duration:</span>
            <span className="font-extrabold text-on-surface">{diffDays} Rental Days</span>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={() => setStep(4)}>
              <span>Configure Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: PRICING & ESCROW BOND */}
      {step === 4 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-on-surface">Step 4: Financial Rates & Escrow Bond</h2>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Daily Rate × {diffDays} Days</span>
              <span className="font-bold text-on-surface">{formatCurrency(rentalSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Security Caution Deposit (Escrow Bond)</span>
              <span className="font-bold text-secondary">{formatCurrency(securityDeposit)}</span>
            </div>
            <div className="border-t border-surface-container pt-2 flex justify-between text-sm font-extrabold">
              <span className="text-on-surface">Grand Total Required</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Advance Payment Received Now ($)</label>
            <input
              type="number"
              value={advancePaid}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
              placeholder="0"
              className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Remaining balance due at vehicle handover: <strong>{formatCurrency(balanceDue)}</strong>
            </p>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={() => setStep(5)}>
              <span>Review Agreement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & COMMIT */}
      {step === 5 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-on-surface">Step 5: Review & Confirm Direct Booking</h2>

          <div className="p-4 rounded-xl border border-surface-container space-y-3 text-xs bg-surface">
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Customer</p>
              <p className="font-bold text-on-surface mt-0.5">{selectedCustomer?.fullName}</p>
              <p className="text-[11px] text-on-surface-variant">Phone: {selectedCustomer?.phone}</p>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Vehicle</p>
              <p className="font-bold text-on-surface mt-0.5">{selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.licensePlate})</p>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Rental Dates</p>
              <p className="font-bold text-on-surface mt-0.5">{startDate.replace('T', ' ')} → {endDate.replace('T', ' ')} ({diffDays} days)</p>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Financial Terms</p>
              <p className="font-bold text-on-surface mt-0.5">Total: {formatCurrency(grandTotal)} • Paid: {formatCurrency(advancePaid)}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Operational Notes / Requests</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Complimentary child seat requested, flight tracking..."
              className="w-full p-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button onClick={handleConfirmBooking} isLoading={isSubmitting}>
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Issue Booking</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function CreateDirectBookingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-on-surface-variant font-semibold">
          Loading booking wizard...
        </div>
      }
    >
      <CreateDirectBookingContent />
    </React.Suspense>
  );
}
