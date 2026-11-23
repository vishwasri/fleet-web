# FleetLink Web — Enterprise Fleet & B2B Partner Rental Management

FleetLink Web is a modern, responsive **Next.js** application developed for car rental businesses, fleet dispatchers, and B2B inter-fleet networks. It achieves complete functional parity with the NestJS backend and Flutter mobile application, styled according to the executive Stitch screen designs.

---

## 🚀 Key Modules & Screen Coverage

| Module | Route | Functionality |
| :--- | :--- | :--- |
| **Welcome / Sign In** | `/login` | Brand welcome screen, credentials login, one-click demo logins (`Owner`, `Manager`, `Dinuka - LankaFleet`), and organization registration link. |
| **Register Organization** | `/register` | Multi-tenant organization registration form with first `OWNER` profile. |
| **Home Dashboard** | `/` | Operational pulse cards (Available Fleet, Active Rentals, In Maintenance, Partner Loans), operational alerts bar, today's schedule, fleet utilization progress, and MTD operating ledger. |
| **Vehicles Fleet** | `/vehicles` | Grid & list views with 5-state filters (`Available`, `Rented`, `Partner Loan`, `Maintenance`), fuel gauge/battery levels, odometers, and daily rates. |
| **Vehicle Detail** | `/vehicles/[id]` | 4-tab deep dive: **Overview** (technical specs, depot hub, insurance), **Availability Calendar** (reservations & maintenance blocks), **Asset Finance** (revenue, maintenance costs, ROI margin %), and **Logbook** (past repairs). |
| **Add Vehicle Wizard** | `/vehicles/new` | 3-step fleet asset registration wizard (Basic Identity → Technical Specs & Depot Hub → Pricing & Caution Bonds). |
| **Bookings List** | `/bookings` | Rental agreements directory with search, filter tabs (`Confirmed`, `Active`, `Completed`, `Overdue`), schedule timelines, and payment status badges. |
| **Create Direct Booking** | `/bookings/new` | 5-step booking wizard (Verified Customer → Vehicle Selection with **Live Availability Engine Check** → Schedule & Hubs → Pricing & Escrow Bond → Review & Confirmation). |
| **Booking Detail & Lifecycle** | `/bookings/[id]` | 6-stage lifecycle progress tracker (`Draft` → `Confirmed` → `Picked Up` → `Active` → `Returned` → `Completed`), financial breakdown, and inspection launchers. |
| **Pickup Inspection** | `/inspections/pickup/[id]` | Departure checklist, fuel slider (0–100%), odometer input, 4-angle condition photo placeholders, notes, and digital key handover authorization. |
| **Return Inspection** | `/inspections/return/[id]` | Receiving checklist, fuel level comparison, return odometer check, and return agreement settlement closure. |
| **B2B Partner Network** | `/partners` | Inter-fleet wholesale hub with **Active B2B Rentals**, **Sourcing Broadcasts**, and **Verified Partner Fleet Directory**. |
| **Source Partner Vehicle** | `/partners/request` | Broadcast vehicle sourcing wizard across regional partner fleets. |
| **Wholesale Partner Offers** | `/partners/offers` | Compare incoming wholesale quotes from verified fleets (rating, wholesale rate, caution bond, excess km rates) and accept offer. |
| **Partner Rental Detail** | `/partners/rentals/[id]` | 7-stage B2B lifecycle tracker (`Request` → `Offer Received` → `Offer Accepted` → `Handed Over` → `Active` → `Returned` → `Settled`), wholesale financial ledger, and shielded dispatcher chat. |
| **Customers CRM** | `/customers` | Private tenant customer directory, verified driving license & NIC badges, past rental history, balance due tracker, and Add Customer modal. |
| **Finance & Ledgers** | `/finance` | Operating ledger, revenue vs expense cards, **Escrow Caution Deposit Trust** segregation, transaction ledger, and Log Income / Log Expense modals. |
| **Maintenance** | `/maintenance` | Periodic service history, workshop tracker, garage repair costs, and **Schedule Service** modal with automatic availability calendar date blocks. |
| **Executive Reports** | `/reports` | Analytics dashboard, direct consumer vs wholesale revenue split, fleet utilization rate, top performing assets ranking, and CSV export. |
| **Notifications Center** | `/notifications` | Operational alerts stream with 10 alert categories, filtering, and deep navigation links. |
| **Settings & Organization** | `/settings` | Multi-tenant organization profile, default pricing & deposit rates, compliance rules, staff roles, and sign out. |

---

## 🔒 Critical Business & Accounting Rules Enforced

1. **Backend Availability Checking Engine**:
   - Every booking creation and schedule update calls `/internal/availability/check` to guarantee zero double bookings.
2. **B2B Partner Customer Privacy Shield**:
   - Customer personal identifiable information (PII) is strictly redacted in partner network channels; only vehicle specifications and wholesale rates are shared.
3. **Escrow Caution Deposit Accounting Segregation**:
   - Security caution deposits are maintained in an escrow liability trust and strictly excluded from operating revenue and net profit formulas.
4. **Decimal-Safe Financial Engine**:
   - Currency math is executed with fixed-point cent arithmetic (`DecimalMoney`), eliminating floating-point rounding inaccuracies.

---

## 🛠 Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Settings:
- `NEXT_PUBLIC_API_BASE_URL`: Base REST backend URL (defaults to `http://localhost:3005/api`).
- `NEXT_PUBLIC_USE_MOCK_API`: Toggle `false` to connect to live NestJS backend, or `true` for offline demo mode. If the live backend is unreachable, the API client automatically falls back to interactive mock simulation.

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Execution
```bash
npm run build
npm run start
```
