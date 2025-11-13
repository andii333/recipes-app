// Angular
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

// Third-party libraries
import { Button } from 'primeng/button';

// Project alias imports
import { AuthService } from '@services/auth-service';

@Component({
  selector: 'app-recipes',
  imports: [RouterOutlet, Button],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  private router = inject(Router);
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
