import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { CartService } from '../services/cart.service';
import { BranchService, OrderService } from '../services/order-and-branch.services';
import { AuthService } from '../services/auth.service';
import { Branch, CheckoutRequest, CardPaymentDetails } from '../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container checkout-page">
      <h1 class="page-title">{{ lang.t('checkout_title') }}</h1>

      <form (ngSubmit)="handlePlaceOrder()" #checkoutForm="ngForm" class="checkout-layout">
        <!-- Left Column: Customer & Delivery Info -->
        <div class="form-sections">
          <!-- 1. Customer Information -->
          <div class="card section-card">
            <h3 class="section-title">
              <span class="step-num">1</span>
              <span>{{ lang.t('customer_info') }}</span>
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ lang.t('full_name') }} *</label>
                <input type="text" [(ngModel)]="customerName" name="name" required class="form-control" placeholder="مثال: كريم محمود أحمد" />
              </div>

              <div class="form-group">
                <label class="form-label">{{ lang.t('email') }} *</label>
                <input type="email" [(ngModel)]="customerEmail" name="email" required email class="form-control" placeholder="name@example.com" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">{{ lang.t('phone') }} *</label>
                <input type="tel" [(ngModel)]="customerPhone" name="phone" required class="form-control" placeholder="01012345678" />
                <small class="form-hint">{{ lang.t('phone_hint') }}</small>
              </div>
            </div>
          </div>

          <!-- 2. Delivery Address in Egypt -->
          <div class="card section-card">
            <h3 class="section-title">
              <span class="step-num">2</span>
              <span>عنوان التوصيل في مصر</span>
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ lang.t('governorate') }} *</label>
                <select [(ngModel)]="selectedGovernorate" (change)="onGovernorateChange()" name="gov" class="form-control" required>
                  <option [value]="1">القاهرة (Cairo)</option>
                  <option [value]="2">الجيزة (Giza)</option>
                  <option [value]="3">الإسكندرية (Alexandria)</option>
                  <option [value]="4">القليوبية (Qalyubia)</option>
                  <option [value]="5">الشرقية (Sharqia)</option>
                  <option [value]="6">الدقهلية - المنصورة (Dakahlia)</option>
                  <option [value]="7">الغربية - طنطا (Gharbia)</option>
                  <option [value]="8">كفر الشيخ (Kafr El Sheikh)</option>
                  <option [value]="9">المنوفية (Menofia)</option>
                  <option [value]="10">البحيرة - دمنهور (Beheira)</option>
                  <option [value]="11">الإسماعيلية (Ismailia)</option>
                  <option [value]="12">السويس (Suez)</option>
                  <option [value]="13">بورسعيد (Port Said)</option>
                  <option [value]="14">دمياط (Damietta)</option>
                  <option [value]="15">الفيوم (Fayoum)</option>
                  <option [value]="16">بني سويف (Beni Suef)</option>
                  <option [value]="17">المنيا (Minya)</option>
                  <option [value]="18">أسيوط (Assiut)</option>
                  <option [value]="19">سوهاج (Sohag)</option>
                  <option [value]="20">قنا (Qena)</option>
                  <option [value]="21">الأقصر (Luxor)</option>
                  <option [value]="22">أسوان (Aswan)</option>
                  <option [value]="23">البحر الأحمر - الغردقة (Red Sea)</option>
                  <option [value]="24">جنوب سيناء - شرم الشيخ (South Sinai)</option>
                  <option [value]="25">مطروح (Matrouh)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">{{ lang.t('fulfillment_branch') }}</label>
                <select [(ngModel)]="preferredBranchId" name="branch" class="form-control">
                  <option *ngFor="let branch of filteredBranches()" [value]="branch.id">
                    {{ lang.currentLang() === 'ar' ? branch.nameAr : branch.nameEn }} (24/7)
                  </option>
                </select>
              </div>

              <div class="form-group full-width">
                <label class="form-label">{{ lang.t('shipping_address') }} *</label>
                <textarea [(ngModel)]="shippingAddress" name="address" required rows="2" class="form-control" placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة"></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">{{ lang.t('notes') }}</label>
                <input type="text" [(ngModel)]="deliveryNotes" name="notes" class="form-control" placeholder="مثال: يرجى الاتصال قبل الوصول بـ 15 دقيقة" />
              </div>
            </div>
          </div>

          <!-- 3. Payment Method: Visa OR Pay on Door -->
          <div class="card section-card">
            <h3 class="section-title">
              <span class="step-num">3</span>
              <span>{{ lang.t('payment_method') }}</span>
            </h3>

            <div class="payment-methods-grid">
              <!-- Visa / Card Option -->
              <label class="payment-option-card" [class.active]="paymentMethod === 'Visa'">
                <div class="option-header">
                  <input type="radio" name="payMethod" value="Visa" [(ngModel)]="paymentMethod" />
                  <div class="option-text">
                    <strong>{{ lang.t('pay_visa') }}</strong>
                    <p>{{ lang.t('pay_visa_desc') }}</p>
                  </div>
                </div>
                <div class="card-icons">
                  <span class="badge-card visa">VISA</span>
                  <span class="badge-card mc">Mastercard</span>
                  <span class="badge-card meeza">ميزة</span>
                </div>
              </label>

              <!-- Pay on Door / Cash on Delivery Option -->
              <label class="payment-option-card" [class.active]="paymentMethod === 'CashOnDelivery'">
                <div class="option-header">
                  <input type="radio" name="payMethod" value="CashOnDelivery" [(ngModel)]="paymentMethod" />
                  <div class="option-text">
                    <strong>{{ lang.t('pay_door') }}</strong>
                    <p>{{ lang.t('pay_door_desc') }}</p>
                  </div>
                </div>
                <div class="card-icons">
                  <span class="badge-card cod">💵 نقداً لمندوب التوصيل</span>
                </div>
              </label>
            </div>

            <!-- Visa Card Details (Shown only when Visa is selected) -->
            <div *ngIf="paymentMethod === 'Visa'" class="visa-form-box">
              <div class="visual-credit-card">
                <div class="card-front">
                  <div class="card-chip"></div>
                  <div class="card-logo-front">{{ detectedBrand() || 'VISA' }}</div>
                  <div class="card-number-display">{{ formatCardNumber(cardDetails.cardNumber) || '•••• •••• •••• ••••' }}</div>
                  <div class="card-details-row">
                    <div>
                      <small>CARD HOLDER</small>
                      <div class="card-name-display">{{ cardDetails.cardHolderName || 'NAME SURNAME' }}</div>
                    </div>
                    <div>
                      <small>EXPIRES</small>
                      <div class="card-exp-display">{{ cardDetails.expirationMonth || 'MM' }}/{{ cardDetails.expirationYear ? cardDetails.expirationYear.slice(-2) : 'YY' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="visa-inputs-grid">
                <div class="form-group full-width">
                  <label class="form-label">{{ lang.t('card_number') }} *</label>
                  <input
                    type="text"
                    [(ngModel)]="cardDetails.cardNumber"
                    name="cardNumber"
                    (input)="onCardNumberChange()"
                    maxlength="19"
                    required
                    class="form-control"
                    placeholder="4532 0151 1283 0366"
                  />
                  <div class="card-status-info">
                    <span *ngIf="detectedBrand()" class="brand-detected">{{ detectedBrand() }}</span>
                    <span *ngIf="isLuhnValid()" class="luhn-valid">رقم البطاقة صالح ومتحقق منه ✓</span>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">{{ lang.t('card_holder') }} *</label>
                  <input type="text" [(ngModel)]="cardDetails.cardHolderName" name="cardHolder" required class="form-control" placeholder="الاسم كما هو مدون على وجه البطاقة" />
                </div>

                <div class="form-group">
                  <label class="form-label">{{ lang.t('card_expiry_month') }} *</label>
                  <select [(ngModel)]="cardDetails.expirationMonth" name="expMonth" class="form-control" required>
                    <option value="01">01 - يناير</option>
                    <option value="02">02 - فبراير</option>
                    <option value="03">03 - مارس</option>
                    <option value="04">04 - أبريل</option>
                    <option value="05">05 - مايو</option>
                    <option value="06">06 - يونيو</option>
                    <option value="07">07 - يوليو</option>
                    <option value="08">08 - أغسطس</option>
                    <option value="09">09 - سبتمبر</option>
                    <option value="10">10 - أكتوبر</option>
                    <option value="11">11 - نوفمبر</option>
                    <option value="12">12 - ديسمبر</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ lang.t('card_expiry_year') }} *</label>
                  <select [(ngModel)]="cardDetails.expirationYear" name="expYear" class="form-control" required>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                    <option value="2031">2031</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ lang.t('card_cvv') }} *</label>
                  <input type="password" [(ngModel)]="cardDetails.cvv" name="cvv" maxlength="4" required class="form-control" placeholder="123" />
                  <small class="form-hint">{{ lang.t('card_cvv_hint') }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary & Place Button -->
        <div class="order-summary-sidebar">
          <div class="card summary-card">
            <h3 class="summary-title">مراجعة الطلب</h3>

            <div class="items-mini-list">
              <div *ngFor="let item of cartService.cart().items" class="mini-item">
                <span class="mini-qty">{{ item.quantity }}x</span>
                <span class="mini-name">{{ lang.currentLang() === 'ar' ? item.productNameAr : item.productNameEn }}</span>
                <span class="mini-price">{{ item.totalPrice | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="summary-line">
              <span>{{ lang.t('cart_subtotal') }}</span>
              <strong>{{ cartService.cart().subtotal | number:'1.2-2' }} {{ lang.t('currency') }}</strong>
            </div>

            <div class="summary-line">
              <span>{{ lang.t('cart_delivery_fee') }}</span>
              <span class="fee-badge">{{ cartService.cart().deliveryFee | number:'1.2-2' }} {{ lang.t('currency') }}</span>
            </div>

            <div class="divider"></div>

            <div class="summary-line total-line">
              <span>{{ lang.t('cart_total') }}</span>
              <strong class="total-amount">{{ cartService.cart().total | number:'1.2-2' }} {{ lang.t('currency') }}</strong>
            </div>

            <div *ngIf="errorMessage()" class="error-banner">
              {{ errorMessage() }}
            </div>

            <button type="submit" class="btn btn-primary btn-lg place-order-btn" [disabled]="isSubmitting() || cartService.cart().items.length === 0">
              <span *ngIf="!isSubmitting()">{{ lang.t('place_order_btn') }}</span>
              <span *ngIf="isSubmitting()">{{ lang.t('placing_order') }}</span>
            </button>

            <div class="checkout-trust-box">
              <div class="trust-item">
                <span>🔒</span>
                <span>تشفير مصرفي 256-bit آمن وموثق</span>
              </div>
              <div class="trust-item">
                <span>📦</span>
                <span>تغليف طبي محكم ومحمي بدرجة حرارة مناسبة</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .checkout-page { padding: 2.5rem 1.25rem 4rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 2rem; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: flex-start; }
    .form-sections { display: flex; flex-direction: column; gap: 1.5rem; }
    .section-card { padding: 1.75rem; }
    .section-title {
      display: flex; align-items: center; gap: 0.75rem; font-size: 1.2rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;
    }
    .step-num {
      width: 28px; height: 28px; background: var(--primary-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .full-width { grid-column: 1 / -1; }
    .form-hint { display: block; color: var(--text-muted); font-size: 0.78rem; margin-top: 0.25rem; }
    .payment-methods-grid { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .payment-option-card {
      border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center; background: #ffffff;
    }
    .payment-option-card.active { border-color: var(--primary-blue); background: #f0f7ff; }
    .option-header { display: flex; align-items: center; gap: 1rem; }
    .option-text strong { font-size: 1rem; color: var(--text-main); display: block; }
    .option-text p { font-size: 0.8rem; color: var(--text-muted); }
    .card-icons { display: flex; gap: 0.4rem; }
    .badge-card { font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; background: #e2e8f0; color: #334155; }
    .badge-card.visa { background: #dbeafe; color: #1e40af; }
    .badge-card.mc { background: #fee2e2; color: #b91c1c; }
    .badge-card.meeza { background: #dcfce7; color: #15803d; }
    .badge-card.cod { background: #fef3c7; color: #92400e; }
    .visa-form-box { background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-top: 1rem; }
    .visual-credit-card {
      max-width: 340px; height: 190px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #003875 0%, #0056b3 60%, #00b4d8 100%); color: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 10px 20px rgba(0, 56, 117, 0.25); position: relative; display: flex; flex-direction: column; justify-content: space-between;
    }
    .card-chip { width: 40px; height: 30px; background: linear-gradient(135deg, #ffd700, #ffae19); border-radius: 6px; }
    .card-logo-front { position: absolute; top: 1.5rem; right: 1.5rem; font-weight: 800; font-size: 1.25rem; letter-spacing: 2px; }
    [dir="rtl"] .card-logo-front { right: auto; left: 1.5rem; }
    .card-number-display { font-size: 1.25rem; letter-spacing: 2.5px; font-family: monospace; text-align: center; margin: 0.5rem 0; }
    .card-details-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
    .card-details-row small { font-size: 0.65rem; opacity: 0.7; }
    .card-name-display { font-weight: 700; text-transform: uppercase; }
    .card-exp-display { font-weight: 700; font-family: monospace; }
    .visa-inputs-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .card-status-info { display: flex; gap: 1rem; margin-top: 0.35rem; font-size: 0.8rem; }
    .brand-detected { font-weight: 700; color: var(--primary-blue); }
    .luhn-valid { color: var(--success); font-weight: 700; }
    .summary-card { padding: 1.75rem; position: sticky; top: 90px; }
    .summary-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; }
    .items-mini-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; max-height: 200px; overflow-y: auto; }
    .mini-item { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; }
    .mini-qty { font-weight: 700; color: var(--primary-blue); margin-inline-end: 0.5rem; }
    .mini-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-inline-end: 0.5rem; }
    .mini-price { font-weight: 700; }
    .summary-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.95rem; }
    .fee-badge { background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem; }
    .divider { height: 1px; background: var(--border-color); margin: 1rem 0; }
    .total-line { font-size: 1.15rem; font-weight: 700; }
    .total-amount { font-size: 1.5rem; color: var(--primary-blue); font-weight: 800; }
    .place-order-btn { width: 100%; margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .error-banner { background: #fee2e2; color: var(--danger); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-top: 1rem; border: 1px solid #fca5a5; }
    .checkout-trust-box { background: #f8fafc; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.8rem; color: var(--text-muted); }
    .trust-item { display: flex; align-items: center; gap: 0.5rem; }
    @media (max-width: 900px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .form-grid, .visa-inputs-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  lang = inject(LanguageService);
  cartService = inject(CartService);
  private branchService = inject(BranchService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  customerName = '';
  customerEmail = '';
  customerPhone = '';
  selectedGovernorate = 1;
  preferredBranchId: string | null = null;
  shippingAddress = '';
  deliveryNotes = '';
  paymentMethod: 'Visa' | 'CashOnDelivery' = 'Visa';

  cardDetails: CardPaymentDetails = {
    cardNumber: '4532015112830366',
    cardHolderName: 'KARIM MAHMOUD',
    expirationMonth: '12',
    expirationYear: '2028',
    cvv: '345'
  };

  allBranches = signal<Branch[]>([]);
  filteredBranches = signal<Branch[]>([]);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.customerName = user.fullName;
      this.customerEmail = user.email;
      this.customerPhone = user.phoneNumber;
      this.selectedGovernorate = user.governorate || 1;
      this.shippingAddress = user.address;
    }

    this.branchService.getBranches().subscribe({
      next: (branches) => {
        this.allBranches.set(branches);
        this.filterBranchesByGovernorate();
      }
    });
  }

  onGovernorateChange(): void { this.filterBranchesByGovernorate(); }

  private filterBranchesByGovernorate(): void {
    const gov = Number(this.selectedGovernorate);
    const matches = this.allBranches().filter(b => b.governorate === gov);
    if (matches.length > 0) {
      this.filteredBranches.set(matches);
      this.preferredBranchId = matches[0].id;
    } else {
      this.filteredBranches.set(this.allBranches());
      this.preferredBranchId = this.allBranches()[0]?.id || null;
    }
  }

  formatCardNumber(val: string): string {
    if (!val) return '';
    const clean = val.replace(/\D/g, '');
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  }

  detectedBrand(): string {
    const clean = (this.cardDetails.cardNumber || '').replace(/\D/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'Mastercard';
    if (clean.startsWith('5078') || clean.startsWith('5048') || clean.startsWith('6709')) return 'Meeza (ميزة)';
    return '';
  }

  isLuhnValid(): boolean {
    const clean = (this.cardDetails.cardNumber || '').replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;

    let sum = 0;
    let alternate = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let n = parseInt(clean[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  onCardNumberChange(): void { this.errorMessage.set(null); }

  handlePlaceOrder(): void {
    this.errorMessage.set(null);

    if (!this.customerName.trim() || !this.customerEmail.trim() || !this.customerPhone.trim() || !this.shippingAddress.trim()) {
      this.errorMessage.set('يرجى ملء جميع الحقول الإلزامية وعنوان التوصيل.');
      return;
    }

    if (this.paymentMethod === 'Visa') {
      if (!this.isLuhnValid()) {
        this.errorMessage.set('رقم بطاقة الفيزا غير صحيح وفقاً لفحص الخوارزمية المصرفية (Luhn Checksum).');
        return;
      }
      if (!this.cardDetails.cvv || this.cardDetails.cvv.length < 3) {
        this.errorMessage.set('يرجى إدخال رمز الأمان (CVV) المكون من 3 أرقام.');
        return;
      }
    }

    this.isSubmitting.set(true);

    const request: CheckoutRequest = {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      governorate: Number(this.selectedGovernorate),
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      preferredBranchId: this.preferredBranchId,
      notes: this.deliveryNotes || null,
      guestSessionId: this.cartService.getGuestSessionId(),
      cardDetails: this.paymentMethod === 'Visa' ? this.cardDetails : null
    };

    this.orderService.checkout(request).subscribe({
      next: (order) => {
        this.isSubmitting.set(false);
        this.cartService.refreshCart();
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverMsg = err.error?.message || err.error?.errors?.[0] || 'فشل معالجة الطلب، يرجى مراجعة البيانات.';
        this.errorMessage.set(serverMsg);
      }
    });
  }
}

