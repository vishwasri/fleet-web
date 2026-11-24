import {
  Booking,
  Customer,
  DashboardSummary,
  FinancialTransaction,
  MaintenanceRecord,
  NotificationItem,
  PartnerMessage,
  PartnerOffer,
  PartnerOrganization,
  PartnerRental,
  PartnerRequest,
  SecurityDeposit,
  User,
  Vehicle,
  VehicleInspection,
  VehicleProfitability,
  SuperAdminCompany,
  PlatformMetrics,
  CreateCompanyInput,
  RegisterOrganizationInput,
  UpdateCompanyInput,
  OrganizationStatus,
  SubscriptionPlan,
  OrganizationDetailed,
  OrganizationMemberItem,
  OrgRole,
} from '@/types';

// ==========================================
// DATA NORMALIZERS (Bidirectional DB <-> UI)
// ==========================================

function normalizeVehicle(v: any): Vehicle {
  let images: string[] = [];
  if (Array.isArray(v.publicPhotos)) {
    images = v.publicPhotos;
  } else if (typeof v.publicPhotos === 'string') {
    try {
      const parsed = JSON.parse(v.publicPhotos);
      if (Array.isArray(parsed)) images = parsed;
    } catch {}
  }

  const primaryImg =
    v.primaryImageUrl ||
    images[0] ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';

  return {
    id: v.id,
    organizationId: v.organizationId,
    make: v.make || '',
    model: v.model || '',
    year: Number(v.year) || 2024,
    licensePlate: v.licensePlate || v.registrationNumber || '',
    vin: v.vin || undefined,
    category: v.category || 'Sedan',
    fuelType: v.fuelType || 'PETROL',
    transmission: v.transmission || 'AUTOMATIC',
    seatingCapacity: Number(v.seats ?? v.seatingCapacity ?? 5),
    currentOdometer: Number(v.mileage ?? v.currentOdometer ?? 0),
    fuelLevelPercent: Number(v.fuelLevelPercent ?? 100),
    dailyRate: Number(v.dailyRate || 0),
    securityDeposit: Number(v.securityDeposit || 0),
    wholesaleRate: Number(v.partnerDailyRate ?? v.wholesaleRate ?? 0),
    status: v.status || 'AVAILABLE',
    primaryImageUrl: primaryImg,
    images: images.length > 0 ? images : [primaryImg],
    features: v.features || [],
    locationHub: v.hubLocation || v.locationHub || 'Main Depot',
    insuranceExpiry: v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toISOString().split('T')[0] : v.insuranceExpiry,
    nextServiceOdometer: v.nextServiceOdometer,
    nextServiceDate: v.nextServiceDate,
    activeBookingId: v.activeBookingId,
  };
}

function normalizeCustomer(c: any): Customer {
  const fullName =
    c.fullName ||
    `${c.firstName || ''} ${c.lastName || ''}`.trim() ||
    'Customer';

  const totalRentals =
    c._count?.bookings ?? (Array.isArray(c.bookings) ? c.bookings.length : (c.totalRentalsCount || 0));

  let balanceDue = 0;
  if (Array.isArray(c.bookings)) {
    balanceDue = c.bookings.reduce(
      (sum: number, b: any) => sum + Number(b.balanceAmount || b.balanceDue || 0),
      0,
    );
  } else if (c.balanceDue) {
    balanceDue = Number(c.balanceDue);
  }

  return {
    id: c.id,
    organizationId: c.organizationId,
    fullName,
    email: c.email || '',
    phone: c.phone || '',
    nationalIdNumber: c.nationalIdNumber || '',
    drivingLicenseNumber: c.drivingLicenceNumber || c.drivingLicenseNumber || '',
    drivingLicenseExpiry: c.licenceExpiryDate
      ? new Date(c.licenceExpiryDate).toISOString().split('T')[0]
      : c.drivingLicenseExpiry,
    isVerified: c.isVerified ?? true,
    isBlacklisted: Boolean(c.isBlacklisted),
    blacklistReason: c.blacklistReason || undefined,
    address: c.address || '',
    notes: c.notes || '',
    totalRentalsCount: totalRentals,
    balanceDue,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  };
}

