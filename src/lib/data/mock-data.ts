import {
  User,
  Organization,
  Vehicle,
  Customer,
  Booking,
  PartnerOrganization,
  PartnerRequest,
  PartnerOffer,
  PartnerRental,
  PartnerMessage,
  FinancialTransaction,
  SecurityDeposit,
  VehicleProfitability,
  MaintenanceRecord,
  NotificationItem,
  DashboardSummary,
  SuperAdminCompany,
  PlatformMetrics,
} from '@/types';

export const mockUsers: User[] = [];
export const mockOrganizations: Organization[] = [];
export const mockVehicles: Vehicle[] = [];
export const mockCustomers: Customer[] = [];
export const mockBookings: Booking[] = [];
export const mockPartnerOrgs: PartnerOrganization[] = [];
export const mockPartnerRequests: PartnerRequest[] = [];
export const mockPartnerOffers: PartnerOffer[] = [];
export const mockPartnerRentals: PartnerRental[] = [];
export const mockPartnerMessages: PartnerMessage[] = [];
export const mockTransactions: FinancialTransaction[] = [];
export const mockSecurityDeposits: SecurityDeposit[] = [];
export const mockVehicleProfitability: VehicleProfitability[] = [];
export const mockMaintenanceRecords: MaintenanceRecord[] = [];
export const mockNotifications: NotificationItem[] = [];

export const mockDashboardSummary: DashboardSummary = {
  totalVehicles: 0,
  availableVehicles: 0,
  activeRentals: 0,
  inMaintenance: 0,
  partnerLoans: 0,
  fleetUtilizationPercent: 0,
  todayPickupsCount: 0,
  todayReturnsCount: 0,
  monthRevenue: 0,
  monthExpenses: 0,
  netProfit: 0,
  escrowDepositsHeld: 0,
  unreadNotificationsCount: 0,
  alerts: [],
  todaySchedule: [],
};

export const mockPlatformMetrics: PlatformMetrics = {
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
  plansDistribution: {},
};

export const mockSuperAdminCompanies: SuperAdminCompany[] = [];
