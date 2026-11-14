import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container footer-content">
        <!-- Brand Info -->
        <div class="footer-col brand-col">
          <div class="logo">
            <div class="logo-mark">Rx</div>
            <span class="brand-title">{{ lang.t('brand_name') }}</span>
          </div>
          <p class="brand-desc">{{ lang.t('brand_tagline') }}</p>
          <div class="gov-badge">
            <span class="dot"></span>
            <span>{{ lang.t('feat_authentic') }} • مرخص من وزارة الصحة وهيئة الدواء</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4 class="col-title">{{ lang.t('nav_products') }}</h4>
          <ul class="footer-links">
            <li><a routerLink="/products" [queryParams]="{cat: 1}">{{ lang.t('cat_medicines') }}</a></li>
            <li><a routerLink="/products" [queryParams]="{cat: 2}">{{ lang.t('cat_vitamins') }}</a></li>
            <li><a routerLink="/products" [queryParams]="{cat: 5}">{{ lang.t('cat_chronic') }}</a></li>
            <li><a routerLink="/products" [queryParams]="{cat: 3}">{{ lang.t('cat_baby') }}</a></li>
            <li><a routerLink="/products" [queryParams]="{cat: 4}">{{ lang.t('cat_skin') }}</a></li>
          </ul>
        </div>

        <!-- Branches & Coverage -->
        <div class="footer-col">
          <h4 class="col-title">{{ lang.t('nav_branches') }}</h4>
          <p class="coverage-text">30 فرعاً تغطي القاهرة، الجيزة، الإسكندرية، الدلتا، القناة، والصعيد.</p>
          <a routerLink="/branches" class="branches-link">استكشف أقرب فرع في محافظتك &rarr;</a>
          <div class="contact-box">
            <span>{{ lang.t('hotline') }}</span>
            <small>خدمة توصيل سريعة 24/7</small>
          </div>
        </div>

        <!-- Payment Badges -->
        <div class="footer-col">
          <h4 class="col-title">وسائل الدفع المعتمدة</h4>
          <p class="payment-desc">{{ lang.t('feat_payment_desc') }}</p>
          <div class="payment-badges">
            <span class="payment-pill visa">VISA</span>
            <span class="payment-pill mc">Mastercard</span>
            <span class="payment-pill meeza">ميزة Meeza</span>
            <span class="payment-pill cod">دفع عند الاستلام</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container bottom-content">
          <p>© 1985 - 2026 صيدليات دوائي مصر (Dawa2y Pharmacies S.A.E). جميع الحقوق محفوظة.</p>
          <p class="regulatory">خاضع لرقابة هيئة الدواء المصرية (EDA) • ترخيص وزارة الصحة والسكان</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0f172a;
      color: #94a3b8;
      padding-top: 3.5rem;
      border-top: 4px solid var(--primary-blue);
      margin-top: 4rem;
    }
    .footer-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 2.5rem;
      padding-bottom: 3rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .logo-mark {
      background: var(--primary-blue);
      color: white;
      font-weight: 800;
      font-size: 1.1rem;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }
    .brand-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
    }
    .brand-desc {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .gov-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
    }
    .col-title {
      color: white;
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .footer-links a:hover { color: white; transform: translateX(4px); }
    [dir="rtl"] .footer-links a:hover { transform: translateX(-4px); }
    .coverage-text {
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }
    .branches-link {
      color: var(--accent-cyan);
      font-weight: 600;
      font-size: 0.85rem;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .contact-box {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.75rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      color: #e0f2fe;
      font-weight: 700;
    }
    .contact-box small {
      color: #94a3b8;
      font-weight: normal;
      font-size: 0.75rem;
    }
    .payment-desc { font-size: 0.85rem; margin-bottom: 0.75rem; }
    .payment-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .payment-pill {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .payment-pill.visa { color: #60a5fa; }
    .payment-pill.mc { color: #f87171; }
    .payment-pill.meeza { color: #34d399; }
    .payment-pill.cod { color: #fbbf24; }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.5rem 0;
      font-size: 0.8rem;
    }
    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .regulatory { color: #64748b; }
    @media (max-width: 900px) {
      .footer-content { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {
  lang = inject(LanguageService);
}