function normalizeBooking(b: any): Booking {
  return {
    id: b.id,
    bookingNumber: b.bookingNumber || `BK-${b.id?.slice(-6)?.toUpperCase() || 'REF'}`,
    organizationId: b.organizationId,
    customerId: b.customerProfileId || b.customerId,
    customer: b.customerProfile ? normalizeCustomer(b.customerProfile) : b.customer,
    vehicleId: b.vehicleId,
    vehicle: b.vehicle ? normalizeVehicle(b.vehicle) : b.vehicle,
    startDate: b.pickupDateTime ? new Date(b.pickupDateTime).toISOString() : (b.startDate || new Date().toISOString()),
    endDate: b.returnDateTime ? new Date(b.returnDateTime).toISOString() : (b.endDate || new Date().toISOString()),
    actualReturnDate: b.actualReturnDate,
    pickupHub: b.pickupLocation || b.pickupHub || 'Main Depot',
    returnHub: b.returnLocation || b.returnHub || 'Main Depot',
    dailyRate: Number(b.dailyRate || 0),
    totalDays: Number(b.numberOfDays ?? b.totalDays ?? 1),
    rentalSubtotal: Number(b.subtotal ?? b.rentalSubtotal ?? 0),
    securityDeposit: Number(b.depositAmount ?? b.securityDeposit ?? 0),
    extraChargesTotal: Number(b.extraChargesTotal || 0),
    grandTotal: Number(b.totalAmount ?? b.grandTotal ?? 0),
    amountPaid: Number(b.paidAmount ?? b.amountPaid ?? 0),
    balanceDue: Number(b.balanceAmount ?? b.balanceDue ?? 0),
    status: b.bookingStatus || b.status || 'CONFIRMED',
    paymentStatus: b.paymentStatus || 'UNPAID',
    source: b.bookingSource || b.source || 'DIRECT',
    notes: b.notes,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
  };
}

function normalizeVehicleProfitability(p: any): VehicleProfitability {
  const parts = (p.vehicleName || '').split(' ');
  return {
    vehicleId: p.vehicleId,
    make: p.make || parts[0] || 'Vehicle',
    model: p.model || parts.slice(1).join(' ') || '',
    licensePlate: p.licensePlate || p.registrationNumber || '',
    grossRevenue: Number(p.totalRevenue ?? p.grossRevenue ?? 0),
    operatingExpenses: Number(p.totalExpenses ?? p.operatingExpenses ?? 0),
    netProfit: Number(p.netProfit ?? 0),
    profitMarginPercent: Number(p.profitMargin ?? p.profitMarginPercent ?? 0),
    totalRentalDays: Number(p.rentalDays ?? p.totalRentalDays ?? 0),
    utilizationRatePercent: Number(p.utilizationRate ?? p.utilizationRatePercent ?? 0),
  };
}

