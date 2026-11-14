import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Branch, Order, CheckoutRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private http = inject(HttpClient);

  getBranches(governorate?: number): Observable<Branch[]> {
    let params = new HttpParams();
    if (governorate !== undefined && governorate !== null) {
      params = params.set('governorate', governorate.toString());
    }
    return this.http.get<Branch[]>(`${API_BASE_URL}/branches`, { params });
  }

  getBranchById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${API_BASE_URL}/branches/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/checkout`, request);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${id}`);
  }

  trackOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderNumber.trim())}`);
  }
}

