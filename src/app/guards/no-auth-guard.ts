import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoggedIn) {
    router.navigate(['/recipes']);
    return false;
  }
  return true;
};
