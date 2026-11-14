import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../services/admin-api.service';
import { AdminLangService } from '../services/admin-lang.service';
import { DashboardOverview } from '../models/admin.models';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.isAr() ? 'لوحة المؤشرات والتحليلات المركزية' : 'Executive Dashboard & Insights' }}</h1>
          <p class="page-subtitle">
            {{ lang.isAr() ? 'إحصائيات فورية لـ 30 فرعاً، أكثر من 500 صنف، وحوالي 5,000 زائر يومياً' : 'Live analytics across 30 branches, 500+ items, and ~5,000 daily visitors' }}
          </p>
        </div>
        <button class="btn btn-outline btn-sm" (click)="loadOverview()" [disabled]="loading()">
          🔄 {{ lang.isAr() ? 'تحديث البيانات' : 'Refresh Metrics' }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ lang.isAr() ? 'جاري تحميل مؤشرات الأداء...' : 'Loading analytics and branch data...' }}</p>
        </div>
      } @else if (data()) {
        <!-- KPI CARDS GRID -->
        <div class="kpi-grid">
          <!-- Daily Visitors -->
          <div class="kpi-card visitor-kpi">
            <div class="kpi-top">
              <span class="kpi-label">{{ lang.isAr() ? 'زوار اليوم' : 'Daily Visitors' }}</span>
              <span class="kpi-badge">~5,000 / day</span>
            </div>
            <div class="kpi-value">{{ data()?.todayVisitors | number }}</div>
            <div class="kpi-footer">
              <span class="trend-up">↑ 4.8%</span>
              <span class="kpi-hint">{{ lang.isAr() ? 'معدل التحويل: 2.9%' : 'Conversion: 2.9%' }}</span>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="kpi-card revenue-kpi">
            <div class="kpi-top">
              <span class="kpi-label">{{ lang.isAr() ? 'إجمالي المبيعات' : 'Total Revenue' }}</span>
              <span class="kpi-icon">💰</span>
            </div>
            <div class="kpi-value">{{ data()?.totalRevenue | number:'1.2-2' }} <small>EGP</small></div>
            <div class="kpi-footer">
              <span class="kpi-hint">{{ lang.isAr() ? 'مبيعات اليوم: ' : "Today's: " }} <strong>{{ data()?.todayRevenue | number:'1.2-2' }} EGP</strong></span>
            </div>
          </div>

          <!-- Total Orders -->
          <div class="kpi-card orders-kpi">
            <div class="kpi-top">
              <span class="kpi-label">{{ lang.isAr() ? 'إجمالي الطلبات' : 'Total Orders' }}</span>
              <span class="kpi-icon">📦</span>
            </div>
            <div class="kpi-value">{{ data()?.totalOrders | number }}</div>
            <div class="kpi-footer">
              <span class="kpi-hint">{{ lang.isAr() ? 'طلبات اليوم: ' : "Today's: " }} <strong>{{ data()?.todayOrders }}</strong></span>
            </div>
          </div>

          <!-- 30 Branches -->
          <div class="kpi-card branch-kpi">
            <div class="kpi-top">
              <span class="kpi-label">{{ lang.isAr() ? 'فروع الجمهورية' : 'Active Branches' }}</span>
              <span class="kpi-badge success">1985 - 2026</span>
            </div>
            <div class="kpi-value">{{ data()?.totalBranches }} <small>{{ lang.isAr() ? 'فرع' : 'Branches' }}</small></div>
            <div class="kpi-footer">
              <span class="kpi-hint">{{ lang.isAr() ? 'تغطي 27 محافظة مصرية' : 'Covering all Egyptian Governorates' }}</span>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="kpi-card stock-kpi" [class.alert]="(data()?.lowStockItemCount ?? 0) > 0">
            <div class="kpi-top">
              <span class="kpi-label">{{ lang.isAr() ? 'تنبيهات نواقص الأدوية' : 'Low Stock Alerts' }}</span>
              <span class="kpi-icon">⚠️</span>
            </div>
            <div class="kpi-value">{{ data()?.lowStockItemCount }}</div>
            <div class="kpi-footer">
              <a routerLink="/inventory" class="kpi-link">
                {{ lang.isAr() ? 'إعادة طلب المخزون ↗' : 'Reorder Stock ↗' }}
              </a>
            </div>
          </div>
        </div>

        <!-- CHARTS & TOP PRODUCTS ROW -->
        <div class="insights-row">
          <!-- Weekly Revenue & Sales Chart -->
          <div class="admin-card chart-card">
            <div class="card-header-flex">
              <div>
                <h3>{{ lang.isAr() ? 'حركة المبيعات خلال الـ 7 أيام الماضية' : '7-Day Revenue & Sales Trend' }}</h3>
                <p class="text-muted">{{ lang.isAr() ? 'مقارنة الإيرادات اليومية بالجنيه المصري' : 'Daily revenue performance in EGP' }}</p>
              </div>
            </div>

            <div class="bar-chart-container">
              @for (point of data()?.weeklySalesTrend; track point.date) {
                <div class="chart-col">
                  <div class="bar-wrapper">
                    <div class="bar-tooltip">{{ point.revenue | number:'1.0-0' }} EGP ({{ point.ordersCount }} orders)</div>
                    <div 
                      class="bar" 
                      [style.height.%]="getBarHeight(point.revenue)">
                    </div>
                  </div>
                  <span class="col-date">{{ point.date }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top Selling Medications -->
          <div class="admin-card top-products-card">
            <div class="card-header-flex">
              <div>
                <h3>{{ lang.isAr() ? 'الأدوية الأكثر مبيعاً' : 'Top Selling Medications' }}</h3>
                <p class="text-muted">{{ lang.isAr() ? 'حسب الوحدات المباعة والإيراد' : 'Ranked by units sold & revenue' }}</p>
              </div>
            </div>

            <div class="top-list">
              @for (item of data()?.topSellingProducts; track item.productId; let idx = $index) {
                <div class="top-item">
                  <div class="rank-circle">{{ idx + 1 }}</div>
                  <div class="product-info">
                    <strong>{{ lang.isAr() ? item.nameAr : item.nameEn }}</strong>
                    <span class="category-tag">{{ item.category }}</span>
                  </div>
                  <div class="product-stats">
                    <span class="units-badge">{{ item.unitsSold }} {{ lang.isAr() ? 'عبوة' : 'units' }}</span>
                    <span class="revenue-text">{{ item.revenueGenerated | number:'1.0-0' }} EGP</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 30 BRANCHES PERFORMANCE MATRIX -->
        <div class="admin-card mt-4">
          <div class="card-header-flex">
            <div>
              <h3>{{ lang.isAr() ? 'مصفوفة أداء الفروع الـ 30 في محافظات مصر' : '30-Branch Performance Matrix Across Egypt' }}</h3>
              <p class="text-muted">{{ lang.isAr() ? 'حجم الطلبات المنفذة والإيرادات والمخزون في كل فرع' : 'Orders fulfilled, revenue, and stock capacity per branch' }}</p>
            </div>
            <a routerLink="/inventory" class="btn btn-secondary btn-sm">
              {{ lang.isAr() ? 'إدارة المخزون الفصلي' : 'Manage Inventory' }}
            </a>
          </div>

          <div class="table-responsive mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ lang.isAr() ? 'الفرع' : 'Branch' }}</th>
                  <th>{{ lang.isAr() ? 'المحافظة' : 'Governorate' }}</th>
                  <th>{{ lang.isAr() ? 'الطلبات المنفذة' : 'Orders Fulfilled' }}</th>
                  <th>{{ lang.isAr() ? 'الإيراد المحقق' : 'Revenue (EGP)' }}</th>
                  <th>{{ lang.isAr() ? 'الأصناف المتوفرة' : 'Stocked Items' }}</th>
                  <th>{{ lang.isAr() ? 'الحالة التشغيلية' : 'Status' }}</th>
                </tr>
              </thead>
              <tbody>
                @for (b of data()?.branchInsights; track b.branchId) {
                  <tr>
                    <td>
                      <strong>{{ b.branchName }}</strong>
                    </td>
                    <td><span class="badge badge-info">{{ b.governorate }}</span></td>
                    <td><strong>{{ b.ordersFulfilled }}</strong></td>
                    <td>{{ b.revenue | number:'1.2-2' }} EGP</td>
                    <td>{{ b.inventoryCount }}</td>
                    <td>
                      <span class="badge badge-success">24/7 Active</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
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
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary-dark);
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      background: white;
      border-radius: var(--radius-md);
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 125px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .kpi-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .kpi-badge {
      background: #f1f5f9;
      color: var(--text-secondary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .kpi-badge.success {
      background: #dcfce7;
      color: #15803d;
    }

    .kpi-icon {
      font-size: 1.2rem;
    }

    .kpi-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .kpi-value small {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
    }

    .trend-up {
      color: var(--success);
      font-weight: 700;
    }

    .kpi-hint {
      color: var(--text-muted);
    }

    .kpi-link {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
    }

    .stock-kpi.alert {
      border-color: #fca5a5;
      background: #fff5f5;
    }

    .stock-kpi.alert .kpi-value {
      color: var(--danger);
    }

    /* Charts Row */
    .insights-row {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 1.5rem;
    }

    .card-header-flex {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .card-header-flex h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: 0.2rem;
    }

    .text-muted {
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    /* CSS Bar Chart */
    .bar-chart-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 220px;
      padding-top: 1.5rem;
      border-bottom: 2px solid var(--border-color);
      gap: 0.75rem;
    }

    .chart-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
    }

    .bar-wrapper {
      position: relative;
      width: 100%;
      max-width: 42px;
      height: 180px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar {
      width: 100%;
      background: linear-gradient(180deg, #0284c7 0%, #0b4f9f 100%);
      border-radius: 6px 6px 0 0;
      transition: height 0.5s ease, background 0.2s;
    }

    .bar-wrapper:hover .bar {
      background: #0284c7;
    }

    .bar-tooltip {
      position: absolute;
      top: -28px;
      background: #0f172a;
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    .bar-wrapper:hover .bar-tooltip {
      opacity: 1;
    }

    .col-date {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.6rem;
      font-weight: 600;
    }

    /* Top Products */
    .top-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .top-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.75rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .rank-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-info strong {
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .category-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .product-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .units-badge {
      font-size: 0.75rem;
      background: #e0f2fe;
      color: #0284c7;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .revenue-text {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .mt-4 {
      margin-top: 1.5rem;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 900px) {
      .insights-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardOverviewComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(AdminLangService);

  loading = signal(true);
  data = signal<DashboardOverview | null>(null);

  ngOnInit() {
    this.loadOverview();
  }

  loadOverview() {
    this.loading.set(true);
    this.api.getDashboardOverview().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.data.set(res);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getBarHeight(revenue: number): number {
    const list = this.data()?.weeklySalesTrend || [];
    const max = Math.max(...list.map(p => p.revenue), 1000);
    return Math.max(10, Math.round((revenue / max) * 100));
  }
}

