import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container product-detail-page">
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات الدواء...</p>
      </div>

      <div *ngIf="!loading() && product()" class="detail-layout">
        <div class="detail-gallery card">
          <img [src]="product()?.imageUrl" [alt]="product()?.nameEn" class="main-img" />
          <div class="rx-floating" *ngIf="product()?.requiresPrescription">
            <span>⚠️ يتطلب روشتة طبية معتمدة عند الاستلام</span>
          </div>
        </div>

        <div class="detail-info card">
          <div class="top-meta">
            <span class="category-badge">{{ product()?.categoryName }}</span>
            <span class="sku-badge">SKU: {{ product()?.sku }}</span>
          </div>

          <h1 class="main-title">{{ lang.currentLang() === 'ar' ? product()?.nameAr : product()?.nameEn }}</h1>
          <h2 class="sub-title">{{ lang.currentLang() === 'ar' ? product()?.nameEn : product()?.nameAr }}</h2>

          <div class="price-container">
            <div class="price-val">
              <span class="main-price">{{ (product()?.discountPrice || product()?.price) | number:'1.2-2' }} {{ lang.t('currency') }}</span>
              <span *ngIf="product()?.discountPrice" class="crossed-price">{{ product()?.price | number:'1.2-2' }} {{ lang.t('currency') }}</span>
            </div>
            <span class="stock-indicator" [class.in]="(product()?.totalStock || 0) > 0">
              {{ (product()?.totalStock || 0) > 0 ? 'متوفر بالمخزون والشحن الفوري' : 'نفد مؤقتاً' }}
            </span>
          </div>

          <div class="spec-grid">
            <div class="spec-item">
              <small>{{ lang.t('active_ingredient') }}</small>
              <strong>{{ product()?.activeIngredient }}</strong>
            </div>
            <div class="spec-item">
              <small>{{ lang.t('manufacturer') }}</small>
              <strong>{{ product()?.manufacturer }}</strong>
            </div>
            <div class="spec-item">
              <small>{{ lang.t('dosage') }}</small>
              <strong>{{ product()?.dosage }}</strong>
            </div>
          </div>

          <div class="description-box">
            <h4>الوصف الدوائي ودواعي الاستعمال</h4>
            <p>{{ lang.currentLang() === 'ar' ? product()?.descriptionAr : product()?.descriptionEn }}</p>
          </div>

          <div class="purchase-box">
            <div class="qty-picker">
              <button class="qty-btn" (click)="qty.set(qty() - 1)" [disabled]="qty() <= 1">-</button>
              <span class="qty-val">{{ qty() }}</span>
              <button class="qty-btn" (click)="qty.set(qty() + 1)">+</button>
            </div>
            <button class="btn btn-primary btn-lg add-btn" [disabled]="(product()?.totalStock || 0) <= 0" (click)="addToCart()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>{{ justAdded() ? 'تمت الإضافة للسلة! ✓' : lang.t('add_to_cart') }}</span>
            </button>
          </div>

          <div class="pharmacy-assurances">
            <div class="assure-item">
              <span>🩺</span>
              <span>مراجعة صيدلانية معتمدة للروشتات والجرعات</span>
            </div>
            <div class="assure-item">
              <span>❄️</span>
              <span>حفظ دوائي في درجات حرارة قياسية مطابقة لـ EDA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page { padding: 3rem 1.25rem 5rem; }
    .detail-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2.5rem; align-items: flex-start; }
    .detail-gallery { padding: 2rem; position: relative; background: white; text-align: center; }
    .main-img { max-width: 100%; height: 420px; object-fit: contain; border-radius: 12px; }
    .rx-floating {
      margin-top: 1.5rem; background: #fef2f2; color: #991b1b; padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; border: 1px solid #fecaca;
    }
    .detail-info { padding: 2.5rem; background: white; }
    .top-meta { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .category-badge { background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }
    .sku-badge { background: #f1f5f9; color: #64748b; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
    .main-title { font-size: 1.85rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.25rem; }
    .sub-title { font-size: 1.05rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1.5rem; }
    .price-container {
      display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.75rem;
    }
    .main-price { font-size: 1.85rem; font-weight: 800; color: var(--primary-blue); margin-inline-end: 0.75rem; }
    .crossed-price { font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through; }
    .stock-indicator {
      font-size: 0.85rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-full); background: #fee2e2; color: #b91c1c;
    }
    .stock-indicator.in { background: #dcfce7; color: #15803d; }
    .spec-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.75rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 1.25rem 0;
    }
    .spec-item small { display: block; color: var(--text-muted); font-size: 0.78rem; margin-bottom: 0.2rem; }
    .spec-item strong { color: var(--text-main); font-size: 0.95rem; }
    .description-box h4 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--primary-dark); }
    .description-box p { color: var(--text-main); line-height: 1.7; font-size: 0.95rem; margin-bottom: 2rem; }
    .purchase-box { display: flex; gap: 1rem; margin-bottom: 1.75rem; }
    .qty-picker {
      display: flex; align-items: center; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc;
    }
    .qty-btn {
      width: 44px; height: 44px; font-size: 1.25rem; font-weight: 700; color: var(--primary-blue); display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
    .qty-val { width: 44px; text-align: center; font-weight: 800; }
    .add-btn { flex: 1; }
    .pharmacy-assurances {
      background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem; color: var(--text-muted);
    }
    .assure-item { display: flex; align-items: center; gap: 0.6rem; }
    .loading-state { padding: 5rem 0; text-align: center; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(0, 86, 179, 0.2); border-top-color: var(--primary-blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  lang = inject(LanguageService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  qty = signal<number>(1);
  justAdded = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p.id, this.qty()).subscribe({
      next: () => {
        this.justAdded.set(true);
        setTimeout(() => this.justAdded.set(false), 2000);
      }
    });
  }
}

