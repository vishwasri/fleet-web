'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Calendar,
  Wallet,
  Wrench,
  Fuel,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  PlusCircle,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Vehicle } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'finance' | 'logbook'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getVehicleById(resolvedParams.id);
        if (data) setVehicle(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  if (isLoading || !vehicle) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading vehicle details...</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: Vehicle['status']) => {
    const updated = await api.updateVehicle(vehicle.id, { status: newStatus });
    setVehicle(updated);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-surface-container text-on-surface hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Plate: <strong className="font-mono text-on-surface">{vehicle.licensePlate}</strong> • {vehicle.category} • {vehicle.year}
            </p>
          </div>
        </div>

        {/* Quick Lifecycle Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {vehicle.status === 'AVAILABLE' ? (
            <Link
              href={`/bookings/new?vehicleId=${vehicle.id}`}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-secondary-container" />
              <span>Create Direct Booking</span>
            </Link>
          ) : vehicle.status === 'MAINTENANCE' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleStatusChange('AVAILABLE')}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Service Complete (Available)</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('MAINTENANCE')}
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Send to Maintenance</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Overview, Calendar, Finance, Logbook) */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        {(['overview', 'calendar', 'finance', 'logbook'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual & Technical Specs (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden border border-surface-container">
              <div className="relative h-64 bg-surface-container-high">
                <img
                  src={vehicle.primaryImageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                  Depot Hub: {vehicle.locationHub}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-base font-bold text-on-surface mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Transmission</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{vehicle.transmission}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Fuel / Power</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{vehicle.fuelType}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Seating</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{vehicle.seatingCapacity} Passengers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Odometer</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{vehicle.currentOdometer.toLocaleString()} km</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Fuel Level</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{vehicle.fuelLevelPercent}% Level</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Insurance Expiry</p>
                    <p className="font-extrabold text-on-surface mt-0.5">{formatDate(vehicle.insuranceExpiry)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Pricing & Compliance Sidebar (1 col) */}
          <div className="space-y-6">
            <Card>
              <CardTitle className="mb-4 text-xs uppercase tracking-wider text-on-surface-variant">
                Standard Commercial Rates
              </CardTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                  <span className="text-xs font-semibold text-on-surface-variant">Daily Direct Rate</span>
                  <span className="text-sm font-extrabold text-on-surface">{formatCurrency(vehicle.dailyRate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                  <span className="text-xs font-semibold text-on-surface-variant">Escrow Caution Bond</span>
                  <span className="text-sm font-extrabold text-on-surface">{formatCurrency(vehicle.securityDeposit)}</span>
                </div>
                {vehicle.wholesaleRate && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200/50">
                    <span className="text-xs font-semibold text-teal-800">B2B Wholesale Rate</span>
                    <span className="text-sm font-extrabold text-secondary">{formatCurrency(vehicle.wholesaleRate)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Service Threshold</h4>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Next recommended periodic checkup is scheduled at{' '}
                    <strong>{vehicle.nextServiceOdometer?.toLocaleString()} km</strong> or on{' '}
                    <strong>{formatDate(vehicle.nextServiceDate)}</strong>.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY CALENDAR */}
      {activeTab === 'calendar' && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Schedule & Reservation Timeline</CardTitle>
              <Badge variant="outline" size="sm">Visual Booking Blocks</Badge>
            </div>
          </CardHeader>

          <p className="text-xs text-on-surface-variant mb-4">
            Protected by backend availability checks. Consecutive rentals and service blocks cannot overlap.
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Direct Rental Booking</span>
                <p className="text-xs font-bold text-on-surface mt-0.5">BK-2026-0891 (Sarah Johnson)</p>
                <p className="text-[11px] text-on-surface-variant">Nov 20, 2026 → Nov 26, 2026 • Pickup: Downtown Depot</p>
              </div>
              <Badge variant="info">Active</Badge>
            </div>

            <div className="p-4 rounded-xl border border-surface-container bg-surface flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Open Availability Window</span>
                <p className="text-xs font-bold text-on-surface mt-0.5">Ready for Reservation</p>
                <p className="text-[11px] text-on-surface-variant">Nov 27, 2026 → Dec 10, 2026 • All Depots</p>
              </div>
              <Badge variant="success">Unreserved</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: FINANCE */}
      {activeTab === 'finance' && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Asset Capital Yield & Profitability</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-surface border border-surface-container">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Gross Revenue</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(3450)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-surface-container">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Service & Repair</p>
              <p className="text-xl font-extrabold text-rose-500 mt-1">{formatCurrency(280)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-surface-container">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Net Profit</p>
              <p className="text-xl font-extrabold text-primary mt-1">{formatCurrency(3170)}</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-surface-container">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">Profit Margin</p>
              <p className="text-xl font-extrabold text-secondary mt-1">91.8%</p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: LOGBOOK */}
      {activeTab === 'logbook' && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Maintenance & Service Logbook</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/maintenance')}>
                <Wrench className="w-3.5 h-3.5" />
                <span>Log Service</span>
              </Button>
            </div>
          </CardHeader>
          <div className="divide-y divide-surface-container">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface">Periodic Inspection & Cabin Filter</p>
                <p className="text-[11px] text-on-surface-variant">Tesla Certified Workshop • 20,000 km</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-on-surface">{formatCurrency(160)}</span>
                <span className="text-[10px] text-on-surface-variant block">Oct 15, 2026</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
