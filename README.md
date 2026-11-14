# Dawa2y (دوائي) Pharmacies - Enterprise Healthcare & E-Commerce Platform

[![.NET](https://img.shields.io/badge/.NET-9.0%20%2F%2010%20Ready-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/Database-Microsoft%20SQL%20Server%20(SSMS)-CC292B?logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-008080)](#-architecture-overview)
[![Bilingual](https://img.shields.io/badge/Language-Arabic%20(RTL)%20%7C%20English%20(LTR)-blue)](#-key-features)
[![Unit Tests](https://img.shields.io/badge/Tests-15%20Passed-brightgreen)](#-unit-testing)

An enterprise-grade, clean-architecture pharmacy e-commerce and multi-branch management platform built for **"Dawa2y" (دوائي) Pharmacies** — one of Egypt's leading healthcare providers established in **1985**, operating **30 branches** across Egyptian governorates, serving **~5,000 visitors per day** with a catalog of **500+ medications and healthcare items**.

---

## 🏛️ Architecture Overview

The system strictly adheres to **Clean Architecture** principles and is partitioned into three decoupled runtime applications:

```
├── backend/                           # .NET Clean Architecture Solution
│   ├── src/Dawa2y.Domain/             # Entities, Enums, Value Objects (Zero dependencies)
│   ├── src/Dawa2y.Application/        # DTOs, Service Contracts, FluentValidation Rules
│   ├── src/Dawa2y.Infrastructure/     # EF Core Microsoft SQL Server, BCrypt, JWT, Payment Gateways
│   ├── src/Dawa2y.API/                # ASP.NET Core REST API, Swagger UI, OWASP Middlewares, CORS
│   └── tests/Dawa2y.Tests/            # xUnit Test Suite (15 passing automated tests)
│
├── frontend/
│   ├── dawa2y-store-web/              # Public Customer Store (Port 4200)
│   │   ├── Arabic (RTL) & English (LTR) with dynamic layout and Cairo font
│   │   ├── Official "Blue & White" Clinical Identity (Established 1985)
│   │   ├── 500+ Items Catalog with Prescription (Rx) warnings and Category filters
│   │   ├── Checkout: Visa (with Luhn checksum validation) & Pay on Door (Cash on Delivery)
│   │   └── Real-time 30-Branch Delivery & Order Tracking
│   │
│   └── dawa2y-admin/                  # INDEPENDENT Central Admin Portal (Port 4201)
│       ├── Completely isolated bundle & routing (Zero exposure to customer portal)
│       ├── Executive Insights: ~5,000 daily visitors, revenue, 7-day sales chart
│       ├── Medications CRUD: Add (modal), Edit, and Delete with confirmation
│       ├── Multi-Branch Stock Control: Real-time inventory across 30 branches with quick adjustments (+1, +10, -1, -5)
│       └── Order Dispatcher: Payment verification (Visa vs Cash on Door) & status workflow
```

---

## 🗄️ Microsoft SQL Server & SSMS Integration

The database is built on **Microsoft SQL Server** and fully visible in **SQL Server Management Studio (SSMS)**:

- **Server**: `.` or `localhost` (Windows Authentication / Trusted Connection)
- **Database Name**: `Dawa2yDb`
- **Tables**:
  - `dbo.Products` (Catalog with prices, discounts, Rx prescription flags, stock)
  - `dbo.Branches` (30 authentic branches across Egyptian governorates)
  - `dbo.BranchInventories` (Multi-branch stock allocation across all 30 branches)
  - `dbo.Orders` (Orders with fulfillment branch assignment and delivery status)
  - `dbo.OrderItems` (Purchased medications per order)
  - `dbo.Payments` (Visa card brand, transaction ID, settlement status)
  - `dbo.Users` (Admin, Pharmacist, Customer accounts with BCrypt hashing)
  - `dbo.DailyInsights` (Historical visitors, ~5,000 daily traffic records)
  - `dbo.Carts` & `dbo.CartItems` (Shopping carts)

Connection string in `backend/src/Dawa2y.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=Dawa2yDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True;"
}
```

---

## 🔒 Security & OWASP Protections

1. **Independent Admin Application Boundary**:
   - The Admin Dashboard is physically separated as an independent web application (`frontend/dawa2y-admin`) running on a dedicated port (`4201`).
   - Customer store bundles contain zero admin code, zero admin routes, and zero admin API keys, eliminating client-side route probing or bundle inspection.
2. **Role-Based Access Control (RBAC)**:
   - Backend API endpoints under `/api/admin/*` are strictly protected with `[Authorize(Roles = "Admin")]`.
   - JWT tokens signed with HMAC-SHA256 enforce roles (`Admin`, `Pharmacist`, `Customer`).
3. **Password Hashing**:
   - Industry-standard **BCrypt** with work factor 11 and cryptographic salting.
4. **OWASP Security Headers**:
   - `Content-Security-Policy: default-src 'self' ...`
   - `X-Frame-Options: DENY` (Anti-Clickjacking)
   - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `X-XSS-Protection: 1; mode=block`
5. **Payment Gateway Integrity**:
   - Real-time **Luhn checksum algorithm** validation.
   - Brand detection for Visa, Mastercard, and Egyptian national card Meeza.
   - Expiration date verification and CVV format constraints.
   - Support for **Pay on Door / Cash on Delivery (الدفع عند الاستلام)**.
6. **Input Validation & Regex**:
   - FluentValidation for Egyptian phone numbers (`010`, `011`, `012`, `015`).
   - 27 Egyptian Governorates enum validation.

---

## 🔑 Pre-Seeded Default Accounts

The database seeds automatically upon first run with the following accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@dawa2y.com` | `Admin@123456` | Full Admin Dashboard & 30-Branch Inventory |
| **Pharmacist** | `pharmacist@dawa2y.com` | `Pharm@123456` | Prescription & Stock Operations |
| **Customer** | `customer@dawa2y.com` | `Customer@123456` | Online Store & Order Tracking |

---

## 💳 Test Payment Credentials

For testing Visa / Credit Card checkout with real-time Luhn algorithm validation:

- **Card Number**: `4532015112830366` (Valid Visa test card with valid Luhn checksum)
- **Cardholder Name**: `Any Name` (e.g., `Ahmed Mohamed`)
- **Expiry**: `12/28` (Any future date)
- **CVV**: `123` (3 digits)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Microsoft SQL Server** (Running locally on `.` or `localhost`)
- **SQL Server Management Studio (SSMS)** (To view and query `Dawa2yDb`)
- **.NET SDK 9.0 or 10.0**
- **Node.js 20+** and **npm**

---

### 2. Run Backend API (.NET)

```powershell
cd "backend/src/Dawa2y.API"
dotnet run
```
- API starts listening on: **`http://localhost:5000`**
- **Interactive Swagger UI**: **`http://localhost:5000/swagger`**
- Visiting **`http://localhost:5000`** directly redirects to Swagger UI.
- The SQL Server database (`Dawa2yDb`) is automatically created and seeded on startup. You can immediately open SSMS, connect to `.`, expand Databases, and see `Dawa2yDb`.

---

### 3. Run Customer Store (Angular)

```powershell
cd "frontend/dawa2y-store-web"
npm start -- --port 4200
```
- Open browser: **`http://localhost:4200`**
- Features:
  - Language switcher (عربي RTL / English LTR).
  - Search 500+ items catalog with instant filters.
  - Cart with Egyptian flat delivery (25 EGP).
  - Checkout with Visa (Luhn validated) or Cash on Delivery.
  - Live order tracking (`DW-20261114-XXXX`).
  - Directory of all 30 branches across 27 governorates with direct phone hotlines.

---

### 4. Run Independent Admin Dashboard (Angular)

```powershell
cd "frontend/dawa2y-admin"
npm start -- --port 4201
```
- Open browser: **`http://localhost:4201`**
- Sign in with: `admin@dawa2y.com` / `Admin@123456`
- Features:
  - **Insights & KPI Cards**: ~5,000 daily visitors, 30 branches, total revenue, weekly sales chart.
  - **Medications CRUD**: Add new medication modal, edit dosage and prices, delete items.
  - **Multi-Branch Inventory Control**: Quick inline stock adjustments (+1, +10, -1, -5) across 30 branches with low-stock alerts (< 15 units).
  - **Order Management**: Monitor incoming orders, verify Visa payments vs Cash on Door, and update order statuses (Confirmed -> Processing -> Out for Delivery -> Delivered).

---

## 🧪 Unit Testing

Run the automated test suite with:

```powershell
dotnet test backend/Dawa2y.sln
```

### Test Coverage (15/15 Passed):
- `PasswordHasher_ShouldHashAndVerify_Correctly`
- `PasswordHasher_WrongPassword_ShouldFail`
- `TokenService_ShouldGenerateValidJwt_WithClaims`
- `TokenService_CustomerRole_ShouldHaveCustomerClaim`
- `VisaPayment_LuhnAlgorithm_ValidCard_ShouldSucceed`
- `VisaPayment_LuhnAlgorithm_InvalidCard_ShouldFail`
- `VisaPayment_ExpiredCard_ShouldFail`
- `VisaPayment_ValidCard_GeneratesTransactionId`
- `EgyptianPhoneNumber_ValidFormats_ShouldPass`
- `EgyptianPhoneNumber_InvalidFormats_ShouldFail`
- `CreateProductValidator_ValidData_ShouldPass`
- `CreateProductValidator_EmptyNameAr_ShouldFail`
- `CreateProductValidator_NegativePrice_ShouldFail`
- `CheckoutValidator_VisaPayment_WithoutCardDetails_ShouldFail`
- `CheckoutValidator_CashOnDelivery_WithoutCardDetails_ShouldPass`

---

## 📤 Pushing to GitHub

To push the project to your GitHub repository:

```powershell
git init
git add .
git commit -m "feat: complete Dawa2y pharmacy platform (.NET 9 Clean Architecture + Angular 21 + SQL Server)"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 🇪🇬 Egyptian Branches Network (Established 1985)
Covering 30 strategic locations across Egypt:
1. **Cairo**: Nasr City, Maadi, Zamalek, New Cairo, Heliopolis, Downtown Tahrir.
2. **Giza**: Mohandessin, Dokki, 6th of October, Sheikh Zayed, Haram.
3. **Alexandria**: Smouha, Roushdy, Gleem, Miami.
4. **Delta**: Mansoura, Tanta, Zagazig, Damanhour, Kafr El Sheikh.
5. **Canal**: Port Said, Ismailia, Suez.
6. **Upper Egypt**: Beni Suef, Fayoum, Minya, Assiut, Sohag, Luxor, Aswan.
7. **Red Sea & Sinai**: Hurghada, Sharm El Sheikh.

Hotline: **19850** (24/7 Nationwide Delivery Service).
