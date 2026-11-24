'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AccountType } from '@/types';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredAccountTypes?: AccountType[];
}

export function AuthGuard({ children, requiredAccountTypes }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-4 animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant mt-4">
          Redirecting to authentication...
        </p>
      </div>
    );
  }

  // Check role / accountType restrictions if requested
  if (
    requiredAccountTypes &&
    requiredAccountTypes.length > 0 &&
    user &&
    !requiredAccountTypes.includes(user.accountType)
  ) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-5 bg-white border border-surface-container shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-on-surface">Access Restricted</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This portal requires <strong className="text-on-surface">Platform Super Admin</strong> privileges.
              Your current account is authenticated as a tenant business user.
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl text-left text-xs border border-surface-container space-y-1">
            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Current Account:</p>
            <p className="font-bold text-on-surface">{user.email}</p>
            <p className="text-[11px] text-secondary">Account Type: {user.accountType}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link href="/" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tenant Workspace</span>
              </Button>
            </Link>
            <Link href="/login?redirect=/super-admin" className="w-full">
              <Button size="sm" className="w-full">
                <LogIn className="w-3.5 h-3.5 text-secondary-container" />
                <span>Switch Account</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
