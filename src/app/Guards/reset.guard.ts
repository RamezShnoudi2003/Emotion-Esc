import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../Services/API/account.service';
import { map, Observable } from 'rxjs';

export const resetGuard: CanActivateFn = (
  route,
  state
): Observable<boolean> => {
  let accountService = inject(AccountService);

  return accountService.isUserLoggedIn().pipe(
    map((isLoggedIn: boolean) => {
      // If the user is not logged in and the URL includes '/reset/', allow access
      if (state.url.includes('/reset/') && !isLoggedIn) {
        console.log('reset and not logged in ? ', true);
        return true;
      }
      // Otherwise, prevent access
      console.log('reset and not logged in ? ', false);
      return false;
    })
  );
};
