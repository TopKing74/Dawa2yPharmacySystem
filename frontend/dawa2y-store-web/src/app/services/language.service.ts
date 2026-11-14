import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<Language>('ar');

  private readonly translations: Record<Language, Record<string, string>> = {
    ar: {
      brand_name: 'دوائي',
      brand_tagline: 'صيدليات دوائي - رعاية تثق بها منذ 1985',
      est_badge: 'تأسست 1985 • أكثر من 30 فرعاً في محافظات مصر',
      delivery_badge: 'توصيل سريع على مدار 24 ساعة لجميع المحافظات',
      hotline: 'الخط الساخن: 19850',
      search_placeholder: 'ابحث عن دواء، مكمل غذائي، فيتامين أو مادة فعالة...',
      nav_home: 'الرئيسية',
      nav_products: 'الأدوية والمنتجات',
      nav_branches: 'فروعنا (30 فرعاً)',
      nav_track: 'تتبع طلبي',
      nav_cart: 'سلة المشتريات',
      nav_login: 'تسجيل الدخول',
      nav_register: 'حساب جديد',
      nav_logout: 'تسجيل الخروج',
      nav_my_orders: 'طلباتي',
      currency: 'ج.م',
      hero_title: 'صيدليتك الأولى في مصر مع خدمة التوصيل حتى باب المنزل',
      hero_subtitle: 'أكثر من 500 صنف دوائي ومكمل غذائي مع فحص طبي موثوق وخيارات دفع إلكتروني بفيزا أو نقداً عند الاستلام.',
      hero_cta_shop: 'تصفح الصيدلية',
      hero_cta_branches: 'فروعنا في المحافظات',
      cat_all: 'جميع الأقسام',
      cat_medicines: 'أدوية ومسكنات',
      cat_vitamins: 'فيتامينات ومكملات',
      cat_baby: 'رعاية الأم والطفل',
      cat_skin: 'العناية بالبشرة والجمال',
      cat_chronic: 'أدوية الأمراض المزمنة',
      cat_first_aid: 'إسعافات أولية وطبية',
      cat_personal: 'عناية شخصية',
      feat_authentic: 'أدوية أصلية 100%',
      feat_authentic_desc: 'مرخصة بالكامل من وزارة الصحة وهيئة الدواء المصرية',
      feat_delivery: 'توصيل من أقرب فرع',
      feat_delivery_desc: 'شبكة فروع تغطي 27 محافظة لضمان أسرع وقت تسليم',
      feat_pharmacist: 'استشارة صيدلي معتمد',
      feat_pharmacist_desc: 'فريق صيادلة متاح للإرشاد وحساب الجرعات الصحيحة',
      feat_payment: 'دفع آمن بالفيزا أو عند الباب',
      feat_payment_desc: 'سدد ببطاقتك الائتمانية أو ادفع نقداً مع مندوب التوصيل',
      featured_title: 'الأكثر طلباً والعروض المميزة',
      requires_rx: 'يحتاج وصفة طبية',
      active_ingredient: 'المادة الفعالة',
      dosage: 'الجرعة المقترحة',
      manufacturer: 'الشركة المصنعة',
      in_stock: 'متوفر بالمخزون',
      out_of_stock: 'نفد من المخزون',
      add_to_cart: 'أضف للسلة',
      view_details: 'عرض التفاصيل',
      stock_units: 'قطعة متوفرة',
      filters: 'تصفية المنتجات',
      price_range: 'نطاق السعر',
      in_stock_only: 'المتوفر فقط',
      sort_by: 'ترتيب حسب',
      sort_price_asc: 'السعر: من الأقل للأعلى',
      sort_price_desc: 'السعر: من الأعلى للأقل',
      sort_name: 'الاسم أبجدياً',
      cart_title: 'سلة المشتريات',
      cart_empty: 'سلة مشترياتك فارغة حالياً',
      cart_empty_cta: 'ابدأ التسوق الآن',
      cart_subtotal: 'المجموع الفرعي',
      cart_delivery_fee: 'رسوم التوصيل الموحدة (مصر)',
      cart_total: 'الإجمالي النهائي',
      cart_checkout_btn: 'متابعة الدفع وإنهاء الطلب',
      cart_clear: 'إفراغ السلة',
      checkout_title: 'إتمام الطلب والشحن',
      customer_info: 'بيانات المستلم',
      full_name: 'الاسم بالكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف المحمول (مصر)',
      phone_hint: 'مثال: 01012345678 أو 011 / 012 / 015',
      governorate: 'المحافظة',
      shipping_address: 'العنوان التفصيلي (الشارع، رقم العقار، الشقة)',
      fulfillment_branch: 'فرع الصيدلية لتجهيز وتوصيل الطلب',
      notes: 'ملاحظات خاصة بالتوصيل أو تعليمات للطيار',
      payment_method: 'اختر طريقة الدفع',
      pay_visa: 'الدفع الإلكتروني (فيزا / ماستركارد / ميزة)',
      pay_visa_desc: 'دفع فوري آمن ومحمي بأحدث معايير الأمان المصرفية',
      pay_door: 'الدفع عند الاستلام (كاش عند الباب)',
      pay_door_desc: 'ادفع نقداً لمندوب التوصيل عند استلام الطلب وفحص محتوياته',
      card_number: 'رقم البطاقة الائتمانية',
      card_holder: 'الاسم المدون على البطاقة',
      card_expiry_month: 'شهر الانتهاء (MM)',
      card_expiry_year: 'سنة الانتهاء (YYYY)',
      card_cvv: 'رمز الأمان (CVV)',
      card_cvv_hint: 'الأرقام الثلاثة خلف البطاقة',
      place_order_btn: 'تأكيد ودفع الطلب',
      placing_order: 'جاري معالجة وتأكيد الطلب...',
      order_success: 'تم تأكيد طلبك بنجاح!',
      order_number: 'رقم الطلب المرجعي',
      continue_shopping: 'العودة للتسوق',
      branches_title: 'فروع صيدليات دوائي في جمهورية مصر العربية',
      branches_subtitle: 'أكثر من 30 فرعاً لخدمتكم على مدار 24 ساعة في القاهرة والجيزة والإسكندرية وجميع محافظات الدلتا والصعيد والقناة.',
      filter_governorate: 'اختر المحافظة',
      all_governorates: 'كل المحافظات (30 فرعاً)',
      call_branch: 'اتصال بالفرع',
      main_hq: 'الفرع الرئيسي'
    },
    en: {
      brand_name: 'Dawa2y',
      brand_tagline: 'Dawa2y Pharmacies - Trusted Healthcare Since 1985',
      est_badge: 'Established 1985 • Over 30 Branches Nationwide in Egypt',
      delivery_badge: '24/7 Nationwide Express Delivery Across All Governorates',
      hotline: 'Hotline: 19850',
      search_placeholder: 'Search medicines, supplements, vitamins or active ingredients...',
      nav_home: 'Home',
      nav_products: 'Medicines & Store',
      nav_branches: 'Branches (30)',
      nav_track: 'Track Order',
      nav_cart: 'Cart',
      nav_login: 'Login',
      nav_register: 'Register',
      nav_logout: 'Logout',
      nav_my_orders: 'My Orders',
      currency: 'EGP',
      hero_title: 'Your Trusted Egyptian Pharmacy Delivered Right to Your Door',
      hero_subtitle: 'Over 500 certified medicines and wellness products with professional pharmacists and flexible payment via Visa or Cash on Delivery.',
      hero_cta_shop: 'Browse Pharmacy',
      hero_cta_branches: 'Our 30 Branches',
      cat_all: 'All Categories',
      cat_medicines: 'Medicines & Pain Relief',
      cat_vitamins: 'Vitamins & Supplements',
      cat_baby: 'Mother & Baby Care',
      cat_skin: 'Skincare & Beauty',
      cat_chronic: 'Chronic Disease Care',
      cat_first_aid: 'First Aid & Medical',
      cat_personal: 'Personal Care',
      feat_authentic: '100% Genuine Medicines',
      feat_authentic_desc: 'Fully licensed and verified by the Egyptian Ministry of Health & EDA',
      feat_delivery: 'Nearest Branch Dispatch',
      feat_delivery_desc: '30 physical branches across Egypt ensuring rapid 24/7 fulfillment',
      feat_pharmacist: 'Licensed Pharmacists',
      feat_pharmacist_desc: 'Professional pharmacists available for dosage and drug interaction guidance',
      feat_payment: 'Visa or Pay on Door',
      feat_payment_desc: 'Pay instantly with credit card or pay cash to the courier upon delivery',
      featured_title: 'Featured & Most Demanded Items',
      requires_rx: 'Prescription Required',
      active_ingredient: 'Active Ingredient',
      dosage: 'Suggested Dosage',
      manufacturer: 'Manufacturer',
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      add_to_cart: 'Add to Cart',
      view_details: 'View Details',
      stock_units: 'units in stock',
      filters: 'Filter Products',
      price_range: 'Price Range',
      in_stock_only: 'In Stock Only',
      sort_by: 'Sort By',
      sort_price_asc: 'Price: Low to High',
      sort_price_desc: 'Price: High to Low',
      sort_name: 'Alphabetical',
      cart_title: 'Shopping Cart',
      cart_empty: 'Your cart is currently empty',
      cart_empty_cta: 'Start Shopping',
      cart_subtotal: 'Subtotal',
      cart_delivery_fee: 'Flat Nationwide Delivery (Egypt)',
      cart_total: 'Total Amount',
      cart_checkout_btn: 'Proceed to Checkout',
      cart_clear: 'Clear Cart',
      checkout_title: 'Checkout & Delivery',
      customer_info: 'Recipient Details',
      full_name: 'Full Name',
      email: 'Email Address',
      phone: 'Egyptian Mobile Number',
      phone_hint: 'e.g. 01012345678 (010, 011, 012, 015)',
      governorate: 'Governorate',
      shipping_address: 'Detailed Street Address (Street, Building, Flat)',
      fulfillment_branch: 'Fulfillment Pharmacy Branch',
      notes: 'Delivery notes or courier instructions',
      payment_method: 'Select Payment Method',
      pay_visa: 'Online Card Payment (Visa / Mastercard / Meeza)',
      pay_visa_desc: 'Secure instant checkout with 256-bit bank encryption',
      pay_door: 'Pay on Door (Cash on Delivery)',
      pay_door_desc: 'Pay cash directly to the courier when your package arrives',
      card_number: 'Credit Card Number',
      card_holder: 'Cardholder Name',
      card_expiry_month: 'Expiry Month (MM)',
      card_expiry_year: 'Expiry Year (YYYY)',
      card_cvv: 'CVV / Security Code',
      card_cvv_hint: '3 digits on the back of your card',
      place_order_btn: 'Place & Authorize Order',
      placing_order: 'Processing order...',
      order_success: 'Order Placed Successfully!',
      order_number: 'Order Reference',
      continue_shopping: 'Back to Pharmacy',
      branches_title: 'Dawa2y Pharmacy Branches in Egypt',
      branches_subtitle: 'Over 30 branches operating 24/7 across Cairo, Giza, Alexandria, Delta, Upper Egypt and Red Sea.',
      filter_governorate: 'Filter by Governorate',
      all_governorates: 'All Governorates (30 Branches)',
      call_branch: 'Call Branch',
      main_hq: 'Headquarters'
    }
  };

  constructor() {
    const saved = localStorage.getItem('dawa2y_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ar')) {
      this.currentLang.set(saved);
    }
    this.updateHtmlAttributes(this.currentLang());

    effect(() => {
      const lang = this.currentLang();
      localStorage.setItem('dawa2y_lang', lang);
      this.updateHtmlAttributes(lang);
    });
  }

  isAr(): boolean {
    return this.currentLang() === 'ar';
  }

  direction(): 'rtl' | 'ltr' {
    return this.currentLang() === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const next: Language = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.currentLang.set(next);
  }

  t(key: string): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] ?? this.translations['en']?.[key] ?? key;
  }

  private updateHtmlAttributes(lang: Language): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }
}
