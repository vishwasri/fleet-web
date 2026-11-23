import {
  mockDashboardSummary,
  mockVehicles,
  mockBookings,
  mockCustomers,
  mockPartnerRequests,
  mockPartnerOffers,
  mockPartnerRentals,
  mockPartnerMessages,
  mockTransactions,
  mockSecurityDeposits,
  mockVehicleProfitability,
  mockMaintenanceRecords,
  mockNotifications,
  mockOrganizations,
  mockUsers,
} from '@/lib/data/mock-data';
import {
  Booking,
  Customer,
  DashboardSummary,
  FinancialTransaction,
  MaintenanceRecord,
  NotificationItem,
  PartnerMessage,
  PartnerOffer,
  PartnerRental,
  PartnerRequest,
  SecurityDeposit,
  User,
  Vehicle,
  VehicleInspection,
  VehicleProfitability,
} from '@/types';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeOrgId: string = 'org_apex_01';
  private useMockApi: boolean = false;

  // In-memory data states for interactive mutation during session
  private vehicles: Vehicle[] = [...mockVehicles];
  private bookings: Booking[] = [...mockBookings];
  private customers: Customer[] = [...mockCustomers];
  private partnerRequests: PartnerRequest[] = [...mockPartnerRequests];
  private partnerOffers: PartnerOffer[] = [...mockPartnerOffers];
  private partnerRentals: PartnerRental[] = [...mockPartnerRentals];
  private partnerMessages: PartnerMessage[] = [...mockPartnerMessages];
  private transactions: FinancialTransaction[] = [...mockTransactions];
  private deposits: SecurityDeposit[] = [...mockSecurityDeposits];
  private maintenance: MaintenanceRecord[] = [...mockMaintenanceRecords];
  private notifications: NotificationItem[] = [...mockNotifications];

  constructor() {
    this.baseUrl =
      typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL
        ? process.env.NEXT_PUBLIC_API_BASE_URL
        : 'http://localhost:3005/api';

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
      localStorage.setItem('fleetlink_active_org_id', orgId);
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
      'X-Organization-Id': this.activeOrgId,
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const res = await fetch(url, { ...options, headers });

      if (res.status === 401 && this.refreshToken) {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      const json = await res.json();
      return (json.data !== undefined ? json.data : json) as T;
    } catch (err: any) {
      // If network fails (e.g. backend server is not running), throw to trigger fallback
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
        const tokens = json.data?.tokens || json.tokens;
        if (tokens?.accessToken) {
          this.setTokens(tokens.accessToken, tokens.refreshToken || this.refreshToken);
          return true;
        }
      }
    } catch {
      // refresh failed
    }
    this.setTokens(null, null);
    return false;
  }

  // --- Auth Methods ---
  async login(email: string, password: string):Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      return await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      // Mock login fallback
      const matchedUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || mockUsers[0];
      const tokens = {
        accessToken: `jwt_mock_token_${matchedUser.id}`,
        refreshToken: `jwt_refresh_mock_${matchedUser.id}`,
      };
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      return { user: matchedUser, tokens };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setTokens(null, null);
    }
  }

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      return await this.request('/internal/dashboard/summary');
    } catch {
      return {
        ...mockDashboardSummary,
        totalVehicles: this.vehicles.length,
        availableVehicles: this.vehicles.filter((v) => v.status === 'AVAILABLE').length,
        activeRentals: this.vehicles.filter((v) => v.status === 'RENTED').length,
        inMaintenance: this.vehicles.filter((v) => v.status === 'MAINTENANCE').length,
        partnerLoans: this.vehicles.filter((v) => v.status === 'PARTNER_LOAN').length,
        unreadNotificationsCount: this.notifications.filter((n) => !n.isRead).length,
      };
    }
  }

  // --- Vehicles ---
  async getVehicles(): Promise<Vehicle[]> {
    try {
      return await this.request('/internal/vehicles');
    } catch {
      return [...this.vehicles];
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    try {
      return await this.request(`/internal/vehicles/${id}`);
    } catch {
      return this.vehicles.find((v) => v.id === id);
    }
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await this.request('/internal/vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newVeh: Vehicle = {
        id: `veh_${Date.now()}`,
        organizationId: this.activeOrgId,
        make: data.make || 'Toyota',
        model: data.model || 'Corolla',
        year: data.year || 2024,
        licensePlate: data.licensePlate || `WP-CAB-${Math.floor(1000 + Math.random() * 9000)}`,
        category: data.category || 'Sedan',
        fuelType: data.fuelType || 'PETROL',
        transmission: data.transmission || 'AUTOMATIC',
        seatingCapacity: data.seatingCapacity || 5,
        currentOdometer: data.currentOdometer || 0,
        fuelLevelPercent: data.fuelLevelPercent || 100,
        dailyRate: data.dailyRate || 80,
        securityDeposit: data.securityDeposit || 300,
        wholesaleRate: data.wholesaleRate || 65,
        status: data.status || 'AVAILABLE',
        primaryImageUrl: data.primaryImageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
        locationHub: data.locationHub || 'Downtown Depot',
      };
      this.vehicles.unshift(newVeh);
      return newVeh;
    }
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      return await this.request(`/internal/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch {
      const idx = this.vehicles.findIndex((v) => v.id === id);
      if (idx !== -1) {
        this.vehicles[idx] = { ...this.vehicles[idx], ...data };
        return this.vehicles[idx];
      }
      throw new Error('Vehicle not found');
    }
  }

  async checkVehicleAvailability(vehicleId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const res: any = await this.request('/internal/availability/check', {
        method: 'POST',
        body: JSON.stringify({ vehicleId, startDate, endDate }),
      });
      return res.available;
    } catch {
      // Mock logic: Check if any active booking overlaps
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const conflicts = this.bookings.filter(
        (b) =>
          b.vehicleId === vehicleId &&
          b.status !== 'CANCELLED' &&
          b.status !== 'COMPLETED' &&
          !(end <= new Date(b.startDate).getTime() || start >= new Date(b.endDate).getTime()),
      );
      return conflicts.length === 0;
    }
  }

  // --- Bookings ---
  async getBookings(): Promise<Booking[]> {
    try {
      return await this.request('/internal/bookings');
    } catch {
      return [...this.bookings];
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      return await this.request(`/internal/bookings/${id}`);
    } catch {
      return this.bookings.find((b) => b.id === id);
    }
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    try {
      return await this.request('/internal/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const veh = this.vehicles.find((v) => v.id === data.vehicleId);
      const cust = this.customers.find((c) => c.id === data.customerId);
      const days = data.totalDays || 3;
      const rate = veh?.dailyRate || 100;
      const subtotal = rate * days;
      const deposit = veh?.securityDeposit || 400;

      const newBooking: Booking = {
        id: `bk_${Date.now()}`,
        bookingNumber: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        organizationId: this.activeOrgId,
        customerId: data.customerId || this.customers[0].id,
        customer: cust,
        vehicleId: data.vehicleId || this.vehicles[0].id,
        vehicle: veh,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date(Date.now() + 86400000 * 3).toISOString(),
        pickupHub: data.pickupHub || 'Downtown Depot',
        returnHub: data.returnHub || 'Downtown Depot',
        dailyRate: rate,
        totalDays: days,
        rentalSubtotal: subtotal,
        securityDeposit: deposit,
        extraChargesTotal: 0,
        grandTotal: subtotal + deposit,
        amountPaid: data.amountPaid || 0,
        balanceDue: subtotal + deposit - (data.amountPaid || 0),
        status: 'CONFIRMED',
        paymentStatus: (data.amountPaid || 0) >= subtotal + deposit ? 'PAID' : (data.amountPaid || 0) > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
        source: 'DIRECT',
        createdAt: new Date().toISOString(),
      };
      this.bookings.unshift(newBooking);
      return newBooking;
    }
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    try {
      return await this.request(`/internal/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const idx = this.bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        this.bookings[idx] = { ...this.bookings[idx], status };
        // Update vehicle status accordingly
        const vehIdx = this.vehicles.findIndex((v) => v.id === this.bookings[idx].vehicleId);
        if (vehIdx !== -1) {
          if (status === 'ACTIVE' || status === 'PICKED_UP') {
            this.vehicles[vehIdx].status = 'RENTED';
          } else if (status === 'COMPLETED' || status === 'CANCELLED') {
            this.vehicles[vehIdx].status = 'AVAILABLE';
          }
        }
        return this.bookings[idx];
      }
      throw new Error('Booking not found');
    }
  }

  async recordPayment(bookingId: string, amount: number, method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD'): Promise<Booking> {
    try {
      return await this.request(`/internal/bookings/${bookingId}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount, method }),
      });
    } catch {
      const idx = this.bookings.findIndex((b) => b.id === bookingId);
      if (idx !== -1) {
        const b = this.bookings[idx];
        const newPaid = b.amountPaid + amount;
        const newBalance = Math.max(0, b.grandTotal - newPaid);
        b.amountPaid = newPaid;
        b.balanceDue = newBalance;
        b.paymentStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

        // Add transaction record
        this.transactions.unshift({
          id: `tx_${Date.now()}`,
          organizationId: this.activeOrgId,
          referenceNumber: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'INCOME',
          category: 'DIRECT_RENTAL',
          amount,
          description: `Payment for booking ${b.bookingNumber}`,
          bookingId: b.id,
          vehicleId: b.vehicleId,
          paymentMethod: method,
          date: new Date().toISOString(),
        });

        return b;
      }
      throw new Error('Booking not found');
    }
  }

  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    try {
      return await this.request('/internal/customers');
    } catch {
      return [...this.customers];
    }
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      return await this.request(`/internal/customers/${id}`);
    } catch {
      return this.customers.find((c) => c.id === id);
    }
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    try {
      return await this.request('/internal/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        organizationId: this.activeOrgId,
        fullName: data.fullName || 'New Customer',
        email: data.email || 'customer@example.com',
        phone: data.phone || '+1 415 555 0100',
        nationalIdNumber: data.nationalIdNumber || '990192837V',
        drivingLicenseNumber: data.drivingLicenseNumber || 'B99281920',
        drivingLicenseExpiry: data.drivingLicenseExpiry || '2028-12-31',
        isVerified: data.isVerified ?? true,
        isBlacklisted: false,
        address: data.address || 'San Francisco, CA',
        notes: data.notes || '',
        totalRentalsCount: 0,
        balanceDue: 0,
        createdAt: new Date().toISOString(),
      };
      this.customers.unshift(newCust);
      return newCust;
    }
  }

  // --- Partner Network ---
  async getPartnerRequests(): Promise<PartnerRequest[]> {
    try {
      return await this.request('/partner/requests');
    } catch {
      return [...this.partnerRequests];
    }
  }

  async createPartnerRequest(data: Partial<PartnerRequest>): Promise<PartnerRequest> {
    try {
      return await this.request('/partner/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newReq: PartnerRequest = {
        id: `req_${Date.now()}`,
        requestNumber: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
        requesterOrgId: this.activeOrgId,
        requesterOrgName: 'Apex Rentals Global',
        category: data.category || 'SUV',
        preferredModel: data.preferredModel || '',
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date(Date.now() + 86400000 * 3).toISOString(),
        deliveryHub: data.deliveryHub || 'Downtown Depot',
        targetMaxWholesaleDailyRate: data.targetMaxWholesaleDailyRate || 100,
        status: 'OPEN',
        offersCount: 0,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      };
      this.partnerRequests.unshift(newReq);
      return newReq;
    }
  }

  async getPartnerOffers(requestId?: string): Promise<PartnerOffer[]> {
    try {
      return await this.request(requestId ? `/partner/requests/${requestId}/offers` : '/partner/offers');
    } catch {
      return requestId
        ? this.partnerOffers.filter((o) => o.requestId === requestId)
        : [...this.partnerOffers];
    }
  }

  async acceptPartnerOffer(offerId: string): Promise<PartnerRental> {
    try {
      return await this.request(`/partner/offers/${offerId}/accept`, { method: 'POST' });
    } catch {
      const offer = this.partnerOffers.find((o) => o.id === offerId);
      if (!offer) throw new Error('Offer not found');
      offer.status = 'ACCEPTED';

      const newRental: PartnerRental = {
        id: `pr_${Date.now()}`,
        agreementNumber: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
        supplierOrgId: offer.supplierOrgId,
        supplierOrgName: offer.supplierOrgName,
        requesterOrgId: this.activeOrgId,
        requesterOrgName: 'Apex Rentals Global',
        vehicleId: offer.vehicleId,
        vehicleMake: offer.vehicleMake,
        vehicleModel: offer.vehicleModel,
        licensePlate: offer.licensePlate,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        wholesaleDailyRate: offer.dailyWholesaleRate,
        cautionDeposit: offer.cautionDeposit,
        totalDays: 4,
        totalWholesaleAmount: offer.dailyWholesaleRate * 4,
        settlementPaid: 0,
        status: 'OFFER_ACCEPTED',
        createdAt: new Date().toISOString(),
      };
      this.partnerRentals.unshift(newRental);
      return newRental;
    }
  }

  async getPartnerRentals(): Promise<PartnerRental[]> {
    try {
      return await this.request('/partner/rentals');
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
      return await this.request(rentalId ? `/partner/rentals/${rentalId}/messages` : '/partner/messages');
    } catch {
      return [...this.partnerMessages];
    }
  }

  async sendPartnerMessage(rentalId: string, message: string): Promise<PartnerMessage> {
    try {
      return await this.request(`/partner/rentals/${rentalId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch {
      const newMsg: PartnerMessage = {
        id: `msg_${Date.now()}`,
        rentalId,
        senderOrgId: this.activeOrgId,
        senderOrgName: 'Apex Rentals Global',
        senderName: 'Alexander Pierce (Owner)',
        message,
        timestamp: new Date().toISOString(),
      };
      this.partnerMessages.push(newMsg);
      return newMsg;
    }
  }

  // --- Inspections ---
  async getInspections(): Promise<VehicleInspection[]> {
    try {
      return await this.request('/internal/inspections');
    } catch {
      return [];
    }
  }

  async createInspection(data: Partial<VehicleInspection>): Promise<VehicleInspection> {
    try {
      return await this.request('/internal/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const insp: VehicleInspection = {
        id: `insp_${Date.now()}`,
        organizationId: this.activeOrgId,
        bookingId: data.bookingId,
        vehicleId: data.vehicleId || this.vehicles[0].id,
        type: data.type || 'PICKUP',
        odometerReading: data.odometerReading || 25000,
        fuelLevelPercent: data.fuelLevelPercent || 100,
        inspectorName: data.inspectorName || 'Sarah Connor',
        photos: data.photos || {},
        checklistPassed: data.checklistPassed ?? true,
        items: data.items || [],
        notes: data.notes || 'Inspection completed successfully.',
        createdAt: new Date().toISOString(),
      };
      return insp;
    }
  }

  // --- Finance ---
  async getTransactions(): Promise<FinancialTransaction[]> {
    try {
      return await this.request('/internal/finance/transactions');
    } catch {
      return [...this.transactions];
    }
  }

  async getSecurityDeposits(): Promise<SecurityDeposit[]> {
    try {
      return await this.request('/internal/deposits');
    } catch {
      return [...this.deposits];
    }
  }

  async getVehicleProfitability(): Promise<VehicleProfitability[]> {
    try {
      return await this.request('/internal/reports/profitability');
    } catch {
      return [...mockVehicleProfitability];
    }
  }

  async createTransaction(data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      return await this.request('/internal/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const tx: FinancialTransaction = {
        id: `tx_${Date.now()}`,
        organizationId: this.activeOrgId,
        referenceNumber: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: data.type || 'INCOME',
        category: data.category || 'DIRECT_RENTAL',
        amount: data.amount || 100,
        description: data.description || 'General Ledger Entry',
        paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
        date: new Date().toISOString(),
      };
      this.transactions.unshift(tx);
      return tx;
    }
  }

  // --- Maintenance ---
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      return await this.request('/internal/maintenance/records');
    } catch {
      return [...this.maintenance];
    }
  }

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    try {
      return await this.request('/internal/maintenance/records', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const rec: MaintenanceRecord = {
        id: `maint_${Date.now()}`,
        organizationId: this.activeOrgId,
        vehicleId: data.vehicleId || this.vehicles[0].id,
        vehicleInfo: data.vehicleInfo || 'Vehicle',
        serviceType: data.serviceType || 'Routine Maintenance',
        workshopName: data.workshopName || 'Authorized Workshop',
        cost: data.cost || 200,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        targetCompletionDate: data.targetCompletionDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        odometer: data.odometer || 30000,
        status: 'SCHEDULED',
        notes: data.notes || '',
      };
      this.maintenance.unshift(rec);

      // Block vehicle
      const v = this.vehicles.find((veh) => veh.id === rec.vehicleId);
      if (v) v.status = 'MAINTENANCE';

      return rec;
    }
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await this.request('/internal/notifications');
    } catch {
      return [...this.notifications];
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await this.request(`/internal/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const notif = this.notifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await this.request('/internal/notifications/read-all', { method: 'PUT' });
    } catch {
      this.notifications.forEach((n) => (n.isRead = true));
    }
  }
}

export const api = new ApiClient();
