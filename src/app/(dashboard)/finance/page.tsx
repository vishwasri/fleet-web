'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Filter,
  Car,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { FinancialTransaction, SecurityDeposit, VehicleProfitability } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function FinanceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'deposits' | 'profitability'>('transactions');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [deposits, setDeposits] = useState<SecurityDeposit[]>([]);
  const [profitability, setProfitability] = useState<VehicleProfitability[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txAmount, setTxAmount] = useState(150);
  const [txCategory, setTxCategory] = useState('DIRECT_RENTAL');
  const [txDesc, setTxDesc] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [txs, deps, prof] = await Promise.all([
          api.getTransactions(),
          api.getSecurityDeposits(),
          api.getVehicleProfitability(),
        ]);
        setTransactions(txs);
        setDeposits(deps);
        setProfitability(prof);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEscrowDeposits = deposits
    .filter((d) => d.status === 'HELD')
    .reduce((acc, d) => acc + d.amountHeld, 0);

  const netOperatingProfit = totalIncome - totalExpense;

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createTransaction({
      type: txType,
      category: txCategory as any,
      amount: txAmount,
      description: txDesc || (txType === 'INCOME' ? 'General Rental Payment' : 'Operating Fleet Expense'),
    });
    setTransactions([created, ...transactions]);
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Finance & Ledgers</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Decimal-safe financial ledger, revenue vs expense segregation, and escrow caution deposit liabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTxType('EXPENSE');
              setTxCategory('MAINTENANCE');
              setIsModalOpen(true);
            }}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Expense</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setTxType('INCOME');
              setTxCategory('DIRECT_RENTAL');
              setIsModalOpen(true);
            }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-secondary-container" />
            <span>Log Revenue</span>
          </Button>
        </div>
      </div>

      {/* Financial Overview Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">Operating Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{formatCurrency(totalIncome)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Direct & B2B rentals</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">Fleet Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2">{formatCurrency(totalExpense)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Fuel, repairs, insurance</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary bg-primary text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-container">True Net Operating Profit</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-secondary-container flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{formatCurrency(netOperatingProfit)}</p>
          <p className="text-[11px] text-surface-container mt-1">Revenue MINUS expenses</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-secondary bg-teal-50/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary">Escrow Caution Deposits</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-secondary flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-secondary mt-2">{formatCurrency(totalEscrowDeposits)}</p>
          <p className="text-[11px] text-on-surface-variant mt-1">Segregated escrow trust</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Transaction Ledger
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'deposits'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Escrow Caution Bonds
        </button>
        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profitability'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          Asset Profitability & Yield
        </button>
      </div>

      {/* TAB 1: TRANSACTIONS STREAM */}
      {activeTab === 'transactions' && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Historical Financial Ledger</CardTitle>
              <div className="flex gap-1.5">
                {['ALL', 'INCOME', 'EXPENSE', 'DEPOSIT_ESCROW'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      filterType === f
                        ? 'bg-primary text-white'
                        : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <div className="divide-y divide-surface-container">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-medium text-xs">
                No transactions recorded in the ledger yet.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.type === 'INCOME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'EXPENSE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {tx.type === 'INCOME' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'EXPENSE' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-on-surface">{tx.description}</p>
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {tx.referenceNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Category: {tx.category.replace('_', ' ')} • Via {tx.paymentMethod.replace('_', ' ')} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold ${
                        tx.type === 'INCOME'
                          ? 'text-emerald-700'
                          : tx.type === 'EXPENSE'
                          ? 'text-rose-700'
                          : 'text-secondary'
                      }`}
                    >
                      {tx.type === 'EXPENSE' ? `-${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: ESCROW DEPOSITS */}
      {activeTab === 'deposits' && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Escrow Caution Deposits Held</CardTitle>
              <span className="text-xs text-on-surface-variant font-medium">
                Protected under Escrow Segregation Rule
              </span>
            </div>
          </CardHeader>

          <div className="divide-y divide-surface-container">
            {deposits.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-medium text-xs">
                No escrow security deposits currently held.
              </div>
            ) : (
              deposits.map((dep) => (
                <div key={dep.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-on-surface">{dep.customerName}</p>
                      <Badge variant={dep.status === 'HELD' ? 'warning' : dep.status === 'REFUNDED' ? 'success' : 'error'}>
                        {dep.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Vehicle: {dep.vehicleInfo} • Received: {formatDate(dep.receivedDate)}
                    </p>
                    {dep.deductionReason && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        Deduction: {dep.deductionReason}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-secondary">{formatCurrency(dep.amountHeld)}</p>
                    {dep.refundedAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Refunded: {formatCurrency(dep.refundedAmount)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: ASSET PROFITABILITY */}
      {activeTab === 'profitability' && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Asset Capital Yield & Fleet Utilization Ranking</CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-surface-container text-on-surface-variant font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Vehicle Asset</th>
                  <th className="py-3 px-2">Gross Revenue</th>
                  <th className="py-3 px-2">Maintenance</th>
                  <th className="py-3 px-2">Net Profit</th>
                  <th className="py-3 px-2">Profit Margin</th>
                  <th className="py-3 px-2 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-medium">
                {profitability.map((p) => (
                  <tr key={p.vehicleId} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-2 font-bold text-on-surface">
                      {p.make} {p.model} (<span className="font-mono text-outline">{p.licensePlate}</span>)
                    </td>
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
      )}

      {/* Log Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={txType === 'INCOME' ? 'Record Revenue to Ledger' : 'Disburse Operating Fleet Expense'}
        description="Entry will be immediately posted to multi-tenant operating ledger"
      >
        <form onSubmit={handleCreateTx} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Amount ($)</label>
            <input
              type="number"
              required
              value={txAmount}
              onChange={(e) => setTxAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Category</label>
            <select
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            >
              {txType === 'INCOME' ? (
                <>
                  <option value="DIRECT_RENTAL">Direct Rental Revenue</option>
                  <option value="PARTNER_WHOLESALE">Partner Wholesale Income</option>
                  <option value="DEPOSIT_FORFEITURE">Deposit Forfeiture Recognized</option>
                </>
              ) : (
                <>
                  <option value="MAINTENANCE">Workshop Maintenance & Repairs</option>
                  <option value="FUEL">Fuel & Charging Costs</option>
                  <option value="INSURANCE">Insurance Premiums</option>
                  <option value="CLEANING">Detailing & Valeting</option>
                  <option value="LEASING">Asset Financing / Lease</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Brake service receipt #491"
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Commit to Ledger</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
