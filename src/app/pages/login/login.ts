// Angular
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// Third-party libraries
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// Project alias imports
import { AuthService } from '@services/auth-service';
import { WarningService } from '@services/warning.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  // Services
  private readonly authService = inject(AuthService);
  private readonly warningService = inject(WarningService);
  private readonly router = inject(Router);

  // Form reference
  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  // Model
  username = '';
  password = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.controls[key].markAsTouched();
      });

      if (this.loginForm.controls['username']?.invalid) {
        this.usernameInput.nativeElement.focus();
      } else if (this.loginForm.controls['password']?.invalid) {
        this.passwordInput.nativeElement.focus();
      }
      return;
    }

    this.authService
      .login(this.username, this.password)
      .subscribe((session) => {
        this.authService.setSession(session);
        this.warningService.showSuccessWarning('Successfully logged in');
        this.router.navigate(['/recipes']);
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.loginForm) return false;
    const field = this.loginForm.controls[fieldName];
    return !!(field?.invalid && (field?.touched || this.loginForm.submitted));
  }

  getErrorMessage(fieldName: string): string {
    if (!this.loginForm) return '';
    const field = this.loginForm.controls[fieldName];
    if (field?.errors?.['required']) {
      return 'Field cannot be empty';
    }
    return '';
  }
}
