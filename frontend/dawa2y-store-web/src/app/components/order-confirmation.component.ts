import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { OrderService } from '../services/order-and-branch.services';
import { Order } from '../models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container confirmation-page">
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تفاصيل الفاتورة وتأكيد الطلب...</p>
      </div>

      <div *ngIf="!loading() && order()" class="confirmation-card card">
        <div class="success-header">
          <div class="check-circle">✓</div>
          <h1 class="success-title">{{ lang.t('order_success') }}</h1>
          <p class="order-ref">
            {{ lang.t('order_number') }}: <strong>{{ order()?.orderNumber }}</strong>
          </p>
        </div>

        <div class="status-stepper">
          <div class="step active">
            <span class="step-circle">1</span>
            <span class="step-label">تم استلام الطلب</span>
          </div>
          <div class="step-line active"></div>
          <div class="step active">
            <span class="step-circle">2</span>
            <span class="step-label">مؤكد ومطابق</span>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <span class="step-circle">3</span>
            <span class="step-label">جاري التجهيز بالفرع</span>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <span class="step-circle">4</span>
            <span class="step-label">خرج للتوصيل</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h4>بيانات التوصيل</h4>
            <p><strong>المستلم:</strong> {{ order()?.customerName }}</p>
            <p><strong>الهاتف:</strong> {{ order()?.customerPhone }}</p>
            <p><strong>العنوان:</strong> {{ order()?.shippingAddress }}</p>
            <p *ngIf="order()?.notes"><strong>ملاحظات:</strong> {{ order()?.notes }}</p>
          </div>

          <div class="info-box">
            <h4>فرع الصيدلية المسؤول</h4>
            <p class="branch-name">🏢 {{ order()?.fulfillmentBranchName || 'فرع دوائي مدينة نصر الرئيسي' }}</p>
            <p><strong>طريقة الدفع:</strong> {{ order()?.paymentMethod === 'Visa' ? 'بطاقة ائتمانية (فيزا)' : 'الدفع نقداً عند الاستلام (Pay on Door)' }}</p>
            <p>
              <strong>حالة السداد:</strong>
              <span class="badge" [class.badge-discount]="order()?.paymentStatus === 'Paid'" [class.badge-stock]="order()?.paymentStatus !== 'Paid'">
                {{ order()?.paymentStatus === 'Paid' ? 'مدفوع إلكترونياً بالكامل ✓' : 'مستحق نقداً لمندوب الشحن' }}
              </span>
            </p>
            <p *ngIf="order()?.cardLastFour"><strong>البطاقة المنتهية بـ:</strong> •••• {{ order()?.cardLastFour }}</p>
          </div>
        </div>

        <div class="receipt-table-box">
          <h3>بيان الأصناف الطبية المطلوبة</h3>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>الصنف الدوائي</th>
                <th>سعر الوحدة</th>
                <th>الكمية</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order()?.items">
                <td>
                  <strong>{{ lang.currentLang() === 'ar' ? item.productNameAr : item.productNameEn }}</strong>
                  <br />
                  <small class="item-en-name">{{ lang.currentLang() === 'ar' ? item.productNameEn : item.productNameAr }}</small>
                </td>
                <td>{{ item.unitPrice | number:'1.2-2' }} {{ lang.t('currency') }}</td>
                <td>{{ item.quantity }}</td>
                <td class="item-total-col">{{ item.totalPrice | number:'1.2-2' }} {{ lang.t('currency') }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">{{ lang.t('cart_subtotal') }}</td>
                <td>{{ order()?.subtotal | number:'1.2-2' }} {{ lang.t('currency') }}</td>
              </tr>
              <tr>
                <td colspan="3">{{ lang.t('cart_delivery_fee') }}</td>
                <td>{{ order()?.deliveryFee | number:'1.2-2' }} {{ lang.t('currency') }}</td>
              </tr>
              <tr class="grand-total-row">
                <td colspan="3">{{ lang.t('cart_total') }}</td>
                <td>{{ order()?.totalAmount | number:'1.2-2' }} {{ lang.t('currency') }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="confirmation-actions">
          <a routerLink="/products" class="btn btn-primary btn-lg">{{ lang.t('continue_shopping') }}</a>
          <button (click)="printReceipt()" class="btn btn-outline btn-lg">طباعة الفاتورة 🖨️</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page { padding: 3rem 1.25rem 5rem; max-width: 900px; margin: 0 auto; }
    .confirmation-card { padding: 3rem; background: white; }
    .success-header { text-align: center; margin-bottom: 2.5rem; }
    .check-circle {
      width: 64px; height: 64px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; border: 2px solid #86efac;
    }
    .success-title { font-size: 2rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem; }
    .order-ref { font-size: 1.1rem; color: var(--text-muted); }
    .order-ref strong { color: var(--primary-blue); font-family: monospace; font-size: 1.25rem; }
    .status-stepper {
      display: flex; align-items: center; justify-content: space-between; margin: 2rem 0 3rem; padding: 1.5rem; background: #f8fafc; border-radius: var(--radius-lg);
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
    .step-circle {
      width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
    }
    .step.active .step-circle { background: var(--primary-blue); color: white; }
    .step-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .step.active .step-label { color: var(--primary-blue); font-weight: 700; }
    .step-line { flex: 1; height: 3px; background: #e2e8f0; margin: 0 0.5rem 1.5rem; }
    .step-line.active { background: var(--primary-blue); }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
    .info-box { background: #f8fafc; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
    .info-box h4 { font-size: 1.05rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    .info-box p { font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.5; }
    .branch-name { color: var(--primary-blue); font-weight: 700; }
    .receipt-table-box h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem; }
    .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    .receipt-table th, .receipt-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); text-align: start; font-size: 0.9rem; }
    .receipt-table th { background: #f1f5f9; font-weight: 700; }
    .item-en-name { color: var(--text-muted); font-size: 0.78rem; }
    .item-total-col { font-weight: 700; }
    .receipt-table tfoot td { font-weight: 700; text-align: end; border-top: 1px solid var(--border-color); }
    .grand-total-row td { font-size: 1.15rem; color: var(--primary-blue); font-weight: 800; background: #f0f7ff; }
    .confirmation-actions { display: flex; gap: 1rem; justify-content: center; }
    .loading-state { padding: 5rem 0; text-align: center; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(0, 86, 179, 0.2); border-top-color: var(--primary-blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  lang = inject(LanguageService);
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.orderService.getOrderById(orderId).subscribe({
        next: (o) => {
          this.order.set(o);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  printReceipt(): void {
    if (typeof window !== 'undefined') window.print();
  }
}

