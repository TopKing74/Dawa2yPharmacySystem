import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../services/language.service';
import { BranchService } from '../services/order-and-branch.services';
import { Branch } from '../models';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container branches-page">
      <div class="branches-hero">
        <span class="est-tag">منذ 1985 • في كل محافظات مصر</span>
        <h1 class="page-title">{{ lang.t('branches_title') }}</h1>
        <p class="page-subtitle">{{ lang.t('branches_subtitle') }}</p>

        <div class="filter-box">
          <label>{{ lang.t('filter_governorate') }}:</label>
          <select [(ngModel)]="selectedGov" (change)="onFilterChange()" class="gov-select">
            <option [value]="undefined">{{ lang.t('all_governorates') }}</option>
            <option [value]="1">القاهرة (Cairo - 6 فروع)</option>
            <option [value]="2">الجيزة (Giza - 5 فروع)</option>
            <option [value]="3">الإسكندرية (Alexandria - 4 فروع)</option>
            <option [value]="6">الدقهلية - المنصورة</option>
            <option [value]="7">الغربية - طنطا</option>
            <option [value]="5">الشرقية - الزقازيق</option>
            <option [value]="13">بورسعيد</option>
            <option [value]="11">الإسماعيلية</option>
            <option [value]="12">السويس</option>
            <option [value]="18">أسيوط</option>
            <option [value]="17">المنيا</option>
            <option [value]="19">سوهاج</option>
            <option [value]="21">الأقصر</option>
            <option [value]="22">أسوان</option>
            <option [value]="23">الغردقة (البحر الأحمر)</option>
            <option [value]="24">شرم الشيخ (جنوب سيناء)</option>
            <option [value]="25">مرسى مطروح</option>
          </select>
        </div>
      </div>

      <div class="branches-grid">
        <div *ngFor="let branch of displayedBranches()" class="branch-card card">
          <div class="branch-card-header">
            <div>
              <span *ngIf="branch.isMainBranch" class="main-hq-badge">{{ lang.t('main_hq') }}</span>
              <h3 class="branch-name">{{ lang.currentLang() === 'ar' ? branch.nameAr : branch.nameEn }}</h3>
              <span class="gov-name">{{ branch.governorateName }}</span>
            </div>
            <span class="working-pill">24/7 مفتوح دائماً</span>
          </div>

          <div class="branch-card-body">
            <p class="branch-address">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ lang.currentLang() === 'ar' ? branch.addressAr : branch.addressEn }}</span>
            </p>

            <p class="branch-phone">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <strong>{{ branch.phoneNumber }}</strong>
            </p>
          </div>

          <div class="branch-card-footer">
            <a [href]="'tel:' + branch.phoneNumber" class="btn btn-secondary call-btn">
              <span>{{ lang.t('call_branch') }}</span>
            </a>
            <a [href]="'https://www.google.com/maps/search/?api=1&query=' + branch.latitude + ',' + branch.longitude" target="_blank" class="btn btn-outline map-btn">
              <span>الموقع على الخريطة 🗺️</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .branches-page { padding: 3rem 1.25rem 5rem; }
    .branches-hero { text-align: center; max-width: 800px; margin: 0 auto 3rem; }
    .est-tag {
      display: inline-block; background: var(--primary-light); color: var(--primary-blue); padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem;
    }
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.75rem; }
    .page-subtitle { color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2rem; }
    .filter-box {
      display: inline-flex; align-items: center; gap: 0.75rem; background: white; padding: 0.75rem 1.5rem; border-radius: var(--radius-full); border: 1.5px solid var(--border-color); box-shadow: var(--shadow-sm);
    }
    .filter-box label { font-weight: 700; font-size: 0.9rem; }
    .gov-select {
      border: none; font-size: 0.95rem; font-weight: 600; color: var(--primary-blue); background: transparent; outline: none; cursor: pointer;
    }
    .branches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
    .branch-card {
      padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1.5px solid var(--border-color);
    }
    .branch-card:hover { border-color: var(--primary-blue); transform: translateY(-2px); }
    .branch-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .main-hq-badge {
      display: inline-block; background: #fef3c7; color: #b45309; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; margin-bottom: 0.35rem;
    }
    .branch-name { font-size: 1.15rem; font-weight: 800; color: var(--primary-dark); }
    .gov-name { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .working-pill {
      background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: var(--radius-full); white-space: nowrap;
    }
    .branch-card-body { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .branch-address, .branch-phone { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; color: var(--text-main); }
    .branch-address svg, .branch-phone svg { color: var(--primary-blue); flex-shrink: 0; }
    .branch-card-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }
    .call-btn, .map-btn { width: 100%; font-size: 0.85rem; padding: 0.5rem; }
  `]
})
export class BranchesComponent implements OnInit {
  lang = inject(LanguageService);
  private branchService = inject(BranchService);

  allBranches = signal<Branch[]>([]);
  displayedBranches = signal<Branch[]>([]);
  selectedGov: number | undefined = undefined;

  ngOnInit(): void {
    this.branchService.getBranches().subscribe({
      next: (b) => {
        this.allBranches.set(b);
        this.displayedBranches.set(b);
      }
    });
  }

  onFilterChange(): void {
    if (this.selectedGov !== undefined && this.selectedGov !== null) {
      const gov = Number(this.selectedGov);
      this.displayedBranches.set(this.allBranches().filter(b => b.governorate === gov));
    } else {
      this.displayedBranches.set(this.allBranches());
    }
  }
}

