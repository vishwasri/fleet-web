'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('owner@apexrentals.com');
  const [password, setPassword] = useState('Fleet2026!Secure');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoSignIn = async (demoEmail: string) => {
    await demoLogin(demoEmail);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header Section */}
      <header className="w-full max-w-md text-center mb-6">
        <div className="relative w-full h-36 mb-4 rounded-2xl overflow-hidden shadow-ambient bg-gradient-to-br from-surface-container-high to-surface-dim flex items-center justify-center p-4">
          <Car className="w-16 h-16 text-primary opacity-80" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">FleetLink</h1>
        <p className="text-xs font-semibold text-on-surface-variant mt-1">
          Professional Fleet Management & B2B Partner Network
        </p>
      </header>

      {/* Main Sign In Card */}
      <main className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-surface-container shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-on-surface">Welcome Back</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Sign in to manage your vehicles, bookings, and partner network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-xs font-medium text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-xs font-medium text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full h-11 text-xs font-bold mt-2">
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-6 pt-6 border-t border-surface-container">
          <div className="flex items-center gap-1.5 mb-3 text-secondary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('owner@apexrentals.com')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-surface-container bg-surface hover:bg-surface-container-high transition-colors text-left"
            >
              <div>
                <p className="text-xs font-bold text-on-surface">Alexander Pierce (Owner)</p>
                <p className="text-[10px] text-on-surface-variant">Apex Rentals Global • Full Access</p>
              </div>
              <span className="text-[11px] font-bold text-secondary">Switch →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('staff@apexrentals.com')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-surface-container bg-surface hover:bg-surface-container-high transition-colors text-left"
            >
              <div>
                <p className="text-xs font-bold text-on-surface">Sarah Connor (Manager)</p>
                <p className="text-[10px] text-on-surface-variant">Operations & Fleet Dispatch</p>
              </div>
              <span className="text-[11px] font-bold text-secondary">Switch →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('dinuka@kamalasirirentacar.com')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-surface-container bg-surface hover:bg-surface-container-high transition-colors text-left"
            >
              <div>
                <p className="text-xs font-bold text-on-surface">Dinuka Sampath (Kamalasiri Fleet)</p>
                <p className="text-[10px] text-on-surface-variant">Colombo Sri Lanka Depot</p>
              </div>
              <span className="text-[11px] font-bold text-secondary">Switch →</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="text-xs font-semibold text-secondary hover:underline"
          >
            Register a New Rent-a-Car Business →
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-center text-[11px] text-on-surface-variant flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
        <span>Enterprise Clean Architecture & Decimal-Safe Ledger</span>
      </footer>
    </div>
  );
}
