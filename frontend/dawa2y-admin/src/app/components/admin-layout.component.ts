import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLangService } from '../services/admin-lang.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell" [attr.dir]="lang.direction()">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand">
            <span class="brand-plus">+</span>
            <div class="brand-text">
              <span class="brand-title">Dawa2y <span>Admin</span></span>
              <span class="brand-sub">إدارة صيدليات دوائي</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">
            {{ lang.isAr() ? 'القائمة الرئيسية' : 'MAIN MENU' }}
          </div>
          
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">{{ lang.isAr() ? 'لوحة المؤشرات والتحليلات' : 'Dashboard Insights' }}</span>
          </a>

          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💊</span>
            <span class="nav-label">{{ lang.isAr() ? 'إدارة الأدوية والأصناف' : 'Products & Catalog' }}</span>
          </a>

          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏬</span>
            <span class="nav-label">{{ lang.isAr() ? 'مخزون الفروع (30 فرع)' : 'Branch Stock (30 Branches)' }}</span>
          </a>

          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-label">{{ lang.isAr() ? 'الطلبات والتسليم' : 'Orders & Dispatch' }}</span>
          </a>

          <div class="nav-section-title mt-4">
            {{ lang.isAr() ? 'روابط النظام' : 'EXTERNAL' }}
          </div>

          <a href="http://localhost:4200" target="_blank" class="nav-item external-link">
            <span class="nav-icon">🌐</span>
            <span class="nav-label">{{ lang.isAr() ? 'زيارة متجر العملاء' : 'View Customer Store' }} ↗</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="portal-badge">
            <span class="secure-dot"></span>
            <span>{{ lang.isAr() ? 'نظام إداري معزول ومؤمن' : 'Isolated Admin Node' }}</span>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <div class="content-wrapper">
        <!-- TOP HEADER -->
        <header class="topbar">
          <div class="topbar-left">
            <h2 class="page-context-title">
              {{ lang.isAr() ? 'نظام التحكم المركزي - صيدليات دوائي' : 'Central Pharmacy Operations & ERP' }}
            </h2>
          </div>

          <div class="topbar-right">
            <!-- Language Toggle -->
            <button class="btn btn-secondary btn-sm" (click)="lang.toggleLanguage()">
              🌐 {{ lang.isAr() ? 'English' : 'عربي' }}
            </button>

            <!-- Admin Profile -->
            <div class="admin-profile">
              <div class="profile-avatar">👨‍⚕️</div>
              <div class="profile-info">
                <span class="profile-name">{{ auth.currentUser()?.fullName || 'System Admin' }}</span>
                <span class="profile-role">Administrator</span>
              </div>
            </div>

            <!-- Logout -->
            <button class="btn btn-outline btn-sm" (click)="auth.logout()">
              {{ lang.isAr() ? 'خروج' : 'Logout' }}
            </button>
          </div>
        </header>

        <!-- ROUTER OUTLET -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-app);
    }

    /* Sidebar */
    .sidebar {
      width: 270px;
      background: #0f172a;
      color: white;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-inline-end: 1px solid #1e293b;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #1e293b;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-plus {
      width: 38px;
      height: 38px;
      background: var(--primary);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      display: block;
      color: white;
    }

    .brand-title span {
      color: #38bdf8;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: #94a3b8;
      display: block;
    }

    .sidebar-nav {
      padding: 1.25rem 0.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      padding: 0.5rem 0.75rem;
      letter-spacing: 0.05em;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: #1e293b;
      color: white;
    }

    .nav-item.active {
      background: var(--primary);
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(11, 79, 159, 0.4);
    }

    .nav-icon {
      font-size: 1.15rem;
    }

    .external-link {
      color: #38bdf8;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #1e293b;
    }

    .portal-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .secure-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
      box-shadow: 0 0 8px #22c55e;
    }

    /* Content Wrapper */
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }

    .topbar {
      height: 70px;
      background: white;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      box-shadow: var(--shadow-sm);
    }

    .page-context-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-dark);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.35rem 0.75rem;
      background: #f8fafc;
      border-radius: 20px;
      border: 1px solid var(--border-color);
    }

    .profile-avatar {
      font-size: 1.3rem;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .profile-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .profile-role {
      font-size: 0.72rem;
      color: var(--text-secondary);
    }

    .page-content {
      padding: 2rem;
      flex: 1;
    }
  `]
})
export class AdminLayoutComponent {
  auth = inject(AdminAuthService);
  lang = inject(AdminLangService);
}

