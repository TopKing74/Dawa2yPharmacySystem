import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { AdminLangService } from '../services/admin-lang.service';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../models/admin.models';

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.isAr() ? 'إدارة الطلبات والشحن والفواتير' : 'Order Management & Dispatch' }}</h1>
          <p class="page-subtitle">
            {{ lang.isAr() ? 'متابعة وتحديث حالة طلبات العملاء وتغيير مسار التوصيل فورياً' : 'Process customer orders, update delivery status, and track payments in real time' }}
          </p>
        </div>
        <button class="btn btn-outline" (click)="loadOrders()">
          🔄 {{ lang.isAr() ? 'تحديث الطلبات' : 'Refresh Orders' }}
        </button>
      </div>

      <!-- SUCCESS / ERROR ALERT -->
      @if (actionMessage()) {
        <div class="alert-success">
          <span>✓</span>
          <span>{{ actionMessage() }}</span>
        </div>
      }
      @if (errorMessage()) {
        <div class="alert-danger">
          <span>✕</span>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- FILTER TABS -->
      <div class="admin-card filter-card">
        <div class="status-tabs">
          <button 
            class="tab-pill" 
            [class.active]="selectedStatus === null"
            (click)="filterStatus(null)">
            {{ lang.isAr() ? 'جميع الطلبات' : 'All Orders' }}
          </button>
          <button 
            class="tab-pill" 
            [class.active]="selectedStatus === OrderStatus.Confirmed"
            (click)="filterStatus(OrderStatus.Confirmed)">
            {{ lang.isAr() ? 'مؤكدة' : 'Confirmed' }}
          </button>
          <button 
            class="tab-pill" 
            [class.active]="selectedStatus === OrderStatus.Processing"
            (click)="filterStatus(OrderStatus.Processing)">
            {{ lang.isAr() ? 'جاري التحضير' : 'Processing' }}
          </button>
          <button 
            class="tab-pill" 
            [class.active]="selectedStatus === OrderStatus.OutForDelivery"
            (click)="filterStatus(OrderStatus.OutForDelivery)">
            {{ lang.isAr() ? 'خرج للتوصيل' : 'Out for Delivery' }}
          </button>
          <button 
            class="tab-pill" 
            [class.active]="selectedStatus === OrderStatus.Delivered"
            (click)="filterStatus(OrderStatus.Delivered)">
            {{ lang.isAr() ? 'تم التسليم' : 'Delivered' }}
          </button>
        </div>
      </div>

      <!-- ORDERS TABLE -->
      <div class="admin-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ lang.isAr() ? 'جاري تحميل الطلبات...' : 'Loading orders...' }}</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ lang.isAr() ? 'رقم الطلب' : 'Order #' }}</th>
                  <th>{{ lang.isAr() ? 'التاريخ والوقت' : 'Date & Time' }}</th>
                  <th>{{ lang.isAr() ? 'العميل' : 'Customer' }}</th>
                  <th>{{ lang.isAr() ? 'الفرع المنفذ' : 'Branch' }}</th>
                  <th>{{ lang.isAr() ? 'طريقة الدفع' : 'Payment Method' }}</th>
                  <th>{{ lang.isAr() ? 'الإجمالي (ج.م)' : 'Total (EGP)' }}</th>
                  <th>{{ lang.isAr() ? 'الحالة الحالية' : 'Current Status' }}</th>
                  <th>{{ lang.isAr() ? 'إجراء سريع' : 'Quick Action' }}</th>
                  <th>{{ lang.isAr() ? 'تغيير يدوي' : 'Select Status' }}</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td>
                      <span class="badge badge-primary font-mono">{{ order.orderNumber }}</span>
                    </td>
                    <td>
                      <small class="text-muted">{{ order.createdAt | date:'short' }}</small>
                    </td>
                    <td>
                      <div>
                        <strong>{{ order.customerName }}</strong>
                        <div class="sub-text">{{ order.customerPhone }}</div>
                        <small class="text-muted">{{ order.shippingAddress }}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{{ order.fulfillmentBranchName || 'Cairo Main HQ' }}</strong>
                    </td>
                    <td>
                      @if (isVisa(order.paymentMethod)) {
                        <span class="badge badge-success">
                          💳 Visa {{ order.cardLastFour ? '•' + order.cardLastFour : '' }}
                        </span>
                      } @else {
                        <span class="badge badge-warning">
                          💵 {{ lang.isAr() ? 'الدفع عند الاستلام' : 'Cash on Door' }}
                        </span>
                      }
                      <div class="pay-sub">
                        {{ isPaid(order.paymentStatus) ? 'Paid ✓' : 'Pending' }}
                      </div>
                    </td>
                    <td>
                      <strong>{{ order.totalAmount | number:'1.2-2' }} EGP</strong>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getStatusBadge(order.status)">
                        {{ getStatusText(order.status) }}
                      </span>
                    </td>
                    <!-- QUICK ONE-CLICK ACTION BUTTON -->
                    <td>
                      @if (getNextAction(order.status); as next) {
                        <button 
                          class="btn btn-sm" 
                          [ngClass]="next.btnClass"
                          [disabled]="updatingOrderId() === order.id"
                          (click)="onStatusChange(order, next.targetStatus)">
                          @if (updatingOrderId() === order.id) {
                            <span>⏳...</span>
                          } @else {
                            <span>{{ lang.isAr() ? next.labelAr : next.labelEn }}</span>
                          }
                        </button>
                      } @else {
                        <span class="text-muted font-sm">{{ lang.isAr() ? 'مكتمل' : 'Finalized' }}</span>
                      }
                    </td>
                    <!-- DROPDOWN SELECTOR -->
                    <td>
                      <select 
                        class="status-select" 
                        [ngModel]="normalizeStatus(order.status)" 
                        [disabled]="updatingOrderId() === order.id"
                        (ngModelChange)="onStatusChange(order, $event)">
                        <option value="Pending">Pending / قيد الانتظار</option>
                        <option value="Confirmed">Confirmed / تم التأكيد</option>
                        <option value="Processing">Processing / جاري التحضير</option>
                        <option value="OutForDelivery">Out for Delivery / خرج للتوصيل</option>
                        <option value="Delivered">Delivered / تم التسليم</option>
                        <option value="Cancelled">Cancelled / ملغي</option>
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary-dark);
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .alert-success {
      background: #dcfce7;
      color: #15803d;
      padding: 0.9rem 1.25rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border: 1px solid #bbf7d0;
    }

    .alert-danger {
      background: #fee2e2;
      color: #b91c1c;
      padding: 0.9rem 1.25rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border: 1px solid #fecaca;
    }

    .filter-card {
      padding: 0.75rem 1rem;
    }

    .status-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tab-pill {
      border: none;
      background: #f1f5f9;
      padding: 0.5rem 1.1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-pill:hover {
      background: #e2e8f0;
    }

    .tab-pill.active {
      background: var(--primary);
      color: white;
    }

    .font-mono {
      font-family: monospace;
      font-size: 0.85rem;
    }

    .sub-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .pay-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .status-select {
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      background: white;
      font-weight: 600;
      cursor: pointer;
    }

    .status-select:focus {
      border-color: var(--primary);
      outline: none;
    }

    .font-sm {
      font-size: 0.8rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class OrdersManagerComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(AdminLangService);

  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;
  PaymentStatus = PaymentStatus;

  loading = signal(true);
  orders = signal<Order[]>([]);
  selectedStatus: OrderStatus | null = null;
  actionMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  updatingOrderId = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.api.getOrders(this.selectedStatus ?? undefined, 1, 50).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.orders.set(res.items);
      },
      error: () => this.loading.set(false)
    });
  }

  filterStatus(status: OrderStatus | null) {
    this.selectedStatus = status;
    this.loadOrders();
  }

  isVisa(method: any): boolean {
    const s = String(method || '');
    return s === 'Visa' || s === '1';
  }

  isPaid(status: any): boolean {
    const s = String(status || '');
    return s === 'Paid' || s === '2';
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

  getNextAction(status: any) {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'Pending':
        return { labelEn: '✓ Confirm Order', labelAr: '✓ تأكيد الطلب', targetStatus: 'Confirmed', btnClass: 'btn-primary' };
      case 'Confirmed':
        return { labelEn: '⚙️ Prepare at Branch', labelAr: '⚙️ تجهيز بالفرع', targetStatus: 'Processing', btnClass: 'btn-secondary' };
      case 'Processing':
        return { labelEn: '🚚 Out for Delivery', labelAr: '🚚 خروج للتوصيل', targetStatus: 'OutForDelivery', btnClass: 'btn-warning' };
      case 'OutForDelivery':
        return { labelEn: '📦 Mark Delivered', labelAr: '📦 تم التسليم للعميل', targetStatus: 'Delivered', btnClass: 'btn-success' };
      default:
        return null;
    }
  }

  onStatusChange(order: Order, newStatus: any) {
    const statusVal = String(newStatus);
    const paymentStatusVal = statusVal === 'Delivered' ? 'Paid' : undefined;

    this.updatingOrderId.set(order.id);
    this.actionMessage.set(null);
    this.errorMessage.set(null);

    this.api.updateOrderStatus(order.id, statusVal as any, paymentStatusVal as any).subscribe({
      next: (updated) => {
        this.updatingOrderId.set(null);
        order.status = updated.status;
        order.paymentStatus = updated.paymentStatus;
        
        // Trigger angular reactivity
        this.orders.update(list => [...list]);

        const statusLabel = this.getStatusText(order.status);
        this.actionMessage.set(
          this.lang.isAr()
            ? `تم تحديث حالة الطلب "${order.orderNumber}" بنجاح إلى "${statusLabel}"`
            : `Order "${order.orderNumber}" status updated to "${statusLabel}" successfully.`
        );
        setTimeout(() => this.actionMessage.set(null), 5000);
      },
      error: (err) => {
        this.updatingOrderId.set(null);
        this.errorMessage.set(
          this.lang.isAr()
            ? 'تعذر تحديث حالة الطلب. تأكد من تشغيل الخادم والاتصال بقاعدة البيانات.'
            : 'Could not update order status. Please verify backend connection.'
        );
        setTimeout(() => this.errorMessage.set(null), 5000);
      }
    });
  }

  getStatusBadge(status: any): string {
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'Pending': return 'badge-secondary';
      case 'Confirmed': return 'badge-info';
      case 'Processing': return 'badge-warning';
      case 'OutForDelivery': return 'badge-warning';
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getStatusText(status: any): string {
    const isAr = this.lang.isAr();
    const s = this.normalizeStatus(status);
    switch (s) {
      case 'Pending': return isAr ? 'قيد الانتظار' : 'Pending';
      case 'Confirmed': return isAr ? 'تم التأكيد' : 'Confirmed';
      case 'Processing': return isAr ? 'جاري التحضير بالفرع' : 'Processing at Branch';
      case 'OutForDelivery': return isAr ? 'خرج للتوصيل مع المندوب' : 'Out for Delivery';
      case 'Delivered': return isAr ? 'تم التسليم بنجاح ✓' : 'Delivered ✓';
      case 'Cancelled': return isAr ? 'ملغي' : 'Cancelled';
      default: return isAr ? 'غير معروف' : 'Unknown';
    }
  }
}
