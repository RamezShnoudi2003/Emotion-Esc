import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '../Services/API/account.service';
import { SweetAlertService } from '../Services/sweet-alert.service';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly accountService: AccountService,
    private readonly sweetAlertService: SweetAlertService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // console.log('error interceptor ');

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          this.sweetAlertService.error(error.error.message);
          // switch (error.status) {
          //   case 400:
          //     if (error.error.errors) {
          //       const modelStateErrors = [];
          //       for (const key in error.error.errors) {
          //         if (error.error.error[key]) {
          //           modelStateErrors.push(error.error.error[key]);
          //         }
          //       }
          //       throw modelStateErrors.flat();
          //     } else {
          //       this.sweetAlertService.error(
          //         error.status.toString(),
          //         error.error
          //       );
          //     }
          //     break;
          //   case 401:
          //     this.sweetAlertService.error(
          //       error.error.message
          //       // error.status.toString(),
          //     );
          //     break;
          //   case 403:
          //     this.accountService.logout();
          //     this.sweetAlertService.error(
          //       error.status.toString(),
          //       'Forbidden, User no longer exists'
          //     );
          //     break;
          //   case 404:
          //     this.sweetAlertService.error(
          //       error.status.toString(),
          //       'Not Found'
          //     );
          //     break;
          //   case 500:
          //     // const navigationExtras: NavigationExtras = { state: { error: error.error } }
          //     this.sweetAlertService.error(
          //       error.status.toString(),
          //       'some error occured'
          //     );
          //     // this.router.navigateByUrl('/server-error', navigationExtras);
          //     break;
          //   case 0:
          //     // if case is 0
          //     // lost connection to server
          //     // this.sweetAlertService.alertConnection({});
          //     break;
          //   default:
          //     this.sweetAlertService.error(
          //       'Something unexpected went wrong',
          //       'Check Your Connection'
          //     );
          //     break;
          // }
        }
        throw error;
      })
    );
  }
}
