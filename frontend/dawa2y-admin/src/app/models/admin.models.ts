export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  governorate: number;
  address: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  message: string;
  user: User;
}

export enum ProductCategory {
  Medicines = 1,
  VitaminsAndSupplements = 2,
  BabyAndMother = 3,
  SkinAndBeauty = 4,
  ChronicDiseases = 5,
  FirstAidAndMedicalDevices = 6,
  PersonalCare = 7
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sku: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  requiresPrescription: boolean;
  dosage: string;
  activeIngredient: string;
  manufacturer: string;
  totalStock: number;
  isActive: boolean;
}

export interface CreateProductDto {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sku: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  requiresPrescription: boolean;
  dosage: string;
  activeIngredient: string;
  manufacturer: string;
  initialStock: number;
}

export interface UpdateProductDto {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sku: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  requiresPrescription: boolean;
  dosage: string;
  activeIngredient: string;
  manufacturer: string;
  totalStock: number;
  isActive: boolean;
}

export interface BranchInventory {
  id: string;
  branchId: string;
  branchNameEn: string;
  branchNameAr: string;
  productId: string;
  productNameEn: string;
  productNameAr: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  lastRestockedAt: string;
  isLowStock: boolean;
}

export interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  governorate: number;
  governorateName: string;
  addressAr: string;
  addressEn: string;
  phoneNumber: string;
  workingHours: string;
  latitude: number;
  longitude: number;
  isMainBranch: boolean;
}

export interface SalesChartPoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface TopProduct {
  productId: string;
  nameEn: string;
  nameAr: string;
  category: string;
  unitsSold: number;
  revenueGenerated: number;
}

export interface BranchInsight {
  branchId: string;
  branchName: string;
  governorate: string;
  ordersFulfilled: number;
  revenue: number;
  inventoryCount: number;
}

export interface VisitorTrend {
  date: string;
  visitorsCount: number;
  ordersCount: number;
  conversionRate: number;
}

export interface DashboardOverview {
  totalProducts: number;
  totalBranches: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockItemCount: number;
  todayVisitors: number;
  todayRevenue: number;
  todayOrders: number;
  weeklySalesTrend: SalesChartPoint[];
  topSellingProducts: TopProduct[];
  branchInsights: BranchInsight[];
  visitorTrends: VisitorTrend[];
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  OutForDelivery = 'OutForDelivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Visa = 'Visa',
  CashOnDelivery = 'CashOnDelivery'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: number;
  shippingAddress: string;
  notes?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  fulfillmentBranchName?: string;
  cardLastFour?: string;
  items: OrderItem[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

