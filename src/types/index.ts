export type AccountType = 'BUSINESS_USER' | 'CUSTOMER' | 'SYSTEM_ADMIN';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'INSPECTOR' | 'STAFF';

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'PARTNER_LOAN' | 'INACTIVE';

export type TransmissionType = 'AUTOMATIC' | 'MANUAL';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export type BookingStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'ACTIVE'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export type BookingSource = 'DIRECT' | 'ONLINE_PORTAL' | 'PHONE' | 'WALK_IN' | 'PARTNER_NETWORK';

export type PartnerRentalStatus =
  | 'REQUESTED'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'HANDED_OVER'
  | 'ACTIVE'
  | 'RETURNED'
  | 'SETTLED'
  | 'CANCELLED';

export type PartnerRequestStatus = 'OPEN' | 'OFFERS_RECEIVED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export type PartnerOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type DepositStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'HELD'
  | 'PARTIALLY_DEDUCTED'
  | 'FULLY_DEDUCTED'
  | 'REFUNDED'
  | 'FORFEITED';

export type DepositType = 'SECURITY_BOND' | 'CAUTION_DEPOSIT' | 'FUEL_DEPOSIT';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'DEPOSIT_ESCROW';

export type TransactionCategory =
  | 'DIRECT_RENTAL'
  | 'PARTNER_WHOLESALE'
  | 'DEPOSIT_FORFEITURE'
  | 'FUEL'
  | 'MAINTENANCE'
  | 'INSURANCE'
  | 'CLEANING'
  | 'REPAIR'
  | 'FINE'
  | 'LEASING'
  | 'OTHER';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'VEHICLE_PICKUP'
  | 'VEHICLE_RETURN'
  | 'OVERDUE_RETURN'
  | 'PARTNER_REQUEST'
  | 'PARTNER_OFFER'
  | 'MAINTENANCE_DUE'
  | 'INSURANCE_EXPIRING'
  | 'PAYMENT_RECEIVED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: OrgRole;
  accountType: AccountType;
  avatarUrl?: string;
}

export interface OrganizationMembership {
  organizationId: string;
  displayName: string;
  legalName?: string;
  role: OrgRole;
  isPrimary?: boolean;
}

export interface Organization {
  id: string;
  displayName: string;
  legalName: string;
  email: string;
  phone: string;
  address?: string;
  timezone: string;
  currency: string;
  businessRegNumber?: string;
  taxNumber?: string;
  logoUrl?: string;
  verified?: boolean;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  category: string; // e.g. "Sedan", "SUV", "Electric", "Van"
  fuelType: FuelType;
  transmission: TransmissionType;
  seatingCapacity: number;
  currentOdometer: number;
  fuelLevelPercent: number;
  dailyRate: number;
  securityDeposit: number;
  wholesaleRate?: number;
  status: VehicleStatus;
  primaryImageUrl?: string;
  images?: string[];
  features?: string[];
  locationHub?: string;
  insuranceExpiry?: string;
  nextServiceOdometer?: number;
  nextServiceDate?: string;
  activeBookingId?: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string;
  nationalIdNumber: string; // NIC / Passport
  drivingLicenseNumber: string;
  drivingLicenseExpiry?: string;
  isVerified: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  address?: string;
  notes?: string;
  totalRentalsCount: number;
  balanceDue: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  organizationId: string;
  customerId: string;
  customer?: Customer;
  vehicleId: string;
  vehicle?: Vehicle;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  pickupHub: string;
  returnHub: string;
  dailyRate: number;
  totalDays: number;
  rentalSubtotal: number;
  securityDeposit: number;
  extraChargesTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  notes?: string;
  pickupInspectionId?: string;
  returnInspectionId?: string;
  createdAt: string;
}

export interface InspectionItem {
  id: string;
  category: 'EXTERIOR' | 'INTERIOR' | 'MECHANICAL' | 'DOCUMENTS' | 'ACCESSORIES';
  name: string;
  isPassed: boolean;
  remarks?: string;
  photoUrl?: string;
}

