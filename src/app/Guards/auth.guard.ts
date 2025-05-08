import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const isResetRoute = state.url.includes('/reset/');
  let router = inject(Router);
  let user = localStorage.getItem('user');

  if (isResetRoute) {
    return true; // Explicit reset route allowance
  }

  if (user) {
    return true;
  }
  router.navigate(['/on-boarding']);
  return false;
};
