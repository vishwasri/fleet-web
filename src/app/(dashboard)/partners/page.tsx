'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Handshake,
  Plus,
  ShieldCheck,
  Building2,
  Car,
  Clock,
  ArrowRight,
  DollarSign,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { PartnerRental, PartnerRequest, PartnerOrganization } from '@/types';
import { mockPartnerOrgs } from '@/lib/data/mock-data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function PartnerRentalsHomePage() {
  const [activeTab, setActiveTab] = useState<'rentals' | 'requests' | 'directory'>('rentals');
  const [rentals, setRentals] = useState<PartnerRental[]>([]);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [partners] = useState<PartnerOrganization[]>(mockPartnerOrgs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [rData, reqData] = await Promise.all([
          api.getPartnerRentals(),
          api.getPartnerRequests(),
        ]);
        setRentals(rData);
        setRequests(reqData);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">B2B Partner Rental Network</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Inter-fleet vehicle sourcing, wholesale quotes, and inter-operator clearing
          </p>
        </div>

        <Link
          href="/partners/request"
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-secondary-container" />
          <span>Broadcast Sourcing Request</span>
        </Link>
      </div>

      {/* Strict Privacy Shield Banner */}
      <Card className="bg-teal-50/70 border-teal-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-100 text-secondary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-secondary">B2B End-Customer Privacy Shield Active</h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
              When sourcing or supplying vehicles across the inter-fleet network, customer identity (names, phone numbers, NIC, and driving licenses) is strictly redacted and shielded. Only vehicle specifications, wholesale settlement rates, and operator dispatch hubs are transmitted.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rentals'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Active B2B Rentals ({rentals.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Sourcing Broadcasts ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'directory'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Verified Partner Fleets ({partners.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE B2B RENTALS */}
      {activeTab === 'rentals' && (
        <div className="space-y-3">
          {rentals.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
              <Handshake className="w-12 h-12 text-outline mx-auto mb-2" />
              <h3 className="text-sm font-bold text-on-surface">No active B2B partner agreements</h3>
              <p className="text-xs text-on-surface-variant mt-1">Broadcast a request to source cars from trusted partners.</p>
            </div>
          ) : (
            rentals.map((r) => (
              <Link key={r.id} href={`/partners/rentals/${r.id}`} className="block group">
                <Card hoverEffect className="p-4 sm:p-5 border border-surface-container">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-secondary flex-shrink-0 flex items-center justify-center font-bold">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{r.agreementNumber}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <h3 className="text-sm font-extrabold text-on-surface group-hover:text-secondary transition-colors mt-1">
                          {r.vehicleMake} {r.vehicleModel}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Supplier: <strong className="text-on-surface">{r.supplierOrgName}</strong> • Requester: {r.requesterOrgName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-surface-container">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">Agreement Term</p>
                        <p className="font-bold text-on-surface mt-0.5">{formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
                        <p className="text-[11px] text-secondary font-medium">{r.totalDays} Days</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">Wholesale Value</p>
                        <p className="text-sm font-extrabold text-on-surface mt-0.5">{formatCurrency(r.totalWholesaleAmount)}</p>
                        <p className="text-[11px] text-on-surface-variant">Deposit: {formatCurrency(r.cautionDeposit)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SOURCING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-4 sm:p-5 border border-surface-container">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{req.requestNumber}</span>
                    <Badge variant={req.status === 'OFFERS_RECEIVED' ? 'success' : 'warning'}>
                      {req.status}
                    </Badge>
                    <span className="text-xs font-bold text-secondary">{req.offersCount} Quotes Received</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-on-surface mt-1">
                    Seeking: {req.category} {req.preferredModel && `(${req.preferredModel})`}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Hub: {req.deliveryHub} • Schedule: {formatDate(req.startDate)} → {formatDate(req.endDate)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Target Wholesale Rate</span>
                    <span className="text-sm font-extrabold text-on-surface">Up to {formatCurrency(req.targetMaxWholesaleDailyRate)}/day</span>
                  </div>
                  <Link
                    href={`/partners/offers?requestId=${req.id}`}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <span>Compare Offers ({req.offersCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: VERIFIED PARTNER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <Card key={p.id} className="p-5 border border-surface-container">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-5 h-5 text-secondary-container" />
                </div>
                <Badge variant="success" size="sm">Verified Fleet</Badge>
              </div>

              <h4 className="text-sm font-bold text-on-surface">{p.displayName}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{p.hubLocation}, {p.city}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-container text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Fleet Rating</span>
                  <p className="font-extrabold text-amber-600 mt-0.5">★ {p.rating}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Commercial Fleet</span>
                  <p className="font-extrabold text-on-surface mt-0.5">{p.fleetCount} Assets</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
