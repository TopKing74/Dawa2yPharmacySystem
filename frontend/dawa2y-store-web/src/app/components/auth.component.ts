import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { EGYPTIAN_GOVERNORATES } from '../models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="logo-cross">+</span>
            <span class="logo-text">Dawa2y <span>دوائي</span></span>
          </div>
          <p class="auth-subtitle">
            {{ lang.isAr() ? 'بوابتك للصحة والعافية منذ 1985' : 'Your healthcare portal since 1985' }}
          </p>
        </div>

        <div class="auth-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'login'"
            (click)="activeTab.set('login')">
            {{ lang.isAr() ? 'تسجيل الدخول' : 'Sign In' }}
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'register'"
            (click)="activeTab.set('register')">
            {{ lang.isAr() ? 'حساب جديد' : 'Register' }}
          </button>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger">
            {{ errorMessage() }}
          </div>
        }

        <!-- LOGIN FORM -->
        @if (activeTab() === 'login') {
          <form (ngSubmit)="handleLogin()" class="auth-form">
            <div class="form-group">
              <label>{{ lang.isAr() ? 'البريد الإلكتروني' : 'Email Address' }}</label>
              <input 
                type="email" 
                class="form-control" 
                [(ngModel)]="loginEmail" 
                name="loginEmail" 
                placeholder="customer@dawa2y.com" 
                required />
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'كلمة المرور' : 'Password' }}</label>
              <input 
                type="password" 
                class="form-control" 
                [(ngModel)]="loginPassword" 
                name="loginPassword" 
                placeholder="••••••••" 
                required />
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
              {{ loading() ? (lang.isAr() ? 'جاري التحقق...' : 'Signing in...') : (lang.isAr() ? 'دخول' : 'Sign In') }}
            </button>

            <!-- Quick Demo Credential Button -->
            <div class="demo-box">
              <p class="demo-title">{{ lang.isAr() ? 'بيانات تجريبية سريعة:' : 'Quick Demo Credentials:' }}</p>
              <button type="button" class="btn btn-outline btn-sm" (click)="fillDemoCustomer()">
                {{ lang.isAr() ? 'ملء بيانات عميل تجريبي' : 'Use Demo Customer Account' }}
              </button>
            </div>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (activeTab() === 'register') {
          <form (ngSubmit)="handleRegister()" class="auth-form">
            <div class="form-group">
              <label>{{ lang.isAr() ? 'الاسم الكامل' : 'Full Name' }}</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="regFullName" 
                name="regFullName" 
                placeholder="{{ lang.isAr() ? 'أحمد محمد' : 'Ahmed Mohamed' }}" 
                required />
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'البريد الإلكتروني' : 'Email Address' }}</label>
              <input 
                type="email" 
                class="form-control" 
                [(ngModel)]="regEmail" 
                name="regEmail" 
                placeholder="name@example.com" 
                required />
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'رقم الهاتف المصري' : 'Egyptian Mobile Number' }}</label>
              <input 
                type="tel" 
                class="form-control" 
                [(ngModel)]="regPhone" 
                name="regPhone" 
                placeholder="01012345678" 
                required />
              <small class="text-muted">{{ lang.isAr() ? 'مثال: 010 / 011 / 012 / 015' : 'e.g., 010 / 011 / 012 / 015' }}</small>
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'المحافظة' : 'Governorate' }}</label>
              <select class="form-control" [(ngModel)]="regGovernorate" name="regGovernorate">
                @for (gov of governorates; track gov.id) {
                  <option [value]="gov.id">{{ lang.isAr() ? gov.nameAr : gov.nameEn }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'العنوان التفصيلي' : 'Street Address' }}</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="regAddress" 
                name="regAddress" 
                placeholder="{{ lang.isAr() ? 'شارع التحرير، الدقي' : '15 Tahrir St, Dokki' }}" 
                required />
            </div>

            <div class="form-group">
              <label>{{ lang.isAr() ? 'كلمة المرور' : 'Password' }}</label>
              <input 
                type="password" 
                class="form-control" 
                [(ngModel)]="regPassword" 
                name="regPassword" 
                placeholder="•••••••• (Min 6 chars)" 
                required />
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
              {{ loading() ? (lang.isAr() ? 'جاري التسجيل...' : 'Creating account...') : (lang.isAr() ? 'إنشاء الحساب' : 'Create Account') }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      background: linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%);
    }

    .auth-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 10px 30px rgba(11, 79, 159, 0.1);
      border: 1px solid var(--border-color);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--primary);
    }

    .logo-cross {
      background: var(--primary);
      color: white;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 900;
    }

    .auth-subtitle {
      color: var(--text-light);
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }

    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #f1f5f9;
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }

    .tab-btn {
      padding: 0.75rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.35rem;
      color: var(--text-dark);
    }

    .btn-block {
      width: 100%;
      margin-top: 0.5rem;
    }

    .demo-box {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: var(--radius-md);
      text-align: center;
    }

    .demo-title {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
  `]
})
export class AuthComponent {
  auth = inject(AuthService);
  lang = inject(LanguageService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  activeTab = signal<'login' | 'register'>('login');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  governorates = EGYPTIAN_GOVERNORATES;

  // Login model
  loginEmail = '';
  loginPassword = '';

  // Register model
  regFullName = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';
  regGovernorate = 1; // Cairo
  regAddress = '';

  fillDemoCustomer() {
    this.loginEmail = 'customer@dawa2y.com';
    this.loginPassword = 'Customer@123456';
  }

  handleLogin() {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(res.message || 'Login failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password');
      }
    });
  }

  handleRegister() {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.register({
      fullName: this.regFullName,
      email: this.regEmail,
      phoneNumber: this.regPhone,
      password: this.regPassword,
      governorate: Number(this.regGovernorate),
      address: this.regAddress
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set(res.message || 'Registration failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Check your data.');
      }
    });
  }
}
