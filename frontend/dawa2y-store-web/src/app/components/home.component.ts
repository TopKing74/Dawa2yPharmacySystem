import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>{{ lang.t('est_badge') }}</span>
          </div>
          <h1 class="hero-title">{{ lang.t('hero_title') }}</h1>
          <p class="hero-subtitle">{{ lang.t('hero_subtitle') }}</p>
          <div class="hero-actions">
            <a routerLink="/products" class="btn btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>{{ lang.t('hero_cta_shop') }}</span>
            </a>
            <a routerLink="/branches" class="btn btn-outline btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ lang.t('hero_cta_branches') }}</span>
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <strong>500+</strong>
              <span>صنف دوائي وعلاجي</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <strong>30</strong>
              <span>فرعاً بمحافظات مصر</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <strong>24/7</strong>
              <span>خدمة توصيل فورية</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card">
            <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800" alt="Dawa2y Pharmacy Medicines" class="hero-img" />
            <div class="floating-badge rx-badge">
              <span class="badge-icon">💊</span>
              <div>
                <strong>صيدلية معتمدة</strong>
                <small>EDA Registered #1985</small>
              </div>
            </div>
            <div class="floating-badge delivery-float">
              <span class="badge-icon">⚡</span>
              <div>
                <strong>توصيل سريع</strong>
                <small>خلال 60 دقيقة لباب بيتك</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Categories Grid -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">الأقسام الطبية والصيدلانية</h2>
            <p class="section-subtitle">تصفح احتياجاتك الصحية من بين أكثر من 500 مستحضر طبي موثوق</p>
          </div>
          <a routerLink="/products" class="view-all-link">عرض كل المنتجات &larr;</a>
        </div>

        <div class="category-grid">
          <a routerLink="/products" [queryParams]="{cat: 1}" class="category-card">
            <div class="cat-icon-wrap blue">💊</div>
            <h3 class="cat-title">{{ lang.t('cat_medicines') }}</h3>
            <span class="cat-count">مسكنات، مضادات حيوية، برد وحساسية</span>
          </a>

          <a routerLink="/products" [queryParams]="{cat: 2}" class="category-card">
            <div class="cat-icon-wrap green">🌿</div>
            <h3 class="cat-title">{{ lang.t('cat_vitamins') }}</h3>
            <span class="cat-count">فيتامين سي، أوميجا 3، مقويات مناعة</span>
          </a>

          <a routerLink="/products" [queryParams]="{cat: 5}" class="category-card">
            <div class="cat-icon-wrap red">❤️</div>
            <h3 class="cat-title">{{ lang.t('cat_chronic') }}</h3>
            <span class="cat-count">علاجات الضغط، السكر، والكوليسترول</span>
          </a>

          <a routerLink="/products" [queryParams]="{cat: 3}" class="category-card">
            <div class="cat-icon-wrap yellow">🍼</div>
            <h3 class="cat-title">{{ lang.t('cat_baby') }}</h3>
            <span class="cat-count">ألبان رضع، حفاضات، عناية بالطفل</span>
          </a>

          <a routerLink="/products" [queryParams]="{cat: 4}" class="category-card">
            <div class="cat-icon-wrap purple">✨</div>
            <h3 class="cat-title">{{ lang.t('cat_skin') }}</h3>
            <span class="cat-count">واقيات شمس، ترطيب، عناية بالبشرة</span>
          </a>

          <a routerLink="/products" [queryParams]="{cat: 6}" class="category-card">
            <div class="cat-icon-wrap orange">🩹</div>
            <h3 class="cat-title">{{ lang.t('cat_first_aid') }}</h3>
            <span class="cat-count">مطهرات جروح، شاش، مستلزمات طبية</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Value Propositions -->
    <section class="section values-section">
      <div class="container">
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">🛡️</div>
            <h4>{{ lang.t('feat_authentic') }}</h4>
            <p>{{ lang.t('feat_authentic_desc') }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🏢</div>
            <h4>{{ lang.t('feat_delivery') }}</h4>
            <p>{{ lang.t('feat_delivery_desc') }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">👨‍⚕️</div>
            <h4>{{ lang.t('feat_pharmacist') }}</h4>
            <p>{{ lang.t('feat_pharmacist_desc') }}</p>
          </div>
          <div class="value-card">
            <div class="value-icon">💳</div>
            <h4>{{ lang.t('feat_payment') }}</h4>
            <p>{{ lang.t('feat_payment_desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Showcase -->
    <section class="section featured-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">{{ lang.t('featured_title') }}</h2>
            <p class="section-subtitle">أدوية ومستحضرات معتمدة متوفرة للشحن الفوري</p>
          </div>
          <a routerLink="/products" class="view-all-link">مشاهدة الكل &larr;</a>
        </div>

        <div class="products-grid">
          <div *ngFor="let product of featuredProducts()" class="product-card card">
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
                <span class="sku">SKU: {{ product.sku }}</span>
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
                <span class="stock-badge in-stock">{{ product.totalStock }} {{ lang.t('stock_units') }}</span>
              </div>

              <button class="btn btn-primary add-cart-btn" (click)="handleAddToCart(product)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span>{{ addedId() === product.id ? 'تمت الإضافة! ✓' : lang.t('add_to_cart') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Branch Locator Banner -->
    <section class="branches-banner">
      <div class="container banner-inner">
        <div class="banner-text">
          <span class="network-badge">شبكة فروع دوائي الوطنية</span>
          <h2>30 فرعاً في خدمتك على مدار الساعة في 27 محافظة</h2>
          <p>من الإسكندرية ومرسى مطروح شمالاً إلى أسوان والأقصر جنوباً، صيدليات دوائي أقرب إليك دائماً.</p>
          <div class="banner-buttons">
            <a routerLink="/branches" class="btn btn-light btn-lg">تصفح الفروع وأرقام الهواتف</a>
            <a href="tel:19850" class="btn btn-outline-light btn-lg">الخط الساخن: 19850</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
      padding: 4rem 0;
      position: relative;
      overflow: hidden;
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      gap: 3rem;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 86, 179, 0.1);
      color: var(--primary-blue);
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      margin-bottom: 1.25rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-blue);
    }
    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.2;
      color: var(--primary-dark);
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      line-height: 1.6;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .btn-lg {
      padding: 0.85rem 1.75rem;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      border-top: 1px solid rgba(0, 86, 179, 0.15);
      padding-top: 1.5rem;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-item strong {
      font-size: 1.6rem;
      color: var(--primary-blue);
      font-weight: 800;
      line-height: 1;
    }
    .stat-item span {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(0, 86, 179, 0.2);
    }
    .hero-visual { position: relative; }
    .visual-card {
      position: relative;
      border-radius: 20px;
      overflow: visible;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .hero-img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      border-radius: 20px;
      border: 4px solid #ffffff;
    }
    .floating-badge {
      position: absolute;
      background: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 1px solid var(--border-color);
    }
    .rx-badge { top: 20px; right: -15px; }
    [dir="rtl"] .rx-badge { right: auto; left: -15px; }
    .delivery-float { bottom: -15px; left: 20px; }
    [dir="rtl"] .delivery-float { left: auto; right: 20px; }
    .badge-icon { font-size: 1.5rem; }
    .floating-badge strong { display: block; color: var(--text-main); font-size: 0.9rem; }
    .floating-badge small { color: var(--text-muted); font-size: 0.75rem; }
    .section { padding: 4rem 0; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-dark);
      margin-bottom: 0.35rem;
    }
    .section-subtitle { color: var(--text-muted); font-size: 1rem; }
    .view-all-link { color: var(--primary-blue); font-weight: 700; font-size: 0.95rem; }
    .view-all-link:hover { text-decoration: underline; }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.25rem;
    }
    .category-card {
      background: #ffffff;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem 1rem;
      text-align: center;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .category-card:hover {
      border-color: var(--primary-blue);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .cat-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    .cat-icon-wrap.blue { background: #e0f2fe; }
    .cat-icon-wrap.green { background: #dcfce7; }
    .cat-icon-wrap.red { background: #fee2e2; }
    .cat-icon-wrap.yellow { background: #fef3c7; }
    .cat-icon-wrap.purple { background: #f3e8ff; }
    .cat-icon-wrap.orange { background: #ffedd5; }
    .cat-title { font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem; }
    .cat-count { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
    .values-section {
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 3rem 0;
    }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    .value-card { padding: 1.25rem; text-align: center; }
    .value-icon { font-size: 2.2rem; margin-bottom: 0.75rem; }
    .value-card h4 { font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; }
    .value-card p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
      border-radius: var(--radius-lg);
    }
    .card-img-wrap {
      position: relative;
      height: 200px;
      background: #f8fafc;
      overflow: hidden;
    }
    .product-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-thumb { transform: scale(1.05); }
    .discount-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--danger);
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    [dir="rtl"] .discount-tag { right: auto; left: 10px; }
    .rx-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #dc2626;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    [dir="rtl"] .rx-tag { left: auto; right: 10px; }
    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .product-name {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 0.2rem;
    }
    .product-name a:hover { color: var(--primary-blue); }
    .product-subname {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .active-ingredient {
      background: var(--bg-slate);
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      margin-bottom: 1rem;
      display: flex;
      gap: 0.35rem;
    }
    .active-ingredient small { color: var(--text-muted); font-weight: 600; }
    .active-ingredient span { color: var(--text-main); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      margin-bottom: 1rem;
    }
    .current-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-blue);
      display: block;
    }
    .old-price { font-size: 0.85rem; color: var(--text-muted); text-decoration: line-through; }
    .stock-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0369a1;
      background: #e0f2fe;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .add-cart-btn { width: 100%; }
    .branches-banner {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
      color: white;
      padding: 4rem 0;
      margin-top: 3rem;
    }
    .banner-inner { text-align: center; max-width: 800px; margin: 0 auto; }
    .network-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.35rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .branches-banner h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; }
    .branches-banner p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; line-height: 1.6; }
    .banner-buttons { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .btn-light { background: white; color: var(--primary-blue); font-weight: 700; }
    .btn-light:hover { background: #f0f7ff; }
    .btn-outline-light { border: 2px solid white; color: white; font-weight: 700; }
    .btn-outline-light:hover { background: rgba(255, 255, 255, 0.1); }
    @media (max-width: 900px) {
      .hero-container { grid-template-columns: 1fr; }
      .values-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  lang = inject(LanguageService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  featuredProducts = signal<Product[]>([]);
  addedId = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: (prods) => this.featuredProducts.set(prods),
      error: () => {}
    });
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

