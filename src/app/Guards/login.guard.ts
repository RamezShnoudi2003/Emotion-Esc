import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const isResetRoute = state.url.includes('/reset/');
  let user = localStorage.getItem('user');
  let router = inject(Router);

  if (isResetRoute) {
    return true;
  }

  if (user) {
    router.navigateByUrl('home');
    return false;
  }

  return true;
};
