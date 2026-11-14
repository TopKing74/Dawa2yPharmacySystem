import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLangService } from '../services/admin-lang.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper" [attr.dir]="lang.direction()">
      <div class="login-box">
        <div class="login-brand">
          <div class="brand-badge">
            <span class="badge-icon">+</span>
          </div>
          <h1>Dawa2y Admin Portal</h1>
          <p class="brand-subtitle">
            {{ lang.isAr() ? 'بوابة إدارة صيدليات دوائي - نظام مستقل ومؤمن' : 'Independent Secure Central Management System' }}
          </p>
        </div>

        @if (errorMessage()) {
          <div class="alert-danger">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="handleLogin()" class="login-form">
          <div class="form-group">
            <label class="form-label">{{ lang.isAr() ? 'البريد الإلكتروني للإدارة' : 'Admin Email' }}</label>
            <input 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="admin@dawa2y.com" 
              required />
          </div>

          <div class="form-group">
            <label class="form-label">{{ lang.isAr() ? 'كلمة المرور' : 'Password' }}</label>
            <input 
              type="password" 
              class="form-control" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••" 
              required />
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
            {{ loading() ? (lang.isAr() ? 'جاري التحقق والصلاحيات...' : 'Authenticating...') : (lang.isAr() ? 'تسجيل الدخول للنظام' : 'Access Dashboard') }}
          </button>
        </form>

        <div class="demo-card">
          <div class="demo-header">
            <span>🔑</span>
            <strong>{{ lang.isAr() ? 'بيانات الدخول الإدارية التجريبية' : 'Demo Administrator Credentials' }}</strong>
          </div>
          <p>Email: <code>admin@dawa2y.com</code></p>
          <p>Password: <code>Admin&#64;123456</code></p>
          <button type="button" class="btn btn-outline btn-sm mt-2" (click)="fillDemoAdmin()">
            {{ lang.isAr() ? 'استخدام بيانات المدير' : 'Fill Admin Credentials' }}
          </button>
        </div>

        <div class="login-footer">
          <button type="button" class="btn btn-sm btn-secondary" (click)="lang.toggleLanguage()">
            🌐 {{ lang.isAr() ? 'English' : 'عربي' }}
          </button>
          <span>Dawa2y Pharmacies Egypt © 1985-2026</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #073770 0%, #0b4f9f 50%, #0284c7 100%);
      padding: 1.5rem;
    }

    .login-box {
      background: white;
      border-radius: var(--radius-lg);
      padding: 2.75rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 45px rgba(0,0,0,0.25);
    }

    .login-brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: var(--primary);
      color: white;
      border-radius: 14px;
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(11, 79, 159, 0.3);
    }

    .login-brand h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary-dark);
      margin-bottom: 0.25rem;
    }

    .brand-subtitle {
      font-size: 0.88rem;
      color: var(--text-secondary);
    }

    .btn-block {
      width: 100%;
    }

    .alert-danger {
      background: #fee2e2;
      color: #b91c1c;
      padding: 0.8rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .demo-card {
      margin-top: 1.75rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: var(--radius-md);
      padding: 1rem;
      font-size: 0.85rem;
      text-align: center;
    }

    .demo-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin-bottom: 0.4rem;
      color: var(--primary);
    }

    .demo-card code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #0f172a;
    }

    .login-footer {
      margin-top: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
    }
  `]
})
export class AdminLoginComponent {
  auth = inject(AdminAuthService);
  lang = inject(AdminLangService);
  router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  fillDemoAdmin() {
    this.email = 'admin@dawa2y.com';
    this.password = 'Admin@123456';
  }

  handleLogin() {
    if (!this.email || !this.password) return;
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.user.role === 'Admin') {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set(this.lang.isAr() ? 'غير مصرح: هذا الحساب ليس لديه صلاحيات مدير النظام' : 'Unauthorized: Administrator privileges required.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || (this.lang.isAr() ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password'));
      }
    });
  }
}

