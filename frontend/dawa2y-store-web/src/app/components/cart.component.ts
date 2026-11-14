import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container cart-page">
      <h1 class="page-title">{{ lang.t('cart_title') }}</h1>

      <div *ngIf="cartService.cart().items.length === 0" class="empty-cart card">
        <span class="empty-icon">🛒</span>
        <h2>{{ lang.t('cart_empty') }}</h2>
        <p>لم تقم بإضافة أي أدوية أو منتجات إلى سلتك بعد.</p>
        <a routerLink="/products" class="btn btn-primary btn-lg">{{ lang.t('cart_empty_cta') }}</a>
      </div>

      <div *ngIf="cartService.cart().items.length > 0" class="cart-layout">
        <div class="items-list card">
          <div class="list-header">
            <span>المنتج</span>
            <span>الكمية</span>
            <span>الإجمالي</span>
          </div>

          <div *ngFor="let item of cartService.cart().items" class="cart-item-row">
            <div class="item-product-info">
              <img [src]="item.imageUrl" [alt]="item.productNameEn" class="item-img" />
              <div>
                <h4 class="item-title">{{ lang.currentLang() === 'ar' ? item.productNameAr : item.productNameEn }}</h4>
                <p class="item-subtitle">{{ lang.currentLang() === 'ar' ? item.productNameEn : item.productNameAr }}</p>
                <span class="item-unit-price">{{ item.unitPrice | number:'1.2-2' }} {{ lang.t('currency') }}</span>
              </div>
            </div>

            <div class="qty-control">
              <button class="qty-btn" (click)="updateQty(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="updateQty(item.id, item.quantity + 1)">+</button>
            </div>

            <div class="item-actions">
              <span class="item-total-price">{{ item.totalPrice | number:'1.2-2' }} {{ lang.t('currency') }}</span>
              <button class="remove-btn" (click)="removeItem(item.id)" title="حذف من السلة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>

          <div class="list-footer">
            <button class="btn btn-secondary" (click)="cartService.clearCart()">
              {{ lang.t('cart_clear') }}
            </button>
            <a routerLink="/products" class="btn btn-outline">متابعة التسوق</a>
          </div>
        </div>

        <div class="summary-card card">
          <h3 class="summary-title">ملخص الحساب</h3>
          
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

          <a routerLink="/checkout" class="btn btn-primary checkout-btn btn-lg">
            <span>{{ lang.t('cart_checkout_btn') }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>

          <div class="delivery-guarantee">
            <div class="guar-item">
              <span>🚀</span>
              <small>توصيل خلال 60 دقيقة من أقرب فرع في محافظتك</small>
            </div>
            <div class="guar-item">
              <span>💳</span>
              <small>دفع آمن بالفيزا أو نقداً عند استلام الشحنة</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page { padding: 2.5rem 1.25rem 4rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 2rem; }
    .empty-cart { padding: 5rem 2rem; text-align: center; max-width: 600px; margin: 0 auto; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .empty-cart h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .empty-cart p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: flex-start; }
    .items-list { padding: 1.5rem; }
    .list-header {
      display: grid; grid-template-columns: 2fr 1fr 1fr; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; font-weight: 700; color: var(--text-muted);
    }
    .cart-item-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr; align-items: center; padding: 1.25rem 0; border-bottom: 1px solid var(--border-color);
    }
    .item-product-info { display: flex; align-items: center; gap: 1rem; }
    .item-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); }
    .item-title { font-size: 0.98rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem; }
    .item-subtitle { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.35rem; }
    .item-unit-price { font-size: 0.85rem; color: var(--primary-blue); font-weight: 700; }
    .qty-control {
      display: inline-flex; align-items: center; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc; width: fit-content;
    }
    .qty-btn {
      width: 32px; height: 32px; font-size: 1.1rem; font-weight: 700; color: var(--primary-blue); display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
    .qty-num { width: 32px; text-align: center; font-weight: 700; font-size: 0.95rem; }
    .item-actions { display: flex; align-items: center; justify-content: space-between; padding-inline-end: 0.5rem; }
    .item-total-price { font-size: 1.1rem; font-weight: 800; color: var(--primary-dark); }
    .remove-btn { color: #94a3b8; display: flex; align-items: center; }
    .remove-btn:hover { color: var(--danger); }
    .list-footer { display: flex; justify-content: space-between; margin-top: 1.5rem; }
    .summary-card { padding: 1.75rem; position: sticky; top: 90px; }
    .summary-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; }
    .summary-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.95rem; }
    .fee-badge { background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem; }
    .divider { height: 1px; background: var(--border-color); margin: 1.25rem 0; }
    .total-line { font-size: 1.15rem; font-weight: 700; }
    .total-amount { font-size: 1.5rem; color: var(--primary-blue); font-weight: 800; }
    .checkout-btn { width: 100%; margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .delivery-guarantee { background: #f8fafc; padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.6rem; }
    .guar-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }
    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item-row, .list-header { grid-template-columns: 1fr; gap: 0.75rem; }
    }
  `]
})
export class CartComponent {
  lang = inject(LanguageService);
  cartService = inject(CartService);

  updateQty(itemId: string, newQty: number): void {
    this.cartService.updateQuantity(itemId, newQty).subscribe();
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe();
  }
}

