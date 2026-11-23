'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Handshake,
  Building2,
  Car,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { PartnerRental, PartnerMessage } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format';

const b2bStages: PartnerRental['status'][] = [
  'REQUESTED',
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'HANDED_OVER',
  'ACTIVE',
  'RETURNED',
  'SETTLED',
];

export default function PartnerRentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [rental, setRental] = useState<PartnerRental | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [rData, mData] = await Promise.all([
          api.getPartnerRentalById(resolvedParams.id),
          api.getPartnerMessages(resolvedParams.id),
        ]);
        if (rData) setRental(rData);
        setMessages(mData);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  if (isLoading || !rental) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading B2B partner rental...</p>
      </div>
    );
  }

  const currentStageIndex = b2bStages.indexOf(rental.status);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      const msg = await api.sendPartnerMessage(rental.id, newMessage);
      setMessages([...messages, msg]);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (status: PartnerRental['status']) => {
    setRental({ ...rental, status });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
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
                {rental.agreementNumber}
              </h1>
              <StatusBadge status={rental.status} />
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              B2B Inter-Fleet Wholesale Agreement • Active Privacy Shield
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {rental.status === 'OFFER_ACCEPTED' && (
            <Button size="sm" onClick={() => handleUpdateStatus('HANDED_OVER')}>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Handed Over</span>
            </Button>
          )}
          {rental.status === 'HANDED_OVER' && (
            <Button size="sm" onClick={() => handleUpdateStatus('ACTIVE')}>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm Active Rental</span>
            </Button>
          )}
          {rental.status === 'ACTIVE' && (
            <Button size="sm" onClick={() => handleUpdateStatus('RETURNED')}>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Vehicle Returned</span>
            </Button>
          )}
          {rental.status === 'RETURNED' && (
            <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus('SETTLED')}>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Execute Final Wholesale Settlement</span>
            </Button>
          )}
        </div>
      </div>

      {/* 7-Stage B2B Progress Bar */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
          B2B Wholesale Lifecycle Progress
        </h3>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-secondary transition-all duration-500 z-0"
            style={{
              width: `${(Math.max(0, currentStageIndex) / (b2bStages.length - 1)) * 100}%`,
            }}
          />

          {b2bStages.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-secondary text-white ring-4 ring-white'
                      : 'bg-white border-2 border-outline-variant text-outline'
                  } ${isCurrent ? 'ring-secondary/30 scale-110' : ''}`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold hidden md:block ${
                  isCurrent ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}>
                  {stage.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Contracting Fleets & Logistics (Left 2 cols) + Chat & Settlement (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contracting Fleets Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-secondary" />
                <CardTitle>Contracting Fleet Organizations</CardTitle>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Vehicle Supplier (Owner A)</span>
                <p className="text-sm font-extrabold text-on-surface mt-1">{rental.supplierOrgName}</p>
                <p className="text-[11px] text-secondary font-medium mt-0.5">Asset Custodian</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Sourcing Requester (Owner B)</span>
                <p className="text-sm font-extrabold text-on-surface mt-1">{rental.requesterOrgName}</p>
                <p className="text-[11px] text-secondary font-medium mt-0.5">Client Billing Agent</p>
              </div>
            </div>
          </Card>

          {/* Sourced Vehicle Asset */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-secondary" />
                <CardTitle>Inter-Fleet Sourced Vehicle</CardTitle>
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Model</p>
                <p className="font-bold text-on-surface mt-0.5">{rental.vehicleMake} {rental.vehicleModel}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">License Plate</p>
                <p className="font-mono font-bold text-primary mt-0.5">{rental.licensePlate}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Wholesale Rate</p>
                <p className="font-bold text-on-surface mt-0.5">{formatCurrency(rental.wholesaleDailyRate)} / day</p>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <CardTitle>Wholesale Rental Term</CardTitle>
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Handover Date</p>
                <p className="font-bold text-on-surface mt-0.5">{formatDate(rental.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Return Date</p>
                <p className="font-bold text-on-surface mt-0.5">{formatDate(rental.endDate)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Wholesale Settlement & Dispatcher Chat (1 col) */}
        <div className="space-y-6">
          {/* Wholesale Financial Ledger */}
          <Card className="bg-white border-surface-container">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Wholesale Settlement</CardTitle>
                <DollarSign className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">Rate ({rental.totalDays} days × {formatCurrency(rental.wholesaleDailyRate)})</span>
                <span className="font-bold text-on-surface">{formatCurrency(rental.totalWholesaleAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">B2B Caution Deposit Bond</span>
                <span className="font-bold text-secondary">{formatCurrency(rental.cautionDeposit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-container text-sm font-extrabold">
                <span className="text-on-surface">Total Wholesale Obligation</span>
                <span className="text-primary">{formatCurrency(rental.totalWholesaleAmount + rental.cautionDeposit)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-emerald-700 font-semibold">Settled to Date</span>
                <span className="font-extrabold text-emerald-700">{formatCurrency(rental.settlementPaid)}</span>
              </div>
            </div>
          </Card>

          {/* Shielded Dispatcher Messaging */}
          <Card className="p-4 flex flex-col h-80">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <span>B2B Dispatcher Chat</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Encrypted
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {messages.length === 0 ? (
                <p className="text-center text-on-surface-variant text-[11px] py-8">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-surface border border-surface-container">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold text-secondary truncate">{m.senderName}</span>
                      <span className="text-on-surface-variant">{formatRelativeTime(m.timestamp)}</span>
                    </div>
                    <p className="text-on-surface text-xs leading-relaxed">{m.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Message partner dispatcher..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4 text-secondary-container" />
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
