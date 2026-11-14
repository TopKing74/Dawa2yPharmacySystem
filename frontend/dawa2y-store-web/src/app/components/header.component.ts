import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top Announcement Bar -->
    <div class="top-bar">
      <div class="container top-bar-content">
        <div class="announcement">
          <span class="icon">🇪🇬</span>
          <span>{{ lang.t('est_badge') }}</span>
          <span class="separator">•</span>
          <span class="delivery-badge">{{ lang.t('delivery_badge') }}</span>
        </div>
        <div class="top-actions">
          <a href="tel:19850" class="hotline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{{ lang.t('hotline') }}</span>
          </a>
          <button class="lang-switch-btn" (click)="lang.toggleLanguage()">
            <strong>{{ lang.currentLang() === 'ar' ? 'English' : 'العربية' }}</strong>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="main-header">
      <div class="container header-container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <div class="logo-mark">Rx</div>
          <div class="logo-text">
            <span class="brand-title">{{ lang.t('brand_name') }}</span>
            <span class="brand-sub">Pharmacies • صيدليات</span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="search-container">
          <form (ngSubmit)="performSearch()" class="search-form">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              name="search"
              [placeholder]="lang.t('search_placeholder')"
              class="search-input"
            />
            <button type="submit" class="search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
        </div>

        <!-- Navigation Links & User Menu -->
        <nav class="nav-links">
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>{{ lang.t('nav_products') }}</span>
          </a>

          <a routerLink="/branches" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{{ lang.t('nav_branches') }}</span>
          </a>

          <a routerLink="/track" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>{{ lang.t('nav_track') }}</span>
          </a>

          <!-- Cart Icon with Badge -->
          <a routerLink="/cart" class="cart-btn" [title]="lang.t('nav_cart')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span class="cart-badge" *ngIf="cartService.totalItemsCount() > 0">{{ cartService.totalItemsCount() }}</span>
          </a>

          <!-- User Profile / Login -->
          <div class="user-block">
            <ng-container *ngIf="authService.isLoggedIn(); else guestLinks">
              <div class="user-pill">
                <span class="user-name">{{ authService.currentUser()?.fullName?.split(' ')?.[0] }}</span>
                <button (click)="authService.logout()" class="logout-btn" title="Logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </ng-container>
            <ng-template #guestLinks>
              <a routerLink="/auth" class="btn btn-secondary login-btn">
                <span>{{ lang.t('nav_login') }}</span>
              </a>
            </ng-template>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .top-bar {
      background: var(--primary-dark);
      color: #e0f2fe;
      font-size: 0.8rem;
      padding: 0.35rem 0;
    }
    .top-bar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .announcement {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .separator { opacity: 0.5; }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .hotline {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: #bae6fd;
      font-weight: 700;
    }
    .lang-switch-btn {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
    }
    .lang-switch-btn:hover { background: rgba(255, 255, 255, 0.25); }
    .main-header {
      background: var(--pure-white);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: var(--shadow-sm);
    }
    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .logo-mark {
      background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
      color: var(--pure-white);
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.2rem;
      box-shadow: 0 4px 10px rgba(0, 86, 179, 0.3);
    }
    .brand-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary-blue);
      line-height: 1.1;
      display: block;
    }
    .brand-sub {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .search-container {
      flex: 1;
      max-width: 520px;
    }
    .search-form {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-input {
      width: 100%;
      padding: 0.6rem 2.5rem 0.6rem 1rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border-color);
      font-size: 0.9rem;
      background: #f8fafc;
    }
    [dir="rtl"] .search-input { padding: 0.6rem 1rem 0.6rem 2.5rem; }
    .search-input:focus {
      background: #ffffff;
      border-color: var(--primary-blue);
      outline: none;
    }
    .search-btn {
      position: absolute;
      right: 0.75rem;
      color: var(--primary-blue);
      display: flex;
      align-items: center;
    }
    [dir="rtl"] .search-btn { right: auto; left: 0.75rem; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-main);
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius-md);
      transition: color 0.15s ease;
    }
    .nav-item:hover, .nav-item.active {
      color: var(--primary-blue);
      background-color: var(--primary-light);
    }
    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
      padding: 0.5rem;
      border-radius: var(--radius-full);
      background: var(--primary-light);
    }
    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary-light);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary-blue);
    }
    .logout-btn { color: var(--text-muted); display: flex; align-items: center; }
    .logout-btn:hover { color: var(--danger); }
    .login-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }
    @media (max-width: 900px) {
      .search-container { display: none; }
      .nav-item span { display: none; }
    }
  `]
})
export class HeaderComponent {
  lang = inject(LanguageService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }
}

