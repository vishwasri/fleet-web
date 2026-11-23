'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    organizationName: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6">
      <main className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-surface-container shadow-2xl my-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Register Organization</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Create your multi-tenant fleet account and start managing direct & partner rentals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Kasun"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Last Name</label>
              <input
                type="text"
                required
                placeholder="Perera"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Organization / Brand Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Apex Car Rentals LLC"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="owner@apex.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Primary Depot Hub Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="123 Galle Road, Colombo 03"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
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
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full h-11 text-xs font-bold mt-2">
            <span>Register & Initialize Organization</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-semibold text-secondary hover:underline">
            ← Already registered? Return to Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
