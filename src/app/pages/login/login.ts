// Angular
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Third-party libraries
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { catchError } from 'rxjs';

// Project alias imports
import { AuthService } from '@services/auth-service';
import { WarningService } from '@services/warning.service';

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
      .login(this.username, this.password)
      .pipe(catchError((err) => this.warningService.handleError(err)))
      .subscribe((session) => {
        this.authService.setSession(session);
        this.warningService.showSuccessWarning('Successfully logged in');
        this.Router.navigate(['/recipes']);
      });
  }
}
