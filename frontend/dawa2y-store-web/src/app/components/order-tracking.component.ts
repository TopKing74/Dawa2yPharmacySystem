import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../services/order-and-branch.services';
import { LanguageService } from '../services/language.service';
import { OrderDto, OrderStatus } from '../models';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tracking-page">
      <div class="container">
        <div class="track-card">
          <div class="track-header">
            <h2>{{ lang.isAr() ? 'تتبع طلبك' : 'Track Your Order' }}</h2>
            <p>{{ lang.isAr() ? 'أدخل رقم الطلب لمعرفة حالة التوصيل الفورية من فروعنا الـ 30' : 'Enter your order number to track delivery from our 30 branches' }}</p>
          </div>

          <form (ngSubmit)="searchOrder()" class="search-box">
            <input 
              type="text" 
              class="form-control form-control-lg" 
              [(ngModel)]="orderNumberInput" 
              name="orderNumber" 
              placeholder="{{ lang.isAr() ? 'مثال: DW-20261113-XXXX' : 'e.g. DW-20261113-XXXX' }}" 
              required />
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
              {{ loading() ? (lang.isAr() ? 'جاري البحث...' : 'Searching...') : (lang.isAr() ? 'تتبع الآن' : 'Track Now') }}
            </button>
          </form>

          @if (errorMessage()) {
            <div class="alert alert-danger mt-3">
              {{ errorMessage() }}
            </div>
          }

          @if (order()) {
            <div class="order-result">
              <div class="order-header-info">
                <div>
                  <span class="badge badge-primary">{{ order()?.orderNumber }}</span>
                  <h3>{{ lang.isAr() ? 'تفاصيل حالة الطلب' : 'Order Status Details' }}</h3>
                  <p class="text-muted">{{ order()?.createdAt | date:'medium' }}</p>
                </div>
                <div class="status-pill" [ngClass]="getStatusClass(order()?.status)">
                  {{ getStatusText(order()?.status) }}
                </div>
              </div>

              <!-- PROGRESS STEPPER -->
              <div class="stepper">
                <div class="step" [class.active]="isStepPassed(1)" [class.completed]="isStepPassed(2)">
                  <div class="step-circle">1</div>
                  <div class="step-label">{{ lang.isAr() ? 'تم التأكيد' : 'Confirmed' }}</div>
                </div>
                <div class="step-line" [class.active]="isStepPassed(2)"></div>
                <div class="step" [class.active]="isStepPassed(2)" [class.completed]="isStepPassed(3)">
                  <div class="step-circle">2</div>
                  <div class="step-label">{{ lang.isAr() ? 'جاري التحضير' : 'Processing' }}</div>
                </div>
                <div class="step-line" [class.active]="isStepPassed(3)"></div>
                <div class="step" [class.active]="isStepPassed(3)" [class.completed]="isStepPassed(4)">
                  <div class="step-circle">3</div>
                  <div class="step-label">{{ lang.isAr() ? 'خرج للتوصيل' : 'Out for Delivery' }}</div>
                </div>
                <div class="step-line" [class.active]="isStepPassed(4)"></div>
                <div class="step" [class.active]="isStepPassed(4)">
                  <div class="step-circle">4</div>
                  <div class="step-label">{{ lang.isAr() ? 'تم التسليم' : 'Delivered' }}</div>
                </div>
              </div>

              <!-- ORDER SUMMARY GRID -->
              <div class="order-details-grid">
                <div class="detail-box">
                  <h4>{{ lang.isAr() ? 'الفرع المسؤول' : 'Fulfilling Branch' }}</h4>
                  <p><strong>{{ lang.isAr() ? order()?.branchNameAr : order()?.branchNameEn }}</strong></p>
                  <p class="text-muted">{{ order()?.shippingAddress }}</p>
                </div>
                <div class="detail-box">
                  <h4>{{ lang.isAr() ? 'طريقة الدفع' : 'Payment Method' }}</h4>
                  <p>
                    <strong>
                      {{ order()?.paymentMethod === 1 ? (lang.isAr() ? 'فيزا / بطاقة بنكية' : 'Visa / Credit Card') : (lang.isAr() ? 'الدفع عند الاستلام' : 'Cash on Delivery') }}
                    </strong>
                  </p>
                  <p class="text-muted">{{ lang.isAr() ? 'الإجمالي: ' : 'Total: ' }} <strong>{{ order()?.totalAmount }} {{ lang.isAr() ? 'ج.م' : 'EGP' }}</strong></p>
                </div>
              </div>

              <!-- ITEMS LIST -->
              <div class="items-summary">
                <h4>{{ lang.isAr() ? 'الأدوية المطلوبة' : 'Ordered Medications' }}</h4>
                <div class="items-table-wrapper">
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th>{{ lang.isAr() ? 'الدواء' : 'Product' }}</th>
                        <th>{{ lang.isAr() ? 'الكمية' : 'Qty' }}</th>
                        <th>{{ lang.isAr() ? 'سعر الوحدة' : 'Unit Price' }}</th>
                        <th>{{ lang.isAr() ? 'المجموع' : 'Subtotal' }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of order()?.items; track item.id) {
                        <tr>
                          <td>
                            <strong>{{ lang.isAr() ? item.productNameAr : item.productNameEn }}</strong>
                          </td>
                          <td>{{ item.quantity }}</td>
                          <td>{{ item.unitPrice }} {{ lang.isAr() ? 'ج.م' : 'EGP' }}</td>
                          <td><strong>{{ item.subtotal }} {{ lang.isAr() ? 'ج.م' : 'EGP' }}</strong></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-page {
      padding: 3rem 0;
      background: #f8fafc;
      min-height: 80vh;
    }

    .track-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid var(--border-color);
      max-width: 800px;
      margin: 0 auto;
    }

    .track-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .track-header h2 {
      color: var(--primary);
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .search-box {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-box input {
      flex: 1;
    }

    .order-result {
      margin-top: 2rem;
      border-top: 1px solid var(--border-color);
      padding-top: 2rem;
    }

    .order-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .order-header-info h3 {
      margin: 0.5rem 0 0.25rem 0;
      font-size: 1.3rem;
    }

    .status-pill {
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .status-confirmed { background: #e0f2fe; color: #0284c7; }
    .status-processing { background: #fef3c7; color: #d97706; }
    .status-out { background: #fed7aa; color: #ea580c; }
    .status-delivered { background: #dcfce7; color: #16a34a; }

    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 2.5rem 0;
      position: relative;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-bottom: 0.5rem;
      transition: all 0.3s;
    }

    .step.active .step-circle {
      background: var(--primary);
      color: white;
      box-shadow: 0 0 0 4px rgba(11, 79, 159, 0.2);
    }

    .step.completed .step-circle {
      background: var(--success);
      color: white;
    }

    .step-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .step.active .step-label {
      color: var(--primary);
    }

    .step-line {
      flex: 1;
      height: 4px;
      background: #e2e8f0;
      margin: 0 0.5rem;
      transform: translateY(-12px);
    }

    .step-line.active {
      background: var(--primary);
    }

    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-box {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .detail-box h4 {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th, .items-table td {
      padding: 0.75rem;
      text-align: inherit;
      border-bottom: 1px solid var(--border-color);
    }

    .items-table th {
      background: #f1f5f9;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    @media (max-width: 600px) {
      .order-details-grid {
        grid-template-columns: 1fr;
      }
      .search-box {
        flex-direction: column;
      }
    }
  `]
})
export class OrderTrackingComponent {
  orderService = inject(OrderService);
  lang = inject(LanguageService);

  orderNumberInput = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  order = signal<OrderDto | null>(null);

  searchOrder() {
    if (!this.orderNumberInput.trim()) return;
    this.errorMessage.set(null);
    this.loading.set(true);

    this.orderService.trackOrderByNumber(this.orderNumberInput.trim()).subscribe({
      next: (res: OrderDto) => {
        this.loading.set(false);
        this.order.set(res);
      },
      error: (_err: unknown) => {
        this.loading.set(false);
        this.order.set(null);
        this.errorMessage.set(this.lang.isAr() ? 'لم يتم العثور على الطلب. تأكد من صحة رقم الطلب' : 'Order not found. Please verify the order number.');
      }
    });
  }

  normalizeStatus(status: any): string {
    const s = String(status || '');
    if (s === '1') return 'Pending';
    if (s === '2') return 'Confirmed';
    if (s === '3') return 'Processing';
    if (s === '4') return 'OutForDelivery';
    if (s === '5') return 'Delivered';
    if (s === '6') return 'Cancelled';
    return s || 'Pending';
  }

  isStepPassed(stepNumber: number): boolean {
    const s = this.normalizeStatus(this.order()?.status);
    const stepRank: Record<string, number> = {
      'Pending': 1,
      'Confirmed': 1,
      'Processing': 2,
      'OutForDelivery': 3,
      'Delivered': 4
    };
    const currentRank = stepRank[s] ?? 1;
    return currentRank >= stepNumber;
  }

  getStatusClass(status?: any): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'Confirmed': return 'status-confirmed';
      case 'Processing': return 'status-processing';
      case 'OutForDelivery': return 'status-out';
      case 'Delivered': return 'status-delivered';
      default: return 'status-confirmed';
    }
  }

  getStatusText(status?: any): string {
    const isAr = this.lang.isAr();
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'Pending': return isAr ? 'قيد الانتظار' : 'Pending';
      case 'Confirmed': return isAr ? 'تم التأكيد' : 'Confirmed';
      case 'Processing': return isAr ? 'جاري التحضير بالفرع' : 'Processing at Branch';
      case 'OutForDelivery': return isAr ? 'مع مندوب التوصيل' : 'Out for Delivery';
      case 'Delivered': return isAr ? 'تم التسليم بنجاح' : 'Delivered';
      case 'Cancelled': return isAr ? 'ملغي' : 'Cancelled';
      default: return isAr ? 'غير معروف' : 'Unknown';
    }
  }
}
