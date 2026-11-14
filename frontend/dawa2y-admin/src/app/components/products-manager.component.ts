import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { AdminLangService } from '../services/admin-lang.service';
import { Product, CreateProductDto, UpdateProductDto, ProductCategory } from '../models/admin.models';

@Component({
  selector: 'app-products-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.isAr() ? 'إدارة الأدوية والكتالوج الدوائي' : 'Medications & Catalog Management' }}</h1>
          <p class="page-subtitle">
            {{ lang.isAr() ? 'إضافة وتعديل وحذف الأصناف الدوائية ومراقبة الأسعار والجرعات' : 'Add, edit, delete products and configure dosage, pricing & Rx flags' }}
          </p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          ➕ {{ lang.isAr() ? 'إضافة دواء جديد' : 'Add New Medication' }}
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-card admin-card">
        <div class="filter-grid">
          <div class="filter-group search-group">
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="searchTerm" 
              (keyup.enter)="loadProducts()"
              placeholder="{{ lang.isAr() ? 'بحث بالاسم العربي أو الإنجليزي أو كود SKU...' : 'Search by name, English name, SKU, active ingredient...' }}" />
          </div>

          <div class="filter-group">
            <select class="form-control" [(ngModel)]="selectedCategory" (change)="loadProducts()">
              <option [ngValue]="null">{{ lang.isAr() ? 'جميع الأقسام الدوائية' : 'All Categories' }}</option>
              <option [ngValue]="1">{{ lang.isAr() ? 'أدوية ومسكنات' : 'Medicines & Pain Relief' }}</option>
              <option [ngValue]="2">{{ lang.isAr() ? 'فيتامينات ومكملات' : 'Vitamins & Supplements' }}</option>
              <option [ngValue]="3">{{ lang.isAr() ? 'الأم والطفل' : 'Baby & Mother' }}</option>
              <option [ngValue]="4">{{ lang.isAr() ? 'العناية بالبشرة' : 'Skin & Beauty' }}</option>
              <option [ngValue]="5">{{ lang.isAr() ? 'أمراض مزمنة' : 'Chronic Diseases' }}</option>
              <option [ngValue]="6">{{ lang.isAr() ? 'أجهزة وإسعافات' : 'First Aid & Devices' }}</option>
              <option [ngValue]="7">{{ lang.isAr() ? 'عناية شخصية' : 'Personal Care' }}</option>
            </select>
          </div>

          <button class="btn btn-secondary" (click)="loadProducts()">
            🔍 {{ lang.isAr() ? 'تطبيق الفلتر' : 'Filter' }}
          </button>
        </div>
      </div>

      <!-- FEEDBACK MESSAGE -->
      @if (actionMessage()) {
        <div class="alert-success">
          {{ actionMessage() }}
        </div>
      }

      <!-- PRODUCTS TABLE -->
      <div class="admin-card">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ lang.isAr() ? 'جاري تحميل قائمة الأدوية...' : 'Loading catalog...' }}</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ lang.isAr() ? 'الدواء' : 'Product' }}</th>
                  <th>SKU</th>
                  <th>{{ lang.isAr() ? 'القسم' : 'Category' }}</th>
                  <th>{{ lang.isAr() ? 'السعر (ج.م)' : 'Price (EGP)' }}</th>
                  <th>{{ lang.isAr() ? 'المخزون الإجمالي' : 'Total Stock' }}</th>
                  <th>{{ lang.isAr() ? 'الروشتة' : 'Prescription' }}</th>
                  <th>{{ lang.isAr() ? 'الشركة المصنعة' : 'Manufacturer' }}</th>
                  <th>{{ lang.isAr() ? 'الإجراءات' : 'Actions' }}</th>
                </tr>
              </thead>
              <tbody>
                @for (prod of products(); track prod.id) {
                  <tr>
                    <td>
                      <div class="prod-cell">
                        <img [src]="prod.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&q=80'" alt="Product" class="prod-thumb" />
                        <div>
                          <strong>{{ lang.isAr() ? prod.nameAr : prod.nameEn }}</strong>
                          <div class="prod-sub">{{ lang.isAr() ? prod.nameEn : prod.nameAr }}</div>
                          <small class="text-muted">{{ prod.dosage }}</small>
                        </div>
                      </div>
                    </td>
                    <td><code>{{ prod.sku }}</code></td>
                    <td><span class="badge badge-info">{{ prod.categoryName }}</span></td>
                    <td>
                      <strong>{{ prod.price | number:'1.2-2' }}</strong>
                      @if (prod.discountPrice) {
                        <small class="discount-cross">{{ prod.discountPrice | number:'1.2-2' }}</small>
                      }
                    </td>
                    <td>
                      <span class="stock-badge" [class.low]="prod.totalStock < 20">
                        {{ prod.totalStock }} {{ lang.isAr() ? 'عبوة' : 'units' }}
                      </span>
                    </td>
                    <td>
                      @if (prod.requiresPrescription) {
                        <span class="badge badge-danger">Rx Required</span>
                      } @else {
                        <span class="badge badge-success">OTC</span>
                      }
                    </td>
                    <td>{{ prod.manufacturer }}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" (click)="openEditModal(prod)" title="Edit">
                          ✏️ {{ lang.isAr() ? 'تعديل' : 'Edit' }}
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="confirmDelete(prod)" title="Delete">
                          🗑️
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

      <!-- ADD / EDIT MODAL -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3>
                {{ isEditing() ? (lang.isAr() ? 'تعديل بيانات الدواء' : 'Edit Medication') : (lang.isAr() ? 'إضافة دواء جديد للكتالوج' : 'Add New Medication') }}
              </h3>
              <button class="close-btn" (click)="closeModal()">✕</button>
            </div>

            <form (ngSubmit)="saveProduct()">
              <div class="modal-body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'الاسم باللغة العربية' : 'Arabic Name' }} *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.nameAr" name="nameAr" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'الاسم باللغة الإنجليزية' : 'English Name' }} *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.nameEn" name="nameEn" required />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">SKU / كود الصنف *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.sku" name="sku" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'القسم الدوائي' : 'Category' }}</label>
                    <select class="form-control" [(ngModel)]="formData.category" name="category">
                      <option [ngValue]="1">Medicines / أدوية ومسكنات</option>
                      <option [ngValue]="2">Vitamins / فيتامينات ومكملات</option>
                      <option [ngValue]="3">Baby & Mother / الأم والطفل</option>
                      <option [ngValue]="4">Skin & Beauty / العناية بالبشرة</option>
                      <option [ngValue]="5">Chronic Diseases / أمراض مزمنة</option>
                      <option [ngValue]="6">First Aid / إسعافات وأجهزة</option>
                      <option [ngValue]="7">Personal Care / عناية شخصية</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'السعر (ج.م)' : 'Price (EGP)' }} *</label>
                    <input type="number" step="0.5" class="form-control" [(ngModel)]="formData.price" name="price" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'الجرعة والشكل الصيدلي' : 'Dosage & Form' }}</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.dosage" name="dosage" placeholder="e.g. 500mg, 24 Tablets" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'المادة الفعالة' : 'Active Ingredient' }}</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.activeIngredient" name="activeIngredient" placeholder="e.g. Paracetamol" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'الشركة المصنعة' : 'Manufacturer' }}</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.manufacturer" name="manufacturer" placeholder="e.g. GlaxoSmithKline" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">{{ lang.isAr() ? 'رابط الصورة' : 'Image URL' }}</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.imageUrl" name="imageUrl" />
                  </div>
                  @if (!isEditing()) {
                    <div class="form-group">
                      <label class="form-label">{{ lang.isAr() ? 'المخزون الافتتاحي (الوحدات)' : 'Initial Stock' }}</label>
                      <input type="number" class="form-control" [(ngModel)]="formData.initialStock" name="initialStock" />
                    </div>
                  } @else {
                    <div class="form-group">
                      <label class="form-label">{{ lang.isAr() ? 'إجمالي المخزون' : 'Total Stock' }}</label>
                      <input type="number" class="form-control" [(ngModel)]="formData.totalStock" name="totalStock" />
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="formData.requiresPrescription" name="requiresPrescription" />
                    <span>{{ lang.isAr() ? 'يتطلب روشتة / وصفة طبية معتمدة (Rx)' : 'Requires Prescription from Licensed Doctor (Rx)' }}</span>
                  </label>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  {{ lang.isAr() ? 'إلغاء' : 'Cancel' }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="submitting()">
                  {{ submitting() ? (lang.isAr() ? 'جاري الحفظ...' : 'Saving...') : (lang.isAr() ? 'حفظ الصنف' : 'Save Medication') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- DELETE CONFIRMATION MODAL -->
      @if (deleteTarget()) {
        <div class="modal-backdrop">
          <div class="modal-dialog" style="max-width: 420px;">
            <div class="modal-header">
              <h3>{{ lang.isAr() ? 'تأكيد حذف الدواء' : 'Confirm Delete' }}</h3>
              <button class="close-btn" (click)="deleteTarget.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <p>
                {{ lang.isAr() 
                  ? 'هل أنت متأكد من حذف هذا الدواء نهائياً من قاعدة بيانات الصيدلية؟' 
                  : 'Are you sure you want to delete this medication from Dawa2y catalog?' }}
              </p>
              <div class="mt-2 p-2 bg-light rounded">
                <strong>{{ lang.isAr() ? deleteTarget()?.nameAr : deleteTarget()?.nameEn }}</strong>
                <div>SKU: <code>{{ deleteTarget()?.sku }}</code></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="deleteTarget.set(null)">
                {{ lang.isAr() ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="button" class="btn btn-danger" (click)="executeDelete()" [disabled]="submitting()">
                {{ submitting() ? '...' : (lang.isAr() ? 'نعم، احذف' : 'Delete Now') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .products-page {
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
      padding: 1rem 1.25rem;
    }

    .filter-grid {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-group {
      flex: 1;
    }

    .prod-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .prod-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--border-color);
    }

    .prod-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .discount-cross {
      text-decoration: line-through;
      color: var(--text-muted);
      margin-inline-start: 4px;
      font-size: 0.8rem;
    }

    .stock-badge {
      font-weight: 700;
      color: var(--success);
    }

    .stock-badge.low {
      color: var(--danger);
    }

    .btn-group {
      display: flex;
      gap: 0.4rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
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
export class ProductsManagerComponent implements OnInit {
  api = inject(AdminApiService);
  lang = inject(AdminLangService);

  loading = signal(true);
  submitting = signal(false);
  products = signal<Product[]>([]);
  actionMessage = signal<string | null>(null);

  searchTerm = '';
  selectedCategory: number | null = null;

  showModal = signal(false);
  isEditing = signal(false);
  editingId: string | null = null;
  deleteTarget = signal<Product | null>(null);

  formData: any = {
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    sku: '',
    category: 1,
    price: 0,
    discountPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
    requiresPrescription: false,
    dosage: '',
    activeIngredient: '',
    manufacturer: '',
    initialStock: 100,
    totalStock: 100,
    isActive: true
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.api.getProducts(this.searchTerm, this.selectedCategory || undefined, 1, 100).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.products.set(res.items);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      sku: 'MED-' + Math.floor(1000 + Math.random() * 9000),
      category: 1,
      price: 50,
      discountPrice: null,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
      requiresPrescription: false,
      dosage: 'Tablet / شراب',
      activeIngredient: '',
      manufacturer: 'Dawa2y Pharma',
      initialStock: 100,
      totalStock: 100,
      isActive: true
    };
    this.showModal.set(true);
  }

  openEditModal(prod: Product) {
    this.isEditing.set(true);
    this.editingId = prod.id;
    this.formData = {
      ...prod
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveProduct() {
    this.submitting.set(true);
    this.actionMessage.set(null);

    if (this.isEditing() && this.editingId) {
      const updateDto: UpdateProductDto = {
        nameAr: this.formData.nameAr,
        nameEn: this.formData.nameEn,
        descriptionAr: this.formData.descriptionAr || this.formData.nameAr,
        descriptionEn: this.formData.descriptionEn || this.formData.nameEn,
        sku: this.formData.sku,
        category: Number(this.formData.category),
        price: Number(this.formData.price),
        discountPrice: this.formData.discountPrice ? Number(this.formData.discountPrice) : null,
        imageUrl: this.formData.imageUrl,
        requiresPrescription: !!this.formData.requiresPrescription,
        dosage: this.formData.dosage,
        activeIngredient: this.formData.activeIngredient,
        manufacturer: this.formData.manufacturer,
        totalStock: Number(this.formData.totalStock || 100),
        isActive: true
      };

      this.api.updateProduct(this.editingId, updateDto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.actionMessage.set(this.lang.isAr() ? 'تم تحديث الدواء بنجاح' : 'Product updated successfully');
          this.loadProducts();
        },
        error: () => this.submitting.set(false)
      });
    } else {
      const createDto: CreateProductDto = {
        nameAr: this.formData.nameAr,
        nameEn: this.formData.nameEn,
        descriptionAr: this.formData.descriptionAr || this.formData.nameAr,
        descriptionEn: this.formData.descriptionEn || this.formData.nameEn,
        sku: this.formData.sku,
        category: Number(this.formData.category),
        price: Number(this.formData.price),
        discountPrice: this.formData.discountPrice ? Number(this.formData.discountPrice) : null,
        imageUrl: this.formData.imageUrl,
        requiresPrescription: !!this.formData.requiresPrescription,
        dosage: this.formData.dosage,
        activeIngredient: this.formData.activeIngredient,
        manufacturer: this.formData.manufacturer,
        initialStock: Number(this.formData.initialStock || 100)
      };

      this.api.createProduct(createDto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.actionMessage.set(this.lang.isAr() ? 'تمت إضافة الدواء الجديد للكتالوج' : 'New product created successfully');
          this.loadProducts();
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  confirmDelete(prod: Product) {
    this.deleteTarget.set(prod);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;

    this.submitting.set(true);
    this.api.deleteProduct(target.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleteTarget.set(null);
        this.actionMessage.set(this.lang.isAr() ? 'تم حذف الدواء بنجاح' : 'Product deleted successfully');
        this.loadProducts();
      },
      error: () => this.submitting.set(false)
    });
  }
}

