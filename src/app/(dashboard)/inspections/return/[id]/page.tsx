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
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReturnInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [returnOdometer, setReturnOdometer] = useState(25100);
  const [returnFuel, setReturnFuel] = useState(90);
  const [notes, setNotes] = useState('Vehicle returned in good condition. No exterior scratches detected.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const b = await api.getBookingById(resolvedParams.id);
      if (b) {
        setBooking(b);
        if (b.vehicle?.currentOdometer) setReturnOdometer(b.vehicle.currentOdometer + 450);
      }
    }
    load();
  }, [resolvedParams.id]);

  const handleCompleteReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setIsSubmitting(true);
    try {
      await api.createInspection({
        bookingId: booking.id,
        vehicleId: booking.vehicleId,
        type: 'RETURN',
        odometerReading: returnOdometer,
        fuelLevelPercent: returnFuel,
        notes,
      });

      // Advance booking to RETURNED
      await api.updateBookingStatus(booking.id, 'RETURNED');
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
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Receiving Return Inspection</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Booking {booking?.bookingNumber} • Vehicle: {booking?.vehicle?.make} {booking?.vehicle?.model}
          </p>
        </div>
      </div>

      <form onSubmit={handleCompleteReturn} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Return Gauges Reconciliation</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  Return Fuel Level
                </span>
                <span className="font-extrabold text-secondary text-sm">{returnFuel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={returnFuel}
                onChange={(e) => setReturnFuel(Number(e.target.value))}
                className="w-full accent-secondary h-2 bg-surface-container rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-outline" />
                Return Odometer Reading (km)
              </label>
              <input
                type="number"
                required
                value={returnOdometer}
                onChange={(e) => setReturnOdometer(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs font-mono font-bold text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Condition Notes & Damage Assessment</h3>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full h-11 text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Complete Receiving Inspection & Close Agreement</span>
          </Button>
        </Card>
      </form>
    </div>
  );
}
