import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Product, PagedResult } from '../models';

export interface ProductFilterParams {
  searchTerm?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  requiresPrescription?: boolean;
  inStockOnly?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(params?: ProductFilterParams): Observable<PagedResult<Product>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.category !== undefined && params.category !== null) httpParams = httpParams.set('category', params.category.toString());
      if (params.minPrice !== undefined && params.minPrice !== null) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined && params.maxPrice !== null) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.requiresPrescription !== undefined && params.requiresPrescription !== null) httpParams = httpParams.set('requiresPrescription', params.requiresPrescription.toString());
      if (params.inStockOnly !== undefined && params.inStockOnly !== null) httpParams = httpParams.set('inStockOnly', params.inStockOnly.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PagedResult<Product>>(`${API_BASE_URL}/products`, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${API_BASE_URL}/products/${id}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products/featured`);
  }
}

