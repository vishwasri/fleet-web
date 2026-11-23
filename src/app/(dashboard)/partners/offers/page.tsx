'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Handshake,
  Star,
  CheckCircle,
  Car,
  Building2,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Gauge,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { PartnerOffer } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

function PartnerOffersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId') || undefined;

  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getPartnerOffers(requestId);
        setOffers(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [requestId]);

  const handleAcceptOffer = async (offerId: string) => {
    setAcceptingId(offerId);
    try {
      const created = await api.acceptPartnerOffer(offerId);
      router.push(`/partners/rentals/${created.id}`);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-surface-container text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Wholesale Partner Quotes</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Compare incoming vehicle proposals and commit to B2B inter-fleet fulfillment
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant mt-3">Loading quotes from partner network...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-surface-container">
          <Handshake className="w-12 h-12 text-outline mx-auto mb-2" />
          <h3 className="text-sm font-bold text-on-surface">No wholesale offers received yet</h3>
          <p className="text-xs text-on-surface-variant mt-1">Partner operators are reviewing your broadcast.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-5 border border-surface-container flex flex-col justify-between">
              <div>
                {/* Header Supplier Info */}
                <div className="flex items-start justify-between pb-3 border-b border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-5 h-5 text-secondary-container" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-on-surface">{offer.supplierOrgName}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                          {offer.supplierRating}
                        </span>
                        <Badge variant="success" size="sm">Verified Partner</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-primary">
                      {formatCurrency(offer.dailyWholesaleRate)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">/ day wholesale</span>
                  </div>
                </div>

                {/* Vehicle Specs Offered */}
                <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">Proposed Asset</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">
                    {offer.vehicleMake} {offer.vehicleModel} ({offer.vehicleYear})
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Plate: <strong className="font-mono text-on-surface">{offer.licensePlate}</strong> • Depot: {offer.pickupHub}
                  </p>
                </div>

                {/* Agreement Terms */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl border border-surface-container">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Included Mileage</span>
                    <p className="font-bold text-on-surface mt-0.5">{offer.includedKmPerDay} km / day</p>
                    <p className="text-[10px] text-on-surface-variant">Excess: ${offer.excessKmRate}/km</p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-surface-container">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">B2B Caution Bond</span>
                    <p className="font-bold text-secondary mt-0.5">{formatCurrency(offer.cautionDeposit)}</p>
                    <p className="text-[10px] text-on-surface-variant">Refundable wholesale</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-surface-container">
                <Button
                  className="w-full text-xs font-bold"
                  isLoading={acceptingId === offer.id}
                  onClick={() => handleAcceptOffer(offer.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Offer & Create Agreement</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartnerOffersComparisonPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-on-surface-variant font-semibold">
          Loading partner offers...
        </div>
      }
    >
      <PartnerOffersContent />
    </React.Suspense>
  );
}
