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
  selector: 'app-signup',
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
    <div class="signup-container">
      <p-card styleClass="signup-card">
        <ng-template pTemplate="header">
          <h2>Sign Up</h2>
        </ng-template>

        <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="flex flex-column gap-3">
          <div class="p-float-label">
            <input 
              pInputText 
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              required
              minlength="3"
              #usernameInput="ngModel"
              [ngClass]="{'ng-invalid ng-dirty': usernameInput.invalid && usernameInput.touched}">
            <label for="username">Username</label>
          </div>
          <small class="p-error" *ngIf="usernameInput.invalid && usernameInput.touched">
            <div *ngIf="usernameInput.errors?.['required']">Username is required</div>
            <div *ngIf="usernameInput.errors?.['minlength']">Username must be at least 3 characters</div>
          </small>

          <div class="p-float-label">
            <p-password
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              #passwordInput="ngModel"
              [feedback]="true"
              [toggleMask]="true"
              [ngClass]="{'ng-invalid ng-dirty': passwordInput.invalid && passwordInput.touched}">
            </p-password>
            <label for="password">Password</label>
          </div>
          <small class="p-error" *ngIf="passwordInput.invalid && passwordInput.touched">
            <div *ngIf="passwordInput.errors?.['required']">Password is required</div>
            <div *ngIf="passwordInput.errors?.['minlength']">Password must be at least 6 characters</div>
          </small>

          <div class="p-float-label">
            <input 
              pInputText 
              id="avatar"
              type="text"
              [(ngModel)]="avatar"
              name="avatar"
              #avatarInput="ngModel">
            <label for="avatar">Avatar URL (optional)</label>
          </div>

          <p-messages [(value)]="messages" [enableService]="false"></p-messages>

          <p-button 
            type="submit" 
            [disabled]="signupForm.invalid"
            [loading]="loading"
            styleClass="w-full"
            label="Sign Up">
          </p-button>
        </form>

        <ng-template pTemplate="footer">
          <p class="text-center">
            Already have an account? <a routerLink="/login" class="font-medium text-primary">Login</a>
          </p>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    .signup-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--surface-ground);
    }
    .signup-card {
      width: 100%;
      max-width: 400px;
    }
    .signup-card h2 {
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
      .p-password-panel {
        margin-top: 0.5rem;
      }
    }
  `]
})
export class SignupComponent {
  username = '';
  password = '';
  avatar = '';
  loading = false;
  messages: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.messages = [];
    
    this.authService.register({
      username: this.username,
      password: this.password,
      avatar: this.avatar || undefined
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.messages = [
          {
            severity: 'error',
            summary: 'Error',
            detail: err.error || 'Registration failed. Please try again.'
          }
        ];
      }
    });
  }
} 