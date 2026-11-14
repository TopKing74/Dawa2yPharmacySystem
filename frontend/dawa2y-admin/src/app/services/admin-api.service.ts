import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ADMIN_API_BASE_URL, AdminAuthService } from './admin-auth.service';
import {
  DashboardOverview,
  Product,
  CreateProductDto,
  UpdateProductDto,
  BranchInventory,
  Branch,
  Order,
  OrderStatus,
  PaymentStatus,
  PagedResult
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private auth = inject(AdminAuthService);

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const token = this.auth.token();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Dashboard Insights
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${ADMIN_API_BASE_URL}/admin/dashboard/overview`, {
      headers: this.getHeaders()
    });
  }

  // Products CRUD
  getProducts(searchTerm?: string, category?: number, page: number = 1, pageSize: number = 50): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (category) params = params.set('category', category.toString());

    return this.http.get<PagedResult<Product>>(`${ADMIN_API_BASE_URL}/admin/products`, {
      headers: this.getHeaders(),
      params
    });
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${ADMIN_API_BASE_URL}/admin/products`, dto, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${ADMIN_API_BASE_URL}/admin/products/${id}`, dto, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${ADMIN_API_BASE_URL}/admin/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Inventory Management across 30 Branches
  getInventory(branchId?: string, lowStockOnly?: boolean): Observable<BranchInventory[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    if (lowStockOnly) params = params.set('lowStockOnly', 'true');

    return this.http.get<BranchInventory[]>(`${ADMIN_API_BASE_URL}/admin/inventory`, {
      headers: this.getHeaders(),
      params
    });
  }

  updateStock(branchId: string, productId: string, newQuantity: number): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${ADMIN_API_BASE_URL}/admin/inventory/update-stock`,
      { branchId, productId, newQuantity },
      { headers: this.getHeaders() }
    );
  }

  // Branches
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${ADMIN_API_BASE_URL}/branches`);
  }

  // Orders Management
  getOrders(status?: OrderStatus, page: number = 1, pageSize: number = 30): Observable<PagedResult<Order>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined && status !== null) {
      params = params.set('status', status.toString());
    }

    return this.http.get<PagedResult<Order>>(`${ADMIN_API_BASE_URL}/admin/orders`, {
      headers: this.getHeaders(),
      params
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus): Observable<Order> {
    return this.http.put<Order>(
      `${ADMIN_API_BASE_URL}/admin/orders/${orderId}/status`,
      { status, paymentStatus },
      { headers: this.getHeaders() }
    );
  }
}

