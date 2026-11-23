'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Car,
  Handshake,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import { mockVehicleProfitability } from '@/lib/data/mock-data';

export default function ReportsDashboardPage() {
  const [period, setPeriod] = useState<'MTD' | 'LAST_MONTH' | 'YTD'>('MTD');
  const [profitability] = useState(mockVehicleProfitability);

  const handleExportCSV = () => {
    const headers = ['Vehicle Asset', 'Plate', 'Gross Revenue', 'Expenses', 'Net Profit', 'Margin %', 'Utilization %'];
    const rows = profitability.map((p) => [
      `${p.make} ${p.model}`,
      p.licensePlate,
      p.grossRevenue,
      p.operatingExpenses,
      p.netProfit,
      `${p.profitMarginPercent}%`,
      `${p.utilizationRatePercent}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleetlink_financial_report_${period.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Executive Fleet Reports</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Operational analytics, direct vs wholesale yield splits, and fleet utilization intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-surface-container rounded-xl p-1 text-xs font-bold">
            {(['MTD', 'LAST_MONTH', 'YTD'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  period === p ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p === 'MTD' ? 'This Month' : p === 'LAST_MONTH' ? 'Last Month' : 'Year to Date'}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Revenue Breakdown: Direct vs Partner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">Total Fleet Turnover</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-primary mt-2">{formatCurrency(15820)}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">+14.2% from previous cycle</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">Direct Consumer Rentals</span>
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{formatCurrency(11240)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">71.0% of total revenue</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">B2B Wholesale Settlements</span>
            <Handshake className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-extrabold text-secondary mt-2">{formatCurrency(4580)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">29.0% inter-fleet wholesale</p>
        </Card>
      </div>

      {/* Top Performing Assets Table */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Top Performing Fleet Assets by Net Profit</CardTitle>
            <span className="text-xs text-on-surface-variant font-medium">Ranked by Capital Yield</span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-surface-container text-on-surface-variant font-bold uppercase text-[10px]">
                <th className="py-3 px-2">Asset Name</th>
                <th className="py-3 px-2">License Plate</th>
                <th className="py-3 px-2">Gross Revenue</th>
                <th className="py-3 px-2">Expenses</th>
                <th className="py-3 px-2">Net Profit</th>
                <th className="py-3 px-2">Operating Margin</th>
                <th className="py-3 px-2 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-medium">
              {profitability.map((p, idx) => (
                <tr key={p.vehicleId} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-2 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{p.make} {p.model}</span>
                  </td>
                  <td className="py-3 px-2 font-mono text-outline">{p.licensePlate}</td>
                  <td className="py-3 px-2 text-emerald-600 font-bold">{formatCurrency(p.grossRevenue)}</td>
                  <td className="py-3 px-2 text-rose-500 font-bold">{formatCurrency(p.operatingExpenses)}</td>
                  <td className="py-3 px-2 text-primary font-extrabold">{formatCurrency(p.netProfit)}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      {p.profitMarginPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-on-surface">
                    {p.utilizationRatePercent}% ({p.totalRentalDays} days)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
