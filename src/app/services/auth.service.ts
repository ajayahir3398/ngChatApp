import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  avatar?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface JwtPayload {
  nameid: string;  // user id
  unique_name: string;  // username
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(this.getAuthToken());

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load saved auth state from sessionStorage and validate token
    const savedToken = this.getAuthToken();
    const savedUser = sessionStorage.getItem(this.userKey);
    if (savedToken && savedUser && this.isTokenValid(savedToken)) {
      this.tokenSubject.next(savedToken);
      this.currentUserSubject.next(JSON.parse(savedUser));
    } else {
      this.logout(); // Clear invalid token/user
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    sessionStorage.setItem(this.tokenKey, response.token);
    sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.tokenSubject.next(response.token);
  }

  public getCurrentUserId(): string {
    const user = this.currentUserSubject.value;
    return user?.id || '';
  }

  public getAuthToken(): string | null {
    const token = sessionStorage.getItem(this.tokenKey);
    if (token && this.isTokenValid(token)) {
      return token;
    }
    return null;
  }
} 