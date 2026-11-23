'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Plus,
  Search,
  Filter,
  Fuel,
  Gauge,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Vehicle, VehicleStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

const statusFilters: { label: string; value: string }[] = [
  { label: 'All Fleet', value: 'ALL' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Direct Rental', value: 'RENTED' },
  { label: 'Partner Loan', value: 'PARTNER_LOAN' },
  { label: 'In Maintenance', value: 'MAINTENANCE' },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getVehicles();
        setVehicles(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus =
      activeFilter === 'ALL' || v.status === activeFilter;
    const matchesCategory =
      categoryFilter === 'ALL' || v.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch =
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Vehicles Fleet</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage your fleet inventory, vehicle health, specs, and availability
          </p>
        </div>

        <Link
          href="/vehicles/new"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-secondary-container" />
          <span>Add New Vehicle</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-surface-container shadow-sm">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statusFilters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search make, model, plate..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading vehicles inventory...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
          <Car className="w-12 h-12 text-outline mx-auto mb-2" />
          <h3 className="text-sm font-bold text-on-surface">No vehicles found</h3>
          <p className="text-xs text-on-surface-variant mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="group block"
            >
              <Card hoverEffect className="p-0 overflow-hidden flex flex-col h-full border border-surface-container">
                {/* Vehicle Image Banner */}
                <div className="relative h-44 bg-surface-container-high overflow-hidden">
                  <img
                    src={vehicle.primaryImageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={vehicle.status} />
                  </div>
                  <div className="absolute top-3 right-3 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {vehicle.licensePlate}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                          {vehicle.category}
                        </span>
                        <h3 className="text-sm font-extrabold text-on-surface group-hover:text-secondary transition-colors">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant">Year {vehicle.year} • {vehicle.locationHub}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-on-surface">
                          {formatCurrency(vehicle.dailyRate)}
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">/ day</span>
                      </div>
                    </div>

                    {/* Quick Specs Badges */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-container text-[11px] text-on-surface-variant font-medium">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-outline" />
                        <span>{vehicle.currentOdometer.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {vehicle.fuelType === 'ELECTRIC' ? (
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{vehicle.fuelLevelPercent}% Fuel/Battery</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Caution Deposit + CTA */}
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      Caution Deposit: <strong>{formatCurrency(vehicle.securityDeposit)}</strong>
                    </span>
                    <span className="text-secondary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Asset →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
