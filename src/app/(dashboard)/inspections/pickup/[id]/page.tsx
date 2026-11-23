'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Fuel,
  Gauge,
  Camera,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PickupInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [odometer, setOdometer] = useState(24350);
  const [fuelPercent, setFuelPercent] = useState(100);
  const [notes, setNotes] = useState('Vehicle in pristine delivery condition.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checklist, setChecklist] = useState([
    { name: 'Tires & Wheels Pressure Check', passed: true },
    { name: 'Exterior Bodywork Free of Major Scratches', passed: true },
    { name: 'Windshield & Mirrors Intact', passed: true },
    { name: 'Interior Cleaned & Sanitized', passed: true },
    { name: 'Registration Document & Insurance Present in Glovebox', passed: true },
    { name: 'Spare Wheel & Emergency Tool Kit Verified', passed: true },
  ]);

  useEffect(() => {
    async function load() {
      const b = await api.getBookingById(resolvedParams.id);
      if (b) {
        setBooking(b);
        if (b.vehicle?.currentOdometer) setOdometer(b.vehicle.currentOdometer);
      }
    }
    load();
  }, [resolvedParams.id]);

  const toggleCheck = (index: number) => {
    const updated = [...checklist];
    updated[index].passed = !updated[index].passed;
    setChecklist(updated);
  };

  const handleCompleteInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setIsSubmitting(true);
    try {
      await api.createInspection({
        bookingId: booking.id,
        vehicleId: booking.vehicleId,
        type: 'PICKUP',
        odometerReading: odometer,
        fuelLevelPercent: fuelPercent,
        notes,
        checklistPassed: checklist.every((c) => c.passed),
      });

      // Advance booking to PICKED_UP
      await api.updateBookingStatus(booking.id, 'PICKED_UP');
      router.push(`/bookings/${booking.id}`);
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
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Departure Pickup Inspection</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Booking {booking?.bookingNumber} • Customer: {booking?.customer?.fullName}
          </p>
        </div>
      </div>

      <form onSubmit={handleCompleteInspection} className="space-y-6">
        {/* Fuel & Odometer Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Vehicle Gauges at Handover</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  Fuel / Battery Level
                </span>
                <span className="font-extrabold text-secondary text-sm">{fuelPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fuelPercent}
                onChange={(e) => setFuelPercent(Number(e.target.value))}
                className="w-full accent-secondary h-2 bg-surface-container rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-outline" />
                Current Odometer Reading (km)
              </label>
              <input
                type="number"
                required
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs font-mono font-bold text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* 4-Angle Photo Placeholders */}
        <Card className="p-6 space-y-3">
          <h3 className="text-sm font-bold text-on-surface">4-Angle Condition Photos</h3>
          <p className="text-xs text-on-surface-variant">Standard dispatch verification capture</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {['FRONT', 'REAR', 'LEFT SIDE', 'RIGHT SIDE'].map((angle) => (
              <div
                key={angle}
                className="h-24 rounded-xl border-2 border-dashed border-surface-container hover:border-secondary/60 bg-surface flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors"
              >
                <Camera className="w-5 h-5 text-outline mb-1" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">{angle}</span>
                <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Ready to snap</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Checklist */}
        <Card className="p-6 space-y-3">
          <h3 className="text-sm font-bold text-on-surface">Departure Condition Checklist</h3>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div
                key={item.name}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  item.passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
                }`}
              >
                <span className="text-xs font-medium text-on-surface">{item.name}</span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold ${
                    item.passed ? 'bg-emerald-600' : 'bg-rose-500'
                  }`}
                >
                  {item.passed ? '✓' : '✗'}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes & Submission */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Inspector Remarks & Sign-off</h3>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full h-11 text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Complete Inspection & Authorize Key Handover</span>
          </Button>
        </Card>
      </form>
    </div>
  );
}
