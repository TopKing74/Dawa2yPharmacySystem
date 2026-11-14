export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sku: string;
  category: number | string;
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  availableStock: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CardPaymentDetails {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: number;
  shippingAddress: string;
  paymentMethod: 'Visa' | 'CashOnDelivery' | number;
  preferredBranchId?: string | null;
  notes?: string | null;
  guestSessionId?: string | null;
  cardDetails?: CardPaymentDetails | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameAr: string;
  productNameEn: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  totalPrice?: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  OutForDelivery = 'OutForDelivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  governorate: number | string;
  shippingAddress: string;
  notes?: string;
  status: OrderStatus | number;
  paymentMethod: number | string;
  paymentStatus: number | string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  branchNameAr?: string;
  branchNameEn?: string;
  fulfillmentBranchName?: string;
  cardLastFour?: string;
  items: OrderItem[];
}

export type OrderDto = Order;

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

export const EGYPTIAN_GOVERNORATES = [
  { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 2, nameAr: 'الجيزة', nameEn: 'Giza' },
  { id: 3, nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { id: 4, nameAr: 'القليوبية', nameEn: 'Qalyubia' },
  { id: 5, nameAr: 'الشرقية', nameEn: 'Sharqia' },
  { id: 6, nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
  { id: 7, nameAr: 'الغربية', nameEn: 'Gharbia' },
  { id: 8, nameAr: 'المنوفية', nameEn: 'Monufia' },
  { id: 9, nameAr: 'البحيرة', nameEn: 'Beheira' },
  { id: 10, nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
  { id: 11, nameAr: 'دمياط', nameEn: 'Damietta' },
  { id: 12, nameAr: 'بورسعيد', nameEn: 'Port Said' },
  { id: 13, nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
  { id: 14, nameAr: 'السويس', nameEn: 'Suez' },
  { id: 15, nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
  { id: 16, nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
  { id: 17, nameAr: 'بني سويف', nameEn: 'Beni Suef' },
  { id: 18, nameAr: 'الفيوم', nameEn: 'Fayoum' },
  { id: 19, nameAr: 'المنيا', nameEn: 'Minya' },
  { id: 20, nameAr: 'أسيوط', nameEn: 'Asyut' },
  { id: 21, nameAr: 'سوهاج', nameEn: 'Sohag' },
  { id: 22, nameAr: 'قنا', nameEn: 'Qena' },
  { id: 23, nameAr: 'الأقصر', nameEn: 'Luxor' },
  { id: 24, nameAr: 'أسوان', nameEn: 'Aswan' },
  { id: 25, nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
  { id: 26, nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
  { id: 27, nameAr: 'مطروح', nameEn: 'Matrouh' }
];
