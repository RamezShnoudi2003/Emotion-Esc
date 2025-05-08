import { Injectable } from '@angular/core';
import { SweetAlert2LoaderService } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  confirm(text: string) {
    return Swal.fire({
      text: text,
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      buttonsStyling: true,
      // toast: true,
      background: 'var(--color-primary-light)',
      cancelButtonColor: 'var(--color-danger)',
      confirmButtonColor: 'var(--color-success)',
      icon: 'question',
      iconColor: 'var(--color-primary)',
    });
  }

  success(title: string) {
    Swal.fire({
      position: 'bottom-end',
      icon: 'success',
      title: title,
      showConfirmButton: false,
      timer: 2500,
      allowEscapeKey: false,
      allowOutsideClick: false,
      customClass: {
        popup: 'small-swal-popup',
      },
    });
  }

  error(title: string, message: string = '') {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: title,
      text: message,
      showConfirmButton: true,
      confirmButtonText: 'Ok',
      confirmButtonColor: 'var(--color-primary)',
      allowEscapeKey: false,
      allowOutsideClick: false,
      //   customClass: {
      //     popup: 'small-swal-popup',
      //   },
    });
  }

  confrim(title: string, message: string = '') {
    return Swal.fire({
      position: 'center',
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      iconColor: 'var(--color-secondary)',
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: 'var(--color-danger)',
      allowEscapeKey: false,
      allowOutsideClick: false,
      //   customClass: {
      //     popup: 'small-swal-popup',
      //   },
    });
  }
}
