import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { AdminLangService } from '../services/admin-lang.service';
import { BranchInventory, Branch } from '../models/admin.models';

@Component({
  selector: 'app-inventory-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.isAr() ? 'إدارة المخزون ونواقص الأدوية' : 'Branch Inventory & Stock Control' }}</h1>
          <p class="page-subtitle">
            {{ lang.isAr() ? 'متابعة رصيد الأدوية في شبكة فروع دوائي الـ 30 وضبط الكميات فورياً' : 'Monitor medication levels across Dawa2y 30 branches and adjust stock levels' }}
          </p>
        </div>
        <button class="btn btn-outline" (click)="loadData()">
          🔄 {{ lang.isAr() ? 'تحديث المخزون' : 'Refresh Stock' }}
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="admin-card filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <label class="form-label">{{ lang.isAr() ? 'اختر الفرع' : 'Branch' }}</label>
            <select class="form-control" [(ngModel)]="selectedBranchId" (change)="loadInventory()">
              <option value="">{{ lang.isAr() ? 'جميع الفروع الـ 30' : 'All 30 Branches' }}</option>
              @for (branch of branches(); track branch.id) {
                <option [value]="branch.id">{{ lang.isAr() ? branch.nameAr : branch.nameEn }} ({{ branch.governorateName }})</option>
              }
            </select>
          </div>

          <div class="filter-item checkbox-item">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="lowStockOnly" (change)="loadInventory()" />
              <span>{{ lang.isAr() ? 'عرض نواقص الأدوية فقط (< 15 عبوة)' : 'Show Low Stock Items Only (< 15 units)' }}</span>
            </label>
          </div>
        </div>
      </div>

      @if (successMessage()) {
        <div class="alert-success">
          {{ successMessage() }}
        </div>
      }

      <!-- INVENTORY TABLE -->
      <div class="admin-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ lang.isAr() ? 'جاري فحص أرصدة الفروع...' : 'Scanning branch stock levels...' }}</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ lang.isAr() ? 'الفرع' : 'Branch' }}</th>
                  <th>{{ lang.isAr() ? 'الدواء' : 'Medication' }}</th>
                  <th>SKU</th>
                  <th>{{ lang.isAr() ? 'الكمية الحالية' : 'Current Stock' }}</th>
                  <th>{{ lang.isAr() ? 'حد إعادة الطلب' : 'Reorder Threshold' }}</th>
                  <th>{{ lang.isAr() ? 'الحالة' : 'Status' }}</th>
                  <th>{{ lang.isAr() ? 'آخر توريد' : 'Last Restocked' }}</th>
                  <th>{{ lang.isAr() ? 'تعديل الرصيد' : 'Adjust Stock' }}</th>
                </tr>
              </thead>
              <tbody>
                @for (inv of inventory(); track inv.id) {
                  <tr [class.warning-row]="inv.isLowStock">
                    <td>
                      <strong>{{ lang.isAr() ? inv.branchNameAr : inv.branchNameEn }}</strong>
                    </td>
                    <td>
                      <strong>{{ lang.isAr() ? inv.productNameAr : inv.productNameEn }}</strong>
                    </td>
                    <td><code>{{ inv.sku }}</code></td>
                    <td>
                      <span class="stock-qty" [class.danger-qty]="inv.isLowStock">
                        {{ inv.quantity }}
                      </span>
                    </td>
                    <td>{{ inv.reorderThreshold }}</td>
                    <td>
                      @if (inv.isLowStock) {
                        <span class="badge badge-danger">⚠️ Low Stock</span>
                      } @else {
                        <span class="badge badge-success">✓ In Stock</span>
                      }
                    </td>
                    <td><small class="text-muted">{{ inv.lastRestockedAt | date:'short' }}</small></td>
                    <td>
                      <div class="adjust-box">
                        <button class="btn btn-sm btn-secondary" (click)="stepStock(inv, -5)" title="-5">-5</button>
                        <button class="btn btn-sm btn-secondary" (click)="stepStock(inv, -1)" title="-1">-1</button>
                        <input 
                          type="number" 
                          class="stock-input" 
                          [(ngModel)]="inv.quantity" 
                          min="0" />
                        <button class="btn btn-sm btn-secondary" (click)="stepStock(inv, 1)" title="+1">+1</button>
                        <button class="btn btn-sm btn-secondary" (click)="stepStock(inv, 10)" title="+10">+10</button>
                        <button class="btn btn-sm btn-primary" (click)="saveStock(inv)">
                          💾 {{ lang.isAr() ? 'حفظ' : 'Save' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .inventory-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary-dark);
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .filter-card {
      padding: 1.25rem;
    }

    .filter-row {
      display: flex;
      gap: 2rem;
      align-items: flex-end;
    }

    .filter-item {
      flex: 1;
      max-width: 380px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      padding-bottom: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--danger);
      cursor: pointer;
    }

    .warning-row {
      background-color: #fffaf0;
    }

    .stock-qty {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .danger-qty {
      color: var(--danger);
    }

    .adjust-box {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .stock-input {
      width: 60px;
      text-align: center;
      padding: 0.3rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.9rem;
    }

    .alert-success {
      background: #dcfce7;
      color: #15803d;
      padding: 0.8rem 1rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class InventoryManagerComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(AdminLangService);

  loading = signal(true);
  branches = signal<Branch[]>([]);
  inventory = signal<BranchInventory[]>([]);
  successMessage = signal<string | null>(null);

  selectedBranchId = '';
  lowStockOnly = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loadInventory();
      },
      error: () => this.loadInventory()
    });
  }

  loadInventory() {
    this.loading.set(true);
    this.api.getInventory(this.selectedBranchId || undefined, this.lowStockOnly).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.inventory.set(res);
      },
      error: () => this.loading.set(false)
    });
  }

  stepStock(inv: BranchInventory, delta: number) {
    inv.quantity = Math.max(0, inv.quantity + delta);
    inv.isLowStock = inv.quantity < inv.reorderThreshold;
  }

  saveStock(inv: BranchInventory) {
    this.api.updateStock(inv.branchId, inv.productId, inv.quantity).subscribe({
      next: () => {
        inv.isLowStock = inv.quantity < inv.reorderThreshold;
        this.successMessage.set(
          this.lang.isAr() 
            ? `تم تحديث رصيد ${inv.productNameAr} في فرع ${inv.branchNameAr} بنجاح إلى ${inv.quantity} عبوة` 
            : `Stock for ${inv.productNameEn} in ${inv.branchNameEn} updated to ${inv.quantity}`
        );
        setTimeout(() => this.successMessage.set(null), 4000);
      }
    });
  }
}

