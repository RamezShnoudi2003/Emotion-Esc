import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../Services/API/account.service'; // Ensure the path is correct
import { switchMap } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnDestroy {
  constructor(private readonly accountService: AccountService) {}
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.accountService.isUserLoggedIn().pipe(
      switchMap((isLoggedIn) => {
        let modifiedReq = req;

        if (isLoggedIn) {
          let token = localStorage.getItem('token') || '{}';
          token = JSON.parse(token);
          // console.log(token);
          if (token) {
            modifiedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        }

        return next.handle(modifiedReq);
      })
    );
  }
}
