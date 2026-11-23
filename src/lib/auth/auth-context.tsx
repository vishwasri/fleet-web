'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Organization } from '@/types';
import { api } from '@/lib/api/client';
import { mockOrganizations, mockUsers } from '@/lib/data/mock-data';

interface AuthContextType {
  user: User | null;
  activeOrg: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  demoLogin: (userEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(mockOrganizations[0]);
  const [organizations] = useState<Organization[]>(mockOrganizations);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage if present, else initialize with default demo user
    try {
      const savedUser = localStorage.getItem('fleetlink_user_profile');
      const savedOrgId = localStorage.getItem('fleetlink_active_org_id');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default to Executive Owner for instant review
        setUser(mockUsers[0]);
        localStorage.setItem('fleetlink_user_profile', JSON.stringify(mockUsers[0]));
      }

      if (savedOrgId) {
        const found = mockOrganizations.find((o) => o.id === savedOrgId);
        if (found) setActiveOrg(found);
      } else {
        setActiveOrg(mockOrganizations[0]);
        api.setActiveOrgId(mockOrganizations[0].id);
      }
    } catch {
      setUser(mockUsers[0]);
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
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      localStorage.removeItem('fleetlink_user_profile');
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setActiveOrg(org);
      api.setActiveOrgId(org.id);
    }
  };

  const demoLogin = async (userEmail: string) => {
    const found = mockUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase()) || mockUsers[0];
    setUser(found);
    localStorage.setItem('fleetlink_user_profile', JSON.stringify(found));
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