export interface VehicleInspection {
  id: string;
  organizationId: string;
  bookingId?: string;
  partnerRentalId?: string;
  vehicleId: string;
  type: 'PICKUP' | 'RETURN' | 'HANDOVER' | 'MAINTENANCE';
  odometerReading: number;
  fuelLevelPercent: number;
  inspectorName: string;
  customerSignature?: string;
  photos: {
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
    dashboard?: string;
  };
  damages?: {
    location: string;
    severity: 'MINOR' | 'MODERATE' | 'SEVERE';
    notes: string;
  }[];
  items: InspectionItem[];
  checklistPassed: boolean;
  notes?: string;
  createdAt: string;
}

export interface PartnerOrganization {
  id: string;
  displayName: string;
  city: string;
  hubLocation: string;
  rating: number;
  fleetCount: number;
  isVerified: boolean;
  phone?: string;
}

export interface PartnerRequest {
  id: string;
  requestNumber: string;
  requesterOrgId: string;
  requesterOrgName: string;
  category: string;
  preferredModel?: string;
  startDate: string;
  endDate: string;
  deliveryHub: string;
  targetMaxWholesaleDailyRate: number;
  status: PartnerRequestStatus;
  offersCount: number;
  createdAt: string;
  notes?: string;
}

export interface PartnerOffer {
  id: string;
  requestId: string;
  supplierOrgId: string;
  supplierOrgName: string;
  supplierRating: number;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  dailyWholesaleRate: number;
  cautionDeposit: number;
  includedKmPerDay: number;
  excessKmRate: number;
  pickupHub: string;
  status: PartnerOfferStatus;
  createdAt: string;
}

export interface PartnerRental {
  id: string;
  agreementNumber: string;
  supplierOrgId: string;
  supplierOrgName: string;
  requesterOrgId: string;
  requesterOrgName: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  wholesaleDailyRate: number;
  cautionDeposit: number;
  totalDays: number;
  totalWholesaleAmount: number;
  settlementPaid: number;
  status: PartnerRentalStatus;
  handoverInspectionId?: string;
  returnInspectionId?: string;
  notes?: string;
  createdAt: string;
}

export interface PartnerMessage {
  id: string;
  rentalId?: string;
  requestId?: string;
  senderOrgId: string;
  senderOrgName: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  referenceNumber: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  bookingId?: string;
  partnerRentalId?: string;
  vehicleId?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHEQUE';
  date: string;
}

export interface SecurityDeposit {
  id: string;
  organizationId: string;
  bookingId: string;
  customerName: string;
  vehicleInfo: string;
  amountHeld: number;
  deductedAmount: number;
  refundedAmount: number;
  status: DepositStatus;
  receivedDate: string;
  refundDate?: string;
  deductionReason?: string;
}

export interface VehicleProfitability {
  vehicleId: string;
  make: string;
  model: string;
  licensePlate: string;
  grossRevenue: number;
  operatingExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  totalRentalDays: number;
  utilizationRatePercent: number;
}

export interface MaintenanceRecord {
  id: string;
  organizationId: string;
  vehicleId: string;
  vehicleInfo: string;
  serviceType: string; // e.g. "Periodic 10,000 KM Service", "Brake Pad Replacement"
  workshopName: string;
  cost: number;
  startDate: string;
  completedDate?: string;
  targetCompletionDate: string;
  odometer: number;
  status: MaintenanceStatus;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkRoute?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalVehicles: number;
  availableVehicles: number;
  activeRentals: number;
  inMaintenance: number;
  partnerLoans: number;
  fleetUtilizationPercent: number;
  todayPickupsCount: number;
  todayReturnsCount: number;
  monthRevenue: number;
  monthExpenses: number;
  netProfit: number;
  escrowDepositsHeld: number;
  unreadNotificationsCount: number;
  alerts: {
    id: string;
    title: string;
    severity: 'WARNING' | 'ALERT' | 'INFO';
    route: string;
  }[];
  todaySchedule: {
    id: string;
    bookingNumber: string;
    customerName: string;
    vehicleName: string;
    type: 'PICKUP' | 'RETURN';
    time: string;
    hub: string;
    status: string;
  }[];
}
