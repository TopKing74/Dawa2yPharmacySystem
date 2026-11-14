import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { ProductService, ProductFilterParams } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container catalog-page">
      <nav class="breadcrumb">
        <a routerLink="/">{{ lang.t('nav_home') }}</a>
        <span class="sep">/</span>
        <span>{{ lang.t('nav_products') }}</span>
      </nav>

      <div class="catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar card">
          <div class="sidebar-header">
            <h3>{{ lang.t('filters') }}</h3>
            <button class="reset-btn" (click)="resetFilters()">إعادة ضبط</button>
          </div>

          <div class="filter-group">
            <label class="filter-heading">الأقسام الطبية</label>
            <div class="radio-options">
              <label class="radio-label">
                <input type="radio" name="cat" [value]="undefined" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_all') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="1" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_medicines') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="2" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_vitamins') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="5" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_chronic') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="3" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_baby') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="4" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_skin') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="cat" [value]="6" [(ngModel)]="selectedCategory" (change)="applyFilters()" />
                <span>{{ lang.t('cat_first_aid') }}</span>
              </label>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-heading">خيارات الفرز</label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="prescriptionOnly" (change)="applyFilters()" />
              <span>يتطلب روشتة طبية (Rx)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()" />
              <span>{{ lang.t('in_stock_only') }}</span>
            </label>
          </div>

          <div class="filter-group">
            <label class="filter-heading">{{ lang.t('price_range') }} (حتى {{ maxPrice }} {{ lang.t('currency') }})</label>
            <input type="range" min="20" max="600" step="10" [(ngModel)]="maxPrice" (change)="applyFilters()" class="range-slider" />
          </div>
        </aside>

        <!-- Main Product Results -->
        <main class="catalog-content">
          <div class="catalog-toolbar">
            <div class="results-count">
              <span>عرض <strong>{{ products().length }}</strong> من إجمالي <strong>{{ totalCount() }}</strong> صنف دوائي</span>
            </div>

            <div class="sort-selector">
              <label>{{ lang.t('sort_by') }}:</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-dropdown">
                <option value="name">{{ lang.t('sort_name') }}</option>
                <option value="price_asc">{{ lang.t('sort_price_asc') }}</option>
                <option value="price_desc">{{ lang.t('sort_price_desc') }}</option>
              </select>
            </div>
          </div>

          <div *ngIf="loading()" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل الأدوية والمستحضرات الطبية...</p>
          </div>

          <div *ngIf="!loading() && products().length === 0" class="empty-state card">
            <span class="empty-icon">🔍</span>
            <h3>لم يتم العثور على أدوية مطابقة لبحثك</h3>
            <p>جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية.</p>
            <button class="btn btn-secondary" (click)="resetFilters()">إلغاء كل الفلاتر</button>
          </div>

          <div *ngIf="!loading() && products().length > 0" class="products-grid">
            <div *ngFor="let product of products()" class="product-card card">
              <div class="card-img-wrap">
                <img [src]="product.imageUrl" [alt]="product.nameEn" class="product-thumb" />
                <span *ngIf="product.discountPrice" class="discount-tag">
                  خصم {{ ((product.price - product.discountPrice) / product.price * 100).toFixed(0) }}%
                </span>
                <span *ngIf="product.requiresPrescription" class="rx-tag" title="يتطلب روشتة طبية">Rx</span>
              </div>

              <div class="card-body">
                <div class="product-meta">
                  <span class="manufacturer">{{ product.manufacturer }}</span>
                  <span class="category-name">{{ product.categoryName }}</span>
                </div>

                <h3 class="product-name">
                  <a [routerLink]="['/products', product.id]">
                    {{ lang.currentLang() === 'ar' ? product.nameAr : product.nameEn }}
                  </a>
                </h3>
                <p class="product-subname">{{ lang.currentLang() === 'ar' ? product.nameEn : product.nameAr }}</p>

                <div class="active-ingredient">
                  <small>{{ lang.t('active_ingredient') }}:</small>
                  <span>{{ product.activeIngredient }}</span>
                </div>

                <div class="price-row">
                  <div class="price-box">
                    <span class="current-price">{{ (product.discountPrice || product.price) | number:'1.2-2' }} {{ lang.t('currency') }}</span>
                    <span *ngIf="product.discountPrice" class="old-price">{{ product.price | number:'1.2-2' }} {{ lang.t('currency') }}</span>
                  </div>
                  <span class="stock-badge" [class.in-stock]="product.totalStock > 0" [class.out-stock]="product.totalStock <= 0">
                    {{ product.totalStock > 0 ? (product.totalStock + ' قطعة') : 'نفد' }}
                  </span>
                </div>

                <button class="btn btn-primary add-cart-btn" [disabled]="product.totalStock <= 0" (click)="handleAddToCart(product)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <span>{{ addedId() === product.id ? 'تمت الإضافة! ✓' : lang.t('add_to_cart') }}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page { padding: 2rem 1.25rem 4rem; }
    .breadcrumb {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;
    }
    .breadcrumb a:hover { color: var(--primary-blue); }
    .sep { opacity: 0.4; }
    .catalog-layout {
      display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: flex-start;
    }
    .filters-sidebar { padding: 1.5rem; position: sticky; top: 90px; }
    .sidebar-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;
    }
    .sidebar-header h3 { font-size: 1.15rem; font-weight: 700; }
    .reset-btn { color: var(--primary-blue); font-size: 0.8rem; font-weight: 600; }
    .filter-group { margin-bottom: 1.75rem; }
    .filter-heading { display: block; font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem; }
    .radio-options, .checkbox-label { display: flex; flex-direction: column; gap: 0.6rem; }
    .radio-label, .checkbox-label { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; cursor: pointer; }
    .range-slider { width: 100%; accent-color: var(--primary-blue); }
    .catalog-toolbar {
      display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem;
    }
    .results-count { font-size: 0.9rem; color: var(--text-muted); }
    .sort-selector { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; }
    .sort-dropdown { padding: 0.4rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 0.88rem; }
    .loading-state, .empty-state { padding: 4rem 2rem; text-align: center; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(0, 86, 179, 0.2); border-top-color: var(--primary-blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
    .product-card { display: flex; flex-direction: column; overflow: hidden; background: #ffffff; border-radius: var(--radius-lg); }
    .card-img-wrap { position: relative; height: 190px; background: #f8fafc; overflow: hidden; }
    .product-thumb { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .product-card:hover .product-thumb { transform: scale(1.05); }
    .discount-tag {
      position: absolute; top: 10px; right: 10px; background: var(--danger); color: white; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px;
    }
    [dir="rtl"] .discount-tag { right: auto; left: 10px; }
    .rx-tag {
      position: absolute; top: 10px; left: 10px; background: #dc2626; color: white; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px;
    }
    [dir="rtl"] .rx-tag { left: auto; right: 10px; }
    .card-body { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
    .product-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .product-name { font-size: 1.05rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.2rem; }
    .product-name a:hover { color: var(--primary-blue); }
    .product-subname { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .active-ingredient {
      background: var(--bg-slate); padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.75rem; margin-bottom: 1rem; display: flex; gap: 0.35rem;
    }
    .active-ingredient small { color: var(--text-muted); font-weight: 600; }
    .active-ingredient span { color: var(--text-main); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; margin-bottom: 1rem; }
    .current-price { font-size: 1.25rem; font-weight: 800; color: var(--primary-blue); display: block; }
    .old-price { font-size: 0.85rem; color: var(--text-muted); text-decoration: line-through; }
    .stock-badge { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .stock-badge.in-stock { background: #e0f2fe; color: #0369a1; }
    .stock-badge.out-stock { background: #fee2e2; color: #b91c1c; }
    .add-cart-btn { width: 100%; }
    @media (max-width: 900px) {
      .catalog-layout { grid-template-columns: 1fr; }
      .filters-sidebar { position: static; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  lang = inject(LanguageService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);
  addedId = signal<string | null>(null);

  selectedCategory: number | undefined = undefined;
  prescriptionOnly = false;
  inStockOnly = false;
  maxPrice = 600;
  sortBy = 'name';
  searchTerm = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['cat']) this.selectedCategory = Number(params['cat']);
      if (params['q']) this.searchTerm = params['q'];
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading.set(true);

    const filter: ProductFilterParams = {
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory,
      requiresPrescription: this.prescriptionOnly ? true : undefined,
      inStockOnly: this.inStockOnly ? true : undefined,
      maxPrice: this.maxPrice < 600 ? this.maxPrice : undefined,
      sortBy: this.sortBy === 'price_asc' || this.sortBy === 'price_desc' ? 'price' : 'name',
      sortDescending: this.sortBy === 'price_desc',
      pageSize: 40
    };

    this.productService.getProducts(filter).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void { this.fetchProducts(); }

  resetFilters(): void {
    this.selectedCategory = undefined;
    this.prescriptionOnly = false;
    this.inStockOnly = false;
    this.maxPrice = 600;
    this.sortBy = 'name';
    this.searchTerm = '';
    this.fetchProducts();
  }

  handleAddToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.addedId.set(product.id);
        setTimeout(() => this.addedId.set(null), 1800);
      }
    });
  }
}

