'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Organization, RegisterOrganizationInput } from '@/types';
import { api } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  activeOrg: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerOrganization: (data: RegisterOrganizationInput) => Promise<boolean>;
  sendPhoneOtp: (
    phone: string,
    purpose?: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET',
  ) => Promise<{
    success: boolean;
    message: string;
    phone?: string;
    maskedPhone?: string;
    expiresInSeconds?: number;
    simulated?: boolean;
  }>;
  verifyPhoneOtp: (
    phone: string,
    otp: string,
    purpose?: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET',
  ) => Promise<{
    success: boolean;
    userExists?: boolean;
    message?: string;
    user?: User;
  }>;
  resetPasswordWithPhone: (
    phone: string,
    otp: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  demoLogin: (userEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage if present
    try {
      const savedUser = localStorage.getItem('fleetlink_user_profile');
      const savedOrg = localStorage.getItem('fleetlink_active_org');
      const savedOrgId = localStorage.getItem('fleetlink_active_org_id');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }

      if (savedOrg) {
        try {
          const parsed = JSON.parse(savedOrg);
          setActiveOrg(parsed);
          api.setActiveOrgId(parsed.id);
        } catch {
          setActiveOrg(null);
        }
      } else if (savedOrgId) {
        api.setActiveOrgId(savedOrgId);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      localStorage.setItem('fleetlink_user_profile', JSON.stringify(res.user));

      if (res.organizations && res.organizations.length > 0) {
        const primaryOrg = res.organizations[0];
        setActiveOrg(primaryOrg);
        api.setActiveOrgId(primaryOrg.id);
        localStorage.setItem('fleetlink_active_org_id', primaryOrg.id);
        localStorage.setItem('fleetlink_active_org', JSON.stringify(primaryOrg));
        setOrganizations(res.organizations);
      }
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerOrganization = async (data: RegisterOrganizationInput): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.registerOrganization(data);
      setUser(res.user);
      localStorage.setItem('fleetlink_user_profile', JSON.stringify(res.user));

      if (res.organization) {
        const orgData: Organization = {
          id: res.organization.id,
          legalName: res.organization.legalName,
          displayName: res.organization.displayName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          timezone: data.timezone || 'Asia/Colombo',
          currency: data.currency || 'LKR',
          verified: true,
        };
        setActiveOrg(orgData);
        api.setActiveOrgId(orgData.id);
        localStorage.setItem('fleetlink_active_org_id', orgData.id);
        localStorage.setItem('fleetlink_active_org', JSON.stringify(orgData));
        setOrganizations([orgData]);
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setActiveOrg(null);
      api.setActiveOrgId('');
      localStorage.removeItem('fleetlink_user_profile');
      localStorage.removeItem('fleetlink_active_org');
      localStorage.removeItem('fleetlink_active_org_id');
      localStorage.removeItem('fleetlink_access_token');
      localStorage.removeItem('fleetlink_refresh_token');
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const sendPhoneOtp = async (
    phone: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' = 'LOGIN',
  ) => {
    return await api.sendPhoneOtp(phone, purpose);
  };

  const verifyPhoneOtp = async (
    phone: string,
    otp: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' = 'LOGIN',
  ) => {
    setIsLoading(true);
    try {
      const res = await api.verifyPhoneOtp(phone, otp, purpose);
      if (res.verified && res.user) {
        setUser(res.user);
        localStorage.setItem('fleetlink_user_profile', JSON.stringify(res.user));

        const resOrgs = (res as any).organizations;
        if (resOrgs && resOrgs.length > 0) {
          const primaryOrg = resOrgs[0];
          setActiveOrg(primaryOrg);
          api.setActiveOrgId(primaryOrg.id);
          localStorage.setItem('fleetlink_active_org_id', primaryOrg.id);
          localStorage.setItem('fleetlink_active_org', JSON.stringify(primaryOrg));
          setOrganizations(resOrgs);
        }

        return { success: true, userExists: true, message: res.message, user: res.user };
      }
      return { success: res.verified, userExists: res.userExists, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'OTP verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithPhone = async (
    phone: string,
    otp: string,
    newPassword: string,
  ) => {
    return await api.resetPasswordWithPhone(phone, otp, newPassword);
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setActiveOrg(org);
      api.setActiveOrgId(org.id);
      localStorage.setItem('fleetlink_active_org_id', org.id);
      localStorage.setItem('fleetlink_active_org', JSON.stringify(org));
    }
  };

  const demoLogin = async (userEmail: string) => {
    await login(userEmail, 'Fleet2026!Secure');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerOrganization,
        sendPhoneOtp,
        verifyPhoneOtp,
        resetPasswordWithPhone,
        logout,
        switchOrganization,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
