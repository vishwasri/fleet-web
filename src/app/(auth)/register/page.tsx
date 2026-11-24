'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { sendPhoneOtp, verifyPhoneOtp, registerOrganization } = useAuth();

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
  const [error, setError] = useState<string | null>(null);

  // Phone SMS verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendOtp = async () => {
    setOtpFeedback(null);
    const clean = formData.phone.trim();
    if (!clean || clean.length < 9) {
      setOtpFeedback({ type: 'error', message: 'Enter a valid mobile phone number first (e.g. 077 123 4567)' });
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(clean, 'REGISTER');
      if (res.success) {
        setShowOtpInput(true);
        setOtpFeedback({
          type: 'success',
          message: `SMS code dispatched to ${res.maskedPhone || clean} via SMS`,
        });
      } else {
        setOtpFeedback({ type: 'error', message: res.message || 'Failed to dispatch SMS' });
      }
    } catch (err: any) {
      setOtpFeedback({ type: 'error', message: err.message || 'Error communicating with SMS service' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpFeedback(null);
    if (otpCode.trim().length !== 6) {
      setOtpFeedback({ type: 'error', message: 'Enter the 6-digit SMS code' });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyPhoneOtp(formData.phone.trim(), otpCode.trim(), 'REGISTER');
      if (res.success) {
        setIsPhoneVerified(true);
        setShowOtpInput(false);
        setOtpFeedback({ type: 'success', message: 'Mobile phone successfully verified!' });
      } else {
        setOtpFeedback({ type: 'error', message: res.message || 'Invalid code' });
      }
    } catch (err: any) {
      setOtpFeedback({ type: 'error', message: err.message || 'Verification failed' });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.organizationName.trim()) {
      setError('Organization name is required.');
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Owner first and last name are required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Owner email address is required.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      setError('A valid mobile phone number is required.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Account password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await registerOrganization({
        organizationName: formData.organizationName.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim() || 'Central Yard Depot',
      });

      router.replace('/settings');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6">
      <main className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-surface-container shadow-2xl my-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Register Organization</h1>
            <span className="flex items-center gap-1 text-[10px] bg-secondary/10 text-secondary font-extrabold px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              SaaS Multi-Tenant
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Create your fleet account with verified mobile identity and start managing operations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-on-surface">Mobile Phone</label>
                {isPhoneVerified ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-secondary">Primary Auth</span>
                )}
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="077 123 4567"
                  value={formData.phone}
                  disabled={isPhoneVerified}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface text-xs text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none disabled:bg-surface-container disabled:opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Inline Phone SMS OTP Verification Box */}
          {!isPhoneVerified && formData.phone.trim().length >= 9 && (
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">SMS Identity Verification</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Powered by <strong className="text-secondary">smsapi.lk</strong>
                  </p>
                </div>
                {!showOtpInput && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingOtp ? 'Sending...' : 'Send SMS Code'}</span>
                  </button>
                )}
              </div>

              {showOtpInput && (
                <div className="pt-2 border-t border-surface-container flex items-center gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-white text-xs font-mono font-bold tracking-widest text-on-surface border border-outline-variant focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="h-9 px-4 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-sm flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isVerifyingOtp ? 'Checking...' : 'Verify'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="h-9 px-2 text-[11px] font-semibold text-secondary hover:underline"
                  >
                    Resend
                  </button>
                </div>
              )}

              {otpFeedback && (
                <p
                  className={`text-[11px] font-medium mt-1 ${
                    otpFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {otpFeedback.message}
                </p>
              )}
            </div>
          )}

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
            <label className="block text-xs font-bold text-on-surface mb-1">Account Password</label>
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
