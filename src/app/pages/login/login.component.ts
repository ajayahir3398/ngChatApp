import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessagesModule
  ],
  template: `
    <div class="login-container">
      <p-card styleClass="login-card">
        <ng-template pTemplate="header">
          <h2>Login</h2>
        </ng-template>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="flex flex-column gap-3">
          <div class="p-float-label">
            <input 
              pInputText 
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              required
              #usernameInput="ngModel"
              [ngClass]="{'ng-invalid ng-dirty': usernameInput.invalid && usernameInput.touched}">
            <label for="username">Username</label>
          </div>
          <small class="p-error" *ngIf="usernameInput.invalid && usernameInput.touched">
            Username is required
          </small>

          <div class="p-float-label">
            <p-password
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              #passwordInput="ngModel"
              [feedback]="false"
              [toggleMask]="true"
              [ngClass]="{'ng-invalid ng-dirty': passwordInput.invalid && passwordInput.touched}">
            </p-password>
            <label for="password">Password</label>
          </div>
          <small class="p-error" *ngIf="passwordInput.invalid && passwordInput.touched">
            Password is required
          </small>

          <p-messages [(value)]="messages" [enableService]="false"></p-messages>

          <p-button 
            type="submit" 
            [disabled]="loginForm.invalid"
            [loading]="loading"
            styleClass="w-full"
            label="Login">
          </p-button>
        </form>

        <ng-template pTemplate="footer">
          <p class="text-center">
            Don't have an account? <a routerLink="/signup" class="font-medium text-primary">Sign up</a>
          </p>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--surface-ground);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .login-card h2 {
      text-align: center;
      margin: 0;
      padding: 1rem;
      color: var(--text-color);
      font-weight: 600;
    }
    :host ::ng-deep {
      .p-card {
        .p-card-body {
          padding: 2rem;
        }
        .p-card-footer {
          padding-top: 1rem;
        }
      }
      .p-float-label {
        width: 100%;
      }
      .p-inputtext,
      .p-password,
      .p-password-input {
        width: 100%;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  messages: { severity: 'error' | 'success' | 'info' | 'warn', summary?: string, detail: string }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.messages = [];
    
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          this.messages = [
            {
              severity: 'error',
              summary: 'Error',
              detail: err.error || 'Login failed. Please try again.'
            }
          ];
        }
      });
  }
} 