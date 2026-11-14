import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/admin.models';

export const ADMIN_API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'dawa2y_admin_token';
  private readonly userKey = 'dawa2y_admin_user';

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    const savedToken = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem(this.userKey);

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        if (user.role === 'Admin') {
          this.token.set(savedToken);
          this.currentUser.set(user);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.token() && this.currentUser()?.role === 'Admin';
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${ADMIN_API_BASE_URL}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token && res.user.role === 'Admin') {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.token.set(res.token);
          this.currentUser.set(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}

