import { Router } from '@angular/router';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { catchError } from 'rxjs';
import { WarningService } from '../../services/warning.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  isSubmitted = false;
  private authService = inject(AuthService);
  private warningService = inject(WarningService);
  private Router = inject(Router);
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  onSubmit() {
    this.isSubmitted = true;
    if (!this.username) {
      this.usernameInput.nativeElement.focus();
      return;
    } else if (!this.password) {
      this.passwordInput.nativeElement.focus();
      return;
    }

    this.authService
      .login('emilys', 'emilyspass')
      .pipe(catchError((err) => this.warningService.handleError(err)))
      .subscribe((session) => {
        this.authService.setSession(session);
        this.warningService.showSuccessWarning('Successfully logged in');
        this.Router.navigate(['/recipes']);
      });
  }
}
