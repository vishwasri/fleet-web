'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Car,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Phone,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const {
    user,
    isAuthenticated,
    login,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPasswordWithPhone,
    isLoading,
  } = useAuth();

  // Tab: 'phone' (Primary) vs 'email'
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);

  // Email / Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Feedback Messages
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Reset Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetStep, setResetStep] = useState<'send' | 'confirm'>('send');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Auto redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination =
        redirectParam || (user.accountType === 'PLATFORM_ADMIN' ? '/super-admin' : '/');
      router.replace(destination);
    }
  }, [isAuthenticated, user, redirectParam, router]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Handle Phone OTP Dispatch
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const clean = phone.trim();
    if (!clean || clean.length < 9) {
      setError('Please enter a valid mobile phone number (e.g. 077 123 4567 or +94 77 123 4567)');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(clean, 'LOGIN');
      if (res.success) {
        setPhoneStep('enter_otp');
        setMaskedPhone(res.maskedPhone || clean);
        setResendCountdown(45);
        setSuccessMsg(`SMS verification code dispatched to ${res.maskedPhone || clean} via SMS`);
      } else {
        setError(res.message || 'Failed to send SMS code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with SMS service.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Phone OTP Verification & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyPhoneOtp(phone.trim(), otp.trim(), 'LOGIN');
      if (res.success) {
        if (res.userExists === false) {
          setError(
            'Phone number verified, but no FleetLink account is associated with this number. Please register first or sign in with email.',
          );
          return;
        }

        const isSuperAdmin =
          res.user?.accountType === 'PLATFORM_ADMIN' ||
          phone.includes('999') ||
          phone.endsWith('0000');
        const destination = redirectParam || (isSuperAdmin ? '/super-admin' : '/');
        router.replace(destination);
      } else {
        setError(res.message || 'Invalid or expired code. Please verify and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Traditional Email/Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const success = await login(email, password);
    if (success) {
      const isSuperAdmin = email.toLowerCase().includes('admin@fleetplatform');
      const destination = redirectParam || (isSuperAdmin ? '/super-admin' : '/');
      router.replace(destination);
    } else {
      setError('Invalid email or password. Please check your credentials or use Phone OTP.');
    }
  };

  // Reset Password Handlers
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetPhone.trim() || resetPhone.trim().length < 9) {
      setResetError('Please enter a valid phone number.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await sendPhoneOtp(resetPhone.trim(), 'PASSWORD_RESET');
      if (res.success) {
        setResetStep('confirm');
        setResetSuccess('Reset code sent to your mobile phone via SMS.');
      } else {
        setResetError(res.message || 'Failed to dispatch reset code.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (resetOtp.trim().length !== 6) {
      setResetError('Please enter the 6-digit OTP code.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetPasswordWithPhone(
        resetPhone.trim(),
        resetOtp.trim(),
        resetNewPassword,
      );
      if (res.success) {
        setResetSuccess('Password updated successfully! You can now log in.');
        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetStep('send');
          setResetOtp('');
          setResetNewPassword('');
          setResetSuccess(null);
          setActiveTab('email');
        }, 1500);
      } else {
        setResetError(res.message || 'Password reset failed.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <header className="w-full max-w-md text-center mb-6">
        <div className="relative w-full h-28 mb-3 rounded-2xl overflow-hidden shadow-ambient bg-gradient-to-br from-surface-container-high to-surface-dim flex items-center justify-center p-4">
          <Car className="w-12 h-12 text-primary opacity-80" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">FleetLink</h1>
        <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
          Multi-Tenant Vehicle Rental SaaS & B2B Partner Network
        </p>
      </header>

      {/* Main Sign In Box */}
      <main className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-surface-container shadow-2xl">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Welcome Back</h2>
            <span className="flex items-center gap-1 text-[10px] bg-secondary/10 text-secondary font-extrabold px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Verified Auth
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {redirectParam
              ? 'Authentication required to access requested resource'
              : 'Sign in to access your fleet operations and tenant workspaces'}
          </p>
        </div>

        {/* Primary Auth Selector Tabs */}
        <div className="flex p-1 rounded-2xl bg-surface border border-surface-container mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'phone'
                ? 'bg-white text-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile OTP (SMS)</span>
            <span className="text-[9px] bg-secondary/15 text-secondary px-1.5 py-0.2 rounded-md font-extrabold">
              Primary
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'email'
                ? 'bg-white text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {/* TAB 1: PHONE NUMBER & SMS OTP (PRIMARY) */}
        {activeTab === 'phone' && (
          <div>
            {phoneStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface">
                      Mobile Phone Number
                    </label>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      Sri Lanka (+94)
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-2 border-r border-surface-container text-xs font-bold text-on-surface">
                      <span>🇱🇰</span>
                      <span className="text-secondary">+94</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full h-11 pl-20 pr-4 rounded-xl bg-surface text-xs font-semibold text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center justify-between">
                    <span>Enter your 10-digit mobile number</span>
                    <span className="font-semibold text-secondary">Gateway: smsapi.lk</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  isLoading={isSendingOtp}
                  className="w-full h-11 text-xs font-bold mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send SMS Verification Code</span>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{maskedPhone || phone}</p>
                      <p className="text-[10px] text-on-surface-variant">Code sent via SMS</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('enter_phone');
                      setOtp('');
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1 text-center">
                    Enter 6-Digit SMS Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full h-12 pl-10 pr-4 text-center tracking-[0.4em] font-mono text-lg font-bold rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isVerifyingOtp}
                  className="w-full h-11 text-xs font-bold mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Code & Sign In</span>
                </Button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-on-surface-variant">
                    Didn&apos;t receive SMS?
                  </span>
                  {resendCountdown > 0 ? (
                    <span className="text-[11px] font-bold text-on-surface-variant">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isSendingOtp}
                      className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL & PASSWORD (LEGACY/BACKUP) */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-on-surface">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setResetPhone(phone || '0778818288');
                  }}
                  className="text-[11px] font-bold text-secondary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-11 text-xs font-bold mt-2"
            >
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Footer Registration Link */}
        <div className="mt-6 text-center pt-5 border-t border-surface-container">
          <p className="text-xs text-on-surface-variant">
            Don&apos;t have an organization account?{' '}
            <Link href="/register" className="font-bold text-secondary hover:underline">
              Register New Fleet Company
            </Link>
          </p>
        </div>
      </main>

      {/* Forgot Password SMS Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-surface-container shadow-2xl relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Reset Account Password</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Verify via mobile phone SMS code from smsapi.lk to reset your password
              </p>
            </div>

            {resetError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {resetSuccess}
              </div>
            )}

            {resetStep === 'send' ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Registered Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-xs font-medium text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <Button type="submit" isLoading={resetLoading} className="w-full h-11 text-xs font-bold">
                  <span>Send Reset SMS OTP</span>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    6-Digit SMS Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full h-11 px-4 text-center tracking-widest font-mono text-sm font-bold rounded-xl bg-surface text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    New Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface text-xs font-medium text-on-surface border border-outline-variant focus:border-secondary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <Button type="submit" isLoading={resetLoading} className="w-full h-11 text-xs font-bold">
                  <span>Set New Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
