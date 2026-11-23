'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  User,
  Calendar,
  DollarSign,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CreditCard,
  Send,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Booking } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const lifecycleStages: Booking['status'][] = [
  'DRAFT',
  'CONFIRMED',
  'PICKED_UP',
  'ACTIVE',
  'RETURNED',
  'COMPLETED',
];

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD'>('CREDIT_CARD');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getBookingById(resolvedParams.id);
        if (data) {
          setBooking(data);
          setPaymentAmount(data.balanceDue);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  if (isLoading || !booking) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading booking agreement...</p>
      </div>
    );
  }

  const currentStageIndex = lifecycleStages.indexOf(booking.status);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;
    setIsSubmittingPayment(true);
    try {
      const updated = await api.recordPayment(booking.id, paymentAmount, paymentMethod);
      setBooking({ ...updated });
      setIsPaymentModalOpen(false);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleAdvanceStatus = async (newStatus: Booking['status']) => {
    const updated = await api.updateBookingStatus(booking.id, newStatus);
    setBooking({ ...updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
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
                {booking.bookingNumber}
              </h1>
              <StatusBadge status={booking.status} />
              <Badge
                variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}
                size="sm"
              >
                {booking.paymentStatus}
              </Badge>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Direct Rental Agreement • Issued on {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>

        {/* Operational Trigger Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={booking.balanceDue <= 0}
          >
            <DollarSign className="w-3.5 h-3.5 text-secondary" />
            <span>Record Payment</span>
          </Button>

          {(booking.status === 'CONFIRMED' || booking.status === 'DRAFT') && (
            <Link
              href={`/inspections/pickup/${booking.id}`}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-secondary-container" />
              <span>Start Pickup Inspection</span>
            </Link>
          )}

          {(booking.status === 'ACTIVE' || booking.status === 'PICKED_UP') && (
            <Link
              href={`/inspections/return/${booking.id}`}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary-container" />
              <span>Start Return Inspection</span>
            </Link>
          )}
        </div>
      </div>

      {/* 6-Stage Lifecycle Progress Bar */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
          Rental Agreement Lifecycle Progress
        </h3>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 z-0"
            style={{
              width: `${(Math.max(0, currentStageIndex) / (lifecycleStages.length - 1)) * 100}%`,
            }}
          />

          {lifecycleStages.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-primary text-white ring-4 ring-white'
                      : 'bg-white border-2 border-outline-variant text-outline'
                  } ${isCurrent ? 'ring-secondary/30 scale-110' : ''}`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold hidden md:block ${
                  isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}>
                  {stage.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Customer & Car Details (Left 2 cols) + Financial Ledger (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  <CardTitle>Customer Identity & Verification</CardTitle>
                </div>
                <Badge variant={booking.customer?.isVerified ? 'success' : 'warning'}>
                  {booking.customer?.isVerified ? 'Verified KYC' : 'Unverified'}
                </Badge>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Full Legal Name</p>
                <p className="font-extrabold text-on-surface mt-0.5">{booking.customer?.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Contact Phone</p>
                <p className="font-bold text-on-surface mt-0.5">{booking.customer?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Email</p>
                <p className="font-bold text-on-surface mt-0.5">{booking.customer?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">NIC / National ID</p>
                <p className="font-mono font-bold text-on-surface mt-0.5">{booking.customer?.nationalIdNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Driving License</p>
                <p className="font-mono font-bold text-on-surface mt-0.5">{booking.customer?.drivingLicenseNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Customer Address</p>
                <p className="font-bold text-on-surface mt-0.5">{booking.customer?.address || 'San Francisco, CA'}</p>
              </div>
            </div>
          </Card>

          {/* Vehicle Specifications Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-secondary" />
                  <CardTitle>Assigned Fleet Vehicle</CardTitle>
                </div>
                <Link
                  href={`/vehicles/${booking.vehicle?.id}`}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  View Vehicle Asset →
                </Link>
              </div>
            </CardHeader>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40 h-28 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0">
                <img
                  src={booking.vehicle?.primaryImageUrl}
                  alt={booking.vehicle?.model}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Model</p>
                  <p className="font-bold text-on-surface mt-0.5">{booking.vehicle?.make} {booking.vehicle?.model}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">License Plate</p>
                  <p className="font-mono font-bold text-primary mt-0.5">{booking.vehicle?.licensePlate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Category</p>
                  <p className="font-bold text-on-surface mt-0.5">{booking.vehicle?.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Daily Rate</p>
                  <p className="font-bold text-on-surface mt-0.5">{formatCurrency(booking.dailyRate)} / day</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule & Depot Hubs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <CardTitle>Rental Schedule & Depot Hubs</CardTitle>
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Departure Date</p>
                <p className="font-bold text-on-surface mt-0.5">{formatDate(booking.startDate)}</p>
                <p className="text-[11px] text-secondary font-medium mt-0.5">Hub: {booking.pickupHub}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Scheduled Return</p>
                <p className="font-bold text-on-surface mt-0.5">{formatDate(booking.endDate)}</p>
                <p className="text-[11px] text-secondary font-medium mt-0.5">Hub: {booking.returnHub}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Total Duration</p>
                <p className="font-extrabold text-on-surface mt-0.5">{booking.totalDays} Days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Financial Ledger (1 col) */}
        <div className="space-y-6">
          <Card className="bg-white border-surface-container shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Financial Ledger Breakdown</CardTitle>
                <DollarSign className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">Daily Rate ({booking.totalDays} days × {formatCurrency(booking.dailyRate)})</span>
                <span className="font-bold text-on-surface">{formatCurrency(booking.rentalSubtotal)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-surface-container">
                <div>
                  <span className="text-on-surface-variant">Escrow Caution Deposit</span>
                  <span className="block text-[10px] text-secondary font-bold">Held in Escrow Trust</span>
                </div>
                <span className="font-bold text-secondary">{formatCurrency(booking.securityDeposit)}</span>
              </div>

              {booking.extraChargesTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span className="text-on-surface-variant">Extra Services / Addons</span>
                  <span className="font-bold text-on-surface">{formatCurrency(booking.extraChargesTotal)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-surface-container text-sm font-extrabold">
                <span className="text-on-surface">Grand Total Required</span>
                <span className="text-primary">{formatCurrency(booking.grandTotal)}</span>
              </div>

              <div className="flex justify-between py-1 text-xs">
                <span className="text-emerald-700 font-semibold">Amount Collected</span>
                <span className="font-extrabold text-emerald-700">{formatCurrency(booking.amountPaid)}</span>
              </div>

              <div className="flex justify-between py-2 rounded-xl bg-surface px-3 border border-surface-container text-xs font-bold">
                <span className={booking.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                  Balance Outstanding
                </span>
                <span className={booking.balanceDue > 0 ? 'text-rose-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                  {formatCurrency(booking.balanceDue)}
                </span>
              </div>
            </div>

            {booking.balanceDue > 0 && (
              <Button
                className="w-full mt-4 text-xs font-bold"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard className="w-4 h-4" />
                <span>Collect Balance ({formatCurrency(booking.balanceDue)})</span>
              </Button>
            )}
          </Card>

          {/* Quick Status Override Card */}
          <Card>
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant mb-3">
              Lifecycle Transitions
            </CardTitle>
            <div className="space-y-2">
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-bold"
                  onClick={() => handleAdvanceStatus('PICKED_UP')}
                >
                  <KeyRound className="w-3.5 h-3.5 text-secondary" />
                  <span>Mark Picked Up by Customer</span>
                </Button>
              )}
              {booking.status === 'PICKED_UP' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-bold"
                  onClick={() => handleAdvanceStatus('ACTIVE')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  <span>Mark Active on Road</span>
                </Button>
              )}
              {booking.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-bold"
                  onClick={() => handleAdvanceStatus('RETURNED')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  <span>Mark Vehicle Returned to Depot</span>
                </Button>
              )}
              {booking.status === 'RETURNED' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-xs font-bold"
                  onClick={() => handleAdvanceStatus('COMPLETED')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Finalize & Complete Agreement</span>
                </Button>
              )}
              {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleAdvanceStatus('CANCELLED')}
                  className="w-full text-center text-[11px] text-rose-600 hover:underline font-semibold pt-2"
                >
                  Cancel Rental Agreement
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Customer Payment"
        description={`Record settlement for agreement ${booking.bookingNumber}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Amount to Record ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">
              Outstanding Balance: <strong>{formatCurrency(booking.balanceDue)}</strong>
            </p>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            >
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="BANK_TRANSFER">Bank Direct Wire Transfer</option>
              <option value="CASH">Cash at Depot Counter</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingPayment}>
              Save Payment to Ledger
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