function normalizeMaintenanceRecord(m: any): MaintenanceRecord {
  return {
    id: m.id,
    organizationId: m.organizationId,
    vehicleId: m.vehicleId,
    vehicleInfo: m.vehicle ? `${m.vehicle.make} ${m.vehicle.model} (${m.vehicle.registrationNumber})` : (m.vehicleInfo || 'Vehicle'),
    serviceType: m.title || m.serviceType || 'Routine Maintenance',
    workshopName: m.notes || m.workshopName || 'Authorized Service Hub',
    cost: Number(m.cost || 0),
    startDate: m.scheduledDate ? new Date(m.scheduledDate).toISOString().split('T')[0] : (m.startDate || new Date().toISOString().split('T')[0]),
    completedDate: m.completedDate ? new Date(m.completedDate).toISOString().split('T')[0] : undefined,
    targetCompletionDate: m.completedDate
      ? new Date(m.completedDate).toISOString().split('T')[0]
      : (m.targetCompletionDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]),
    odometer: Number(m.odometer || 0),
    status: m.status || 'SCHEDULED',
    notes: m.description || m.notes || '',
  };
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeOrgId: string = '';
  private useMockApi: boolean = false;

  // Local fallback caches for mutations during offline usage
  private vehicles: Vehicle[] = [];
  private bookings: Booking[] = [];
  private customers: Customer[] = [];
  private partnerRequests: PartnerRequest[] = [];
  private partnerOffers: PartnerOffer[] = [];
  private partnerRentals: PartnerRental[] = [];
  private partnerMessages: PartnerMessage[] = [];
  private transactions: FinancialTransaction[] = [];
  private deposits: SecurityDeposit[] = [];
  private maintenance: MaintenanceRecord[] = [];
  private notifications: NotificationItem[] = [];
  private superAdminCompanies: SuperAdminCompany[] = [];
  private detailedOrg: OrganizationDetailed | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // When running in a browser:
      // If we are accessing a cloud/production domain (not localhost), use the current origin /api
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        this.baseUrl = `${window.location.origin}/api`;
      } else {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api';
      }
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005/api';
    }

    this.useMockApi =
      typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('fleetlink_access_token');
      this.refreshToken = localStorage.getItem('fleetlink_refresh_token');
      const savedOrgId = localStorage.getItem('fleetlink_active_org_id');
      if (savedOrgId) {
        this.activeOrgId = savedOrgId;
      }
    }
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      if (accessToken) localStorage.setItem('fleetlink_access_token', accessToken);
      else localStorage.removeItem('fleetlink_access_token');

      if (refreshToken) localStorage.setItem('fleetlink_refresh_token', refreshToken);
      else localStorage.removeItem('fleetlink_refresh_token');
    }
  }

  setActiveOrgId(orgId: string) {
    this.activeOrgId = orgId;
    if (typeof window !== 'undefined') {
      if (orgId) {
        localStorage.setItem('fleetlink_active_org_id', orgId);
      } else {
        localStorage.removeItem('fleetlink_active_org_id');
      }
    }
  }

  getActiveOrgId(): string {
    return this.activeOrgId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.useMockApi) {
      throw new Error('USE_MOCK');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.activeOrgId) {
      headers['X-Organization-Id'] = this.activeOrgId;
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const res = await fetch(url, { ...options, headers });

      if (res.status === 401) {
        if (this.refreshToken) {
          const refreshed = await this.refreshTokens();
          if (refreshed) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            if (retryRes.ok) {
              const data = await retryRes.json();
              return (data.data !== undefined ? data.data : data) as T;
            }
          }
        }

        // If refresh was not possible or failed:
        this.setTokens(null, null);
        if (
          typeof window !== 'undefined' &&
          !endpoint.includes('/auth/login') &&
          !endpoint.includes('/auth/register') &&
          !endpoint.includes('/auth/phone')
        ) {
          localStorage.removeItem('fleetlink_user_profile');
          localStorage.removeItem('fleetlink_active_org');
          localStorage.removeItem('fleetlink_active_org_id');
          localStorage.removeItem('fleetlink_access_token');
          localStorage.removeItem('fleetlink_refresh_token');

          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      const json = await res.json();
      return (json.data !== undefined ? json.data : json) as T;
    } catch (err: any) {
      throw err;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (res.ok) {
        const json = await res.json();
        const payload = json.data !== undefined ? json.data : json;
        const newAccess =
          payload?.accessToken ||
          payload?.tokens?.accessToken ||
          json?.tokens?.accessToken;
        const newRefresh =
          payload?.refreshToken ||
          payload?.tokens?.refreshToken ||
          json?.tokens?.refreshToken ||
          this.refreshToken;

        if (newAccess) {
          this.setTokens(newAccess, newRefresh);
          return true;
        }
      }
    } catch {
      // refresh failed
    }
    this.setTokens(null, null);
    return false;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async registerOrganization(
    data: RegisterOrganizationInput,
  ): Promise<{
    user: User;
    organization: { id: string; legalName: string; displayName: string; role: OrgRole };
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const payload = {
      email: data.email.toLowerCase().trim(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      legalName: data.legalName?.trim() || data.organizationName.trim(),
      displayName: data.organizationName.trim(),
      organizationEmail: data.email.toLowerCase().trim(),
      organizationPhone: data.phone.trim(),
      address: data.address?.trim() || 'Main Operations Depot',
      timezone: data.timezone || 'Asia/Colombo',
      currency: data.currency || 'LKR',
    };

    const res = await this.request<{
      user: User;
      organization: { id: string; legalName: string; displayName: string; role: OrgRole };
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/register-organization', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.tokens) {
      this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    if (res.organization?.id) {
      this.setActiveOrgId(res.organization.id);
    }
    return res;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
    organizations?: any[];
  }> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.tokens) {
      this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    if (res.organizations && res.organizations.length > 0) {
      this.setActiveOrgId(res.organizations[0].id);
    }
    return res;
  }

  async sendPhoneOtp(
    phone: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' = 'LOGIN',
  ): Promise<{
    success: boolean;
    message: string;
    phone: string;
    maskedPhone: string;
    expiresInSeconds: number;
    simulated?: boolean;
  }> {
    return await this.request('/auth/phone/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    });
  }

  async verifyPhoneOtp(
    phone: string,
    otp: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' = 'LOGIN',
  ): Promise<{
    verified: boolean;
    userExists?: boolean;
    user?: User;
    tokens?: { accessToken: string; refreshToken: string };
    organizations?: any[];
    message?: string;
  }> {
    const res = await this.request<{
      verified: boolean;
      userExists?: boolean;
      user?: any;
      tokens?: { accessToken: string; refreshToken: string };
      organizations?: any[];
      message?: string;
    }>('/auth/phone/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, purpose }),
    });

    if (res.tokens) {
      this.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    }
    if (res.organizations && res.organizations.length > 0) {
      this.setActiveOrgId(res.organizations[0].id);
    }
    return res;
  }

  async resetPasswordWithPhone(
    phone: string,
    otp: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.request('/auth/phone/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, newPassword }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setTokens(null, null);
      this.setActiveOrgId('');
    }
  }

  // ==========================================
  // ORGANIZATION & SETTINGS
  // ==========================================

  async getCurrentOrganization(): Promise<OrganizationDetailed> {
    try {
      const res = await this.request<OrganizationDetailed>('/internal/organizations/current');
      if (res?.displayName) {
        this.detailedOrg = res;
      }
      return res;
    } catch (err) {
      if (this.detailedOrg) {
        return this.detailedOrg;
      }

      // Check localStorage for active organization
      if (typeof window !== 'undefined') {
        const activeOrgJson = localStorage.getItem('fleetlink_active_org');
        if (activeOrgJson) {
          try {
            const parsedOrg = JSON.parse(activeOrgJson);
            if (parsedOrg && parsedOrg.displayName) {
              const constructed: OrganizationDetailed = {
                id: parsedOrg.id,
                displayName: parsedOrg.displayName,
                legalName: parsedOrg.legalName || parsedOrg.displayName,
                email: parsedOrg.email || '',
                phone: parsedOrg.phone || '',
                address: parsedOrg.address || 'Commercial Depot Yard',
                timezone: parsedOrg.timezone || 'Asia/Colombo',
                currency: parsedOrg.currency || 'LKR',
                verified: true,
                status: 'ACTIVE',
                subscriptionPlan: 'STARTER',
                maxVehicles: 25,
                maxMembers: 5,
                billingCycle: 'MONTHLY',
                settings: {
                  currency: parsedOrg.currency || 'LKR',
                  timezone: parsedOrg.timezone || 'Asia/Colombo',
                  defaultMileageLimitPerDay: 250,
                  defaultExtraMileageRate: 100,
                  lateReturnGracePeriodMinutes: 60,
                  defaultDepositValue: 25000,
                  defaultDepositType: 'FIXED',
                },
                members: [],
                branchLocations: [],
                _count: {
                  vehicles: this.vehicles.length,
                  bookings: this.bookings.length,
                  members: 1,
                  customerProfiles: this.customers.length,
                },
              };
              this.detailedOrg = constructed;
              return constructed;
            }
          } catch {}
        }
      }

      throw err;
    }
  }

  async updateOrganization(data: Partial<OrganizationDetailed>): Promise<OrganizationDetailed> {
    const res = await this.request<OrganizationDetailed>('/internal/organizations/current', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res?.displayName) {
      this.detailedOrg = res;
    }
    return res;
  }

  async getOrganizationMembers(): Promise<OrganizationMemberItem[]> {
    try {
      const res: any = await this.request('/internal/organizations/current/members');
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch {
      return this.detailedOrg?.members || [];
    }
  }

  async addOrganizationMember(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: OrgRole;
  }): Promise<any> {
    return await this.request('/internal/organizations/current/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganizationMemberRole(memberId: string, role: OrgRole): Promise<any> {
    return await this.request(`/internal/organizations/current/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeOrganizationMember(memberId: string): Promise<any> {
    return await this.request(`/internal/organizations/current/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      return await this.request('/internal/dashboard/summary');
    } catch {
      return {
        totalVehicles: this.vehicles.length,
        availableVehicles: this.vehicles.filter((v) => v.status === 'AVAILABLE').length,
        activeRentals: this.vehicles.filter((v) => v.status === 'RENTED').length,
        inMaintenance: this.vehicles.filter((v) => v.status === 'MAINTENANCE').length,
        partnerLoans: this.vehicles.filter((v) => v.status === 'PARTNER_LOAN').length,
        fleetUtilizationPercent: 0,
        netProfit: 0,
        escrowDepositsHeld: 0,
        unreadNotificationsCount: 0,
        todayPickupsCount: 0,
        todayReturnsCount: 0,
        monthRevenue: 0,
        monthExpenses: 0,
        alerts: [],
        todaySchedule: [],
      };
    }
  }

  // ==========================================
  // VEHICLES
  // ==========================================

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res: any = await this.request('/internal/vehicles');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      const normalized = items.map(normalizeVehicle);
      this.vehicles = normalized;
      return normalized;
    } catch {
      return [...this.vehicles];
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    try {
      const res: any = await this.request(`/internal/vehicles/${id}`);
      return normalizeVehicle(res);
    } catch {
      return this.vehicles.find((v) => v.id === id);
    }
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const payload = {
      registrationNumber: (data.licensePlate || (data as any).registrationNumber || `WP-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      make: data.make?.trim() || 'Toyota',
      model: data.model?.trim() || 'Corolla',
      year: Number(data.year) || 2024,
      category: data.category?.trim() || 'Sedan',
      dailyRate: Number(data.dailyRate) || 80,
      partnerDailyRate: Number(data.wholesaleRate ?? (data as any).partnerDailyRate ?? (Number(data.dailyRate || 80) * 0.8)),
      securityDeposit: Number(data.securityDeposit) || 300,
      mileage: Number(data.currentOdometer ?? (data as any).mileage ?? 0),
      seats: Number(data.seatingCapacity ?? (data as any).seats ?? 5),
      fuelType: data.fuelType || 'PETROL',
      transmission: data.transmission || 'AUTOMATIC',
      status: data.status || 'AVAILABLE',
      hubLocation: data.locationHub || 'Main Depot',
      publicPhotos: data.primaryImageUrl ? [data.primaryImageUrl] : [],
    };

    try {
      const res: any = await this.request('/internal/vehicles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const created = normalizeVehicle(res);
      this.vehicles.unshift(created);
      return created;
    } catch (err: any) {
      if (this.useMockApi) {
        const fallbackVeh: Vehicle = {
          id: `veh_${Date.now()}`,
          organizationId: this.activeOrgId,
          make: payload.make,
          model: payload.model,
          year: payload.year,
          licensePlate: payload.registrationNumber,
          category: payload.category,
          fuelType: payload.fuelType as any,
          transmission: payload.transmission as any,
          seatingCapacity: payload.seats,
          currentOdometer: payload.mileage,
          fuelLevelPercent: 100,
          dailyRate: payload.dailyRate,
          securityDeposit: payload.securityDeposit,
          wholesaleRate: payload.partnerDailyRate,
          status: payload.status as any,
          primaryImageUrl: data.primaryImageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
          locationHub: payload.hubLocation,
        };
        this.vehicles.unshift(fallbackVeh);
        return fallbackVeh;
      }
      throw err;
    }
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const payload: any = { ...data };
    if (data.licensePlate) payload.registrationNumber = data.licensePlate;
    if (data.currentOdometer !== undefined) payload.mileage = data.currentOdometer;
    if (data.seatingCapacity !== undefined) payload.seats = data.seatingCapacity;
    if (data.wholesaleRate !== undefined) payload.partnerDailyRate = data.wholesaleRate;
    if (data.locationHub !== undefined) payload.hubLocation = data.locationHub;

    const res: any = await this.request(`/internal/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const updated = normalizeVehicle(res);
    const idx = this.vehicles.findIndex((v) => v.id === id);
    if (idx !== -1) this.vehicles[idx] = updated;
    return updated;
  }

  async checkVehicleAvailability(vehicleId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const res: any = await this.request('/internal/availability/check', {
        method: 'POST',
        body: JSON.stringify({ vehicleId, startDate, endDate }),
      });
      return Boolean(res.available);
    } catch {
      return true;
    }
  }

  // ==========================================
  // BOOKINGS
  // ==========================================

  async getBookings(): Promise<Booking[]> {
    try {
      const res: any = await this.request('/internal/bookings');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      const normalized = items.map(normalizeBooking);
      this.bookings = normalized;
      return normalized;
    } catch {
      return [...this.bookings];
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      const res: any = await this.request(`/internal/bookings/${id}`);
      return normalizeBooking(res);
    } catch {
      return this.bookings.find((b) => b.id === id);
    }
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const payload = {
      customerProfileId: data.customerId || (data as any).customerProfileId,
      vehicleId: data.vehicleId,
      pickupDateTime: new Date(data.startDate || Date.now()).toISOString(),
      returnDateTime: new Date(data.endDate || Date.now() + 86400000 * 3).toISOString(),
      pickupLocation: data.pickupHub || (data as any).pickupLocation || 'Main Operations Depot',
      returnLocation: data.returnHub || (data as any).returnLocation || 'Main Operations Depot',
      customDailyRate: data.dailyRate,
      depositAmount: data.securityDeposit,
      notes: data.notes || '',
    };

    try {
      const res: any = await this.request('/internal/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const created = normalizeBooking(res);
      this.bookings.unshift(created);
      return created;
    } catch (err: any) {
      if (this.useMockApi) {
        const newBooking: Booking = {
          id: `bk_${Date.now()}`,
          bookingNumber: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          organizationId: this.activeOrgId,
          customerId: payload.customerProfileId,
          vehicleId: payload.vehicleId!,
          startDate: payload.pickupDateTime,
          endDate: payload.returnDateTime,
          pickupHub: payload.pickupLocation,
          returnHub: payload.returnLocation,
          dailyRate: payload.customDailyRate || 100,
          totalDays: 3,
          rentalSubtotal: (payload.customDailyRate || 100) * 3,
          securityDeposit: payload.depositAmount || 300,
          extraChargesTotal: 0,
          grandTotal: (payload.customDailyRate || 100) * 3 + (payload.depositAmount || 300),
          amountPaid: 0,
          balanceDue: (payload.customDailyRate || 100) * 3 + (payload.depositAmount || 300),
          status: 'CONFIRMED',
          paymentStatus: 'UNPAID',
          source: 'DIRECT',
          notes: payload.notes,
          createdAt: new Date().toISOString(),
        };
        this.bookings.unshift(newBooking);
        return newBooking;
      }
      throw err;
    }
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const res: any = await this.request(`/internal/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const updated = normalizeBooking(res);
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) this.bookings[idx] = updated;
    return updated;
  }

  async recordPayment(bookingId: string, amount: number, method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD'): Promise<Booking> {
    const res: any = await this.request(`/internal/bookings/${bookingId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
    const updated = normalizeBooking(res);
    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) this.bookings[idx] = updated;
    return updated;
  }

  // ==========================================
  // CUSTOMERS CRM
  // ==========================================

  async getCustomers(): Promise<Customer[]> {
    try {
      const res: any = await this.request('/internal/customers');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      const normalized = items.map(normalizeCustomer);
      this.customers = normalized;
      return normalized;
    } catch {
      return [...this.customers];
    }
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const res: any = await this.request(`/internal/customers/${id}`);
      return normalizeCustomer(res);
    } catch {
      return this.customers.find((c) => c.id === id);
    }
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const nameParts = (data.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '.';

    const payload = {
      firstName,
      lastName,
      email: data.email?.toLowerCase().trim() || `client_${Date.now()}@example.com`,
      phone: data.phone?.trim() || '+94770000000',
      drivingLicenceNumber: data.drivingLicenseNumber?.trim() || (data as any).drivingLicenceNumber?.trim() || `DL-${Date.now().toString().slice(-6)}`,
      nationalIdNumber: data.nationalIdNumber?.trim() || `NIC-${Date.now().toString().slice(-6)}`,
      address: data.address?.trim() || '',
      notes: data.notes?.trim() || '',
    };

    try {
      const res: any = await this.request('/internal/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const created = normalizeCustomer(res);
      this.customers.unshift(created);
      return created;
    } catch (err: any) {
      if (this.useMockApi) {
        const newCust: Customer = {
          id: `cust_${Date.now()}`,
          organizationId: this.activeOrgId,
          fullName: `${payload.firstName} ${payload.lastName}`.trim(),
          email: payload.email,
          phone: payload.phone,
          nationalIdNumber: payload.nationalIdNumber,
          drivingLicenseNumber: payload.drivingLicenceNumber,
          isVerified: true,
          isBlacklisted: false,
          address: payload.address,
          notes: payload.notes,
          totalRentalsCount: 0,
          balanceDue: 0,
          createdAt: new Date().toISOString(),
        };
        this.customers.unshift(newCust);
        return newCust;
      }
      throw err;
    }
  }

  // ==========================================
  // PARTNER NETWORK
  // ==========================================

  async getConnectedPartners(): Promise<PartnerOrganization[]> {
    try {
      const res: any = await this.request('/partner/directory');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return items.map((p: any) => ({
        id: p.id,
        displayName: p.displayName || 'Partner Fleet',
        city: p.city || 'Colombo',
        hubLocation: p.hubLocation || p.address || 'Central Depot',
        rating: Number(p.rating || 5.0),
        fleetCount: Number(p.fleetCount || p._count?.vehicles || 0),
        isVerified: Boolean(p.isVerified ?? true),
        phone: p.phone,
      }));
    } catch {
      return [];
    }
  }

  async getPartnerRequests(): Promise<PartnerRequest[]> {
    try {
      const res: any = await this.request('/partner/requests');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      this.partnerRequests = items;
      return items;
    } catch {
      return [...this.partnerRequests];
    }
  }

  async createPartnerRequest(data: Partial<PartnerRequest>): Promise<PartnerRequest> {
    const res: any = await this.request('/partner/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.partnerRequests.unshift(res);
    return res;
  }

  async getPartnerOffers(requestId?: string): Promise<PartnerOffer[]> {
    try {
      const endpoint = requestId ? `/partner/requests/${requestId}/offers` : '/partner/offers';
      const res: any = await this.request(endpoint);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch {
      return [];
    }
  }

  async acceptPartnerOffer(offerId: string): Promise<PartnerRental> {
    return await this.request(`/partner/offers/${offerId}/accept`, { method: 'POST' });
  }

  async getPartnerRentals(): Promise<PartnerRental[]> {
    try {
      const res: any = await this.request('/partner/rentals');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      this.partnerRentals = items;
      return items;
    } catch {
      return [...this.partnerRentals];
    }
  }

  async getPartnerRentalById(id: string): Promise<PartnerRental | undefined> {
    try {
      return await this.request(`/partner/rentals/${id}`);
    } catch {
      return this.partnerRentals.find((r) => r.id === id);
    }
  }

  async getPartnerMessages(rentalId?: string): Promise<PartnerMessage[]> {
    try {
      const endpoint = rentalId ? `/partner/rentals/${rentalId}/messages` : '/partner/messages';
      const res: any = await this.request(endpoint);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch {
      return [];
    }
  }

  async sendPartnerMessage(rentalId: string, message: string): Promise<PartnerMessage> {
    return await this.request(`/partner/rentals/${rentalId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ==========================================
  // INSPECTIONS
  // ==========================================

  async getInspections(): Promise<VehicleInspection[]> {
    try {
      const res: any = await this.request('/internal/inspections');
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    } catch {
      return [];
    }
  }

  async createInspection(data: Partial<VehicleInspection>): Promise<VehicleInspection> {
    return await this.request('/internal/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // FINANCE & REPORTS
  // ==========================================

  async getTransactions(): Promise<FinancialTransaction[]> {
    try {
      const res: any = await this.request('/internal/finance/transactions');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      this.transactions = items;
      return items;
    } catch {
      return [...this.transactions];
    }
  }

  async getSecurityDeposits(): Promise<SecurityDeposit[]> {
    try {
      const res: any = await this.request('/internal/deposits');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      this.deposits = items;
      return items;
    } catch {
      return [...this.deposits];
    }
  }

  async getVehicleProfitability(): Promise<VehicleProfitability[]> {
    try {
      const res: any = await this.request('/internal/reports/vehicle-yields');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return items.map(normalizeVehicleProfitability);
    } catch {
      return [];
    }
  }

  async createTransaction(data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    return await this.request('/internal/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // MAINTENANCE
  // ==========================================

  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      const res: any = await this.request('/internal/maintenance');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const normalized = items.map(normalizeMaintenanceRecord);
      this.maintenance = normalized;
      return normalized;
    } catch {
      return [...this.maintenance];
    }
  }

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const payload = {
      vehicleId: data.vehicleId,
      title: data.serviceType || (data as any).title || 'Routine Maintenance',
      scheduledDate: new Date(data.startDate || (data as any).scheduledDate || Date.now()).toISOString(),
      cost: Number(data.cost) || 0,
      status: data.status || 'SCHEDULED',
      notes: data.notes || data.workshopName || '',
    };

    const res: any = await this.request('/internal/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = normalizeMaintenanceRecord(res);
    this.maintenance.unshift(created);
    return created;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res: any = await this.request('/internal/notifications');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      this.notifications = items;
      return items;
    } catch {
      return [...this.notifications];
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await this.request(`/internal/notifications/${id}/read`, { method: 'PUT' });
    } catch {}
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await this.request('/internal/notifications/read-all', { method: 'PUT' });
    } catch {}
    this.notifications.forEach((n) => (n.isRead = true));
  }

  // ==========================================
  // SUPER ADMIN PLATFORM MANAGEMENT
  // ==========================================

  async getSuperAdminMetrics(): Promise<PlatformMetrics> {
    try {
      const res: any = await this.request('/super-admin/metrics');
      return res;
    } catch {
      return {
        overview: {
          totalCompanies: 0,
          activeCompanies: 0,
          suspendedCompanies: 0,
          totalFleetVehicles: 0,
          fleetAvailable: 0,
          fleetRented: 0,
          fleetMaintenance: 0,
          totalBookings: 0,
          totalRegisteredUsers: 0,
          estimatedMRR: 0,
        },
        plansDistribution: {
          FREE_TRIAL: 0,
          STARTER: 0,
          PRO: 0,
          ENTERPRISE: 0,
        },
      };
    }
  }

  async getSuperAdminCompanies(params?: {
    search?: string;
    status?: OrganizationStatus;
    plan?: SubscriptionPlan;
    page?: number;
    limit?: number;
  }): Promise<{ items: SuperAdminCompany[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status) q.append('status', params.status);
      if (params?.plan) q.append('plan', params.plan);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));

      const res: any = await this.request(`/super-admin/companies?${q.toString()}`);
      const items = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const meta = res?.meta || { total: items.length, page: 1, limit: 10, totalPages: 1 };
      return { items, meta };
    } catch {
      return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    }
  }

  async getSuperAdminCompanyById(id: string): Promise<SuperAdminCompany | undefined> {
    try {
      return await this.request(`/super-admin/companies/${id}`);
    } catch {
      return undefined;
    }
  }

  async createCompany(
    data: CreateCompanyInput,
  ): Promise<{ company: Partial<SuperAdminCompany>; owner: { id: string; email: string; name: string } }> {
    return await this.request<{
      company: Partial<SuperAdminCompany>;
      owner: { id: string; email: string; name: string };
    }>('/super-admin/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: string, data: UpdateCompanyInput): Promise<SuperAdminCompany> {
    return await this.request(`/super-admin/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async setCompanyStatus(id: string, status: OrganizationStatus): Promise<SuperAdminCompany> {
    return await this.request(`/super-admin/companies/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async resetCompanyOwnerPassword(
    id: string,
    newPassword: string,
  ): Promise<{ message: string; ownerEmail: string }> {
    return await this.request(`/super-admin/companies/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }
}

export const api = new ApiClient();
