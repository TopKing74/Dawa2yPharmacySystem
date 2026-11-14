import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthResponse, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'dawa2y_token';
  private userKey = 'dawa2y_user';

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    const savedToken = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem(this.userKey);

    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  register(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    governorate: number;
    address: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }
}

