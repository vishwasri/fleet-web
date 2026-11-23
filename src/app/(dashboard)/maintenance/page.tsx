'use client';

import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Building2,
  DollarSign,
  Car,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { MaintenanceRecord, Vehicle } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: 'Periodic 10,000 KM Inspection',
    workshopName: 'Bavarian Master Mechanics',
    cost: 350,
    startDate: '2026-11-25',
    targetCompletionDate: '2026-11-28',
    odometer: 35000,
    notes: 'Brake pads replacement and wheel balance.',
  });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [recs, vehs] = await Promise.all([
          api.getMaintenanceRecords(),
          api.getVehicles(),
        ]);
        setRecords(recs);
        setVehicles(vehs);
        if (vehs.length > 0) setForm((f) => ({ ...f, vehicleId: vehs[0].id }));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleScheduleService = async (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === form.vehicleId);
    const created = await api.createMaintenanceRecord({
      ...form,
      vehicleInfo: `${veh?.make} ${veh?.model} (${veh?.licensePlate})`,
    });
    setRecords([created, ...records]);
    setIsModalOpen(false);
  };

  const filteredRecords = records.filter(
    (r) => filterStatus === 'ALL' || r.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Maintenance & Workshops</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Periodic service history, garage invoices, repair cost tracking, and automatic calendar date blocks
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 text-secondary-container" />
          <span>Schedule Service / Repair</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-surface-container pb-2">
        {['ALL', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === s
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Records Stream */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading maintenance logbook...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
          <Wrench className="w-12 h-12 text-outline mx-auto mb-2" />
          <h3 className="text-sm font-bold text-on-surface">No maintenance records found</h3>
          <p className="text-xs text-on-surface-variant mt-1">All fleet vehicles are operating smoothly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((r) => (
            <Card key={r.id} className="p-4 sm:p-5 border border-surface-container">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-on-surface">{r.serviceType}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Vehicle: <strong className="text-on-surface">{r.vehicleInfo}</strong> • Workshop: {r.workshopName}
                    </p>
                    {r.notes && (
                      <p className="text-[11px] text-on-surface-variant mt-1">Notes: {r.notes}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-surface-container">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Scheduled Window</span>
                    <p className="font-bold text-on-surface mt-0.5">
                      {formatDate(r.startDate)} → {formatDate(r.targetCompletionDate)}
                    </p>
                    <p className="text-[11px] text-secondary font-medium">Odometer: {r.odometer.toLocaleString()} km</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Service Cost</span>
                    <p className="text-sm font-extrabold text-rose-600 mt-0.5">{formatCurrency(r.cost)}</p>
                    <p className="text-[11px] text-on-surface-variant">Fleet Expense</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Workshop Service"
        description="Creates an automatic calendar block preventing conflicting reservations"
      >
        <form onSubmit={handleScheduleService} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Select Vehicle</label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Service / Repair Description</label>
            <input
              type="text"
              required
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Workshop / Garage Name</label>
              <input
                type="text"
                required
                value={form.workshopName}
                onChange={(e) => setForm({ ...form, workshopName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                required
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Service Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Target Completion Date</label>
              <input
                type="date"
                required
                value={form.targetCompletionDate}
                onChange={(e) => setForm({ ...form, targetCompletionDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule & Block Calendar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
