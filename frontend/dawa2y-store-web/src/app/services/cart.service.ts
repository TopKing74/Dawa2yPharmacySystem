import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Cart, CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private guestSessionKey = 'dawa2y_guest_session';

  cart = signal<Cart>({
    id: '',
    items: [],
    subtotal: 0,
    deliveryFee: 25,
    total: 25
  });

  totalItemsCount = computed(() => {
    return this.cart().items.reduce((sum, item) => sum + item.quantity, 0);
  });

  constructor() {
    this.refreshCart();
  }

  getGuestSessionId(): string {
    let id = localStorage.getItem(this.guestSessionKey);
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(this.guestSessionKey, id);
    }
    return id;
  }

  refreshCart(): void {
    const guestId = this.getGuestSessionId();
    const params = new HttpParams().set('guestSessionId', guestId);

    this.http.get<Cart>(`${API_BASE_URL}/cart`, { params }).subscribe({
      next: (data) => this.cart.set(data),
      error: () => {}
    });
  }

  addToCart(productId: string, quantity = 1): Observable<Cart> {
    const payload = {
      productId,
      quantity,
      guestSessionId: this.getGuestSessionId()
    };

    return this.http.post<Cart>(`${API_BASE_URL}/cart/items`, payload).pipe(
      tap(updatedCart => this.cart.set(updatedCart))
    );
  }

  updateQuantity(cartItemId: string, quantity: number): Observable<Cart> {
    const guestId = this.getGuestSessionId();
    return this.http.put<Cart>(`${API_BASE_URL}/cart/items?guestSessionId=${guestId}`, { cartItemId, quantity }).pipe(
      tap(updatedCart => this.cart.set(updatedCart))
    );
  }

  removeItem(cartItemId: string): Observable<Cart> {
    const guestId = this.getGuestSessionId();
    return this.http.delete<Cart>(`${API_BASE_URL}/cart/items/${cartItemId}?guestSessionId=${guestId}`).pipe(
      tap(updatedCart => this.cart.set(updatedCart))
    );
  }

  clearCart(): Observable<void> {
    const guestId = this.getGuestSessionId();
    return this.http.delete<void>(`${API_BASE_URL}/cart/clear?guestSessionId=${guestId}`).pipe(
      tap(() => {
        this.cart.set({
          id: '',
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          total: 0
        });
      })
    );
  }
}

